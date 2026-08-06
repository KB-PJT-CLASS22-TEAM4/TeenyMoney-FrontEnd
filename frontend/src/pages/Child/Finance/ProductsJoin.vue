<template>
  <div class="product-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <button class="icon-btn" @click="goBack" aria-label="뒤로">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="nav-title">{{ pageTitle }}</h1>
    </div>

    <!-- 스크롤 영역 -->
    <div class="scroll" :class="{ scrolling: isScrolling }" @scroll="onScroll">
      <!-- ---------------- 적금 가입 ---------------- -->
      <template v-if="productCategory === 'SAVINGS'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">자유적립식 · 매월 자동저축</p>
          <p class="rate-info">12개월 기준, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement">티니점수 <span class="highlight-green">양호등급</span> 이상</p>
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
              :key="amt" 
              type="button" 
              class="chip-btn" 
              :class="{ active: savingsForm.amount === amt }"
              @click="savingsForm.amount = amt"
            >
              {{ amt / 10000 }}만
            </button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">가입기간</label>
          <div class="button-group">
            <button 
              v-for="month in [1, 3, 6, 12]" 
              :key="month" 
              type="button" 
              class="chip-btn" 
              :class="{ active: savingsForm.period === month }"
              @click="savingsForm.period = month"
            >
              {{ month }}개월
            </button>
          </div>
        </section>

        <section class="section auto-transfer-section">
          <div class="auto-transfer-header">
            <div class="text-group">
              <span class="toggle-title">자동이체</span>
              <span class="toggle-desc">매월 자동으로 납입해요</span>
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
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- ---------------- 예금 가입 ---------------- -->
      <template v-else-if="productCategory === 'DEPOSIT'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">목돈 굴리기 · 만기 일시지급</p>
          <p class="rate-info">12개월 기준, <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement">누구나 가입 가능</p>
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
              v-for="amt in [1000000, 3000000, 5000000, 10000000]" 
              :key="amt" 
              type="button" 
              class="chip-btn" 
              @click="depositForm.amount += amt"
            >
              +{{ amt / 10000 }}만
            </button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">예치 기간</label>
          <div class="button-group">
            <button 
              v-for="month in [3, 6, 12, 24]" 
              :key="month" 
              type="button" 
              class="chip-btn" 
              :class="{ active: depositForm.period === month }"
              @click="depositForm.period = month"
            >
              {{ month }}개월
            </button>
          </div>
        </section>
      </template>

      <!-- ---------------- 대출 신청 ---------------- -->
      <template v-else-if="productCategory === 'LOAN'">
        <section class="section product-info">
          <h2 class="product-name">{{ productTitle }}</h2>
          <p class="product-type">마이너스 통장 · 즉시 입금</p>
          <p class="rate-info">최저 <span class="highlight-blue">{{ productRate }}</span></p>
          <p class="score-requirement">티니점수 <span class="highlight-green">우수등급</span> 이상</p>
        </section>

        <section class="section">
          <label class="input-label">희망 대출 금액</label>
          <div class="amount-display" :class="{ hasValue: loanForm.amount > 0 }">
            <span class="amount-value" :class="{ placeholder: loanForm.amount === 0 }">
              {{ loanForm.amount ? loanForm.amount.toLocaleString() : '0' }}
            </span>
            <span class="currency-unit" :class="{ hasValue: loanForm.amount > 0 }">원</span>
          </div>
          <div class="button-group">
            <button 
              v-for="amt in [10000, 30000, 50000, 100000]" 
              :key="amt" 
              type="button" 
              class="chip-btn" 
              @click="loanForm.amount = amt"
            >
              {{ amt / 10000 }}만
            </button>
          </div>
        </section>

        <section class="section">
          <label class="input-label">대출 기간</label>
          <div class="button-group">
            <button 
              v-for="month in [1, 3, 6, 12]" 
              :key="month" 
              type="button" 
              class="chip-btn" 
              :class="{ active: loanForm.period === month }"
              @click="loanForm.period = month"
            >
              {{ month }}개월
            </button>
          </div>
        </section>
      </template>
    </div>

    <!-- 하단 고정 영역 -->
    <footer class="footer">
      <div v-if="productCategory !== 'LOAN'" class="maturity-box" :class="{ active: isFormValid }">
        <div class="maturity-top">
          <span class="maturity-label">예상 만기 수령액</span>
          <span class="maturity-amount" v-if="isFormValid">
            {{ calculatedReturn.total.toLocaleString() }}원
          </span>
          <span class="maturity-placeholder" v-else>
            금액·기간 선택 후 표시
          </span>
        </div>
        <div class="maturity-sub" v-if="isFormValid">
          원금 {{ calculatedReturn.principal.toLocaleString() }}원 + 이자 {{ calculatedReturn.interest.toLocaleString() }}원 + 티니점수 {{ calculatedReturn.score }}점
        </div>
      </div>

      <div class="submit-wrapper">
        <button 
          type="button" 
          class="submit-btn" 
          :class="{ active: isFormValid }"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ submitBtnLabel }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const categoryMap = { '적금': 'SAVINGS', '예금': 'DEPOSIT', '대출': 'LOAN' };
