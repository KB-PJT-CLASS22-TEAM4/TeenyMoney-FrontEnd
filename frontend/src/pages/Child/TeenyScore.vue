<template>
  <div class="score-view">
    <div class="scroll-area">

      <!-- 상단 히어로 점수 카드 섹션 -->
      <section class="hero-section">
        <!-- 상단 네비바 -->
        <header class="top-nav">
          <button class="back-btn" @click="goBack" aria-label="뒤로가기">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h1 class="nav-title">티니점수</h1>
          <button class="q-btn" aria-label="도움말">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#15171b" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#15171b" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#15171b" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <!-- 히어로 점수 카드 -->
        <div class="hero-card">
          <div class="hero-top-row">
            <!-- 도넛 차트 -->
            <div class="donut-wrap">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#f1f5f9" stroke-width="12"/>
                <circle cx="65" cy="65" r="52" fill="none" stroke="#facc15" stroke-width="12"
                        :stroke-dasharray="`${donutFill} ${donutCircumference}`"
                        stroke-dashoffset="0" stroke-linecap="round"
                        transform="rotate(-90 65 65)"/>
              </svg>
              <div class="donut-center">
                <span class="donut-label">티니점수</span>
                <b class="donut-score">{{ score }}</b>
                <span class="donut-max">/ 1000</span>
              </div>
            </div>

            <!-- 현재 등급 + 티니 캐릭터 -->
            <div class="grade-info-col">
              <div class="grade-header-row">
                <span class="sub-label">현재 등급</span>
                
              <!-- 티니 캐릭터 -->
                <div class="current-chick-img-wrap">
                  <img :src="currentChickImage" alt="현재 등급 마스코트" class="chick-avatar-img" />
                </div>
              </div>

              <!-- 등급 명칭 -->
              <div class="grade-badge-row">
                <span class="badge-gold-text">{{ grade }}</span>
              </div>

              <!-- 안내 멘트 -->
              <p class="grade-status-desc">
                지금 아주 훌륭하게<br />신용 점수를 모으고 있어요!
              </p>
            </div>
          </div>

          <!-- 티니 점수 게이지 바 -->
          <div class="hero-progress-box">
            <div class="progress-info-row">
              <span class="gap-text">다음 등급까지 <strong>{{ remainingScore }}점</strong> 남았어요</span>
              <span class="next-target">{{ maxScore }}점 (우수)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>

          <!-- 상세보기 버튼 -->
          <button class="hero-detail-btn" @click="goGradeDetail">
            <span class="btn-text">티니 등급 상세보기</span>
            <span class="chev">›</span>
          </button>
        </div>
      </section>

      <!-- 지난주 대비 주간 점수 변동 -->
      <section class="section-container">
        <div class="card weekly-diff-card">
          <div class="card-head-sm">
            <span class="title">지난주 대비 점수 변동</span>
            <span class="blue-pill" :class="{ minus: weeklyDiff < 0 }">
              {{ weeklyDiff >= 0 ? '▲ +' : '▼ ' }}{{ weeklyDiff }}점
            </span>
          </div>

          <p class="diff-sub-text">
            지난주({{ prevWeekScore }}점)보다 <strong class="hl-text">{{ Math.abs(weeklyDiff) }}점 {{ weeklyDiff >= 0 ? '상승' : '하락' }}</strong>했어요!
          </p>

          <div class="diff-compare-box">
            <div class="compare-item">
              <span class="comp-label">지난주</span>
              <b class="comp-val gray">{{ prevWeekScore }}점</b>
            </div>
            <div class="diff-arrow">→</div>
            <div class="compare-item">
              <span class="comp-label">이번 주</span>
              <b class="comp-val main">{{ score }}점</b>
            </div>
          </div>
        </div>
      </section>

      <!-- 현재 등급 혜택 (슬라이드 형태) -->
      <section class="section-container">
        <div class="benefit-slide-header">
          <span class="title">현재 등급 혜택</span>
          <span class="slide-count">{{ benefits.length }}개 적용 중</span>
        </div>

        <div class="benefit-carousel" ref="carouselRef" @scroll="onCarouselScroll">
          <div v-for="(b, i) in benefits" :key="i" class="benefit-card">
            <span class="benefit-tag">{{ b.tag }}</span>
            <strong class="benefit-title">{{ b.title }}</strong>
            <p class="benefit-desc">{{ b.desc }}</p>
          </div>
        </div>

        <div class="carousel-indicators">
          <span v-for="(_, i) in benefits" :key="i"
                class="dot" :class="{ active: i === activeBenefitCard }"></span>
        </div>
      </section>

      <!-- 최근 점수 변동 내역 (3개 요약) -->
      <section class="section-container">
        <div class="card">
          <div class="history-head">
            <span class="title">최근 점수 변동 내역</span>
            <button class="all-link" @click="goGradeDetail">전체 보기 ›</button>
          </div>

          <div class="history-list">
            <div v-for="(item, i) in summaryActivities" :key="i" class="history-item">
              <div class="item-left">
                <span class="diff-val" :class="{ minus: item.diff < 0 }">
                  {{ item.diff > 0 ? '+' : '' }}{{ item.diff }}
                </span>
              </div>

              <div class="item-center">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-date">{{ item.date }}</span>
              </div>

              <span class="item-result-score">{{ item.resultScore }}점</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 하단 티니코치-->
      <section class="section-container last-section">
        <div class="coach-tip-banner">
          <div class="coach-tip-top">
            <div class="coach-character-wrap">
              <img :src="teenyScoreMascot" alt="티니코치" class="coach-full-mascot" />
            </div>

            <div class="coach-speech-box">
              <div class="speech-header">
                <span class="coach-tag">티니 코치의 꿀팁!</span>
              </div>
              <p class="speech-text">
                티니점수를 더 올려볼까?<br />
                아래 미션을 꾸준히 해봐!
              </p>
            </div>
          </div>

          <div class="tip-buttons-row">
            <div class="tip-pill pill-yellow">소비 기록하기</div>
            <div class="tip-pill pill-blue">저축 목표 달성하기</div>
            <div class="tip-pill pill-green">용돈 계획 세우기</div>
          </div>
        </div>
      </section>

    </div>

    <!-- 하단 탭바 -->
    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()

