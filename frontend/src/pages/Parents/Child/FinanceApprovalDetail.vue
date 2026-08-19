<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">가입 신청 상세</h1>
      <ParentNavActions />
    </header>

    <div v-if="isLoading" class="state-box">불러오는 중입니다...</div>
    <div v-else-if="errorMessage" class="state-box error-text">{{ errorMessage }}</div>
    <div v-else-if="!request" class="state-box">신청 정보를 찾을 수 없습니다.</div>

    <div v-else class="content">
      <section class="info-card">
        <div class="head-row">
          <div>
            <p class="label">상품</p>
            <p class="title">{{ request.title }}</p>
          </div>
          <span class="status-badge" :class="statusClass">{{ request.statusLabel }}</span>
        </div>
        <p class="category">{{ request.category }}</p>
      </section>

      <section class="info-card">
        <div class="info-row">
          <p class="info-label">자녀</p>
          <p class="info-value">{{ request.childName }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">신청 금액</p>
          <p class="info-value strong">{{ formatAmount(request.requestedAmount) }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">가입 기간</p>
          <p class="info-value">{{ request.termMonths ? `${request.termMonths}개월` : '-' }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">적용 금리</p>
          <p class="info-value">{{ request.rateText }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">신청일</p>
          <p class="info-value">{{ formatDateTime(request.requestedAt) }}</p>
        </div>
        <div v-if="request.paymentDay" class="info-row">
          <p class="info-label">납입일</p>
          <p class="info-value">매월 {{ request.paymentDay }}일</p>
        </div>
        <div class="info-row">
          <p class="info-label">자동이체</p>
          <p class="info-value">{{ request.autoTransfer ? '사용' : '미사용' }}</p>
        </div>
        <div v-if="request.savingsType" class="info-row">
          <p class="info-label">적금 유형</p>
          <p class="info-value">{{ request.savingsType }}</p>
        </div>
        <div v-if="request.repaymentType" class="info-row">
          <p class="info-label">상환 방식</p>
          <p class="info-value">{{ request.repaymentType }}</p>
        </div>
        <div v-if="request.interestCalculationType" class="info-row">
          <p class="info-label">이자 계산</p>
          <p class="info-value">{{ request.interestCalculationType }}</p>
        </div>
        <div v-if="request.earlyTerminationRate != null" class="info-row">
          <p class="info-label">중도 해지 금리</p>
          <p class="info-value">연 {{ request.earlyTerminationRate }}%</p>
        </div>
        <div v-if="request.lateFeeRate != null" class="info-row">
          <p class="info-label">연체 수수료</p>
          <p class="info-value">연 {{ request.lateFeeRate }}%</p>
        </div>
      </section>
    </div>

    <div v-if="request?.isPending" class="action-bar">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="isProcessing"
        @click="openConfirm('reject')"
      >
        거절
      </button>
      <button
        class="btn btn-primary"
        type="button"
        :disabled="isProcessing"
        @click="openConfirm('approve')"
      >
        승인
      </button>
    </div>

    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirm-text="confirmModal.confirmText"
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlertHost from '@/components/AlertHost.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useAlertModal } from '@/composables/useAlertModal'
import {
  approveFinancialProductApprovalRequest,
  getFinancialProductApprovalRequestDetail,
  rejectFinancialProductApprovalRequest,
} from '@/api/financialProducts'
import { normalizeApprovalRequest } from '@/utils/financialProductMapper'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const childId = Number(route.params.childId)
const productType = route.params.productType
const enrollmentId = Number(route.params.enrollmentId)

const request = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isProcessing = ref(false)

const confirmModal = ref({
  show: false,
  action: '',
  title: '',
  description: '',
  confirmText: '확인',
})

const statusClass = computed(() => {
  if (!request.value) return ''

  if (request.value.status === 'APPROVED') return 'approved'
  if (request.value.status === 'REJECTED') return 'rejected'
  return 'pending'
})

function formatAmount(value) {
  if (value == null) return '-'
  return `${Number(value).toLocaleString()}원`
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10).replace(/-/g, '.')
  }

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')

  return `${y}.${m}.${d} ${hh}:${mm}`
}

async function fetchDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await getFinancialProductApprovalRequestDetail(
      authStore.accessToken,
      productType,
      enrollmentId,
    )

    const normalized = normalizeApprovalRequest(res.data)

    if (Number(normalized.childId) !== childId) {
      errorMessage.value = '해당 자녀의 신청 정보가 아닙니다.'
      request.value = null
      return
    }

    request.value = normalized
  } catch (error) {
    console.error('가입 신청 상세 조회 실패:', error)
    errorMessage.value = error.message || '신청 정보를 불러오지 못했습니다.'
    request.value = null
  } finally {
    isLoading.value = false
  }
}

function openConfirm(action) {
  if (action === 'approve') {
    confirmModal.value = {
      show: true,
      action,
      title: '가입 신청을 승인할까요?',
      description: `${request.value?.childName}님의 ${request.value?.title} 가입을 승인합니다.`,
      confirmText: '승인',
    }
    return
  }

  confirmModal.value = {
    show: true,
    action,
    title: '가입 신청을 거절할까요?',
    description: `${request.value?.childName}님의 ${request.value?.title} 가입을 거절합니다.`,
    confirmText: '거절',
  }
}

function closeConfirm() {
  confirmModal.value.show = false
}

async function handleConfirm() {
  const action = confirmModal.value.action
  closeConfirm()
  isProcessing.value = true

  try {
    if (action === 'approve') {
      await approveFinancialProductApprovalRequest(
        authStore.accessToken,
        productType,
        enrollmentId,
      )
      alertModal.showAlert('가입 신청을 승인했습니다.')
    } else {
      await rejectFinancialProductApprovalRequest(
        authStore.accessToken,
        productType,
        enrollmentId,
      )
      alertModal.showAlert('가입 신청을 거절했습니다.')
    }

    router.push({
      name: 'parents-child-finance',
      params: { childId: String(childId) },
    })
  } catch (error) {
    alertModal.showAlert(error.message || '처리에 실패했습니다.')
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  await fetchDetail()
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;

}

.back-btn {
  position: absolute;
  left: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
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

.nav-placeholder {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 18px;
}

.content {
  padding: 16px;
}

.info-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8b9097;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #191b1e;
}

.category {
  margin: 8px 0 0;
  font-size: 13px;
  color: #2e7bf0;
  font-weight: 700;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ff9500;
}

.status-badge.approved {
  background: #e8f8ee;
  color: #34c759;
}

.status-badge.rejected {
  background: #ffe5e5;
  color: #ff3b30;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef0f3;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  margin: 0;
  font-size: 13px;
  color: #8b9097;
}

.info-value {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #191b1e;
  text-align: right;
}

.info-value.strong {
  font-size: 16px;
  font-weight: 800;
}

.state-box {
  padding: 40px 16px;
  text-align: center;
  color: #8b9097;
  font-size: 13px;
}

.error-text {
  color: #ff3b30;
}

.action-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 360px;
  max-width: 100%;
  display: flex;
  gap: 8px;
  padding: 12px 16px 24px;
  background: #ffffff;
  border-top: 1px solid #f0f1f3;
  box-sizing: border-box;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background: #ffffff;
  color: #191b1e;
  border: 1px solid #e7e9ec;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
