<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">퀘스트 상세</h1>
      <!-- AVAILABLE 상태일 때만 수정/삭제 버튼 표시 -->
      <div class="nav-actions" v-if="quest.status === 'AVAILABLE'">
        <button class="action-btn edit-btn" @click="enterEditMode">수정</button>
        <button class="action-btn delete-btn" @click="handleDelete">삭제</button>
      </div>
      <div v-else class="nav-placeholder"></div>
    </header>

    <!-- 로딩 -->
    <div v-if="isLoading" class="state-box">
      <p>불러오는 중입니다...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="errorMessage" class="state-box">
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <!-- 상세 보기 모드 -->
    <div v-else-if="!isEditMode" class="content">

      <!-- 자녀 정보 -->
      <div class="info-card">
        <div class="child-row">
          <img
            :src="quest.child.profileImageUrl || '/src/assets/icons/child-profile.svg'"
            alt=""
            class="child-avatar"
          />
          <div>
            <p class="child-label">자녀</p>
            <p class="child-name">{{ quest.child.name }}</p>
          </div>
          <span class="status-badge" :class="statusClass">{{ statusLabel }}</span>
        </div>
      </div>

      <!-- 퀘스트 내용 -->
      <div class="info-card">
        <div class="info-row">
          <p class="info-label">제목</p>
          <p class="info-value">{{ quest.title }}</p>
        </div>
        <div class="divider" />
        <div class="info-row">
          <p class="info-label">내용</p>
          <p class="info-value">{{ quest.content }}</p>
        </div>
        <div class="divider" />
        <div class="info-row">
          <p class="info-label">기한</p>
          <p class="info-value">{{ formatDate(quest.deadline) }}</p>
        </div>
        <div class="divider" />
        <div class="info-row">
          <p class="info-label">보상</p>
          <p class="info-value reward">{{ Number(quest.rewardAmount || 0).toLocaleString() }}원</p>
        </div>
        <div class="divider" />
        <div class="info-row">
          <p class="info-label">신뢰도 점수</p>
          <p class="info-value">{{ quest.teenyScoreEnabled ? '부여' : '미부여' }}</p>
        </div>
      </div>

      <!-- 인증 정보 (제출된 경우) -->
      <div v-if="quest.latestVerification" class="info-card">
        <p class="card-title">인증 내역</p>
        <div class="info-row">
          <p class="info-label">상태</p>
          <p class="info-value">{{ quest.latestVerification.status }}</p>
        </div>
        <div v-if="quest.latestVerification.imageUrl" class="verify-image-wrap">
          <img :src="quest.latestVerification.imageUrl" alt="인증 이미지" class="verify-image" />
        </div>
        <div v-if="quest.latestVerification.content" class="info-row">
          <p class="info-label">인증 내용</p>
          <p class="info-value">{{ quest.latestVerification.content }}</p>
        </div>
      </div>

    </div>

    <!-- 수정 모드 -->
    <div v-else class="content">

      <div class="section">
        <p class="section-label">제목</p>
        <input v-model="editForm.title" type="text" class="input" placeholder="퀘스트 제목" />
      </div>

      <div class="section">
        <p class="section-label">내용</p>
        <textarea v-model="editForm.content" class="textarea" rows="4" placeholder="퀘스트 내용" />
      </div>

      <div class="section">
        <p class="section-label">기한</p>
        <input v-model="editForm.deadline" type="datetime-local" class="input" />
      </div>

      <div class="section">
        <p class="section-label">현금 보상</p>
        <div class="amount-wrap">
          <input
            v-model="editForm.rewardAmount"
            type="number"
            class="amount-input"
            placeholder="0"
            inputmode="numeric"
          />
          <span class="won">원</span>
        </div>
        <div class="quick-btns">
          <button
            v-for="quick in quickAmounts"
            :key="quick.label"
            class="quick-btn"
            @click="editForm.rewardAmount = (Number(editForm.rewardAmount) || 0) + quick.value"
          >
            {{ quick.label }}
          </button>
          <button class="quick-btn reset-btn" @click="editForm.rewardAmount = 0">지움</button>
        </div>
      </div>

      <button
        class="teeny-score-row"
        type="button"
        @click="editForm.teenyScoreEnabled = !editForm.teenyScoreEnabled"
      >
        <div class="checkbox" :class="{ checked: editForm.teenyScoreEnabled }">
          <img v-if="editForm.teenyScoreEnabled" src="@/assets/icons/icon-check.svg" alt="" class="check-icon" />
        </div>
        <div class="teeny-score-text">
          <p class="teeny-score-title">신뢰도 점수 부여</p>
          <p class="teeny-score-desc">수행 완료 시 신뢰도 점수가 상승합니다.</p>
        </div>
        <img src="@/assets/icons/icon-shield.svg" alt="" class="shield-icon" />
      </button>

      <div class="edit-btns">
        <button class="cancel-btn" @click="cancelEdit">취소</button>
        <button class="submit-btn" :disabled="isSaving" @click="handleUpdate">
          {{ isSaving ? '저장 중...' : '저장하기' }}
        </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getQuestDetail, updateQuest, deleteQuest } from '@/api/quest'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const questId = route.params.questId
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const isEditMode = ref(false)

const quest = ref({})

const editForm = ref({
  title: '',
  content: '',
  deadline: '',
  rewardAmount: 0,
  teenyScoreEnabled: true,
  verificationRequirement: 'PHOTO_REQUIRED',
})

