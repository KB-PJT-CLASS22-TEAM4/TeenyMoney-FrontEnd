<template>
  <div class="quest-screen">
    <ChildPageNav title="퀘스트" @back="goBack" />

    <!-- 탭 스위처 — 상단 네비와 이어지는 흰 영역 -->
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

    <div class="scroll">

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

        <div v-if="filteredAvailable.length === 0" class="empty-state">
          <p>지금은 받을 수 있는 퀘스트가 없어요</p>
        </div>

        <TransitionGroup v-else name="card-move" tag="div" class="quest-list">
          <div
            v-for="(q, i) in filteredAvailable"
            :key="q.id"
            class="quest-card"
            :class="{ liked: q.favorited, expanded: expandedId === q.id }"
          >
            <div class="quest-row" @click="toggleExpand(q.id)">
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

            <div class="quest-expand-wrap" :class="{ open: expandedId === q.id }">
              <div class="quest-expand" @click.stop>
                <div class="quest-expand-inner">
                <div v-if="q.content" class="quest-parent-note">
                  <span class="quest-parent-label">부모님이 작성한 내용</span>
                  <p class="quest-expand-content">{{ q.content }}</p>
                </div>

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
              </div>
            </div>
          </div>
        </TransitionGroup>
      </template>

      <!-- 진행 중 -->
      <template v-else-if="activeTab === 'ongoing'">
        <div v-if="ongoingQuests.length === 0" class="empty-state">
          <p>진행 중인 퀘스트가 없어요</p>
        </div>

        <div v-for="group in ongoingGroups" :key="group.status" class="completed-group">
          <span class="completed-date">{{ group.label }} {{ group.items.length }}</span>

          <div v-for="q in group.items" :key="q.id" class="quest-row ongoing-card">
            <div class="ongoing-card-top">
              <div class="quest-icon" :style="{ background: statusIconColor(ongoingBadge(effectiveStatus(q)).class).bg }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect x="6" y="4" width="12" height="16" rx="2" :stroke="statusIconColor(ongoingBadge(effectiveStatus(q)).class).stroke" stroke-width="1.6"/>
                  <rect x="9" y="2.5" width="6" height="3" rx="1" :stroke="statusIconColor(ongoingBadge(effectiveStatus(q)).class).stroke" stroke-width="1.6" fill="#fff"/>
                  <line x1="9" y1="10.5" x2="15" y2="10.5" :stroke="statusIconColor(ongoingBadge(effectiveStatus(q)).class).stroke" stroke-width="1.6"/>
                  <line x1="9" y1="14" x2="15" y2="14" :stroke="statusIconColor(ongoingBadge(effectiveStatus(q)).class).stroke" stroke-width="1.6"/>
                </svg>
              </div>
              <div class="quest-row-body">
                <div class="quest-badges-row">
                  <span class="inline-badge" :class="ongoingBadge(effectiveStatus(q)).class">
                    {{ ongoingBadge(effectiveStatus(q)).label }}
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

            <!-- 진행중(거절 이력 없음): 인증하기 버튼 -->
            <button v-if="effectiveStatus(q) === 'IN_PROGRESS'" class="ongoing-cta" @click="goVerify(q)">
              퀘스트 인증하기
            </button>

            <!-- 승인 대기: 안내 + 인증 보기 링크 -->
            <div v-else-if="effectiveStatus(q) === 'PENDING'" class="pending-box">
              <span class="pending-box-text">
                부모님 확인을 기다리는 중이에요
              </span>
              <button class="pending-box-link" @click="goVerify(q, true)">인증 보기</button>
            </div>

            <!-- 반려됨(거절 이력 있음): 사유 + 재시도 -->
            <div v-else class="rejected-box">
              <div class="rejected-box-header">
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

          <div v-for="q in group.items" :key="q.id" class="quest-row static">
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

    <BottomTabBar active="quest" @select="onTabSelect" />

    <!-- 탭 상태에 따라 안내 문구 분기 -->
    <Chatbot :hide-for-modal="showAcceptModal || showDeclineModal" :hint-text="currentHintText" />

    <!-- 퀘스트 수락 완료 모달 -->
    <div v-if="showAcceptModal" class="custom-modal-backdrop" @click.self="closeAcceptModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4 class="modal-title">퀘스트를 수락했어요!</h4>
        <p class="modal-desc">
          <strong>{{ acceptedQuestTitle }}</strong> 퀘스트를 시작했어요.<br/>
          진행 중 목록에서 인증하고 보상을 받아보세요!
        </p>
        <div class="modal-btn-row">
          <button type="button" class="btn-modal-sub" @click="closeAcceptModal">
            닫기
          </button>
          <button type="button" class="btn-modal-main" @click="goToOngoingTabFromModal">
            진행 중 목록으로 이동
          </button>
        </div>
      </div>
    </div>

    <!-- 퀘스트 거절 완료 모달 -->
    <div v-if="showDeclineModal" class="custom-modal-backdrop" @click.self="closeDeclineModal">
      <div class="custom-modal-dialog">
        <div class="modal-icon-wrap danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
        <h4 class="modal-title">퀘스트를 거절했어요</h4>
        <p class="modal-desc">
          <strong>{{ declinedQuestTitle }}</strong> 퀘스트를 거절했습니다.<br/>
          부모님께 거절 사유가 전달되었어요.
        </p>
        <button type="button" class="btn-modal-danger-confirm" @click="closeDeclineModal">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import Chatbot from '@/components/Child/Chatbot.vue'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'
