<template>
  <div class="product-screen">
    <ChildPageNav title="상환 완료 상세" @back="goBack" />

    <div class="scroll">
      <!-- 상품 헤더 카드 -->
      <section class="card product-card">
        <div class="title-row">
          <span class="badge orange">대출</span>
          <span class="prod-title">{{ product.title }}</span>
        </div>
        <p class="prod-desc">{{ product.originLabel }}</p>
      </section>

      <!-- 상품 기본 정보 -->
      <section class="card detail-card">
        <h3 class="card-section-title">상품 기본 정보</h3>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="d-label">대출 원금</span>
            <span class="d-value">{{ Number(product.principal || 0).toLocaleString() }}원</span>
          </div>
          <div class="detail-row">
            <span class="d-label">약정금리</span>
            <span class="d-value">연 {{ product.appliedRate }}%</span>
          </div>
          <div class="detail-row">
            <span class="d-label">대출기간</span>
            <span class="d-value">{{ product.termMonths }}개월</span>
          </div>
          <div class="detail-row">
            <span class="d-label">대출 개시일</span>
            <span class="d-value">{{ formatDateDot(product.startDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="d-label">상환 완료일</span>
            <span class="d-value">{{ formatDateDot(result?.repaidDate) }}</span>
          </div>
        </div>
      </section>

      <template v-if="result">
        <!-- 상환 시점 요약 -->
        <section class="card summary-card">
          <span class="summary-label">완제 시 상환한 금액</span>
          <h2 class="summary-amount">{{ (result.requestedAmount ?? 0).toLocaleString() }}원</h2>
          <div class="score-drop" v-if="result.scoreChange !== 0">
            <span :class="result.scoreChange > 0 ? 'blue-text' : 'red-text'">
              {{ result.scoreChange > 0 ? '▲' : '▼' }} {{ Math.abs(result.scoreChange) }}점
            </span>
            <span class="gray-text">티니점수 변동</span>
          </div>
        </section>

        <section class="card detail-card">
          <h3 class="card-section-title">상환 내역</h3>
          <div class="detail-rows">
            <div class="detail-row">
              <span class="d-label">원금 상환액</span>
              <span class="d-value">{{ (result.paidPrincipalAmount ?? 0).toLocaleString() }}원</span>
            </div>
            <div class="detail-row">
              <span class="d-label">연체이자 충당</span>
              <span class="d-value">{{ (result.paidInterestAmount ?? 0).toLocaleString() }}원</span>
            </div>
            <div class="detail-row">
              <span class="d-label">남은 연체이자</span>
              <span class="d-value">{{ (result.remainingOverdueInterest ?? 0).toLocaleString() }}원</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-row final-row">
            <span class="final-label">완납 상태</span>
            <span class="final-amount blue">대출 종료</span>
          </div>
        </section>

        <!-- 티니점수 영향 -->
        <section class="card score-card">
          <h3 class="card-section-title">티니점수 영향</h3>
          <div class="score-impact-row">
            <span v-if="result.scoreChange > 0" class="up-badge">▲ {{ result.scoreChange }}점</span>
            <span v-else-if="result.scoreChange < 0" class="drop-badge">▼ {{ Math.abs(result.scoreChange) }}점</span>
            <span v-else class="flat-badge">변화 없음</span>
            <span class="drop-sub" v-if="result.scoreChange !== 0">
              대출 완제로 티니점수가 {{ result.scoreChange > 0 ? '올랐어요' : '내려갔어요' }}
            </span>
          </div>
        </section>
      </template>

      <!-- 상환 당시 상세 내역이 없는 경우 (이 기능 적용 전 상환됐거나, 정상 만기 상환된 상품) -->
      <section v-else class="card notice-card">
        <p class="notice-text">
          이 대출은 상세 내역을 볼 수 없어요.<br />정해진 일정대로 완납됐거나 예전에 상환된 대출이에요.
        </p>
      </section>
    </div>

    <Chatbot hint-text="" />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import { parseServerDate, getKstParts } from '@/utils/datetime'

const router = useRouter()
const route = useRoute()

const product = reactive({
  id: route.query.id || '',
  title: route.query.title || '대출 상품',
  originLabel: route.query.originLabel || '',
  principal: route.query.principal || 0,
  appliedRate: route.query.appliedRate || 0,
  termMonths: route.query.termMonths || 0,
  startDate: route.query.startDate || '',
})

function formatDateDot(raw) {
  if (!raw) return '-'
  const date = parseServerDate(raw)
  if (!date) return '-'
  const { year, month, day } = getKstParts(date)
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
}

// 완제 시점에 캐싱해둔 상세 결과 (백엔드에 상환 이력 조회 API가 없어 로컬에서 불러온다)
const result = (() => {
  if (!product.id) return null
  try {
    const raw = localStorage.getItem(`teeny_repayment_result_${product.id}`)
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

.final-amount.blue {
  color: #3b74b8;
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

.blue-text {
  font-weight: 700;
  color: #3b74b8;
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
  color: #3b74b8;
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
