<template>
  <div class="quest-screen">
    <div class="scroll">

      <!-- 상단 네비 -->
      <div class="nav">
        <button class="back-btn" @click="goBack" aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">퀘스트</h1>
      </div>

      <!-- 탭 스위처 -->
      <div class="tab-switcher">
        <button v-for="t in tabs" :key="t.key" class="tab-btn"
                :class="{ active: activeTab === t.key }"
                @click="activeTab = t.key">
          <span class="tab-btn-inner">
            <span class="tab-label">{{ t.label }}</span>
            <span class="tab-count" :class="{ active: activeTab === t.key }">{{ tabCounts[t.key] }}</span>
          </span>
        </button>
      </div>

      <!-- 시작 가능 -->
      <template v-if="activeTab === 'available'">
        <div class="section-head">
          <div class="section-title-row">
            <span class="section-title">받을 수 있는 퀘스트</span>
            <span class="section-count">{{ filteredAvailable.length }}건</span>
          </div>
          <button class="icon-btn" @click="searchOpen = !searchOpen" aria-label="검색">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="#8a9099" stroke-width="1.8"/>
              <path d="M20 20l-4.3-4.3" stroke="#8a9099" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <input v-if="searchOpen" v-model="searchText" class="search-input"
               placeholder="퀘스트 이름으로 검색" autofocus>

        <!-- 티니 코치 말풍선 -->
        <div class="coach-block">
          <img src="@/assets/mascot/teeny-coach.png" alt="티니 코치" class="coach-avatar" />
          <div class="coach-bubble">
            <span class="coach-name">티니 코치</span>
            <p class="coach-text">수락한 퀘스트를 해내면 티니점수가 3점 올라가요.</p>
          </div>
        </div>

        <div v-if="filteredAvailable.length === 0" class="empty-state">
          <p>지금은 받을 수 있는 퀘스트가 없어요</p>
        </div>

        <TransitionGroup v-else name="card-move" tag="div" class="quest-list">
          <template v-for="(q, i) in filteredAvailable" :key="q.id">
            <div class="quest-row" :class="{ liked: q.favorited }" @click="toggleExpand(q.id)">
              <div class="quest-icon-wrap">
                <div class="quest-icon" :style="{ background: i % 2 === 0 ? '#fff3d6' : '#eef2fb' }">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <rect x="6" y="4" width="12" height="16" rx="2" :stroke="i % 2 === 0 ? '#d99a00' : '#4585d6'" stroke-width="1.6"/>
                    <rect x="9" y="2.5" width="6" height="3" rx="1" :stroke="i % 2 === 0 ? '#d99a00' : '#4585d6'" stroke-width="1.6" fill="#fff"/>
                    <line x1="9" y1="10.5" x2="15" y2="10.5" :stroke="i % 2 === 0 ? '#d99a00' : '#4585d6'" stroke-width="1.6"/>
                    <line x1="9" y1="14" x2="15" y2="14" :stroke="i % 2 === 0 ? '#d99a00' : '#4585d6'" stroke-width="1.6"/>
                  </svg>
                </div>
                <button class="star-btn" :class="{ active: q.favorited }"
                        @click.stop="toggleFavorite(q)" aria-label="찜하기">
                  <svg class="star" :class="{ on: q.favorited }" viewBox="0 0 24 24" width="12" height="12"
                       :fill="q.favorited ? '#ffbc00' : 'none'">
                    <path d="M12 3.5l2.55 5.17 5.7.83-4.13 4.02.97 5.68L12 16.4l-5.1 2.68.98-5.68-4.13-4.02 5.7-.83L12 3.5z"
                          :stroke="q.favorited ? '#ffbc00' : '#c6cbd2'" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div class="quest-row-body">
                <div class="quest-title-row">
                  <!-- 티니점수 메달 아이콘 -->
                  <svg v-if="q.teenyScoreTarget" class="medal-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <circle cx="12" cy="14" r="6" fill="#FFC107" stroke="#D97706" stroke-width="1.4"/>
                    <path d="M9 3l3 4.5L15 3" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11.5v5M10 14h4" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  <b class="quest-row-title">{{ q.title }}</b>
                </div>
                <div class="quest-row-meta">
                  <span>기한: D-{{ q.dDay }}</span>
                </div>
              </div>
              <div class="quest-row-right">
                <span v-if="q.rewardAmount > 0" class="row-amount">{{ q.rewardAmount.toLocaleString() }}원</span>
                <svg class="row-chevron" :class="{ open: expandedId === q.id }" viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="#c6cbd2" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <div v-if="expandedId === q.id" :key="`${q.id}-expand`" class="quest-expand" @click.stop>
              <p class="quest-expand-content">{{ q.content }}</p>

              <div v-if="decliningId !== q.id" class="quest-actions">
                <button class="btn btn-outline" @click="startDecline(q.id)">거절하기</button>
                <button class="btn btn-primary" @click="acceptQuest(q)">승인하기</button>
              </div>

              <!-- 거절 사유 패널 -->
              <div v-else class="decline-panel">
                <span class="decline-title">거절 사유를 알려주세요</span>
                <div class="decline-reasons">
                  <label v-for="r in declineReasons" :key="r.code" class="decline-reason-item"
                         :class="{ selected: declineReasonCode === r.code }">
                    <input type="radio" :value="r.code" v-model="declineReasonCode" name="declineReasonAvailable">
                    {{ r.label }}
                  </label>
                </div>
                <textarea v-if="declineReasonCode" class="decline-textarea"
                          v-model="declineDetail"
                          :placeholder="declineReasonCode === 'OTHER' ? '사유를 자세히 알려주세요 (필수)' : '하고 싶은 말이 있다면 적어주세요 (선택)'"></textarea>

                <div class="quest-actions">
                  <button class="btn btn-outline" @click="cancelDecline">취소</button>
                  <button class="btn btn-danger" :disabled="!canConfirmDecline" @click="confirmDecline(q)">거절 확정</button>
                </div>
              </div>
            </div>
          </template>
        </TransitionGroup>

        <div v-if="filteredAvailable.length > 0" class="bottom-tip">
          <div class="bottom-tip-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#d99a00" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="bottom-tip-title">퀘스트는 계속 추가돼요</span>
          <p class="bottom-tip-desc">부모님이 새로운 퀘스트를 등록하면<br>여기에 바로 나타나요</p>
        </div>
      </template>

      <!-- 진행 중 -->
      <template v-else-if="activeTab === 'ongoing'">
        <div v-if="ongoingQuests.length === 0" class="empty-state">
          <p>진행 중인 퀘스트가 없어요</p>
        </div>

        <div v-for="group in ongoingGroups" :key="group.status" class="completed-group">
          <span class="completed-date">{{ group.label }} {{ group.items.length }}</span>

          <div v-for="(q, i) in group.items" :key="q.id" class="quest-row ongoing-card">
            <div class="ongoing-card-top">
              <div class="quest-icon" :style="{ background: statusIconColor(ongoingBadge(q.subStatus).class).bg }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect x="6" y="4" width="12" height="16" rx="2" :stroke="statusIconColor(ongoingBadge(q.subStatus).class).stroke" stroke-width="1.6"/>
                  <rect x="9" y="2.5" width="6" height="3" rx="1" :stroke="statusIconColor(ongoingBadge(q.subStatus).class).stroke" stroke-width="1.6" fill="#fff"/>
                  <line x1="9" y1="10.5" x2="15" y2="10.5" :stroke="statusIconColor(ongoingBadge(q.subStatus).class).stroke" stroke-width="1.6"/>
                  <line x1="9" y1="14" x2="15" y2="14" :stroke="statusIconColor(ongoingBadge(q.subStatus).class).stroke" stroke-width="1.6"/>
                </svg>
              </div>
              <div class="quest-row-body">
                <div class="quest-badges-row">
                  <span class="inline-badge" :class="ongoingBadge(q.subStatus).class">
                    {{ ongoingBadge(q.subStatus).label }}
                  </span>
                </div>
                <div class="quest-title-row">
                  <!-- 티니점수 메달 아이콘 -->
                  <svg v-if="q.teenyScoreTarget" class="medal-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <circle cx="12" cy="14" r="6" fill="#FFC107" stroke="#D97706" stroke-width="1.4"/>
                    <path d="M9 3l3 4.5L15 3" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11.5v5M10 14h4" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  <b class="quest-row-title wrap">{{ q.title }}</b>
                </div>
                <div class="quest-row-meta">
                  <span v-if="q.rewardAmount > 0">{{ q.rewardAmount.toLocaleString() }}원</span>
                  <span v-if="q.rewardAmount > 0" class="dot">·</span>
                  <span>
                    <template v-if="q.subStatus === 'PENDING'">{{ q.submittedAt }} 제출</template>
                    <template v-else>D-{{ q.dDay }}</template>
                  </span>
                </div>
              </div>
            </div>

            <!-- 진행중: 인증하기 버튼 -->
            <button v-if="q.subStatus === 'IN_PROGRESS'" class="ongoing-cta" @click="goVerify(q)">
              퀘스트 인증하기
            </button>

            <!-- 승인 대기: 안내 + 인증 보기 링크 -->
            <div v-else-if="q.subStatus === 'PENDING'" class="pending-box">
              <span class="pending-box-text">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path d="M7 4h10M7 20h10M7.5 4c0 4 3 5.5 4.5 6.5C10.5 11.5 7.5 13 7.5 20M16.5 4c0 4-3 5.5-4.5 6.5 1.5 1 4.5 2.5 4.5 9.5"
                        stroke="#d99a00" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                부모님 확인을 기다리는 중이에요
              </span>
              <button class="pending-box-link" @click="goVerify(q, true)">인증 보기</button>
            </div>

            <!-- 반려됨: 사유 + 재시도 -->
            <div v-else class="rejected-box">
              <div class="rejected-box-header">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path d="M12 9v4.5M12 16.2v.1" stroke="#e5484d" stroke-width="1.8" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="8.5" stroke="#e5484d" stroke-width="1.6"/>
                </svg>
                반려됨 · 남은 기회 {{ q.remainingCount }}회
              </div>
              <p class="rejected-box-quote">"{{ q.lastRejectionReason }}"</p>
              <div class="rejected-box-actions">
                <button class="btn-view" @click="goVerify(q, true)">제출 내용 보기</button>
                <button class="btn-retry" @click="goVerify(q)">다시 인증하기</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 완료 -->
      <template v-else>
        <div v-if="completedQuests.length === 0" class="empty-state">
          <p>아직 완료된 퀘스트가 없어요</p>
        </div>

        <div v-for="group in completedGroups" :key="group.date" class="completed-group">
          <span class="completed-date">{{ group.date }}</span>

          <div v-for="(q, i) in group.items" :key="q.id" class="quest-row static">
            <div class="quest-icon" :style="{ background: statusIconColor(resultBadge(q.resultStatus).class).bg }">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <rect x="6" y="4" width="12" height="16" rx="2" :stroke="statusIconColor(resultBadge(q.resultStatus).class).stroke" stroke-width="1.6"/>
                <rect x="9" y="2.5" width="6" height="3" rx="1" :stroke="statusIconColor(resultBadge(q.resultStatus).class).stroke" stroke-width="1.6" fill="#fff"/>
                <line x1="9" y1="10.5" x2="15" y2="10.5" :stroke="statusIconColor(resultBadge(q.resultStatus).class).stroke" stroke-width="1.6"/>
                <line x1="9" y1="14" x2="15" y2="14" :stroke="statusIconColor(resultBadge(q.resultStatus).class).stroke" stroke-width="1.6"/>
              </svg>
            </div>
            <div class="quest-row-body">
              <div class="quest-title-row">
                <!-- 티니점수 메달 아이콘 -->
                <svg v-if="q.teenyScoreTarget" class="medal-icon" viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <circle cx="12" cy="14" r="6" fill="#FFC107" stroke="#D97706" stroke-width="1.4"/>
                  <path d="M9 3l3 4.5L15 3" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 11.5v5M10 14h4" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <b class="quest-row-title">{{ q.title }}</b>
              </div>
              <div class="quest-row-meta">
                <template v-if="q.resultStatus === 'COMPLETED' && q.rewardAmount > 0">{{ q.rewardAmount.toLocaleString() }}원 받았어요</template>
                <template v-else-if="q.resultStatus === 'FAILED'"><span class="encourage">다음엔 꼭 성공해봐요</span></template>
                <template v-else-if="q.resultStatus === 'EXPIRED'">기한 안에 시작하지 못했어요</template>
                <template v-else-if="q.resultStatus === 'DECLINED'">직접 거절한 퀘스트예요</template>
              </div>
            </div>
            <div class="quest-row-right">
              <div class="quest-row-right-stack">
                <span class="inline-badge" :class="resultBadge(q.resultStatus).class">
                  {{ resultBadge(q.resultStatus).label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>

    <BottomTabBar active="home" @select="onTabSelect" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useQuestStore } from '@/stores/quest'

const router = useRouter()
const authStore = useAuthStore()
const questStore = useQuestStore()

const tabs = [
  { key: 'available', label: '시작 가능' },
  { key: 'ongoing',   label: '진행 중' },
  { key: 'completed', label: '완료' },
]
const activeTab = ref('available')

// 스토어 상태를 그대로 참조
const availableQuests = computed(() => questStore.availableQuests)
const ongoingQuests = computed(() => questStore.ongoingQuests)
const completedQuests = computed(() => questStore.completedQuests)

async function loadTab(tabKey) {
  try {
    await questStore.ensureTab(authStore.accessToken, tabKey)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  tabs.forEach((t) => loadTab(t.key))
})
watch(activeTab, (key) => loadTab(key))

function toggleFavorite(q) {
  // 찜 기능은 백엔드 API 미지원 - 로컬 상태로만 토글
  q.favorited = !q.favorited
}

const searchOpen = ref(false)
const searchText = ref('')
const filteredAvailable = computed(() => {
  const list = !searchText.value.trim()
    ? [...availableQuests.value]
    : availableQuests.value.filter(q => q.title.includes(searchText.value.trim()))

  return list.sort((a, b) => Number(b.favorited) - Number(a.favorited))
})

const ONGOING_ORDER = ['IN_PROGRESS', 'PENDING', 'REJECTED']
const ongoingGroups = computed(() => {
  return ONGOING_ORDER
    .map(status => ({
      status,
      label: ongoingBadge(status).groupLabel,
      items: ongoingQuests.value.filter(q => q.subStatus === status),
    }))
    .filter(g => g.items.length > 0)
})

const completedGroups = computed(() => {
  const map = new Map()
  for (const q of completedQuests.value) {
    if (!map.has(q.endedAt)) map.set(q.endedAt, [])
    map.get(q.endedAt).push(q)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
})

const tabCounts = computed(() => ({
  available: availableQuests.value.length,
  ongoing: ongoingQuests.value.length,
  completed: completedQuests.value.length,
}))

function ongoingBadge(subStatus) {
  if (subStatus === 'PENDING')  return { label: '승인 대기', groupLabel: '승인 대기중', class: 'status-pending' }
  if (subStatus === 'REJECTED') return { label: '반려됨',    groupLabel: '반려됨',      class: 'status-rejected' }
  return { label: '진행중', groupLabel: '진행 중', class: 'status-progress' }
}

function resultBadge(status) {
  if (status === 'COMPLETED') return { label: '성공',      class: 'status-success' }
  if (status === 'FAILED')    return { label: '실패',      class: 'status-failed' }
  if (status === 'EXPIRED')   return { label: '기한 만료', class: 'status-neutral' }
  return { label: '거절함', class: 'status-neutral' }
}

const STATUS_ICON_COLORS = {
  'status-progress': { bg: '#e8f0fb', stroke: '#4585d6' },
  'status-pending':  { bg: '#fff6dd', stroke: '#d99a00' },
  'status-rejected': { bg: '#fbe9e9', stroke: '#e5484d' },
  'status-success':  { bg: '#e8f4e2', stroke: '#62b24a' },
  'status-failed':   { bg: '#f4e9e9', stroke: '#b96565' },
  'status-neutral':  { bg: '#f2f4f6', stroke: '#8a9099' },
}
function statusIconColor(statusClass) {
  return STATUS_ICON_COLORS[statusClass] ?? STATUS_ICON_COLORS['status-neutral']
}

const declineReasons = [
  { code: 'NOT_ENOUGH_TIME',    label: '시간이 부족해요' },
  { code: 'TOO_DIFFICULT',      label: '너무 어려워요' },
  { code: 'REWARD_NOT_ENOUGH',  label: '보상이 부족해요' },
  { code: 'HARD_TO_VERIFY',     label: '인증하기 어려워요' },
  { code: 'CANNOT_DO_NOW',      label: '지금은 할 수 없어요' },
  { code: 'OTHER',              label: '기타' },
]

const expandedId = ref(null)
const decliningId = ref(null)
const declineReasonCode = ref('')
const declineDetail = ref('')

async function toggleExpand(id) {
  if (expandedId.value === id) {
    expandedId.value = null
    cancelDecline()
    return
  }
  expandedId.value = id
  cancelDecline()

  // 목록 API엔 content가 없어서 펼칠 때 상세 조회로 채움
  const q = availableQuests.value.find((item) => item.id === id)
  if (q && !q.content) {
    try {
      await questStore.fetchDetailInto(authStore.accessToken, id, questStore.availableQuests)
    } catch (e) {
      console.error(e)
    }
  }
}

function startDecline(id) {
  decliningId.value = id
  declineReasonCode.value = ''
  declineDetail.value = ''
}

function cancelDecline() {
  decliningId.value = null
  declineReasonCode.value = ''
  declineDetail.value = ''
}

const canConfirmDecline = computed(() => {
  if (!declineReasonCode.value) return false
  if (declineReasonCode.value === 'OTHER' && !declineDetail.value.trim()) return false
  return true
})

async function acceptQuest(q) {
  try {
    await questStore.accept(authStore.accessToken, q.id)
    expandedId.value = null
    // 진행중 개수 배지를 탭 이동 없이 바로 갱신
    loadTab('ongoing')
  } catch (e) {
    alert(e.message)
  }
}

async function confirmDecline(q) {
  try {
    await questStore.decline(authStore.accessToken, q.id, declineReasonCode.value, declineDetail.value)
    cancelDecline()
    expandedId.value = null
    // 완료 개수 배지를 탭 이동 없이 바로 갱신
    loadTab('completed')
  } catch (e) {
    alert(e.message)
  }
}

function goVerify(q, viewOnly = false) {
  router.push({ name: 'child-quest-detail', params: { questId: q.id }, query: viewOnly ? { view: '1' } : {} })
}

function goBack() {
  router.back()
}

function onTabSelect(key) {
  if (key === 'home')    router.push({ name: 'child-home' })
  if (key === 'my')      router.push({ name: 'child-mypage' })
  if (key === 'q')       router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'report')  router.push({ name: 'child-report' })
}
</script>

<style scoped>
.quest-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 26px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Inter', sans-serif;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  min-width: 44px;
  min-height: 44px;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #15171b;
}

