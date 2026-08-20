<template>
  <div class="allow-screen">
    <!-- 상단 네비 — 화면 좌우 끝까지 꽉 차게 스크롤 영역 밖으로 뺀다 -->
    <nav class="nav">
      <button class="back-btn" aria-label="뒤로" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171B" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="nav-title">오늘만 허용 수정하기</h1>
      <ChildNavActions />
    </nav>

    <main class="scroll" :class="{ scrolling }" @scroll="onScroll">

      <p class="section-title">신청한 업종</p>
      <div class="category-badge" :class="`category-badge--${categoryType}`">
        <span class="category-type-label">{{ categoryTypeLabel }}</span>
        <span class="category-name">{{ categoryName || '불러오는 중...' }}</span>
      </div>

      <p class="section-title">요청 사유</p>
      <div class="textarea-wrap">
        <textarea
          v-model="reason"
          class="reason"
          :maxlength="MAX_LEN"
          placeholder="사유를 입력해 주세요"
        ></textarea>
        <span class="counter">{{ reason.length }}/{{ MAX_LEN }}</span>
      </div>
      <p class="helper">사유를 자세히 적을수록 승인될 확률이 높아요</p>

      <p v-if="loadError" class="submit-error">{{ loadError }}</p>
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
      <p v-if="deleteError" class="submit-error">{{ deleteError }}</p>

      <div class="footer-area">
        <div class="action-buttons">
          <button class="submit" :disabled="!canSubmit || submitting" @click="processEdit">
            {{ submitting ? '수정 중...' : '수정 완료' }}
          </button>
          <button class="btn-delete" :disabled="deleting" @click="showDeleteModal = true">
            요청 취소하기
          </button>
        </div>
      </div>
    </main>

    <!-- 요청 취소 확인 모달 -->
    <Transition name="bounce">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-card">
          <div class="modal-badge">
            <span class="badge-icon">🚨</span>
          </div>
          <h3 class="modal-title">요청을 취소할까요?</h3>
          <div class="modal-body">
            <p class="modal-text">
              취소하면 부모님께 보낸 요청이 사라져요!
            </p>
          </div>
          <div class="modal-actions">
            <button class="btn-kids btn-kids--cancel" :disabled="deleting" @click="showDeleteModal = false">
              아니요
            </button>
            <button class="btn-kids btn-kids--confirm" :disabled="deleting" @click="processDelete">
              {{ deleting ? '취소하는 중...' : '취소할래요' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAllowRequestStore } from '@/stores/allowRequest'
import { getCategoryPolicyGroups } from '@/api/categoryPolicy'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const allowStore = useAllowRequestStore()

const permissionId = route.query.id ? Number(route.query.id) : null

// 주의/차단 구분용 카테고리 이름 목록 — 부모가 바꾼 정책이 바로 반영되도록 API로 불러온다.
const watchCategoryLabels = ref([])
const blockCategoryLabels = ref([])

async function fetchCategoryTypeLists() {
  try {
    const result = await getCategoryPolicyGroups(authStore.accessToken, authStore.memberId)
    const groups = result.data || []
    watchCategoryLabels.value = (groups.find((g) => g.policy === 'WATCH')?.categoryPolicyList || [])
      .map((item) => item.categoryName)
    blockCategoryLabels.value = (groups.find((g) => g.policy === 'BLOCK')?.categoryPolicyList || [])
      .map((item) => item.categoryName)
  } catch (e) {
    console.error('카테고리 정책 조회 실패:', e)
  }
}

const reason = ref('')
const categoryName = ref(route.query.label ?? '')
const MAX_LEN = 100

// 신청한 업종이 주의/차단 중 어디에 속하는지
const categoryType = computed(() => {
  if (blockCategoryLabels.value.includes(categoryName.value)) return 'block'
  return 'watch'
})
const categoryTypeLabel = computed(() => (categoryType.value === 'block' ? '차단' : '주의'))

const showDeleteModal = ref(false)
const submitting = ref(false)
const submitError = ref('')
const deleting = ref(false)
const deleteError = ref('')
const loadError = ref('')

const canSubmit = computed(() => reason.value.trim().length > 0)

const scrolling = ref(false)
let scrollTimer = null
function onScroll() {
  scrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => (scrolling.value = false), 600)
}

