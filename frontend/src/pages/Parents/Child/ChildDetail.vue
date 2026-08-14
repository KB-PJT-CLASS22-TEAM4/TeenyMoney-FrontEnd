<template>
  <div class="child-detail">

    <!-- =========================
         스크롤 영역
    ========================== -->
    <div class="scroll-area">

      <!-- =========================
           히어로 영역
      ========================== -->
      <section class="hero-section">

        <!-- 상단 네비 -->
        <header class="top-nav">
          <button
            class="back-btn"
            type="button"
            aria-label="뒤로가기"
            @click="router.back()"
          >
            <img
              src="@/assets/icons/icon-back.svg"
              alt=""
              class="back-icon"
            />
          </button>

          <span class="nav-title">
            자녀 관리
          </span>

          <button
            class="bell-btn"
            type="button"
            aria-label="알림"
          >
            <img
              src="@/assets/icons/icon-notification.svg"
              alt=""
              class="alarm-icon"
            />
          </button>
        </header>


        <!-- 자녀 소개 -->
        <div class="hero-text">

          <span class="hero-eyebrow">
            자녀 금융 현황
          </span>

          <h2 class="hero-title">
            <span class="highlight-blue">
              {{ child.name }}
            </span>
            님의<br />
            금융 생활을 확인해보세요
          </h2>

          <p class="hero-sub">
            티니머니와 함께 성장하고 있어요!
          </p>

        </div>


        <!-- 캐릭터 -->
        <div class="hero-mascot-wrap">

          <img
            :src="teenyScoreMascot"
            class="hero-mascot"
            alt="티니"
          />

          <div class="mascot-shadow"></div>

        </div>


        <!-- 티니점수 카드 -->
        <div
          class="hero-score-card"
          @click="
            router.push(
              `/parents/children/${childId}/teeny-score`
            )
          "
        >

          <div class="score-card-top">

            <div class="score-card-left">

              <span class="score-card-title">
                티니점수
              </span>

              <div class="score-value-row">

                <span class="score-num">
                  {{ child.score }}
                </span>

                <span class="score-unit">
                  점
                </span>

              </div>

            </div>


            <div class="score-card-right">

              <div class="grade-badge">

                <span class="badge-icon">
                  🎖️
                </span>

                <span class="badge-text">
                  {{ child.grade }}
                </span>

              </div>

            </div>

          </div>


          <div class="score-progress-wrap">

            <div class="progress-text-row">

              <span class="progress-label">
                성장 점수
              </span>

              <span class="progress-target">
                {{ child.score }} / 1000점
              </span>

            </div>


            <div class="progress-bar-bg">

              <div
                class="progress-bar-fill"
                :style="{
                  width: scorePercent + '%'
                }"
              ></div>

            </div>

          </div>

        </div>

      </section>


      <!-- =========================
           잔액
      ========================== -->
      <section class="wallet-section">

        <div class="balance-row">

          <div class="balance-info">

            <span class="balance-label">
              {{ child.name }}님의 티니머니 잔액
            </span>

            <p class="balance-amount">
              {{ child.balance.toLocaleString() }}원
            </p>

          </div>


          <button
            class="unlink-btn"
            type="button"
          >
            연동 해제
          </button>

        </div>

      </section>


      <!-- =========================
           자녀 관리 카드
      ========================== -->
      <section class="manage-section">

        <div class="section-head">

          <span class="section-title">
            자녀 관리
          </span>
        </div>


        <div class="manage-slide">

          <!-- 유해 업소 -->
          <div class="manage-card">

            <div class="manage-card-content">

              <div class="manage-card-badge danger-badge">
                이용 관리
              </div>

              <div class="manage-card-title">
                유해 업소 시도
              </div>

              <div class="manage-card-value danger-value">
                {{ child.harmfulAttemptCount }}건
              </div>

              <div class="manage-card-sub">
                최근 이용 시도 내역
              </div>

            </div>


            <div class="manage-decoration danger-decoration">
              !
            </div>

          </div>


          <!-- 소비 리포트 -->
          <div class="manage-card">

            <div class="manage-card-content">

              <div class="manage-card-badge report-badge">
                소비 분석
              </div>

              <div class="manage-card-title">
                소비 리포트
              </div>

              <div class="manage-card-sub large-sub">
                자녀의 소비 습관을<br />
                한눈에 확인해요
              </div>

            </div>


            <div class="manage-decoration report-decoration">
              ▤
            </div>

          </div>


          <!-- 유해 업소 설정 -->
          <div
            class="manage-card"
            @click="goToHarmfulCategory"
          >

            <div class="manage-card-content">

              <div class="manage-card-badge setting-badge">
                설정
              </div>

              <div class="manage-card-title">
                유해 업소 설정
              </div>

              <div class="manage-card-sub large-sub">
                이용 제한 업종을<br />
                직접 관리해요
              </div>

            </div>


            <div class="manage-decoration setting-decoration">
              🛡
            </div>

          </div>

        </div>

      </section>


      <!-- =========================
           금융 상품
      ========================== -->
      <section class="finance">

        <div
          class="finance-head"
          @click="
            router.push(
              `/parents/children/${childId}/finance`
            )
          "
        >

          <span class="finance-section-title">
            금융 상품
          </span>

          <span class="finance-all">
            전체보기 ›
          </span>

        </div>


        <!-- 가로 슬라이드 -->
        <div
          ref="scrollRef"
          class="finance-scroll"
          @scroll="onScroll"
        >

          <!-- 예적금 -->
          <div class="finance-product-card">

            <div class="finance-product-top">

              <div class="product-tag saving-tag">
                예적금
              </div>

              <span class="product-rate">
                +2.4%
              </span>

            </div>


            <p class="product-name">
              티니 정기예금
            </p>

            <p class="product-sub">
              외 1건
            </p>


            <div class="product-bottom">

              <span class="product-label">
                보유 금액
              </span>

              <strong class="product-amount">
                1,200,000원
              </strong>

            </div>

          </div>


          <!-- 대출 -->
          <div class="finance-product-card">

            <div class="finance-product-top">

              <div class="product-tag loan-tag">
                빌리기
              </div>

              <span class="product-dday">
                D-3
              </span>

            </div>


            <p class="product-name">
              엄마표 소액대출
            </p>

            <p class="product-sub">
              상환 예정
            </p>


            <div class="product-bottom">

              <span class="product-label">
                남은 금액
              </span>

              <strong class="product-amount">
                5,000원
              </strong>

            </div>

          </div>


          <!-- 투자 -->
          <div class="finance-product-card">

            <div class="finance-product-top">

              <div class="product-tag investment-tag">
                투자
              </div>

              <span class="product-rate">
                +12.5%
              </span>

            </div>


            <p class="product-name">
              모의 주식 투자
            </p>

            <p class="product-sub">
              투자 현황
            </p>


            <div class="product-bottom">

              <span class="product-label">
                평가 금액
              </span>

              <strong class="product-amount">
                245,600원
              </strong>

            </div>

          </div>

        </div>


        <!-- 슬라이드 인디케이터 -->
        <div class="indicator">

          <span
            v-for="(_, index) in financeCards"
            :key="index"
            class="dot"
            :class="{
              active:
                index === activeCard
            }"
          ></span>

        </div>

      </section>

    </div>


    <!-- =========================
         하단 NAV
    ========================== -->
    <ParentBottomNav active="child" />

  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'

