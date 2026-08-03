<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">보호자 연동</h1>
    </header>

    <div class="content">
      <!-- 완료 아이콘 -->
      <div class="complete-section">
        <div class="check-circle">
          <img src="@/assets/icons/icon-check.svg" alt="" class="check-icon" />
        </div>
        <h2 class="complete-title">연동 완료!</h2>
        <p class="complete-desc">이제 자녀의 용돈을 관리할 수 있어요</p>
      </div>

      <!-- 연동된 자녀 카드 -->
      <!-- TODO: API 연동 후 하드코딩 제거 -->
      <!-- GET /children/link-result → linkedChild 로 교체 -->
      <div class="child-card">
        <img src="@/assets/icons/icon-mypage.svg" alt="" class="child-avatar" />
        <div>
          <p class="child-name">{{ linkedChild.name }}</p>
          <p class="child-linked">✓ 연동됨</p>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="footer">
      <button class="submit-btn" @click="goToList">목록으로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// TODO: API 연동 후 하드코딩 제거
// GET /children/link-result → linkedChild.value 로 교체
const linkedChild = ref({ name: '김첫째' })

// onMounted(async () => {
//   try {
//     const res = await api.get('/children/link-result')
//     linkedChild.value = res.data
//   } catch (error) {
//     console.error('연동 결과 불러오기 실패', error)
//   }
// })

function goToList() {
  router.push('/parent/children')
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 6px;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 60px 16px 20px;
}

/* 완료 섹션 */
.complete-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.check-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #fff8e1;
}

.check-icon {
  width: 32px;
  height: 32px;
}

.complete-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #191b1e;
}

.complete-desc {
  margin: 0;
  font-size: 14px;
  color: #8b9097;
}

/* 자녀 카드 */
.child-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 20px;
  background-color: #f4f5f7;
  border-radius: 16px;
}

.child-avatar {
  width: 40px;
  height: 40px;
}

.child-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.child-linked {
  margin: 0;
  font-size: 12px;
  color: #ffbc00;
  font-weight: 600;
}

/* 하단 버튼 */
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  padding: 10px 16px 28px;
  background-color: #ffffff;
}

.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}
</style>