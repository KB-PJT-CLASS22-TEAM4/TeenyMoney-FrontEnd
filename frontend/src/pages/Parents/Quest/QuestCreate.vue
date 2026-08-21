<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        class="close-btn"
        type="button"
        @click="router.back()"
      >
        ✕
      </button>

      <h1 class="nav-title">
        퀘스트 생성
      </h1>

      <ParentNavActions />
    </header>


    <div class="content">

      <!-- =========================
           자녀 선택
      ========================== -->
      <div class="section">
        <p class="section-label">
          자녀 선택
        </p>

        <button
          type="button"
          class="child-select-box"
          @click="openChildModal"
        >
          <span
            v-if="selectedChildren.length === 0"
            class="child-select-placeholder"
          >
            퀘스트를 받을 자녀를 선택해주세요.
          </span>

          <div
            v-else
            class="selected-child-list"
          >
            <div
              v-for="child in selectedChildren"
              :key="child.id"
              class="selected-child"
            >
              <img
                :src="CHILD_PROFILE_IMAGE"
                alt=""
                class="selected-child-avatar"
              />

              <span class="selected-child-name">
                {{ child.name }}
              </span>
            </div>
          </div>

          <span class="select-arrow">
            ›
          </span>
        </button>
      </div>


      <!-- =========================
           제목
      ========================== -->
      <div class="section">
        <p class="section-label">
          <span>제목</span>
          <span class="char-count">
            {{ form.title.length }}/50
          </span>
        </p>

        <input
          v-model="form.title"
          type="text"
          class="input"
          maxlength="50"
          placeholder="예: 방 청소하기, 일기 쓰기"
        />
      </div>


      <!-- =========================
           내용
      ========================== -->
      <div class="section">
        <p class="section-label">
          <span>내용</span>
          <span class="char-count">
            {{ form.content.length }}/500
          </span>
        </p>

        <textarea
          v-model="form.content"
          class="textarea"
          maxlength="500"
          placeholder="상세한 수행 방법이나 규칙을 적어주세요."
          rows="4"
        />
      </div>


      <!-- =========================
           기한
      ========================== -->
      <div class="section">
        <p class="section-label">
          기한
        </p>

        <button
          type="button"
          class="custom-date-input"
          @click="openCalendar"
        >
          <span
            :class="{
              'date-placeholder':
                !form.deadline
            }"
          >
            {{
              form.deadline
                ? formatDeadline(
                    form.deadline
                  )
                : '기한을 선택해주세요.'
            }}
          </span>

          <svg
            class="calendar-icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="3"
              stroke="currentColor"
              stroke-width="1.8"
            />

            <path
              d="M8 3V7M16 3V7M3 10H21"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>


      <!-- =========================
           현금 보상
      ========================== -->
      <div class="section">
        <p class="section-label">
          현금 보상
        </p>

        <div class="amount-wrap">
          <input
            v-model="form.rewardAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />

          <span class="won">
            원
          </span>
        </div>

        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            type="button"
            class="quick-btn"
            @click="
              addAmount(
                quick.value
              )
            "
          >
            {{ quick.label }}
          </button>

          <button
            type="button"
            class="quick-btn reset-btn"
            @click="
              form.rewardAmount = 0
            "
          >
            초기화
          </button>
        </div>
      </div>


      <!-- =========================
           신뢰도 · 인증 방식
      ========================== -->
      <div class="section option-box">
        <button
          class="teeny-score-row"
          :class="{
            on: form.teenyScoreEnabled
          }"
          type="button"
          role="switch"
          :aria-checked="form.teenyScoreEnabled"
          @click="
            form.teenyScoreEnabled =
              !form.teenyScoreEnabled
          "
        >
          <div
            class="teeny-score-icon"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3L19.5 6.2V11.2C19.5 15.9 16.4 19.7 12 21.7C7.6 19.7 4.5 15.9 4.5 11.2V6.2L12 3Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <path
                d="M8.6 12.1L11 14.5L15.5 9.8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="teeny-score-text">
            <div class="teeny-score-title-row">
              <p class="teeny-score-title">
                신뢰도 점수 부여
              </p>

              <span class="teeny-score-badge">
                {{
                  form.teenyScoreEnabled
                    ? '부여'
                    : '미부여'
                }}
              </span>
            </div>

            <p class="teeny-score-desc">
              수행 완료 시 신뢰도 점수가 상승합니다.
            </p>
          </div>

          <span
            class="teeny-score-switch"
            aria-hidden="true"
          >
            <span class="teeny-score-knob"></span>
          </span>
        </button>

        <div class="option-divider"></div>

        <button
          class="teeny-score-row"
          :class="{
            on: isPhotoRequired
          }"
          type="button"
          role="switch"
          :aria-checked="isPhotoRequired"
          @click="togglePhotoRequired"
        >
          <div
            class="teeny-score-icon"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 8V7a2 2 0 0 1 2-2h2l1.2-1.6A1 1 0 0 1 10 3h4a1 1 0 0 1 .8.4L16 5h2a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <rect
                x="3.5"
                y="8"
                width="17"
                height="12"
                rx="2.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <circle
                cx="12"
                cy="14"
                r="3.2"
                stroke="currentColor"
                stroke-width="1.8"
              />
            </svg>
          </div>

          <div class="teeny-score-text">
            <div class="teeny-score-title-row">
              <p class="teeny-score-title">
                사진 인증 필요
              </p>

              <span class="teeny-score-badge">
                {{
                  isPhotoRequired
                    ? '필요'
                    : '선택'
                }}
              </span>
            </div>

            <p class="teeny-score-desc">
              켜면 자녀가 퀘스트를 인증할 때 사진을 올려야 합니다.
            </p>
          </div>

          <span
            class="teeny-score-switch"
            aria-hidden="true"
          >
            <span class="teeny-score-knob"></span>
          </span>
        </button>
      </div>


      <!-- =========================
           생성
      ========================== -->
      <button
        class="submit-btn"
        :disabled="
          !canSubmit ||
          isCreating
        "
        @click="handleCreate"
      >
        {{
          isCreating
            ? '생성 중...'
            : '생성하기'
        }}
      </button>

      <p class="submit-notice">
        생성된 퀘스트는 자녀의 대시보드에 즉시 노출됩니다.
      </p>
    </div>


    <!-- =========================
         자녀 선택 Bottom Sheet
    ========================== -->
    <Teleport to="body">
      <div
        v-if="isChildModalOpen"
        class="modal-overlay"
        @click.self="closeChildModal"
      >
        <div class="bottom-sheet">

          <div class="sheet-handle"></div>

          <div class="sheet-header">
            <div>
              <h2 class="sheet-title">
                자녀 선택
              </h2>

              <p class="sheet-description">
                퀘스트를 받을 자녀를 선택해주세요.
              </p>
            </div>

            <button
              type="button"
              class="sheet-close-btn"
              aria-label="닫기"
              @click="closeChildModal"
            >
              ×
            </button>
          </div>

          <div
            v-if="isChildrenLoading"
            class="modal-state"
          >
            자녀 정보를 불러오는 중입니다.
          </div>

          <div
            v-else-if="childrenError"
            class="modal-state modal-error"
          >
            {{ childrenError }}
          </div>

          <div
            v-else-if="children.length === 0"
            class="modal-state"
          >
            연결된 자녀가 없습니다.
          </div>

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
                  selectedChildIds.includes(
                    child.id
                  )
              }"
              @click="
                toggleChild(
                  child.id
                )
              "
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

              <div
                class="check-circle"
                :class="{
                  checked:
                    selectedChildIds.includes(
                      child.id
                    )
                }"
              >
                <span
                  v-if="
                    selectedChildIds.includes(
                      child.id
                    )
                  "
                  class="check-mark"
                >
                  ✓
                </span>
              </div>
            </button>
          </div>

          <button
            type="button"
            class="modal-confirm-btn"
            :disabled="
              selectedChildIds.length === 0
            "
            @click="closeChildModal"
          >
            선택 완료
          </button>
        </div>
      </div>
    </Teleport>


    <!-- =========================
         커스텀 기한 달력
    ========================== -->
    <Teleport to="body">
      <div
        v-if="isCalendarOpen"
        class="calendar-overlay"
        @click.self="closeCalendar"
      >
        <div
          class="calendar-modal"
          @click="openTimeMenu = null"
        >

          <!-- 헤더 -->
          <div class="calendar-header">
            <div>
              <h2 class="calendar-title">
                기한 설정
              </h2>

              <p class="calendar-description">
                퀘스트 만료 날짜를 선택해주세요.
              </p>
            </div>

            <button
              type="button"
              class="calendar-close"
              aria-label="달력 닫기"
              @click="closeCalendar"
            >
              ×
            </button>
          </div>


          <!-- 월 이동 -->
          <div class="calendar-month-header">

            <button
              type="button"
              class="month-btn"
              @click="previousMonth"
            >
              ‹
            </button>

            <strong class="current-month">
              {{ calendarYear }}년
              {{ calendarMonth + 1 }}월
            </strong>

            <button
              type="button"
              class="month-btn"
              @click="nextMonth"
            >
              ›
            </button>

          </div>


          <!-- 요일 -->
          <div class="calendar-weekdays">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
          </div>


          <!-- 날짜 -->
          <div class="calendar-grid">

            <!-- 첫째 주 빈칸 -->
            <div
              v-for="blank in firstDayOfMonth"
              :key="
                `blank-${blank}`
              "
              class="calendar-day-empty"
            ></div>

            <!-- 날짜 -->
            <button
              v-for="day in daysInMonth"
              :key="day"
              type="button"
              class="calendar-day"
              :class="{
                today:
                  isToday(day),

                selected:
                  isSelectedDay(day),

                disabled:
                  isPastDay(day)
              }"
              :disabled="
                isPastDay(day)
              "
              @click="
                selectDay(day)
              "
            >
              {{ day }}
            </button>

          </div>


          <!-- 시간 -->
          <div class="time-section">

            <p class="time-label">
              완료 시간
            </p>

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


          <!-- 선택 결과 -->
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


          <!-- 하단 버튼 -->
          <div class="calendar-actions">

            <button
              type="button"
              class="calendar-cancel-btn"
              @click="closeCalendar"
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


    <ParentBottomNav active="quest" />
    <AlertHost :modal="alertModal" />
  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  useAuthStore,
} from '@/stores/auth'