import {
  computed,
  ref
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'


const router =
  useRouter()

const route =
  useRoute()


// ========================================
// 기존 childId
// ========================================

const childId =
  Number(
    route.params.childId
  )

console.log(
  '현재 자녀 ID:',
  childId
)


// ========================================
// 기존 자녀 데이터
// TODO 상세 API 연동 시 교체
// ========================================

const child =
  ref({
    id: childId,

    name: '김첫째',

    balance: 42500,

    score: 820,

    grade: '우수 등급',

    harmfulAttemptCount: 2,
  })


// ========================================
// 기존 점수 계산
// ========================================

const scorePercent =
  computed(() => {

    const score =
      child.value.score

    return Math.min(
      Math.max(
        score / 10,
        0
      ),
      100
    )
  })


// ========================================
// 기존 유해 업소 설정 이동
// ========================================

function goToHarmfulCategory() {

  router.push({
    path:
      '/parents/harmfulcategory',

    query: {
      childId:
        childId,
    },
  })
}


// ========================================
// 금융상품 슬라이드 UI
// ========================================

const financeCards = [
  'saving',
  'loan',
  'investment',
]

const activeCard =
  ref(0)

const scrollRef =
  ref(null)


function onScroll() {

  const el =
    scrollRef.value

  if (!el) {
    return
  }

  const maxScroll =
    el.scrollWidth -
    el.clientWidth

  const ratio =
    maxScroll > 0
      ? el.scrollLeft /
        maxScroll
      : 0

  activeCard.value =
    Math.round(
      ratio *
      (
        financeCards.length -
        1
      )
    )
}


// ========================================
// ChildHome과 동일한 캐릭터
// ========================================

const teenyScoreMascot =
  new URL(
    '@/assets/mascot/teeny-coach.png',
    import.meta.url
  ).href
</script>


<style scoped>
* {
  box-sizing: border-box;
}


/* =====================================
   전체 화면
===================================== */

.child-detail {
  display: flex;
  flex-direction: column;

  width: 360px;

  /* nav까지 화면을 꽉 채움 */
  height: 100dvh;
  min-height: 100dvh;

  margin: 0 auto;

  overflow: hidden;

  border-left:
    1px solid #eceef1;

  border-right:
    1px solid #eceef1;

  background: #f8fafc;
}


.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 마지막 카드와 nav 사이 최소 여백 */
  padding-bottom: 80px;

  background: #f8fafc;

  scrollbar-width: none;
}


