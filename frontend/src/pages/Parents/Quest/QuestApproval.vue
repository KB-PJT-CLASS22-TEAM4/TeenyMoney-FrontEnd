<template>
  <div class="page">
    <!-- 헤더 -->
    <header class="nav">
      <button
        type="button"
        class="back-btn"
        aria-label="뒤로가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">퀘스트 인증</h1>

      <ParentNavActions />
    </header>

    <main class="content">
      <!-- 인증 정보 -->
      <section class="verification-card">
        <div class="status-wrap">
          <span class="status-badge">인증 대기</span>
        </div>

        <p class="child-name">
          {{ questInfo.childName || '자녀' }}
        </p>

        <h2 class="quest-title">
          {{ questInfo.title || '퀘스트 인증' }}
        </h2>

        <div class="info-list">
          <div class="info-row">
            <span class="info-label">보상</span>
            <span class="info-value">
              {{ formatMoney(questInfo.reward) }}
            </span>
          </div>

          <div class="info-row">
            <span class="info-label">신뢰점수</span>
            <span class="info-value">
              +{{ questInfo.trustScore || 0 }}
            </span>
          </div>

          <div class="info-row">
            <span class="info-label">완료일</span>
            <span class="info-value">
              {{ formatDate(questInfo.completedAt) }}
            </span>
          </div>
        </div>

        <!-- 인증 사진이 응답에 있다면 -->
        <div
          v-if="questInfo.imageUrl"
          class="verification-image-wrap"
        >
          <p class="section-title">인증 사진</p>

          <img
            :src="questInfo.imageUrl"
            alt="퀘스트 인증 사진"
            class="verification-image"
          />
        </div>

        <!-- 인증 메모 -->
        <div
          v-if="questInfo.description"
          class="verification-description"
        >
          <p class="section-title">인증 내용</p>
          <p class="description-text">
            {{ questInfo.description }}
          </p>
        </div>
      </section>

      <p
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </p>

      <!-- 승인 / 반려 -->
      <div class="action-buttons">
        <button
          type="button"
          class="reject-btn"
          :disabled="isSubmitting"
          @click="handleReject"
        >
          반려
        </button>

        <button
          type="button"
          class="approve-btn"
          :disabled="isSubmitting"
          @click="handleApprove"
        >
          {{ isSubmitting ? '처리 중...' : '승인' }}
        </button>
      </div>
    </main>
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertHost from '@/components/AlertHost.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import { useAlertModal } from '@/composables/useAlertModal'
import {
  getQuests,
  approveQuestVerification,
  rejectQuestVerification,
} from '@/api/quest'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const questId = route.params.questId
const verificationId = route.params.verificationId

const questInfo = ref({})
const isSubmitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    /*
      별도의 퀘스트 상세조회 API가 있다면
      getQuests 대신 상세 API를 쓰는 게 더 좋음.

      우선 현재 가지고 있는 목록 API 기준으로 해당 quest를 찾음.
    */
    const res = await getQuests(authStore.accessToken)

    if (res.success) {
      const found = res.data.find(
        quest => String(quest.id) === String(questId)
      )

      if (found) {
        questInfo.value = found
      }
    }
  } catch (error) {
    console.error('퀘스트 정보 조회 실패:', error)
    errorMessage.value = '퀘스트 정보를 불러오지 못했습니다.'
  }
})

async function handleApprove() {
  if (isSubmitting.value) return

  const confirmed = await alertModal.showConfirm(
    '자녀의 퀘스트 인증을 승인하시겠습니까?'
  )

  if (!confirmed) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await approveQuestVerification(
      questId,
      verificationId,
      authStore.accessToken
    )

    if (res.success) {
      alertModal.showAlert('퀘스트 인증이 승인되었습니다.')

      router.replace('/parents/quest')
    }
  } catch (error) {
    console.error('퀘스트 승인 실패:', error)

    errorMessage.value =
      error.message || '퀘스트 승인에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleReject() {
  if (isSubmitting.value) return

  const confirmed = await alertModal.showConfirm(
    '자녀의 퀘스트 인증을 반려하시겠습니까?'
  )

  if (!confirmed) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await rejectQuestVerification(
      questId,
      verificationId,
      authStore.accessToken
    )

    if (res.success) {
      alertModal.showAlert('퀘스트 인증이 반려되었습니다.')

      router.replace('/parents/quest')
    }
  } catch (error) {
    console.error('퀘스트 반려 실패:', error)

    errorMessage.value =
      error.message || '퀘스트 반려에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

function formatMoney(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${Number(value).toLocaleString()}원`
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  return date.toLocaleString('ko-KR')
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
}

.nav {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #ffffff;
}

.back-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #191b1e;
}

.nav-space {
  width: 32px;
}

.content {
  padding: 16px;
}

.verification-card {
  padding: 20px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.status-wrap {
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #fff3cc;
  color: #b47d00;
  font-size: 12px;
  font-weight: 700;
}

.child-name {
  margin: 0 0 6px;
  color: #8b9097;
  font-size: 13px;
}

.quest-title {
  margin: 0 0 24px;
  color: #191b1e;
  font-size: 20px;
  font-weight: 700;
}

.info-list {
  border-top: 1px solid #f0f1f3;
  border-bottom: 1px solid #f0f1f3;
}

.info-row {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  color: #8b9097;
  font-size: 13px;
}

.info-value {
  color: #191b1e;
  font-size: 13px;
  font-weight: 600;
}

.verification-image-wrap {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 10px;
  color: #191b1e;
  font-size: 14px;
  font-weight: 700;
}

.verification-image {
  width: 100%;
  max-height: 300px;
  border-radius: 12px;
  object-fit: cover;
}

.verification-description {
  margin-top: 24px;
}

.description-text {
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  background-color: #f7f8fa;
  color: #45484d;
  font-size: 14px;
  line-height: 1.5;
}

.error-message {
  margin: 12px 4px 0;
  color: #ff3b30;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.reject-btn,
.approve-btn {
  flex: 1;
  height: 52px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.reject-btn {
  border: 1px solid #d9dce1;
  background-color: #ffffff;
  color: #555b63;
}

.approve-btn {
  border: none;
  background-color: #ffbc00;
  color: #191b1e;
}

.reject-btn:disabled,
.approve-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>