// 현재 신청 사유로 폼 초기화
onMounted(async () => {
  fetchCategoryTypeLists()

  if (!permissionId) {
    loadError.value = '요청 정보를 찾을 수 없어요.'
    return
  }

  let list = allowStore.todayPermission

  if (!Array.isArray(list) || list.length === 0) {
    try {
      list = await allowStore.fetchTodayPermission(authStore.accessToken, authStore.memberId)
    } catch (e) {
      loadError.value = '요청 내용을 불러오지 못했어요.'
      return
    }
  }

  const current = list.find((p) => p.id === permissionId)
  if (!current) {
    loadError.value = '해당 요청을 찾을 수 없어요.'
    return
  }

  categoryName.value = current.category
  reason.value = current.reason ?? ''
})

function goBack() {
  router.push({ name: 'child-home' })
}

async function processEdit() {
  if (!canSubmit.value || !permissionId) return

  submitError.value = ''
  submitting.value = true

  try {
    await allowStore.editPermissionRequest(
      authStore.accessToken,
      permissionId,
      reason.value.trim(),
    )

    router.push({ name: 'child-home' })
  } catch (e) {
    submitError.value = e.message || '수정하지 못했어요. 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}

async function processDelete() {
  if (!permissionId) return

  deleteError.value = ''
  deleting.value = true

  try {
    await allowStore.cancelPermissionRequest(authStore.accessToken, permissionId)
    showDeleteModal.value = false
    router.push({ name: 'child-home' })
  } catch (e) {
    deleteError.value = e.message || '취소하지 못했어요. 다시 시도해주세요.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.allow-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
}

.back-btn {
  display: flex;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #15171b;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 20px;
}

.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

.section-title {
  margin: 18px 0 0;
  font-weight: 700;
  font-size: 12.5px;
  color: #8b9097;
}

/* 신청한 업종 배지 (읽기 전용) */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.category-badge--watch {
  background: #fff8e5;
  border-color: #ffe89a;
}

.category-badge--block {
  background: #ffeded;
  border-color: #ffc9cb;
}

.category-type-label {
  font-weight: 800;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
}

.category-badge--watch .category-type-label {
  background: #ffa800;
  color: #ffffff;
}

.category-badge--block .category-type-label {
  background: #e5484d;
  color: #ffffff;
}

.category-name {
  font-weight: 800;
  font-size: 13.5px;
}

.category-badge--watch .category-name { color: #d98200; }
.category-badge--block .category-name { color: #e5484d; }

.textarea-wrap {
  position: relative;
  margin-top: 10px;
}
.reason {
  box-sizing: border-box;
  width: 100%;
  min-height: 130px;
  padding: 14px 16px 34px;
  border: 1px solid #e7e9ec;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-weight: 500;
  font-size: 13px;
  line-height: 22px;
  color: #15171b;
}
.reason::placeholder { color: #c6cbd2; }
.reason:focus {
  outline: none;
  border-color: #ffbc00;
}
.counter {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 11px;
  color: #c6cbd2;
}
.helper {
  margin: 6px 0 0;
  font-weight: 500;
  font-size: 11px;
  color: #b9bec5;
}

.submit-error {
  margin: 10px 2px 0;
  font-weight: 600;
  font-size: 12px;
  color: #e5484d;
}

.footer-area {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f1f3;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-family: inherit;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
}
.submit:disabled {
  background: #f0e4b8;
  color: #b7a98c;
  cursor: not-allowed;
}

.btn-delete {
  width: 100%;
  padding: 13px 0;
  border: none;
  border-radius: 14px;
  background: #f1f3f5;
  color: #5c626a;
  font-family: inherit;
  font-weight: 800;
  font-size: 13.5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-delete:active {
  background: #e2e6ea;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(21, 23, 27, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 290px;
  background: #ffffff;
  border-radius: 28px;
  padding: 32px 20px 22px;
  text-align: center;
  border: 2px solid #f0f1f3;
  box-shadow: none;
}

.modal-badge {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  width: 52px;
  height: 52px;
  background: #ffeded;
  border: 3px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  margin: 6px 0 12px;
  font-size: 18px;
  font-weight: 800;
  color: #15171b;
  letter-spacing: -0.3px;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-text {
  margin: 0 0 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: #4a4d52;
  line-height: 1.45;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-kids {
  width: 100%;
  padding: 13px 0;
  border-radius: 16px;
  font-family: inherit;
  font-weight: 800;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;
}

.btn-kids:active {
  transform: scale(0.98);
}

.btn-kids:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-kids--cancel {
  background: #f1f3f5;
  color: #61666d;
}

.btn-kids--confirm {
  background: #ff5252;
  color: #ffffff;
}

.bounce-enter-active {
  animation: bounce-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.bounce-leave-active {
  animation: bounce-in 0.2s reverse ease-in;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>