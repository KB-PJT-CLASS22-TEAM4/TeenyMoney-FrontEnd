import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getQuests,
  getQuestDetail,
  acceptQuest as acceptQuestApi,
  declineQuest as declineQuestApi,
} from '@/api/quest'

// deadline: ISO 문자열 또는 [y, m, d, h, mi, s] 배열(Jackson LocalDateTime 직렬화 형식) 둘 다 지원
function parseDeadline(deadline) {
  if (!deadline) return null

  if (Array.isArray(deadline)) {
    const [y, m, d, h = 0, mi = 0, s = 0] = deadline
    return new Date(y, m - 1, d, h, mi, s)
  }

  let date = new Date(deadline)
  if (Number.isNaN(date.getTime()) && typeof deadline === 'string') {
    date = new Date(deadline.replace(' ', 'T'))
  }
  return Number.isNaN(date.getTime()) ? null : date
}

function calcDDay(deadline) {
  const end = parseDeadline(deadline)
  if (!end) return null
  const now = new Date()
  const diffMs = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function mapListItem(raw) {
  return {
    id: raw.questId,
    title: raw.title,
    rewardAmount: raw.rewardAmount ?? 0,
    teenyScoreTarget: !!raw.teenyScoreEnabled,
    remainingCount: raw.remainingCount ?? 0,
    subStatus: raw.status,
    resultStatus: raw.status,
    deadline: raw.deadline,
    dDay: calcDDay(raw.deadline),
    endedAt: formatDate(raw.endedAt),
    submittedAt: '', // 상세 조회로 보완
    lastRejectionReason: '', // 상세 조회로 보완 (ONGOING 탭의 IN_PROGRESS 항목은 fetchTab에서 채움)
    favorited: false, // 백엔드 미지원 - 로컬 전용 상태
    content: '', // 상세 조회로 보완
  }
}

const TAB_MAP = {
  available: 'AVAILABLE',
  ongoing: 'ONGOING',
  completed: 'COMPLETED',
}

export const useQuestStore = defineStore('quest', () => {
  const availableQuests = ref([])
  const ongoingQuests = ref([])
  const completedQuests = ref([])

  const nextCursor = ref({ AVAILABLE: null, ONGOING: null, COMPLETED: null })
  const loadedTabs = ref(new Set())

  const TARGET = {
    AVAILABLE: availableQuests,
    ONGOING: ongoingQuests,
    COMPLETED: completedQuests,
  }

  async function fetchTab(accessToken, tabKey, { childId, more = false } = {}) {
    const tab = TAB_MAP[tabKey]
    const cursor = more && nextCursor.value[tab] ? nextCursor.value[tab] : null

    // getQuests(accessToken, tab, childId, cursor) — questApi.js는 개별 인자를 순서대로 받음
    const result = await getQuests(accessToken, tab, childId ?? null, cursor)
    const items = (result.data?.items ?? []).map(mapListItem)

    // ONGOING 탭의 IN_PROGRESS 항목은 "처음 시작"인지 "거절당해서 재시도 대기"인지
    // 목록 API만으로는 구분이 안 돼서(거절 사유 필드가 없음), 상세 조회로 보완함
    if (tab === 'ONGOING') {
      const inProgressItems = items.filter((q) => q.subStatus === 'IN_PROGRESS')
      await Promise.all(
        inProgressItems.map(async (item) => {
          try {
            const detail = await getQuestDetail(item.id, accessToken)
            const latest = detail.data?.latestVerification
            if (latest?.rejectionReason) {
              item.lastRejectionReason = latest.rejectionReason
            }
          } catch (e) {
            // 상세 조회 실패해도 목록 자체는 그대로 보여줌
            console.error(e)
          }
        })
      )
    }

    const target = TARGET[tab]
    target.value = more ? [...target.value, ...items] : items
    nextCursor.value[tab] = result.data?.nextCursor ?? null
    loadedTabs.value.add(tab)

    return items
  }

  // 이미 불러온 탭이면 재요청하지 않음
  async function ensureTab(accessToken, tabKey, opts = {}) {
    const tab = TAB_MAP[tabKey]
    if (loadedTabs.value.has(tab) && !opts.force) return
    return fetchTab(accessToken, tabKey, opts)
  }

  // 목록 API에 없는 content 등을 채우기 위한 상세 조회
  // targetList는 스토어 인스턴스에서 꺼낸 배열(예: questStore.availableQuests)이라 이미 unwrap된 상태
  async function fetchDetailInto(accessToken, questId, targetList) {
    // getQuestDetail(questId, accessToken) — questApi.js는 questId가 먼저, accessToken이 나중
    const result = await getQuestDetail(questId, accessToken)
    const detail = result.data
    const item = targetList.find((q) => q.id === questId)
    if (item) {
      item.content = detail.content ?? ''
      if (detail.latestVerification) {
        item.submittedAt = formatDate(detail.latestVerification.submittedAt)?.slice(5) ?? ''
        item.lastRejectionReason = detail.latestVerification.rejectionReason ?? ''
      }
    }
    return detail
  }

  async function accept(accessToken, questId) {
    await acceptQuestApi(accessToken, questId)
    availableQuests.value = availableQuests.value.filter((q) => q.id !== questId)
    loadedTabs.value.delete('ONGOING')
  }

  async function decline(accessToken, questId, reasonCode, reasonDetail) {
    await declineQuestApi(accessToken, questId, { reasonCode, reasonDetail })
    availableQuests.value = availableQuests.value.filter((q) => q.id !== questId)
    loadedTabs.value.delete('COMPLETED')
  }

  // 다음 ensureTab 호출 때 다시 불러오도록 캐시만 지움
  function invalidateTab(tabKey) {
    loadedTabs.value.delete(TAB_MAP[tabKey])
  }

  return {
    availableQuests,
    ongoingQuests,
    completedQuests,
    fetchTab,
    ensureTab,
    fetchDetailInto,
    accept,
    decline,
    invalidateTab,
  }
})