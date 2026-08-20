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
        퀘스트 상세
      </h1>

      <div
        v-if="
          quest &&
          quest.status === 'AVAILABLE'
        "
        class="nav-actions"
      >
        <button
          class="action-btn edit-btn"
          type="button"
          @click="enterEditMode"
        >
          수정
        </button>

        <button
          class="action-btn delete-btn"
          type="button"
          @click="handleDelete"
        >
          삭제
        </button>
      </div>

      <div
        v-else
        class="nav-placeholder"
      ></div>
    </header>

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

    <!-- 없음 -->
    <div
      v-else-if="!quest"
      class="state-box"
    >
      퀘스트 정보가 없습니다.
    </div>

    <!-- 상세 -->
    <div
      v-else-if="!isEditMode"
      class="content"
    >
      <!-- 자녀 -->
      <div class="info-card">
        <div class="child-row">
          <img
            :src="CHILD_PROFILE_IMAGE"
            alt="자녀 프로필"
            class="child-avatar"
          />

          <div class="child-info">
            <p class="child-label">
              자녀
            </p>

            <p class="child-name">
              {{
                quest.child.name ||
                '자녀'
              }}
            </p>
          </div>

          <span
            class="status-badge"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
        </div>
      </div>

      <!-- 정보 -->
      <div class="info-card">
        <div class="info-row">
          <p class="info-label">
            제목
          </p>

          <p class="info-value">
            {{ quest.title || '-' }}
          </p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            내용
          </p>

          <p class="info-value">
            {{ quest.content || '-' }}
          </p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            기한
          </p>

          <p class="info-value">
            {{ formatDate(quest.deadline) }}
          </p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            보상
          </p>

          <p class="info-value reward">
            {{
              formatReward(
                quest.rewardAmount
              )
            }}
          </p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            신뢰도 점수
          </p>

          <p class="info-value">
            {{
              quest.teenyScoreEnabled
                ? '부여'
                : '미부여'
            }}
          </p>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            인증 방식
          </p>

          <p class="info-value">
            {{
              getRequirementLabel(
                quest.verificationRequirement
              )
            }}
          </p>
        </div>
      </div>

      <!-- 인증 -->
      <div
        v-if="quest.latestVerification"
        class="info-card"
      >
        <div class="verification-title-row">
          <p class="card-title">
            인증 내역
          </p>

          <span class="verification-status">
            {{
              getVerificationStatusLabel(
                quest.latestVerification.status
              )
            }}
          </span>
        </div>

        <!-- 사진 -->
        <div
          v-if="
            quest.latestVerification.imageUrl &&
            !quest.latestVerification.imageExpired
          "
          class="verify-image-wrap"
        >
          <img
            :src="
              quest.latestVerification.imageUrl
            "
            alt="인증 이미지"
            class="verify-image"
          />
        </div>

        <div
          v-else-if="
            quest.latestVerification.imageExpired
          "
          class="image-expired"
        >
          인증 이미지가 만료되었습니다.
        </div>

        <!-- 내용 -->
        <template
          v-if="
            quest.latestVerification.content
          "
        >
          <div class="divider"></div>

          <div class="info-row">
            <p class="info-label">
              인증 내용
            </p>

            <p class="info-value">
              {{
                quest.latestVerification.content
              }}
            </p>
          </div>
        </template>

        <!-- 시도 횟수 -->
        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            인증 시도
          </p>

          <p class="info-value">
            {{ formatAttemptCount(quest) }}
          </p>
        </div>

        <!-- 제출 -->
        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            제출 일시
          </p>

          <p class="info-value">
            {{
              formatDate(
                getVerificationSubmittedAt(
                  quest.latestVerification
                )
              )
            }}
          </p>
        </div>

        <!-- 검토 -->
        <div class="divider"></div>

        <div class="info-row">
          <p class="info-label">
            검토 일시
          </p>

          <p class="info-value">
            {{
              formatDate(
                getVerificationReviewedAt(
                  quest.latestVerification
                )
              )
            }}
          </p>
        </div>

        <!-- 거절 사유 -->
        <template
          v-if="
            quest.latestVerification.rejectionReason
          "
        >
          <div class="divider"></div>

          <div class="info-row">
            <p class="info-label">
              거절 사유
            </p>

            <p class="info-value rejection">
              {{
                quest.latestVerification.rejectionReason
              }}
            </p>
          </div>
        </template>

        <!-- 승인/거절 -->
        <div
          v-if="canReviewVerification"
          class="verification-actions"
        >
          <button
            type="button"
            class="verification-reject-btn"
            :disabled="
              isProcessingVerification
            "
            @click="openRejectModal"
          >
            거절
          </button>

          <button
            type="button"
            class="verification-approve-btn"
            :disabled="
              isProcessingVerification
            "
            @click="
              handleVerificationApprove
            "
          >
            {{
              isProcessingVerification
                ? '처리 중...'
                : '승인'
            }}
          </button>
        </div>
      </div>

      <!-- 퀘스트 거절 정보 -->
      <div
        v-if="
          quest.declineReasonCode ||
          quest.declineReasonDetail
        "
        class="info-card"
      >
        <p class="card-title">
          거절 정보
        </p>

        <div
          v-if="quest.declineReasonCode"
          class="info-row"
        >
          <p class="info-label">
            거절 코드
          </p>

          <p class="info-value">
            {{ quest.declineReasonCode }}
          </p>
        </div>

        <div
          v-if="quest.declineReasonDetail"
          class="info-row"
        >
          <p class="info-label">
            상세 사유
          </p>

          <p class="info-value">
            {{ quest.declineReasonDetail }}
          </p>
        </div>
      </div>
    </div>

    <!-- 수정 -->
    <div
      v-else
      class="content"
    >
      <div class="section">
        <p class="section-label">
          제목
        </p>

        <input
          v-model="editForm.title"
          type="text"
          class="input"
          placeholder="퀘스트 제목"
        />
      </div>

      <div class="section">
        <p class="section-label">
          내용
        </p>

        <textarea
          v-model="editForm.content"
          class="textarea"
          rows="4"
          placeholder="퀘스트 내용"
        ></textarea>
      </div>

      <div class="section">
        <p class="section-label">
          기한
        </p>

        <input
          v-model="editForm.deadline"
          type="datetime-local"
          class="input"
        />
      </div>

      <div class="section">
        <p class="section-label">
          현금 보상
        </p>

        <div class="amount-wrap">
          <input
            v-model="editForm.rewardAmount"
            type="number"
            class="amount-input"
            min="0"
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
              addQuickAmount(
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
              editForm.rewardAmount = 0
            "
          >
            초기화
          </button>
        </div>
      </div>

      <button
        class="teeny-score-row"
        type="button"
        @click="
          editForm.teenyScoreEnabled =
            !editForm.teenyScoreEnabled
        "
      >
        <div
          class="checkbox"
          :class="{
            checked:
              editForm.teenyScoreEnabled
          }"
        >
          <img
            v-if="
              editForm.teenyScoreEnabled
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

      <div class="edit-btns">
        <button
          class="cancel-btn"
          type="button"
          @click="cancelEdit"
        >
          취소
        </button>

        <button
          class="submit-btn"
          type="button"
          :disabled="isSaving"
          @click="handleUpdate"
        >
          {{
            isSaving
              ? '저장 중...'
              : '저장하기'
          }}
        </button>
      </div>
    </div>

    <ParentBottomNav active="quest" />

    <ConfirmModal
      :show="isExtendModalOpen"
      title="기한이 지났습니다. 연장할까요?"
      description="기한을 연장하면 자녀가 다시 인증을 시도할 수 있어요."
      confirm-text="연장하기"
      cancel-text="취소"
      @confirm="confirmExtendDeadline"
      @cancel="closeExtendModal"
    />

    <!-- =========================
         거절 모달
    ========================== -->
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
              isProcessingVerification
            "
            @click="closeRejectModal"
          >
            ×
          </button>
        </div>

        <p class="reject-modal-description">
          {{
            quest.child.name ||
            '자녀'
          }}에게 전달할 거절 사유를 입력해주세요.
        </p>

        <textarea
          v-model="rejectionReason"
          class="reject-textarea"
          maxlength="200"
          rows="5"
          placeholder="예) 인증 사진에서 수행 여부를 확인하기 어려워요."
        ></textarea>

        <p class="reject-count">
          {{ rejectionReason.length }}/200
        </p>

        <div class="reject-modal-actions">
          <button
            type="button"
            class="reject-cancel-btn"
            :disabled="
              isProcessingVerification
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
              isProcessingVerification
            "
            @click="submitReject"
          >
            {{
              isProcessingVerification
                ? '처리 중...'
                : '거절하기'
            }}
          </button>
        </div>
      </div>
    </div>
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import AlertHost from '@/components/AlertHost.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useAlertModal } from '@/composables/useAlertModal'

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  useAuthStore,
} from '@/stores/auth'

