<template>
  <div class="score-screen">
    <!-- 상단 네비 -->
    <div class="nav">
      <div class="nav-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">티니 점수</h1>
      </div>
    </div>

    <div class="scroll">
      <!-- 1. 점수: 지금 이 순간의 값 -->
      <section class="hero">
        <div class="hero-row">
          <b class="hero-score">{{ score }}</b>
          <span class="hero-unit">점</span>
          <span class="hero-delta" :class="{ minus: monthDelta < 0 }">
            {{ monthDelta > 0 ? '+' : '' }}{{ monthDelta }} 이번 달
          </span>
        </div>

        <div class="range-bar">
          <div class="range-fill" :style="{ width: rangePercent + '%', background: currentGrade.color }"></div>
        </div>
        <div class="range-axis">
          <span>{{ currentGrade.name }} {{ currentGrade.min }}점</span>
          <span v-if="nextTier">{{ nextTier.name }}까지 {{ nextTier.min - score }}점</span>
          <span v-else>최고 등급</span>
        </div>

        <p class="hero-hint">점수는 활동하면 바로 반영돼요</p>
      </section>

      <!-- 2. 등급 전환: 이번 달은 확정, 다음 달은 예정 -->
      <section class="switch">
        <div class="switch-cards">
          <div class="gcard fixed">
            <span class="gcard-when">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.9"/>
                <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" stroke-width="1.9"/>
              </svg>
              {{ month }}월 등급
            </span>
            <b class="gcard-name" :style="{ color: appliedGrade.color }">{{ appliedGrade.name }}</b>
            <span class="gcard-note">{{ month }}월 {{ lastDay }}일까지 유지</span>
          </div>

          <span class="gcard-arrow">›</span>

          <div class="gcard planned">
            <span class="gcard-when">{{ nextMonth }}월 1일부터</span>
            <b class="gcard-name" :style="{ color: currentGrade.color }">{{ currentGrade.name }}</b>
            <span class="gcard-note">지금 점수 기준 · 바뀔 수 있어요</span>
          </div>
        </div>

        <div class="month-bar">
          <div class="month-fill" :style="{ width: monthPercent + '%' }"></div>
        </div>
        <p class="month-note">
          <template v-if="gradeChanging">
            <b>{{ daysLeft }}일 뒤</b> {{ appliedGrade.name }} → {{ currentGrade.name }} 등급으로 바뀌어요
          </template>
          <template v-else>
            <b>{{ daysLeft }}일 뒤</b> 등급을 다시 정해요 · 지금 점수면 {{ currentGrade.name }} 유지
          </template>
        </p>
      </section>

      <!-- 3. 혜택: 지금 값과 다음 달 값을 나란히 -->
      <section class="block">
        <div class="block-head">
          <span class="block-title">등급 혜택</span>
          <span class="block-sub">{{ month }}월 · {{ appliedGrade.name }} 기준</span>
        </div>

        <div v-for="b in benefits" :key="b.label" class="benefit">
          <span class="benefit-label">{{ b.label }}</span>
          <span class="benefit-now">{{ b.now }}</span>
          <template v-if="b.now !== b.next">
            <span class="benefit-arrow">›</span>
            <span class="benefit-next" :class="b.better ? 'up' : 'down'">{{ b.next }}</span>
          </template>
          <span v-else class="benefit-same">그대로</span>
        </div>
        <p v-if="gradeChanging" class="benefit-foot">
          오른쪽 값은 {{ nextMonth }}월 1일부터 적용될 예정이에요
        </p>
      </section>

      <!-- 4. 등급 기준표 -->
      <section class="block">
        <div class="block-head">
          <span class="block-title">등급 기준</span>
        </div>
        <div
          v-for="g in gradesDesc"
          :key="g.name"
          class="tier"
          :class="{ dim: g.name !== appliedGrade.name && g.name !== currentGrade.name }"
        >
          <span class="tier-dot" :style="{ background: g.color }"></span>
          <b class="tier-name">{{ g.name }}</b>
          <span class="tier-range">{{ g.min }} ~ {{ g.max }}점</span>
          <span v-if="g.name === appliedGrade.name" class="tag now">지금</span>
          <span v-if="g.name === currentGrade.name && gradeChanging" class="tag next">{{ nextMonth }}월</span>
        </div>
      </section>

      <!-- 5. 최근 점수 변화 -->
      <section class="block">
        <div class="block-head">
          <span class="block-title">최근 점수 변화</span>
          <span class="block-sub">전체보기</span>
        </div>
        <div v-for="h in history" :key="h.id" class="hist">
          <div class="hist-text">
            <b class="hist-name">{{ h.description }}</b>
            <span class="hist-date">{{ h.date }}</span>
          </div>
          <span class="hist-delta" :class="{ minus: h.delta < 0 }">
            {{ h.delta > 0 ? '+' : '' }}{{ h.delta }}
          </span>
        </div>
      </section>

      <!-- 6. 규칙 -->
      <section class="rules">
        <p class="rules-title">등급은 이렇게 정해져요</p>
        <p class="rule">점수는 활동할 때마다 바로 오르내려요.</p>
        <p class="rule">등급과 혜택은 매달 1일 0시에 그때 점수로 다시 정하고, 그 달 마지막 날까지 유지돼요.</p>
        <p class="rule">처음 가입하면 가입할 때 점수로 바로 등급을 받아요.</p>
        <p class="rule">이미 가입한 예금·적금·대출 금리는 그때 확정된 값 그대로예요.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getKstParts } from '@/utils/datetime';