import { useAuthStore } from '@/stores/auth'
import { useQuestStore } from '@/stores/quest'
import { useSseStore } from '@/stores/sse'
import { useRefreshOnVisible } from '@/composables/useRefreshOnVisible'
import { useServerEvents } from '@/composables/useServerEvents'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const questStore = useQuestStore()
const sseStore = useSseStore()

const tabs = [
  { key: 'available', label: '시작 가능' },
  { key: 'ongoing',   label: '진행 중' },
  { key: 'completed', label: '완료' },
]

function resolveQuestTab(raw) {
  const value = String(raw || '').trim().toLowerCase()

  if (value === 'ongoing' || value === '진행중' || value === '진행 중') {
    return 'ongoing'
  }

  if (value === 'completed' || value === '완료') {
    return 'completed'
  }

  if (value === 'available' || value === '시작가능' || value === '시작 가능') {
    return 'available'
  }

  return null
}

const activeTab = ref(resolveQuestTab(route.query.tab) || 'available')

// 탭별 챗봇 말풍선 안내 문구
const currentHintText = computed(() => {
  if (activeTab.value === 'ongoing') {
    return '요청을 보내면 취소나 수정이 어려워요! 퀘스트 인증하기는 신중하게 보내야해요'
  }
  return '메달이 있는 퀘스트를 완료하면 티니점수가 올라가요!'
})

// 스토어 상태를 그대로 참조
const availableQuests = computed(() => questStore.availableQuests)
const ongoingQuests = computed(() => questStore.ongoingQuests)
const completedQuests = computed(() => questStore.completedQuests)

async function loadTab(tabKey, opts = {}) {
  try {
    await questStore.ensureTab(authStore.accessToken, tabKey, opts)
  } catch (e) {
    console.error(e)
  }
}

function refreshTabs() {
  return Promise.all(tabs.map((t) => loadTab(t.key, { force: true })))
}

onMounted(refreshTabs)
watch(activeTab, (key) => loadTab(key))
watch(
  () => route.query.tab,
  (tab) => {
    const next = resolveQuestTab(tab)
    if (next) activeTab.value = next
  }
)

// 부모가 퀘스트를 만들거나 심사하면 이 목록이 낡는다.
//
// force가 필요한 이유: ensureTab은 이미 불러온 탭을 다시 부르지 않는다. 그게 이 화면의
// 기본 동작(탭 전환 시 재요청 안 함)이라 맞지만, 서버가 바뀌었다고 알려온 경우엔 캐시가
// 바로 그 낡은 값이다.
//
// QUEST로 좁히는 이유: 탭이 셋이라 신호 하나에 조회가 세 번 나간다. 홈 화면처럼 한 번에
// 묶인 load()와 달리 빗나간 이벤트의 비용이 세 배다.
useRefreshOnVisible(refreshTabs)
useServerEvents(refreshTabs, ['QUEST'])
watch(
  () => sseStore.connected,
  (connected, wasConnected) => {
    if (connected && wasConnected === false) refreshTabs()
  }
)

