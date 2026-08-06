<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">유해 업소 설정</h1>
    </header>

    <div class="content">
      <p class="section-title">업종별 결제 정책</p>

      <!-- 로딩 중 -->
      <div v-if="isLoading" class="state-box">
        <p>불러오는 중입니다...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="errorMessage">
        <p class="error-text">{{ errorMessage }}</p>
      </div>

      <!-- 정책 목록 -->
      <div v-else>
        <!-- 허용 -->
        <div class="policy-card">
          <p class="policy-label allow">✓ 허용</p>
          <p v-for="item in allowList" :key="item" class="policy-item">{{ item }}</p>
        </div>

        <!-- 주의 -->
        <div class="policy-card">
          <p class="policy-label caution">⚠ 주의</p>
          <p v-for="item in cautionList" :key="item" class="policy-item">{{ item }}</p>
        </div>

        <!-- 차단 -->
        <div class="policy-card">
          <p class="policy-label block">🚫 차단</p>
          <p v-for="item in blockList" :key="item" class="policy-item">{{ item }}</p>
        </div>
      </div>

      <!-- 설정한 업소 목록 조회 -->
      <button class="list-btn" @click="router.push('/parents/place-list')">
        <span>설정한 업소 목록 조회</span>
        <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
      </button>

      <!-- 승인 요청 내역 -->
      <div class="request-section">
        <p class="request-title">승인 요청 내역</p>
        <div v-for="req in pendingRequests" :key="req.id" class="request-card">
          <div class="request-top">
            <span class="request-status" :class="req.status">{{ req.statusLabel }}</span>
            <span class="request-name">{{ req.name }}</span>
            <span class="request-time">{{ req.time }}</span>
          </div>
          <p class="request-desc">{{ req.desc }}</p>
          <div class="request-btns">
            <button class="btn btn-secondary" @click="handleReject(req.id)">거절</button>
            <button class="btn btn-primary" @click="handleAccept(req.id)">승인</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item" type="button" @click="router.push('/parents/home')">
        <img src="@/assets/icons/icon-home.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item nav-item-active" type="button">
        <img src="@/assets/icons/icon-child-alive.svg" alt="" class="nav-icon" />
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
import { useAuthStore } from '@/stores/auth'
import { getCategoryPolicyGroups } from '@/api/categoryPolicy'

const router = useRouter()
const authStore = useAuthStore()

const allowList = ref([])
const cautionList = ref([])
const blockList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const pendingRequests = ref([
  {
    id: 1,
    status: 'block',
    statusLabel: '차단',
    name: 'PC방 , 유흥-성인 업소',
    time: '2분 전',
    desc: '해당 업종 결제 승인 요청',
  },
])

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await getCategoryPolicyGroups(authStore.accessToken)
    if (res.success) {
      res.data.forEach(group => {
        const names = group.categoryPolicyList.map(c => c.merchantCategoryName)
        if (group.policy === 'ALLOW') allowList.value = names
        else if (group.policy === 'CAUTION') cautionList.value = names
        else if (group.policy === 'BLOCK') blockList.value = names
      })
    }
  } catch (error) {
    console.error('카테고리 정책 불러오기 실패:', error)
    errorMessage.value = '정책 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})

async function handleAccept(id) {
  // TODO: API 연동
  // POST /requests/:id/accept
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== id)
}

async function handleReject(id) {
  // TODO: API 연동
  // POST /requests/:id/reject
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== id)
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

/* 정책 카드 */
.policy-card {
  background-color: #f4f5f7;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.policy-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.policy-label.allow { color: #34c759; }
.policy-label.caution { color: #ff9500; }
.policy-label.block { color: #ff3b30; }

.policy-item {
  margin: 0;
  font-size: 14px;
  color: #191b1e;
  padding-left: 8px;
}

.error-text {
  color: #ff3b30;
  font-size: 14px;
}

.state-box {
  padding: 20px 0;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

/* 목록 조회 버튼 */
.list-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-top: 1px solid #f0f1f3;
  border-bottom: 1px solid #f0f1f3;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.chevron-icon { width: 18px; height: 18px; }

/* 승인 요청 내역 */
.request-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
}

.request-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.request-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-status {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
}

.request-status.block {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.request-status.caution {
  background-color: #fff3e0;
  color: #ff9500;
}

.request-name {
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  flex: 1;
}

.request-time {
  font-size: 12px;
  color: #8b9097;
}

.request-desc {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.request-btns {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background-color: #ffffff;
  color: #191b1e;
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

.nav-icon { width: 24px; height: 24px; }

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>