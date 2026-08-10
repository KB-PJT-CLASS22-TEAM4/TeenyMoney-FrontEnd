<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">정기 용돈 설정</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <div class="content">
      <!-- 대상 자녀 선택 -->
      <div class="section">
        <p class="section-label">대상 자녀 선택</p>
        <div class="select-wrap">
          <select v-model="selectedChildId" class="select">
            <option value="">자녀를 선택해주세요</option>
            <option v-for="child in children" :key="child.id" :value="child.id">
              {{ child.name }}
            </option>
          </select>
          <img src="@/assets/icons/icon-chevron.svg" alt="" class="select-arrow" />
        </div>
      </div>

      <!-- 지급 주기 설정 -->
      <div class="section">
        <p class="section-label">지급 주기 설정</p>
        <div class="cycle-btns">
          <button
            class="cycle-btn"
            :class="{ active: cycle === 'WEEKLY' }"
            @click="cycle = 'WEEKLY'"
          >
            매주
          </button>
          <button
            class="cycle-btn"
            :class="{ active: cycle === 'MONTHLY' }"
            @click="cycle = 'MONTHLY'"
          >
            매월
          </button>
        </div>

        <!-- 날짜 입력 -->
        <div class="day-input-wrap">
          <input
            v-model="dayOfCycle"
            type="number"
            class="day-input"
            :min="1"
            :max="cycle === 'WEEKLY' ? 7 : 31"
            placeholder="1"
          />
          <span class="day-unit">일</span>
        </div>
      </div>

      <!-- 지급 금액 설정 -->
      <div class="section">
        <p class="section-label">지급 금액 설정</p>
        <div class="amount-wrap">
          <input
            v-model="amount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />
          <span class="won">원</span>
        </div>
        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            @click="addAmount(quick.value)"
          >
            {{ quick.label }}
          </button>
        </div>
        <p class="amount-desc">주기마다 자동 지급될 금액을 지정합니다.</p>
      </div>

      <!-- 주의사항 -->
      <div class="notice-card">
        <div class="notice-header">
          <img src="@/assets/icons/icon-info.svg" alt="" class="notice-icon" />
          <p class="notice-title">주의사항</p>
        </div>
        <p class="notice-text">결제 수단 미등록 시 설정 할 수 없습니다.<br />계좌를 먼저 연결해 주세요.</p>
      </div>

      <!-- 설정 저장하기 버튼 -->
      <button
        class="submit-btn"
        :disabled="!canSubmit"
        @click="handleSave"
      >
        설정 저장하기
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'

const router = useRouter()
const authStore = useAuthStore()

const children = ref([])
const selectedChildId = ref('')
const cycle = ref('MONTHLY')
const dayOfCycle = ref(1)
const amount = ref('')

const quickAmounts = [
  { label: '+10만', value: 100000 },
  { label: '+50만', value: 500000 },
  { label: '+100만', value: 1000000 },
  { label: '+500만', value: 5000000 },
]

const canSubmit = computed(() =>
  selectedChildId.value &&
  dayOfCycle.value &&
  amount.value &&
  Number(amount.value) > 0
)

onMounted(async () => {
  try {
    const res = await getChildren(authStore.accessToken)
    if (res.success) {
      children.value = res.data.map(child => ({
        id: child.childId,
        name: child.name,
      }))
    }
  } catch (error) {
    console.error('자녀 목록 불러오기 실패:', error)
  }
})

function addAmount(value) {
  amount.value = (Number(amount.value) || 0) + value
}

async function handleSave() {
  if (!canSubmit.value) return

  // TODO: API 연동
  // POST /api/v1/allowance/regular
  // body: {
  //   childId: selectedChildId.value,
  //   cycle: cycle.value,
  //   dayOfCycle: dayOfCycle.value,
  //   amount: amount.value,
  // }

  // 임시: 바로 성공 페이지로
  const selectedChild = children.value.find(c => c.id === selectedChildId.value)
  router.push({
    path: '/parents/regular-allowance/complete',
    query: {
      childName: selectedChild?.name,
      cycle: cycle.value,
      day: dayOfCycle.value,
      amount: amount.value,
    },
  })
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
  padding: 18px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn, .alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon, .alarm-icon { width: 24px; height: 24px; }

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
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

/* 자녀 선택 */
.select-wrap {
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
}

.select {
  width: 100%;
  padding: 16px 44px 16px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-size: 15px;
  color: #191b1e;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

/* 지급 주기 */
.cycle-btns {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.cycle-btn {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 12px;
  background-color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  color: #8b9097;
  cursor: pointer;
}

.cycle-btn.active {
  background-color: #ffbc00;
  color: #191b1e;
  font-weight: 700;
}

.day-input-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
}

.day-input {
  width: 60px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
  text-align: right;
  outline: none;
  background: transparent;
}

.day-unit {
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

/* 금액 입력 */
.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.amount-input {
  flex: 1;
  border: none;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
  text-align: right;
  outline: none;
  background: transparent;
}

.won {
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

.quick-btns {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.amount-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  text-align: center;
}

/* 주의사항 */
.notice-card {
  background-color: #eff6ff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-icon { width: 18px; height: 18px; }

.notice-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1d4ed8;
}

.notice-text {
  margin: 0;
  font-size: 13px;
  color: #3b82f6;
  line-height: 1.6;
}

/* 저장 버튼 */
.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
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