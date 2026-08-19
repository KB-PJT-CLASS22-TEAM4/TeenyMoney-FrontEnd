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

      <h1 class="nav-title">
        용돈 보내기
      </h1>

      <ParentNavActions />
    </header>

    <div class="content">
      <!-- 받는 사람 -->
      <div class="section">
        <p class="section-label">
          받는 사람
        </p>

        <!-- 자녀 선택 버튼 -->
        <button
          type="button"
          class="child-select-box"
          @click="openChildModal"
        >
          <!-- 선택된 자녀 -->
          <div
            v-if="selectedChild"
            class="selected-child"
          >
            <div class="selected-avatar">
              <img
                :src="CHILD_PROFILE_IMAGE"
                alt=""
                class="selected-avatar-img"
              />
            </div>

            <span class="selected-child-name">
              {{ selectedChild.name }}
            </span>
          </div>

          <!-- 선택 전 -->
          <span
            v-else
            class="select-placeholder"
          >
            자녀를 선택해주세요
          </span>

          <img
            src="@/assets/icons/icon-chevron.svg"
            alt=""
            class="select-arrow"
          />
        </button>

        <!-- 자녀 조회 실패 -->
        <p
          v-if="childrenError"
          class="children-error"
        >
          {{ childrenError }}
        </p>
      </div>

      <!-- 보낼 금액 -->
      <div class="section">
        <p class="section-label">
          보낼 금액
        </p>

        <div class="amount-wrap">
          <input
            v-model="amount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
            min="1"
          />

          <span class="won">
            원
          </span>

          <button
            type="button"
            class="clear-amount-btn"
            aria-label="금액 초기화"
            @click="clearAmount"
          >
            초기화
          </button>
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

      <button
        class="allowance-card"
        type="button"
        @click="router.push('/parents/regular-allowance')"
      >
        <div class="allowance-left">
          <div class="allowance-icon-wrap">
            <img
              src="@/assets/icons/icon-clock.svg"
              alt=""
              class="clock-icon"
            />
          </div>
          <p class="allowance-main">정기용돈 설정</p>
        </div>
        <span class="chev">›</span>
      </button>

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

    <!-- ==============================
         자녀 선택 Bottom Sheet
    =============================== -->
    <Teleport to="body">
      <div
        v-if="isChildModalOpen"
        class="modal-overlay"
        @click.self="closeChildModal"
      >
        <div class="bottom-sheet">
          <!-- 상단 핸들 -->
          <div class="sheet-handle"></div>

          <!-- 제목 -->
          <div class="sheet-header">
            <div>
              <h2 class="sheet-title">
                자녀 선택
              </h2>

              <p class="sheet-description">
                용돈을 보낼 자녀를 선택해주세요.
              </p>
            </div>

            <button
              type="button"
              class="close-btn"
              aria-label="닫기"
              @click="closeChildModal"
            >
              ×
            </button>
          </div>

          <!-- 로딩 -->
          <div
            v-if="isLoading"
            class="modal-state"
          >
            자녀 정보를 불러오는 중입니다.
          </div>

          <!-- 조회 에러 -->
          <div
            v-else-if="childrenError"
            class="modal-state modal-error"
          >
            {{ childrenError }}
          </div>

          <!-- 자녀 없음 -->
          <div
            v-else-if="children.length === 0"
            class="modal-state"
          >
            연결된 자녀가 없습니다.
          </div>

          <!-- 자녀 목록 -->
          <div
            v-else
            class="modal-child-list"
          >
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              class="modal-child-item"
              :class="{
                selected:
                  selectedChildId === child.id
              }"
              @click="selectChild(child)"
            >
              <div class="modal-child-left">
                <div class="modal-avatar">
                  <img
                    :src="CHILD_PROFILE_IMAGE"
                    alt=""
                    class="modal-avatar-img"
                  />
                </div>

                <span class="modal-child-name">
                  {{ child.name }}
                </span>
              </div>

              <!-- 선택 체크 -->
              <div
                class="check-circle"
                :class="{
                  checked:
                    selectedChildId === child.id
                }"
              >
                <span
                  v-if="selectedChildId === child.id"
                  class="check-mark"
                >
                  ✓
                </span>
              </div>
            </button>
          </div>

          <!-- 선택 완료 -->
          <button
            type="button"
            class="modal-confirm-btn"
            :disabled="!selectedChildId"
            @click="closeChildModal"
          >
            선택 완료
          </button>
        </div>
      </div>
    </Teleport>

    <ParentBottomNav active="child" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const router = useRouter()