import {
  getChildren,
} from '@/api/children'

import {
  createQuest,
} from '@/api/quest'

import {
  CHILD_PROFILE_IMAGE,
} from '@/utils/profileImages'


const router =
  useRouter()

const authStore =
  useAuthStore()
const alertModal = useAlertModal()


// =========================
// 상태
// =========================

const children =
  ref([])

const selectedChildIds =
  ref([])

const isChildModalOpen =
  ref(false)

const isChildrenLoading =
  ref(false)

const isCreating =
  ref(false)

const childrenError =
  ref('')


// =========================
// Form
// =========================

const form =
  ref({
    title: '',
    content: '',
    deadline: '',
    rewardAmount: 0,
    teenyScoreEnabled: true,
    verificationRequirement:
      'PHOTO_REQUIRED',
  })

const isPhotoRequired =
  computed(() =>
    form.value.verificationRequirement ===
    'PHOTO_REQUIRED'
  )

function togglePhotoRequired() {
  form.value.verificationRequirement =
    isPhotoRequired.value
      ? 'FREE'
      : 'PHOTO_REQUIRED'
}


// =========================
// 커스텀 달력
// =========================

const isCalendarOpen =
  ref(false)

const today =
  new Date()

const calendarYear =
  ref(
    today.getFullYear()
  )