/* 탭 스위처 */
.tab-switcher {
  display: flex;
  align-items: flex-start;
  border-bottom: 1.2px solid #f0f1f3;
  background: #ffffff;
  font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  padding: 12px 0 11px;
  cursor: pointer;
  position: relative;
  min-height: 43px;
}

.tab-btn-inner {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tab-btn span.tab-label {
  font-weight: 700;
  font-size: 13px;
  line-height: 20px;
  color: #b9bec5;
}

.tab-btn.active span.tab-label {
  color: #191b1e;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 1.7px;
  height: 2.5px;
  background: #ffbc00;
  border-radius: 999px;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 999px;
  background: #f0f1f3;
  color: #b9bec5;
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
}

.tab-count.active {
  background: #ffbc00;
  color: #ffffff;
}

/* 섹션 헤더 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 2px 2px;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.section-title {
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
}

.section-count {
  font-weight: 600;
  font-size: 12px;
  color: #b9bec5;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  min-width: 44px;
  min-height: 44px;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #eceef1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
}

/* 티니 코치 말풍선 */
.coach-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.coach-avatar {
  flex: 0 0 auto;
  width: 48px;
  height: 50px;
  object-fit: contain;
}

.coach-bubble {
  position: relative;
  flex: 1 1 0%;
  min-width: 0;
  background: #fff9ec;
  border: 1.4px solid #ffe6a3;
  border-radius: 4px 16px 16px 16px;
  padding: 8px 10px 10px;
  box-shadow: 0 2px 5px rgba(242, 180, 0, 0.12);
}

.coach-bubble::before,
.coach-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.coach-bubble::before {
  left: -11px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 11px 5px 0;
  border-color: transparent #ffe6a3 transparent transparent;
}

.coach-bubble::after {
  left: -8.5px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px 9px 4px 0;
  border-color: transparent #fff9ec transparent transparent;
}

.coach-name {
  display: block;
  font-weight: 800;
  font-size: 11px;
  color: #b9861a;
  margin-bottom: 2px;
}

.coach-text {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b5a2e;
  line-height: 15px;
  white-space: nowrap;
  letter-spacing: -0.3px;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
  color: #b9bec5;
  font-size: 13px;
}

/* 리스트 하단 안내 카드 */
.bottom-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  margin-top: 4px;
  padding: 26px 20px 24px;
  border: 1.4px dashed #eceef1;
  border-radius: 16px;
}