// 티니 캐릭터
const teenyScoreMascot = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

// 상단 티니 캐릭터
const currentChickImage = computed(() => {
  return new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href
})

// 점수 및 등급 기본 데이터
const score = ref(850)
const grade = ref('양호')
const minScore = ref(840)
const maxScore = ref(920)

const prevWeekScore = ref(730)
const weeklyDiff = computed(() => score.value - prevWeekScore.value)

const remainingScore = computed(() => Math.max(0, maxScore.value - score.value))
const progressPercent = computed(() => {
  const total = maxScore.value - minScore.value
  const current = score.value - minScore.value
  return Math.min(100, Math.max(0, (current / total) * 100))
})

// 도넛 차트 SVG 계산
const donutCircumference = 2 * Math.PI * 52
const donutFill = computed(() => ((score.value - 600) / (1000 - 600)) * donutCircumference)

// 혜택 데이터
const benefits = ref([
  { tag: '금리 혜택', title: '저축 기본 이자 우대', desc: '연 +0.2%p 우대 금리 자동 적용' },
  { tag: '퀘스트', title: '양호 전용 퀘스트', desc: '더 많은 포인트를 받는 퀘스트 오픈' },
  { tag: '배지', title: '양호 전용 프로필 배지', desc: '마이페이지 전용 양호 배지 부여' },
  { tag: '수수료', title: '송금 수수료 무제한 면제', desc: '어디로 보내든 송금 수수료 0원' },
])

const carouselRef = ref(null)
const activeBenefitCard = ref(0)

function onCarouselScroll() {
  const el = carouselRef.value
  if (!el) return
  const cardWidth = 210 + 10
  activeBenefitCard.value = Math.round(el.scrollLeft / cardWidth)
}

// 최근 내역
const activities = ref([
  { title: '매일 소비 기록 완료', date: '오늘', diff: 10, resultScore: 850 },
  { title: '목표저축 성공', date: '어제', diff: 5, resultScore: 840 },
  { title: '예산 초과 소비', date: '2일 전', diff: -3, resultScore: 835 },
  { title: '퀘스트 완료', date: '3일 전', diff: 8, resultScore: 838 },
  { title: '가계부 3일 연속 작성', date: '4일 전', diff: 7, resultScore: 830 },
])

const summaryActivities = computed(() => activities.value.slice(0, 3))

function goBack() { router.push({ name: 'child-home' }) }
function goGradeDetail() { router.push({ name: 'child-score-grade' }) }

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest')   router.push({ name: 'child-quest-list' })
}
</script>