import {
  getQuestDetail,
  updateQuest,
  deleteQuest,
  approveQuestVerification,
  rejectQuestVerification,
  extendQuestDeadline,
} from '@/api/quest'

import {
  isQuestDeadlineExpiredError,
} from '@/utils/questDeadline'

import {
  formatKstDateTime,
  toKstDatetimeLocalValue,
  utcIsoFromKstDatetimeLocal,
} from '@/utils/datetime'

import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const router =
  useRouter()

const route =
  useRoute()

const alertModal = useAlertModal()

const authStore =
  useAuthStore()

const questId =
  route.params.questId

const quest =
  ref(null)

const isLoading =
  ref(false)

const isSaving =
  ref(false)

const isProcessingVerification =
  ref(false)

const errorMessage =
  ref('')

const isEditMode =
  ref(false)

/* 거절 모달 */
const isRejectModalOpen =
  ref(false)

const rejectionReason =
  ref('')

const isExtendModalOpen =
  ref(false)

const isExtendingDeadline =
  ref(false)

const pendingVerificationAction =
  ref(null)

const editForm =
  ref({
    title: '',
    content: '',
    deadline: '',
    rewardAmount: 0,
    teenyScoreEnabled: true,
    verificationRequirement:
      'PHOTO_REQUIRED',
  })

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

