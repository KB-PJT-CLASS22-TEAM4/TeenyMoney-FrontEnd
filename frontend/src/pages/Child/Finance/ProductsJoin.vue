<template>
  <div class="product-screen">
    <ChildPageNav :title="pageTitle" @back="goBack" />

    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">

      <!-- ────────── 정액적금 ────────── -->
      <template v-if="productCategory === 'SAVINGS' && !isFreeSaving">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">
            {{ fixedSavingTypeLine }}
            <button type="button" class="btn-help-inline" @click.stop="openTermModal(interestType || '정액적립식')" aria-label="도움말 보기">?</button>
          </p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('티니점수')" aria-label="도움말 보기">?</button>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">월 납입금액</label>
          <div class="amount-input-wrap" :class="{ hasValue: savingsForm.amount > 0, error: Boolean(savingsAmountError) }">
            <input
              type="text"
              inputmode="numeric"
              class="amount-input"
              :value="formatAmount(savingsForm.amount)"
              @input="onAmountInput($event, savingsForm)"
              placeholder="0"
            />
            <span class="currency-unit" :class="{ hasValue: savingsForm.amount > 0 }">원</span>
            <button
              v-if="savingsForm.amount > 0"
              type="button"
              class="clear-amount-btn"
              @click="savingsForm.amount = 0"
            >
              지우기
            </button>
          </div>
          <p v-if="savingsAmountError" class="amount-error-msg">{{ savingsAmountError }}</p>
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
          </div>
          <div>
            <div class="setting-row border-top">
              <span class="setting-label">출금지갑</span>
              <span class="setting-value">티니머니 지갑</span>
            </div>
            <div class="setting-row border-top">
              <span class="setting-label">이체일</span>
              <button type="button" class="select-btn" @click="openDayPicker('savings')">
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
          <p class="product-type">
            {{ freeSavingTypeLine }}
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('자유적립식')" aria-label="도움말 보기">?</button>
          </p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('티니점수')" aria-label="도움말 보기">?</button>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">한 달 목표금액 (최소 1만원)</label>
          <div class="amount-input-wrap" :class="{ hasValue: savingsForm.amount > 0, error: Boolean(savingsAmountError) }">
            <input
              type="text"
              inputmode="numeric"
              class="amount-input"
              :value="formatAmount(savingsForm.amount)"
              @input="onAmountInput($event, savingsForm)"
              placeholder="0"
            />
            <span class="currency-unit" :class="{ hasValue: savingsForm.amount > 0 }">원</span>
            <button
              v-if="savingsForm.amount > 0"
              type="button" class="clear-amount-btn"
              @click="savingsForm.amount = 0"
            >
              지우기
            </button>
          </div>
          <p v-if="savingsAmountError" class="amount-error-msg">{{ savingsAmountError }}</p>
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
              <span class="toggle-title">납입일 지정</span>
              <span class="toggle-desc">직접 입금할 때 기준이 될 날짜를 정해두면 알림으로 알려드려요</span>
            </div>
          </div>
          <div>
            <div class="setting-row border-top">
              <span class="setting-label">납입일</span>
              <button type="button" class="select-btn" @click="openDayPicker('freeSaving')">
                <span>매월 {{ savingsForm.transferDay }}일</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9BEC5" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="free-warning-box">
            <div class="free-warning-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" stroke="#e0554f" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M12 10v4.5" stroke="#e0554f" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="17.3" r="1" fill="#e0554f"/>
              </svg>
            </div>
            <div class="free-warning-text">
              <p class="free-warning-title">지정한 납입일에 못 넣으면?</p>
              <p class="free-warning-desc">
                지정한 납입일까지 돈을 넣지 않은 달은 티니점수를 받지 못해요.<br>
                가입기간 중 돈을 넣은 달이 <strong>70% 미만</strong>이면 만기를 채우지
                못하고 <strong>중도해지</strong>로 처리되며, 약정기간·경과율에 따라
                티니점수가 감점돼요.
              </p>
            </div>
          </div>
        </section>

        <section class="section free-info-section">
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
          <p class="product-type">
            {{ depositTypeLine }}
            <button type="button" class="btn-help-inline" @click.stop="openTermModal(interestType || '단리')" aria-label="도움말 보기">?</button>
          </p>
          <p class="rate-info">{{ periodInfo }}, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('티니점수')" aria-label="도움말 보기">?</button>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">예치 금액 (최소 1만원)</label>
          <div class="amount-input-wrap" :class="{ hasValue: depositForm.amount > 0, error: Boolean(depositAmountError) }">
            <input
              type="text"
              inputmode="numeric"
              class="amount-input"
              :value="formatAmount(depositForm.amount)"
              @input="onAmountInput($event, depositForm)"
              placeholder="0"
            />
            <span class="currency-unit" :class="{ hasValue: depositForm.amount > 0 }">원</span>
            <button
              v-if="depositForm.amount > 0"
              type="button" class="clear-amount-btn"
              @click="depositForm.amount = 0"
            >
              지우기
            </button>
          </div>
          <p v-if="depositAmountError" class="amount-error-msg">{{ depositAmountError }}</p>
          <div class="button-group">
            <button
              v-for="amt in [10000, 30000, 50000, 100000]"
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
            <span class="setting-label">출금지갑</span>
            <span class="setting-value">티니머니 지갑</span>
          </div>
          <p class="account-note">예치 금액이 위 계좌에서 한 번에 돈이 나가요</p>
        </section>
      </template>

      <!-- ────────── 대출 ────────── -->
      <template v-else-if="productCategory === 'LOAN'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">
            소액대출 · 필요할 때 빌리고 매월 갚아요
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('원리금균등상환')" aria-label="도움말 보기">?</button>
          </p>
          <p class="rate-info"><span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement" v-if="scoreReq">
            티니점수 <span :class="`highlight-${scoreColor}`">{{ scoreReq }}</span>
            <button type="button" class="btn-help-inline" @click.stop="openTermModal('티니점수')" aria-label="도움말 보기">?</button>
          </p>
          <p class="limit-info limit-info-strong" v-if="limitInfo">{{ limitInfo }}</p>
        </section>

        <section class="section">
          <label class="input-label">대출 금액</label>
          <div class="amount-input-wrap" :class="{ hasValue: loanForm.amount > 0, error: Boolean(loanAmountError) }">
            <input
              type="text"
              inputmode="numeric"
              class="amount-input"
              :value="formatAmount(loanForm.amount)"
              @input="onAmountInput($event, loanForm)"
              placeholder="0"
            />
            <span class="currency-unit" :class="{ hasValue: loanForm.amount > 0 }">원</span>
            <button
              v-if="loanForm.amount > 0"
              type="button" class="clear-amount-btn"
              @click="loanForm.amount = 0"
            >
              지우기
            </button>
          </div>
          <p v-if="loanAmountError" class="amount-error-msg">{{ loanAmountError }}</p>
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
          </div>
          <div>
            <div class="setting-row border-top">
              <span class="setting-label">출금지갑</span>
              <span class="setting-value">티니머니 지갑</span>
            </div>
            <div class="setting-row border-top">
              <span class="setting-label">상환일</span>
              <button type="button" class="select-btn" @click="openDayPicker('loan')">
                <span>매월 {{ loanForm.transferDay }}일</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9BEC5" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- 만기 수령액 + 가입 버튼 (스크롤에 포함) -->
      <div class="footer">
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
            :class="{ active: isFormValid }"
            :disabled="!isFormValid"
            @click="handleSubmit"
          >{{ submitLabel }}</button>
        </div>
      </div>
    </div>

    <!-- 상환일/이체일 달력 선택 바텀시트 -->
    <transition name="sheet-fade">
      <div v-if="showDayPickerSheet" class="sheet-dim" @click="closeDayPicker">
        <div class="sheet day-picker-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <h3 class="sheet-title">{{ dayPickerTitle }}</h3>
            <button type="button" class="sheet-close-btn" @click="closeDayPicker" aria-label="닫기">✕</button>
          </div>

          <div class="cal-days-grid">
            <button
              v-for="d in 28"
              :key="d"
              type="button"
              class="cal-day-cell"
              :class="{ active: selectedTempDay === d, today: d === todayDay }"
              @click="selectDay(d)"
            >
              <span class="day-num">{{ d }}</span>
              <span v-if="d === todayDay && selectedTempDay !== d" class="today-dot"></span>
            </button>
          </div>

          <div class="cal-footer-info">
            <p class="cal-notice-text">
              {{ dayPickerNoticeText }}
            </p>
          </div>

          <button type="button" class="sheet-apply-btn" @click="confirmDaySelection">
            매월 {{ selectedTempDay }}일로 설정하기
          </button>
        </div>
      </div>
    </transition>

    <!-- 금융 용어 사전 도움말 모달 -->
    <FinanceTermModal
      :show="showTermModal"
      :term-data="activeTermData"
      @close="closeTermModal"
    />

    <Chatbot :hide-for-modal="showDayPickerSheet || showTermModal" hint-text="금융 상품 가입이 어려우신가요?" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFinanceTerm } from '@/constants/financeTerms'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import FinanceTermModal from '@/components/Child/FinanceTermModal.vue'

