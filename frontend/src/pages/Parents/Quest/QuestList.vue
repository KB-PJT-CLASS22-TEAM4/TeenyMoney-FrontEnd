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
      <div class="nav-title-wrap">
        <h1 class="nav-title">
          퀘스트
        </h1>
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

    <!-- 상태 탭 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{
          active: activeTab === tab.value
        }"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content">

      <!-- ================================
           검색창
      ================================= -->
      <div class="quest-search-wrap">
        <div class="quest-search-box">
          <img
            src="@/assets/icons/icon-search.svg"
            alt=""
            class="search-icon"
          />

          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="퀘스트 검색"
          />

          <button
            v-if="searchKeyword"
            type="button"
            class="search-clear-btn"
            aria-label="검색어 지우기"
            @click="searchKeyword = ''"
          >
            ×
          </button>
        </div>
      </div>

      <!-- ================================
           첫 번째 인증 대기 퀘스트 강조 카드
      ================================= -->
      <div
        v-if="pendingQuest && matchesSearch(pendingQuest)"
        class="pending-card"
      >
        <div
          class="pending-content"
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
            {{
              pendingQuest.child.name ||
              '자녀'
            }}
          </p>

          <p class="pending-title">
            {{ pendingQuest.title }}
          </p>

          <p class="pending-reward">
            {{
              formatReward(
                pendingQuest.rewardAmount
              )
            }}
          </p>
        </div>

        <!-- 승인 / 거절 -->
        <div class="pending-actions">
          <button
            type="button"
            class="reject-btn"
            :disabled="
              processingQuestId ===
              pendingQuest.questId
            "
            @click="
              openRejectModal(
                pendingQuest
              )
            "
          >
            거절
          </button>

          <button
            type="button"
            class="approve-btn"
            :disabled="
              processingQuestId ===
              pendingQuest.questId
            "
            @click="
              handleApprove(
                pendingQuest
              )
            "
          >
            {{
              processingQuestId ===
              pendingQuest.questId
                ? '처리 중...'
                : '승인'
            }}
          </button>
        </div>

        <button
          type="button"
          class="detail-btn"
          @click="
            goToDetail(
              pendingQuest.questId
            )
          "
        >
          상세보기
        </button>
      </div>

      <!-- ================================
           퀘스트 목록
      ================================= -->
      <div class="quest-section">

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
          <!-- 검색 결과 / 빈 목록 -->
          <div
            v-if="!hasVisibleQuests"
            class="state-box"
          >
            {{
              searchKeyword.trim()
                ? '검색 결과가 없습니다.'
                : emptyMessage
            }}
          </div>

          <div
            v-for="quest in displayQuests"
            :key="quest.questId"
            class="quest-item"
          >
            <!-- 상세 클릭 영역 -->
            <div
              class="quest-item-main"
              @click="
                goToDetail(
                  quest.questId
                )
              "
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
                      {{
                        quest.child.name ||
                        '자녀'
                      }}
                    </span>

                    <span class="quest-reward">
                      {{
                        formatReward(
                          quest.rewardAmount
                        )
                      }}
                    </span>

                    <span
                      v-if="quest.status"
                      class="status-text"
                      :class="
                        getStatusClass(
                          quest.status
                        )
                      "
                    >
                      {{
                        getStatusLabel(
                          quest.status
                        )
                      }}
                    </span>

                  </div>

                  <p class="quest-title">
                    {{ quest.title }}
                  </p>

                  <p class="quest-sub">

                    <template
                      v-if="
                        quest.teenyScoreEnabled
                      "
                    >
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

                    <template
                      v-if="quest.deadline"
                    >
                      기한:
                      {{
                        formatDate(
                          quest.deadline
                        )
                      }}
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

            <!-- PENDING이면 목록에서도 승인 / 거절 -->
            <div
              v-if="
                quest.status === 'PENDING'
              "
              class="list-actions"
            >
              <button
                type="button"
                class="list-reject-btn"
                :disabled="
                  processingQuestId ===
                  quest.questId
                "
                @click="
                  openRejectModal(
                    quest
                  )
                "
              >
                거절
              </button>

              <button
                type="button"
                class="list-approve-btn"
                :disabled="
                  processingQuestId ===
                  quest.questId
                "
                @click="
                  handleApprove(
                    quest
                  )
                "
              >
                {{
                  processingQuestId ===
                  quest.questId
                    ? '처리 중...'
                    : '승인'
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 퀘스트 생성 FAB -->
    <button
      class="fab"
      type="button"
      @click="goToCreate"
    >
      +
    </button>

    <ParentBottomNav active="quest" />

    <!-- ================================
         거절 사유 입력 모달
    ================================= -->
    <div
      v-if="isRejectModalOpen"
      class="modal-overlay"
      @click.self="closeRejectModal"
    >
      <div class="reject-modal">

        <div class="reject-modal-header">
          <h2 class="reject-modal-title">
            인증 거절 사유
          </h2>

          <button
            type="button"
            class="modal-close-btn"
            :disabled="
              processingQuestId !== null
            "
            @click="closeRejectModal"
          >
            ×
          </button>
        </div>

        <p class="reject-modal-description">
          {{
            rejectTargetQuest.child.name ||
            '자녀'
          }}에게 전달할 거절 사유를 입력해주세요.
        </p>

        <p
          v-if="
            rejectTargetQuest.title
          "
          class="reject-target-title"
        >
          {{ rejectTargetQuest.title }}
        </p>

        <textarea
          v-model="rejectionReason"
          class="reject-textarea"
          maxlength="200"
          rows="5"
          placeholder="예) 인증 사진에서 퀘스트 수행 여부를 확인하기 어려워요."
        ></textarea>

        <p class="reject-count">
          {{ rejectionReason.length }}/200
        </p>

        <div class="reject-modal-actions">

          <button
            type="button"
            class="reject-cancel-btn"
            :disabled="
              processingQuestId !== null
            "
            @click="closeRejectModal"
          >
            취소
          </button>

          <button
            type="button"
            class="reject-confirm-btn"
            :disabled="
              !rejectionReason.trim() ||
              processingQuestId !== null
            "
            @click="submitReject"
          >
            {{
              processingQuestId !== null
                ? '처리 중...'
                : '거절하기'
            }}
          </button>

        </div>
      </div>
    </div>
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
  getQuests,
  getQuestDetail,
  approveQuestVerification,
  rejectQuestVerification,
} from '@/api/quest'


const router =
  useRouter()

const authStore =
  useAuthStore()


/* =========================
   기본 상태
========================= */

const isLoading =
  ref(false)

const errorMessage =
  ref('')

const activeTab =
  ref('AVAILABLE')

const quests =
  ref([])

const nextCursor =
  ref(null)

const processingQuestId =
  ref(null)

/* =========================
   검색
========================= */

const searchKeyword =
  ref('')


/* =========================
   거절 모달
========================= */

const isRejectModalOpen =
  ref(false)

const rejectTargetQuest =
  ref(null)

const rejectionReason =
  ref('')


/* =========================
   탭
========================= */

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
   검색 판별
========================= */

function matchesSearch(
  quest
) {
  const keyword =
    searchKeyword.value
      .trim()
      .toLowerCase()

  if (!keyword) {
    return true
  }

  const title =
    String(
      quest?.title || ''
    ).toLowerCase()

  const childName =
    String(
      quest?.child?.name || ''
    ).toLowerCase()

  return (
    title.includes(keyword) ||
    childName.includes(keyword)
  )
}


/* =========================
   인증 대기
========================= */

const pendingQuest =
  computed(() => {

    if (
      activeTab.value !==
      'ONGOING'
    ) {
      return null
    }

    return (
      quests.value.find(
        quest =>
          quest.status ===
          'PENDING'
      ) || null
    )
  })


/* =========================
   화면에 표시할 목록
========================= */

const displayQuests =
  computed(() => {

    let list =
      pendingQuest.value
        ? quests.value.filter(
            quest =>
              quest.questId !==
              pendingQuest.value.questId
          )
        : quests.value

    const keyword =
      searchKeyword.value
        .trim()
        .toLowerCase()

    if (!keyword) {
      return list
    }

    return list.filter(
      quest => {

        const title =
          String(
            quest.title || ''
          ).toLowerCase()

        const childName =
          String(
            quest.child?.name || ''
          ).toLowerCase()

        return (
          title.includes(keyword) ||
          childName.includes(keyword)
        )
      }
    )
  })


/* =========================
   현재 화면에 표시되는
   퀘스트가 있는지
========================= */

const hasVisibleQuests =
  computed(() => {

    const hasPending =
      pendingQuest.value &&
      matchesSearch(
        pendingQuest.value
      )

    return (
      Boolean(hasPending) ||
      displayQuests.value.length > 0
    )
  })


/* =========================
   빈 데이터 메시지
========================= */

const emptyMessage =
  computed(() => {

    switch (
      activeTab.value
    ) {

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

async function changeTab(
  tab
) {
  if (
    activeTab.value === tab
  ) {
    return
  }

  activeTab.value =
    tab

  // 탭 이동 시 검색어 초기화
  searchKeyword.value =
    ''

  quests.value =
    []

  nextCursor.value =
    null

  closeRejectModal()

  await loadQuests()
}


/* =========================
   목록 조회
========================= */

async function loadQuests() {

  isLoading.value =
    true

  errorMessage.value =
    ''

  try {

    const res =
      await getQuests(
        authStore.accessToken,
        activeTab.value
      )

    console.log(
      '퀘스트 목록:',
      res
    )

    quests.value =
      Array.isArray(
        res.data?.items
      )
        ? res.data.items
        : []

    nextCursor.value =
      res.data?.nextCursor ??
      null

  } catch (error) {

    console.error(
      '퀘스트 목록 조회 실패:',
      error
    )

    quests.value =
      []

    errorMessage.value =
      error.message ||
      '퀘스트 목록을 불러오지 못했습니다.'

  } finally {

    isLoading.value =
      false
  }
}


/* =========================
   상세 API에서
   verificationId 가져오기
========================= */

async function findVerificationId(
  questId
) {

  const res =
    await getQuestDetail(
      questId,
      authStore.accessToken
    )

  console.log(
    '인증 처리 상세 응답:',
    res
  )

  const verificationId =
    res.data
      ?.latestVerification
      ?.verificationId

  if (
    verificationId === null ||
    verificationId === undefined
  ) {

    console.error(
      'latestVerification:',
      res.data?.latestVerification
    )

    throw new Error(
      '인증 요청 정보를 찾을 수 없습니다.'
    )
  }

  return verificationId
}


/* =========================
   승인
========================= */

async function handleApprove(
  quest
) {

  if (
    processingQuestId.value !==
    null
  ) {
    return
  }

  if (
    quest?.questId === null ||
    quest?.questId === undefined
  ) {

    alert(
      '퀘스트 ID를 찾을 수 없습니다.'
    )

    return
  }

  if (
    !window.confirm(
      `"${quest.title}" 인증을 승인하시겠습니까?`
    )
  ) {
    return
  }

  processingQuestId.value =
    quest.questId

  try {

    const verificationId =
      await findVerificationId(
        quest.questId
      )

    console.log(
      '승인 questId:',
      quest.questId
    )

    console.log(
      '승인 verificationId:',
      verificationId
    )

    await approveQuestVerification(
      quest.questId,
      verificationId,
      authStore.accessToken
    )

    alert(
      '퀘스트 인증이 승인되었습니다.'
    )

    await loadQuests()

  } catch (error) {

    console.error(
      '승인 실패:',
      error
    )

    alert(
      error.message ||
      '퀘스트 인증 승인에 실패했습니다.'
    )

  } finally {

    processingQuestId.value =
      null
  }
}


/* =========================
   거절 모달 열기
========================= */

function openRejectModal(
  quest
) {

  if (
    processingQuestId.value !==
    null
  ) {
    return
  }

  if (
    !quest ||
    quest.questId === null ||
    quest.questId === undefined
  ) {

    alert(
      '퀘스트 정보를 찾을 수 없습니다.'
    )

    return
  }

  rejectTargetQuest.value =
    quest

  rejectionReason.value =
    ''

  isRejectModalOpen.value =
    true
}


/* =========================
   거절 모달 닫기
========================= */

function closeRejectModal() {

  if (
    processingQuestId.value !==
    null
  ) {
    return
  }

  isRejectModalOpen.value =
    false

  rejectTargetQuest.value =
    null

  rejectionReason.value =
    ''
}


/* =========================
   실제 거절 처리
========================= */

async function submitReject() {

  if (
    processingQuestId.value !==
    null
  ) {
    return
  }

  const quest =
    rejectTargetQuest.value

  const reason =
    rejectionReason.value.trim()

  if (!quest) {
    return
  }

  if (!reason) {

    alert(
      '거절 사유를 입력해주세요.'
    )

    return
  }

  processingQuestId.value =
    quest.questId

  try {

    const verificationId =
      await findVerificationId(
        quest.questId
      )

    console.log(
      '거절 questId:',
      quest.questId
    )

    console.log(
      '거절 verificationId:',
      verificationId
    )

    console.log(
      '거절 rejectionReason:',
      reason
    )

    await rejectQuestVerification(
      quest.questId,
      verificationId,
      reason,
      authStore.accessToken
    )

    isRejectModalOpen.value =
      false

    rejectTargetQuest.value =
      null

    rejectionReason.value =
      ''

    alert(
      '퀘스트 인증이 거절되었습니다.'
    )

    await loadQuests()

  } catch (error) {

    console.error(
      '거절 실패:',
      error
    )

    alert(
      error.message ||
      '퀘스트 인증 거절에 실패했습니다.'
    )

  } finally {

    processingQuestId.value =
      null
  }
}


/* =========================
   이동
========================= */

function goToDetail(
  questId
) {

  if (
    questId === null ||
    questId === undefined
  ) {
    return
  }

  router.push(
    `/parents/quest/${questId}`
  )
}


function goToCreate() {

  router.push(
    '/parents/quest/create'
  )
}


/* =========================
   금액 포맷
========================= */

function formatReward(
  value
) {

  return `${Number(
    value ?? 0
  ).toLocaleString()}원`
}


/* =========================
   날짜 포맷
========================= */

function formatDate(
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

  return `${date.getFullYear()}.${
    String(
      date.getMonth() + 1
    ).padStart(2, '0')
  }.${
    String(
      date.getDate()
    ).padStart(2, '0')
  }`
}


/* =========================
   시간 포맷
========================= */

function formatTime(
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

  const hour =
    date.getHours()

  const period =
    hour >= 12
      ? '오후'
      : '오전'

  const displayHour =
    hour % 12 || 12

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, '0')

  return `${period} ${displayHour}:${minutes}`
}


/* =========================
   Status
========================= */

function getStatusLabel(
  status
) {

  const map = {
    AVAILABLE: '시작 가능',
    IN_PROGRESS: '진행 중',
    PENDING: '인증 대기',
    COMPLETED: '완료',
    FAILED: '실패',
    EXPIRED: '기간 만료',
    DECLINED: '거절',
  }

  return (
    map[status] ||
    status
  )
}


function getStatusClass(
  status
) {

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
  background: #ffffff;
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
  background: #ffffff;
}

.back-btn {
  width: 60px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon-title,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.alarm-btn {
  border: none;
  background: transparent;
  padding: 0;
}


/* =========================
   탭
========================= */

.tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.tab {
  flex: 1;
  height: 44px;

  border: none;
  border-bottom: 2px solid transparent;

  background: transparent;

  color: #8b9097;

  font-size: 14px;
  font-weight: 600;
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
   검색창
========================= */

.quest-search-wrap {
  width: 100%;
}

.quest-search-box {
  display: flex;
  align-items: center;

  width: 100%;
  height: 46px;

  box-sizing: border-box;

  padding: 0 14px;

  border: 1px solid #eceef1;
  border-radius: 12px;

  background: #f6f7f8;
}

.search-icon {
  width: 19px;
  height: 19px;

  flex-shrink: 0;

  margin-right: 9px;

  opacity: 0.55;
}

.search-input {
  flex: 1;

  min-width: 0;

  padding: 0;

  border: none;
  outline: none;

  background: transparent;

  color: #191b1e;

  font-family: inherit;
  font-size: 14px;
}

.search-input::placeholder {
  color: #a7acb3;
}

.search-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  flex-shrink: 0;

  padding: 0;
  margin-left: 6px;

  border: none;
  border-radius: 50%;

  background: #dfe2e6;

  color: #ffffff;

  font-size: 16px;
  line-height: 1;
}


/* =========================
   인증 대기
========================= */

.pending-card {
  padding: 16px;

  border-radius: 16px;

  background: #ffbc00;
}

.pending-content {
  cursor: pointer;
}

.pending-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-badge {
  padding: 4px 9px;

  border-radius: 20px;

  background: rgba(0, 0, 0, 0.1);

  font-size: 12px;
  font-weight: 700;
}

.pending-time {
  font-size: 12px;
}

.pending-child {
  margin: 10px 0 3px;

  font-size: 12px;

  opacity: 0.7;
}

.pending-title {
  margin: 0;

  font-size: 16px;
  font-weight: 700;
}

.pending-reward {
  margin: 5px 0 0;

  font-size: 13px;
  font-weight: 700;
}

.pending-actions,
.list-actions {
  display: flex;

  gap: 8px;

  margin-top: 14px;
}

.reject-btn,
.approve-btn,
.list-reject-btn,
.list-approve-btn {
  flex: 1;

  height: 42px;

  border-radius: 10px;

  font-size: 14px;
  font-weight: 700;
}

.reject-btn,
.list-reject-btn {
  border: 1px solid #e0e2e6;

  background: #ffffff;

  color: #ff3b30;
}

.approve-btn {
  border: none;

  background: #191b1e;

  color: #ffffff;
}

.list-approve-btn {
  border: none;

  background: #ffbc00;

  color: #191b1e;
}

.detail-btn {
  width: 100%;
  height: 38px;

  margin-top: 8px;

  border: none;
  border-radius: 9px;

  background:
    rgba(
      255,
      255,
      255,
      0.85
    );

  font-size: 13px;
  font-weight: 700;
}


/* =========================
   목록
========================= */

.quest-section {
  overflow: hidden;

  border-radius: 16px;

  background: #ffffff;
}

.quest-item {
  padding-bottom: 14px;

  border-bottom:
    1px solid #f0f1f3;
}

.quest-item:last-child {
  border-bottom: none;
}

.quest-item-main {
  display: flex;

  justify-content: space-between;
  align-items: center;

  padding: 14px 16px 0;

  cursor: pointer;
}

.quest-item-left {
  display: flex;
  align-items: center;

  gap: 12px;

  min-width: 0;

  flex: 1;
}

.quest-icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  border-radius: 8px;

  background: #f4f5f7;
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
  flex-wrap: wrap;

  gap: 6px;

  align-items: center;
}

.quest-child {
  color: #8b9097;

  font-size: 11px;
}

.quest-reward {
  color: #ffbc00;

  font-size: 11px;
  font-weight: 700;
}

.quest-title {
  margin: 3px 0;

  font-size: 14px;
  font-weight: 700;
}

.quest-sub {
  margin: 0;

  color: #8b9097;

  font-size: 11px;
}

.status-text {
  padding: 2px 6px;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 700;
}

.status-available {
  color: #5970e8;

  background: #eef1ff;
}

.status-progress {
  color: #1d8b55;

  background: #e9f8f0;
}

.status-pending {
  color: #b17600;

  background: #fff4cc;
}

.status-completed {
  color: #555b63;

  background: #f0f1f3;
}

.status-failed {
  color: #d94a4a;

  background: #fff0f0;
}

.chevron-icon {
  width: 18px;
  height: 18px;
}

.list-actions {
  margin: 12px 16px 0;
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

  right:
    calc(
      50% - 160px
    );

  bottom: 90px;

  width: 52px;
  height: 52px;

  border: none;
  border-radius: 50%;

  background: #ffbc00;

  font-size: 28px;

  box-shadow:
    0 4px 12px
    rgba(
      0,
      0,
      0,
      0.15
    );
}


/* =========================
   거절 사유 모달
========================= */

.modal-overlay {
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
      0.45
    );
}

.reject-modal {
  width: 100%;

  max-width: 320px;

  box-sizing: border-box;

  padding: 20px;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 12px 30px
    rgba(
      0,
      0,
      0,
      0.18
    );
}

.reject-modal-header {
  display: flex;

  align-items: center;
  justify-content: space-between;
}

.reject-modal-title {
  margin: 0;

  color: #191b1e;

  font-size: 18px;
  font-weight: 700;
}

.modal-close-btn {
  width: 30px;
  height: 30px;

  padding: 0;

  border: none;

  background: transparent;

  color: #8b9097;

  font-size: 25px;

  line-height: 1;
}

.reject-modal-description {
  margin: 12px 0 8px;

  color: #6f747b;

  font-size: 13px;

  line-height: 1.5;
}

.reject-target-title {
  margin: 0 0 12px;

  color: #191b1e;

  font-size: 14px;
  font-weight: 700;
}

.reject-textarea {
  width: 100%;

  min-height: 120px;

  box-sizing: border-box;

  padding: 14px;

  border:
    1.5px solid #e0e2e6;

  border-radius: 12px;

  background: #ffffff;

  color: #191b1e;

  font-family: inherit;

  font-size: 14px;

  line-height: 1.5;

  resize: none;

  outline: none;
}

.reject-textarea:focus {
  border-color: #ffbc00;
}

.reject-textarea::placeholder {
  color: #b9bec5;
}

.reject-count {
  margin: 6px 2px 0;

  color: #a0a5ac;

  font-size: 11px;

  text-align: right;
}

.reject-modal-actions {
  display: flex;

  gap: 10px;

  margin-top: 18px;
}

.reject-cancel-btn,
.reject-confirm-btn {
  flex: 1;

  height: 46px;

  border-radius: 10px;

  font-size: 14px;
  font-weight: 700;
}

.reject-cancel-btn {
  border:
    1px solid #e0e2e6;

  background: #ffffff;

  color: #555b63;
}

.reject-confirm-btn {
  border: none;

  background: #ff4d4f;

  color: #ffffff;
}


/* =========================
   공통 버튼
========================= */

button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.45;

  cursor: not-allowed;
}
</style>