const calendarMonth =
  ref(
    today.getMonth()
  )

const selectedDate =
  ref(null)

const selectedHour =
  ref('18')

const selectedMinute =
  ref('00')

const hourOptions =
  Array.from(
    { length: 24 },
    (_, hour) => String(hour).padStart(2, '0')
  )

const minuteOptions =
  ['00', '10', '20', '30', '40', '50']

const openTimeMenu =
  ref(null)

function toggleTimeMenu(menu) {
  openTimeMenu.value =
    openTimeMenu.value === menu
      ? null
      : menu
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


const daysInMonth =
  computed(() => {

    return new Date(
      calendarYear.value,
      calendarMonth.value + 1,
      0
    ).getDate()
  })


const firstDayOfMonth =
  computed(() => {

    return new Date(
      calendarYear.value,
      calendarMonth.value,
      1
    ).getDay()
  })


function openCalendar() {

  if (
    form.value.deadline
  ) {

    const date =
      new Date(
        form.value.deadline
      )

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      selectedDate.value =
        new Date(date)

      calendarYear.value =
        date.getFullYear()

      calendarMonth.value =
        date.getMonth()

      selectedHour.value =
        String(
          date.getHours()
        ).padStart(
          2,
          '0'
        )

      selectedMinute.value =
        String(
          date.getMinutes()
        ).padStart(
          2,
          '0'
        )
    }

  } else {

    /*
     * 처음 달력을 열면
     * 오늘 날짜를 기본 선택
     */
    const now =
      new Date()

    selectedDate.value =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )

    calendarYear.value =
      now.getFullYear()

    calendarMonth.value =
      now.getMonth()

    snapTimeToFuture()
  }

  isCalendarOpen.value =
    true
}