.scroll-area::-webkit-scrollbar {
  display: none;
}


/* =====================================
   HERO
===================================== */

.hero-section {
  position: relative;

  overflow: hidden;

  padding:
    28px 18px 24px;

  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;

  background:
    linear-gradient(
      180deg,
      #eef7ff 0%,
      #fffbe8 100%
    );
}


/* =====================================
   상단 NAV
===================================== */

.top-nav {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 34px;

  margin-bottom: 16px;
}


.back-btn {
  position: absolute;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}


.back-icon {
  width: 22px;
  height: 22px;
}


.nav-title {
  color: #1c1e22;

  font-size: 16px;
  font-weight: 900;
}


.bell-btn {
  position: absolute;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}


.alarm-icon {
  width: 22px;
  height: 22px;
}


/* =====================================
   HERO TEXT
===================================== */

.hero-text {
  position: relative;

  z-index: 2;

  margin-bottom: 16px;
}


.hero-eyebrow {
  display: block;

  margin-bottom: 4px;

  color: #64748b;

  font-size: 10.5px;
  font-weight: 700;
}


.hero-title {
  margin: 0 0 6px;

  color: #191b1e;

  font-size: 21px;
  font-weight: 900;

  line-height: 1.35;

  letter-spacing: -0.5px;
}


.highlight-blue {
  color: #2563eb;
}


.hero-sub {
  margin: 0;

  color: #71717a;

  font-size: 11.5px;
  font-weight: 600;
}


/* =====================================
   캐릭터
===================================== */

.hero-mascot-wrap {
  position: absolute;

  right: -8px;
  top: 125px;

  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;

  pointer-events: none;
}


.hero-mascot {
  width: 165px;
  height: 165px;

  object-fit: contain;
}


.mascot-shadow {
  width: 105px;
  height: 12px;

  margin-top: -18px;

  border-radius: 50%;

  background:
    rgba(
      220,
      190,
      80,
      0.32
    );

  filter: blur(5px);
}