const statusLabel =
  computed(() => {
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
      map[
        quest.value?.status
      ] ||
      quest.value?.status ||
      ''
    )
  })

const statusClass =
  computed(() => {
    const map = {
      AVAILABLE:
        'status-available',

      IN_PROGRESS:
        'status-progress',

      PENDING:
        'status-pending',

      COMPLETED:
        'status-completed',

      FAILED:
        'status-failed',

      EXPIRED:
        'status-expired',

      DECLINED:
        'status-declined',
    }

    return (
      map[
        quest.value?.status
      ] || ''
    )
  })

const canReviewVerification =
  computed(() => {
    const verificationId =
      quest.value
        ?.latestVerification
        ?.verificationId

    return (
      quest.value?.status ===
        'PENDING' &&
      verificationId !== null &&
      verificationId !== undefined
    )
  })

async function loadQuestDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res =
      await getQuestDetail(
        questId,
        authStore.accessToken
      )

    console.log(
      '퀘스트 상세 응답:',
      res
    )

    if (
      !res.success ||
      !res.data
    ) {
      throw new Error(
        res.message ||
        '퀘스트 상세 조회에 실패했습니다.'
      )
    }

    quest.value =
      res.data

  } catch (error) {
    console.error(
      '퀘스트 상세 조회 실패:',
      error
    )

    quest.value =
      null

    errorMessage.value =
      error.message ||
      '퀘스트를 불러오지 못했습니다.'

  } finally {
    isLoading.value =
      false
  }
}

function getVerificationId() {
  const verificationId =
    quest.value
      ?.latestVerification
      ?.verificationId

  if (
    verificationId === null ||
    verificationId === undefined
  ) {
    throw new Error(
      '인증 ID를 찾을 수 없습니다.'
    )
  }

  return verificationId
}

