<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="calendar-overlay"
      @click.self="close"
    >
      <div
        class="calendar-modal"
        @click="openTimeMenu = null"
      >
        <div class="calendar-header">
          <div>
            <h2 class="calendar-title">기한 설정</h2>
            <p class="calendar-description">
              퀘스트 만료 날짜를 선택해주세요.
            </p>
          </div>

          <button
            type="button"
            class="calendar-close"
            aria-label="달력 닫기"
            @click="close"
          >
            ×
          </button>
        </div>

        <div class="calendar-month-header">
          <button
            type="button"
            class="month-btn"
            @click="previousMonth"
          >
            ‹
          </button>

          <strong class="current-month">
            {{ calendarYear }}년 {{ calendarMonth + 1 }}월
          </strong>

          <button
            type="button"
            class="month-btn"
            @click="nextMonth"
          >
            ›
          </button>
        </div>

        <div class="calendar-weekdays">
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="blank in firstDayOfMonth"
            :key="`blank-${blank}`"
            class="calendar-day-empty"
          ></div>

          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            class="calendar-day"
            :class="{
              today: isToday(day),
              selected: isSelectedDay(day),
              disabled: isPastDay(day),
            }"
            :disabled="isPastDay(day)"
            @click="selectDay(day)"
          >
            {{ day }}
          </button>
        </div>

        <div class="time-section">
          <p class="time-label">완료 시간</p>

          <div class="time-select-wrap">
            <div class="time-dropdown">
              <button
                type="button"
                class="time-select"
                :class="{ open: openTimeMenu === 'hour' }"
                @click.stop="toggleTimeMenu('hour')"
              >
                <span>{{ selectedHour }}시</span>
                <span class="time-caret" aria-hidden="true"></span>
              </button>

              <div
                v-if="openTimeMenu === 'hour'"
                class="time-menu"
                @click.stop
              >
                <button
                  v-for="hour in hourOptions"
                  :key="hour"
                  type="button"
                  class="time-option"
                  :class="{
                    active: selectedHour === hour,
                    disabled: isHourDisabled(hour),
                  }"
                  :disabled="isHourDisabled(hour)"
                  @click="pickHour(hour)"
                >
                  {{ hour }}시
                </button>
              </div>
            </div>

            <span class="time-colon">:</span>

            <div class="time-dropdown">
              <button
                type="button"
                class="time-select"
                :class="{ open: openTimeMenu === 'minute' }"
                @click.stop="toggleTimeMenu('minute')"
              >
                <span>{{ selectedMinute }}분</span>
                <span class="time-caret" aria-hidden="true"></span>
              </button>

              <div
                v-if="openTimeMenu === 'minute'"
                class="time-menu"
                @click.stop
              >
                <button
                  v-for="minute in minuteOptions"
                  :key="minute"
                  type="button"
                  class="time-option"
                  :class="{
                    active: selectedMinute === minute,
                    disabled: isMinuteDisabled(minute),
                  }"
                  :disabled="isMinuteDisabled(minute)"
                  @click="pickMinute(minute)"
                >
                  {{ minute }}분
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="selectedDate"
          class="selected-date-preview"
        >
          <span class="preview-dot"></span>
          {{ selectedDate.getFullYear() }}년
          {{ selectedDate.getMonth() + 1 }}월
          {{ selectedDate.getDate() }}일
          {{ selectedHour }}:{{ selectedMinute }}
        </div>

        <div class="calendar-actions">
          <button
            type="button"
            class="calendar-cancel-btn"
            @click="close"
          >
            취소
          </button>

          <button
            type="button"
            class="calendar-confirm-btn"
            :disabled="!selectedDate"
            @click="confirmCalendar"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  </Teleport>
  <div class="calendar-alert-host">
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:open', 'confirm'])
const alertModal = useAlertModal()

const today = new Date()
const calendarYear = ref(today.getFullYear())
const calendarMonth = ref(today.getMonth())
const selectedDate = ref(null)
const selectedHour = ref('18')
const selectedMinute = ref('00')
const openTimeMenu = ref(null)