const router = useRouter();
function goBack() {
  router.back();
}

// ==== API 연동 필요 (지금은 더미 데이터) ====
// [API] 티니 점수 조회 (현재 점수 + 이번 달 증감)
const score = 850;
const monthDelta = 30;

// [API] 이번 달 적용 중인 등급 (매월 1일 스냅샷). 점수로 다시 계산하면 안 됨
const appliedGradeName = '양호';

// [API] 등급 기준표 조회 (T_TNY_GRADE_A)
const grades = [
  { name: '회복필요', min: 0,   max: 199,  bonus: 0.0, loan: null, override: 0, color: '#FF4D4D' },
  { name: '주의',     min: 200, max: 399,  bonus: 0.0, loan: 7.0,  override: 1, color: '#FF9F40' },
  { name: '보통',     min: 400, max: 599,  bonus: 0.1, loan: 5.0,  override: 2, color: '#FFD400' },
  { name: '양호',     min: 600, max: 799,  bonus: 0.2, loan: 3.5,  override: 3, color: '#4CAF50' },
  { name: '우수',     min: 800, max: 1000, bonus: 0.3, loan: 2.0,  override: 5, color: '#2196F3' },
];

// [API] 티니 점수 변경 이력 (최근 3건)
const history = [
  { id: 1, description: '적금 자동납입 성공', date: '08.05', delta: 15 },
  { id: 2, description: '대출 상환일 지킴',   date: '08.02', delta: 20 },
  { id: 3, description: '결제 한도 초과 요청', date: '08.01', delta: -5 },
];

const gradesDesc = [...grades].reverse();

// 지금 점수로 판정한 등급 = 다음 달에 적용될 예정 등급
const currentGrade = computed(
  () => grades.find(g => score >= g.min && score <= g.max) ?? grades[0]
);
const appliedGrade = computed(
  () => grades.find(g => g.name === appliedGradeName) ?? currentGrade.value
);
const gradeChanging = computed(() => appliedGrade.value.name !== currentGrade.value.name);

const nextTier = computed(() => grades.find(g => g.min > score) ?? null);
const rangePercent = computed(() => {
  const g = currentGrade.value;
  return ((score - g.min) / (g.max - g.min)) * 100;
});

const kstNow = getKstParts();
const month = kstNow.month;
const nextMonth = month === 12 ? 1 : month + 1;
const lastDay = new Date(kstNow.year, month, 0).getDate();
const daysLeft = lastDay - kstNow.day + 1;
const monthPercent = ((kstNow.day - 1) / lastDay) * 100;

const rate = v => (v === null ? '이용 불가' : v.toFixed(2) + '%');
const benefits = computed(() => {
  const a = appliedGrade.value;
  const b = currentGrade.value;
  return [
    { label: '예적금 우대금리', now: '+' + a.bonus.toFixed(2) + '%p', next: '+' + b.bonus.toFixed(2) + '%p', better: b.bonus > a.bonus },
    { label: '대출 금리',       now: rate(a.loan),                    next: rate(b.loan),                    better: (b.loan ?? 99) < (a.loan ?? 99) },
    { label: '오늘만 허용',     now: '월 ' + a.override + '회',        next: '월 ' + b.override + '회',        better: b.override > a.override },
  ];
});
</script>

<style scoped>
.score-screen {
  box-sizing: border-box;
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
  padding: 2px 16px 6px;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  display: flex;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
}

.scroll {
  flex: 1;
  padding: 6px 0 24px;
  overflow-y: auto;
}
.scroll::-webkit-scrollbar {
  width: 5px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #d8dbdf;
  border-radius: 999px;
}
.scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* 1. 점수 */
.hero {
  padding: 14px 20px 22px;
}
.hero-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.hero-score {
  font-weight: 800;
  font-size: 38px;
  letter-spacing: -1.4px;
  color: #191b1e;
}
.hero-unit {
  font-weight: 700;
  font-size: 17px;
  color: #191b1e;
}
.hero-delta {
  margin-left: auto;
  padding: 4px 9px;
  border-radius: 999px;
  background: #eef5fd;
  font-weight: 700;
  font-size: 11.5px;
  color: #4d8ad6;
}
.hero-delta.minus {
  background: #fdeeee;
  color: #e05b5b;
}

