<template>
  <div class="product-screen">
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">{{ pageTitle }}</h1>
      <ChildNavActions />
    </div>

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">

      <!-- ────────── 정액적금 ────────── -->
      <template v-if="productCategory === 'SAVINGS' && !isFreeSaving">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">{{ fixedSavingTypeLine }}</p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">월 납입금액</label>
          <div class="amount-display" :class="{ hasValue: savingsForm.amount > 0 }">
            <span class="amount-value" :class="{ placeholder: savingsForm.amount === 0 }">
              {{ savingsForm.amount ? savingsForm.amount.toLocaleString() : '0' }}
            </span>
            <span class="currency-unit" :class="{ hasValue: savingsForm.amount > 0 }">원</span>
          </div>
          <div class="button-group">
            <button
              v-for="amt in [10000, 30000, 50000, 100000]"
              :key="amt" type="button" class="chip-btn"
              :class="{ active: savingsForm.amount === amt }"
              @click="savingsForm.amount = amt"
            >{{ amt / 10000 }}만</button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">가입기간</label>
          <div class="button-group">
            <button
              v-for="month in availableTerms"
              :key="month" type="button" class="chip-btn"
              :class="{ active: savingsForm.period === month }"
              @click="savingsForm.period = month"
            >{{ month }}개월</button>
          </div>
        </section>

        <section class="section auto-transfer-section">
          <div class="auto-transfer-header">
            <div class="text-group">
              <span class="toggle-title">자동이체</span>
              <span class="toggle-desc">매월 정해진 날짜에 같은 금액을 자동 납입해요</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="savingsForm.autoTransfer">
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="savingsForm.autoTransfer">
            <div class="setting-row border-top">
              <span class="setting-label">출금계좌</span>
              <span class="setting-value">티니머니 지갑</span>
            </div>
            <div class="setting-row border-top">
              <span class="setting-label">이체일</span>
              <button type="button" class="select-btn">
                <span>매월 {{ savingsForm.transferDay }}일</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9BEC5" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- ────────── 자유적금 ────────── -->
      <template v-else-if="productCategory === 'SAVINGS' && isFreeSaving">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">{{ freeSavingTypeLine }}</p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">월 목표금액</label>
          <div class="amount-display" :class="{ hasValue: savingsForm.amount > 0 }">
            <span class="amount-value" :class="{ placeholder: savingsForm.amount === 0 }">
              {{ savingsForm.amount ? savingsForm.amount.toLocaleString() : '0' }}
            </span>
            <span class="currency-unit" :class="{ hasValue: savingsForm.amount > 0 }">원</span>
          </div>
          <div class="button-group">
            <button
              v-for="amt in [10000, 30000, 50000, 100000]"
              :key="amt" type="button" class="chip-btn"
              :class="{ active: savingsForm.amount === amt }"
              @click="savingsForm.amount = amt"
            >{{ amt / 10000 }}만</button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">가입기간</label>
          <div class="button-group">
            <button
              v-for="month in availableTerms"
              :key="month" type="button" class="chip-btn"
              :class="{ active: savingsForm.period === month }"
              @click="savingsForm.period = month"
            >{{ month }}개월</button>
          </div>
        </section>

        <section class="section free-info-section">
          <div class="free-info-box">
            <p class="free-info-title">자유롭게 저축해요</p>
            <p class="free-info-desc">정해진 날짜 없이, 원할 때 원하는 만큼 저축할 수 있어요</p>
          </div>
          <div class="score-guide">
            <p class="score-guide-title">이번 달 목표금액을 채운 만큼 티니점수를 받아요</p>
            <div class="score-guide-row"><span>0%</span><span>0점</span></div>
            <div class="score-guide-row"><span>1~29%</span><span>+2점</span></div>
            <div class="score-guide-row"><span>30~59%</span><span>+4점</span></div>
            <div class="score-guide-row"><span>60~99%</span><span>+6점</span></div>
            <div class="score-guide-row highlight"><span>100% 이상</span><span>+8점</span></div>
          </div>
        </section>
      </template>

      <!-- ────────── 예금 ────────── -->
      <template v-else-if="productCategory === 'DEPOSIT'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">{{ depositTypeLine }}</p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">예치 금액 (최소 10만원)</label>
          <div class="amount-display" :class="{ hasValue: depositForm.amount > 0 }">
            <span class="amount-value" :class="{ placeholder: depositForm.amount === 0 }">
              {{ depositForm.amount ? depositForm.amount.toLocaleString() : '0' }}
            </span>
            <span class="currency-unit" :class="{ hasValue: depositForm.amount > 0 }">원</span>
          </div>
          <div class="button-group">
            <button
              v-for="amt in [100000, 150000, 200000, 250000]"
              :key="amt" type="button" class="chip-btn"
              :class="{ active: depositForm.amount === amt }"
              @click="depositForm.amount = amt"
            >{{ amt / 10000 }}만</button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">가입기간</label>
          <div class="button-group wrap">
            <button
              v-for="month in availableTerms"
              :key="month" type="button" class="chip-btn"
              :class="{ active: depositForm.period === month }"
              @click="depositForm.period = month"
            >{{ month }}개월</button>
          </div>
        </section>

        <section class="section">
          <div class="setting-row">
            <span class="setting-label">출금계좌</span>
            <span class="setting-value">티니머니 지갑</span>
          </div>
          <p class="account-note">예치 금액이 위 계좌에서 한 번에 돈이 나가요</p>
        </section>
      </template>

      <!-- ────────── 대출 ────────── -->
      <template v-else-if="productCategory === 'LOAN'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">소액대출 · 필요할 때 빌리고 매월 갚아요</p>
          <p class="rate-info"><span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">대출 금액</label>
          <div class="amount-display" :class="{ hasValue: loanForm.amount > 0 }">
            <span class="amount-value" :class="{ placeholder: loanForm.amount === 0 }">
              {{ loanForm.amount ? loanForm.amount.toLocaleString() : '0' }}
            </span>
            <span class="currency-unit" :class="{ hasValue: loanForm.amount > 0 }">원</span>
          </div>
          <div class="button-group">
            <button
              v-for="amt in [10000, 30000, 50000, 100000]"
              :key="amt" type="button" class="chip-btn"
              :class="{ active: loanForm.amount === amt }"
              @click="loanForm.amount = amt"
            >{{ amt / 10000 }}만</button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">상환기간</label>
          <div class="button-group">
            <button
              v-for="month in availableTerms"
              :key="month" type="button" class="chip-btn"
              :class="{ active: loanForm.period === month }"
              @click="loanForm.period = month"
            >{{ month }}개월</button>
          </div>
        </section>

        <section class="section auto-transfer-section">
          <div class="auto-transfer-header">
            <div class="text-group">
              <span class="toggle-title">자동상환</span>
              <span class="toggle-desc">매월 자동으로 갚아요</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="loanForm.autoTransfer">
              <span class="slider"></span>
            </label>
          </div>
          <div v-if="loanForm.autoTransfer">
            <div class="setting-row border-top">
              <span class="setting-label">출금계좌</span>
              <span class="setting-value">티니머니 지갑</span>
            </div>
            <div class="setting-row border-top">
              <span class="setting-label">상환일</span>
              <button type="button" class="select-btn">
                <span>매월 {{ loanForm.transferDay }}일</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9BEC5" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </template>

    </div>

    <!-- 하단 고정 -->
    <footer class="footer">
      <div class="maturity-box">
        <div class="maturity-top">
          <span class="maturity-label">{{ maturityLabel }}</span>
          <span class="maturity-amount" v-if="isFormValid">
            {{ calculatedReturn.total.toLocaleString() }}원
          </span>
          <span class="maturity-placeholder" v-else>금액·기간 선택 후 표시</span>
        </div>
        <div class="maturity-sub" v-if="isFormValid">
          <template v-if="productCategory === 'LOAN'">
            빌리는 금액 {{ calculatedReturn.principal.toLocaleString() }}원
            + 이자 {{ calculatedReturn.interest.toLocaleString() }}원
            <template v-if="calculatedReturn.score > 0">
              (완납하면 티니점수 +{{ calculatedReturn.score }}점)
            </template>
          </template>
          <template v-else-if="productCategory === 'SAVINGS' && isFreeSaving">
            목표달성 기준 {{ calculatedReturn.principal.toLocaleString() }}원
            + 이자 {{ calculatedReturn.interest.toLocaleString() }}원
            <template v-if="calculatedReturn.score > 0">
              + 티니점수 {{ calculatedReturn.score }}점(매달 목표 100% 달성 시)
            </template>
          </template>
          <template v-else>
            원금 {{ calculatedReturn.principal.toLocaleString() }}원
            + 이자 {{ calculatedReturn.interest.toLocaleString() }}원
            <template v-if="calculatedReturn.score > 0">
              + 티니점수 {{ calculatedReturn.score }}점<template v-if="productCategory === 'SAVINGS'">(정상 납입 시)</template>
            </template>
          </template>
        </div>
      </div>

      <div class="submit-wrapper">
        <button
          type="button" class="submit-btn"
          :class="{ active: isFormValid && !isSubmitting }"
          :disabled="!isFormValid || isSubmitting"
          @click="handleSubmit"
        >{{ isSubmitting ? '처리 중...' : submitLabel }}</button>
      </div>
    </footer>

    <!-- 에러 / 알림 커스텀 모달 -->
    <div v-if="errorModalVisible" class="error-backdrop" @click.self="closeErrorModal">
      <div class="error-dialog">
        <div class="error-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 16.5h.01" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="error-title">가입 신청 안내</h4>
        <p class="error-desc">{{ errorMessage }}</p>
        <button type="button" class="btn-error-confirm" @click="closeErrorModal">
          확인
        </button>
      </div>
    </div>

    <Chatbot v-if="!errorModalVisible" hint-text="가입 조건이나 이자 계산이 궁금하세요?" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createSavingEnrollment, createLoanEnrollment, createDepositEnrollment } from '@/api/finance'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