const rawCategory = route.query.category || '적금';
const productCategory = ref(categoryMap[rawCategory] || 'SAVINGS');
const productTitle = ref(route.query.title || '티니 꿈나무 적금');
const productRate = ref(route.query.rate || '연 3.0~4.5%');

// 스크롤 제어
const isScrolling = ref(false);
let scrollTimer = null;
function onScroll() {
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { isScrolling.value = false; }, 800);
}

// 🌟 초기 상태: 금액과 기간 모두 미선택(0 또는 null) 상태로 시작
const savingsForm = reactive({ amount: 0, period: 0, autoTransfer: true, transferDay: 1 });
const depositForm = reactive({ amount: 0, period: 0 });
const loanForm = reactive({ amount: 0, period: 0 });

const pageTitle = computed(() => {
  switch (productCategory.value) {
    case 'SAVINGS': return '적금 가입';
    case 'DEPOSIT': return '예금 가입';
    case 'LOAN': return '대출 신청';
    default: return '상품 가입';
  }
});

const submitBtnLabel = computed(() => {
  return productCategory.value === 'LOAN' ? '한도 조회 및 신청' : '가입하기';
});

// 금액과 기간이 모두 선택되었을 때만 유효성 통과
const isFormValid = computed(() => {
  if (productCategory.value === 'SAVINGS') return savingsForm.amount > 0 && savingsForm.period > 0;
  if (productCategory.value === 'DEPOSIT') return depositForm.amount >= 100000 && depositForm.period > 0;
  if (productCategory.value === 'LOAN') return loanForm.amount > 0 && loanForm.period > 0;
  return false;
});

// 만기 예상 금액 계산
const calculatedReturn = computed(() => {
  if (productCategory.value === 'SAVINGS' && savingsForm.amount > 0 && savingsForm.period > 0) {
    const principal = savingsForm.amount * savingsForm.period;
    const interest = Math.floor(principal * 0.04 * (savingsForm.period / 12));
    const score = 3;
    return {
      principal,
      interest,
      score,
      total: principal + interest
    };
  }
  if (productCategory.value === 'DEPOSIT' && depositForm.amount >= 100000 && depositForm.period > 0) {
    const principal = depositForm.amount;
    const interest = Math.floor(depositForm.amount * 0.038 * (depositForm.period / 12));
    return {
      principal,
      interest,
      score: 0,
      total: principal + interest
    };
  }
  return { principal: 0, interest: 0, score: 0, total: 0 };
});

const goBack = () => { router.back(); };
const handleSubmit = () => {
  if (!isFormValid.value) return;
  alert(`${pageTitle.value} 처리가 완료되었습니다.`);
};
</script>

<style scoped>
/* 메인 프레임 */
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

/* 상단 네비 */
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

/* 스크롤 영역 */
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 16px;
}

.scroll::-webkit-scrollbar {
  width: 3px;
}

.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}

.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

/* 섹션 디자인 */
.section {
  padding: 16px 0;
  border-bottom: 1.3px solid #f0f1f3;
}

.product-info { padding-top: 0; }

.product-name {
  font-weight: 800;
  font-size: 18px;
  color: #15171b;
}

.product-type {
  margin-top: 4px;
  font-weight: 500;
  font-size: 12.5px;
  color: #b9bec5;
}

.rate-info, .score-requirement {
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
}

.rate-info { margin-top: 8px; }
.score-requirement { margin-top: 2px; font-weight: 600; }

.highlight-blue { color: #2e7bf0; font-weight: 700; }
.highlight-green { color: #62b24a; font-weight: 700; }

/* Input & 금액선 스타일 */
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

/* 금액 선택 시에만 하단 밑줄 강조 */
.amount-display.hasValue {
  border-bottom-color: #15171b;
}

.amount-value {
  font-weight: 800;
  font-size: 26px;
  color: #15171b;
  margin-right: 4px;
}

.amount-value.placeholder { color: #c6cbd2; }

.currency-unit { 
  font-weight: 600; 
  font-size: 15px; 
  color: #c6cbd2; 
}

.currency-unit.hasValue {
  color: #15171b;
}

.button-group {
  display: flex;
  gap: 8px;
}

/* 칩 버튼 기본 / 선택 시 스타일 */
.chip-btn {
  flex: 1;
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  border-radius: 10px;
  padding: 10px 0;
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

/* 자동이체 섹션 */
.auto-transfer-section { border-bottom: none; }

.auto-transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.toggle-title { font-weight: 700; font-size: 14px; color: #15171b; }
.toggle-desc { display: block; font-weight: 500; font-size: 11.5px; color: #b9bec5; margin-top: 2px; }

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
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e7e9ec;
  transition: .3s;
  border-radius: 25px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #ffbc00; }
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

/* 하단 고정 영역 */
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

.maturity-label { 
  font-weight: 700; 
  font-size: 13px; 
  color: #4a4e55; 
}

.maturity-placeholder { 
  font-weight: 600; 
  font-size: 12px; 
  color: #c6cbd2; 
}

.maturity-amount {
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
}

.maturity-sub {
  font-weight: 500;
  font-size: 11px;
  color: #a0a5ad;
}

.submit-wrapper { width: 100%; }

.submit-btn {
  width: 100%;
  height: 48px;
  background: #f2f4f6;
  border-radius: 12px;
  border: none;
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
</style>