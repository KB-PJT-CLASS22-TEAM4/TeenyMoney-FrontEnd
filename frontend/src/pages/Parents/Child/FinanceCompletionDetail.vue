<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">만기·완납 이력</h1>
      <ParentNavActions />
    </header>

    <div v-if="isLoading" class="state-box">이력을 불러오는 중입니다...</div>
    <div v-else-if="errorMessage" class="state-box error-text">
      {{ errorMessage }}
      <button class="list-back-btn" type="button" @click="goToProductList">
        목록으로 돌아가기
      </button>
    </div>
    <div v-else-if="!detail" class="state-box">
      완료 이력을 찾을 수 없습니다.
      <button class="list-back-btn" type="button" @click="goToProductList">
        목록으로 돌아가기
      </button>
    </div>

    <div v-else class="content">
      <section class="info-card">
        <div class="head-row">
          <div>
            <p class="label">{{ categoryLabel }}</p>
            <p class="title">{{ detail.productName || '금융 상품' }}</p>
          </div>
          <span class="status-badge" :class="statusClass">
            {{ completionLabel }}
          </span>
        </div>
        <p class="period">
          {{ formatDate(detail.startDate) }}
          ~
          {{ formatDate(detail.maturityDate || detail.completedAt) }}
        </p>
      </section>

      <section class="info-card">
        <div class="info-row">
          <p class="info-label">적용 금리</p>
          <p class="info-value">{{ formatRate(detail.appliedRate) }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">원금</p>
          <p class="info-value">{{ formatAmount(detail.principalAmount) }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">이자</p>
          <p class="info-value">{{ formatAmount(detail.interestAmount) }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">{{ isLoan ? '상환 총액' : '만기 수령액' }}</p>
          <p class="info-value strong">{{ formatAmount(detail.totalAmount) }}</p>
        </div>
        <div class="info-row">
          <p class="info-label">가입 기간</p>
          <p class="info-value">
            {{ detail.termMonths ? `${detail.termMonths}개월` : '-' }}
          </p>
        </div>
        <div class="info-row">
          <p class="info-label">{{ isLoan ? '완납일' : '만기일' }}</p>
          <p class="info-value">{{ formatDateTime(detail.completedAt) }}</p>
        </div>
      </section>

      <section v-if="isDeposit" class="history-card">
        <h2 class="history-title">예금 운용 이력</h2>
        <p v-if="!depositPeriods.length" class="empty-history">
          조회된 예금 이력이 없습니다.
        </p>
        <article
          v-for="item in depositPeriods"
          :key="`deposit-${item.monthNo}`"
          class="history-item"
        >
          <div class="history-head">
            <strong>{{ item.monthNo }}개월차</strong>
            <span>{{ formatDate(item.periodEndDate) }}</span>
          </div>
          <div class="history-grid">
            <p><span>원금</span><b>{{ formatAmount(item.principalAmount) }}</b></p>
            <p><span>누적 금액</span><b>{{ formatAmount(item.accumulatedAmount) }}</b></p>
            <p><span>누적 이자</span><b>{{ formatAmount(item.cumulativeInterestAmount) }}</b></p>
          </div>
        </article>
      </section>

      <section v-else-if="isSaving" class="history-card">
        <h2 class="history-title">적금 납입 이력</h2>
        <p v-if="!savingPayments.length" class="empty-history">
          조회된 납입 이력이 없습니다.
        </p>
        <article
          v-for="item in savingPayments"
          :key="`saving-${item.installmentNo}`"
          class="history-item"
        >
          <div class="history-head">
            <strong>{{ item.installmentNo }}회차</strong>
            <span class="row-badge">{{ paymentStatusLabel(item.status) }}</span>
          </div>
          <div class="history-grid">
            <p><span>예정 금액</span><b>{{ formatAmount(item.scheduledAmount) }}</b></p>
            <p><span>납입 금액</span><b>{{ formatAmount(item.paidAmount) }}</b></p>
            <p><span>이자</span><b>{{ formatAmount(item.interestAmount) }}</b></p>
            <p><span>납입일</span><b>{{ formatDateTime(item.paidAt) }}</b></p>
          </div>
        </article>
      </section>

      <section v-else class="history-card">
        <h2 class="history-title">대출 상환 이력</h2>
        <p v-if="!loanRepayments.length" class="empty-history">
          조회된 상환 이력이 없습니다.
        </p>
        <article
          v-for="item in loanRepayments"
          :key="`loan-${item.installmentNo}`"
          class="history-item"
        >
          <div class="history-head">
            <strong>{{ item.installmentNo }}회차</strong>
            <span class="row-badge">{{ paymentStatusLabel(item.status) }}</span>
          </div>
          <div class="history-grid">
            <p><span>납기일</span><b>{{ formatDate(item.dueDate) }}</b></p>
            <p><span>상환일</span><b>{{ formatDateTime(item.paidAt || item.processedAt) }}</b></p>
            <p><span>원금</span><b>{{ formatAmount(item.principalAmount) }}</b></p>
            <p><span>이자</span><b>{{ formatAmount(item.interestAmount) }}</b></p>
            <p><span>납입 원금</span><b>{{ formatAmount(item.paidPrincipalAmount) }}</b></p>
            <p><span>납입 이자</span><b>{{ formatAmount(item.paidInterestAmount) }}</b></p>
            <p v-if="formatRepaymentType(item.repaymentType)">
              <span>상환 방식</span>
              <b>{{ formatRepaymentType(item.repaymentType) }}</b>
            </p>
            <p v-if="item.overdueStartAt">
              <span>연체 시작</span>
              <b>{{ formatDateTime(item.overdueStartAt) }}</b>
            </p>
          </div>
        </article>
      </section>

      <button class="list-back-btn" type="button" @click="goToProductList">
        목록으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import { useAuthStore } from '@/stores/auth'
import { getChildFinancialProductCompletionDetail } from '@/api/financialProducts'
import { formatRepaymentType } from '@/utils/financialProductMapper'
import { formatKstDate, formatKstDateTime } from '@/utils/datetime'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childId = Number(route.params.childId)
const productType = route.params.productType
const enrollmentId = Number(route.params.enrollmentId)

const detail = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const resolvedType = computed(() => {
  const raw = String(detail.value?.productType || productType || '').toUpperCase()
  if (raw.includes('LOAN') || raw.includes('대출')) return 'LOAN'
  if (raw.includes('DEPOSIT') || raw.includes('예금')) return 'DEPOSIT'
  return 'SAVING'
})

const isLoan = computed(() => resolvedType.value === 'LOAN')
const isDeposit = computed(() => resolvedType.value === 'DEPOSIT')
const isSaving = computed(() => resolvedType.value === 'SAVING')

const categoryLabel = computed(() => {
  if (isLoan.value) return '대출'
  if (isDeposit.value) return '예금'
  return '적금'
})

const completionLabel = computed(() => {
  const type = String(detail.value?.completionType || '').toUpperCase()
  const status = String(detail.value?.status || '').toUpperCase()

  if (type.includes('REPAY') || status.includes('REPAY') || isLoan.value) {
    return '완납'
  }
  if (type.includes('MATUR') || status.includes('MATUR') || status === 'COMPLETED') {
    return '만기'
  }
  return isLoan.value ? '완납' : '만기'
})

const statusClass = computed(() => (isLoan.value ? 'repaid' : 'matured'))

const depositPeriods = computed(() =>
  [...(detail.value?.depositPeriods || [])].sort(
    (a, b) => Number(a.monthNo || 0) - Number(b.monthNo || 0)
  )
)

const savingPayments = computed(() =>
  [...(detail.value?.savingPayments || [])].sort(
    (a, b) => Number(a.installmentNo || 0) - Number(b.installmentNo || 0)
  )
)

const loanRepayments = computed(() =>
  [...(detail.value?.loanRepayments || [])].sort(
    (a, b) => Number(a.installmentNo || 0) - Number(b.installmentNo || 0)
  )
)

function formatAmount(value) {
  if (value == null || value === '') return '-'
  return `${Number(value).toLocaleString()}원`
}

function formatRate(value) {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' && value.includes('%')) return value
  return `연 ${value}%`
}

function formatDate(value) {
  return formatKstDate(value, '-')
}

function formatDateTime(value) {
  return formatKstDateTime(value, '-')
}

function paymentStatusLabel(status) {
  const raw = String(status || '').toUpperCase()
  const labels = {
    PAID: '납입 완료',
    COMPLETED: '완료',
    SUCCESS: '완료',
    SCHEDULED: '예정',
    PENDING: '대기',
    OVERDUE: '연체',
    LATE: '연체',
    SKIPPED: '미납',
    UNPAID: '미납',
  }
  return labels[raw] || status || '-'
}

function goToProductList() {
  router.push({
    name: 'parents-child-finance',
    params: { childId },
  })
}

async function fetchDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (!authStore.accessToken) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return
    }

    const result = await getChildFinancialProductCompletionDetail(
      authStore.accessToken,
      childId,
      productType,
      enrollmentId
    )

    detail.value = result?.data ?? result
  } catch (error) {
    console.error('완료 금융상품 이력 조회 실패:', error)
    errorMessage.value =
      error.message || '만기·완납된 상품의 실제 이력만 조회할 수 있어요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.page {
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
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

.content {
  padding: 16px;
}

.info-card,
.history-card {
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

.period {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.matured {
  background: #e8f8ee;
  color: #1f9d4b;
}

.status-badge.repaid {
  background: #eef4ff;
  color: #2e7bf0;
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
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
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

.history-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
}

.empty-history {
  margin: 0;
  padding: 18px 0;
  color: #b9bec5;
  font-size: 13px;
  text-align: center;
}

.history-item + .history-item {
  margin-top: 10px;
}

.history-item {
  padding: 12px;
  border-radius: 12px;
  background: #f7f8fa;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.history-head strong {
  font-size: 13px;
  font-weight: 800;
  color: #191b1e;
}

.history-head span {
  font-size: 12px;
  font-weight: 600;
  color: #8b9097;
}

.row-badge {
  padding: 3px 8px;
  border-radius: 999px;
  background: #ffffff;
  color: #5b6168;
}

.history-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
}

.history-grid p {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-grid span {
  font-size: 11px;
  font-weight: 600;
  color: #8b9097;
}

.history-grid b {
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
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

.list-back-btn {
  width: 100%;
  height: 49px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: #ffbc00;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.state-box .list-back-btn {
  margin-top: 16px;
}
</style>
