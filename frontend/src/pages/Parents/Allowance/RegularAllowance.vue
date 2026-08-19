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

      <ParentNavActions />
    </header>

    <div class="content">
      <!-- 등록된 스케줄 -->
      <div class="section">
        <p class="section-label">
          등록된 정기 용돈
        </p>

        <p
          v-if="isScheduleLoading"
          class="schedule-state"
        >
          스케줄을 불러오는 중입니다.
        </p>

        <p
          v-else-if="schedules.length === 0"
          class="schedule-state"
        >
          아직 등록된 정기 용돈이 없어요.
        </p>

        <div
          v-else
          class="schedule-list"
        >
          <article
            v-for="schedule in schedules"
            :key="schedule.id"
            class="schedule-card"
            :class="{
              inactive: !schedule.isActive,
              editing: editingScheduleId === schedule.id,
            }"
          >
            <button
              type="button"
              class="schedule-main"
              @click="startEdit(schedule)"
            >
              <div class="schedule-top">
                <span class="schedule-child">
                  {{ childName(schedule.childId) }}
                </span>
                <span
                  class="schedule-badge"
                  :class="{ off: !schedule.isActive }"
                >
                  {{ schedule.isActive ? '진행 중' : '꺼짐' }}
                </span>
              </div>

              <p class="schedule-amount">
                {{ formatAmount(schedule.amount) }}원
              </p>

              <p class="schedule-meta">
                {{ formatCycleLabel(schedule.cycleType, schedule.paymentDay) }}
              </p>

              <p
                v-if="schedule.nextPaymentDate"
                class="schedule-next"
              >
                다음 지급일 {{ formatDate(schedule.nextPaymentDate) }}
              </p>
            </button>

            <div class="schedule-actions">
              <button
                type="button"
                class="schedule-action"
                :disabled="isSaving"
                @click="toggleSchedule(schedule)"
              >
                {{ schedule.isActive ? '끄기' : '켜기' }}
              </button>

              <button
                type="button"
                class="schedule-action"
                :disabled="isSaving"
                @click="startEdit(schedule)"
              >
                수정
              </button>

              <button
                type="button"
                class="schedule-action danger"
                :disabled="isSaving"
                @click="confirmDelete(schedule)"
              >
                삭제
              </button>
            </div>
          </article>
        </div>
      </div>

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
            v-if="selectedChildren.length"
            class="selected-child-list"
          >
            <div
              v-for="child in selectedChildren"
              :key="child.id"
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
                {{ child.name }}
              </span>
            </div>
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

        <!-- 매주: 요일 선택 -->
        <div
          v-if="cycle === 'WEEKLY'"
          class="weekday-btns"
        >
          <button
            v-for="day in WEEKDAY_OPTIONS"
            :key="day.value"
            type="button"
            class="weekday-btn"
            :class="{ active: Number(dayOfCycle) === day.value }"
            @click="dayOfCycle = day.value"
          >
            {{ day.label }}
          </button>
        </div>

        <!-- 매월: 날짜 입력 (1~28일) -->
        <div
          v-else
          class="day-input-wrap"
        >
          <input
            v-model="dayOfCycle"
            type="number"
            class="day-input"
            min="1"
            max="28"
            placeholder="1"
            inputmode="numeric"
            @input="clampMonthlyDay"
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

        <p class="amount-desc">
          주기마다 자동 지급될 금액을 지정합니다.
        </p>
      </div>

      <!-- 안내 -->
      <div class="notice-banner">
        <img
          src="@/assets/icons/icon-info.svg"
          alt=""
          class="info-icon"
        />

        <div class="notice-content">
          <p class="notice-label">
            안내
          </p>

          <ul class="notice-list">
            <li>
              결제 수단이 등록되어 있어야 정기 용돈을 설정할 수 있어요.
            </li>
            <li>
              설정 전 결제 수단 메뉴에서 카드를 먼저 등록해 주세요.
            </li>
          </ul>
        </div>
      </div>

      <!-- 설정 저장 -->
      <button
        class="submit-btn"
        type="button"
        :disabled="!canSubmit || isSaving"
        @click="handleSave"
      >
        {{ editingScheduleId ? '설정 수정하기' : '설정 저장하기' }}
      </button>

      <button
        v-if="editingScheduleId"
        class="reset-btn"
        type="button"
        :disabled="isSaving"
        @click="resetForm"
      >
        새로 만들기
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
                  selectedChildIds.includes(child.id)
              }"
              @click="toggleChild(child)"
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
                    selectedChildIds.includes(child.id)
                }"
              >
                <span
                  v-if="selectedChildIds.includes(child.id)"
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
            :disabled="selectedChildIds.length === 0"
            @click="closeChildModal"
          >
            선택 완료
          </button>
        </div>
      </div>
    </Teleport>

    <ParentBottomNav active="child" />
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'

