<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">퀘스트 상세</h1>

      <!-- AVAILABLE 상태일 때만 수정/삭제 -->
      <div
        v-if="quest && quest.status === 'AVAILABLE'"
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
      <p>불러오는 중입니다...</p>
    </div>

    <!-- 에러 -->
    <div
      v-else-if="errorMessage"
      class="state-box"
    >
      <p class="error-text">
        {{ errorMessage }}
      </p>
    </div>

    <!-- 데이터 없음 -->
    <div
      v-else-if="!quest"
      class="state-box"
    >
      <p>퀘스트 정보를 찾을 수 없습니다.</p>
    </div>

    <!-- =========================
         상세 보기
    ========================== -->
    <div
      v-else-if="!isEditMode"
      class="content"
    >
      <!-- 자녀 정보 -->
      <div class="info-card">
        <div class="child-row">
          <img
            :src="
              quest.child?.profileImageUrl ||
              defaultProfileImage
            "
            alt="자녀 프로필"
            class="child-avatar"
            @error="handleProfileImageError"
          />

          <div class="child-info">
            <p class="child-label">
              자녀
            </p>

            <p class="child-name">
              {{ quest.child?.name || '자녀' }}
            </p>
          </div>

          <span
            v-if="quest.status"
            class="status-badge"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
        </div>
      </div>

      <!-- 퀘스트 정보 -->
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
            {{ formatReward(quest.rewardAmount) }}
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

        <template v-if="quest.verificationRequirement">
          <div class="divider"></div>

          <div class="info-row">
            <p class="info-label">
              인증 방식
            </p>

            <p class="info-value">
              {{
                getVerificationRequirementLabel(
                  quest.verificationRequirement
                )
              }}
            </p>
          </div>
        </template>
      </div>

      <!-- =========================
           인증 정보
      ========================== -->
      <div
        v-if="quest.latestVerification"
        class="info-card"
      >
        <p class="card-title">
          인증 내역
        </p>

        <div class="info-row">
          <p class="info-label">
            상태
          </p>

          <p class="info-value">
            {{
              getVerificationStatusLabel(
                quest.latestVerification?.status
              )
            }}
          </p>
        </div>

        <!-- 인증 사진 -->
        <div
          v-if="quest.latestVerification?.imageUrl"
          class="verify-image-wrap"
        >
          <img
            :src="quest.latestVerification.imageUrl"
            alt="인증 이미지"
            class="verify-image"
          />
        </div>

        <!-- 인증 내용 -->
        <template
          v-if="quest.latestVerification?.content"
        >
          <div class="divider"></div>

          <div class="info-row">
            <p class="info-label">
              인증 내용
            </p>

            <p class="info-value">
              {{ quest.latestVerification.content }}
            </p>
          </div>
        </template>

        <!-- 인증 제출 일시 -->
        <template
          v-if="quest.latestVerification?.createdAt"
        >
          <div class="divider"></div>

          <div class="info-row">
            <p class="info-label">
              제출 일시
            </p>

            <p class="info-value">
              {{
                formatDate(
                  quest.latestVerification.createdAt
                )
              }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <!-- =========================
         수정 모드
    ========================== -->
    <div
      v-else
      class="content"
    >
      <!-- 제목 -->
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

      <!-- 내용 -->
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

      <!-- 기한 -->
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

      <!-- 현금 보상 -->
      <div class="section">
        <p class="section-label">
          현금 보상
        </p>

        <div class="amount-wrap">
          <input
            v-model="editForm.rewardAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
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
            class="quick-btn"
            type="button"
            @click="addQuickAmount(quick.value)"
          >
            {{ quick.label }}
          </button>

          <button
            class="quick-btn reset-btn"
            type="button"
            @click="editForm.rewardAmount = 0"
          >
            지움
          </button>
        </div>
      </div>

      <!-- 신뢰도 점수 -->
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
            checked: editForm.teenyScoreEnabled
          }"
        >
          <img
            v-if="editForm.teenyScoreEnabled"
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

      <!-- 수정 버튼 -->
      <div class="edit-btns">
        <button
          class="cancel-btn"
          type="button"
          :disabled="isSaving"
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

import {
  useRouter,
  useRoute,
} from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import {
  getQuestDetail,
  updateQuest,
  deleteQuest,
} from '@/api/quest'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

/* =========================
   기본값
========================= */

const questId =
  route.params.questId

const defaultProfileImage =
  '/src/assets/icons/child-profile.svg'

const isLoading = ref(false)
const isSaving = ref(false)

const errorMessage = ref('')

const isEditMode = ref(false)

/**
 * 기존 {}
 *
 * ↓
 *
 * null로 변경
 *
 * API 응답이 오기 전에는
 * quest 내부 필드를 렌더링하지 않음.
 */
const quest = ref(null)

/* =========================
   수정 Form
========================= */