/* =====================================
   티니점수
===================================== */

.hero-score-card {
  position: relative;

  z-index: 3;

  display: flex;
  flex-direction: column;

  width: 170px;

  padding: 12px;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 8px 24px
    rgba(
      0,
      0,
      0,
      0.06
    );

  cursor: pointer;
}


.score-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}


.score-card-left {
  display: flex;
  flex-direction: column;

  gap: 1px;
}


.score-card-title {
  color: #27272a;

  font-size: 11px;
  font-weight: 800;
}


.score-value-row {
  display: flex;
  align-items: baseline;

  gap: 2px;

  margin-top: 1px;
}


.score-num {
  color: #0f172a;

  font-size: 26px;
  font-weight: 900;

  letter-spacing: -1px;

  line-height: 1;
}


.score-unit {
  color: #0f172a;

  font-size: 14px;
  font-weight: 800;
}


.score-card-right {
  display: flex;
  align-items: center;
}


.grade-badge {
  display: inline-flex;
  align-items: center;

  gap: 2px;

  padding: 2px 6px;

  border:
    1px solid #fde68a;

  border-radius: 999px;

  background: #fffbe8;
}


.badge-icon {
  font-size: 9px;
}


.badge-text {
  color: #b77900;

  font-size: 9px;
  font-weight: 800;

  white-space: nowrap;
}


.score-progress-wrap {
  margin-top: 8px;

  padding-top: 6px;

  border-top:
    1px solid #f1f5f9;
}


.progress-text-row {
  display: flex;
  justify-content: space-between;

  margin-bottom: 4px;

  color: #64748b;

  font-size: 9px;
  font-weight: 700;
}


.progress-bar-bg {
  width: 100%;
  height: 7px;

  overflow: hidden;

  border-radius: 999px;

  background: #f1f5f9;
}


.progress-bar-fill {
  height: 100%;

  border-radius: 999px;

  background: #facc15;

  transition:
    width 0.4s ease-out;
}


/* =====================================
   잔액
===================================== */

.wallet-section {
  padding:
    14px 18px 0;
}


.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 2px 8px
    rgba(
      0,
      0,
      0,
      0.03
    );
}


.balance-label {
  color: #71717a;

  font-size: 11.5px;
  font-weight: 700;
}


.balance-amount {
  margin: 2px 0 0;

  color: #0f172a;

  font-size: 21px;
  font-weight: 900;
}


.unlink-btn {
  padding: 8px 12px;

  border:
    1px solid #fecaca;

  border-radius: 12px;

  background: #ffffff;

  color: #ef4444;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
}


/* =====================================
   공통 제목
===================================== */

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 20px;

  margin-bottom: 10px;
}


.section-title {
  color: #0f172a;

  font-size: 15px;
  font-weight: 800;
}


.section-description {
  color: #a0a5b1;

  font-size: 11px;
  font-weight: 600;
}


/* =====================================
   자녀 관리 가로 슬라이드
===================================== */

.manage-section {
  padding: 20px 0 0;
}


.manage-slide {
  display: flex;

  gap: 10px;

  padding:
    2px 18px 8px;

  overflow-x: auto;

  scrollbar-width: none;
}


.manage-slide::-webkit-scrollbar {
  display: none;
}


.manage-card {
  position: relative;

  flex-shrink: 0;

  width: 165px;
  height: 118px;

  box-sizing: border-box;

  overflow: hidden;

  padding: 12px 14px;

  border:
    1px solid #eaedf1;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 4px 12px
    rgba(
      0,
      0,
      0,
      0.03
    );

  cursor: pointer;

  transition:
    transform 0.2s ease;
}


.manage-card:active {
  transform: scale(0.97);
}


.manage-card-content {
  position: relative;

  z-index: 2;

  display: flex;
  flex-direction: column;

  height: 100%;
}


.manage-card-badge {
  align-self: flex-start;

  padding: 3px 7px;

  margin-bottom: 8px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 800;

  line-height: 1;
}