function closeCalendar() {

  isCalendarOpen.value =
    false

  openTimeMenu.value =
    null
}


function previousMonth() {

  if (
    calendarMonth.value === 0
  ) {

    calendarMonth.value = 11

    calendarYear.value--

  } else {

    calendarMonth.value--
  }
}


function nextMonth() {

  if (
    calendarMonth.value === 11
  ) {

    calendarMonth.value = 0

    calendarYear.value++

  } else {

    calendarMonth.value++
  }
}


function selectDay(
  day
) {

  selectedDate.value =
    new Date(
      calendarYear.value,
      calendarMonth.value,
      day
    )

  snapTimeToFuture()
}


function isSelectedDay(
  day
) {

  if (
    !selectedDate.value
  ) {
    return false
  }

  return (
    selectedDate.value.getFullYear() ===
      calendarYear.value &&

    selectedDate.value.getMonth() ===
      calendarMonth.value &&

    selectedDate.value.getDate() ===
      day
  )
}


function isToday(
  day
) {

  const now =
    new Date()

  return (
    now.getFullYear() ===
      calendarYear.value &&

    now.getMonth() ===
      calendarMonth.value &&

    now.getDate() ===
      day
  )
}


function isPastDay(
  day
) {
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
  slot.setHours(
    Number(selectedHour.value),
    Number(minuteValue),
    0,
    0
  )

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

  if (
    !selectedDate.value
  ) {
    return
  }

  const date =
    new Date(
      selectedDate.value
    )

  date.setHours(
    Number(
      selectedHour.value
    ),

    Number(
      selectedMinute.value
    ),

    0,
    0
  )

  snapTimeToFuture()

  date.setHours(
    Number(selectedHour.value),
    Number(selectedMinute.value),
    0,
    0
  )

  /*
   * 현재 시각보다 과거인 기한만 막는다.
   * 당일은 현재 시각 이후면 허용한다.
   */
  if (
    date.getTime() <
    Date.now()
  ) {

    alertModal.showAlert(
      '현재 시간 이후의 기한을 선택해주세요.'
    )

    return
  }

  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    )

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )

  const hour =
    String(
      date.getHours()
    ).padStart(
      2,
      '0'
    )

  const minute =
    String(
      date.getMinutes()
    ).padStart(
      2,
      '0'
    )

  form.value.deadline =
    `${year}-${month}-${day}T${hour}:${minute}`

  isCalendarOpen.value =
    false
}


