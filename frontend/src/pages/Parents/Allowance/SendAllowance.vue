<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">용돈 보내기</h1>
    </header>

    <div class="content">
      <!-- 받는 사람 -->
      <div class="section">
        <p class="section-label">받는 사람</p>

        <div class="children-list">
          <div
            v-for="child in children"
            :key="child.id"
            class="child-item"
            :class="{
              selected:
                selectedChild &&
                selectedChild.id === child.id
            }"
            @click="selectChild(child)"
          >
            <div class="child-avatar">
              <img
                :src="
                  child.profileImageUrl ||
                  '/src/assets/icons/child-profile.svg'
                "
                alt=""
                class="avatar-img"
                @error="
                  (e) =>
                    e.target.src =
                      '/src/assets/icons/child-profile.svg'
                "
              />
            </div>

            <p class="child-name">
              {{ child.name }}
            </p>
          </div>
        </div>

        <!-- 자녀가 없을 때 -->
        <p
          v-if="!isLoading && children.length === 0"
          class="empty-message"
        >
          연결된 자녀가 없습니다.
        </p>

        <!-- 자녀 로딩 중 -->
        <p
          v-if="isLoading"
          class="empty-message"
        >
          자녀 정보를 불러오는 중입니다.
        </p>
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
            min="1"
          />

          <span class="won">원</span>
        </div>

        <!-- 빠른 금액 -->
        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            type="button"
            @click="addAmount(quick.value)"
          >
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- 보내기 버튼 -->
      <button
        class="submit-btn"
        type="button"
        :disabled="!canSubmit"
        @click="handleSend"
      >
        보내기
      </button>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/home')"
      >
        <img
          src="@/assets/icons/icon-home.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          홈
        </span>
      </button>

      <button
        class="nav-item nav-item-active"
        type="button"
        @click="router.push('/parents/childlist')"
      >
        <img
          src="@/assets/icons/icon-child-alive.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          자녀관리
        </span>
      </button>

      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/mypage')"
      >
        <img
          src="@/assets/icons/icon-mypage.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          마이페이지
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'

const router = useRouter()
const authStore = useAuthStore()

/* =========================
   상태
========================= */

const children = ref([])
const selectedChild = ref(null)
const amount = ref('')
const isLoading = ref(false)

/* =========================
   빠른 금액
========================= */

const quickAmounts = [
  {
    label: '+1만',
    value: 10000,
  },
  {
    label: '+3만',
    value: 30000,
  },
  {
    label: '+5만',
    value: 50000,
  },
  {
    label: '+10만',
    value: 100000,
  },
]

/* =========================
   보내기 버튼 활성화 여부
========================= */

const canSubmit = computed(() => {
  return (
    selectedChild.value !== null &&
    Number(amount.value) > 0
  )
})

/* =========================
   자녀 목록 조회
========================= */

async function fetchChildren() {
  isLoading.value = true

  try {
    if (!authStore.accessToken) {
      router.replace('/login')
      return
    }

    const res = await getChildren(
      authStore.accessToken
    )

    if (res.success) {
      children.value = res.data.map(
        (child) => ({
          id: child.childId,
          name: child.name,
          profileImageUrl:
            child.profileImageUrl || '',
        })
      )
    }
  } catch (error) {
    console.error(
      '자녀 목록 불러오기 실패:',
      error
    )

    if (error.status === 401) {
      authStore.clearUser()
      router.replace('/login')
    }
  } finally {
    isLoading.value = false
  }
}

/* =========================
   자녀 선택
========================= */

function selectChild(child) {
  selectedChild.value = child
}

/* =========================
   빠른 금액 추가
========================= */

function addAmount(value) {
  amount.value =
    (Number(amount.value) || 0) + value
}

/* =========================
   보내기
========================= */

function handleSend() {
  if (!canSubmit.value) {
    return
  }

  /*
   * 중복 송금 방지를 위한
   * Idempotency-Key 생성
   */
  const idempotencyKey =
    crypto.randomUUID()

  router.push({
    path: '/parents/sending-allowance',

    query: {
      childId:
        selectedChild.value.id,

      childName:
        selectedChild.value.name,

      amount:
        Number(amount.value),

      idempotencyKey,
    },
  })
}

/* =========================
   화면 진입
========================= */

onMounted(() => {
  fetchChildren()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.page {
  display: flex;
  width: 360px;
  min-height: 100dvh;
  flex-direction: column;
  margin: 0 auto;
  padding-bottom: 70px;
  background-color: #ffffff;
}

/* 헤더 */
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
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

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
}

/* 콘텐츠 */
.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 12px;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
}

/* 자녀 목록 */
.children-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
}

.children-list::-webkit-scrollbar {
  display: none;
}

.child-item {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.child-avatar {
  width: 56px;
  height: 56px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 50%;
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
  color: #191b1e;
  font-size: 12px;
  font-weight: 600;
}

.empty-message {
  margin: 15px 0 0;
  color: #a3a8af;
  font-size: 12px;
}

/* 금액 입력 */
.amount-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #191b1e;
}

.amount-input {
  min-width: 0;
  flex: 1;
  border: none;
  outline: none;
  color: #191b1e;
  font-size: 24px;
  font-weight: 700;
}

.amount-input::placeholder {
  color: #c6c9ce;
}

/* number input 화살표 제거 */
.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.won {
  color: #191b1e;
  font-size: 18px;
  font-weight: 700;
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
  color: #191b1e;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.quick-btn:active {
  background-color: #f4f5f7;
}

/* 보내기 버튼 */
.submit-btn {
  width: 100%;
  height: 49px;
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  color: #191b1e;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
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
  z-index: 100;
  display: flex;
  width: 360px;
  justify-content: space-around;
  padding: 10px 0 20px;
  border-top: 1px solid #f0f1f3;
  background-color: #ffffff;
  transform: translateX(-50%);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  color: #8b9097;
  font-size: 11px;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>