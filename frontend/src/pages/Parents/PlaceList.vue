<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로 가기" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">오늘만 허용</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <!-- 안내 문구 -->
    <div class="notice-banner">
      <img src="@/assets/icons/icon-info.svg" alt="" class="info-icon" />
      <p class="notice-text">설정하신 관한은 오늘만 유효하며, 내일 오전 0시를 기준 설정으로 자동 복구됩니다.</p>
    </div>

    <!-- 검색 -->
    <div class="search-wrap">
      <img src="@/assets/icons/icon-search.svg" alt="" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="업종을 검색해보세요"
      />
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="state-box">
      <p>불러오는 중입니다...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="errorMessage" class="state-box">
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <!-- 카테고리 목록 -->
    <div v-else class="content">
      <div v-for="place in filteredPlaces" :key="place.id" class="place-card">
        <p class="place-name">{{ place.merchantCategoryName }}</p>
        <div class="place-btns">
          <button
            class="status-btn"
            :class="{ 'active-allow': place.policy === 'ALLOW' }"
            @click="setStatus(place.id, 'ALLOW')"
          >
            <span v-if="place.policy === 'ALLOW'">✓</span> 허용
          </button>
          <button
            class="status-btn"
            :class="{ 'active-caution': place.policy === 'CAUTION' }"
            @click="setStatus(place.id, 'CAUTION')"
          >
            <span v-if="place.policy === 'CAUTION'">✓</span> 주의
          </button>
          <button
            class="status-btn"
            :class="{ 'active-block': place.policy === 'BLOCK' }"
            @click="setStatus(place.id, 'BLOCK')"
          >
            <span v-if="place.policy === 'BLOCK'">✓</span> 차단
          </button>
        </div>
      </div>
    </div>

    <!-- 수정 완료 버튼 -->
    <div class="footer">
      <button class="submit-btn" @click="handleSave">수정 완료</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getCategoryPolicies, updateCategoryPolicies } from '@/api/categoryPolicy'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const placeList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// 검색 필터
const filteredPlaces = computed(() => {
  if (!searchQuery.value) return placeList.value
  return placeList.value.filter(p =>
    p.merchantCategoryName.includes(searchQuery.value)
  )
})

// 전체 카테고리 불러오기
onMounted(async () => {
  isLoading.value = true
  try {
    const res = await getCategoryPolicies(authStore.accessToken)
    if (res.success) {
      // { id, merchantCategoryName, policy } 형태로 저장
      placeList.value = res.data
    }
  } catch (error) {
    console.error('카테고리 불러오기 실패:', error)
    errorMessage.value = '카테고리 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})

// 상태 변경
function setStatus(id, policy) {
  const place = placeList.value.find(p => p.id === id)
  if (place) place.policy = policy
}

// 수정 완료 저장
async function handleSave() {
  try {
    // PATCH API 형식에 맞게 { id, policy } 배열로 전송
    const categoryPolicyList = placeList.value.map(p => ({
      id: p.id,
      policy: p.policy,
    }))

    await updateCategoryPolicies(authStore.accessToken, categoryPolicyList)
    alert('설정이 저장되었습니다!')
    router.back()
  } catch (error) {
    console.error('카테고리 정책 수정 실패:', error)
    alert('저장에 실패했습니다.')
  }
}
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 140px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
}

.back-btn, .alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-icon, .alarm-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

/* 안내 배너 */
.notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 12px 16px;
  padding: 12px 14px;
  background-color: #fff8e1;
  border-radius: 10px;
}

.info-icon { width: 16px; height: 16px; margin-top: 2px; }

.notice-text {
  margin: 0;
  font-size: 12px;
  color: #8b6f00;
  line-height: 1.6;
}

/* 검색 */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 12px;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 12px;
}

.search-icon { width: 18px; height: 18px; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #191b1e;
  outline: none;
}

.search-input::placeholder { color: #b9bec5; }

/* 카테고리 목록 */
.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.place-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

/* 상태 버튼 */
.place-btns {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 20px;
  background-color: #f4f5f7;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.active-allow {
  background-color: #34c759;
  color: #ffffff;
}

.active-caution {
  background-color: #ff9500;
  color: #ffffff;
}

.active-block {
  background-color: #ff3b30;
  color: #ffffff;
}

/* 상태 박스 */
.state-box {
  padding: 40px 0;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text { color: #ff3b30; }


.submit-btn {
  width: 100%;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

/* 하단 네비게이션 */
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