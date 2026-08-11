<template>
  <div class="page">
    <header class="nav">
      <button class="close-btn" type="button" @click="router.back()">✕</button>
      <h1 class="nav-title">퀘스트 생성</h1>
      <button class="alarm-btn" type="button" aria-label="알림">
        <img src="@/assets/icons/icon-notification.svg" alt="" class="alarm-icon" />
      </button>
    </header>

    <div class="content">

      <!-- 자녀 선택 -->
      <div class="section">
        <p class="section-label">자녀 선택</p>
        <div class="children-list">
          <div
            v-for="child in children"
            :key="child.id"
            class="child-chip"
            :class="{ selected: selectedChildIds.includes(child.id) }"
            @click="toggleChild(child.id)"
          >
            <img
              :src="child.profileImageUrl || '/src/assets/icons/child-profile.svg'"
              alt=""
              class="child-avatar"
            />
            <span class="child-name">{{ child.name }}</span>
          </div>
        </div>
      </div>

      <!-- 제목 -->
      <div class="section">
        <p class="section-label">제목</p>
        <input
          v-model="form.title"
          type="text"
          class="input"
          placeholder="예: 방 청소하기, 일기 쓰기"
        />
      </div>

      <!-- 내용 -->
      <div class="section">
        <p class="section-label">내용</p>
        <textarea
          v-model="form.content"
          class="textarea"
          placeholder="상세한 수행 방법이나 규칙을 적어주세요."
          rows="4"
        />
      </div>

      <!-- 기한 -->
      <div class="section">
        <p class="section-label">기한</p>
        <div class="date-input-wrap">
          <input
            v-model="form.deadline"
            type="datetime-local"
            class="input date-input"
          />
        </div>
      </div>

      <!-- 현금 보상 -->
      <div class="section">
        <p class="section-label">현금 보상</p>
        <div class="amount-wrap">
          <input
            v-model="form.rewardAmount"
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
            @click="addAmount(quick.value)"
          >
            {{ quick.label }}
          </button>
          <button class="quick-btn reset-btn" @click="form.rewardAmount = 0">지움</button>
        </div>
      </div>

      <!-- 신뢰도 점수 부여 -->
      <div class="section">
        <button class="teeny-score-row" type="button" @click="form.teenyScoreEnabled = !form.teenyScoreEnabled">
          <div class="checkbox" :class="{ checked: form.teenyScoreEnabled }">
            <img v-if="form.teenyScoreEnabled" src="@/assets/icons/icon-check.svg" alt="" class="check-icon" />
          </div>
          <div class="teeny-score-text">
            <p class="teeny-score-title">신뢰도 점수 부여</p>
            <p class="teeny-score-desc">수행 완료 시 신뢰도 점수가 상승합니다.</p>
          </div>
          <img src="@/assets/icons/icon-shield.svg" alt="" class="shield-icon" />
        </button>
      </div>

      <!-- 생성하기 버튼 -->
      <button
        class="submit-btn"
        :disabled="!canSubmit || isLoading"
        @click="handleCreate"
      >
        {{ isLoading ? '생성 중...' : '생성하기' }}
      </button>
      <p class="submit-notice">생성된 퀘스트는 자녀의 대시보드에 즉시 노출됩니다.</p>
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
import { getChildren } from '@/api/children'
import { createQuest } from '@/api/quest'

const router = useRouter()
const authStore = useAuthStore()

const children = ref([])
const selectedChildIds = ref([])
const isLoading = ref(false)

const form = ref({
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

const canSubmit = computed(() =>
  selectedChildIds.value.length > 0 &&
  form.value.title.trim() &&
  form.value.content.trim() &&
  form.value.deadline &&
  form.value.rewardAmount >= 0
)

onMounted(async () => {
  try {
    const res = await getChildren(authStore.accessToken)
    if (res.success) {
      children.value = res.data.map(child => ({
        id: child.childId,
        name: child.name,
        profileImageUrl: child.profileImageUrl,
      }))
    }
  } catch (error) {
    console.error('자녀 목록 불러오기 실패:', error)
  }
})

function toggleChild(id) {
  if (selectedChildIds.value.includes(id)) {
    selectedChildIds.value = selectedChildIds.value.filter(c => c !== id)
  } else {
    selectedChildIds.value.push(id)
  }
}

function addAmount(value) {
  form.value.rewardAmount = (Number(form.value.rewardAmount) || 0) + value
}

async function handleCreate() {
  if (!canSubmit.value || isLoading.value) return

  isLoading.value = true
  try {
    const res = await createQuest(authStore.accessToken, {
      childIds: selectedChildIds.value,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      deadline: new Date(form.value.deadline).toISOString(),
      rewardAmount: Number(form.value.rewardAmount),
      teenyScoreEnabled: form.value.teenyScoreEnabled,
      verificationRequirement: form.value.verificationRequirement,
    })

    if (res.success) {
      alert('퀘스트가 생성됐어요!')
      router.back()
    }
  } catch (error) {
    console.error('퀘스트 생성 실패:', error)
    alert('퀘스트 생성에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
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
  padding-bottom: 70px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #191b1e;
  cursor: pointer;
}

.alarm-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.alarm-icon { width: 24px; height: 24px; }

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 16px;
}

.section-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
}

/* 자녀 선택 */
.children-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.child-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px 8px 8px;
  border-radius: 30px;
  background-color: #f4f5f7;
  cursor: pointer;
  border: 2px solid transparent;
}

.child-chip.selected {
  border-color: #ffbc00;
  background-color: #fff8e1;
}

.child-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.child-name {
  font-size: 13px;
  font-weight: 600;
  color: #191b1e;
}

/* 입력 필드 */
.input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #f0f1f3;
  border-radius: 10px;
  font-size: 14px;
  color: #191b1e;
  outline: none;
  box-sizing: border-box;
  background-color: #f4f5f7;
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
  background-color: #f4f5f7;
  resize: none;
  font-family: inherit;
  line-height: 1.6;
}

.textarea::placeholder { color: #b9bec5; }

.date-input-wrap {
  position: relative;
}

.date-input {
  cursor: pointer;
}

/* 현금 보상 */
.amount-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  background-color: #f4f5f7;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
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

.reset-btn {
  color: #8b9097;
}

/* 신뢰도 점수 */
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

.checkbox.checked {
  background-color: #ffbc00;
}

.check-icon { width: 14px; height: 14px; }

.teeny-score-text {
  flex: 1;
}

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

/* 생성하기 버튼 */
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

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit-notice {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
  text-align: center;
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