const router = useRouter()
const route  = useRoute()

// 어려운 금융 용어 설명 모달 상태
const showTermModal = ref(false)
const activeTermData = ref(null)

function openTermModal(termName) {
  const data = getFinanceTerm(termName)
  if (data) {
    activeTermData.value = data
    showTermModal.value = true
  }
}

function closeTermModal() {
  showTermModal.value = false
  activeTermData.value = null
}

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

const savingsForm = reactive({ amount: 0, period: 0, autoTransfer: true, transferDay: Math.min(todayDay, 28) })
const depositForm = reactive({ amount: 0, period: 0 })
const loanForm     = reactive({ amount: 0, period: 0, autoTransfer: true, transferDay: Math.min(todayDay, 28) })

// 이체일/상환일/납입일 달력 선택 바텀시트 상태
const showDayPickerSheet = ref(false)
const dayPickerTarget = ref('savings') // 'savings' | 'freeSaving' | 'loan'
const selectedTempDay = ref(Math.min(todayDay, 28))

function openDayPicker(target) {
  dayPickerTarget.value = target
  selectedTempDay.value = target === 'loan' ? loanForm.transferDay : savingsForm.transferDay
  showDayPickerSheet.value = true
}

const dayPickerTitle = computed(() => {
  if (dayPickerTarget.value === 'loan') return '매월 상환일 선택'
  if (dayPickerTarget.value === 'freeSaving') return '매월 납입일 선택'
  return '매월 자동이체일 선택'
})