function formatDeadline(
  value
) {

  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  return `${
    date.getFullYear()
  }년 ${
    date.getMonth() + 1
  }월 ${
    date.getDate()
  }일 · ${
    String(
      date.getHours()
    ).padStart(
      2,
      '0'
    )
  }:${
    String(
      date.getMinutes()
    ).padStart(
      2,
      '0'
    )
  }`
}


// 빠른 금액 선택
const quickAmounts = [
  {
    label: '+1,000',
    value: 1000,
  },

  {
    label: '+5,000',
    value: 5000,
  },

  {
    label: '+10,000',
    value: 10000,
  },
]



// 선택된 자녀 정보

const selectedChildren =
  computed(() => {

    return children.value.filter(
      child =>
        selectedChildIds.value.includes(
          child.id
        )
    )
  })


// =========================
// 생성 버튼 활성화
// =========================

const canSubmit =
  computed(() => {

    return (
      selectedChildIds.value.length > 0 &&

      form.value.title.trim() &&
      form.value.title.trim().length <= 50 &&

      form.value.content.trim() &&
      form.value.content.trim().length <= 500 &&

      form.value.deadline &&

      Number(
        form.value.rewardAmount
      ) >= 0
    )
  })


// 자녀 목록 조회

async function loadChildren() {

  if (
    !authStore.accessToken
  ) {

    childrenError.value =
      '로그인이 필요합니다.'

    return
  }

  isChildrenLoading.value =
    true

  childrenError.value =
    ''

  try {

    const res =
      await getChildren(
        authStore.accessToken
      )

    console.log(
      '자녀 목록 응답:',
      res
    )

    if (
      res.success
    ) {

      const childList =
        Array.isArray(
          res.data
        )
          ? res.data
          : res.data?.children ||
            []

      children.value =
        childList.map(
          child => ({
            id:
              child.childId ??
              child.id,

            name:
              child.name,

            profileImageUrl: CHILD_PROFILE_IMAGE,
          })
        )

      console.log(
        '변환된 자녀 목록:',
        children.value
      )
    }

  } catch (error) {

    console.error(
      '자녀 목록 불러오기 실패:',
      error
    )

    childrenError.value =
      error.message ||
      '자녀 정보를 불러오지 못했습니다.'

  } finally {

    isChildrenLoading.value =
      false
  }
}


// =========================
// 페이지 진입
// =========================

onMounted(() => {

  loadChildren()
})


// =========================
// 자녀 모달
// =========================

function openChildModal() {

  childrenError.value =
    ''

  isChildModalOpen.value =
    true

  if (
    children.value.length === 0
  ) {

    loadChildren()
  }
}


function closeChildModal() {

  isChildModalOpen.value =
    false
}



// 자녀 선택
function toggleChild(
  id
) {

  if (
    selectedChildIds.value.includes(
      id
    )
  ) {

    selectedChildIds.value =
      selectedChildIds.value.filter(
        childId =>
          childId !== id
      )

  } else {

    selectedChildIds.value.push(
      id
    )
  }
}


// 금액
function addAmount(
  value
) {

  form.value.rewardAmount =
    (
      Number(
        form.value.rewardAmount
      ) || 0
    ) + value
}


