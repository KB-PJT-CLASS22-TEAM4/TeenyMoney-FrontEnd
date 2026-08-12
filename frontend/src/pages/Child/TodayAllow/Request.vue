<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAllowRequestStore } from '@/stores/allowRequest'

const router = useRouter()
const allowStore = useAllowRequestStore()

// 주의 업종 (복수 선택 가능)
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

// 차단 업종
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

// 경고 모달 제어 상태
const showBlockWarningModal = ref(false)

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

// 선택된 주의 업종 객체 목록
const selectedWatchCategories = computed(() =>
  watchCategories.value.filter((c) => selectedWatchIds.value.includes(c.id))
)

// 선택된 차단 업종 객체 목록
const selectedBlockCategories = computed(() =>
  blockCategories.value.filter((c) => selectedBlockIds.value.includes(c.id))
)

// 전체 선택된 업종 목록
const allSelectedCategories = computed(() => [
  ...selectedWatchCategories.value,
  ...selectedBlockCategories.value,
])

// 차단 업종 포함 여부
const hasBlockSelected = computed(() => selectedBlockIds.value.length > 0)

const canSubmit = computed(() => allSelectedCategories.value.length > 0)

/* 스크롤 시에만 스크롤바 노출 */
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

// 요청 버튼 클릭 처리
function onSubmit() {
  if (!canSubmit.value) return

  // 차단 업종이 하나라도 선택된 경우 경고 모달을 띄움
  if (hasBlockSelected.value) {
    showBlockWarningModal.value = true
    return
  }

  processSubmit()
}

// 최종 요청 전송
function processSubmit() {
  showBlockWarningModal.value = false

  allowStore.set(
    allSelectedCategories.value.map((c) => c.id),
    allSelectedCategories.value.map((c) => c.label),
    reason.value.trim(),
  )

  router.push({ name: 'child-todayallow-confirm' })
}
</script>

<template>
  <div class="allow-screen">
    <!-- 상단 네비 -->
    <nav class="nav">
      <button class="back-btn" aria-label="뒤로" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#15171B" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="nav-title">오늘만 허용 요청</h1>
    </nav>

    <!-- 본문 (스크롤) -->
    <main class="scroll" :class="{ scrolling }" @scroll="onScroll">
      <p class="desc">
        부모님이 <span class="hl hl--watch">주의</span> 또는 <span class="hl hl--block">차단</span>으로 설정한 업종을 오늘만 허용 요청해보세요
      </p>

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
    </main>

    <!-- 하단 고정 영역 -->
    <footer class="footer">
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
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">요청 보내기</button>
    </footer>

    <!-- 어린이 친화적 차단 업종 경고 모달 -->
    <Transition name="bounce">
      <div v-if="showBlockWarningModal" class="modal-overlay" @click.self="showBlockWarningModal = false">
        <div class="modal-card">
          <!-- 모달 캐릭터 / 이모지 헤더 -->
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
  </div>
</template>

<style scoped>
/* 화면 프레임 */
.allow-screen {
  box-sizing: border-box;
  position: relative;         
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 16px 6px;
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

/* 스크롤 본문 */
.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 20px;
}
.scroll::-webkit-scrollbar {
  width: 3px;
}
.scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background 0.3s;
}
.scroll.scrolling::-webkit-scrollbar-thumb {
  background: #d8dbdf;
}

.desc {
  margin: 4px 0 8px;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
  line-height: 1.4;
}
.hl--watch {
  color: #e0a500;
  font-weight: 700;
}
.hl--block {
  color: #e5484d;
  font-weight: 700;
}

.section-title {
  margin: 18px 0 0;
  font-weight: 700;
  font-size: 12.5px;
  color: #8b9097;
}

/* 범례 */
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

/* 기본 칩 스타일 */
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

/* 주의 칩 선택 상태 */
.chip--watch-on {
  background: #ffa800;
  border-color: #ffa800;
  color: #ffffff;
}

/* 차단 칩 선택 상태 */
.chip--block-on {
  background: #e5484d;
  border-color: #e5484d;
  color: #ffffff;
}

/* 사유 입력 */
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

/* 하단 고정 영역 */
.footer {
  padding: 12px 20px 20px;
  border-top: 1px solid #f0f1f3;
  background: #fff;
}
.selected-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 13px 16px;
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

/* =========================================
   🎈 어린이 친화적 모달 (Shadow-Free UI)
   ========================================= */
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

/* 상단 상징 이모지 배지 및 수평/수직 정렬 */
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
  box-shadow: none;
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

/* 정보 알림 박스 */
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

/* 밑줄 제거 및 굵은 강조 */
.highlight-score {
  color: #e5484d;
  font-weight: 800;
  text-decoration: none;
}

/* 버튼 스타일 (그림자 제거) */
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
  box-shadow: none;
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

/* 모달 애니메이션 */
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