const router = useRouter()
const route  = useRoute()
const authStore = useAuthStore()

const categoryMap     = { '적금': 'SAVINGS', '예금': 'DEPOSIT', '대출': 'LOAN' }
const rawCategory     = route.query.category  || '적금'
const productCategory = ref(categoryMap[rawCategory] || 'SAVINGS')
const productId        = ref(Number(route.query.productId))
const productTitle    = ref(route.query.title       || '')
const productRate     = ref(route.query.rate        || '')
const periodInfo      = ref(route.query.periodInfo || '')
const limitInfo       = ref(route.query.limit       || '')
const scoreReq        = ref(route.query.scoreReq    || '')
const scoreColor      = ref(route.query.scoreColor || 'green')
const interestType    = ref(route.query.interestType || '')
const savingsType     = ref(route.query.savingsType  || '')

const availableTerms = ref(
  (route.query.terms || '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0)
)
if (availableTerms.value.length === 0) {
  availableTerms.value = [1, 3, 6, 12]
}

const isFreeSaving = computed(() => savingsType.value === '자유적금')

const depositTypeLine = computed(() =>
  interestType.value ? `정기예금 · ${interestType.value}` : '정기예금 · 목표까지 안전하게 저축'
)
const fixedSavingTypeLine = computed(() =>
  interestType.value ? `정액적립식 · ${interestType.value}` : '정액적립식 · 매월 자동저축'
)
const freeSavingTypeLine = computed(() =>
  interestType.value ? `자유적립식 · ${interestType.value}` : '자유적립식 · 원할 때 자유롭게 저축'
)

const isScrolling = ref(false)
let scrollTimer = null
function onScroll() {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => { isScrolling.value = false }, 800)
}