import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAlertModal } from '@/composables/useAlertModal'
import { getChildren } from '@/api/children'
import {
  createAllowanceSchedule,
  deleteAllowanceSchedule,
  getAllowanceSchedules,
  updateAllowanceSchedule,
  updateAllowanceScheduleStatus,
} from '@/api/allowance'
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const WEEKDAY_LABELS = [
  '',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
]

const WEEKDAY_OPTIONS = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 7, label: '일' },
]

const router = useRouter()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const children = ref([])
const schedules = ref([])
const selectedChildIds = ref([])
const editingScheduleId = ref(null)
const cycle = ref('MONTHLY')
const dayOfCycle = ref(1)
const amount = ref('')
const isLoading = ref(false)
const isScheduleLoading = ref(false)
const isSaving = ref(false)
const isChildModalOpen = ref(false)

const selectedChildren = computed(() => {
  if (!selectedChildIds.value.length) {
    return []
  }

  return children.value.filter(
    (child) => selectedChildIds.value.includes(child.id)
  )
})

const quickAmounts = [
  { label: '+1만', value: 10000 },
  { label: '+3만', value: 30000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
]

const maxPaymentDay = computed(() => (
  cycle.value === 'WEEKLY' ? 7 : 28
))

const canSubmit = computed(() => {
  const day = Number(dayOfCycle.value)

  return (
    selectedChildIds.value.length > 0 &&
    day >= 1 &&
    day <= maxPaymentDay.value &&
    Number(amount.value) > 0
  )
})

watch(cycle, (nextCycle) => {
  if (nextCycle === 'WEEKLY') {
    const day = Number(dayOfCycle.value)
    if (day < 1 || day > 7) {
      dayOfCycle.value = 1
    }
    return
  }

  if (Number(dayOfCycle.value) > 28) {
    dayOfCycle.value = 28
  }
})

function clampMonthlyDay() {
  const day = Number(dayOfCycle.value)
  if (!Number.isFinite(day)) return
  if (day > 28) dayOfCycle.value = 28
  if (day < 1) dayOfCycle.value = 1
}

function childName(childId) {
  return children.value.find(child => child.id === childId)?.name || '자녀'
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString()
}

function formatCycleLabel(cycleType, paymentDay) {
  if (cycleType === 'WEEKLY') {
    return `매주 ${WEEKDAY_LABELS[paymentDay] || `${paymentDay}요일`}`
  }

  return `매월 ${paymentDay}일`
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function handleScheduleError(error, fallbackMessage) {
  if (error.status === 401) {
    authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
    return
  }

  if (error.status === 403) {
    alertModal.showAlert('본인 소유의 스케줄이 아닙니다.')
    return
  }

  if (error.status === 404) {
    alertModal.showAlert('스케줄을 찾을 수 없습니다.')
    return
  }

  alertModal.showAlert(error.message || fallbackMessage)
}

function buildPayload(childId) {
  return {
    childId: Number(childId),
    amount: Number(amount.value),
    cycleType: cycle.value,
    paymentDay: Number(dayOfCycle.value),
  }
}

async function fetchChildren() {
  isLoading.value = true

  try {
    if (!authStore.accessToken) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return
    }

    const res = await getChildren(authStore.accessToken)

    if (res.success) {
      children.value = res.data.map(child => ({
        id: child.childId,
        name: child.name,
        profileImageUrl: CHILD_PROFILE_IMAGE,
      }))
    }
  } catch (error) {
    console.error('자녀 목록 불러오기 실패:', error)

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
    }
  } finally {
    isLoading.value = false
  }
}

