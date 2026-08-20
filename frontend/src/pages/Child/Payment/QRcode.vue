<template>
  <div class="qr-code-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <h1 class="nav-title">QR 결제</h1>
      <ChildNavActions />
    </div>

    <!-- QR 카드 -->
    <div class="card qr-card">
      <div class="qr-top">
        <div class="exp">
          <span class="exp-text">{{ formattedTime }} 후 만료</span>
        </div>

       <button class="refresh-btn" @click="refreshQr">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v3.5h-3.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>재발급</span>
        </button>
      </div>

      <!-- QR 코드 -->
      <div class="qr-box" :class="{ expired: isExpired }">
        <QrcodeVue :value="qrValue" :size="180" level="M" />
      </div>

      <p class="qr-desc">매장 직원에게 이 QR 코드를 보여주세요<br />결제가 완료되면 자동으로 이동해요</p>
    </div>

    <!-- 잔액 카드 -->
    <div class="card balance-card">
      <div class="balance-left">
        <div class="balance-row">
          <span class="balance-label">사용 가능 금액</span>
        <button class="eye-btn" @click="showBalance = !showBalance" aria-label="잔액 표시">
            <!-- 보이는 상태-->
            <svg v-if="showBalance" viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#b9bec5" stroke-width="1.4"/>
              <circle cx="12" cy="12" r="2.5" stroke="#b9bec5" stroke-width="1.4"/>
            </svg>
            <!-- 숨긴 상태 -->
            <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#b9bec5" stroke-width="1.4"/>
              <circle cx="12" cy="12" r="2.5" stroke="#b9bec5" stroke-width="1.4"/>
              <path d="M4 4l16 16" stroke="#b9bec5" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <p class="balance-amount">
          {{ showBalance ? balance + '원' : '잔액 숨기기' }}
        </p>
      </div>

      <div class="tini-badge">
        <span class="tini-dot"></span>
        <span class="tini-text">티니머니</span>
      </div>
    </div>

    <!-- 하단: QR 스캔으로 돌아가기 -->
    <button class="cta" @click="goScan">QR 스캔으로 돌아가기</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { getMyWallet } from '@/api/wallet'
import { useAuthStore } from '@/stores/auth'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

const router = useRouter()
const authStore = useAuthStore()

// [API] 실제로는 서버에서 결제용 QR 값을 발급받아야 함
// 예) GET /api/child/payment/qr → { qrValue, expiresIn }
//  지금은 더미 값으로 QR 무늬만 그림
const qrValue = ref('TEENYMONEY_PAY_TEST_12345')

// 지갑 잔액 (GET /api/v1/wallet/me 로 실제 연동)
const balance = ref('0')
const showBalance = ref(true)

async function fetchBalance() {
  try {
    const result = await getMyWallet(authStore.accessToken)
    balance.value = result.data.balance.toLocaleString()
  } catch (e) {
    console.error(e.message)
  }
}

// 유효시간 카운트다운 (3분)
const remainSec = ref(180)
let timer = null

const formattedTime = computed(() => {
  const m = Math.floor(remainSec.value / 60)
  const s = remainSec.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

onMounted(() => {
  fetchBalance()
  timer = setInterval(() => {
    if (remainSec.value > 0) remainSec.value--
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

function refreshQr() {
  // [API] 실제로는 서버에 재발급 요청 → 새 QR 값 받기
  // 예) POST /api/child/payment/qr/refresh → { qrValue, expiresIn }
  // 지금은 UI 확인용으로 더미 값을 랜덤으로 바꿔서 QR 무늬가 달라지게
  qrValue.value = 'TEENYMONEY_PAY_' + Date.now()
  remainSec.value = 180
}

function goScan() {
  // QR 스캔 화면으로 이동
  router.push({ name: 'qr-scan' })
}

// 만료 여부
const isExpired = computed(() => remainSec.value <= 0)
</script>

<style scoped>
.qr-code-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding: 50px 0 20px;
  background: #f8fafc;
}

/* 상단 네비 */
.nav {
  box-sizing: border-box;  
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 14px 20px;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}


/* 공통 카드 */
.card {
  box-sizing: border-box;
  width: 320px;
  border: 1px solid #f0f1f3;
  border-radius: 16px;
}

/* QR 카드 */
.qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 20px 20px;
  margin-top: 8px;
}

.qr-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.exp {
  display: flex;
  align-items: center;
}

.exp-text {
  font-weight: 600;
  font-size: 15px;
  color: #b9bec5;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 13px;
  border: none;
  border-radius: 10px;
  background: #ffbc00;
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.refresh-btn svg {
  display: block;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.qr-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
  background: #ffffff;
  border-radius: 14px;
}
/* 만료되면 QR 흐릿하게 */
.qr-box.expired :deep(canvas),
.qr-box.expired :deep(svg) {
  filter: blur(4px);
  opacity: 0.4;
}

.qr-desc {
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: #b9bec5;
  text-align: center;
}

/* 잔액 카드 */
.balance-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 17px 20px;
  margin-top: 12px;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-label {
  font-weight: 500;
  font-size: 11px;
  color: #b9bec5;
}

.eye-btn {
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.balance-amount {
  margin: 2px 0 0;
  font-weight: 600;
  font-size: 16px;
  color: #4a4e55;
}

.tini-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffbc00;
  border-radius: 14px;
}

.tini-dot {
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
}

.tini-text {
  font-weight: 700;
  font-size: 12px;
  color: #ffffff;
}

/* 하단 CTA */
.cta {
  width: 300px;
  margin: 100px auto 10px;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 500;
  font-size: 13.1px;
  cursor: pointer;
}

.cta:active {
  filter: brightness(0.97);
}
</style>