const editForm = ref({
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

/* =========================
   상태 Label
========================= */

const statusLabel = computed(() => {
  if (!quest.value?.status) {
    return ''
  }

  const map = {
    AVAILABLE: '시작 가능',
    IN_PROGRESS: '진행 중',
    PENDING: '인증 대기',
    COMPLETED: '완료',
    FAILED: '실패',
    EXPIRED: '기간 만료',
    DECLINED: '반려',
  }

  return (
    map[quest.value.status] ||
    quest.value.status
  )
})

/* =========================
   상태 CSS
========================= */

const statusClass = computed(() => {
  if (!quest.value?.status) {
    return ''
  }

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
    map[quest.value.status] ||
    ''
  )
})

/* =========================
   퀘스트 조회
========================= */

async function loadQuestDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (!questId) {
      throw new Error(
        'questId가 없습니다.'
      )
    }

    console.log(
      '상세 조회 questId:',
      questId
    )

    /**
     * quest.js:
     *
     * getQuestDetail(
     *   questId,
     *   accessToken
     * )
     *
     * 순서 주의
     */
    const res =
      await getQuestDetail(
        questId,
        authStore.accessToken
      )

    console.log(
      '퀘스트 상세 응답:',
      res
    )

    if (!res.success) {
      throw new Error(
        res.message ||
        '퀘스트 상세 조회에 실패했습니다.'
      )
    }

    if (!res.data) {
      throw new Error(
        '퀘스트 상세 정보가 없습니다.'
      )
    }

    quest.value =
      res.data

    console.log(
      '저장된 quest:',
      quest.value
    )
  } catch (error) {
    console.error(
      '퀘스트 조회 실패:',
      error
    )

    quest.value = null

    errorMessage.value =
      error.message ||
      '퀘스트를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

/* =========================
   수정 모드 시작
========================= */

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
        quest.value.rewardAmount || 0
      ),

    teenyScoreEnabled:
      Boolean(
        quest.value.teenyScoreEnabled
      ),

    verificationRequirement:
      quest.value.verificationRequirement ||
      'PHOTO_REQUIRED',
  }

  isEditMode.value = true
}

/* =========================
   수정 취소
========================= */

function cancelEdit() {
  if (isSaving.value) {
    return
  }

  isEditMode.value = false
}

/* =========================
   빠른 금액
========================= */

function addQuickAmount(amount) {
  editForm.value.rewardAmount =
    Number(
      editForm.value.rewardAmount || 0
    ) + amount
}

/* =========================
   퀘스트 수정
========================= */

async function handleUpdate() {
  if (isSaving.value) {
    return
  }

  if (!quest.value) {
    alert(
      '퀘스트 정보가 없습니다.'
    )
    return
  }

  const title =
    editForm.value.title.trim()

  const content =
    editForm.value.content.trim()

  if (!title) {
    alert(
      '퀘스트 제목을 입력해주세요.'
    )
    return
  }

  if (!content) {
    alert(
      '퀘스트 내용을 입력해주세요.'
    )
    return
  }

  if (!editForm.value.deadline) {
    alert(
      '퀘스트 기한을 입력해주세요.'
    )
    return
  }

  isSaving.value = true

  try {
    const requestData = {
      title,
      content,

      deadline:
        new Date(
          editForm.value.deadline
        ).toISOString(),

      rewardAmount:
        Number(
          editForm.value.rewardAmount || 0
        ),

      teenyScoreEnabled:
        editForm.value.teenyScoreEnabled,

      verificationRequirement:
        editForm.value.verificationRequirement,
    }

    console.log(
      '퀘스트 수정 요청:',
      requestData
    )

    /**
     * quest.js:
     *
     * updateQuest(
     *   questId,
     *   questData,
     *   accessToken
     * )
     */
    const res =
      await updateQuest(
        questId,
        requestData,
        authStore.accessToken
      )

    console.log(
      '퀘스트 수정 응답:',
      res
    )

    if (res.success) {
      /**
       * 수정 응답에 전체 상세가
       * 내려오면 바로 반영.
       */
      if (res.data) {
        quest.value = {
          ...quest.value,
          ...res.data,
        }
      } else {
        /**
         * 응답 data가 없다면
         * 상세 API를 다시 조회.
         */
        await loadQuestDetail()
      }

      isEditMode.value = false

      alert(
        '퀘스트가 수정됐어요!'
      )
    }
  } catch (error) {
    console.error(
      '퀘스트 수정 실패:',
      error
    )

    alert(
      error.message ||
      '퀘스트 수정에 실패했습니다.'
    )
  } finally {
    isSaving.value = false
  }
}

/* =========================
   삭제
========================= */

