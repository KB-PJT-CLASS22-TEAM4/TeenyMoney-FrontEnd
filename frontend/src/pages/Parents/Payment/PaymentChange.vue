<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">결제 수단 변경</h1>
    </header>

    <div class="content">
      <!-- 현재 결제 수단 -->
      <div class="section">
        <p class="section-label">현재 결제 수단</p>
        <div class="current-card">
          <img src="@/assets/logo.svg" alt="" class="card-icon" />
          <div class="card-info">
            <p class="card-name">{{ currentPayment.name }}</p>
            <p class="card-number">{{ currentPayment.number }}</p>
          </div>
          <span class="using-badge">사용중</span>
        </div>
      </div>

      <!-- 결제 수단 선택 -->
      <div class="section">
        <p class="section-label">결제 수단 선택</p>
        <div class="payment-list">
          <div
            v-for="payment in paymentMethods"
            :key="payment.id"
            class="payment-item"
            @click="selectedId = payment.id"
          >
            <img src="@/assets/logo.svg" alt="" class="card-icon" />
            <div class="card-info">
              <p class="card-name">{{ payment.name }}</p>
              <p class="card-number">{{ payment.number }}</p>
            </div>
            <div class="radio" :class="{ active: selectedId === payment.id }">
              <div v-if="selectedId === payment.id" class="radio-dot"></div>
            </div>
          </div>
        </div>

        <!-- 새로운 결제 수단 추가 -->
        <button class="add-btn" @click="handleAddPayment">
          <span class="add-icon">+</span>
          <span class="add-text">새로운 결제 수단 추가</span>
        </button>
      </div>
    </div>

    <!-- 변경하기 버튼 -->
    <div class="footer">
      <button
        class="submit-btn"
        :disabled="!selectedId || selectedId === currentPayment.id"
        @click="handleChange"
      >
        변경하기
      </button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// TODO: API 연동 후 하드코딩 제거
// GET /api/v1/payment-methods → 결제 수단 목록
const currentPayment = ref({
  id: 1,
  name: '신한은행',
  number: '123-456-7890',
})

const paymentMethods = ref([
  { id: 1, name: '신한은행', number: '123-456-7890' },
  { id: 2, name: '현대카드', number: '5567-****-****-0210' },
  { id: 3, name: '카카오뱅크', number: '3333-01-987654' },
])

const selectedId = ref(1)

function handleAddPayment() {
  // TODO: 결제 수단 추가 페이지로 이동
  // router.push('/parents/payment/add')
  alert('결제 수단 추가 기능은 준비 중이에요!')
}

async function handleChange() {
  if (!selectedId.value) return

  // TODO: API 연동
  // PATCH /api/v1/payment-methods/default
  // body: { paymentMethodId: selectedId.value }

  const selected = paymentMethods.value.find(p => p.id === selectedId.value)
  router.push({
    path: '/parents/payment/change-complete',
    query: {
      name: selected?.name,
      number: selected?.number,
    },
  })
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding-bottom: 140px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  background-color: #ffffff;
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
  gap: 20px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8b9097;
  font-weight: 600;
}

/* 현재 결제 수단 */
.current-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
}

.card-icon {
  width: 36px;
  height: 36px;
  background-color: #f4f5f7;
  border-radius: 8px;
  padding: 6px;
}

.card-info {
  flex: 1;
}

.card-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.card-number {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.using-badge {
  padding: 6px 14px;
  background-color: #ffbc00;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
}

/* 결제 수단 목록 */
.payment-list {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f1f3;
  cursor: pointer;
}

.payment-item:last-child {
  border-bottom: none;
}

/* 라디오 버튼 */
.radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #e0e2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio.active {
  border-color: #ffbc00;
}

.radio-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ffbc00;
}

/* 추가 버튼 */
.add-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background-color: #ffffff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.add-icon {
  font-size: 20px;
  color: #8b9097;
}

.add-text {
  font-size: 14px;
  font-weight: 600;
  color: #8b9097;
}

/* 하단 버튼 */
.footer {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  padding: 10px 16px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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