const dayPickerNoticeText = computed(() => {
  if (dayPickerTarget.value === 'freeSaving') {
    return `매월 ${selectedTempDay.value}일에 납입하도록 알려드려요`
  }
  const verb = dayPickerTarget.value === 'loan' ? '상환' : '이체'
  return `매월 ${selectedTempDay.value}일에 자동으로 ${verb}돼요`
})

function closeDayPicker() {
  showDayPickerSheet.value = false
}

function selectDay(d) {
  selectedTempDay.value = d
}

function confirmDaySelection() {
  if (dayPickerTarget.value === 'loan') {
    loanForm.transferDay = selectedTempDay.value
  } else {
    savingsForm.transferDay = selectedTempDay.value
  }
  showDayPickerSheet.value = false
}

function formatAmount(amt) {
  if (!amt || amt === 0) return ''
  return amt.toLocaleString()
}

function onAmountInput(event, form) {
  const raw = event.target.value.replace(/[^\d]/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  form.amount = num
  event.target.value = num > 0 ? num.toLocaleString() : ''
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

// 한도 문자열에서 최대 금액 숫자 파싱 (예: "최대 10만원" -> 100000, "100,000원" -> 100000)
function parseMaxLimit(str) {
  if (!str) return null
  const cleaned = str.replace(/,/g, '')
  const numMatches = cleaned.match(/\d+/g)
  if (!numMatches || numMatches.length === 0) return null
  const baseNum = parseInt(numMatches[0], 10)
  if (str.includes('만')) return baseNum * 10000
  if (str.includes('억')) return baseNum * 100000000
  return baseNum
}

const maxLimitAmount = computed(() => {
  const queryLimit = Number(route.query.maximumAmount)
  if (Number.isFinite(queryLimit) && queryLimit > 0) return queryLimit
  return parseMaxLimit(limitInfo.value)
})

// 최소 / 최대 금액 검증 에러 (모달 대신 입력칸 아래 실시간 경고)
const savingsAmountError = computed(() => {
  if (savingsForm.amount <= 0) return ''
  if (savingsForm.amount < 10000) {
    return '최소 10,000원 이상 입력해 주세요'
  }
  if (maxLimitAmount.value && savingsForm.amount > maxLimitAmount.value) {
    return `납입한도를 초과했어요 (최대 ${maxLimitAmount.value.toLocaleString()}원)`
  }
  return ''
})

const depositAmountError = computed(() => {
  if (depositForm.amount <= 0) return ''
  if (depositForm.amount < 10000) {
    return '최소 10,000원 이상 예치해 주세요'
  }
  if (maxLimitAmount.value && depositForm.amount > maxLimitAmount.value) {
    return `예치한도를 초과했어요 (최대 ${maxLimitAmount.value.toLocaleString()}원)`
  }
  return ''
})

const loanAmountError = computed(() => {
  if (loanForm.amount <= 0) return ''
  if (loanForm.amount < 10000) {
    return '최소 10,000원 이상 신청해 주세요'
  }
  if (maxLimitAmount.value && loanForm.amount > maxLimitAmount.value) {
    return `대출한도를 초과했어요 (최대 ${maxLimitAmount.value.toLocaleString()}원)`
  }
  return ''
})

const pageTitle = computed(() => {
  if (productCategory.value === 'SAVINGS') return isFreeSaving.value ? '자유적금 가입' : '정액적금 가입'
  if (productCategory.value === 'DEPOSIT') return '예금 가입'
  if (productCategory.value === 'LOAN') return '대출 신청'
  return '상품 가입'
})

const isFormValid = computed(() => {
  if (productCategory.value === 'SAVINGS')
    return savingsForm.amount >= 10000 && !savingsAmountError.value && savingsForm.period > 0
  if (productCategory.value === 'DEPOSIT')
    return depositForm.amount >= 10000 && !depositAmountError.value && depositForm.period > 0
  if (productCategory.value === 'LOAN')
    return loanForm.amount >= 10000 && !loanAmountError.value && loanForm.period > 0
  return false
})

const maturityLabel = computed(() =>
  productCategory.value === 'LOAN' ? '총 상환 예정 금액' : '예상 만기 수령액'
)
const submitLabel = computed(() =>
  productCategory.value === 'LOAN' ? '대출 신청하기' : '가입하기'
)

const calculatedReturn = computed(() => {
  const queryRate = Number(route.query.myAppliedRate)
  const rate = queryRate > 0 ? queryRate / 100 : (parseRatePercent(productRate.value) || 3.0) / 100

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

  if (productCategory.value === 'DEPOSIT' && depositForm.amount >= 10000 && depositForm.period > 0) {
    const principal = depositForm.amount
    const n = depositForm.period
    const interest = Math.floor(
      isCompound.value
        ? principal * (Math.pow(1 + rate / 12, n) - 1)
        : principal * rate * (n / 12)
    )
    return { principal, interest, score: DEPOSIT_MATURITY_SCORE[n] ?? 0, total: principal + interest }
  }

  if (productCategory.value === 'LOAN' && loanForm.amount >= 10000 && loanForm.period > 0) {
    const principal = loanForm.amount
    const n = loanForm.period
    const interest = Math.floor(principal * rate * (n / 12))
    return { principal, interest, score: LOAN_COMPLETION_SCORE, total: principal + interest }
  }

  return { principal: 0, interest: 0, score: 0, total: 0 }
})

const goBack = () => router.back()

// 실제 가입 처리는 가입 확인 페이지에서 "가입 완료"를 눌렀을 때 이루어진다.
// 이 화면에서는 입력한 내용을 확인 페이지로 넘기기만 한다.
const handleSubmit = () => {
  if (!isFormValid.value) return

  if (productCategory.value === 'SAVINGS') {
    router.push({
      name: 'product-confirm',
      query: {
        category: rawCategory,
        title: productTitle.value,
        productId: productId.value,
        amount: savingsForm.amount,
        period: savingsForm.period,
        total: calculatedReturn.value.total,
        interest: calculatedReturn.value.interest,
        rate: productRate.value,
        autoTransfer: isFreeSaving.value ? false : savingsForm.autoTransfer,
        paymentDay: savingsForm.transferDay,
        savingsType: savingsType.value,
        interestType: interestType.value || '단리',
      },
    })
  } else if (productCategory.value === 'DEPOSIT') {
    router.push({
      name: 'product-confirm',
      query: {
        category: rawCategory,
        title: productTitle.value,
        productId: productId.value,
        amount: depositForm.amount,
        period: depositForm.period,
        total: calculatedReturn.value.total,
        interest: calculatedReturn.value.interest,
        rate: productRate.value,
        interestType: interestType.value || '단리',
      },
    })
  } else if (productCategory.value === 'LOAN') {
    router.push({
      name: 'product-confirm',
      query: {
        category: rawCategory,
        title: productTitle.value,
        productId: productId.value,
        amount: loanForm.amount,
        period: loanForm.period,
        total: calculatedReturn.value.total,
        interest: calculatedReturn.value.interest,
        rate: productRate.value,
        autoTransfer: loanForm.autoTransfer,
        paymentDay: loanForm.transferDay,
        repaymentType: route.query.repaymentType || '',
      },
    })
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
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 10px;
  background: #f8fafc;
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
  background: #f8fafc;
}
.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

.section {
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

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
  color: #8b9097;
}
.rate-info {
  margin: 0 0 2px;
  font-weight: 500;
  font-size: 13px;
  color: #6b7077;
}
.score-requirement {
  margin: 0 0 2px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7077;
}
.limit-info {
  margin: 0;
  font-weight: 500;
  font-size: 12.5px;
  color: #8b9097;
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
  color: #6b7077;
  margin-bottom: 10px;
}

.amount-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid #e7e9ec;
  padding-bottom: 6px;
  margin-bottom: 14px;
  transition: border-color 0.2s;
}
.amount-input-wrap.hasValue {
  border-bottom-color: #15171b;
}
.amount-input-wrap:focus-within {
  border-bottom-color: #ffbc00;
}
.amount-input-wrap.error {
  border-bottom-color: #e0554f !important;
}

.amount-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-weight: 800;
  font-size: 26px;
  color: #15171b;
  outline: none;
  letter-spacing: -0.5px;
}
.amount-input::placeholder {
  color: #989ca2;
  font-weight: 700;
}

.currency-unit {
  font-weight: 700;
  font-size: 16px;
  color: #989ca2;
  margin-left: 4px;
  margin-right: 14px;
}
.currency-unit.hasValue {
  color: #15171b;
}

.clear-amount-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #4d596b;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: -0.2px;
  transition: all 0.15s ease;
}
.clear-amount-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.btn-help-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  margin-left: 4px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #4d596b;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  vertical-align: middle;
  padding: 0;
  line-height: 1;
  transition: all 0.15s ease;
}

