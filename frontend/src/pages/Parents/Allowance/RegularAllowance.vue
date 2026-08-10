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
        정기 용돈 설정
      </h1>

      <button
        class="alarm-btn"
        type="button"
        aria-label="알림"
      >
        <img
          src="@/assets/icons/icon-notification.svg"
          alt=""
          class="alarm-icon"
        />
      </button>
    </header>

    <div class="content">
      <!-- 대상 자녀 선택 -->
      <div class="section">
        <p class="section-label">
          대상 자녀 선택
        </p>

        <!-- 자녀 선택 버튼 -->
        <button
          type="button"
          class="child-select-box"
          @click="openChildModal"
        >
          <!-- 선택된 자녀가 있을 때 -->
          <div
            v-if="selectedChild"
            class="selected-child"
          >
            <div class="selected-avatar">
              <img
                :src="
                  selectedChild.profileImageUrl ||
                  '/src/assets/icons/child-profile.svg'
                "
                alt=""
                class="selected-avatar-img"
                @error="handleChildImageError"
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
      </div>

      <!-- 지급 주기 설정 -->
      <div class="section">
        <p class="section-label">
          지급 주기 설정
        </p>

        <div class="cycle-btns">
          <button
            type="button"
            class="cycle-btn"
            :class="{ active: cycle === 'WEEKLY' }"
            @click="cycle = 'WEEKLY'"
          >
            매주
          </button>

          <button
            type="button"
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

          <span class="day-unit">
            일
          </span>
        </div>
      </div>

      <!-- 지급 금액 설정 -->
      <div class="section">
        <p class="section-label">
          지급 금액 설정
        </p>

        <div class="amount-wrap">
          <input
            v-model="amount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />

          <span class="won">
            원
          </span>
        </div>

        <!-- 빠른 금액 -->
        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            @click="amount = quick.value"
          >
            {{ quick.label }}
          </button>
        </div>

        <p class="amount-desc">
          주기마다 자동 지급될 금액을 지정합니다.
        </p>
      </div>

      <!-- 주의사항 -->
      <div class="notice-card">
        <div class="notice-header">
          <img
            src="@/assets/icons/icon-info.svg"
            alt=""
            class="notice-icon"
          />

          <p class="notice-title">
            주의사항
          </p>
        </div>

        <p class="notice-text">
          결제 수단 미등록 시 설정 할 수 없습니다.
          <br />
          계좌를 먼저 연결해 주세요.
        </p>
      </div>

      <!-- 설정 저장 -->
      <button
        class="submit-btn"
        type="button"
        :disabled="!canSubmit"
        @click="handleSave"
      >
        설정 저장하기
      </button>
    </div>

   <!-- 자녀 선택 모달 -->
    <Teleport to="body">
      <div
        v-if="isChildModalOpen"
        class="modal-overlay"
        @click.self="closeChildModal"
      >
        <div class="bottom-sheet">
          <!-- 상단 핸들 -->
          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div>
              <h2 class="sheet-title">
                자녀 선택
              </h2>

              <p class="sheet-description">
                정기 용돈을 지급할 자녀를 선택해주세요.
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
                    :src="
                      child.profileImageUrl ||
                      '/src/assets/icons/child-profile.svg'
                    "
                    alt=""
                    class="modal-avatar-img"
                    @error="handleModalImageError"
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


// 상태
const children = ref([])

const selectedChildId = ref(null)

const cycle = ref('MONTHLY')

const dayOfCycle = ref(1)

const amount = ref('')

const isLoading = ref(false)

const isChildModalOpen = ref(false)


// 선택된 자녀
const selectedChild = computed(() => {
  if (!selectedChildId.value) {
    return null
  }

  return children.value.find(
    child =>
      child.id === selectedChildId.value
  ) || null
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


// 저장 가능 여부
const canSubmit = computed(() => {
  return (
    selectedChildId.value &&
    Number(dayOfCycle.value) > 0 &&
    Number(amount.value) > 0
  )
})


// 자녀 조회
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
        child => ({
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


// 자녀 모달
function openChildModal() {
  isChildModalOpen.value = true
}

function closeChildModal() {
  isChildModalOpen.value = false
}

function selectChild(child) {
  selectedChildId.value = child.id
}


// 이미지 에러
function handleChildImageError(event) {
  event.target.src =
    '/src/assets/icons/child-profile.svg'
}

function handleModalImageError(event) {
  event.target.src =
    '/src/assets/icons/child-profile.svg'
}


// 빠른 금액 입력
function addAmount(value) {
  amount.value =
    (Number(amount.value) || 0) + value
}

// 저장하기
async function handleSave() {
  if (!canSubmit.value) {
    return
  }

  /*
   * TODO:
   * 정기 용돈 API 나오면 이곳에서 호출
   *
   * POST /api/v1/allowance/regular
   *
   * {
   *   childId: selectedChildId.value,
   *   cycle: cycle.value,
   *   dayOfCycle: Number(dayOfCycle.value),
   *   amount: Number(amount.value)
   * }
   */

  router.push({
    path:
      '/parents/regular-allowance/complete',

    query: {
      childName:
        selectedChild.value?.name,

      childId:
        selectedChildId.value,

      cycle:
        cycle.value,

      day:
        dayOfCycle.value,

      amount:
        amount.value,
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
  background-color: #f4f5f7;
}

/* 헤더 */
.nav {
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
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
}


/* 콘텐츠 */
.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  object-fit: cover;
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
  color: #8b9097;
  background-color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cycle-btn.active {
  color: #191b1e;
  background-color: #ffbc00;
  font-weight: 700;
}

.day-input-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: #ffffff;
}

.day-input {
  width: 60px;
  border: none;
  outline: none;
  color: #191b1e;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
}

.day-unit {
  color: #191b1e;
  font-size: 16px;
  font-weight: 600;
}

/* 금액 입력 */
.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background-color: #ffffff;
}

.amount-input {
  min-width: 0;
  flex: 1;
  border: none;
  outline: none;
  color: #191b1e;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  text-align: right;
}

.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button,
.day-input::-webkit-inner-spin-button,
.day-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.won {
  color: #191b1e;
  font-size: 16px;
  font-weight: 600;
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
  color: #191b1e;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-btn:active {
  background-color: #f4f5f7;
}

.amount-desc {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
  text-align: center;
}


/* 주의사항 */

.notice-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: white;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-icon {
  width: 18px;
  height: 18px;
}

.notice-title {
  margin: 0;
  color : red;
  font-size: 14px;
  font-weight: 700;
}

.notice-text {
  margin: 0;
  color: red;
  font-size: 13px;
  line-height: 1.6;
}

/* =========================
   저장 버튼
========================= */

.submit-btn {
  width: 100%;
  height: 52px;
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

/* =========================
   하단 네비게이션
========================= */

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

/* =========================
   Bottom Sheet
========================= */

/*
  Teleport로 body에 붙기 때문에
  scoped 스타일에서 사용할 수 있도록
  :global 사용
*/

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
  width: 32px;
  height: 32px;

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

  object-fit: cover;
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

@keyframes sheet-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>