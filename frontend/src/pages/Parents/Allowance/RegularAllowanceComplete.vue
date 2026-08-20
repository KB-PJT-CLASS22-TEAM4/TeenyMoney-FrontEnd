<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
    </header>

    <div class="content">
      <div class="check-circle">
        <img src="@/assets/icons/icon-check.svg" alt="" class="check-icon" />
      </div>
      <h2 class="title">정기 용돈이 설정됐어요!</h2>
      <p class="desc">설정한 주기에 맞춰 자동으로 용돈이 지급돼요</p>

      <!-- 설정 요약 -->
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">받는 자녀</span>
          <span class="info-value">{{ route.query.childName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">지급 주기</span>
          <span class="info-value">
            {{ cycleLabel }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">지급 금액</span>
          <span class="info-value">{{ Number(route.query.amount).toLocaleString() }}원</span>
        </div>
        <div
          v-if="nextPaymentDate"
          class="info-row"
        >
          <span class="info-label">다음 지급일</span>
          <span class="info-value">{{ nextPaymentDate }}</span>
        </div>
      </div>

      <button class="btn btn-primary" @click="router.push('/parents/home')">
        홈으로 이동
      </button>
    </div>

    <ParentBottomNav active="child" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import { useRouter, useRoute } from 'vue-router'
import { formatKstDate } from '@/utils/datetime'

const WEEKDAY_LABELS = [
  '',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
]

const router = useRouter()
const route = useRoute()

const cycleLabel = computed(() => {
  if (route.query.cycleLabel) {
    return route.query.cycleLabel
  }

  const day = Number(route.query.day)

  if (route.query.cycle === 'WEEKLY') {
    return `매주 ${WEEKDAY_LABELS[day] || `${day}요일`}`
  }

  return `매월 ${day || ''}일`
})

const nextPaymentDate = computed(() => formatKstDate(route.query.nextPaymentDate))
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  padding: 18px 20px;
  background: #ffffff;

}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon { width: 24px; height: 24px; }

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 16px;
  padding: 32px 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.check-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #fff8e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon { width: 36px; height: 36px; }

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #191b1e;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
  text-align: center;
}

.info-card {
  width: 100%;
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 8px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-size: 14px;
  color: #8b9097;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background-color: #ffbc00;
  color: #191b1e;
}
</style>