/* 승인 */
async function handleVerificationApprove() {
  if (
    isProcessingVerification.value
  ) {
    return
  }

  if (
    !(await alertModal.showConfirm(
      '이 퀘스트 인증을 승인하시겠습니까?'
    ))
  ) {
    return
  }

  isProcessingVerification.value =
    true

  try {
    const verificationId =
      getVerificationId()

    await approveQuestVerification(
      questId,
      verificationId,
      authStore.accessToken
    )

    alertModal.showAlert(
      '퀘스트 인증이 승인되었습니다.'
    )

    await loadQuestDetail()

  } catch (error) {
    console.error(
      '승인 실패:',
      error
    )

    if (
      handleQuestDeadlineExpired(
        error,
        handleVerificationApprove,
      )
    ) {
      return
    }

    alertModal.showAlert(
      error.message ||
      '퀘스트 인증 승인에 실패했습니다.'
    )

  } finally {
    isProcessingVerification.value =
      false
  }
}

/* =========================
   거절 모달
========================= */

function openRejectModal() {
  if (
    isProcessingVerification.value
  ) {
    return
  }

  rejectionReason.value =
    ''

  isRejectModalOpen.value =
    true
}

function closeRejectModal() {
  if (
    isProcessingVerification.value
  ) {
    return
  }

  isRejectModalOpen.value =
    false

  rejectionReason.value =
    ''
}

async function submitReject() {
  if (
    isProcessingVerification.value
  ) {
    return
  }

  const reason =
    rejectionReason.value.trim()

  if (!reason) {
    return
  }

  isProcessingVerification.value =
    true

  try {
    const verificationId =
      getVerificationId()

    console.log(
      '거절 questId:',
      questId
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
      questId,
      verificationId,
      reason,
      authStore.accessToken
    )

    isRejectModalOpen.value =
      false

    rejectionReason.value =
      ''

    alertModal.showAlert(
      '퀘스트 인증이 거절되었습니다.'
    )

    await loadQuestDetail()

  } catch (error) {
    console.error(
      '거절 실패:',
      error
    )

    if (
      handleQuestDeadlineExpired(
        error,
        submitReject,
      )
    ) {
      return
    }

    alertModal.showAlert(
      error.message ||
      '퀘스트 인증 거절에 실패했습니다.'
    )

  } finally {
    isProcessingVerification.value =
      false
  }
}

function handleQuestDeadlineExpired(
  error,
  retryAction,
) {
  if (
    !isQuestDeadlineExpiredError(error) ||
    !quest.value
  ) {
    return false
  }

  pendingVerificationAction.value =
    retryAction

  isExtendModalOpen.value =
    true

  return true
}

function closeExtendModal() {
  if (isExtendingDeadline.value) {
    return
  }

  isExtendModalOpen.value =
    false

  pendingVerificationAction.value =
    null
}

async function confirmExtendDeadline() {
  const retryAction =
    pendingVerificationAction.value

  if (
    !quest.value ||
    isExtendingDeadline.value
  ) {
    return
  }

  isExtendingDeadline.value =
    true

  try {
    await extendQuestDeadline(
      questId,
      authStore.accessToken,
      quest.value.deadline,
    )

    isExtendModalOpen.value =
      false

    pendingVerificationAction.value =
      null

    await loadQuestDetail()

    if (retryAction) {
      await retryAction()
    }
  } catch (error) {
    console.error(
      '기한 연장 실패:',
      error,
    )

    alertModal.showAlert(
      error.message ||
      '기한 연장에 실패했습니다.'
    )
  } finally {
    isExtendingDeadline.value =
      false
  }
}

/* 수정 */
function enterEditMode() {
  if (!quest.value) {
    return
  }

  editForm.value = {
    title:
      quest.value.title || '',

    content:
      quest.value.content || '',

    deadline:
      toLocalDatetime(
        quest.value.deadline
      ),

    rewardAmount:
      Number(
        quest.value.rewardAmount ??
        0
      ),

    teenyScoreEnabled:
      Boolean(
        quest.value.teenyScoreEnabled
      ),

    verificationRequirement:
      quest.value.verificationRequirement ||
      'PHOTO_REQUIRED',
  }

  isEditMode.value =
    true
}