.range-bar {
  width: 100%;
  height: 6px;
  margin-top: 16px;
  background: #eef0f3;
  border-radius: 999px;
  overflow: hidden;
}
.range-fill {
  height: 100%;
  border-radius: 999px;
}
.range-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  font-weight: 600;
  font-size: 10.8px;
  color: #b9bec5;
}

.hero-hint {
  margin: 14px 0 0;
  font-weight: 600;
  font-size: 11.5px;
  color: #8b9097;
}

/* 2. 등급 전환 — 확정(실선) vs 예정(점선) */
.switch {
  margin: 0 20px;
  padding: 16px 14px 14px;
  background: #f8f9fb;
  border-radius: 14px;
}
.switch-cards {
  display: flex;
  align-items: stretch;
  gap: 8px;
}
.gcard {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  padding: 12px 12px 13px;
  border-radius: 10px;
}
.gcard.fixed {
  background: #ffffff;
  border: 1px solid #e4e7eb;
}
.gcard.planned {
  background: transparent;
  border: 1px dashed #c9ced6;
}
.gcard-when {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 10.5px;
  color: #8b9097;
}
.gcard-name {
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -0.5px;
}
.gcard-note {
  font-weight: 500;
  font-size: 10px;
  line-height: 1.35;
  color: #b9bec5;
}
.gcard-arrow {
  align-self: center;
  font-size: 19px;
  color: #c9ced6;
}

.month-bar {
  width: 100%;
  height: 4px;
  margin-top: 14px;
  background: #e6e9ed;
  border-radius: 999px;
  overflow: hidden;
}
.month-fill {
  height: 100%;
  background: #ffbc00;
  border-radius: 999px;
}
.month-note {
  margin: 8px 0 0;
  font-weight: 500;
  font-size: 11.3px;
  color: #8b9097;
}
.month-note b {
  font-weight: 700;
  color: #191b1e;
}

/* 공통 블록 */
.block {
  padding: 26px 20px 0;
}
.block-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}
.block-title {
  font-weight: 700;
  font-size: 13.5px;
  color: #191b1e;
}
.block-sub {
  font-weight: 600;
  font-size: 11.3px;
  color: #b9bec5;
}

/* 3. 혜택 */
.benefit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 0;
  border-top: 1px solid #f0f1f3;
}
.benefit:first-of-type {
  border-top: none;
}
.benefit-label {
  flex: 1;
  font-weight: 600;
  font-size: 12.3px;
  color: #4a4e55;
}
.benefit-now {
  font-weight: 700;
  font-size: 12.8px;
  color: #191b1e;
}
.benefit-arrow {
  font-size: 13px;
  color: #c9ced6;
}
.benefit-next {
  font-weight: 700;
  font-size: 12.8px;
}
.benefit-next.up {
  color: #4d8ad6;
}
.benefit-next.down {
  color: #e05b5b;
}
.benefit-same {
  font-weight: 600;
  font-size: 11px;
  color: #c9ced6;
}
.benefit-foot {
  margin: 10px 0 0;
  font-weight: 500;
  font-size: 10.8px;
  color: #b9bec5;
}

/* 4. 등급 기준 */
.tier {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid #f0f1f3;
}
.tier:first-of-type {
  border-top: none;
}
.tier.dim {
  opacity: 0.45;
}
.tier-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}
.tier-name {
  font-weight: 700;
  font-size: 12.5px;
  color: #191b1e;
}
.tier-range {
  flex: 1;
  font-weight: 500;
  font-size: 11.3px;
  color: #b9bec5;
}
.tag {
  padding: 3px 7px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 9.8px;
  flex: none;
}
.tag.now {
  background: #191b1e;
  color: #ffffff;
}
.tag.next {
  border: 1px dashed #c9ced6;
  color: #8b9097;
}

/* 5. 최근 점수 변화 */
.hist {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  border-top: 1px solid #f0f1f3;
}
.hist:first-of-type {
  border-top: none;
}
.hist-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hist-name {
  font-weight: 600;
  font-size: 12.5px;
  color: #191b1e;
}
.hist-date {
  font-weight: 500;
  font-size: 10.5px;
  color: #b9bec5;
}
.hist-delta {
  font-weight: 700;
  font-size: 13px;
  color: #4d8ad6;
}
.hist-delta.minus {
  color: #e05b5b;
}

/* 6. 규칙 */
.rules {
  margin: 26px 20px 0;
  padding: 15px 15px 16px;
  background: #f8f9fb;
  border-radius: 12px;
}
.rules-title {
  margin: 0 0 9px;
  font-weight: 700;
  font-size: 11.8px;
  color: #4a4e55;
}
.rule {
  margin: 0 0 6px;
  padding-left: 9px;
  position: relative;
  font-weight: 500;
  font-size: 11.2px;
  line-height: 1.5;
  color: #8b9097;
}
.rule:last-child {
  margin-bottom: 0;
}
.rule::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 0;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #c9ced6;
}
</style>
