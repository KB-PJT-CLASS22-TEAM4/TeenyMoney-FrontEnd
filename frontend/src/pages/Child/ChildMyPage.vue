<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BottomTabBar from '@/components/Child/BottomTabBar.vue';
import ChildNavActions from '@/components/Child/ChildNavActions.vue';
import { getMyInfo, getLinkedParent, updateMyProfileImage } from '@/api/member';
import { useAuthStore } from '@/stores/auth';
import { logout as logoutApi } from '@/api/auth';
import { getNotificationSetting, updateNotificationSetting } from '@/api/notification';
import ConfirmModal from '@/components/ConfirmModal.vue';
import {
  CHILD_PROFILE_IMAGE,
  PARENT_PROFILE_IMAGE,
} from '@/utils/profileImages';

const router = useRouter();
const authStore = useAuthStore();

const profileFileInput = ref(null);
const isUploadingProfile = ref(false);

// 자녀 정보 API
const user = ref({
  name: '',
  birth: '',
  phone: '',
  email: '',
  profileImageUrl: '',
});

// 전화번호에 하이픈을 붙여 보여주기 위한 포맷터 (숫자만 남긴 뒤 자리수에 맞춰 하이픈 삽입)
function formatPhoneNumber(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');

  if (digits.startsWith('02')) {
    // 서울 지역번호(02): 02-XXX(X)-XXXX
    if (digits.length === 9) return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    return raw;
  }

  if (digits.length === 11) {
    // 휴대전화(010 등): XXX-XXXX-XXXX
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (digits.length === 10) {
    // 그 외 지역번호 등: XXX-XXX-XXXX
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return raw;
}

const formattedPhone = computed(() => formatPhoneNumber(user.value.phone));

// 연동된 부모 (미연동이면 null)
const parent = ref(null);

// ==== 알림 수신 설정 ====
const notificationSettings = reactive({
  notificationFinance: true,
  notificationPayment: true,
  notificationQuest: true,
});
const notificationSettingLoading = ref(true);
const notificationSavingKey = ref('');

async function loadNotificationSetting() {
  notificationSettingLoading.value = true;
  try {
    const res = await getNotificationSetting(authStore.accessToken);
    const d = res.data || {};
    notificationSettings.notificationFinance = d.notificationFinance ?? true;
    notificationSettings.notificationPayment = d.notificationPayment ?? true;
    notificationSettings.notificationQuest = d.notificationQuest ?? true;
  } catch (e) {
    console.log('알림 설정 조회 실패:', e.message);
  } finally {
    notificationSettingLoading.value = false;
  }
}

async function onToggleNotification(key, value) {
  const prevValue = notificationSettings[key];
  notificationSettings[key] = value;
  notificationSavingKey.value = key;

  try {
    await updateNotificationSetting(authStore.accessToken, {
      notificationFinance: notificationSettings.notificationFinance,
      notificationPayment: notificationSettings.notificationPayment,
      notificationQuest: notificationSettings.notificationQuest,
    });
  } catch (e) {
    console.log('알림 설정 변경 실패:', e.message);
    notificationSettings[key] = prevValue;
  } finally {
    notificationSavingKey.value = '';
  }
}

// 결제 비밀번호 설정 여부
const isPasswordSet = ref(false);

onMounted(async () => {
  try {
    const data = await getMyInfo(authStore.accessToken);   // 토큰 넘김
    user.value = {
      name: data.name,          // data.name 
      birth: data.birthDate,
      phone: data.phoneNumber,
      email: data.email,
      profileImageUrl: data.profileImageUrl || '',
    };
    // 결제 비밀번호가 등록되어 있는지 체크
    isPasswordSet.value = data.paymentPassword != null || data.hasPaymentPassword === true;
  } catch (e) {                 // try/catch로 실패 처리
    console.log('회원정보 조회 실패:', e.message);
  }

  try {
    const result = await getLinkedParent(authStore.accessToken);
    // 미연동이면 data가 null인 게 정상 응답
    parent.value = result.data
      ? { name: result.data.name, parentId: result.data.parentId, profileImageUrl: result.data.profileImageUrl }
      : null;
  } catch (e) {
    console.log('연동된 부모 조회 실패:', e.message);
  }

  loadNotificationSetting();
});

function openProfilePicker() {
  if (isUploadingProfile.value) return;
  profileFileInput.value?.click();
}

async function onProfileFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 선택할 수 있어요.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('프로필 사진은 5MB 이하만 업로드할 수 있어요.');
    return;
  }

  isUploadingProfile.value = true;
  try {
    const res = await updateMyProfileImage(authStore.accessToken, file);
    if (res?.profileImageUrl) {
      user.value.profileImageUrl = res.profileImageUrl;
    } else {
      const refreshed = await getMyInfo(authStore.accessToken);
      if (refreshed?.profileImageUrl) {
        user.value.profileImageUrl = refreshed.profileImageUrl;
      }
    }
  } catch (e) {
    console.error('프로필 이미지 변경 실패:', e);
    alert(e.message || '프로필 이미지를 변경하지 못했습니다.');
  } finally {
    isUploadingProfile.value = false;
    if (event.target) event.target.value = '';
  }
}

