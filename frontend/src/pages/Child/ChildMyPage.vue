<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BottomTabBar from '@/components/Child/BottomTabBar.vue';
import ChildNavActions from '@/components/Child/ChildNavActions.vue';
import { getMyInfo, getLinkedParent } from '@/api/member';
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

// 자녀 정보 API
const user = ref({
  name: '',
  birth: '',
  phone: '',
  email: '',
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

onMounted(async () => {
  try {
    const data = await getMyInfo(authStore.accessToken);   // 토큰 넘김
    user.value = {
      name: data.name,          // data.name 
      birth: data.birthDate,
      phone: data.phoneNumber,
      email: data.email,
    };
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
  // 결제 비밀번호 설정
  router.push({ name: 'child-password-setting' });
}

function addParent() {
  // 부모님 추가 
router.push({ name: 'child-link' });
}

//========고객 지원===========
function goFaq() {
  // 자주 묻는 질문 
}
function goContact() {
  // 문의하기 
}
function goPolicy() {
  // 약관 및 정책
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
  <div class="mypage-screen">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로가기" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">마이페이지</h1>
      <ChildNavActions />
    </header>

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">

      <!-- 프로필 -->
      <section class="profile">
        <div class="avatar">
          <img :src="CHILD_PROFILE_IMAGE" alt="" class="avatar-img" />
        </div>
        <div class="profile-text">
          <p class="profile-name">{{ user.name }}</p>
          <p class="profile-birth">{{ user.birth }}</p>
        </div>
      </section>

      <!-- 연락처 -->
      <div class="field">
        <div class="field-head">
          <span class="field-label">연락처</span>
          <button class="edit-btn" @click="editContact">수정</button>
        </div>
        <p class="field-value">{{ formattedPhone }}</p>
      </div>

      <!-- 이메일 -->
      <div class="field">
        <div class="field-head">
          <span class="field-label">이메일</span>
          <button class="edit-btn" @click="editEmail">수정</button>
        </div>
        <p class="field-value">{{ user.email }}</p>
      </div>

      <hr class="divider" />

      <!-- 결제 비밀번호 설정 -->
      <div class="menu-row" @click="goPasswordSetting">
        <span class="menu-title">결제 비밀번호 설정</span>
        <span class="chev">›</span>
      </div>

      <!-- 연결된 부모님 -->
      <section class="parents">
        <p class="section-label">연결된 부모님</p>

        <div v-if="parent" class="parent-row">
          <div class="parent-avatar">
            <img :src="PARENT_PROFILE_IMAGE" alt="" class="parent-avatar-img">
          </div>
          <div class="parent-text">
            <b class="parent-name">{{ parent.name }}</b>
            <span class="parent-status">연동됨</span>
          </div>
        </div>

        <p v-else class="no-parent-text">아직 연동된 부모님이 없어요</p>

        <!-- 부모님 추가 -->
        <div class="add-parent" @click="addParent">
          <span class="plus">+</span>
          <span class="add-text">부모님 추가 · 연동 코드 입력</span>
        </div>
      </section>

      <!-- 알림 설정 -->
      <section class="menu-group">
        <p class="section-label">알림 설정</p>

        <div class="toggle-row">
          <span class="menu-title">금융상품 알림</span>
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

        <div class="toggle-row">
          <span class="menu-title">결제 알림</span>
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
          <span class="menu-title">퀘스트 알림</span>
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
      </section>

      <!-- 고객지원 -->
      <section class="menu-group">
        <p class="section-label">고객지원</p>
        <div class="menu-row" @click="goFaq">
          <span class="menu-title">자주 묻는 질문</span>
          <span class="chev">›</span>
        </div>
        <div class="menu-row" @click="goContact">
          <span class="menu-title">문의하기</span>
          <span class="chev">›</span>
        </div>
        <div class="menu-row" @click="goPolicy">
          <span class="menu-title">약관 및 정책</span>
          <span class="chev">›</span>
        </div>
      </section>

    <!-- 계정관리 -->
    <section class="menu-group">
      <p class="section-label">계정관리</p>
      <div class="menu-row" @click="logout">
        <span class="menu-title">로그아웃</span>
        <span class="chev">›</span>
      </div>
    </section>
    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="my" @select="onTabSelect" />

    <!-- 로그아웃 확인 모달 -->
    <ConfirmModal
      :show="showLogoutModal"
      title="로그아웃할까요?"
      confirm-text="로그아웃"
      description="더 이상 티니머니를 이용할 수 없습니다"
      cancel-text="취소"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />

  </div>
</template>

<style scoped>
.mypage-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  overflow: hidden;
}

.nav {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 64px;
  padding: 0 20px 4px;
  background: #ffffff;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: #191b1e;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 20px;
}

.scroll::-webkit-scrollbar {
  width: 3px;
}

.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}

.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

/* 프로필 */
.profile {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 26px;
}

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 76px;
  height: 76px;
  background: #f2f4f6;
  border-radius: 50%;
  flex: none;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.profile-name {
  margin: 0;
  font-weight: 800;
  font-size: 21px;
  color: #191b1e;
}

.profile-birth {
  margin: 6px 0 0;
  font-weight: 600;
  font-size: 13px;
  color: #b9bec5;
}

/* 연락처/이메일 필드 */
.field {
  margin-bottom: 20px;
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-weight: 600;
  font-size: 13px;
  color: #8b9097;
}

.edit-btn {
  padding: 5px 12px;
  border: 1px solid #e7e9ec;
  border-radius: 7px;
  background: #fff;
  font-weight: 600;
  font-size: 11.5px;
  color: #4a4e55;
  cursor: pointer;
}

.field-value {
  margin: 8px 0 0;
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
}

.divider {
  border: none;
  border-top: 1px solid #f0f1f3;
  margin: 8px 0 20px;
}

/* 메뉴 행 */
.menu-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  cursor: pointer;
}

.menu-title {
  font-weight: 700;
  font-size: 15px;
  color: #191b1e;
}

.chev {
  font-size: 20px;
  color: #c5cad0;
}

/* 알림 설정 토글 행 (menu-row와 동일 레이아웃, chevron 대신 스위치) */
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 25px;
  flex: none;
}
.switch input { opacity: 0; width: 0; height: 0; }
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
  height: 19px; width: 19px;
  left: 3px; bottom: 3px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  border-radius: 50%;
  transition: .3s;
}
input:checked + .slider { background: #ffbc00; }
input:checked + .slider:before { transform: translateX(17px); }
input:disabled + .slider { opacity: 0.6; cursor: not-allowed; }

/* 섹션 라벨 */
.section-label {
  margin: 14px 0 10px;
  font-weight: 600;
  font-size: 12.5px;
  color: #b9bec5;
}

/* 연결된 부모님 */
.parent-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 12px;
  border-bottom: 1px solid #f4f5f7;
}

.parent-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  background: #f2f4f6;
  border-radius: 50%;
  flex: none;
  overflow: hidden;
}

.parent-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.parent-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.parent-name {
  font-weight: 700;
  font-size: 15px;
  color: #191b1e;
}

.parent-status {
  font-weight: 700;
  font-size: 12px;
  color: #ffbc00;
}

.no-parent-text {
  margin: 4px 0 12px;
  font-weight: 500;
  font-size: 13px;
  color: #b9bec5;
}

/* 부모님 추가 */
.add-parent {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  cursor: pointer;
}

.plus {
  font-size: 20px;
  color: #8b9097;
  padding-left: 8px;
}

.add-text {
  font-weight: 600;
  font-size: 14.5px;
  color: #8b9097;
}

.menu-group {
  margin-top: 8px;
}

/* 하단 탭바 고정 */
.mypage-screen :deep(.tabbar) {
  margin-top: auto;
}
</style>