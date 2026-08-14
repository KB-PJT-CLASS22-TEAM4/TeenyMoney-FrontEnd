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
          제목
        </p>

        <input
          v-model="form.title"
          type="text"
          class="input"
          placeholder="예: 방 청소하기, 일기 쓰기"
        />
      </div>


      <!-- =========================
           내용
      ========================== -->
      <div class="section">
        <p class="section-label">
          내용
        </p>

        <textarea
          v-model="form.content"
          class="textarea"
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
            지움
          </button>
        </div>
      </div>


      <!-- =========================
           신뢰도 점수
      ========================== -->
      <div class="section">
        <button
          class="teeny-score-row"
          type="button"
          @click="
            form.teenyScoreEnabled =
              !form.teenyScoreEnabled
          "
        >
          <div
            class="checkbox"
            :class="{
              checked:
                form.teenyScoreEnabled
            }"
          >
            <img
              v-if="
                form.teenyScoreEnabled
              "
              src="@/assets/icons/icon-check.svg"
              alt=""
              class="check-icon"
            />
          </div>

          <div class="teeny-score-text">
            <p class="teeny-score-title">
              신뢰도 점수 부여
            </p>

            <p class="teeny-score-desc">
              수행 완료 시 신뢰도 점수가 상승합니다.
            </p>
          </div>

          <img
            src="@/assets/icons/icon-shield.svg"
            alt=""
            class="shield-icon"
          />
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
        <div class="calendar-modal">

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

              <select
                v-model="selectedHour"
                class="time-select"
              >
                <option
                  v-for="hour in 24"
                  :key="hour - 1"
                  :value="
                    String(
                      hour - 1
                    ).padStart(
                      2,
                      '0'
                    )
                  "
                >
                  {{
                    String(
                      hour - 1
                    ).padStart(
                      2,
                      '0'
                    )
                  }}시
                </option>
              </select>

              <span class="time-colon">
                :
              </span>

              <select
                v-model="selectedMinute"
                class="time-select"
              >
                <option value="00">
                  00분
                </option>

                <option value="10">
                  10분
                </option>

                <option value="20">
                  20분
                </option>

                <option value="30">
                  30분
                </option>

                <option value="40">
                  40분
                </option>

                <option value="50">
                  50분
                </option>
              </select>

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
  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'

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
  }

  isCalendarOpen.value =
    true
}


function closeCalendar() {

  isCalendarOpen.value =
    false
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

  const date =
    new Date(
      calendarYear.value,
      calendarMonth.value,
      day
    )

  date.setHours(
    23,
    59,
    59,
    999
  )

  return (
    date <
    new Date()
  )
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

  /*
   * 오늘을 선택했는데
   * 이미 지난 시간을 선택한 경우 방지
   */
  if (
    date.getTime() <=
    Date.now()
  ) {

    alert(
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


// =========================
// 빠른 금액 선택
// =========================

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


// =========================
// 선택된 자녀 정보
// =========================

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

      form.value.content.trim() &&

      form.value.deadline &&

      Number(
        form.value.rewardAmount
      ) >= 0
    )
  })


// =========================
// 자녀 목록 조회
// =========================

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


// =========================
// 자녀 선택
// =========================

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


// =========================
// 금액
// =========================

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


// =========================
// 퀘스트 생성
// =========================

async function handleCreate() {

  if (
    !canSubmit.value ||
    isCreating.value
  ) {
    return
  }

  isCreating.value =
    true

  try {

    const questData = {

      childIds:
        selectedChildIds.value,

      title:
        form.value.title.trim(),

      content:
        form.value.content.trim(),

      deadline:
        new Date(
          form.value.deadline
        ).toISOString(),

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

      alert(
        '퀘스트가 생성됐어요!'
      )

      router.back()
    }

  } catch (error) {

    console.error(
      '퀘스트 생성 실패:',
      error
    )

    alert(
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

  background: #ffffff;
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

  gap: 20px;

  padding: 20px 16px;
}

.section-label {
  margin: 0 0 10px;

  color: #8b9097;

  font-size: 13px;
  font-weight: 600;
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

  padding: 14px 16px;

  border:
    1px solid #ffe397;

  border-radius: 12px;

  background: #fff8e1;

  text-align: left;

  cursor: pointer;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  flex-shrink: 0;

  border-radius: 6px;

  background: #f0f1f3;
}

.checkbox.checked {
  background: #ffbc00;
}

.check-icon {
  width: 14px;
  height: 14px;
}

.teeny-score-text {
  flex: 1;
}

.teeny-score-title {
  margin: 0 0 2px;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;
}

.teeny-score-desc {
  margin: 0;

  color: #8b9097;

  font-size: 12px;
}

.shield-icon {
  width: 20px;
  height: 20px;
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

  margin-bottom: 20px;
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

.time-select {
  flex: 1;

  height: 42px;

  padding: 0 10px;

  border:
    1px solid #e0e2e6;

  border-radius: 9px;

  outline: none;

  background: #ffffff;

  color: #191b1e;

  font-size: 13px;
}

.time-select:focus {
  border-color: #ffbc00;
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