<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// TODO: 부모가 설정한 주의/차단 업종 목록을 API로 받아와야 함
// 주의 업종(복수 선택 가능)
const watchCategories = ref([
  { id: 'pc',        label: 'PC방·노래방' },
  { id: 'arcade',    label: '오락실·인형뽑기' },
  { id: 'latenight', label: '심야 식당' },
  { id: 'game',      label: '게임' },
  { id: 'culture',   label: '영화·공연·테마파크' },
  { id: 'shopping',  label: '온라인쇼핑' },
  { id: 'lodging',   label: '일반숙박업' },
  { id: 'leisure',   label: '문화·여가' },
  { id: 'life',      label: '생활서비스' },
])

// 차단 업종 (선택 불가)
const blockCategories = ref([
  '유흥·단란주점', '성인용품점', '사행성 게임',
  '유흥·성인업소', '사행성·도박', '성인숙박업',
])

const selectedIds = ref([])
const reason = ref('')
const MAX_LEN = 100

const isSelected = (id) => selectedIds.value.includes(id)

function toggle(id) {
  const i = selectedIds.value.indexOf(id)
  if (i === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(i, 1)
}

const selectedCategories = computed(() =>
  watchCategories.value.filter((c) => selectedIds.value.includes(c.id))
)

const canSubmit = computed(() => selectedCategories.value.length > 0)

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

// 요청 확인 페이지로 이동
function onSubmit() {
  if (!canSubmit.value) return
  router.push({
    name: 'child-todayallow-requestconfirm',   // TODO: 라우트명 확정 후 맞춰서 변경
    state: {
      // TODO: 실제 연동 시 아래 데이터를 POST /api/child/allow-requests 바디로 사용
      categoryIds: selectedCategories.value.map((c) => c.id),
      categoryLabels: selectedCategories.value.map((c) => c.label),
      reason: reason.value.trim(),
    },
  })
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
        부모님이 <span class="hl">주의</span>로 설정한 업종을 오늘만 허용 요청해보세요
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
          :class="{ 'chip--on': isSelected(c.id) }"
          @click="toggle(c.id)"
        >{{ c.label }}</button>
      </div>

      <!-- 차단 -->
      <div class="legend legend--block">
        <span class="dot dot--block"></span>
        <span class="legend-label">차단</span>
        <span class="legend-desc">선택 불가</span>
      </div>
      <div class="chip-group">
        <span v-for="b in blockCategories" :key="b" class="chip chip--disabled">{{ b }}</span>
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
          <span v-if="!selectedCategories.length" class="selected-empty">없음</span>
          <span v-for="c in selectedCategories" :key="c.id" class="mini-chip">{{ c.label }}</span>
        </div>
      </div>
      <button class="submit" :disabled="!canSubmit" @click="onSubmit">요청 보내기</button>
    </footer>
  </div>
</template>

<style scoped>
/* 화면 프레임 — 거래내역 화면과 동일 */
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
}
.hl {
  color: #e0a500;
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
.chip--on {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #191b1e;
}
.chip--disabled {
  background: #f7f8fa;
  border: 1px solid #eaedf1;
  color: #c6cbd2;
  cursor: not-allowed;
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

/* 하단 */
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
  background: #ffbc00;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  color: #191b1e;
  white-space: nowrap;
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
</style>