function goBack() {
  router.back();
}

function editContact() {
  // 연락처 수정
}
function editEmail() {
  // 이메일 수정
}

function goPasswordSetting() {
  if (isPasswordSet.value) return;
  // 결제 비밀번호 설정
  router.push({ name: 'child-password-setting' });
}

function addParent() {
  // 부모님 추가 
router.push({ name: 'child-link' });
}

//========고객 지원===========
function goFaq() {
  router.push({ name: 'child-faq' })
}
function goPolicy() {
  router.push({ name: 'child-terms' })
}

//=========로그아웃=============
const showLogoutModal = ref(false)

function logout() {
  showLogoutModal.value = true
}

function cancelLogout() {
  showLogoutModal.value = false
}

// API 호출 후 로그아웃 처리
async function confirmLogout() {
  showLogoutModal.value = false

  try {
    await logoutApi(authStore.accessToken)
  } catch (error) {
    console.error('로그아웃 요청 실패:', error)
  } finally {
    authStore.clearUser()
    router.replace('/login')
  }
}

// =========하단 탭==========
function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' });
  if (key === 'my') router.push({ name: 'child-mypage' });
  if (key === 'q') router.push({ name: 'qr-scan' });
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' }) 
  if (key === 'quest') router.push({ name: 'child-quest-list' })           
}

// 스크롤 바
const isScrolling = ref(false);
let scrollTimer = null;
function onScroll() {
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;  
  }, 800);
}
</script>


<template>
  <div class="page">
    <header class="nav">
      <img
        src="@/assets/icons/icon-back.svg"
        alt=""
        class="back-icon"
        @click="goBack"
      />

      <h1 class="nav-title">마이페이지</h1>

      <ChildNavActions />
    </header>

    <main class="content">
      <section class="profile-card">
        <button
          type="button"
          class="profile-image-wrapper"
          :disabled="isUploadingProfile"
          aria-label="프로필 사진 변경"
          @click="openProfilePicker"
        >
          <img
            :src="user.profileImageUrl || CHILD_PROFILE_IMAGE"
            alt="프로필 이미지"
            class="profile-image"
            :class="{ photo: !!user.profileImageUrl }"
          />
          <span class="profile-edit-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path
                d="M4 8.5h2.2l1.1-2.2h9.4L18 8.5H20a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"
                stroke="#191b1e"
                stroke-width="1.6"
              />
              <circle cx="12" cy="14" r="3.2" stroke="#191b1e" stroke-width="1.6"/>
            </svg>
          </span>
        </button>
        <input
          ref="profileFileInput"
          class="profile-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="onProfileFileChange"
        />

        <div class="profile-text">
          <span class="role-badge">자녀</span>
          <strong class="member-name">
            {{ user.name || '-' }}
          </strong>
          <span class="member-birth">
            {{ user.birth || '-' }}
          </span>
        </div>
      </section>

      <section class="info-card">
        <div class="info-item">
          <span class="info-label">연락처</span>
          <p class="info-value">
            {{ formattedPhone || '-' }}
          </p>
        </div>

        <div class="info-divider"></div>

        <div class="info-item">
          <span class="info-label">이메일</span>
          <p class="info-value">
            {{ user.email || '-' }}
          </p>
        </div>
      </section>

      <section class="menu-card">
        <button
          type="button"
          class="menu-button"
          :class="{ 'is-locked': isPasswordSet }"
          @click="goPasswordSetting"
        >
          <span class="menu-label">결제 비밀번호</span>
          <span
            class="status-pill"
            :class="isPasswordSet ? 'on' : 'off'"
          >
            {{ isPasswordSet ? '등록됨' : '미등록' }}
          </span>
        </button>
      </section>

      <section class="section-block">
        <h2 class="section-title">연결된 부모님</h2>

        <div class="section-card">
          <div v-if="parent" class="parent-item">
            <div class="parent-info">
              <img
                :src="parent.profileImageUrl || PARENT_PROFILE_IMAGE"
                alt=""
                class="parent-icon"
                :class="{ photo: !!parent.profileImageUrl }"
              />
              <div class="parent-text">
                <strong class="parent-name">{{ parent.name }}</strong>
                <span class="parent-status">연동됨</span>
              </div>
            </div>
          </div>

          <p
            v-else
            class="empty-message"
          >
            아직 연동된 부모님이 없어요
          </p>

          <button
            type="button"
            class="add-parent-btn"
            @click="addParent"
          >
            + 부모님 추가 · 연동 코드 입력
          </button>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-title">알림 설정</h2>

        <div class="menu-card">
          <div class="toggle-row menu-border">
            <span class="menu-label">금융상품 알림</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="notificationSettings.notificationFinance"
                :disabled="notificationSettingLoading || notificationSavingKey === 'notificationFinance'"
                @change="onToggleNotification('notificationFinance', $event.target.checked)"
              >
              <span class="slider"></span>
            </label>
          </div>

          <div class="toggle-row menu-border">
            <span class="menu-label">결제 알림</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="notificationSettings.notificationPayment"
                :disabled="notificationSettingLoading || notificationSavingKey === 'notificationPayment'"
                @change="onToggleNotification('notificationPayment', $event.target.checked)"
              >
              <span class="slider"></span>
            </label>
          </div>

          <div class="toggle-row">
            <span class="menu-label">퀘스트 알림</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="notificationSettings.notificationQuest"
                :disabled="notificationSettingLoading || notificationSavingKey === 'notificationQuest'"
                @change="onToggleNotification('notificationQuest', $event.target.checked)"
              >
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-title">고객지원</h2>

        <div class="menu-card">
          <button
            type="button"
            class="menu-button menu-border"
            @click="goFaq"
          >
            <span class="menu-label">FAQ</span>
            <img
              src="@/assets/icons/icon-chevron.svg"
              alt=""
              class="chevron-icon"
            />
          </button>

          <button
            type="button"
            class="menu-button"
            @click="goPolicy"
          >
            <span class="menu-label">약관 및 정책</span>
            <img
              src="@/assets/icons/icon-chevron.svg"
              alt=""
              class="chevron-icon"
            />
          </button>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-title">계정관리</h2>

        <div class="menu-card">
          <button
            type="button"
            class="menu-button"
            @click="logout"
          >
            <span class="menu-label">로그아웃</span>
          </button>
        </div>
      </section>
    </main>

    <BottomTabBar active="my" @select="onTabSelect" />

    <ConfirmModal
      :show="showLogoutModal"
      title="로그아웃할까요?"
      confirm-text="로그아웃"
      description="로그아웃 하시겠습니까?"
      cancel-text="취소"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: 88px;
  color: #191b1e;
  background: #f8fafc;
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #eceef1;
}

