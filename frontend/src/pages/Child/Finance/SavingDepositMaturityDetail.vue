<template>
  <div class="product-screen">
    <ChildPageNav title="만기 완료 상세" @back="goBack" />

    <div class="scroll">
      <!-- 상품 헤더 카드 -->
      <section class="card product-card">
        <div class="title-row">
          <span class="badge" :class="badgeColor">{{ categoryLabel }}</span>
          <span class="prod-title">{{ detail?.productName || fallback.title }}</span>
        </div>
        <p class="prod-desc">{{ fallback.originLabel }}</p>
      </section>

      <div v-if="isLoading" class="state-msg">불러오는 중이에요...</div>

      <div v-else-if="loadError" class="card notice-card">
        <p class="notice-text">{{ loadError }}</p>
      </div>

      <template v-else-if="detail">
        <!-- 상품 기본 정보 -->
        <section class="card detail-card">
          <h3 class="card-section-title">상품 기본 정보</h3>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="d-label">약정금리</span>
              <span class="d-value">연 {{ detail.appliedRate }}%</span>
            </div>
            <div class="detail-row">
              <span class="d-label">가입기간</span>
              <span class="d-value">{{ detail.termMonths }}개월</span>
            </div>
            <div class="detail-row">
              <span class="d-label">가입일</span>
              <span class="d-value">{{ formatDateDot(detail.startDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">만기일</span>
              <span class="d-value">{{ formatDateDot(detail.maturityDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">만기 처리일</span>
              <span class="d-value">{{ formatDateDot(detail.completedAt) }}</span>
            </div>
          </div>
        </section>

        <!-- 만기 시점 요약 -->
        <section class="card summary-card">
          <span class="summary-label">만기로 받은 최종 금액</span>
          <h2 class="summary-amount">{{ (detail.totalAmount ?? 0).toLocaleString() }}원</h2>
        </section>

        <section class="card detail-card">
          <h3 class="card-section-title">만기 내역</h3>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="d-label">원금</span>
              <span class="d-value">{{ (detail.principalAmount ?? 0).toLocaleString() }}원</span>
            </div>
            <div class="detail-row">
              <span class="d-label">이자</span>
              <span class="d-value blue">{{ (detail.interestAmount ?? 0).toLocaleString() }}원</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-row final-row">
            <span class="final-label">최종 지급액</span>
            <span class="final-amount">{{ (detail.totalAmount ?? 0).toLocaleString() }}원</span>
          </div>
        </section>

        <!-- 회차별 이력 -->
        <section v-if="periods.length" class="card detail-card">
          <h3 class="card-section-title">회차별 납입 내역</h3>
          <div class="period-rows">
            <div class="period-row" v-for="p in periods" :key="p.key">
              <span class="period-no">{{ p.no }}회차</span>
              <span class="period-date">{{ formatDateDot(p.date) }}</span>
              <span class="period-amount">{{ p.amount.toLocaleString() }}원</span>
            </div>
          </div>
        </section>
      </template>
    </div>

    <Chatbot hint-text="" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import { parseServerDate, getKstParts } from '@/utils/datetime'
import { getMyFinancialProductCompletionDetail } from '@/api/finance'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const fallback = {
  id: route.query.id || '',
  title: route.query.title || '상품',
  category: route.query.category || '',
  originLabel: route.query.originLabel || '',
  productTypePath: route.query.productTypePath || 'saving',
}

const detail = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const isDeposit = computed(() =>
  (detail.value?.productType || '').toUpperCase() === 'DEPOSIT' || fallback.category === '예금'
)
const categoryLabel = computed(() => fallback.category || (isDeposit.value ? '예금' : '적금'))
const badgeColor = computed(() => (isDeposit.value ? 'blue' : 'orange'))

const periods = computed(() => {
  if (!detail.value) return []
  if (Array.isArray(detail.value.savingPayments)) {
    return detail.value.savingPayments
      .filter((p) => p.status !== 'SCHEDULED')
      .map((p) => ({
        key: `saving-${p.installmentNo}`,
        no: p.installmentNo,
        date: p.paidAt,
        amount: p.paidAmount ?? 0,
      }))
  }
  if (Array.isArray(detail.value.depositPeriods)) {
    return detail.value.depositPeriods.map((p) => ({
      key: `deposit-${p.monthNo}`,
      no: p.monthNo,
      date: p.periodEndDate,
      amount: p.accumulatedAmount ?? 0,
    }))
  }
  return []
})

function formatDateDot(raw) {
  if (!raw) return '-'
  const date = parseServerDate(raw)
  if (!date) return '-'
  const { year, month, day } = getKstParts(date)
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
}

onMounted(async () => {
  if (!fallback.id) {
    loadError.value = '상품 정보를 찾을 수 없어요.'
    isLoading.value = false
    return
  }

  try {
    detail.value = await getMyFinancialProductCompletionDetail(
      authStore.accessToken,
      fallback.productTypePath,
      fallback.id
    )
  } catch (e) {
    loadError.value = e.message || '만기 상세 내역을 불러오지 못했어요.'
  } finally {
    isLoading.value = false
  }
})

function goBack() {
  router.push({ name: 'child-finance-myproducts' })
}
</script>

<style scoped>
.product-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 20px;
  background: #f8fafc;
}

.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }

.state-msg {
  text-align: center;
  padding: 40px 0;
  color: #8b9097;
  font-weight: 600;
  font-size: 13px;
}

/* 통일된 화이트 카드 스타일 */
.card {
  background: #ffffff;
  border: 1.3px solid #f0f1f3;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
}

.badge.blue {
  background: #eef4fc;
  color: #3b74b8;
  border: 1px solid #dce8f8;
}

.badge.orange {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

.prod-title {
  font-weight: 800;
  font-size: 15.5px;
  color: #15171b;
}

.prod-desc {
  margin: 2px 0 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #6b7077;
}

.card-section-title {
  margin: 0 0 14px;
  font-weight: 800;
  font-size: 14px;
  color: #15171b;
}

.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
}

.d-value {
  font-weight: 700;
  font-size: 12.5px;
  color: #15171b;
}

.d-value.blue {
  color: #4d8ad6;
}

.divider {
  height: 1px;
  background: #f0f2f4;
  margin: 14px 0 12px;
}

.final-row {
  padding-top: 2px;
}

.final-label {
  font-weight: 800;
  font-size: 14px;
  color: #15171b;
}

.final-amount {
  font-weight: 800;
  font-size: 16.5px;
  color: #15171b;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  text-align: center;
}

.summary-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6b7077;
  margin-bottom: 4px;
}

.summary-amount {
  margin: 0 0 6px;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.5px;
  color: #15171b;
}

.period-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.period-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.period-no {
  flex: 0 0 44px;
  font-weight: 700;
  color: #6b7077;
}

.period-date {
  flex: 1;
  color: #8b9097;
}

.period-amount {
  font-weight: 700;
  color: #15171b;
}

.notice-card {
  text-align: center;
  padding: 24px 16px;
}

.notice-text {
  margin: 0;
  color: #525863;
  font-weight: 500;
  font-size: 12.5px;
  line-height: 1.5;
}
</style>
