import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { requestFcmToken } from '@/firebase';
import { updateFcmToken } from '@/api/notification';
import { reissue as reissueApi } from '@/api/auth';
import { resetDismissedHints } from '@/composables/useChatbotHintDismissed';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken'));
  const memberId = ref(localStorage.getItem('memberId'));
  const role = ref(localStorage.getItem('role'));
  const name = ref(localStorage.getItem('name'));

  const loginModalVisible = ref(false);
  const loginModalMessage = ref('서비스를 이용하려면 로그인해 주세요.');

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  function setUser(data) {
    sessionExpired = false;
    inflight = null;
    lastRefreshOkAt = Date.now();

    accessToken.value = data.accessToken;
    memberId.value = data.memberId;
    role.value = data.role;
    name.value = data.name;

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('memberId', String(data.memberId));
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);

    closeLoginModal();

    // 로그인 성공 후 FCM 토큰 발급 + 서버 등록 (실패해도 로그인 흐름에는 영향 없음)
    registerFcmToken();
  }

  async function registerFcmToken() {
    try {
      const fcmToken = await requestFcmToken();
      if (!fcmToken) return;
      await updateFcmToken(accessToken.value, fcmToken);
    } catch (e) {
      console.log('FCM 토큰 등록 실패:', e.message);
    }
  }

  // 앱이 켜질 때, 서버에 등록된 FCM 토큰을 현재 기기 토큰으로 맞춘다.
  // 브라우저는 FCM 토큰을 임의로 갱신하는데 로그인 시점에만 보내면, 그 사이 주소가
  // 바뀐 것을 서버가 모른 채 옛 주소로 계속 보낸다. 에러도 나지 않고 알림만 조용히
  // 끊기며, 로그인은 2주간 유지되므로 다시 로그인하기 전까지 복구되지 않는다.
  //
  // 이미 권한을 허용한 사용자만 대상이다. 여기서 권한을 다시 물으면 앱을 열 때마다
  // 팝업이 뜬다. 권한이 없는 사용자는 로그인 시 setUser가 요청한다.
  if (
    isAuthenticated.value &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted'
  ) {
    registerFcmToken();
  }

  function clearUser() {
    inflight = null;
    lastRefreshOkAt = 0;

    accessToken.value = null;
    memberId.value = null;
    role.value = null;
    name.value = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');

    resetDismissedHints();
  }

  function openLoginModal(message = '서비스를 이용하려면 로그인해 주세요.') {
    loginModalMessage.value = message;
    loginModalVisible.value = true;
  }

  function closeLoginModal() {
    loginModalVisible.value = false;
  }

  // 홈에서 4개 요청이 동시에 401을 받으면 재발급도 4번 날아간다.
  // 서버가 refresh를 회전시키므로 두 번째부터는 실패한다. 한 번만 보낸다.
  let inflight = null;
  let sessionExpired = false;
  let lastRefreshOkAt = 0;
  const REFRESH_COALESCE_MS = 5000;

  async function refreshAccessToken() {
    if (sessionExpired) {
      const error = new Error('reissue failed');
      error.status = 401;
      throw error;
    }

    if (inflight) {
      return inflight;
    }

    if (
      accessToken.value
      && lastRefreshOkAt
      && Date.now() - lastRefreshOkAt < REFRESH_COALESCE_MS
    ) {
      return accessToken.value;
    }

    inflight = reissueApi()
      .then((r) => {
        const token = r?.data?.accessToken;
        if (!token) throw new Error('reissue failed');
        accessToken.value = token;
        localStorage.setItem('accessToken', token);
        lastRefreshOkAt = Date.now();
        return token;
      })
      .catch((error) => {
        if (error?.status === 401) {
          sessionExpired = true;
        }
        throw error;
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  }

  async function handleUnauthorized(
    message = '로그인이 만료되었습니다.\n다시 로그인해 주세요.',
  ) {
    try {
      await refreshAccessToken();
    } catch (error) {
      if (error?.status === 401 || sessionExpired) {
        clearUser();
        openLoginModal(message);
      }
    }
  }

  return {
    accessToken,
    memberId,
    role,
    name,
    loginModalVisible,
    loginModalMessage,
    isAuthenticated,
    setUser,
    clearUser,
    openLoginModal,
    closeLoginModal,
    refreshAccessToken,
    handleUnauthorized,
  };
});