.back-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.profile-image-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  padding: 3px;
  border: none;
  border-radius: 50%;
  background: #ffbc00;
  cursor: pointer;
}

.profile-image-wrapper:disabled {
  cursor: default;
  opacity: 0.7;
}

.profile-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: contain;
  background-color: #ffffff;
}

.profile-image.photo {
  object-fit: cover;
}

.profile-edit-badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #ffbc00;
}

.profile-file-input {
  display: none;
}

.profile-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.role-badge {
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 11px;
  font-weight: 700;
}

.member-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 20px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-birth {
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
}

.info-card,
.menu-card,
.section-card {
  overflow: hidden;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.info-card {
  padding: 4px 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.info-label {
  flex-shrink: 0;
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.info-value {
  margin: 0;
  min-width: 0;
  color: #191b1e;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-align: right;
  overflow-wrap: anywhere;
}

.info-divider {
  height: 1px;
  background: #e8eaee;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0 0 0 4px;
  color: #8b9097;
  font-size: 13px;
  font-weight: 700;
}

.menu-button,
.payment-password-row,
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 54px;
  padding: 0 16px;
  border: none;
  color: #191b1e;
  background-color: transparent;
  text-align: left;
}

.menu-button {
  cursor: pointer;
}

.menu-button:active {
  background-color: #fafafa;
}

.menu-button.is-locked {
  cursor: default;
}

.menu-label {
  font-size: 15px;
  font-weight: 700;
}

.menu-border {
  border-bottom: 1px solid #e8eaee;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.on {
  background: #ffbc00;
  color: #191b1e;
}

.status-pill.off {
  border: 1px solid #e8eaee;
  background: #ffffff;
  color: #8b9097;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.parent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 10px 14px;
}

.parent-info {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.parent-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #e8eaee;
  border-radius: 50%;
  object-fit: contain;
  background-color: #ffffff;
}

.parent-icon.photo {
  object-fit: cover;
}

.parent-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.parent-name {
  overflow: hidden;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-status {
  color: #ffbc00;
  font-size: 12px;
  font-weight: 700;
}

.empty-message {
  margin: 0;
  padding: 20px 16px 8px;
  color: #b9bec5;
  font-size: 13px;
  text-align: center;
}

.add-parent-btn {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-top: 1px solid #e8eaee;
  background: transparent;
  color: #8b9097;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 25px;
  flex: none;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #e7e9ec;
  border-radius: 25px;
  transition: .3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 3px;
  bottom: 3px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  transition: .3s;
}

input:checked + .slider {
  background: #ffbc00;
}

input:checked + .slider:before {
  transform: translateX(17px);
}

input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
