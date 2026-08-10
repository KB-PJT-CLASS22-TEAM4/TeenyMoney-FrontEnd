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
          <!-- data.code 문자열로 그대로 사용 (앞자리 0 손실 방지) -->
          <span v-for="(digit, index) in linkCode.split('')" :key="index" class="digit">{{ digit }}</span>
        </div>
        <p class="timer-row">
          <img src="@/assets/icons/icon-clock.svg" alt="" class="clock-icon" />
          <span v-if="isExpired" class="timer expired">코드가 만료되었습니다</span>
          <span v-else>유효시간 <span class="timer">{{ formattedTimer }}</span></span>
        </p>
      </div>

      <p class="notice">
        <img src="@/assets/icons/icon-shield.svg" alt="" class="shield-icon" />
        이 코드는 발급 후 <strong>10분간</strong> 유효합니다
      </p>

      <!-- 재발급 안내 -->
      <p class="reissue-notice">
        ⚠ 새 코드를 발급하면 이전 코드는 즉시 무효화됩니다
      </p>

      <!-- 429 에러 안내 -->
      <p v-if="rateLimitError" class="rate-limit-error">
        요청이 너무 많습니다. 잠시 후 다시 시도해주세요.
      </p>

      <!-- 연동 방법 -->
      <div class="guide">
        <p class="guide-title">연동 방법</p>
        <div class="guide-item">
          <span class="step">1</span>
          <p>자녀 앱에서 회원가입을 해주세요</p>
        </div>
        <div class="guide-item">
          <span class="step">2</span>
          <p>이 코드 6자리를 입력해주세요</p>
        </div>
        <div class="guide-item">
          <span class="step">3</span>
          <p>연결 완료! 바로 관리할 수 있어요</p>
        </div>
        <div class="remaker">
          <!-- 만료되거나 요청 중이면 복사 버튼 비활성화 -->
          <button
            class="btn btn-secondary"
            :disabled="isExpired || isLoading"
            @click="copyCode"
          >
            코드 복사
          </button>
          <!-- 만료 전이거나 요청 중이면 재발급 버튼 비활성화 -->
          <button
            class="btn btn-primary"
            :disabled="isLoading"
            @click="generateCode"
          >
            {{ isLoading ? '발급 중...' : '새 코드 발급' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { makeFamilyCode } from '@/api/families'

const router = useRouter()
const authStore = useAuthStore()

// data.code 는 문자열로 다룸 (앞자리 0 손실 방지)
const linkCode = ref('000000')
const timerSeconds = ref(600)
const isExpired = ref(false)
const isLoading = ref(false)      // 요청 진행 중 여부
const rateLimitError = ref(false) // 429 에러 여부

let timerInterval = null
// let pollingInterval = null
let currentIdempotencyKey = null  // 재시도 시 같은 키 재사용
let abortController = null        // AbortController로 이전 요청 취소

const formattedTimer = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

async function generateCode() {
  if (isLoading.value) return  // 요청 진행 중 중복 요청 방지

  // 이전 요청 취소
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  // 새 코드 발급 시 새로운 Idempotency-Key 생성
  currentIdempotencyKey = crypto.randomUUID()

  isLoading.value = true
  rateLimitError.value = false

  try {
    const res = await makeFamilyCode(
      authStore.accessToken,
      currentIdempotencyKey,
      abortController.signal
    )

    if (res.success) {
      // data.code 문자열로 그대로 저장 (숫자 변환 금지)
      linkCode.value = String(res.data.code)

      // expiresAt 으로 남은 시간 계산 (클라이언트에서 10분 계산 금지)
      const expiresAt = new Date(res.data.expiresAt)
      const now = new Date()
      const remainSeconds = Math.floor((expiresAt - now) / 1000)
      timerSeconds.value = remainSeconds > 0 ? remainSeconds : 0

      isExpired.value = false
      startTimer()
      // startPolling()
    }
  } catch (error) {
    if (error.name === 'AbortError') return  // 취소된 요청은 무시

    if (error.status === 429) {
      // 429는 재시도하지 않고 안내만
      rateLimitError.value = true
      return
    }

    console.error('연동 코드 발급 실패:', error)
    alert('연동 코드 발급에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timerSeconds.value <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      isExpired.value = true
      // stopPolling()
      return
    }
    timerSeconds.value -= 1
  }, 1000)
}

// function startPolling() {
//   if (pollingInterval) clearInterval(pollingInterval)

//   pollingInterval = setInterval(async () => {
//     // TODO: 연동 완료 확인 API 연동
//     // const res = await checkLinkStatus(authStore.accessToken)
//     // if (res.data.linked) {
//     //   stopPolling()
//     //   router.push('/parents/link-complete')
//     // }
//   }, 3000)
// }

// function stopPolling() {
//   if (pollingInterval) {
//     clearInterval(pollingInterval)
//     pollingInterval = null
//   }
// }

function copyCode() {
  // data.code 문자열 그대로 복사
  navigator.clipboard.writeText(linkCode.value)
  alert('코드가 복사되었습니다!')
}

onMounted(() => {
  generateCode()
})

// onUnmounted(() => {
//   if (timerInterval) clearInterval(timerInterval)
//   if (abortController) abortController.abort()  // 페이지 벗어날 때 요청 취소
//   stopPolling()
// })

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

.timer.expired {
  color: #ff3b30;
}

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

/* 재발급 안내 */
.reissue-notice {
  margin: 0;
  font-size: 12px;
  color: #ff9500;
  text-align: center;
}

/* 429 에러 안내 */
.rate-limit-error {
  margin: 0;
  font-size: 12px;
  color: #ff3b30;
  text-align: center;
}

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

.remaker {
  display: flex;
  gap: 10px;
  margin-top: 35px;
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

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>