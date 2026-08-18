<template>
  <div class="allow-screen">
    <!-- 본문 (스크롤) -->
    <main class="scroll" :class="{ scrolling }" @scroll="onScroll">
      
      <!-- 상단 네비 -->
      <nav class="nav">
        <button class="back-btn" aria-label="뒤로" @click="goBack">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="#15171B" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="nav-title">오늘만 허용 요청</h1>
        <ChildNavActions />
      </nav>

      <!-- 🐥 티니 코치 말풍선 카드 -->
      <section class="teeny-coach-card">
        <img :src="teenyCoachImg" class="coach-mascot" alt="티니 코치" />
        <div class="speech-bubble">
          <div class="coach-title">티니 코치</div>
          <p class="coach-msg">
            부모님이 <span class="hl hl--watch">주의</span> 또는 <span class="hl hl--block">차단</span>으로 설정한 업종을 <br/> 오늘만 허용 요청해보세요!
          </p>
        </div>
      </section>

      <p class="section-title">업종 선택</p>

      <!-- 주의 -->
      <div class="legend">
        <span class="dot dot--watch"></span>
        <span class="legend-label">주의</span>
        <span class="legend-desc">복수 선택 가능</span>
      </div>
      <div class="chip-group">
        <button
          v-for="c in watchCategories"
          :key="c.id"
          class="chip"
          :class="{ 'chip--watch-on': isWatchSelected(c.id) }"
          @click="toggleWatch(c.id)"
        >{{ c.label }}</button>
      </div>

      <!-- 차단 -->
      <div class="legend legend--block">
        <span class="dot dot--block"></span>
        <span class="legend-label">차단</span>
        <span class="legend-desc">선택 시 티니점수가 차감될 수 있어요</span>
      </div>
      <div class="chip-group">
        <button
          v-for="b in blockCategories"
          :key="b.id"
          class="chip"
          :class="{ 'chip--block-on': isBlockSelected(b.id) }"
          @click="toggleBlock(b.id)"
        >{{ b.label }}</button>
      </div>

      <!-- 요청 사유 -->
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

      <!-- 제출 실패 시 에러 메시지 -->
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

      <!-- 하단 선택 바 & 요청 보내기 버튼 -->
      <div class="footer-area">
        <div class="selected-bar">
          <span class="selected-title">선택한 업종</span>
          <div class="selected-chips">
            <span v-if="!allSelectedCategories.length" class="selected-empty">없음</span>
            <span 
              v-for="c in selectedWatchCategories" 
              :key="c.id" 
              class="mini-chip mini-chip--watch"
            >{{ c.label }}</span>
            <span 
              v-for="c in selectedBlockCategories" 
              :key="c.id" 
              class="mini-chip mini-chip--block"
            >{{ c.label }}</span>
          </div>
        </div>
        
        <button class="submit" :disabled="!canSubmit || submitting" @click="onSubmit">
          {{ submitting ? '요청 보내는 중...' : '요청 보내기' }}
        </button>
      </div>
    </main>

    <!-- 1. 차단 업종 경고 모달 -->
    <Transition name="bounce">
      <div v-if="showBlockWarningModal" class="modal-overlay" @click.self="showBlockWarningModal = false">
        <div class="modal-card">
          <div class="modal-badge">
            <span class="badge-icon">🚨</span>
          </div>
          <h3 class="modal-title">잠깐만요!</h3>
          <div class="modal-body">
            <p class="modal-text">
              부모님이 <span class="highlight-block">차단</span>해둔 업종이 들어있어요!
            </p>
            <div class="warning-box">
              <span>이대로 요청하면 <strong class="highlight-score">티니점수가 차감</strong>될 수 있어요</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-kids btn-kids--cancel" @click="showBlockWarningModal = false">
              다시 골라볼래요
            </button>
            <button class="btn-kids btn-kids--confirm" @click="processSubmit">
              그래도 요청할래요
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. 오늘 이미 요청을 보낸 경우 모달 (안내 박스 제거 완료) -->
    <Transition name="bounce">
      <div v-if="showAlreadyRequestedModal" class="modal-overlay" @click.self="showAlreadyRequestedModal = false">
        <div class="modal-card">
          <div class="modal-badge">
            <span class="badge-icon">🚨</span>
          </div>
          <h3 class="modal-title">잠깐만요!</h3>
          <div class="modal-body">
            <p class="modal-text">
              오늘만 허용은 <strong class="highlight-block">하루에 1번만</strong> 보낼 수 있어요!
            </p>
          </div>
          <div class="modal-actions">
            <button class="btn-kids btn-kids--confirm" @click="showAlreadyRequestedModal = false">
              닫기
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAllowRequestStore } from '@/stores/allowRequest'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'

const router = useRouter()
const authStore = useAuthStore()
const allowStore = useAllowRequestStore()

const teenyCoachImg = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

// 카테고리 데이터 (DB mcc_seed_data.sql 확정 기준)
const watchCategories = ref([
  { id: 5,  label: 'PC방·노래방' },
  { id: 4,  label: '게임' },
  { id: 9,  label: '영화·공연·테마파크' },
  { id: 10, label: '온라인쇼핑' },
  { id: 15, label: '일반숙박업' },
  { id: 19, label: '문화·여가' },
  { id: 20, label: '생활서비스' },
])

const blockCategories = ref([
  { id: 12, label: '유흥·성인업소' },
  { id: 13, label: '사행성·도박' },
  { id: 14, label: '성인숙박업' },
])

const selectedWatchIds = ref([])
const selectedBlockIds = ref([])
const reason = ref('')
const MAX_LEN = 100

// 모달 및 제출 상태
const showBlockWarningModal = ref(false)
const showAlreadyRequestedModal = ref(false)
const submitting = ref(false)
const submitError = ref('')