// 오늘 날짜의 '일(Day)'로 이체일/상환일 초기화
const todayDay = new Date().getDate()

const savingsForm = reactive({ amount: 0, period: 0, autoTransfer: true, transferDay: todayDay })
const depositForm = reactive({ amount: 0, period: 0 })
const loanForm     = reactive({ amount: 0, period: 0, autoTransfer: true, transferDay: todayDay })

const isSubmitting = ref(false)

// 에러 모달 상태 관리
const errorModalVisible = ref(false)
const errorMessage = ref('')

function showErrorModal(msg) {
  errorMessage.value = msg || '신청에 실패했어요. 다시 시도해 주세요.'
  errorModalVisible.value = true
}

function closeErrorModal() {
  errorModalVisible.value = false
}

// 예금 만기 가점표
const DEPOSIT_MATURITY_SCORE = { 1: 6, 3: 19, 6: 39, 12: 79 }
const FIXED_SAVING_MAX_SCORE = { 1: 7, 3: 22, 6: 45, 12: 91 }
const FREE_SAVING_MAX_SCORE = { 1: 8, 3: 24, 6: 48, 12: 96 }
const LOAN_COMPLETION_SCORE = 6

function parseRatePercent(str) {
  if (!str) return 0
  const nums = (str.match(/[\d.]+/g) || []).map(Number)
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const isCompound = computed(() => interestType.value.includes('복리'))

const pageTitle = computed(() => {
  if (productCategory.value === 'SAVINGS') return isFreeSaving.value ? '자유적금 가입' : '정액적금 가입'
  if (productCategory.value === 'DEPOSIT') return '예금 가입'
  if (productCategory.value === 'LOAN') return '대출 신청'
  return '상품 가입'
})

const isFormValid = computed(() => {
  if (productCategory.value === 'SAVINGS')
    return savingsForm.amount > 0 && savingsForm.period > 0
  if (productCategory.value === 'DEPOSIT')
    return depositForm.amount >= 100000 && depositForm.period > 0
  if (productCategory.value === 'LOAN')
    return loanForm.amount > 0 && loanForm.period > 0
  return false
})

const maturityLabel = computed(() =>
  productCategory.value === 'LOAN' ? '총 상환 예정 금액' : '예상 만기 수령액'
)
const submitLabel = computed(() =>
  productCategory.value === 'LOAN' ? '대출 신청하기' : '가입하기'
)

const calculatedReturn = computed(() => {
  const rate = parseRatePercent(productRate.value) / 100

  if (productCategory.value === 'SAVINGS' && savingsForm.amount > 0 && savingsForm.period > 0) {
    const monthly = savingsForm.amount
    const n = savingsForm.period
    let interest = 0
    for (let k = 1; k <= n; k++) {
      const monthsHeld = n - k + 1
      interest += isCompound.value
        ? monthly * (Math.pow(1 + rate / 12, monthsHeld) - 1)
        : monthly * rate * (monthsHeld / 12)
    }
    interest = Math.floor(interest)
    const principal = monthly * n
    const scoreTable = isFreeSaving.value ? FREE_SAVING_MAX_SCORE : FIXED_SAVING_MAX_SCORE
    return { principal, interest, score: scoreTable[n] ?? 0, total: principal + interest }
  }

  if (productCategory.value === 'DEPOSIT' && depositForm.amount >= 100000 && depositForm.period > 0) {
    const principal = depositForm.amount
    const n = depositForm.period
    const interest = Math.floor(
      isCompound.value
        ? principal * (Math.pow(1 + rate / 12, n) - 1)
        : principal * rate * (n / 12)
    )
    return { principal, interest, score: DEPOSIT_MATURITY_SCORE[n] ?? 0, total: principal + interest }
  }

  if (productCategory.value === 'LOAN' && loanForm.amount > 0 && loanForm.period > 0) {
    const principal = loanForm.amount
    const n = loanForm.period
    const interest = Math.floor(principal * rate * (n / 12))
    return { principal, interest, score: LOAN_COMPLETION_SCORE, total: principal + interest }
  }

  return { principal: 0, interest: 0, score: 0, total: 0 }
})

const goBack = () => router.back()

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    if (productCategory.value === 'SAVINGS') {
      const result = await createSavingEnrollment(authStore.accessToken, {
        productId: productId.value,
        monthlyAmount: savingsForm.amount,
        termMonths: savingsForm.period,
        autoTransfer: isFreeSaving.value ? false : savingsForm.autoTransfer,
        paymentDay: isFreeSaving.value ? 1 : savingsForm.transferDay,
      })

      router.push({
        name: 'product-confirm',
        query: {
          category: rawCategory,
          title: productTitle.value,
          amount: savingsForm.amount,
          period: savingsForm.period,
          total: calculatedReturn.value.total,
          interest: calculatedReturn.value.interest,
          enrollmentId: result.enrollmentId,
          appliedRate: result.expectedAppliedRate,
          status: result.status,
        },
      })
    } else if (productCategory.value === 'DEPOSIT') {
      const result = await createDepositEnrollment(authStore.accessToken, {
        productId: productId.value,
        amount: depositForm.amount,
        termMonths: depositForm.period,
      })

      router.push({
        name: 'product-confirm',
        query: {
          category: rawCategory,
          title: productTitle.value,
          amount: depositForm.amount,
          period: depositForm.period,
          total: calculatedReturn.value.total,
          interest: calculatedReturn.value.interest,
          enrollmentId: result.enrollmentId,
          appliedRate: result.expectedAppliedRate,
          status: result.status,
        },
      })
    } else if (productCategory.value === 'LOAN') {
      const result = await createLoanEnrollment(authStore.accessToken, {
        productId: productId.value,
        principalAmount: loanForm.amount,
        termMonths: loanForm.period,
        autoTransfer: loanForm.autoTransfer,
        paymentDay: loanForm.transferDay,
      })

      router.push({
        name: 'product-confirm',
        query: {
          category: rawCategory,
          title: productTitle.value,
          amount: loanForm.amount,
          period: loanForm.period,
          total: calculatedReturn.value.total,
          interest: calculatedReturn.value.interest,
          enrollmentId: result.enrollmentId,
          appliedRate: result.expectedAppliedRate,
          status: result.status,
        },
      })
    }
  } catch (e) {
    console.error('금융상품 신청 실패:', e.message)
    showErrorModal(e.message || '신청에 실패했어요. 다시 시도해 주세요.')
  } finally {
    isSubmitting.value = false
  }
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
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 10px;
  flex: none;
}
.icon-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
}
.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: #15171b;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 16px;
}
.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

