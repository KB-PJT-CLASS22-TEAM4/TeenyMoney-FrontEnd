<template>
  <div class="product-screen">
    <ChildPageNav title="중도해지 상세" @back="goBack" />

    <div class="scroll">
      <!-- 상품 헤더 카드 -->
      <section class="card product-card">
        <div class="title-row">
          <span class="badge" :class="badgeColor">{{ categoryLabel }}</span>
          <span class="prod-title">{{ product.title }}</span>
        </div>
        <p class="prod-desc">{{ product.originLabel }}</p>
      </section>

      <!-- 상품 기본 정보 -->
      <section class="card detail-card">
        <h3 class="card-section-title">상품 기본 정보</h3>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="d-label">상품 종류</span>
            <span class="d-value">{{ savingsTypeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">이자 계산 방식</span>
            <span class="d-value">{{ interestTypeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">약정금리</span>
            <span class="d-value">연 {{ product.appliedRate }}%</span>
          </div>
          <div class="detail-row">
            <span class="d-label">가입기간</span>
            <span class="d-value">{{ product.termMonths }}개월</span>
          </div>
          <div class="detail-row">
            <span class="d-label">가입일</span>
            <span class="d-value">{{ formatDateDot(product.startDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">중도해지일</span>
            <span class="d-value">{{ formatDateDot(result?.terminatedDate) }}</span>
          </div>
        </div>
      </section>

      <template v-if="result">
        <!-- 해지 시점 요약 -->
        <section class="card summary-card">
          <span class="summary-label">해지로 받은 최종 금액</span>
          <h2 class="summary-amount">{{ (result.finalAmount ?? 0).toLocaleString() }}원</h2>
          <div class="score-drop" v-if="result.scoreChange < 0">
            <span class="red-text">▼ {{ Math.abs(result.scoreChange) }}점</span>
            <span class="gray-text">티니점수 감소</span>
          </div>
        </section>

        <section class="card detail-card">
          <h3 class="card-section-title">해지 내역</h3>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="d-label">해지 시점까지 납입한 원금</span>
              <span class="d-value">{{ (result.principalAmount ?? 0).toLocaleString() }}원</span>
            </div>
            <div class="detail-row">
              <span class="d-label">진행률</span>
              <span class="d-value">{{ result.progressPercent ?? 0 }}%</span>
            </div>
            <div class="detail-row">
              <span class="d-label">중도해지 적용 이율</span>
              <span class="d-value blue">연 {{ result.appliedEarlyTerminationRate ?? 0 }}%</span>
            </div>
            <div class="detail-row">
              <span class="d-label">받은 이자</span>
              <span class="d-value blue">{{ (result.interestAmount ?? 0).toLocaleString() }}원</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-row final-row">
            <span class="final-label">최종 지급액</span>
            <span class="final-amount">{{ (result.finalAmount ?? 0).toLocaleString() }}원</span>
          </div>
        </section>

        <!-- 티니점수 영향 -->
        <section class="card score-card">
          <h3 class="card-section-title">티니점수 영향</h3>
          <div class="score-impact-row">
            <span v-if="result.scoreChange < 0" class="drop-badge">▼ {{ Math.abs(result.scoreChange) }}점</span>
            <span v-else-if="result.scoreChange > 0" class="up-badge">▲ {{ result.scoreChange }}점</span>
            <span v-else class="flat-badge">변화 없음</span>
            <span class="drop-sub" v-if="result.scoreChange !== 0">
              중도해지로 티니점수가 {{ result.scoreChange > 0 ? '올랐어요' : '내려갔어요' }}
            </span>
          </div>
        </section>
      </template>

      <!-- 해지 당시 상세 내역이 없는 경우 (이 기능 적용 전에 해지된 상품) -->
      <section v-else class="card notice-card">
        <p class="notice-text">
          이 상품은 예전에 해지되어<br />해지 시점의 상세 내역을 볼 수 없어요.
        </p>
      </section>
    </div>

    <Chatbot hint-text="" />
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import { parseServerDate, getKstParts } from '@/utils/datetime'

const router = useRouter()
const route = useRoute()

const product = reactive({
  id: route.query.id || '',
  title: route.query.title || '상품',
  category: route.query.category || '',
  originLabel: route.query.originLabel || '',
  productType: route.query.productType || '',
  savingsType: route.query.savingsType || '',
  interestCalculationType: route.query.interestCalculationType || '',
  appliedRate: route.query.appliedRate || 0,
  termMonths: route.query.termMonths || 0,
  startDate: route.query.startDate || '',
})

const isDeposit = computed(() => product.productType === 'DEPOSIT' || product.category === '예금')
const categoryLabel = computed(() => product.category || (isDeposit.value ? '예금' : '적금'))
const badgeColor = computed(() => (isDeposit.value ? 'blue' : 'orange'))

const savingsTypeLabel = computed(() => {
  if (isDeposit.value) return '예금'
  if (product.savingsType === 'FREE') return '자유적금'
  if (product.savingsType === 'FIXED') return '정액적금'
  return categoryLabel.value
})

const interestTypeLabel = computed(() =>
  product.interestCalculationType === 'COMPOUND' ? '복리' : '단리'
)

function formatDateDot(raw) {
  if (!raw) return '-'
  const date = parseServerDate(raw)
  if (!date) return '-'
  const { year, month, day } = getKstParts(date)
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
}

// 해지 시점에 캐싱해둔 상세 결과.
// 완료 상세 조회 API(/completion-detail)는 정상 만기·완납 대출만 지원하고
// 중도해지 건은 409로 거부하므로, 해지 실행 시점에 로컬에 저장해둔 결과를 사용한다.
const result = (() => {
  if (!product.id) return null
  try {
    const raw = localStorage.getItem(`teeny_termination_result_${product.id}`)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
})()

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

.score-drop {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.red-text {
  font-weight: 700;
  color: #e0554f;
}

.gray-text {
  font-weight: 500;
  color: #777b81;
}

.score-impact-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drop-badge {
  font-weight: 800;
  font-size: 15px;
  color: #e0554f;
}

.up-badge {
  font-weight: 800;
  font-size: 15px;
  color: #2e8540;
}

.flat-badge {
  font-weight: 700;
  font-size: 13px;
  color: #777b81;
}

.drop-sub {
  font-weight: 500;
  font-size: 12px;
  color: #777b81;
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