const authStore = useAuthStore()


// 상태
const children = ref([])

const selectedChildId = ref(null)

const amount = ref('')

const isLoading = ref(false)

const childrenError = ref('')

const isChildModalOpen = ref(false)


// 선택된 자녀
const selectedChild = computed(() => {
  if (!selectedChildId.value) {
    return null
  }

  return (
    children.value.find(
      child =>
        child.id === selectedChildId.value
    ) || null
  )
})


// 빠른 금액
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


// 보내기 활성화
const canSubmit = computed(() => {
  return (
    selectedChildId.value !== null &&
    Number(amount.value) > 0
  )
})


// 자녀 목록 조회
async function fetchChildren() {
  isLoading.value = true
  childrenError.value = ''

  try {
    if (!authStore.accessToken) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    const res = await getChildren(
      authStore.accessToken
    )

    if (res.success) {
      children.value = (
        res.data || []
      ).map(child => ({
        id: child.childId,
        name: child.name,
        profileImageUrl: CHILD_PROFILE_IMAGE,
      }))
    }
  } catch (error) {
    console.error(
      '자녀 목록 불러오기 실패:',
      error
    )

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    childrenError.value =
      error.message ||
      '자녀 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}


// 모달
function openChildModal() {
  isChildModalOpen.value = true
}

function closeChildModal() {
  isChildModalOpen.value = false
}


// 자녀 선택
function selectChild(child) {
  selectedChildId.value = child.id
}


// 빠른 금액
function addAmount(value) {
  amount.value =
    (Number(amount.value) || 0) + value
}

function clearAmount() {
  amount.value = 0
}

// 용돈 보내기
function handleSend() {
  if (!canSubmit.value) {
    return
  }

  // 중복 송금 방지용 키
  const idempotencyKey =
    crypto.randomUUID()

  router.push({
    path: '/parents/sending-allowance',

    query: {
      childId:
        selectedChildId.value,

      childName:
        selectedChild.value?.name || '',

      amount:
        Number(amount.value),

      idempotencyKey,
    },
  })
}

// 화면 진입
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
  background-color: white;
}


/* 헤더 */
.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background-color: #ffffff;
}

.back-btn,
.alarm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

/* 콘텐츠 */
.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 24px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 12px;
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
}


/* 자녀 선택 */
.child-select-box {
  display: flex;
  width: 100%;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background-color: #ffffff;
  cursor: pointer;
}

.selected-child {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-avatar {
  width: 42px;
  height: 42px;
  overflow: hidden;
  border: 2px solid #ffbc00;
  border-radius: 50%;
}

.selected-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f4f5f7;
}

.selected-child-name {
  color: #191b1e;
  font-size: 15px;
  font-weight: 700;
}

.select-placeholder {
  color: #8b9097;
  font-size: 14px;
}

.select-arrow {
  width: 20px;
  height: 20px;
}

.children-error {
  margin: 8px 3px 0;
  color: #d14343;
  font-size: 11px;
}


/* 금액 입력 */
.amount-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f4f5f7;
}

.amount-input {
  min-width: 0;
  flex: 1;
  border: none;
  outline: none;
  color: #191b1e;
  background: transparent;
  font-size: 22px;
  font-weight: 700;
  text-align: right;
}

.amount-input::placeholder {
  color: #c6c9ce;
}

.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.won {
  color: #191b1e;
  font-size: 16px;
  font-weight: 600;
}