async function fetchSchedules() {
  if (!authStore.accessToken) {
    return
  }

  isScheduleLoading.value = true

  try {
    const res = await getAllowanceSchedules(authStore.accessToken)
    schedules.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    console.error('정기 용돈 스케줄 불러오기 실패:', error)
    handleScheduleError(error, '정기 용돈 스케줄을 불러오지 못했습니다.')
  } finally {
    isScheduleLoading.value = false
  }
}

function openChildModal() {
  isChildModalOpen.value = true
}

function closeChildModal() {
  isChildModalOpen.value = false
}

function toggleChild(child) {
  if (editingScheduleId.value) {
    selectedChildIds.value =
      selectedChildIds.value.includes(child.id) ? [] : [child.id]
    return
  }

  if (selectedChildIds.value.includes(child.id)) {
    selectedChildIds.value = selectedChildIds.value.filter(
      (id) => id !== child.id
    )
    return
  }

  selectedChildIds.value = [...selectedChildIds.value, child.id]
}

function startEdit(schedule) {
  editingScheduleId.value = schedule.id
  selectedChildIds.value = [schedule.childId]
  cycle.value = schedule.cycleType === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY'

  const day = Number(schedule.paymentDay) || 1
  if (cycle.value === 'WEEKLY') {
    dayOfCycle.value = day >= 1 && day <= 7 ? day : 1
  } else {
    dayOfCycle.value = Math.min(Math.max(day, 1), 28)
  }

  amount.value = schedule.amount
}

function addAmount(value) {
  amount.value = (Number(amount.value) || 0) + value
}

function clearAmount() {
  amount.value = 0
}

function resetForm() {
  editingScheduleId.value = null
  selectedChildIds.value = []
  cycle.value = 'MONTHLY'
  dayOfCycle.value = 1
  amount.value = ''
}

async function handleSave() {
  if (!canSubmit.value || isSaving.value) {
    return
  }

  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  isSaving.value = true

  try {
    if (editingScheduleId.value) {
      await updateAllowanceSchedule(
        authStore.accessToken,
        editingScheduleId.value,
        buildPayload(selectedChildIds.value[0])
      )

      await fetchSchedules()
      alertModal.showAlert('정기 용돈 설정을 수정했어요.')
      return
    }

    const created = []

    for (const childId of selectedChildIds.value) {
      const res = await createAllowanceSchedule(
        authStore.accessToken,
        buildPayload(childId)
      )
      created.push(res)
    }

    router.push({
      path: '/parents/regular-allowance/complete',
      query: {
        childName: selectedChildren.value.map((child) => child.name).join(', '),
        childId: selectedChildIds.value[0],
        cycle: cycle.value,
        day: dayOfCycle.value,
        amount: amount.value,
        cycleLabel: formatCycleLabel(cycle.value, Number(dayOfCycle.value)),
        nextPaymentDate: created[0]?.data?.nextPaymentDate || '',
      },
    })
  } catch (error) {
    console.error('정기 용돈 저장 실패:', error)
    handleScheduleError(
      error,
      editingScheduleId.value
        ? '정기 용돈 수정에 실패했습니다.'
        : '정기 용돈 설정에 실패했습니다.'
    )
  } finally {
    isSaving.value = false
  }
}

