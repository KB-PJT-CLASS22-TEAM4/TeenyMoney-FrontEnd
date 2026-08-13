<template>
  <div class="page">
    <header class="nav">
      <div class="nav-title-wrap">
        <img src="@/assets/icons/icon-quest.svg" alt="" class="nav-icon-title" />
        <h1 class="nav-title">퀘스트</h1>
      </div>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <!-- 탭 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content">
      <!-- 완료 대기 카드 -->
      <div v-if="pendingQuest" class="pending-card" @click="goToApproval(pendingQuest.id)">
        <div class="pending-top">
          <span class="pending-badge">완료대기</span>
          <span class="pending-time">{{ formatTime(pendingQuest.completedAt) }}</span>
        </div>
        <p class="pending-child">{{ pendingQuest.childName }}</p>
        <p class="pending-title">{{ pendingQuest.title }}</p>
        <button class="confirm-btn" @click.stop="goToApproval(pendingQuest.id)">확인하기</button>
      </div>

      <!-- 등록된 퀘스트 -->
      <div class="quest-section">
        <div class="quest-section-header">
          <p class="quest-section-title">등록된 퀘스트</p>
          <div class="quest-section-actions">
            <button class="icon-btn" aria-label="검색">
              <img src="@/assets/icons/icon-search.svg" alt="" />
            </button>
            <button class="icon-btn" aria-label="필터">
              <img src="@/assets/icons/icon-filter.svg" alt="" />
            </button>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-if="isLoading" class="state-box">불러오는 중입니다...</div>

        <!-- 에러 -->
        <div v-else-if="errorMessage" class="state-box error-text">{{ errorMessage }}</div>

        <!-- 목록 -->
        <div v-else>
          <div
            v-for="quest in filteredQuests"
            :key="quest.id"
            class="quest-item"
            @click="goToDetail(quest.id)"
          >
            <div class="quest-item-left">
              <div class="quest-icon-wrap">
                <img src="@/assets/logo.svg" alt="" class="quest-icon" />
              </div>
              <div>
                <div class="quest-meta">
                  <span class="quest-child">{{ quest.childName }}</span>
                  <span class="quest-reward">{{ quest.reward.toLocaleString() }}원</span>
                </div>
                <p class="quest-title">{{ quest.title }}</p>
                <p class="quest-sub">신뢰점수 +{{ quest.trustScore }} · 기한: {{ quest.dueDate }}</p>
              </div>
            </div>
            <img src="@/assets/icons/icon-chevron.svg" alt="" class="chevron-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- + 버튼 -->
    <button class="fab" @click="goToCreate">+</button>

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
import { getQuests } from '@/api/quest'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const activeTab = ref('available')

const tabs = [
  { label: '시작 가능', value: 'available' },
  { label: '진행 중', value: 'in_progress' },
  { label: '완료', value: 'completed' },
]

const quests = ref([])
const pendingQuest = ref(null)

const filteredQuests = computed(() =>
  quests.value.filter(q => q.status === activeTab.value)
)

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `오후 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await getQuests(authStore.accessToken)
    if (res.success) {
      quests.value = res.data
      // 완료 대기 퀘스트 찾기
      pendingQuest.value = res.data.find(q => q.status === 'pending_approval') || null
    }
  } catch (error) {
    console.error('퀘스트 목록 불러오기 실패:', error)
    errorMessage.value = '퀘스트 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})

function goToDetail(id) { router.push(`/parents/quest/${id}`) }
function goToCreate() { router.push('/parents/quest/create') }
function goToApproval(id) { router.push(`/parents/quest/${id}/approval`) }

</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
}

.nav-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon-title { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191b1e;
}

.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.alarm-icon { width: 24px; height: 24px; }

/* 탭 */
.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f1f3;
}

.tab {
  flex: 1;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8b9097;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #ffbc00;
  border-bottom-color: #ffbc00;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* 완료 대기 카드 */
.pending-card {
  background-color: #ffbc00;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.pending-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pending-badge {
  font-size: 12px;
  font-weight: 700;
  color: #191b1e;
  background-color: rgba(0,0,0,0.1);
  padding: 3px 8px;
  border-radius: 20px;
}

.pending-time {
  font-size: 12px;
  color: #191b1e;
}

.pending-child {
  margin: 0;
  font-size: 12px;
  color: #191b1e;
  opacity: 0.7;
}

.pending-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.confirm-btn {
  width: 100%;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
  margin-top: 4px;
}

/* 퀘스트 섹션 */
.quest-section {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.quest-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.quest-section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.quest-section-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.icon-btn img { width: 20px; height: 20px; }

.quest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f1f3;
  cursor: pointer;
}

.quest-item:last-child { border-bottom: none; }

.quest-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.quest-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #f4f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quest-icon { width: 20px; height: 20px; }

.quest-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.quest-child {
  font-size: 11px;
  color: #8b9097;
}

.quest-reward {
  font-size: 11px;
  font-weight: 700;
  color: #ffbc00;
}

.quest-title {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.quest-sub {
  margin: 0;
  font-size: 11px;
  color: #8b9097;
}

.chevron-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* FAB 버튼 */
.fab {
  position: fixed;
  bottom: 90px;
  right: calc(50% - 160px);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background-color: #ffbc00;
  font-size: 28px;
  color: #191b1e;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-box {
  padding: 30px;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text { color: #ff3b30; }

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
  color: #ffbc00;
  font-weight: 700;
}
</style>