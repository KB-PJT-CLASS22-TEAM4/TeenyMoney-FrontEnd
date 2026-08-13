<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <div class="nav-title-wrap">
        <img
          src="@/assets/icons/icon-quest.svg"
          alt=""
          class="nav-icon-title"
        />
        <h1 class="nav-title">퀘스트</h1>
      </div>

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

    <!-- 탭 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content">
      <!-- 인증 대기 카드 -->
      <div
        v-if="pendingQuest"
        class="pending-card"
        @click="goToDetail(pendingQuest.questId)"
      >
        <div class="pending-top">
          <span class="pending-badge">
            인증대기
          </span>

          <span class="pending-time">
            {{
              formatTime(
                pendingQuest.endedAt ||
                pendingQuest.deadline
              )
            }}
          </span>
        </div>

        <p class="pending-child">
          {{ pendingQuest.child.name || '자녀' }}
        </p>

        <p class="pending-title">
          {{ pendingQuest.title }}
        </p>

        <button
          class="confirm-btn"
          type="button"
          @click.stop="goToDetail(pendingQuest.questId)"
        >
          인증 확인하기
        </button>
      </div>

      <!-- 퀘스트 목록 -->
      <div class="quest-section">
        <div class="quest-section-header">
          <p class="quest-section-title">
            {{ sectionTitle }}
          </p>

          <div class="quest-section-actions">
            <button
              class="icon-btn"
              type="button"
              aria-label="검색"
            >
              <img
                src="@/assets/icons/icon-search.svg"
                alt=""
              />
            </button>

            <button
              class="icon-btn"
              type="button"
              aria-label="필터"
            >
              <img
                src="@/assets/icons/icon-filter.svg"
                alt=""
              />
            </button>
          </div>
        </div>

        <!-- 로딩 -->
        <div
          v-if="isLoading"
          class="state-box"
        >
          불러오는 중입니다...
        </div>

        <!-- 에러 -->
        <div
          v-else-if="errorMessage"
          class="state-box error-text"
        >
          {{ errorMessage }}
        </div>

        <!-- 목록 -->
        <div v-else>
          <div
            v-if="displayQuests.length === 0"
            class="state-box"
          >
            {{ emptyMessage }}
          </div>

          <div
            v-for="quest in displayQuests"
            :key="quest.questId"
            class="quest-item"
            @click="handleQuestClick(quest)"
          >
            <div class="quest-item-left">
              <div class="quest-icon-wrap">
                <img
                  src="@/assets/logo.svg"
                  alt=""
                  class="quest-icon"
                />
              </div>

              <div class="quest-info">
                <div class="quest-meta">
                  <span class="quest-child">
                    {{ quest.child.name || '자녀' }}
                  </span>

                  <span class="quest-reward">
                    {{ formatReward(quest.rewardAmount) }}
                  </span>

                  <span
                    v-if="quest.status"
                    class="status-text"
                    :class="getStatusClass(quest.status)"
                  >
                    {{ getStatusLabel(quest.status) }}
                  </span>
                </div>

                <p class="quest-title">
                  {{ quest.title }}
                </p>

                <p class="quest-sub">
                  <template v-if="quest.teenyScoreEnabled">
                    티니점수 적용
                  </template>

                  <template
                    v-if="
                      quest.teenyScoreEnabled &&
                      quest.deadline
                    "
                  >
                    ·
                  </template>

                  <template v-if="quest.deadline">
                    기한: {{ formatDate(quest.deadline) }}
                  </template>
                </p>
              </div>
            </div>

            <img
              src="@/assets/icons/icon-chevron.svg"
              alt=""
              class="chevron-icon"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- + 버튼 -->
    <button
      class="fab"
      type="button"
      @click="goToCreate"
    >
      +
    </button>

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
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getQuests } from '@/api/quest'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const activeTab = ref('AVAILABLE')

const quests = ref([])

const nextCursor = ref(null)

const tabs = [
  {
    label: '시작 가능',
    value: 'AVAILABLE',
  },
  {
    label: '진행 중',
    value: 'ONGOING',
  },
  {
    label: '완료',
    value: 'COMPLETED',
  },
]

/* =========================
   인증 대기 퀘스트
========================= */

const pendingQuest = computed(() => {
  if (activeTab.value !== 'ONGOING') {
    return null
  }

  return (
    quests.value.find(
      quest => quest.status === 'PENDING'
    ) || null
  )
})

/* =========================
   일반 목록
========================= */

const displayQuests = computed(() => {
  if (activeTab.value === 'ONGOING') {
    return quests.value.filter(
      quest => quest.status !== 'PENDING'
    )
  }

  return quests.value
})

const sectionTitle = computed(() => {
  switch (activeTab.value) {
    case 'AVAILABLE':
      return '시작 가능한 퀘스트'

    case 'ONGOING':
      return '진행 중인 퀘스트'

    case 'COMPLETED':
      return '완료된 퀘스트'

    default:
      return '등록된 퀘스트'
  }
})