.btn-help-inline:hover {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #15171b;
  transform: scale(1.18);
}

.amount-error-msg {
  margin: -6px 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #e0554f;
  letter-spacing: -0.2px;
}

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

.auto-transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.toggle-title { font-weight: 700; font-size: 14px; color: #15171b; }
.toggle-desc  { display: block; font-weight: 500; font-size: 11.5px; color: #8b9097; margin-top: 2px; }


.score-guide {
  padding: 0;
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
  color: #6b7077;
}
.score-guide-row.highlight {
  color: #b8901f;
  font-weight: 800;
}

.free-warning-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fdf0ef;
  border: 1px solid #f6cfcc;
  border-radius: 14px;
  padding: 12px 14px;
  margin-top: 12px;
  box-sizing: border-box;
}
.free-warning-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.free-warning-text {
  min-width: 0;
}
.free-warning-title {
  margin: 0 0 3px;
  font-weight: 800;
  font-size: 13.5px;
  color: #e0554f;
  word-break: keep-all;
}
.free-warning-desc {
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.5;
  color: #a1453f;
  word-break: keep-all;
}
.free-warning-desc strong {
  font-weight: 800;
  color: #e0554f;
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
.setting-label { font-weight: 600; font-size: 13px; color: #6b7077; }
.setting-value { font-weight: 700; font-size: 13px; color: #15171b; }
.account-note  { margin: 0; font-weight: 500; font-size: 11.5px; color: #8b9097; }

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
  padding: 20px 0 8px;
}
.maturity-box {
  box-sizing: border-box;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #eef1f4;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
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
.maturity-placeholder { font-weight: 600; font-size: 12px; color: #989ca2; }
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
  color: #787c81;
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
  color: #525863;
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

/* 날짜 선택 바텀시트 */
.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.day-picker-sheet {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 22px;
  box-sizing: border-box;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  margin: 0 auto 12px;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sheet-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #15171b;
}

.sheet-close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  color: #727e8e;
  cursor: pointer;
  padding: 4px;
}

/* 달력 상단 헤더 */

/* 요일 헤더 */
/* 날짜 그리드 */
.cal-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 14px;
  margin-top: 4px;
}

.cal-day-cell {
  position: relative;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.cal-day-cell:hover {
  background: #f1f5f9;
}

.cal-day-cell.active {
  background: #ffbc00 !important;
  color: #15171b !important;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(255, 188, 0, 0.35);
}

.today-dot {
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffbc00;
}

.cal-footer-info {
  margin-bottom: 14px;
  text-align: center;
}

.cal-notice-text {
  margin: 0;
  font-size: 12px;
  color: #4d596b;
}

.cal-notice-text strong {
  color: #1e293b;
}

.sheet-apply-btn {
  width: 100%;
  padding: 13px 0;
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

.sheet-apply-btn:active {
  opacity: 0.85;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>