<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">연동 코드</h1>
    </header>

    <div class="content">
      <!-- 코드 카드 -->
      <div class="code-card">
        <p class="code-label">자녀 기기에 입력할 코드</p>
        <div class="code-digits">
          <span v-for="digit in linkCode.split('')" :key="digit" class="digit">{{ digit }}</span>
        </div>
        <p class="timer-row">
          <img src="@/assets/icons/icon-clock.svg" alt="" class="clock-icon" />
          유효시간 <span class="timer">{{ formattedTimer }}</span>
        </p>
      </div>

      <p class="notice">
        <img src="@/assets/icons/icon-shield.svg" alt="" class="shield-icon" />
        이 코드는 발급 후 <strong>10분간</strong> 유효합니다
      </p>

      <!-- 연동 방법 -->
      <div class="guide">
        <p class="guide-title">연동 방법</p>
        <div class="guide-item">
          <span class="step">1</span>
          <p>자녀 앱에서 [설정 › 자녀 연동]을 열어요</p>
        </div>
        <div class="guide-item">
          <span class="step">2</span>
          <p>이 코드 6자리를 입력해요</p>
        </div>
        <div class="guide-item">
          <span class="step">3</span>
          <p>연결 완료! 바로 관리할 수 있어요</p>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="footer">
      <button class="btn btn-secondary" @click="copyCode">코드 복사</button>
      <button class="btn btn-primary" @click="generateCode">새 코드 발급</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const linkCode = ref('482913')
const timerSeconds = ref(600)
let timerInterval = null
let pollingInterval = null

const formattedTimer = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

async function generateCode() {
  // TODO: API 연동
  // POST /children/link-code → res.data.code
  // linkCode.value = res.data.code
  linkCode.value = '482913' // 하드코딩 임시값

  startTimer()
  startPolling()
}

function startTimer() {
  timerSeconds.value = 600
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timerSeconds.value <= 0) {
      clearInterval(timerInterval)
      stopPolling()
      return
    }
    timerSeconds.value -= 1
  }, 1000)
}

function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval)

  pollingInterval = setInterval(async () => {
    // TODO: API 연동
    // GET /children/link-status
    // if (res.data.linked) {
    //   stopPolling()
    //   router.push('/parent/children/link-complete')
    // }
  }, 3000)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function copyCode() {
  navigator.clipboard.writeText(linkCode.value)
  alert('코드가 복사되었습니다!')
}

onMounted(() => {
  generateCode()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  stopPolling()
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 6px;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

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

/* 코드 카드 */
.code-card {
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.code-label {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.code-digits {
  display: flex;
  gap: 10px;
}

.digit {
  width: 40px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #191b1e;
}

.timer-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.clock-icon {
  width: 16px;
  height: 16px;
}

.timer {
  font-weight: 700;
  color: #ffbc00;
}

/* 안내 */
.notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.shield-icon {
  width: 16px;
  height: 16px;
}

/* 연동 방법 */
.guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #191b1e;
}

.guide-item p {
  margin: 0;
}

.step {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f4f5f7;
  font-size: 13px;
  font-weight: 700;
  color: #8b9097;
}

/* 하단 버튼 */
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  gap: 10px;
  padding: 10px 16px 28px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.btn {
  flex: 1;
  height: 49px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
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
</style>