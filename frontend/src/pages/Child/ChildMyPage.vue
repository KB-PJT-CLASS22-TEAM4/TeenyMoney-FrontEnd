<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BottomTabBar from '@/components/Child/BottomTabBar.vue';
import { getMyInfo } from '@/api/member';
import { useAuthStore } from '@/stores/auth';
import { logout as logoutApi } from '@/api/auth';
import ConfirmModal from '@/components/ConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();

// 자녀 정보 API
const user = ref({
  name: '',
  birth: '',
  phone: '',
  email: '',
});

const parent = ref({ name: '', status: '' });

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
});

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

//=======연동 해제=========
const showUnlinkModal = ref(false)

function unlink() {
  showUnlinkModal.value = true
}

function cancelUnlink() {
  showUnlinkModal.value = false
}

// API 호출 후 연동 해제 처리
async function confirmUnlink() {
  showUnlinkModal.value = false   

  try {
    // TODO: [API] 자녀 연동 해제 API
    console.log('연동 해제 요청 (API 자리)')
  } catch (error) {
    console.error('연동 해제 실패:', error)
  } finally {
    router.push({ name: 'child-link' })
  }
}

// =========하단 탭==========
function onTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' });
  if (key === 'report') router.push({ name: 'child-report' });
  if (key === 'my') router.push({ name: 'child-mypage' });
  if (key === 'q') router.push({ name: 'qr-scan' });     
  // 금융상품은 페이지 만들면 추가
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
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <h1 class="page-title">마이페이지</h1>

      <!-- 프로필 -->
      <section class="profile">
        <div class="avatar">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
            <circle cx="16" cy="12" r="5" stroke="#b9bec5" stroke-width="2.2"/>
            <path d="M6 27c0-5 4.5-8 10-8s10 3 10 8" stroke="#b9bec5" stroke-width="2.2"/>
          </svg>
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
        <p class="field-value">{{ user.phone }}</p>
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
        <div class="parent-row">
          <div class="parent-avatar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <circle cx="12" cy="9" r="3.5" stroke="#b9bec5" stroke-width="1.8"/>
              <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#b9bec5" stroke-width="1.8"/>
            </svg>
          </div>
          <div class="parent-text">
            <b class="parent-name">{{ parent.name }}</b>
            <span class="parent-status">{{ parent.status }}</span>
          </div>
        </div>
        <!-- 부모님 추가 -->
        <div class="add-parent" @click="addParent">
          <span class="plus">+</span>
          <span class="add-text">부모님 추가 · 연동 코드 입력</span>
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
    <div class="menu-row" @click="unlink">      
      <span class="menu-title">연동 해제</span>
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

    <!-- 연동 해제 확인 모달 -->
    <ConfirmModal
      :show="showUnlinkModal"
      title="연동을 해제할까요?"
      description="연동을 해제하면 부모님과의 연결이 끊어져요"
      confirm-text="해제"
      cancel-text="취소"
      @confirm="confirmUnlink"
      @cancel="cancelUnlink"
    />
  </div>
</template>

<style scoped>
.mypage-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
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

.page-title {
  margin: 0 0 20px;
  font-weight: 700;
  font-size: 19px;
  color: #191b1e;
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

/* 메뉴 행 (화살표 있는 항목) */
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