const quickAmounts = [
  { label: '+1,000', value: 1000 },
  { label: '+5,000', value: 5000 },
  { label: '+10,000', value: 10000 },
]

const statusLabel = computed(() => {
  const map = {
    AVAILABLE: '진행 중',
    COMPLETED: '완료',
    EXPIRED: '만료',
    PENDING_REVIEW: '검토 중',
    DECLINED: '거절됨',
  }
  return map[quest.value.status] || quest.value.status
})

const statusClass = computed(() => {
  const map = {
    AVAILABLE: 'status-available',
    COMPLETED: 'status-completed',
    EXPIRED: 'status-expired',
    PENDING_REVIEW: 'status-pending',
    DECLINED: 'status-declined',
  }
  return map[quest.value.status] || ''
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function toLocalDatetime(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date - offset).toISOString().slice(0, 16)
}

function enterEditMode() {
  editForm.value = {
    title: quest.value.title,
    content: quest.value.content,
    deadline: toLocalDatetime(quest.value.deadline),
    rewardAmount: quest.value.rewardAmount,
    teenyScoreEnabled: quest.value.teenyScoreEnabled,
    verificationRequirement: quest.value.verificationRequirement || 'PHOTO_REQUIRED',
  }
  isEditMode.value = true
}

function cancelEdit() {
  isEditMode.value = false
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await getQuestDetail(authStore.accessToken, questId)
    if (res.success) {
      quest.value = res.data
    }
  } catch (error) {
    console.error('퀘스트 조회 실패:', error)
    errorMessage.value = '퀘스트를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})

async function handleUpdate() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const res = await updateQuest(authStore.accessToken, questId, {
      title: editForm.value.title.trim(),
      content: editForm.value.content.trim(),
      deadline: new Date(editForm.value.deadline).toISOString(),
      rewardAmount: Number(editForm.value.rewardAmount),
      teenyScoreEnabled: editForm.value.teenyScoreEnabled,
      verificationRequirement: editForm.value.verificationRequirement,
    })
    if (res.success) {
      quest.value = { ...quest.value, ...res.data }
      isEditMode.value = false
      alert('퀘스트가 수정됐어요!')
    }
  } catch (error) {
    console.error('퀘스트 수정 실패:', error)
    alert('퀘스트 수정에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (!confirm('퀘스트를 삭제하시겠습니까?')) return
  try {
    await deleteQuest(authStore.accessToken, questId)
    alert('퀘스트가 삭제됐어요.')
    router.back()
  } catch (error) {
    console.error('퀘스트 삭제 실패:', error)
    alert('퀘스트 삭제에 실패했습니다.')
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
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background-color: #ffffff;
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

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-placeholder { width: 60px; }

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn {
  background-color: #f4f5f7;
  color: #191b1e;
}

.delete-btn {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.state-box {
  padding: 60px 0;
  text-align: center;
  color: #8b9097;
  font-size: 14px;
}

.error-text { color: #ff3b30; }

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* 자녀 정보 카드 */
.info-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.child-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.child-label {
  margin: 0 0 2px;
  font-size: 11px;
  color: #8b9097;
}

.child-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  flex: 1;
}

/* 상태 배지 */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-available { background-color: #e8f5e9; color: #22c55e; }
.status-completed { background-color: #e3f2fd; color: #3b82f6; }
.status-expired { background-color: #f4f5f7; color: #8b9097; }
.status-pending { background-color: #fff8e1; color: #ffbc00; }
.status-declined { background-color: #ffe5e5; color: #ff3b30; }

/* 정보 행 */
.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  font-weight: 600;
}

.info-value {
  margin: 0;
  font-size: 14px;
  color: #191b1e;
  font-weight: 500;
  line-height: 1.5;
}

.reward {
  font-size: 18px;
  font-weight: 700;
  color: #ffbc00;
}

.divider {
  height: 1px;
  background-color: #f0f1f3;
}

/* 인증 이미지 */
.verify-image-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.verify-image {
  width: 100%;
  object-fit: cover;
}

/* 수정 모드 */
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
}

.input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  font-size: 14px;
  color: #191b1e;
  outline: none;
  box-sizing: border-box;
  background-color: #ffffff;
}

.input::placeholder { color: #b9bec5; }

.textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  font-size: 14px;
  color: #191b1e;
  outline: none;
  box-sizing: border-box;
  background-color: #ffffff;
  resize: none;
  font-family: inherit;
  line-height: 1.6;
}

.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #ffffff;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  padding: 14px 16px;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #191b1e;
  text-align: right;
  outline: none;
}

.won {
  font-size: 16px;
  font-weight: 600;
  color: #191b1e;
}

.quick-btns {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e0e2e6;
  border-radius: 20px;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #191b1e;
  cursor: pointer;
}

.reset-btn { color: #8b9097; }

.teeny-score-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background-color: #fff8e1;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background-color: #f0f1f3;
}

.checkbox.checked { background-color: #ffbc00; }
.check-icon { width: 14px; height: 14px; }

.teeny-score-text { flex: 1; }

.teeny-score-title {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.teeny-score-desc {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.shield-icon { width: 20px; height: 20px; }

.edit-btns {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.cancel-btn {
  flex: 1;
  height: 49px;
  border: 1.5px solid #e0e2e6;
  border-radius: 10px;
  background-color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.submit-btn {
  flex: 2;
  height: 49px;
  border: none;
  border-radius: 10px;
  background-color: #ffbc00;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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