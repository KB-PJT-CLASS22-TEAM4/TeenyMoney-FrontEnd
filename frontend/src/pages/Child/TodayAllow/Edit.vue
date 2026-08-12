<template>
  <div class="allow-screen">
    <!-- 본문 (상단 네비 및 하단 버튼을 스크롤 내부로 포함하여 고정 해제) -->
    <main class="scroll" :class="{ scrolling }" @scroll="onScroll">
      
      <!-- 상단 네비 (고정 해제됨) -->
      <nav class="nav">
        <button class="back-btn" aria-label="뒤로" @click="goBack">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="#15171B" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="nav-title">오늘만 허용 수정하기</h1>
      </nav>

      <!-- 🐥 티니 코치 말풍선 카드 -->
      <section class="teeny-coach-card">
        <img :src="teenyCoachImg" class="coach-mascot" alt="티니 코치" />
        <div class="speech-bubble">
          <div class="coach-title">티니 코치</div>
          <p class="coach-msg">부모님이 확인하시기 전에 요청 내용이나 사유를 수정할 수 있어요!</p>
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

      <!-- 하단 선택 바 & 버튼 영역 -->
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
        
        <!-- 수정하기 / 취소하기 버튼 영역 -->
        <div class="action-buttons">
          <button class="submit" :disabled="!canSubmit" @click="onSubmitEdit">수정 완료</button>
          <button class="btn-delete" @click="showDeleteModal = true">요청 취소하기</button>
        </div>
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
              <span>이대로 수정하면 <strong class="highlight-score">티니점수가 차감</strong>될 수 있어요</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-kids btn-kids--cancel" @click="showBlockWarningModal = false">
              다시 골라볼래요
            </button>
            <button class="btn-kids btn-kids--confirm" @click="processEdit">
              그래도 수정할래요
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. 요청 삭제/취소 확인 모달 -->
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
            <button class="btn-kids btn-kids--cancel" @click="showDeleteModal = false">
              아니요
            </button>
            <button class="btn-kids btn-kids--confirm" @click="processDelete">
              취소할래요
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
import { useAllowRequestStore } from '@/stores/allowRequest'

const router = useRouter()
const route = useRoute()
const allowStore = useAllowRequestStore()

// 3D 학사모 티니 코치 이미지 연결
const teenyCoachImg = new URL('@/assets/mascot/teeny-coach.png', import.meta.url).href

const watchCategories = ref([
  { id: 'pc', label: 'PC방·노래방' },
  { id: 'arcade', label: '오락실·인형뽑기' },
  { id: 'latenight', label: '심야 식당' },
  { id: 'game', label: '게임' },
  { id: 'culture', label: '영화·공연·테마파크' },
  { id: 'shopping', label: '온라인쇼핑' },
  { id: 'lodging', label: '일반숙박업' },
  { id: 'leisure', label: '문화·여가' },
  { id: 'life', label: '생활서비스' },
])

const blockCategories = ref([
  { id: 'nightlife', label: '유흥·단란주점' },
  { id: 'adult_shop', label: '성인용품점' },
  { id: 'gambling_game', label: '사행성 게임' },
  { id: 'adult_entertainment', label: '유흥·성인업소' },
  { id: 'gambling', label: '사행성·도박' },
  { id: 'adult_lodging', label: '성인숙박업' },
])

const selectedWatchIds = ref([])
const selectedBlockIds = ref([])
const reason = ref('')
const MAX_LEN = 100

// 모달 제어 상태
const showBlockWarningModal = ref(false)
const showDeleteModal = ref(false)

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

// 스크롤 표시 제어
const scrolling = ref(false)
let scrollTimer = null
function onScroll() {
  scrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => (scrolling.value = false), 600)
}

// 수정 데이터 초기화
onMounted(() => {
  if (route.query.id) {
    selectedWatchIds.value = ['pc']
    reason.value = '친구들과 숙제 끝내고 1시간만 이용하고 싶어요!'
  }
})

function goBack() {
  router.push({ name: 'child-home' })
}

// 수정 완료 클릭 시 처리
function onSubmitEdit() {
  if (!canSubmit.value) return

  if (hasBlockSelected.value) {
    showBlockWarningModal.value = true
    return
  }

  processEdit()
}

// 수정 프로세스 진행
function processEdit() {
  showBlockWarningModal.value = false

  allowStore.set(
    allSelectedCategories.value.map((c) => c.id),
    allSelectedCategories.value.map((c) => c.label),
    reason.value.trim(),
  )

  router.push({ name: 'child-home' })
}

// 요청 취소(삭제) 프로세스 진행
function processDelete() {
  showDeleteModal.value = false
  router.push({ name: 'child-home' })
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

/* 상단 네비 (스크롤 내부로 포함되어 고정 해제) */
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 50px 0 12px;
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
  padding: 10px 20px 20px;
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

/* 말풍선 메시지 텍스트 - 진한 다크 그레이로 완화 */
.coach-msg {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #4a4d52; /* #33363b에서 눈이 편안한 #4a4d52로 수정 */
  line-height: 1.35;
  word-break: keep-all;
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
  margin: 0 0 12px;
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