// 퀘스트 생성
async function handleCreate() {

  if (
    !canSubmit.value ||
    isCreating.value
  ) {
    return
  }

  isCreating.value = true

  try {

    const questData = {

      childIds:
        selectedChildIds.value,

      title:
        form.value.title.trim(),

      content:
        form.value.content.trim(),

      // 서버의 deadline은 LocalDateTime(타임존 없음)이다. toISOString()으로 UTC로
      // 바꿔 보내면 Jackson이 끝의 Z를 조용히 떼어내고 앞부분만 파싱해서, KST 기준
      // 9시간 앞당겨진 기한이 저장된다. 달력이 넣어준 값이 이미 로컬 벽시계
      // (YYYY-MM-DDTHH:mm)이므로 변환 없이 그대로 보낸다.
      deadline:
        form.value.deadline,

      rewardAmount:
        Number(
          form.value.rewardAmount
        ),

      teenyScoreEnabled:
        form.value.teenyScoreEnabled,

      verificationRequirement:
        form.value.verificationRequirement,
    }

    console.log(
      '퀘스트 생성 요청:',
      questData
    )

    const res =
      await createQuest(
        questData,
        authStore.accessToken
      )

    console.log(
      '퀘스트 생성 응답:',
      res
    )

    if (
      res.success
    ) {

      alertModal.showAlert(
        '퀘스트가 생성됐어요!'
      )

      router.back()
    }

  } catch (error) {

    console.error(
      '퀘스트 생성 실패:',
      error
    )

    alertModal.showAlert(
      error.message ||
      '퀘스트 생성에 실패했습니다.'
    )

  } finally {

    isCreating.value =
      false
  }
}
</script>


<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;

  margin: 0 auto;

  display: flex;
  flex-direction: column;

  padding-bottom: 80px;

  background: #f8fafc;
}


/* =========================
   헤더
========================= */

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 20px;

  border-bottom:
    1px solid #f0f1f3;

  background: #ffffff;
}

.close-btn {
  padding: 0;

  border: none;

  background: transparent;

  color: #191b1e;

  font-size: 18px;

  cursor: pointer;
}

.alarm-btn {
  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

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


/* =========================
   컨텐츠
========================= */

.content {
  display: flex;
  flex-direction: column;

  gap: 16px;

  padding: 20px 16px;
}

.section {
  padding: 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 0 0 10px;

  color: #8b9097;

  font-size: 13px;
  font-weight: 600;
}

.char-count {
  color: #b0b4ba;

  font-size: 12px;
  font-weight: 500;
}


/* =========================
   자녀 선택
========================= */

.child-select-box {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 56px;

  box-sizing: border-box;

  padding: 10px 14px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 10px;

  background: #ffffff;

  cursor: pointer;
}

.child-select-placeholder {
  flex: 1;

  color: #b9bec5;

  text-align: left;

  font-size: 14px;
}

.selected-child-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;

  gap: 7px;
}

.selected-child {
  display: flex;
  align-items: center;

  gap: 5px;

  padding:
    4px 8px 4px 4px;

  border:
    1px solid #e7e7e7;

  border-radius: 20px;

  background: #ffffff;
}

.selected-child-avatar {
  width: 26px;
  height: 26px;

  border-radius: 50%;

  object-fit: contain;
  background-color: #f4f5f7;
}

.selected-child-name {
  color: #191b1e;

  font-size: 12px;
  font-weight: 600;
}

.select-arrow {
  margin-left: 10px;

  color: #8b9097;

  font-size: 25px;
}


/* =========================
   기본 Input
========================= */

.input,
.textarea {
  width: 100%;

  box-sizing: border-box;

  padding: 14px 16px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 10px;

  outline: none;

  background: #ffffff;

  color: #191b1e;

  font-family: inherit;

  font-size: 14px;
}

.input:focus,
.textarea:focus {
  border-color: #ffbc00;
}

.input::placeholder,
.textarea::placeholder {
  color: #b9bec5;
}

.textarea {
  resize: none;

  line-height: 1.6;
}


/* =========================
   기한 입력
========================= */

.custom-date-input {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 50px;

  box-sizing: border-box;

  padding: 0 15px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 10px;

  background: #ffffff;

  color: #191b1e;

  font-size: 14px;

  text-align: left;

  cursor: pointer;
}

.custom-date-input:hover {
  border-color: #d4d6da;
}

.date-placeholder {
  color: #b9bec5;
}

.calendar-icon {
  width: 21px;
  height: 21px;

  flex-shrink: 0;

  color: #8b9097;
}