const hourOptions = Array.from(
  { length: 24 },
  (_, hour) => String(hour).padStart(2, '0')
)
const minuteOptions = ['00', '10', '20', '30', '40', '50']

const daysInMonth = computed(() =>
  new Date(calendarYear.value, calendarMonth.value + 1, 0).getDate()
)

const firstDayOfMonth = computed(() =>
  new Date(calendarYear.value, calendarMonth.value, 1).getDay()
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      openTimeMenu.value = null
      return
    }
    initializeFromValue()
  }
)

function close() {
  emit('update:open', false)
  openTimeMenu.value = null
}

function initializeFromValue() {
  if (props.modelValue) {
    const date = new Date(props.modelValue)

    if (!Number.isNaN(date.getTime())) {
      selectedDate.value = new Date(date)
      calendarYear.value = date.getFullYear()
      calendarMonth.value = date.getMonth()
      selectedHour.value = String(date.getHours()).padStart(2, '0')
      selectedMinute.value = String(date.getMinutes()).padStart(2, '0')
      snapTimeToFuture()
      return
    }
  }

  const now = new Date()
  selectedDate.value = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  calendarYear.value = now.getFullYear()
  calendarMonth.value = now.getMonth()
  snapTimeToFuture()
}

function toggleTimeMenu(menu) {
  openTimeMenu.value = openTimeMenu.value === menu ? null : menu
}

function pickHour(hour) {
  if (isHourDisabled(hour)) return
  selectedHour.value = hour
  openTimeMenu.value = null

  if (isMinuteDisabled(selectedMinute.value)) {
    const nextMinute = minuteOptions.find(
      (minute) => !isMinuteDisabled(minute)
    )
    if (nextMinute) selectedMinute.value = nextMinute
  }
}

function pickMinute(minute) {
  if (isMinuteDisabled(minute)) return
  selectedMinute.value = minute
  openTimeMenu.value = null
}

function previousMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
    return
  }
  calendarMonth.value--
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
    return
  }
  calendarMonth.value++
}

function selectDay(day) {
  selectedDate.value = new Date(
    calendarYear.value,
    calendarMonth.value,
    day
  )
  snapTimeToFuture()
}

function isSelectedDay(day) {
  if (!selectedDate.value) return false

  return (
    selectedDate.value.getFullYear() === calendarYear.value &&
    selectedDate.value.getMonth() === calendarMonth.value &&
    selectedDate.value.getDate() === day
  )
}

function isToday(day) {
  const now = new Date()
  return (
    now.getFullYear() === calendarYear.value &&
    now.getMonth() === calendarMonth.value &&
    now.getDate() === day
  )
}

function isPastDay(day) {
  const now = new Date()
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const date = new Date(
    calendarYear.value,
    calendarMonth.value,
    day
  )
  return date < todayStart
}

function isSelectedDateToday() {
  if (!selectedDate.value) return false
  const now = new Date()
  return (
    selectedDate.value.getFullYear() === now.getFullYear() &&
    selectedDate.value.getMonth() === now.getMonth() &&
    selectedDate.value.getDate() === now.getDate()
  )
}

function isHourDisabled(hourValue) {
  if (!isSelectedDateToday()) return false
  const lastSlot = new Date(selectedDate.value)
  lastSlot.setHours(Number(hourValue), 50, 0, 0)
  return lastSlot.getTime() < Date.now()
}

function isMinuteDisabled(minuteValue) {
  if (!isSelectedDateToday()) return false
  const slot = new Date(selectedDate.value)
  slot.setHours(Number(selectedHour.value), Number(minuteValue), 0, 0)
  return slot.getTime() < Date.now()
}

function snapTimeToFuture() {
  if (!isSelectedDateToday()) return

  const candidate = new Date(selectedDate.value)
  candidate.setHours(
    Number(selectedHour.value),
    Number(selectedMinute.value),
    0,
    0
  )
  if (candidate.getTime() >= Date.now()) return

  const now = new Date()
  const slots = [0, 10, 20, 30, 40, 50]
  let hour = now.getHours()
  let minute = slots.find((slot) => {
    const time = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      slot,
      0,
      0
    )
    return time.getTime() >= Date.now()
  })

  if (minute == null) {
    hour += 1
    minute = 0
  }

  if (hour > 23) return

  selectedHour.value = String(hour).padStart(2, '0')
  selectedMinute.value = String(minute).padStart(2, '0')
}