function cancelEdit() {
  isEditMode.value =
    false
}

function addQuickAmount(
  amount
) {
  editForm.value.rewardAmount =
    Number(
      editForm.value.rewardAmount ||
      0
    ) + amount
}

async function handleUpdate() {
  if (
    isSaving.value
  ) {
    return
  }

  if (
    !editForm.value.title.trim()
  ) {
    alertModal.showAlert(
      '제목을 입력해주세요.'
    )
    return
  }

  if (
    !editForm.value.deadline
  ) {
    alertModal.showAlert(
      '기한을 입력해주세요.'
    )
    return
  }

  isSaving.value =
    true

  try {
    const data = {
      title:
        editForm.value.title.trim(),

      content:
        editForm.value.content.trim(),

      // QuestCreate와 같은 이유로 UTC 변환을 하지 않는다. datetime-local 입력값이
      // 이미 로컬 벽시계(YYYY-MM-DDTHH:mm)이고, 서버 필드는 LocalDateTime이다.
      deadline:
        editForm.value.deadline,

      rewardAmount:
        Number(
          editForm.value.rewardAmount ??
          0
        ),

      teenyScoreEnabled:
        editForm.value.teenyScoreEnabled,

      verificationRequirement:
        editForm.value.verificationRequirement,
    }

    await updateQuest(
      questId,
      data,
      authStore.accessToken
    )

    alertModal.showAlert(
      '퀘스트가 수정되었습니다.'
    )

    isEditMode.value =
      false

    await loadQuestDetail()

  } catch (error) {
    console.error(
      '수정 실패:',
      error
    )

    alertModal.showAlert(
      error.message ||
      '퀘스트 수정에 실패했습니다.'
    )

  } finally {
    isSaving.value =
      false
  }
}

async function handleDelete() {
  if (
    !(await alertModal.showConfirm(
      '퀘스트를 삭제하시겠습니까?'
    ))
  ) {
    return
  }

  try {
    await deleteQuest(
      questId,
      authStore.accessToken
    )

    alertModal.showAlert(
      '퀘스트가 삭제되었습니다.'
    )

    router.back()

  } catch (error) {
    console.error(
      '삭제 실패:',
      error
    )

    alertModal.showAlert(
      error.message ||
      '퀘스트 삭제에 실패했습니다.'
    )
  }
}

function formatReward(
  value
) {
  return `${Number(
    value ?? 0
  ).toLocaleString()}원`
}

function formatDate(
  value
) {
  return formatKstDateTime(value, '-')
}

function formatAttemptCount(
  questData
) {
  const verification =
    questData?.latestVerification

  const count =
    verification?.attemptNo ??
    verification?.attemptCount ??
    verification?.attempt ??
    questData?.attemptNo ??
    questData?.attemptCount

  if (
    count === null ||
    count === undefined ||
    count === ''
  ) {
    return '-회'
  }

  return `${count}회`
}

function getVerificationSubmittedAt(
  verification
) {
  return (
    verification?.submittedAt ??
    verification?.createdAt ??
    verification?.submittedDate ??
    verification?.createdDate ??
    null
  )
}

function getVerificationReviewedAt(
  verification
) {
  return (
    verification?.reviewedAt ??
    verification?.processedAt ??
    verification?.updatedAt ??
    verification?.reviewedDate ??
    null
  )
}

function toLocalDatetime(
  value
) {
  return toKstDatetimeLocalValue(value)
}

function getRequirementLabel(
  value
) {
  const map = {
    FREE: '자유 인증',
    PHOTO_REQUIRED: '사진 인증',
    TEXT_REQUIRED: '내용 인증',
  }

  return (
    map[value] ||
    value ||
    '-'
  )
}

function getVerificationStatusLabel(
  status
) {
  const map = {
    PENDING: '인증 대기',
    APPROVED: '승인 완료',
    REJECTED: '거절',
    DECLINED: '거절',
  }

  return (
    map[status] ||
    status ||
    '-'
  )
}