async function toggleSchedule(schedule) {
  if (isSaving.value) {
    return
  }

  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  const nextActive = !schedule.isActive
  isSaving.value = true

  try {
    const res = await updateAllowanceScheduleStatus(
      authStore.accessToken,
      schedule.id,
      nextActive
    )

    await fetchSchedules()

    if (nextActive) {
      const nextDate = formatDate(res?.data?.nextPaymentDate)

      alertModal.showAlert(
        nextDate
          ? `정기 용돈을 다시 켰어요.\n다음 지급일은 ${nextDate}이에요.`
          : '정기 용돈을 다시 켰어요.\n다음 지급일이 오늘 기준으로 다시 계산돼요.'
      )
      return
    }

    alertModal.showAlert('정기 용돈을 잠시 꺼 두었어요.')
  } catch (error) {
    console.error('정기 용돈 상태 변경 실패:', error)
    handleScheduleError(error, '정기 용돈 상태 변경에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete(schedule) {
  const child = childName(schedule.childId)
  const ok = await alertModal.showConfirm(
    `${child}의 정기 용돈 스케줄을 삭제할까요?`,
    '삭제'
  )

  if (!ok) {
    return
  }

  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  isSaving.value = true

  try {
    await deleteAllowanceSchedule(authStore.accessToken, schedule.id)
    await fetchSchedules()

    if (editingScheduleId.value === schedule.id) {
      resetForm()
    }

    alertModal.showAlert('정기 용돈 스케줄을 삭제했어요.')
  } catch (error) {
    console.error('정기 용돈 삭제 실패:', error)
    handleScheduleError(error, '정기 용돈 삭제에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchChildren()
  fetchSchedules()
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

.schedule-state {
  margin: 0;
  padding: 18px 12px;
  border-radius: 12px;
  background-color: #f4f5f7;
  color: #8b9097;
  font-size: 13px;
  text-align: center;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-card {
  overflow: hidden;
  border: 1px solid #f0f1f3;
  border-radius: 12px;
  background-color: #ffffff;
}

.schedule-card.editing {
  border-color: #ffbc00;
}

.schedule-card.inactive {
  opacity: 0.72;
}

.schedule-main {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.schedule-top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.schedule-child {
  color: #191b1e;
  font-size: 14px;
  font-weight: 700;
}

.schedule-badge {
  padding: 3px 8px;
  border-radius: 999px;
  background-color: #fff3c4;
  color: #8b6e00;
  font-size: 11px;
  font-weight: 700;
}

.schedule-badge.off {
  background-color: #f0f1f3;
  color: #8b9097;
}

.schedule-amount {
  margin: 4px 0 0;
  color: #191b1e;
  font-size: 18px;
  font-weight: 800;
}

.schedule-meta,
.schedule-next {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
}

.schedule-actions {
  display: flex;
  gap: 6px;
  padding: 0 12px 12px;
}

.schedule-action {
  flex: 1;
  height: 34px;
  border: 1px solid #e0e2e6;
  border-radius: 8px;
  background-color: #ffffff;
  color: #191b1e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.schedule-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.schedule-action.danger {
  color: #d14b4b;
}

.reset-btn {
  width: 100%;
  height: 44px;
  margin-top: -8px;
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
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

.selected-child-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
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
  background-color: #f4f5f7;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cycle-btn.active {
  color: #191b1e;
  background-color: #ffbc00;
  font-weight: 700;
}

.weekday-btns {
  display: flex;
  gap: 6px;
}

.weekday-btn {
  flex: 1;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 10px;
  color: #8b9097;
  background-color: #f4f5f7;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.weekday-btn.active {
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
  background-color: #f4f5f7;
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
  background-color: #f4f5f7;
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


/* 안내 */

.notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background-color: #fff7d6;
}

.info-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-label {
  margin: 0 0 6px;
  color: #8b6e00;
  font-size: 12px;
  font-weight: 700;
}

.notice-list {
  margin: 0;
  padding-left: 16px;
  color: #6c6252;
  font-size: 12px;
  line-height: 1.55;
}

.notice-list li + li {
  margin-top: 4px;
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

@keyframes sheet-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>