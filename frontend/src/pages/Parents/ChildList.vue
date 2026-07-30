<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" @click="router.back()" />
      <h1 class="nav-title">자녀 목록</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>
    <p class="subtitle">연결된 자녀 {{ children.length }}명</p>

    <div class="content">
      <!-- 자녀 목록 -->
      <!-- TODO: API 연동 후 하드코딩 제거 -->
      <!-- GET /children → children 배열로 교체 -->
      <div v-if="children.length > 0">
        <div v-for="child in children" :key="child.id" class="child-card">
          <div class="child-info">
            <img src="@/assets/icons/child-profile.svg" alt="" class="child-avatar" />
            <div>
              <p class="child-name">{{ child.name }}</p>
              <p class="child-email">{{ child.email }}</p>
            </div>
          </div>
          <div class="child-stats">
            <div class="stat">
              <img src="@/assets/icons/icon-wallet.svg" alt="" class="stat-icon" />
              <span>{{ child.balance.toLocaleString() }}원</span>
            </div>
            <div class="stat">
              <img src="@/assets/icons/icon-point.svg" alt="" class="stat-icon" />
              <span>{{ child.points.toLocaleString() }}점</span>
            </div>
          </div>
          <!-- 추후에 상세 관리에 @click 이벤트 추가 -->
          <div class="child-btns">
            <button class="btn btn-primary">상세 관리</button> 
            <button class="btn btn-secondary">연동 해제</button>
          </div>
        </div>
      </div>

      <!-- 자녀 없을 때 -->
      <div v-else class="empty">
        <p class="empty-text">자녀 목록이 없습니다</p>
      </div>

      <!-- 연동 코드 생성 카드 -->
      <div class="link-card">
        <div class="link-card-header">
          <img src="@/assets/icons/icon-link.svg" alt="" class="link-icon" />
          <div>
            <p class="link-title">자녀 연동 일회용 코드 생성</p>
            <p class="link-desc">새로운 자녀를 연동해 보세요.<br />코드는 자녀 기기에 입력 가능하며<br />10분 동안만 유효합니다.</p>
          </div>
        </div>
        <button class="link-btn" @click="goToLinkCode">
          <span class="plus">+</span> 연동 코드 생성
        </button>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item" type="button" @click="router.push('/parents/home')">
        <img src="@/assets/icons/icon-home.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item nav-item-active" type="button">
        <img src="@/assets/icons/icon-child.svg" alt="" class="nav-icon" />
        <span class="nav-label">자녀관리</span>
      </button>
      <button class="nav-item" type="button" @click="router.push('/parents/mypage')">
        <img src="@/assets/icons/icon-mypage.svg" alt="" class="nav-icon" />
        <span class="nav-label">마이페이지</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()  

// TODO: API 연동 후 하드코딩 제거
// GET /children → children.value 로 교체
const children = ref([
  { id: 1, name: '김첫째', email: 'teeny@example.com', balance: 18300, points: 850 },
  { id: 2, name: '김첫째', email: 'teeny@example.com', balance: 18300, points: 850 },
])

// onMounted(async () => {
//   try {
//     const res = await api.get('/children')
//     children.value = res.data
//   } catch (error) {
//     console.error('자녀 목록 불러오기 실패', error)
//   }
// })


function goToLinkCode() {
    router.push('/parents/linkcode')
}

// 특정 자녀 선택 시 자녀 상세 화면 이동 
//function goToDetail(id) {
//  router.push(`/parents/children/${id}`)
//}

async function unlinkChild(id) {
  // TODO: API 연동
  // DELETE /children/:id
  // await api.delete(`/children/${id}`)
  // children.value = children.value.filter(c => c.id !== id)
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 4px;
}

.nav-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
}

.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.alarm-icon {
  width: 24px;
  height: 24px;
}

.subtitle {
  margin: 0 0 16px;
  padding: 0 20px;
  font-size: 13px;
  color: #8b9097;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

/* 자녀 카드 */
.child-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.child-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.child-avatar {
  width: 36px;
  height: 36px;
}

.child-name {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.child-email {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.child-stats {
  display: flex;
  gap: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f4f5f7;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.child-btns {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #f4f5f7;
  color: #191b1e;
}

/* 빈 상태 */
.empty {
  padding: 60px 0;
  text-align: center;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: #b9bec5;
}

/* 연동 코드 카드 */
.link-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.link-card-header {
  display: flex;
  gap: 10px;
}

.link-icon {
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.link-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.link-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  line-height: 1.6;
}

.link-btn {
  width: 100%;
  height: 44px;
  border: 1.5px dashed #d0d3d8;
  border-radius: 10px;
  background-color: #f4f5f7;
  font-size: 14px;
  font-weight: 600;
  color: #8b9097;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.plus {
  font-size: 18px;
  color: #8b9097;
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>