async function handleDelete() {
  if (!quest.value) {
    return
  }

  const confirmed =
    window.confirm(
      '퀘스트를 삭제하시겠습니까?'
    )

  if (!confirmed) {
    return
  }

  try {
    /**
     * quest.js:
     *
     * deleteQuest(
     *   questId,
     *   accessToken
     * )
     */
    await deleteQuest(
      questId,
      authStore.accessToken
    )

    alert(
      '퀘스트가 삭제됐어요.'
    )

    router.back()
  } catch (error) {
    console.error(
      '퀘스트 삭제 실패:',
      error
    )

    alert(
      error.message ||
      '퀘스트 삭제에 실패했습니다.'
    )
  }
}

/* =========================
   날짜 표시
========================= */

function formatDate(dateStr) {
  if (!dateStr) {
    return '-'
  }

  const date =
    new Date(dateStr)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(date)
}

/* =========================
   datetime-local 변환
========================= */

function toLocalDatetime(isoStr) {
  if (!isoStr) {
    return ''
  }

  const date =
    new Date(isoStr)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const offset =
    date.getTimezoneOffset() *
    60000

  return new Date(
    date.getTime() - offset
  )
    .toISOString()
    .slice(0, 16)
}

/* =========================
   보상 표시
========================= */

function formatReward(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '0원'
  }

  return `${Number(
    value
  ).toLocaleString()}원`
}

/* =========================
   인증 방식
========================= */

function getVerificationRequirementLabel(
  requirement
) {
  const map = {
    FREE: '자유 인증',
    PHOTO_REQUIRED: '사진 인증',
    TEXT_REQUIRED: '내용 인증',
  }

  return (
    map[requirement] ||
    requirement ||
    '-'
  )
}

/* =========================
   인증 상태
========================= */

function getVerificationStatusLabel(
  status
) {
  if (!status) {
    return '-'
  }

  const map = {
    PENDING: '인증 대기',
    APPROVED: '승인',
    REJECTED: '반려',
    DECLINED: '반려',
  }

  return (
    map[status] ||
    status
  )
}

/* =========================
   프로필 이미지 오류
========================= */

function handleProfileImageError(
  event
) {
  if (
    event.target.src.endsWith(
      'child-profile.svg'
    )
  ) {
    return
  }

  event.target.src =
    defaultProfileImage
}

/* =========================
   mounted
========================= */

onMounted(() => {
  loadQuestDetail()
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
  padding-bottom: 70px;
}

/* 헤더 */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  width: 60px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.nav-actions {
  width: 100px;
  display: flex;
  justify-content: flex-end;
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
  cursor: pointer;
}

.edit-btn {
  background-color: #f4f5f7;
  color: #191b1e;
}

.delete-btn {
  background-color: #ffe5e5;
  color: #ff3b30;
}

/* 상태 */
.state-box {
  flex: 1;
  padding: 60px 20px;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.state-box p {
  margin: 0;
}

.error-text {
  color: #ff3b30;
}

/* 내용 */
.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* 카드 */
.info-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

/* 자녀 정보 */
.child-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.child-info {
  flex: 1;
  min-width: 0;
}

.child-label {
  margin: 0 0 2px;
  font-size: 11px;
  color: #8b9097;
}

.child-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 상태 배지 */
.status-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-available {
  background-color: #eef1ff;
  color: #5970e8;
}

.status-progress {
  background-color: #e9f8f0;
  color: #1d8b55;
}

.status-pending {
  background-color: #fff8e1;
  color: #b17600;
}

.status-completed {
  background-color: #e3f2fd;
  color: #3b82f6;
}

.status-failed {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.status-expired {
  background-color: #f4f5f7;
  color: #8b9097;
}

.status-declined {
  background-color: #ffe5e5;
  color: #ff3b30;
}

/* 정보 */
.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  font-weight: 600;
}

.info-value {
  margin: 0;
  font-size: 14px;
  color: #191b1e;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
}

.reward {
  font-size: 18px;
  font-weight: 700;
  color: #ffbc00;
}

.divider {
  height: 1px;
  background-color: #f0f1f3;
}

/* 인증 이미지 */
.verify-image-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f4f5f7;
}

.verify-image {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: cover;
}

/* 수정 */
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
}

.input,
.textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  font-size: 14px;
  color: #191b1e;
  outline: none;
  box-sizing: border-box;
  background-color: #ffffff;
  font-family: inherit;
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

/* 금액 */
.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #ffffff;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  padding: 14px 16px;
}

.amount-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
  text-align: right;
  outline: none;
}

.won {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

/* 빠른 금액 */
.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.reset-btn {
  color: #8b9097;
}

/* 신뢰도 */
.teeny-score-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background-color: #fff8e1;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background-color: #f0f1f3;
}

.checkbox.checked {
  background-color: #ffbc00;
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
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.teeny-score-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.shield-icon {
  width: 20px;
  height: 20px;
}

/* 수정 버튼 */
.edit-btns {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.cancel-btn {
  flex: 1;
  height: 49px;
  border: 1.5px solid #e0e2e6;
  border-radius: 10px;
  background-color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.submit-btn {
  flex: 2;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
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
  color: #191b1e;
  font-weight: 700;
}
</style>