.bottom-tip-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff3d6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-tip-title {
  font-weight: 700;
  font-size: 13px;
  color: #4a4e55;
}

.bottom-tip-desc {
  margin: 0;
  font-size: 11.5px;
  color: #b9bec5;
  line-height: 17px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-move-move {
  transition: transform 0.45s ease;
}

/* 리스트 아이템 */
.quest-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1.3px solid transparent;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.quest-row.liked {
  border-color: #ffe08a;
}

.quest-row.static { cursor: default; }

.quest-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.quest-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quest-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 메달 아이콘과 제목 행 */
.quest-title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.medal-icon {
  flex-shrink: 0;
}

.row-amount {
  font-weight: 700;
  font-size: 13px;
  color: #15171b;
  white-space: nowrap;
}

.quest-row-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.quest-row-right-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.quest-row-title {
  flex-shrink: 1;
  min-width: 0;
  font-weight: 700;
  font-size: 15px;
  color: #15171b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quest-row-title.wrap {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  line-height: 19px;
}

.inline-badge {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 10.5px;
  background: #f2f4f6;
}

.quest-badges-row {
  display: flex;
  gap: 6px;
  margin-bottom: 2px;
}

.quest-row-meta {
  font-size: 12px;
  color: #8a9099;
  font-weight: 500;
}

.quest-row-meta .dot { margin: 0 4px; }

.status-progress  { color: #4585d6; background: #e8f0fb; }
.status-pending   { color: #d99a00; background: #fff6dd; }
.status-rejected  { color: #e5484d; background: #fbe9e9; }
.status-success   { color: #62b24a; background: #e8f4e2; }
.status-failed    { color: #b96565; background: #f4e9e9; }
.status-neutral   { color: #8a9099; background: #f2f4f6; }

.encourage   { color: #62b24a; font-weight: 600; }

/* 진행 중 카드 */
.ongoing-card {
  flex-direction: column;
  align-items: stretch;
  cursor: default;
  gap: 12px;
}

.ongoing-card-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ongoing-cta {
  width: 100%;
  border: none;
  border-radius: 12px;
  background: #ffbc00;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 13px 0;
  cursor: pointer;
  min-height: 46px;
}

.pending-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #fff6dd;
  border-radius: 10px;
  padding: 10px 12px;
}

.pending-box-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #a37700;
}

.pending-box-link {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #a37700;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  text-decoration: underline;
}

.rejected-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fbe9e9;
  border-radius: 10px;
  padding: 12px 12px 14px;
}

.rejected-box-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 12px;
  color: #e5484d;
}

.rejected-box-quote {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #8a5a5a;
  line-height: 18px;
}

.rejected-box-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.btn-view,
.btn-retry {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 10px 0;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  min-height: 40px;
}

.btn-view {
  background: #ffffff;
  color: #4a4e55;
}

.btn-retry {
  background: #ffbc00;
  color: #ffffff;
}

.star-btn {
  position: absolute;
  top: -6px;
  left: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,.16);
  cursor: pointer;
  padding: 0;
  z-index: 1;
}

.star-btn::before {
  content: '';
  position: absolute;
  inset: -9px;
}

.star {
  transition: transform 0.25s;
}

.star.on {
  animation: pop 0.35s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

.row-chevron { flex-shrink: 0; transition: transform 0.2s ease; }
.row-chevron.open { transform: rotate(90deg); }

/* 펼침 영역 */
.quest-expand {
  padding: 0 16px 16px;
  margin-top: -8px;
}

.quest-expand-content {
  margin: 8px 0 14px;
  font-size: 13px;
  line-height: 19px;
  color: #4a4e55;
}

.quest-actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  min-height: 44px;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-primary { background: #ffbc00; color: #fff; }
.btn-outline { background: #f5f6f8; color: #4a4e55; }
.btn-danger  { background: #ffe2e2; color: #e5484d; }

/* 거절 사유 패널 */
.decline-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decline-title {
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
}

.decline-reasons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.decline-reason-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f5f6f8;
  font-size: 13px;
  color: #4a4e55;
  min-height: 44px;
  box-sizing: border-box;
}

.decline-reason-item.selected {
  background: #fff1d6;
  color: #15171b;
  font-weight: 700;
}

.decline-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 64px;
  border: 1px solid #eceef1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12.5px;
  font-family: inherit;
  resize: none;
}

/* 완료 탭 날짜 그룹 */
.completed-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.completed-date {
  font-weight: 700;
  font-size: 12px;
  color: #8a9099;
  padding: 4px 2px;
}
</style>