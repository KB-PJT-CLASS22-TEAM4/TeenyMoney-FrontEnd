<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">용돈 보내기</h1>
    </header>

    <div class="content">
      <!-- 받는 사람 -->
      <div class="section">
        <p class="section-label">받는 사람</p>
        <div class="children-list">
          <!-- 자녀 목록 -->
          <div
            v-for="child in children"
            :key="child.id"
            class="child-item"
            :class="{ selected: selectedChild && selectedChild.id === child.id }"
            @click="selectChild(child)"
          >
            <div class="child-avatar">
              <img
                :src="child.profileImageUrl || '/src/assets/icons/child-profile.svg'"
                alt=""
                class="avatar-img"
              />
            </div>
            <p class="child-name">{{ child.name }}</p>
          </div>
        </div>
      </div>

      <!-- 보낼 금액 -->
      <div class="section">
        <p class="section-label">보낼 금액</p>
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

        <!-- 빠른 금액 -->
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
      </div>

      <!-- 지갑 잔액 -->
      <div class="balance-row">
        <img src="@/assets/icons/icon-wallet.svg" alt="" class="wallet-icon" />
        <span class="balance-label">지갑 잔액</span>
        <!-- TODO: GET /wallet/balance → walletBalance 로 교체 -->
        <span class="balance-amount">{{ walletBalance.toLocaleString() }}원</span>
      </div>

      <!-- 보내기 버튼 -->
      <button
        class="submit-btn"
        :disabled="!canSubmit"
        @click="handleSend"
      >
        보내기
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
const selectedChild = ref(null)
const amount = ref('')
const walletBalance = ref(150000) // TODO: API 연동 후 교체

const quickAmounts = [
  { label: '+1만', value: 10000 },
  { label: '+3만', value: 30000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
]

const canSubmit = computed(() =>
  selectedChild.value && amount.value && Number(amount.value) > 0
)

onMounted(async () => {
  try {
    const res = await getChildren(authStore.accessToken)
    if (res.success) {
      children.value = res.data.map(child => ({
        id: child.childId,
        name: child.name,
        profileImageUrl: child.profileImageUrl,
      }))
    }
  } catch (error) {
    console.error('자녀 목록 불러오기 실패:', error)
  }
})

function selectChild(child) {
  selectedChild.value = child
}

function addAmount(value) {
  amount.value = (Number(amount.value) || 0) + value
}

function handleSend() {
  if (!canSubmit.value) return

  // 잔액 부족 체크
  if (Number(amount.value) > walletBalance.value) {
    router.push({
      path: '/parents/send/fail',
      query: {
        amount: amount.value,
        balance: walletBalance.value,
      },
    })
    return
  }

  // 송금 진행
  router.push({
    path: '/parents/send/processing',
    query: {
      amount: amount.value,
      childName: selectedChild.value.name,
      childId: selectedChild.value.id,
    },
  })
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
  gap: 24px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8b9097;
  font-weight: 600;
}

/* 자녀 목록 */
.children-list {
  display: flex;
  gap: 16px;
}

.child-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.child-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid transparent;
  overflow: hidden;
}

.child-item.selected .child-avatar {
  border-color: #ffbc00;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.child-name {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #191b1e;
}

/* 금액 입력 */
.amount-wrap {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #191b1e;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.amount-input {
  flex: 1;
  border: none;
  font-size: 24px;
  font-weight: 700;
  color: #191b1e;
  outline: none;
}

.won {
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
}

/* 빠른 금액 */
.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

/* 지갑 잔액 */
.balance-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background-color: #f4f5f7;
  border-radius: 10px;
}

.wallet-icon { width: 20px; height: 20px; }

.balance-label {
  flex: 1;
  font-size: 14px;
  color: #8b9097;
}

.balance-amount {
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

/* 보내기 버튼 */
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