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
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content">

      <!-- 인증 대기 카드 -->
      <div
        v-if="pendingQuest"
        class="pending-card"
        @click="goToApproval(pendingQuest)"
      >
        <div class="pending-top">
          <span class="pending-badge">
            인증대기
          </span>

          <span class="pending-time">
            {{ formatTime(pendingQuest.completedAt) }}
          </span>
        </div>

        <p class="pending-child">
          {{ pendingQuest.childName }}
        </p>

        <p class="pending-title">
          {{ pendingQuest.title }}
        </p>

        <button
          class="confirm-btn"
          type="button"
          @click.stop="goToApproval(pendingQuest)"
        >
          인증 확인하기
        </button>
      </div>

      <!-- 등록된 퀘스트 -->
      <div class="quest-section">

        <div class="quest-section-header">
          <p class="quest-section-title">
            등록된 퀘스트
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

          <!-- 데이터 없음 -->
          <div
            v-if="filteredQuests.length === 0"
            class="state-box"
          >
            해당하는 퀘스트가 없습니다.
          </div>

          <!-- 퀘스트 목록 -->
          <div
            v-for="quest in filteredQuests"
            :key="quest.id"
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
                    {{ quest.childName }}
                  </span>

                  <span class="quest-reward">
                    {{ formatReward(quest.reward) }}
                  </span>
                </div>

                <p class="quest-title">
                  {{ quest.title }}
                </p>

                <p class="quest-sub">
                  신뢰점수 +{{ quest.trustScore || 0 }}
                  <template v-if="quest.dueDate">
                    · 기한: {{ quest.dueDate }}
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

/* =========================
   상태
========================= */

const isLoading = ref(false)
const errorMessage = ref('')

const activeTab = ref('available')

const quests = ref([])

/**
 * 부모가 승인/반려해야 하는 인증 요청
 */
const pendingQuest = ref(null)

/* =========================
   탭
========================= */

const tabs = [
  {
    label: '시작 가능',
    value: 'available',
  },
  {
    label: '진행 중',
    value: 'in_progress',
  },
  {
    label: '완료',
    value: 'completed',
  },
]

/* =========================
   퀘스트 필터
========================= */

const filteredQuests = computed(() => {
  return quests.value.filter(
    quest => quest.status === activeTab.value
  )
})

/* =========================
   날짜 / 금액 표시
========================= */

function formatTime(dateStr) {
  if (!dateStr) {
    return ''
  }

  const date = new Date(dateStr)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const hours = date.getHours()
  const minutes = String(
    date.getMinutes()
  ).padStart(2, '0')

  const period = hours >= 12 ? '오후' : '오전'

  const formattedHour =
    hours % 12 === 0
      ? 12
      : hours % 12

  return `${period} ${formattedHour}:${minutes}`
}

function formatReward(reward) {
  if (
    reward === null ||
    reward === undefined
  ) {
    return '0원'
  }

  return `${Number(reward).toLocaleString()}원`
}

/* =========================
   퀘스트 데이터 조회
========================= */

async function loadQuests() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await getQuests(
      authStore.accessToken
    )

    console.log(
      '퀘스트 목록 응답:',
      res
    )

    if (!res.success) {
      throw new Error(
        res.message ||
        '퀘스트 목록 조회에 실패했습니다.'
      )
    }

    /**
     * API 응답 data가 배열이라는 전제
     */
    quests.value =
      Array.isArray(res.data)
        ? res.data
        : []

    console.log(
      '퀘스트 목록:',
      quests.value
    )

    /**
     * 인증/승인 대기 상태의 퀘스트 찾기
     *
     * 기존 프론트에서 사용하던
     * pending_approval 상태를 우선 사용한다.
     */
    pendingQuest.value =
      quests.value.find(
        quest =>
          quest.status ===
          'pending_approval'
      ) || null

    console.log(
      '인증 대기 퀘스트:',
      pendingQuest.value
    )
  } catch (error) {
    console.error(
      '퀘스트 목록 불러오기 실패:',
      error
    )

    errorMessage.value =
      error.message ||
      '퀘스트 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

/* =========================
   일반 퀘스트 클릭
========================= */

function handleQuestClick(quest) {
  /**
   * 만약 인증 대기 상태라면
   * 일반 상세가 아니라 인증 상세로 이동
   */
  if (
    quest.status ===
    'pending_approval'
  ) {
    goToApproval(quest)
    return
  }

  goToDetail(quest.id)
}

/* =========================
   일반 퀘스트 상세
========================= */

function goToDetail(questId) {
  router.push(
    `/parents/quest/${questId}`
  )
}

/* =========================
   퀘스트 생성
========================= */

function goToCreate() {
  router.push(
    '/parents/quest/create'
  )
}

/* =========================
   인증 상세
========================= */

function goToApproval(quest) {
  console.log(
    '인증 상세 이동 퀘스트:',
    quest
  )

  /**
   * API 응답에 따라
   *
   * verificationId
   *
   * 또는
   *
   * verification.id
   *
   * 형태일 수도 있어서
   * 둘 다 처리
   */
  const verificationId =
    quest.verificationId ??
    quest.verification?.id

  /**
   * quest.id 대신
   * quest.questId로 내려오는 경우까지 대응
   */
  const questId =
    quest.id ??
    quest.questId

  if (!questId) {
    console.error(
      'questId가 없습니다.',
      quest
    )

    alert(
      '퀘스트 정보를 찾을 수 없습니다.'
    )

    return
  }

  if (!verificationId) {
    console.error(
      'verificationId가 없습니다.',
      quest
    )

    alert(
      '퀘스트 인증 정보를 찾을 수 없습니다.'
    )

    return
  }

  console.log(
    'questId:',
    questId
  )

  console.log(
    'verificationId:',
    verificationId
  )

  /**
   * 인증 상세 화면으로 이동
   *
   * 예:
   * /parents/quest/10/verifications/23
   */
  router.push(
    `/parents/quest/${questId}/verifications/${verificationId}`
  )
}

/* =========================
   mounted
========================= */

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

/* =========================
   헤더
========================= */

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

/* =========================
   탭
========================= */

.tabs {
  display: flex;

  background-color: #ffffff;

  border-bottom: 1px solid #f0f1f3;
}

.tab {
  flex: 1;

  height: 44px;

  border: none;
  border-bottom: 2px solid transparent;

  background: transparent;

  font-size: 14px;
  font-weight: 600;

  color: #8b9097;

  cursor: pointer;
}

.tab.active {
  color: #ffbc00;

  border-bottom-color: #ffbc00;
}

/* =========================
   Content
========================= */

.content {
  display: flex;
  flex-direction: column;

  gap: 12px;

  padding: 16px;
}

/* =========================
   인증 대기 카드
========================= */

.pending-card {
  padding: 16px;

  background-color: #ffbc00;

  border-radius: 16px;

  display: flex;
  flex-direction: column;

  gap: 6px;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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

/* =========================
   퀘스트 섹션
========================= */

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

/* =========================
   퀘스트 Item
========================= */

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

/* =========================
   상태
========================= */

.state-box {
  padding: 30px 20px;

  text-align: center;

  color: #8b9097;

  font-size: 14px;
}

.error-text {
  color: #ff3b30;
}

/* =========================
   FAB
========================= */

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

/* =========================
   하단 Navigation
========================= */

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