const emptyMessage = computed(() => {
  switch (activeTab.value) {
    case 'AVAILABLE':
      return '시작 가능한 퀘스트가 없습니다.'

    case 'ONGOING':
      return '진행 중인 퀘스트가 없습니다.'

    case 'COMPLETED':
      return '완료된 퀘스트가 없습니다.'

    default:
      return '퀘스트가 없습니다.'
  }
})

/* =========================
   탭 변경
========================= */

async function changeTab(tab) {
  if (activeTab.value === tab) {
    return
  }

  activeTab.value = tab

  quests.value = []
  nextCursor.value = null

  await loadQuests()
}

/* =========================
   목록 조회
========================= */

async function loadQuests() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    console.log(
      '퀘스트 조회 TAB:',
      activeTab.value
    )

    const res = await getQuests(
      authStore.accessToken,
      activeTab.value
    )

    console.log(
      '퀘스트 목록 전체 응답:',
      res
    )

    if (!res.success) {
      throw new Error(
        res.message ||
        '퀘스트 목록 조회에 실패했습니다.'
      )
    }

    /**
     * 명세서 구조:
     *
     * data: {
     *   items: [],
     *   nextCursor: "..."
     * }
     */
    quests.value =
      Array.isArray(res.data?.items)
        ? res.data.items
        : []

    nextCursor.value =
      res.data?.nextCursor || null

    console.log(
      '퀘스트 items:',
      quests.value
    )

    console.log(
      'nextCursor:',
      nextCursor.value
    )

    console.log(
      'PENDING 퀘스트:',
      pendingQuest.value
    )
  } catch (error) {
    console.error(
      '퀘스트 목록 불러오기 실패:',
      error
    )

    quests.value = []

    errorMessage.value =
      error.message ||
      '퀘스트 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

/* =========================
   퀘스트 클릭
========================= */

function handleQuestClick(quest) {
  if (!quest.questId) {
    console.error(
      'questId가 없습니다.',
      quest
    )

    alert(
      '퀘스트 정보를 찾을 수 없습니다.'
    )

    return
  }

  /**
   * 목록 응답에는 verificationId가 없음.
   *
   * 따라서 PENDING이라고 바로
   * verification 상세 URL을 만들 수 없음.
   *
   * 우선 일반 퀘스트 상세로 이동 후
   * 상세 API에서 verificationId를 받아야 함.
   */
  goToDetail(quest.questId)
}

/* =========================
   상세
========================= */

function goToDetail(questId) {
  router.push(
    `/parents/quest/${questId}`
  )
}

/* =========================
   생성
========================= */

function goToCreate() {
  router.push(
    '/parents/quest/create'
  )
}

/* =========================
   시간
========================= */

function formatTime(dateStr) {
  if (!dateStr) {
    return ''
  }

  const date =
    new Date(dateStr)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const hours =
    date.getHours()

  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      '0'
    )

  const period =
    hours >= 12
      ? '오후'
      : '오전'

  const formattedHour =
    hours % 12 === 0
      ? 12
      : hours % 12

  return `${period} ${formattedHour}:${minutes}`
}

/* =========================
   날짜
========================= */

function formatDate(dateStr) {
  if (!dateStr) {
    return ''
  }

  const date =
    new Date(dateStr)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateStr
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

  return `${year}.${month}.${day}`
}

/* =========================
   금액
========================= */

function formatReward(rewardAmount) {
  if (
    rewardAmount === null ||
    rewardAmount === undefined
  ) {
    return '0원'
  }

  return `${Number(
    rewardAmount
  ).toLocaleString()}원`
}

/* =========================
   상태 라벨
========================= */

function getStatusLabel(status) {
  const labels = {
    AVAILABLE: '시작 가능',
    IN_PROGRESS: '진행 중',
    PENDING: '인증 대기',
    COMPLETED: '완료',
    FAILED: '실패',
    EXPIRED: '기간 만료',
    DECLINED: '반려',
  }

  return labels[status] || status
}

/* =========================
   상태 CSS
========================= */

function getStatusClass(status) {
  switch (status) {
    case 'AVAILABLE':
      return 'status-available'

    case 'IN_PROGRESS':
      return 'status-progress'

    case 'PENDING':
      return 'status-pending'

    case 'COMPLETED':
      return 'status-completed'

    case 'FAILED':
    case 'EXPIRED':
    case 'DECLINED':
      return 'status-failed'

    default:
      return ''
  }
}

onMounted(() => {
  loadQuests()
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;

  background-color: #f4f5f7;

  display: flex;
  flex-direction: column;

  padding-bottom: 90px;
}

/* 헤더 */

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 20px;

  background-color: #ffffff;
}

.nav-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon-title {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;

  font-size: 18px;
  font-weight: 700;

  color: #191b1e;
}