.danger-badge {
  color: #e5484d;

  background: #fff0f0;
}


.report-badge {
  color: #d98200;

  background: #fff8e6;
}


.setting-badge {
  color: #2563eb;

  background: #eff6ff;
}


.manage-card-title {
  margin-bottom: 8px;

  color: #22252a;

  font-size: 14px;
  font-weight: 800;
}


.manage-card-value {
  font-size: 19px;
  font-weight: 900;
}


.danger-value {
  color: #e5484d;
}


.manage-card-sub {
  margin-top: 3px;

  color: #8b9097;

  font-size: 10px;
  font-weight: 600;

  line-height: 1.35;
}


.large-sub {
  margin-top: 3px;
}


.manage-decoration {
  position: absolute;

  right: 10px;
  bottom: 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 14px;

  font-size: 19px;
  font-weight: 900;
}


.danger-decoration {
  color: #ef4444;

  background: #fff1f2;
}


.report-decoration {
  color: #d98200;

  background: #fff8e6;
}


.setting-decoration {
  background: #eff6ff;
}


/* =====================================
   금융 상품
===================================== */

.finance {
  margin:
    12px 18px 0;

  padding:
    16px 0 12px;

  overflow: hidden;

  border-radius: 20px;

  background: #ffffff;

  box-shadow:
    0 2px 8px
    rgba(
      0,
      0,
      0,
      0.03
    );
}


/* 헤더 */
.finance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    0 16px 12px;

  border-bottom:
    1px solid #f1f5f9;

  cursor: pointer;
}


.finance-section-title {
  color: #0f172a;

  font-size: 15px;
  font-weight: 800;
}


.finance-all {
  color: #a1a1aa;

  font-size: 12px;
  font-weight: 700;
}


/*
 * 여기 수정 핵심
 * 바깥 테두리와 첫 카드 사이
 * 좌우 16px 공간 확보
 */
.finance-scroll {
  display: flex;

  gap: 12px;

  padding:
    16px 16px 14px;

  overflow-x: auto;

  scroll-snap-type:
    x mandatory;

  scroll-padding-left:
    16px;

  scrollbar-width: none;
}


.finance-scroll::-webkit-scrollbar {
  display: none;
}


/* 금융 상품 카드 */
.finance-product-card {
  flex:
    0 0 244px;

  min-height: 125px;

  padding: 14px;

  border:
    1px solid #e8edf3;

  border-radius: 16px;

  background: #ffffff;

  scroll-snap-align: start;
}


.finance-product-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.product-tag {
  padding: 4px 8px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 800;
}


.saving-tag {
  color: #059669;

  background: #ecfdf5;
}


.loan-tag {
  color: #ef4444;

  background: #fff1f2;
}


.investment-tag {
  color: #2563eb;

  background: #eff6ff;
}


.product-rate {
  color: #16a34a;

  font-size: 10px;
  font-weight: 800;
}


.product-dday {
  padding: 3px 7px;

  border-radius: 999px;

  color: #ef4444;

  background: #fff1f2;

  font-size: 9px;
  font-weight: 800;
}


.product-name {
  margin:
    12px 0 2px;

  color: #18181b;

  font-size: 15px;
  font-weight: 800;
}


.product-sub {
  margin: 0;

  color: #a1a1aa;

  font-size: 10.5px;
  font-weight: 600;
}


.product-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-top: 18px;
}


.product-label {
  color: #a1a1aa;

  font-size: 10px;
  font-weight: 600;
}


.product-amount {
  color: #15171b;

  font-size: 15px;
  font-weight: 900;
}


/* =====================================
   금융상품 인디케이터
===================================== */

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;
}


.dot {
  width: 6px;
  height: 6px;

  border-radius: 3px;

  background: #e2e8f0;

  transition:
    all 0.2s;
}


.dot.active {
  width: 16px;

  background: #0f172a;
}

/* =====================================
   버튼 공통
===================================== */

button {
  font-family: inherit;
}
</style>