/* =========================
   금액
========================= */

.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  padding: 14px 16px;

  margin-bottom: 12px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 10px;

  background: #ffffff;
}

.amount-wrap:focus-within {
  border-color: #ffbc00;
}

.amount-input {
  flex: 1;

  border: none;
  outline: none;

  background: transparent;

  color: #191b1e;

  text-align: right;

  font-size: 20px;
  font-weight: 700;
}

.won {
  color: #191b1e;

  font-size: 16px;
  font-weight: 600;
}

.quick-btns {
  display: flex;

  gap: 8px;
}

.quick-btn {
  flex: 1;

  height: 36px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 20px;

  background: #ffffff;

  color: #191b1e;

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
}

.quick-btn:active {
  border-color: #ffbc00;

  background: #fff9e8;
}

.reset-btn {
  color: #8b9097;
}


/* =========================
   신뢰도
========================= */

.teeny-score-row {
  display: flex;
  align-items: center;

  gap: 12px;

  width: 100%;

  box-sizing: border-box;

  padding: 14px 14px 14px 12px;

  border: 1.5px solid #e8eaee;

  border-radius: 14px;

  background: #ffffff;

  text-align: left;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.teeny-score-row.on {
  border-color: #ffd66a;

  background: linear-gradient(
    180deg,
    #fff8e1 0%,
    #fffdf6 100%
  );

  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.12);
}

.option-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-divider {
  display: none;
}

.teeny-score-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border-radius: 12px;

  background: #f4f5f7;

  color: #8b9097;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.teeny-score-row.on .teeny-score-icon {
  background: #ffbc00;

  color: #191b1e;
}

.teeny-score-icon svg {
  width: 22px;
  height: 22px;
}

.teeny-score-text {
  flex: 1;

  min-width: 0;
}

.teeny-score-title-row {
  display: flex;
  align-items: center;

  gap: 6px;
}

.teeny-score-title {
  margin: 0;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;
}

.teeny-score-badge {
  padding: 2px 7px;

  border-radius: 999px;

  background: #f0f1f3;

  color: #8b9097;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: -0.2px;
}

.teeny-score-row.on .teeny-score-badge {
  background: #ffbc00;

  color: #191b1e;
}

.teeny-score-desc {
  margin: 4px 0 0;

  color: #8b9097;

  font-size: 12px;

  line-height: 1.4;
}

.teeny-score-switch {
  position: relative;

  width: 44px;
  height: 26px;

  flex-shrink: 0;

  border-radius: 26px;

  background: #e7e9ec;

  transition: background 0.25s ease;
}

.teeny-score-row.on .teeny-score-switch {
  background: #ffbc00;
}

.teeny-score-knob {
  position: absolute;

  top: 3px;
  left: 3px;

  width: 20px;
  height: 20px;

  border-radius: 50%;

  background: #ffffff;

  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);

  transition: transform 0.25s ease;
}

.teeny-score-row.on .teeny-score-knob {
  transform: translateX(18px);
}


/* =========================
   생성 버튼
========================= */

.submit-btn {
  width: 100%;
  height: 49px;

  border: none;

  border-radius: 10px;

  background: #ffbc00;

  color: #191b1e;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

.submit-notice {
  margin: 0;

  color: #8b9097;

  text-align: center;

  font-size: 12px;
}


/* =========================
   자녀 Bottom Sheet
========================= */

.modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 1000;

  display: flex;
  align-items: flex-end;
  justify-content: center;

  background:
    rgba(
      0,
      0,
      0,
      0.35
    );
}

.bottom-sheet {
  width: 100%;
  max-width: 360px;

  box-sizing: border-box;

  max-height: 70vh;

  padding:
    10px 20px 28px;

  overflow-y: auto;

  border-radius:
    20px 20px 0 0;

  background: #ffffff;
}

.sheet-handle {
  width: 40px;
  height: 4px;

  margin:
    0 auto 20px;

  border-radius: 20px;

  background: #d7d9dd;
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 28px;
}

