<script setup>
import { useRouter } from 'vue-router'
import { useAllowRequestStore } from '@/stores/allowRequest'


const router = useRouter()
const allowStore = useAllowRequestStore()

const categoryLabels = allowStore.categoryLabels

function goHome() {
  allowStore.reset()
  router.push({ name: 'child-home' })
}
</script>

<template>
  <div class="confirm-screen">
    <!-- 본문 -->
    <main class="body">
     <div class="icon-container">
  <!-- 애니메이션 효과-->
  <span v-for="n in 8" :key="n" :class="`spark spark-${n}`"></span>
  <!-- 체크 원 -->
  <div class="icon-wrap">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</div>

      <!-- 타이틀 -->
      <h1 class="title">요청을 보냈어요</h1>
      <p class="subtitle">보호자가 승인하면 알림으로 알려줄게요</p>

      <!-- 요청 정보 카드 -->
      <div class="info-card">
        <!-- 요청 업종 -->
        <div class="info-row">
          <span class="info-label">요청 업종</span>
          <div class="info-values">
            <span v-for="label in categoryLabels" :key="label" class="info-value">
              {{ label }}
            </span>
          </div>
        </div>

        <!-- 허용 기간 -->
        <div class="info-row info-row--border">
          <span class="info-label">허용 기간</span>
          <span class="info-value">오늘 자정까지</span>
        </div>

        <!-- 상태 -->
        <div class="info-row info-row--border">
          <span class="info-label">상태</span>
          <div class="status">
            <span class="status-dot"></span>
            <span class="info-value">승인 대기 중</span>
          </div>
        </div>
      </div>

      <!-- 안내 배너 -->
      <div class="notice">
        승인된 업종은 오늘 자정까지만 이용할 수 있어요<br />
        내일 오전 0시에 자동으로 원래 설정으로 돌아가요
      </div>
    </main>

    <!-- 하단 확인 버튼 -->
    <footer class="footer">
      <button class="confirm-btn" @click="goHome">확인</button>
    </footer>
  </div>
</template>

<style scoped>
.confirm-screen {
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
  font-family: 'KBFGText', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #15171b;
}

/* 본문 */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 0;
}

/* 체크 아이콘 원 */
.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: #ffbc00;
  border-radius: 50%;
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
  z-index: 1;
}

@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
}

.spark {
  position: absolute;
  width: 14px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: burst 0.8s ease-out 0.3s forwards;
}

.spark-1 { background: #ff6b6b; --tx: 0px;    --ty: -75px; }
.spark-2 { background: #ffd93d; --tx: 53px;   --ty: -53px; }
.spark-3 { background: #6bcb77; --tx: 75px;   --ty: 0px;   }
.spark-4 { background: #4d96ff; --tx: 53px;   --ty: 53px;  }
.spark-5 { background: #ff6b6b; --tx: 0px;    --ty: 75px;  }
.spark-6 { background: #ffd93d; --tx: -53px;  --ty: 53px;  }
.spark-7 { background: #6bcb77; --tx: -75px;  --ty: 0px;   }
.spark-8 { background: #4d96ff; --tx: -53px;  --ty: -53px; }

@keyframes burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 0; }
  20%  { transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

.title {
  margin: 0 0 8px;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
  color: #15171b;
  text-align: center;
}
.subtitle {
  margin: 0 0 28px;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
  text-align: center;
}

/* 정보 카드 */
.info-card {
  box-sizing: border-box;
  width: 100%;
  border: 1.2px solid #eaedf1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 18px;
  background: #fff;
}
.info-row--border {
  border-top: 1.2px solid #f2f4f6;
}
.info-label {
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
  white-space: nowrap;
}
.info-values {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.info-value {
  font-weight: 600;
  font-size: 13.5px;
  color: #15171b;
}

/* 상태 */
.status {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffbc00;
  flex-shrink: 0;
}

/* 안내 배너 */
.notice {
  width: 100%;
  padding: 11px 14px;
  background: #fffbea;
  border-radius: 8px;
  font-weight: 500;
  font-size: 11.5px;
  line-height: 19px;
  color: #8b6f00;
  text-align: center;
  box-sizing: border-box;
}

/* 하단 버튼 */
.footer {
  padding: 12px 20px 24px;
  background: #fff;
}
.confirm-btn {
  width: 100%;
  padding: 15px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.2px;
  cursor: pointer;
}
</style>