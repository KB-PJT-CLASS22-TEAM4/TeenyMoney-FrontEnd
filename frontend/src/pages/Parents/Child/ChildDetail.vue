<template>
  <div class="page">

    <!-- 헤더 -->
    <header class="nav">
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

      <h1 class="nav-title">자녀 관리</h1>

      <button
        class="alarm-btn"
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


    <main class="content">

      <!-- =========================
           자녀 정보
      ========================== -->
      <section class="child-info-section">

        <div class="child-info">
          <p class="child-label">자녀 정보</p>
          <p class="child-name">{{ child.name }}</p>
        </div>

        <button
          class="unlink-btn"
          type="button"
        >
          연동 해제
        </button>

      </section>


      <!-- =========================
           티니머니 카드
      ========================== -->
      <section class="wallet-card">

        <div class="wallet-top">

          <div class="wallet-title-wrap">
            <div class="wallet-icon-circle">
              <img
                src="@/assets/logo.svg"
                alt=""
                class="wallet-icon"
              />
            </div>

            <span class="wallet-title">
              티니머니
            </span>
          </div>
        </div>


        <p class="wallet-amount">
          {{ child.balance.toLocaleString() }}
          <span>원</span>
        </p>

      </section>


      <!-- =========================
           티니점수
      ========================== -->
      <section class="score-section">

        <div class="section-header">
          <div class="score-title-wrap">
            <h2 class="section-title">
              티니점수
            </h2>

            <!-- <span class="shield-icon">
              ♢
            </span> -->
          </div>

          <button
  class="more-btn"
  type="button"
  @click="router.push(`/parents/children/${childId}/teeny-score`)"
>
  기준 보기
  <span>›</span>
</button>
        </div>


        <div class="score-card">

          <p class="score-number">
            {{ child.score }}
            <span>점</span>
          </p>


          <div class="score-progress">
            <div
              class="score-progress-fill"
              :style="{ width: scorePercent + '%' }"
            ></div>
          </div>


          <div class="score-bottom">

            <strong>
              {{ child.grade }}
            </strong>
          </div>

        </div>

      </section>


      <!-- =========================
           유해 업소 시도
      ========================== -->
      <button
        class="menu-card danger-card"
        type="button"
      >

        <div class="menu-left">

          <!-- <div class="menu-icon danger-icon">
            !
          </div> -->

          <span class="danger-text">
            유해 업소 시도
          </span>

        </div>


        <div class="menu-right danger-text">
          <strong>{{ child.harmfulAttemptCount }}건</strong>
          <span class="arrow">›</span>
        </div>

      </button>


      <!-- =========================
           리포트
      ========================== -->
      <button
        class="menu-card report-card"
        type="button"
      >

        <div class="menu-left">

          <!-- <div class="menu-icon report-icon">
            ▥
          </div> -->

          <span>
            리포트 보러가기
          </span>

        </div>

        <span class="arrow">
          ›
        </span>

      </button>


      <!-- =========================
           금융 상품
      ========================== -->
      <section class="finance-section">

        <div class="section-header">

          <h2 class="section-title">
            금융 상품
          </h2>

          <button
            class="more-btn"
            type="button"
            @click="router.push(`/parents/children/${childId}/finance`)"
          >
            상세보기
            <span>›</span>
          </button>

        </div>


        <!-- 예적금 -->
        <div class="finance-card">

          <div class="finance-left">

            <!-- <div class="finance-icon saving">
              ♧
            </div> -->

            <div>
              <p class="finance-title">
                예적금
              </p>

              <p class="finance-sub">
                티니 정기예금 외 1건
              </p>
            </div>

          </div>


          <div class="finance-right">

            <strong>
              1,200,000원
            </strong>

            <span class="profit">
              +2.4%
            </span>

          </div>

        </div>


        <!-- 대출 -->
        <div class="finance-card">

          <div class="finance-left">

            <!-- <div class="finance-icon loan">
              ♧
            </div> -->

            <div>
              <p class="finance-title">
                빌리기 (대출)
              </p>

              <p class="finance-sub">
                엄마표 소액대출
              </p>
            </div>

          </div>


          <div class="finance-right">

            <strong>
              5,000원
            </strong>

            <span class="d-day">
              D-3
            </span>

          </div>

        </div>


        <!-- 투자 -->
        <div class="finance-card">

          <div class="finance-left">

            <!-- <div class="finance-icon investment">
              ↗
            </div> -->

            <div>
              <p class="finance-title">
                투자 현황
              </p>

              <p class="finance-sub">
                모의 주식 투자
              </p>
            </div>

          </div>


          <div class="finance-right">

            <strong>
              245,600원
            </strong>

            <span class="profit">
              +12.5%
            </span>

          </div>

        </div>

      </section>


      <!-- =========================
           자녀 관리 설정
      ========================== -->
      <section class="setting-section">

        <h2 class="section-title">
          자녀 관리 설정
        </h2>


        <button
          class="setting-card"
          type="button"
          @click="goToHarmfulCategory"
        >

          <div class="setting-left">

            <span>
              유해 업소 설정 바로가기
            </span>

          </div>

          <span class="arrow">
            ›
          </span>

        </button>

      </section>

    </main>


    <!-- =========================
         하단 네비게이션
    ========================== -->
    <nav class="bottom-nav">

      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/home')"
      >
        <img
          src="@/assets/icons/icon-home.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          홈
        </span>
      </button>


      <button
        class="nav-item nav-item-active"
        type="button"
        @click="router.push('/parents/childlist')"
      >
        <img
          src="@/assets/icons/icon-child-alive.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          자녀관리
        </span>
      </button>


      <button
        class="nav-item"
        type="button"
        @click="router.push('/parents/mypage')"
      >
        <img
          src="@/assets/icons/icon-mypage.svg"
          alt=""
          class="nav-icon"
        />

        <span class="nav-label">
          마이페이지
        </span>
      </button>

    </nav>

  </div>