.clear-amount-btn {
  flex-shrink: 0;
  height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 999px;
  background: #e8eaed;
  color: #8b9097;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* 빠른 금액 */
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
  color: #191b1e;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-btn:active {
  background-color: #f4f5f7;
}

.allowance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #eceef1;
  border-radius: 20px;
  background: #ffffff;
  cursor: pointer;
}

.allowance-left {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.allowance-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #fff8e6;
}

.clock-icon {
  width: 22px;
  height: 22px;
}

.allowance-main {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.chev {
  font-size: 18px;
  color: #a1a1aa;
}

/* 보내기 버튼 */
.submit-btn {
  width: 100%;
  height: 52px;
  margin-top: auto;
  border: none;
  border-radius: 12px;
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



/* 모달 오버레이 */
:global(.modal-overlay) {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: flex-end;
  justify-content: center;

  background-color: rgba(0, 0, 0, 0.38);
}

:global(.bottom-sheet) {
  width: 360px;
  max-height: 75vh;

  padding: 10px 16px 24px;

  overflow: hidden;

  border-radius: 22px 22px 0 0;

  background-color: #ffffff;

  animation: sheet-up 0.22s ease-out;
}

:global(.sheet-handle) {
  width: 38px;
  height: 4px;

  margin: 0 auto 18px;

  border-radius: 20px;

  background-color: #d9dce1;
}

:global(.sheet-header) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 18px;
}

:global(.sheet-title) {
  margin: 0 0 5px;

  color: #191b1e;

  font-size: 19px;
  font-weight: 800;
}

:global(.sheet-description) {
  margin: 0;

  color: #8b9097;

  font-size: 12px;
}

:global(.close-btn) {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;

  color: #8b9097;

  background: transparent;

  font-size: 27px;
  font-weight: 300;

  cursor: pointer;
}

:global(.modal-child-list) {
  display: flex;
  max-height: 310px;
  flex-direction: column;

  overflow-y: auto;

  border-top: 1px solid #f0f1f3;
}

:global(.modal-child-item) {
  display: flex;
  width: 100%;
  min-height: 74px;

  align-items: center;
  justify-content: space-between;

  padding: 10px 4px;

  border: none;
  border-bottom: 1px solid #f0f1f3;

  background-color: #ffffff;

  cursor: pointer;
}

:global(.modal-child-item:active) {
  background-color: #f8f9fa;
}

:global(.modal-child-left) {
  display: flex;
  align-items: center;
  gap: 13px;
}

:global(.modal-avatar) {
  width: 46px;
  height: 46px;

  overflow: hidden;

  border: 2px solid transparent;
  border-radius: 50%;
}

:global(.modal-child-item.selected .modal-avatar) {
  border-color: #ffbc00;
}

:global(.modal-avatar-img) {
  width: 100%;
  height: 100%;

  object-fit: contain;
  background-color: #f4f5f7;
}

:global(.modal-child-name) {
  color: #191b1e;

  font-size: 15px;
  font-weight: 700;
}

:global(.check-circle) {
  display: flex;
  width: 22px;
  height: 22px;

  align-items: center;
  justify-content: center;

  border: 1.5px solid #d7dae0;
  border-radius: 50%;

  background-color: #ffffff;
}

:global(.check-circle.checked) {
  border-color: #ffbc00;
  background-color: #ffbc00;
}

:global(.check-mark) {
  color: #191b1e;
  font-size: 13px;
  font-weight: 900;
}

:global(.modal-confirm-btn) {
  width: 100%;
  height: 50px;

  margin-top: 18px;

  border: none;
  border-radius: 11px;

  color: #191b1e;

  background-color: #ffbc00;

  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
}

:global(.modal-confirm-btn:disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}

:global(.modal-state) {
  padding: 45px 10px;

  color: #8b9097;

  font-size: 13px;

  text-align: center;
}

:global(.modal-error) {
  color: #d14343;
}

@keyframes sheet-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>