.section {
  padding: 16px 0;
  border-bottom: 1.3px solid #f0f1f3;
}
.product-info { padding-top: 0; }

.product-name {
  font-weight: 800;
  font-size: 18px;
  color: #15171b;
  margin: 0 0 4px;
}
.product-type {
  margin: 0 0 8px;
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}
.rate-info {
  margin: 0 0 2px;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
}
.score-requirement {
  margin: 0 0 2px;
  font-weight: 600;
  font-size: 13px;
  color: #8b9097;
}
.limit-info {
  margin: 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}

.limit-info.limit-info-strong {
  font-weight: 800;
  font-size: 16px;
  color: #15171b;
}

.highlight-blue   { color: #4d8ad6; font-weight: 700; }
.highlight-green  { color: #62b24a; font-weight: 700; }
.highlight-yellow { color: #b8901f; font-weight: 700; }
.highlight-orange { color: #f57c00; font-weight: 700; }
.highlight-red    { color: #e0554f; font-weight: 700; }

.input-label {
  display: block;
  font-weight: 700;
  font-size: 12.5px;
  color: #8b9097;
  margin-bottom: 10px;
}

.amount-display {
  display: flex;
  align-items: baseline;
  border-bottom: 1.3px solid #e7e9ec;
  padding-bottom: 8px;
  margin-bottom: 14px;
  transition: border-color 0.2s;
}
.amount-display.hasValue { border-bottom-color: #15171b; }
.amount-value {
  font-weight: 800;
  font-size: 26px;
  color: #15171b;
  margin-right: 4px;
}
.amount-value.placeholder { color: #c6cbd2; }
.currency-unit { font-weight: 600; font-size: 15px; color: #c6cbd2; }
.currency-unit.hasValue { color: #15171b; }

.button-group {
  display: flex;
  gap: 8px;
}
.button-group.wrap { flex-wrap: wrap; }
.button-group.wrap .chip-btn { flex: 0 0 calc(50% - 4px); }

.chip-btn {
  flex: 1;
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  border-radius: 10px;
  padding: 10px 0;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  color: #4a4e55;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chip-btn.active {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #ffffff;
  font-weight: 700;
}

.auto-transfer-section { border-bottom: none; }
.auto-transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.toggle-title { font-weight: 700; font-size: 14px; color: #15171b; }
.toggle-desc  { display: block; font-weight: 500; font-size: 11.5px; color: #b9bec5; margin-top: 2px; }

.free-info-section { border-bottom: none; }

.free-info-box {
  background: #fff9e8;
  border: 1.3px solid #ffe9b3;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.free-info-title {
  margin: 0 0 3px;
  font-weight: 800;
  font-size: 13.5px;
  color: #15171b;
}
.free-info-desc {
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  color: #8b7a45;
}

.score-guide {
  border: 1.3px solid #f0f1f3;
  border-radius: 12px;
  padding: 12px 14px;
}
.score-guide-title {
  margin: 0 0 8px;
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
}
.score-guide-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-weight: 600;
  font-size: 12.5px;
  color: #8b9097;
}
.score-guide-row.highlight {
  color: #b8901f;
  font-weight: 800;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 25px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #e7e9ec;
  border-radius: 25px;
  transition: .3s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 19px; width: 19px;
  left: 3px; bottom: 3px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  border-radius: 50%;
  transition: .3s;
}
input:checked + .slider { background: #ffbc00; }
input:checked + .slider:before { transform: translateX(17px); }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}
.setting-row.border-top { border-top: 1.3px solid #f0f1f3; }
.setting-label { font-weight: 600; font-size: 13px; color: #8b9097; }
.setting-value { font-weight: 700; font-size: 13px; color: #15171b; }
.account-note  { margin: 0; font-weight: 500; font-size: 11.5px; color: #b9bec5; }

.select-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
  cursor: pointer;
}

.footer {
  box-sizing: border-box;
  width: 100%;
  flex: none;
  padding: 8px 20px 16px;
  background: #ffffff;
}
.maturity-box {
  box-sizing: border-box;
  padding: 14px 16px;
  background: #f7f8fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.maturity-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.maturity-label       { font-weight: 700; font-size: 13px; color: #4a4e55; }
.maturity-placeholder { font-weight: 600; font-size: 12px; color: #c6cbd2; }
.maturity-amount      { font-weight: 800; font-size: 20px; color: #15171b; }
.maturity-sub         { font-weight: 500; font-size: 11px; color: #a0a5ad; }

.submit-wrapper { width: 100%; }
.submit-btn {
  width: 100%;
  height: 48px;
  background: #f2f4f6;
  border-radius: 12px;
  border: none;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  color: #9ca1a8;
  cursor: not-allowed;
  transition: all 0.2s ease;
}
.submit-btn.active {
  background: #ffbc00;
  color: #15171b;
  cursor: pointer;
}

/* ────────── 에러/알림 모달 ────────── */
.error-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  animation: fadeIn 0.2s ease-out;
}

.error-dialog {
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  text-align: center;
  box-sizing: border-box;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.error-icon-wrap {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  margin: 0 0 6px;
  font-size: 16.5px;
  font-weight: 800;
  color: #15171b;
}

.error-desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.btn-error-confirm {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.btn-error-confirm:active {
  opacity: 0.85;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>