</template>


<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()


// URL
// /parents/children/150
const childId = Number(route.params.childId)

console.log('현재 자녀 ID:', childId)


// ========================================
// TODO
// 자녀 상세 API 나오면 이 부분 교체
// ========================================

const child = ref({
  id: childId,

  name: '김첫째',

  balance: 42500,

  score: 820,

  grade: '우수 등급',

  harmfulAttemptCount: 2,
})


// 점수 게이지
const scorePercent = computed(() => {

  const score = child.value.score

  // 1000점 만점 기준
  return Math.min(
    Math.max(score / 10, 0),
    100
  )

})


// ========================================
// 유해 업소 설정
// ========================================

function goToHarmfulCategory() {

  router.push({
    path: '/parents/harmfulcategory',

    query: {
      childId: childId,
    },
  })

}
</script>


<style scoped>
* {
  box-sizing: border-box;
}

.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;

  padding-bottom: 90px;

  background: #f8f8f8;

  color: #111827;
}


/* =====================
   HEADER
===================== */

.nav {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 74px;

  padding: 0 20px;

  background: #ffffff;

  border-bottom: 1px solid #eeeeee;
}

.nav-title {
  margin: 0;

  font-size: 20px;
  font-weight: 800;
}

.back-btn {
  position: absolute;
  left: 18px;

  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.alarm-btn {
  position: absolute;
  right: 18px;

  border: none;

  background: transparent;

  cursor: pointer;
}

.alarm-icon {
  width: 27px;
  height: 27px;
}


/* =====================
   CONTENT
===================== */

.content {
  padding: 24px 20px 30px;
}


/* =====================
   CHILD
===================== */

.child-info-section {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 24px;

  padding: 0 8px;
}

.child-label {
  margin: 0 0 4px;

  color: #8b9097;

  font-size: 13px;
}

.child-name {
  margin: 0;

  font-size: 21px;
  font-weight: 800;
}

.unlink-btn {
  height: 38px;

  padding: 0 18px;

  border: 1px solid #ff7a70;
  border-radius: 20px;

  background: #ffffff;

  color: #ff4d42;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
}


/* =====================
   WALLET
===================== */

.wallet-card {
  min-height: 180px;

  margin-bottom: 24px;

  padding: 22px;

  border-radius: 18px;

  background: #ffc20e;

  box-shadow:
    0 5px 10px rgba(0, 0, 0, 0.08);
}

.wallet-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wallet-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wallet-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.35);
}

.wallet-icon {
  width: 24px;
  height: 24px;
}

.wallet-title {
  font-size: 18px;
  font-weight: 800;
}