function confirmCalendar() {
  if (!selectedDate.value) return

  const date = new Date(selectedDate.value)
  snapTimeToFuture()
  date.setHours(
    Number(selectedHour.value),
    Number(selectedMinute.value),
    0,
    0
  )

  if (date.getTime() < Date.now()) {
    alertModal.showAlert('현재 시간 이후의 기한을 선택해주세요.')
    return
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  emit('confirm', `${year}-${month}-${day}T${hour}:${minute}`)
  emit('update:open', false)
}
</script>

<style scoped>
.calendar-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.35);
}

.calendar-modal {
  width: 100%;
  max-width: 330px;
  box-sizing: border-box;
  padding: 22px 20px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.calendar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.calendar-title {
  margin: 0 0 4px;
  color: #191b1e;
  font-size: 19px;
  font-weight: 700;
}

.calendar-description {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
}

.calendar-close {
  padding: 0;
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 25px;
  cursor: pointer;
}

.calendar-month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
}

.current-month {
  color: #191b1e;
  font-size: 16px;
}

.month-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid #eeeeee;
  border-radius: 50%;
  background: #ffffff;
  color: #555b63;
  font-size: 24px;
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 7px;
}

.calendar-weekdays span {
  color: #9ca1a8;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
}

.calendar-weekdays span:first-child {
  color: #e45b5b;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 5px;
}

.calendar-day,
.calendar-day-empty {
  aspect-ratio: 1;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: #303236;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.calendar-day:hover:not(.disabled):not(.selected) {
  background: #fff8df;
}

.calendar-day.today:not(.selected) {
  border-color: #ffbc00;
  color: #b57e00;
  font-weight: 700;
}

.calendar-day.selected {
  border-color: #ffbc00;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
}

.calendar-day.disabled {
  color: #d4d6da;
  cursor: not-allowed;
}

.time-section {
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid #eeeeee;
}

.time-label {
  margin: 0 0 10px;
  color: #555b63;
  font-size: 12px;
  font-weight: 600;
}

.time-select-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-dropdown {
  position: relative;
  flex: 1;
}

.time-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e0e2e6;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
  color: #191b1e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.time-select.open {
  border-color: #ffbc00;
  background: #fffdf6;
}

.time-caret {
  width: 8px;
  height: 8px;
  border-right: 1.6px solid #8b9097;
  border-bottom: 1.6px solid #8b9097;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.2s ease;
}

.time-select.open .time-caret {
  transform: rotate(225deg) translateY(-2px);
  border-color: #ffbc00;
}

.time-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 168px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid #eee3c4;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(25, 27, 30, 0.12);
}

.time-option {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #191b1e;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.time-option + .time-option {
  margin-top: 2px;
}

.time-option:hover:not(:disabled) {
  background: #fff8e1;
}

.time-option.active {
  background: #ffbc00;
  color: #191b1e;
}

.time-option.disabled,
.time-option:disabled {
  color: #c5c8cd;
  cursor: not-allowed;
}

.time-colon {
  color: #8b9097;
  font-weight: 700;
}

.selected-date-preview {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding: 11px 12px;
  border: 1px solid #ffe7a7;
  border-radius: 9px;
  background: #fff9e8;
  color: #66501a;
  font-size: 12px;
  font-weight: 600;
}

.preview-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #ffbc00;
}

.calendar-actions {
  display: flex;
  gap: 9px;
  margin-top: 18px;
}

.calendar-cancel-btn,
.calendar-confirm-btn {
  flex: 1;
  height: 46px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.calendar-cancel-btn {
  border: 1px solid #e0e2e6;
  background: #ffffff;
  color: #555b63;
}

.calendar-confirm-btn {
  border: 1px solid #ffbc00;
  background: #ffbc00;
  color: #191b1e;
}

.calendar-confirm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.calendar-alert-host {
  position: relative;
  z-index: 2100;
}
</style>