const isWatchSelected = (id) => selectedWatchIds.value.includes(id)
const isBlockSelected = (id) => selectedBlockIds.value.includes(id)

function toggleWatch(id) {
  const i = selectedWatchIds.value.indexOf(id)
  if (i === -1) selectedWatchIds.value.push(id)
  else selectedWatchIds.value.splice(i, 1)
}

function toggleBlock(id) {
  const i = selectedBlockIds.value.indexOf(id)
  if (i === -1) selectedBlockIds.value.push(id)
  else selectedBlockIds.value.splice(i, 1)
}

const selectedWatchCategories = computed(() =>
  watchCategories.value.filter((c) => selectedWatchIds.value.includes(c.id))
)

const selectedBlockCategories = computed(() =>
  blockCategories.value.filter((c) => selectedBlockIds.value.includes(c.id))
)

const allSelectedCategories = computed(() => [
  ...selectedWatchCategories.value,
  ...selectedBlockCategories.value,
])

const hasBlockSelected = computed(() => selectedBlockIds.value.length > 0)
const canSubmit = computed(() => allSelectedCategories.value.length > 0)

const scrolling = ref(false)
let scrollTimer = null
function onScroll() {
  scrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => (scrolling.value = false), 600)
}

function goBack() {
  router.push({ name: 'child-home' })
}

function onSubmit() {
  if (!canSubmit.value || submitting.value) return

  // 차단 업종이 있는 경우 경고 모달 표시
  if (hasBlockSelected.value) {
    showBlockWarningModal.value = true
    return
  }

  processSubmit()
}

async function processSubmit() {
  showBlockWarningModal.value = false
  submitError.value = ''
  submitting.value = true

  try {
    await allowStore.submitPermissionRequest(
      authStore.accessToken,
      allSelectedCategories.value.map((c) => c.id),
      reason.value.trim(),
    )

    allowStore.set(
      allSelectedCategories.value.map((c) => c.id),
      allSelectedCategories.value.map((c) => c.label),
      reason.value.trim(),
    )

    router.push({ name: 'child-todayallow-confirm' })
  } catch (e) {
    console.error('❗SUBMIT ERROR:', e)

    const errorMsg = e.response?.data?.message || e.message || ''
    if (e.response?.status === 400 || errorMsg.includes('이미') || errorMsg.includes('ALREADY')) {
      showAlreadyRequestedModal.value = true
    } else {
      submitError.value = '요청을 보내지 못했어요. 다시 시도해 주세요.'
    }
  } finally {
    submitting.value = false
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
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 55px 0 12px;
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
  padding: 0 20px 20px;
}

.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb { background: #d8dbdf; }

/* 🐥 티니 코치 말풍선 카드 */
.teeny-coach-card {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 12px;
  overflow: visible;
}

.coach-mascot {
  width: 52px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
  margin-left: -10px;
  margin-right: -4px;
  transform: scale(1.08);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
}

.speech-bubble {
  position: relative;
  flex: 1;
  background: #fffbe8;
  border: 1px solid #ffe89a;
  border-radius: 14px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(255, 188, 0, 0.05);
}

.speech-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 6px solid #ffe89a;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  left: -4.5px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5.5px solid #fffbe8;
}

.coach-title {
  font-size: 12px;
  font-weight: 800;
  color: #d98200;
  margin-bottom: 2px;
  line-height: 1.1;
}

.coach-msg {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #4a4d52;
  line-height: 1.35;
  word-break: keep-all;
}

.hl--watch {
  color: #e0a500;
  font-weight: 800;
}
.hl--block {
  color: #e5484d;
  font-weight: 800;
}

.section-title {
  margin: 18px 0 0;
  font-weight: 700;
  font-size: 12.5px;
  color: #8b9097;
}

.legend {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
}
.legend--block { margin-top: 22px; }
.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.dot--watch { background: #e0a500; }
.dot--block { background: #e5484d; }
.legend-label {
  font-weight: 700;
  font-size: 14px;
  color: #15171b;
}
.legend-desc {
  font-weight: 500;
  font-size: 11px;
  color: #b9bec5;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.chip {
  padding: 8px 16px;
  border: 1px solid #e7e9ec;
  border-radius: 999px;
  background: #fff;
  color: #959ba3;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background .12s ease, border-color .12s ease, color .12s ease;
}

.chip--watch-on {
  background: #ffa800;
  border-color: #ffa800;
  color: #ffffff;
}

.chip--block-on {
  background: #e5484d;
  border-color: #e5484d;
  color: #ffffff;
}

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

.selected-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 11px 16px;
  background: #f7f8fa;
  border-radius: 12px;
}
.selected-title {
  font-weight: 600;
  font-size: 12px;
  color: #8b9097;
  white-space: nowrap;
}
.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: flex-end;
}
.selected-empty {
  font-size: 12px;
  color: #b9bec5;
}
.mini-chip {
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  white-space: nowrap;
}
.mini-chip--watch {
  background: #ffa800;
  color: #ffffff;
}
.mini-chip--block {
  background: #e5484d;
  color: #ffffff;
}

.submit {
  width: 100%;
  padding: 15px 0;
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

/* 모달 스타일 */
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
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #4a4d52;
  line-height: 1.45;
}

.warning-box {
  display: block;
  padding: 10px 12px;
  background: #fff5f5;
  border-radius: 14px;
  font-size: 12px;
  color: #5c5f66;
  text-align: center;
  line-height: 1.4;
}

.highlight-block {
  color: #e5484d;
  font-weight: 800;
}

.highlight-score {
  color: #e5484d;
  font-weight: 800;
  text-decoration: none;
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