function toggleFavorite(q) {
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

function effectiveStatus(q) {
  if (q.subStatus === 'IN_PROGRESS' && q.lastRejectionReason) return 'REJECTED'
  return q.subStatus
}

const ONGOING_ORDER = ['IN_PROGRESS', 'PENDING', 'REJECTED']
const ongoingGroups = computed(() => {
  return ONGOING_ORDER
    .map(status => ({
      status,
      label: ongoingBadge(status).groupLabel,
      items: ongoingQuests.value.filter(q => effectiveStatus(q) === status),
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

// 수락/거절 결과 모달 상태
const showAcceptModal = ref(false)
const acceptedQuestTitle = ref('')
const showDeclineModal = ref(false)
const declinedQuestTitle = ref('')

async function acceptQuest(q) {
  try {
    await questStore.accept(authStore.accessToken, q.id)
    expandedId.value = null
    loadTab('ongoing')
    acceptedQuestTitle.value = q.title || '퀘스트'
    showAcceptModal.value = true
  } catch (e) {
    alert(e.message)
  }
}

async function confirmDecline(q) {
  try {
    const title = q.title || '퀘스트'
    await questStore.decline(authStore.accessToken, q.id, declineReasonCode.value, declineDetail.value)
    cancelDecline()
    expandedId.value = null
    loadTab('completed')
    declinedQuestTitle.value = title
    showDeclineModal.value = true
  } catch (e) {
    alert(e.message)
  }
}

function closeAcceptModal() {
  showAcceptModal.value = false
}

function goToOngoingTabFromModal() {
  showAcceptModal.value = false
  activeTab.value = 'ongoing'
}

function closeDeclineModal() {
  showDeclineModal.value = false
}

function goVerify(q, viewOnly = false) {
  router.push({
    name: 'child-quest-detail',
    params: { questId: q.id },
    query: {
      ...(viewOnly ? { view: '1' } : {}),
      fromTab: activeTab.value,
    },
  })
}

// 머니 리포트의 습관 카드를 눌러 들어온 경우(from=report)는 브라우저 히스토리
// 상태와 무관하게 무조건 리포트로 돌아가고, 그 외에는 기존처럼 브라우저 히스토리를 따라간다.
function goBack() {
  if (route.query.from === 'report') {
    router.push({ name: 'child-report' })
    return
  }
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
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
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

/* 상단 네비 — 화면 좌우 끝까지 꽉 차게 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 26px 16px 8px;
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

/* 탭 스위처 — 상단 네비에 이어붙는 흰 영역 */
.tab-switcher {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  border-bottom: 1.2px solid #f0f1f3;
  background: #ffffff;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
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
  color: #8b9097;
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
  color: #8b9097;
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
  color: #8b9097;
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

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
  color: #8b9097;
  font-size: 13px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.quest-row.static { cursor: default; }

/* 받을 수 있는 퀘스트 카드 — quest-row + quest-expand를 하나의 카드로 감싸서
   펼쳤을 때 버튼 영역이 카드 위에 이어지는 느낌을 준다 */
.quest-card {
  background: #fff;
  border: 1.3px solid transparent;
  border-radius: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.quest-card.liked {
  border-color: #ffe08a;
}

.quest-card .quest-row {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

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
  color: #6a6f76;
  font-weight: 500;
}

.quest-row-meta .dot { margin: 0 4px; }

.status-progress  { color: #4585d6; background: #e8f0fb; }
.status-pending   { color: #d99a00; background: #fff6dd; }
.status-rejected  { color: #e5484d; background: #fbe9e9; }
.status-success   { color: #62b24a; background: #e8f4e2; }
.status-failed    { color: #b96565; background: #f4e9e9; }
.status-neutral   { color: #6a6f76; background: #f2f4f6; }

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
  background: #e5484d;
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

/* 모달창 스타일 */
.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.custom-modal-dialog {
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px 20px;
  text-align: center;
  box-sizing: border-box;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-icon-wrap {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #ffbc00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-wrap.success {
  background: #ffbc00;
}

.modal-icon-wrap.danger {
  background: #ef4444;
}

.modal-icon-wrap.neutral {
  background: #64748b;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 800;
  color: #15171b;
}

.modal-desc {
  margin: 0 0 20px;
  font-size: 13.5px;
  color: #4d596b;
  line-height: 1.5;
  word-break: keep-all;
}

.modal-desc strong {
  color: #0f172a;
}

.modal-btn-row {
  display: flex;
  gap: 8px;
}

.btn-modal-sub {
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  background: #f1f5f9;
  color: #4d596b;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-modal-sub:hover {
  background: #e2e8f0;
}

.btn-modal-main {
  flex: 1.6;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.25);
  transition: transform 0.1s ease;
}

.btn-modal-main:active {
  transform: scale(0.98);
}

.btn-modal-confirm {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #ffbc00;
  color: #15171b;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.25);
}

.btn-modal-danger-confirm {
  width: 100%;
  padding: 12px 0;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-modal-danger-confirm:hover {
  background: #fecaca;
}

.btn-modal-danger-confirm:active {
  transform: scale(0.98);
}

@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 펼침 영역 */
/* 펼침/접힘을 높이 트랜지션 하나로 처리해서 글자와 카드가 동시에 움직이게 한다 */
.quest-expand-wrap {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.22s ease, opacity 0.18s ease;
}

.quest-expand-wrap.open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.quest-expand-wrap > .quest-expand {
  min-height: 0;
  overflow: hidden;
}

.quest-expand-inner {
  padding: 0 16px 16px;
}

.quest-parent-note {
  margin: 8px 0 14px;
}

.quest-parent-label {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 800;
  color: #8a9099;
}

.quest-expand-content {
  margin: 0;
  font-size: 13px;
  line-height: 19px;
  color: #4a4e55;
  word-break: keep-all;
  overflow-wrap: break-word;
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
  font-weight: 600;
  color: #1e2124;
  min-height: 44px;
  box-sizing: border-box;
}

.decline-reason-item.selected {
  background: #fbe9e9;
  color: #e5484d;
  font-weight: 700;
}

.decline-reason-item input[type="radio"] {
  accent-color: #e5484d;
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
  color: #6a6f76;
  padding: 4px 2px;
}
</style>
