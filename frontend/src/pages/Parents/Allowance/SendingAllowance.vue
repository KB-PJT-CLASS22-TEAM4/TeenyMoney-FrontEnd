<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">TeenyMoney</h1>
    </header>

    <div class="content">
      <img src="@/assets/logo.svg" alt="" class="logo" />
      <h2 class="title">송금이 진행 중이에요</h2>
      <p class="desc">잠시만 기다려 주세요</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">보내는 금액</span>
          <span class="info-value">{{ Number(route.query.amount).toLocaleString() }}원</span>
        </div>
        <div class="info-row">
          <span class="info-label">받는 분</span>
          <span class="info-value">{{ route.query.childName }}</span>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <button class="nav-item" type="button" @click="router.push('/parents/home')">
        <img src="@/assets/icons/icon-home.svg" alt="" class="nav-icon" />
        <span class="nav-label">홈</span>
      </button>
      <button class="nav-item nav-item-active" type="button">
        <img src="@/assets/icons/icon-child-alive.svg" alt="" class="nav-icon" />
        <span class="nav-label">자녀관리</span>
      </button>
      <button class="nav-item" type="button" @click="router.push('/parents/mypage')">
        <img src="@/assets/icons/icon-mypage.svg" alt="" class="nav-icon" />
        <span class="nav-label">마이페이지</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { sendAllowance } from '@/api/allowance'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

onMounted(async () => {
  const childId =
    Number(route.query.childId)

  const amount =
    Number(route.query.amount)

  const childName =
    route.query.childName

  const idempotencyKey =
    route.query.idempotencyKey

  if (
    !childId ||
    !amount ||
    !idempotencyKey
  ) {
    router.replace({
      path: '/parents/send/fail',

      query: {
        message:
          '송금 정보가 올바르지 않습니다.',
      },
    })

    return
  }

  try {
    const res =
      await sendAllowance(
        childId,
        amount,
        authStore.accessToken,
        idempotencyKey
      )

    router.replace({
      path: '/parents/send/complete',

      query: {
        amount,
        childName,

        createdAt:
          res?.data?.createdAt || '',
      },
    })

  } catch (error) {
    console.error(
      '용돈 보내기 실패:',
      error
    )

    if (error.status === 401) {
      authStore.clearUser()
      router.replace('/login')

      return
    }

    router.replace({
      path: '/parents/send/fail',

      query: {
        amount,
        childName,

        message:
          error.message ||
          '용돈 보내기에 실패했습니다.',

        code:
          error.code || '',
      },
    })
  }
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 16px;
}

.logo {
  width: 64px;
  height: 64px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
}

.info-card {
  width: 100%;
  background-color: #f4f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
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

.nav-icon { width: 24px; height: 24px; }

.nav-label {
  font-size: 11px;
  color: #8b9097;
}

.nav-item-active .nav-label {
  color: #191b1e;
  font-weight: 700;
}
</style>