onMounted(() => {
  loadQuestDetail()
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  padding-bottom: 90px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f0f1f3;
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

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.nav-actions {
  display: flex;
  gap: 6px;
}

.nav-placeholder {
  width: 60px;
}

.action-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.edit-btn {
  background: #f4f5f7;
}

.delete-btn {
  background: #ffe5e5;
  color: #ff3b30;
}

.state-box {
  padding: 60px 20px;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text {
  color: #ff3b30;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.info-card {
  background-color: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.child-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: contain;
  background-color: #f4f5f7;
}

.child-info {
  min-width: 0;
  flex: 1;
}

.child-label {
  margin: 0;
  font-size: 11px;
  color: #8b9097;
}

.child-name {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 700;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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
  background: #fff8e1;
}

.status-completed {
  color: #3b82f6;
  background: #e3f2fd;
}

.status-failed,
.status-declined {
  color: #ff3b30;
  background: #ffe5e5;
}

.status-expired {
  color: #8b9097;
  background: #f4f5f7;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  margin: 0;
  color: #8b9097;
  font-size: 12px;
  font-weight: 600;
}

.info-value {
  margin: 0;
  color: #191b1e;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.reward {
  color: #ffbc00;
  font-size: 18px;
  font-weight: 700;
}

.rejection {
  color: #ff3b30;
}

.divider {
  height: 1px;
  background: #f0f1f3;
}

.verification-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.verification-status {
  padding: 4px 8px;
  border-radius: 20px;
  background: #fff8e1;
  color: #b17600;
  font-size: 11px;
  font-weight: 700;
}

.verify-image-wrap {
  overflow: hidden;
  border-radius: 12px;
  background: #f4f5f7;
}

.verify-image {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: cover;
}

.image-expired {
  padding: 30px 15px;
  border-radius: 10px;
  background: #f4f5f7;
  color: #8b9097;
  text-align: center;
  font-size: 13px;
}

.verification-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.verification-reject-btn,
.verification-approve-btn {
  flex: 1;
  height: 50px;
  border-radius: 11px;
  font-size: 15px;
  font-weight: 700;
}

.verification-reject-btn {
  border: 1.5px solid #e0e2e6;
  background: #ffffff;
  color: #ff3b30;
}

.verification-approve-btn {
  border: none;
  background: #ffbc00;
  color: #191b1e;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.section-label {
  margin: 0;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  background: #ffffff;
  color: #191b1e;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.textarea {
  resize: none;
}

.amount-wrap {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  background: #ffffff;
}

.amount-input {
  min-width: 0;
  flex: 1;
  border: none;
  outline: none;
  text-align: right;
  font-size: 20px;
  font-weight: 700;
}

.won {
  margin-left: 8px;
}

.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1px solid #e0e2e6;
  border-radius: 20px;
  background: #ffffff;
}

.reset-btn {
  color: #8b9097;
}

.teeny-score-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: #fff8e1;
  text-align: left;
}

.checkbox {
  width: 22px;
  height: 22px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
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
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.teeny-score-desc {
  margin: 2px 0 0;
  color: #8b9097;
  font-size: 12px;
}

.shield-icon {
  width: 20px;
  height: 20px;
}

.edit-btns {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.submit-btn {
  height: 49px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
}

.cancel-btn {
  flex: 1;
  border: 1px solid #e0e2e6;
  background: #ffffff;
}

.submit-btn {
  flex: 2;
  border: none;
  background: #ffbc00;
}

/* 거절 모달 */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,0.45);
}

.reject-modal {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
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
}

.reject-modal-description {
  margin: 12px 0 14px;
  color: #6f747b;
  font-size: 13px;
  line-height: 1.5;
}

.reject-textarea {
  width: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 14px;
  border: 1.5px solid #e0e2e6;
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
  border: 1px solid #e0e2e6;
  background: #ffffff;
  color: #555b63;
}

.reject-confirm-btn {
  border: none;
  background: #ff4d4f;
  color: #ffffff;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>