.sheet-title {
  margin: 0 0 5px;

  color: #191b1e;

  font-size: 19px;
  font-weight: 700;
}

.sheet-description {
  margin: 0;

  color: #8b9097;

  font-size: 13px;
}

.sheet-close-btn {
  border: none;

  background: transparent;

  color: #8b9097;

  font-size: 26px;

  cursor: pointer;
}

.modal-state {
  padding: 30px 10px;

  color: #8b9097;

  text-align: center;

  font-size: 14px;
}

.modal-error {
  color: #e34b4b;
}

.modal-child-list {
  display: flex;
  flex-direction: column;

  gap: 8px;

  margin-top: 4px;
  margin-bottom: 20px;
}

.modal-child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  min-height: 62px;

  padding: 10px 12px;

  border:
    1.5px solid #e7e7e7;

  border-radius: 12px;

  background: #ffffff;

  cursor: pointer;
}

.modal-child-item.selected {
  border-color: #ffbc00;

  background: #fff9e7;
}

.modal-child-left {
  display: flex;
  align-items: center;

  gap: 12px;
}

.modal-avatar {
  width: 40px;
  height: 40px;

  overflow: hidden;

  border-radius: 50%;

  background: #eeeeee;
}

.modal-avatar-img {
  width: 100%;
  height: 100%;

  object-fit: contain;
  background-color: #f4f5f7;
}

.modal-child-name {
  color: #191b1e;

  font-size: 15px;
  font-weight: 600;
}

.check-circle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  border:
    2px solid #d7d9dd;

  border-radius: 50%;
}

.check-circle.checked {
  border-color: #ffbc00;

  background: #ffbc00;
}

.check-mark {
  color: #ffffff;

  font-size: 13px;
  font-weight: 700;
}

.modal-confirm-btn {
  width: 100%;
  height: 50px;

  border: none;

  border-radius: 10px;

  background: #ffbc00;

  color: #191b1e;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;
}

.modal-confirm-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}


/* =========================
   달력 모달
========================= */

.calendar-overlay {
  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(
      0,
      0,
      0,
      0.35
    );
}

.calendar-modal {
  width: 100%;
  max-width: 330px;

  box-sizing: border-box;

  padding: 22px 20px 20px;

  border:
    1px solid #e5e5e5;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 12px 30px
    rgba(
      0,
      0,
      0,
      0.12
    );
}


/* 달력 헤더 */

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


/* 월 이동 */

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

  border:
    1px solid #eeeeee;

  border-radius: 50%;

  background: #ffffff;

  color: #555b63;

  font-size: 24px;

  cursor: pointer;
}


/* 요일 */

.calendar-weekdays {
  display: grid;

  grid-template-columns:
    repeat(
      7,
      1fr
    );

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


/* 날짜 */

.calendar-grid {
  display: grid;

  grid-template-columns:
    repeat(
      7,
      1fr
    );

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

  border:
    1px solid transparent;

  border-radius: 50%;

  background: transparent;

  color: #303236;

  font-size: 13px;
  font-weight: 500;

  cursor: pointer;
}

.calendar-day:hover:not(
  .disabled
):not(
  .selected
) {
  background: #fff8df;
}

.calendar-day.today:not(
  .selected
) {
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


/* =========================
   시간 선택
========================= */

.time-section {
  margin-top: 20px;

  padding-top: 17px;

  border-top:
    1px solid #eeeeee;
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


/* 선택 날짜 */

.selected-date-preview {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-top: 14px;

  padding: 11px 12px;

  border:
    1px solid #ffe7a7;

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


/* 달력 하단 */

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
  border:
    1px solid #e0e2e6;

  background: #ffffff;

  color: #555b63;
}

.calendar-confirm-btn {
  border:
    1px solid #ffbc00;

  background: #ffbc00;

  color: #191b1e;
}

.calendar-confirm-btn:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}
</style>