<style scoped>
.score-view {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Inter', sans-serif;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }

.section-container {
  padding: 0 16px 12px;
}
.section-container.last-section {
  padding-bottom: 16px;
}

/* 메인 섹션 */
.hero-section {
  padding: 12px 16px 12px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.back-btn, .q-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.nav-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.hero-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 18px 16px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.hero-top-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.donut-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
}

.donut-score {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
  line-height: 1;
}

.donut-max {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
}

.grade-info-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

/* '현재 등급' 문구와 우측 여백의 이미지 마스코트 정돈 */
.grade-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 2px;
}

.sub-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.current-chick-img-wrap {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -6px;
}

.chick-avatar-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));
}

.badge-gold-text {
  font-size: 22px;
  font-weight: 900;
  color: #eab308;
  letter-spacing: 0.5px;
}

.grade-status-desc {
  margin: 4px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  line-height: 1.4;
}

/* 게이지 바 */
.hero-progress-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.gap-text strong {
  color: #2563eb;
}

.next-target {
  font-size: 10px;
  color: #94a3b8;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #facc15;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.hero-detail-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}

.btn-text {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
}

.chev {
  font-size: 16px;
  color: #94a3b8;
}

/* 카드 공통 스타일 */
.card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.card-head-sm {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-head-sm .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.blue-pill {
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.blue-pill.minus {
  background: #fef2f2;
  color: #ef4444;
}

.diff-sub-text {
  margin: 2px 0 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.hl-text {
  color: #2563eb;
  font-weight: 800;
}

.diff-compare-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.comp-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
}

.comp-val {
  font-size: 16px;
  font-weight: 900;
}

.comp-val.gray { color: #64748b; }
.comp-val.main { color: #0f172a; }

.diff-arrow {
  font-size: 16px;
  font-weight: 800;
  color: #cbd5e1;
}

/* 혜택 카드 */
.benefit-slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 2px;
}

.benefit-slide-header .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.slide-count {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.benefit-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.benefit-carousel::-webkit-scrollbar { display: none; }

.benefit-card {
  flex: 0 0 210px;
  scroll-snap-align: start;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.benefit-tag {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 800;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.benefit-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.benefit-desc {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.35;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.carousel-indicators .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.2s;
}

.carousel-indicators .dot.active {
  width: 14px;
  border-radius: 3px;
  background: #0f172a;
}

/* 최근 내역 */
.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-head .title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.all-link {
  background: none;
  border: none;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #f8fafc;
}

.history-item:first-child { border-top: none; }

.item-left { width: 45px; }

.diff-val {
  font-size: 13px;
  font-weight: 900;
  color: #16a34a;
}

.diff-val.minus { color: #ef4444; }

.item-center {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.item-date {
  font-size: 9.5px;
  font-weight: 600;
  color: #94a3b8;
}

.item-result-score {
  font-size: 12.5px;
  font-weight: 800;
  color: #16a34a;
}

/* 티니코치 캐릭터 팁 배너 */
.coach-tip-banner {
  background: linear-gradient(135deg, #fffdf0 0%, #fff9d6 100%);
  border: 1.5px solid #fef08a;
  border-radius: 22px;
  padding: 16px 14px 14px;
  box-shadow: 0 4px 12px rgba(250, 204, 21, 0.08);
}

.coach-tip-top {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 12px;
}

.coach-character-wrap {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -4px;
}

.coach-full-mascot {
  width: 68px;
  height: 68px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
}

.coach-speech-box {
  position: relative;
  background: #ffffff;
  border: 1.5px solid #fde047;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  padding: 10px 12px;
  flex: 1;
  box-shadow: 0 2px 8px rgba(250, 204, 21, 0.12);
}

.speech-header {
  margin-bottom: 2px;
}

.coach-tag {
  font-size: 10.5px;
  font-weight: 800;
  color: #d97706;
}

.speech-text {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.tip-buttons-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tip-buttons-row::-webkit-scrollbar { display: none; }

.tip-pill {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.tip-pill:active {
  transform: scale(0.96);
}

.pill-yellow {
  background: #ffffff;
  border: 1.5px solid #fde047;
  color: #854d0e;
}

.pill-blue {
  background: #ffffff;
  border: 1.5px solid #93c5fd;
  color: #1e40af;
}

.pill-green {
  background: #ffffff;
  border: 1.5px solid #86efac;
  color: #166534;
}
</style>