.transaction-btn {
  display: flex;
  align-items: center;
  gap: 5px;

  border: none;

  background: transparent;

  color: #1f2937;

  font-size: 14px;

  cursor: pointer;
}

.transaction-icon {
  width: 18px;
  height: 18px;
}

.wallet-amount {
  margin: 28px 0 0;

  font-size: 30px;
  font-weight: 900;

  letter-spacing: 1px;
}

.wallet-amount span {
  font-size: 16px;
}


/* =====================
   SECTION HEADER
===================== */

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 12px;
}

.section-title {
  margin: 0;

  font-size: 18px;
  font-weight: 800;
}

.score-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shield-icon {
  color: #ffc20e;

  font-size: 20px;
}

.more-btn {
  border: none;

  background: transparent;

  color: #8b9097;

  font-size: 13px;

  cursor: pointer;
}

.more-btn span {
  font-size: 20px;
}


/* =====================
   SCORE
===================== */

.score-section {
  margin-bottom: 22px;
}

.score-card {
  padding: 24px 22px;

  border-radius: 20px;

  background: #111c32;

  color: #ffffff;
}

.score-number {
  margin: 0 0 20px;

  font-size: 34px;
  font-weight: 900;
}

.score-number span {
  font-size: 16px;
}

.score-progress {
  overflow: hidden;

  width: 100%;
  height: 7px;

  border-radius: 10px;

  background: #303a4f;
}

.score-progress-fill {
  height: 100%;

  border-radius: 10px;

  background: #ffc20e;
}

.score-bottom {
  display: flex;
  justify-content: space-between;

  margin-top: 8px;

  color: #929aaa;

  font-size: 12px;
}

.score-bottom strong {
  color: #ffc20e;
}


/* =====================
   MENU CARD
===================== */

.menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 66px;

  margin-bottom: 12px;

  padding: 0 16px;

  border: none;
  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 3px 9px rgba(0, 0, 0, 0.05);

  font-size: 16px;
  font-weight: 800;

  cursor: pointer;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  border-radius: 50%;
}

.danger-card {
  background: #fff8f7;
}

.danger-icon {
  background: #ffe7e4;

  color: #ff4d42;

  font-size: 20px;
  font-weight: 700;
}

.danger-text {
  color: #ff4d42;
}

.report-card {
  background: #fffaf1;
}

.report-icon {
  background: #fff2cc;

  color: #ffb800;
}

.arrow {
  color: #8b9097;

  font-size: 24px;
  font-weight: 400;
}


/* =====================
   FINANCE
===================== */

.finance-section {
  margin-top: 28px;
}

.finance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 78px;

  margin-bottom: 12px;

  padding: 14px 16px;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 3px 9px rgba(0, 0, 0, 0.05);
}

.finance-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.finance-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 12px;

  font-size: 20px;
  font-weight: 800;
}

/* .finance-icon.saving {
  background: #ddfbf7;
  color: #00a99d;
} */

/* .finance-icon.loan {
  background: #fff0ed;
  color: #ff4d42;
}

.finance-icon.investment {
  background: #fff6dd;
  color: #ffb800;
} */

.finance-title {
  margin: 0 0 3px;

  font-size: 16px;
  font-weight: 800;
}

.finance-sub {
  margin: 0;

  color: #8b9097;

  font-size: 12px;
}

.finance-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.finance-right strong {
  font-size: 17px;
}

.profit {
  color: #00a99d;

  font-size: 12px;
  font-weight: 800;
}

.d-day {
  padding: 3px 9px;

  border-radius: 12px;

  background: #ff4d42;

  color: #ffffff;

  font-size: 11px;
  font-weight: 700;
}


/* =====================
   SETTING
===================== */

.setting-section {
  margin-top: 28px;
}

.setting-section .section-title {
  margin-bottom: 14px;
}

.setting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 76px;

  padding: 0 16px;

  border: none;
  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 3px 9px rgba(0, 0, 0, 0.05);

  cursor: pointer;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 14px;

  font-size: 16px;
  font-weight: 800;
}

.setting-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border: 1px solid #eeeeee;
  border-radius: 50%;

  color: #6b7280;

  font-size: 19px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background-color: #ffffff;
  border-top: 1px solid #f0f1f3;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>