.alarm-btn {
  padding: 0;

  background: transparent;
  border: none;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.alarm-icon {
  width: 24px;
  height: 24px;
}

/* 탭 */

.tabs {
  display: flex;

  background-color: #ffffff;

  border-bottom:
    1px solid #f0f1f3;
}

.tab {
  flex: 1;

  height: 44px;

  border: none;
  border-bottom:
    2px solid transparent;

  background: transparent;

  font-size: 14px;
  font-weight: 600;

  color: #8b9097;

  cursor: pointer;
}

.tab.active {
  color: #ffbc00;

  border-bottom-color:
    #ffbc00;
}

/* Content */

.content {
  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 16px;
}

/* 인증 대기 */

.pending-card {
  padding: 16px;

  background-color: #ffbc00;

  border-radius: 16px;

  display: flex;
  flex-direction: column;

  gap: 6px;

  cursor: pointer;
}

.pending-card:active {
  transform: scale(0.99);
}

.pending-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pending-badge {
  padding: 3px 8px;

  background-color:
    rgba(0, 0, 0, 0.1);

  border-radius: 20px;

  font-size: 12px;
  font-weight: 700;

  color: #191b1e;
}

.pending-time {
  font-size: 12px;

  color: #191b1e;
}

.pending-child {
  margin: 0;

  font-size: 12px;

  color: #191b1e;

  opacity: 0.7;
}

.pending-title {
  margin: 0;

  font-size: 16px;
  font-weight: 700;

  color: #191b1e;
}

.confirm-btn {
  width: 100%;
  height: 38px;

  margin-top: 6px;

  border: none;
  border-radius: 8px;

  background-color: #ffffff;

  font-size: 13px;
  font-weight: 700;

  color: #191b1e;

  cursor: pointer;
}

/* 퀘스트 섹션 */

.quest-section {
  background-color: #ffffff;

  border-radius: 16px;

  overflow: hidden;
}

.quest-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 16px;

  border-bottom:
    1px solid #f0f1f3;
}

.quest-section-title {
  margin: 0;

  font-size: 14px;
  font-weight: 700;

  color: #191b1e;
}

.quest-section-actions {
  display: flex;

  gap: 8px;
}

.icon-btn {
  padding: 4px;

  background: transparent;

  border: none;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn img {
  width: 20px;
  height: 20px;
}

/* 퀘스트 */

.quest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 16px;

  border-bottom:
    1px solid #f0f1f3;

  cursor: pointer;
}

.quest-item:last-child {
  border-bottom: none;
}

.quest-item:active {
  background-color: #fafafa;
}

.quest-item-left {
  flex: 1;

  display: flex;
  align-items: center;

  gap: 12px;

  min-width: 0;
}

.quest-icon-wrap {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  border-radius: 8px;

  background-color: #f4f5f7;

  display: flex;
  align-items: center;
  justify-content: center;
}

.quest-icon {
  width: 20px;
  height: 20px;
}

.quest-info {
  min-width: 0;
  flex: 1;
}

.quest-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 6px;

  margin-bottom: 2px;
}

.quest-child {
  font-size: 11px;
  color: #8b9097;
}

.quest-reward {
  font-size: 11px;
  font-weight: 700;

  color: #ffbc00;
}

.status-text {
  padding: 2px 6px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 700;
}

.status-available {
  color: #5970e8;
  background-color: #eef1ff;
}

.status-progress {
  color: #1d8b55;
  background-color: #e9f8f0;
}

.status-pending {
  color: #b17600;
  background-color: #fff4cc;
}

.status-completed {
  color: #555b63;
  background-color: #f0f1f3;
}

.status-failed {
  color: #d94a4a;
  background-color: #fff0f0;
}

.quest-title {
  margin: 0 0 2px;

  font-size: 14px;
  font-weight: 700;

  color: #191b1e;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quest-sub {
  margin: 0;

  font-size: 11px;

  color: #8b9097;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  width: 18px;
  height: 18px;

  margin-left: 8px;

  flex-shrink: 0;
}

/* 상태 */

.state-box {
  padding: 30px 20px;

  text-align: center;

  color: #8b9097;

  font-size: 14px;
}

.error-text {
  color: #ff3b30;
}

/* FAB */

.fab {
  position: fixed;

  bottom: 90px;

  right:
    calc(50% - 160px);

  width: 52px;
  height: 52px;

  border-radius: 50%;

  border: none;

  background-color: #ffbc00;

  font-size: 28px;

  color: #191b1e;

  cursor: pointer;

  box-shadow:
    0 4px 12px
    rgba(0, 0, 0, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;
}

/* 하단 nav */

.bottom-nav {
  position: fixed;

  bottom: 0;
  left: 50%;

  transform:
    translateX(-50%);

  width: 360px;

  display: flex;
  justify-content: space-around;

  padding: 10px 0 20px;

  background-color: #ffffff;

  border-top:
    1px solid #f0f1f3;
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

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;

  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #ffbc00;

  font-weight: 700;
}
</style>