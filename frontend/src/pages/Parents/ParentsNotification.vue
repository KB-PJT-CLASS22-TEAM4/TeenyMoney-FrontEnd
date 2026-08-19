<template>
  <div class="page">
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>

      <h1 class="nav-title">알림</h1>

      <ParentNavActions />
    </header>

    <div class="sub-bar">
      <button
        class="mark-read"
        type="button"
        :disabled="notifications.length === 0"
        @click="markAllRead"
      >
        모두 읽음
      </button>
    </div>

    <div class="scroll">
      <div v-if="isLoading && notifications.length === 0" class="state-msg">
        불러오는 중이에요...
      </div>

      <div v-else-if="loadError && notifications.length === 0" class="state-msg">
        알림을 불러오지 못했어요.
        <button type="button" class="retry-btn" @click="loadInitial">다시 시도</button>
      </div>

      <div v-else-if="!isLoading && notifications.length === 0" class="state-msg">
        아직 도착한 알림이 없어요.
      </div>

      <template v-else>
        <div v-for="group in groupedList" :key="group.date" class="group">
          <p class="date-label">{{ group.date }}</p>

          <div
            v-for="n in group.items"
            :key="n.id"
            class="noti-item"
            @click="readOne(n)"
          >
            <div class="icon-circle">
              <span v-html="n.icon"></span>
            </div>
            <div class="noti-text">
              <b class="noti-title">{{ n.title }}</b>
              <span class="noti-detail">{{ n.detail }}</span>
            </div>
            <span class="noti-time">{{ n.time }}</span>
            <span v-if="!n.read" class="unread-dot"></span>
          </div>
        </div>

        <div v-if="nextCursor" class="load-more-wrap">
          <button
            type="button"
            class="load-more-btn"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            {{ isLoadingMore ? '불러오는 중...' : '더 보기' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const ICONS = {
  PAYMENT: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 10h18" stroke="#8b9097" stroke-width="1.6"/></svg>`,
  QUEST: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#8b9097" stroke-width="1.6"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  FINANCE: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#8b9097" stroke-width="1.6"/></svg>`,
  ALLOWANCE: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="8" width="18" height="13" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 12h18M12 8v13" stroke="#8b9097" stroke-width="1.6"/><path d="M12 8s-1-4-4-4-2 4 4 4zM12 8s1-4 4-4 2 4-4 4z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  FAMILY: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="9" cy="9" r="3" stroke="#8b9097" stroke-width="1.6"/><circle cx="16" cy="14" r="3" stroke="#8b9097" stroke-width="1.6"/><path d="M11 11l3 1.5" stroke="#8b9097" stroke-width="1.6"/></svg>`,
  DEFAULT: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round"/></svg>`,
}

function getIcon(referenceType) {
  return ICONS[referenceType] || ICONS.DEFAULT
}

function goToReference(n) {
  if (n.referenceType === 'PAYMENT') {
    router.push({ name: 'parents-transaction' })
    return
  }
  if (n.referenceType === 'QUEST') {
    router.push({ name: 'parents-quest-list' })
    return
  }
  if (n.referenceType === 'FINANCE') {
    router.push({ name: 'parents-child-list' })
    return
  }
  if (n.referenceType === 'ALLOWANCE') {
    router.push({ name: 'send-allowance' })
  }
}

function parseCreatedAt(raw) {
  if (!raw) return null

  if (Array.isArray(raw)) {
    const [y, m, d, h = 0, mi = 0, s = 0] = raw
    if (y === undefined || m === undefined || d === undefined) return null
    const parsed = new Date(y, m - 1, d, h, mi, s)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function formatDateLabel(d) {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  const md = `${d.getMonth() + 1}월 ${d.getDate()}일`

  if (isSameDay(d, now)) return `오늘 · ${md}`
  if (isSameDay(d, yesterday)) return `어제 · ${md}`
  return md
}

function formatClockTime(d) {
  const hours = d.getHours()
  const period = hours < 12 ? '오전' : '오후'
  let h12 = hours % 12
  if (h12 === 0) h12 = 12
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${period} ${h12}:${mm}`
}

function formatTime(d) {
  const now = new Date()

  if (!isSameDay(d, now)) {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (isSameDay(d, yesterday)) return '어제'
    const diffDays = Math.max(1, Math.round((now - d) / 86400000))
    return `${diffDays}일 전`
  }

  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금'
  if (diffMin < 60) return `${diffMin}분 전`

  return formatClockTime(d)
}

const notifications = ref([])
const nextCursor = ref(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const loadError = ref(false)

function mapNotification(n) {
  const createdDate = parseCreatedAt(n.createdAt)
  return {
    id: n.id,
    title: n.title,
    detail: n.content,
    read: n.isRead,
    referenceType: n.referenceType,
    referenceId: n.referenceId,
    icon: getIcon(n.referenceType),
    createdDate,
    dateLabel: createdDate ? formatDateLabel(createdDate) : '',
    time: createdDate ? formatTime(createdDate) : '',
  }
}

async function loadInitial() {
  if (!authStore.accessToken) {
    authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
    return
  }

  isLoading.value = true
  loadError.value = false
  try {
    const res = await getMyNotifications(authStore.accessToken)
    notifications.value = (res.data?.notifications || []).map(mapNotification)
    nextCursor.value = res.data?.nextCursor || null
  } catch (e) {
    console.error('알림 목록 조회 실패:', e.message)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

async function loadMore() {
  if (!nextCursor.value || isLoadingMore.value) return
  isLoadingMore.value = true
  try {
    const res = await getMyNotifications(authStore.accessToken, nextCursor.value)
    const mapped = (res.data?.notifications || []).map(mapNotification)
    notifications.value = [...notifications.value, ...mapped]
    nextCursor.value = res.data?.nextCursor || null
  } catch (e) {
    console.error('알림 추가 조회 실패:', e.message)
  } finally {
    isLoadingMore.value = false
  }
}

const groupedList = computed(() => {
  const groups = {}
  const order = []
  notifications.value.forEach((n) => {
    if (!groups[n.dateLabel]) {
      groups[n.dateLabel] = []
      order.push(n.dateLabel)
    }
    groups[n.dateLabel].push(n)
  })
  return order.map((date) => ({ date, items: groups[date] }))
})

async function markAllRead() {
  if (notifications.value.length === 0) return
  const latestId = notifications.value[0].id
  const prevState = notifications.value.map((n) => n.read)

  notifications.value.forEach((n) => { n.read = true })
  notificationStore.resetUnread()

  try {
    await markAllNotificationsRead(authStore.accessToken, latestId)
  } catch (e) {
    console.error('전체 읽음 처리 실패:', e.message)
    notifications.value.forEach((n, idx) => { n.read = prevState[idx] })
    notificationStore.fetchUnreadCount(authStore.accessToken)
  }
}

async function readOne(n) {
  const wasRead = n.read
  n.read = true

  if (!wasRead) {
    try {
      await markNotificationRead(authStore.accessToken, n.id)
      notificationStore.decrementUnread()
    } catch (e) {
      console.error('알림 읽음 처리 실패:', e.message)
      n.read = wasRead
      return
    }
  }

  goToReference(n)
}

onMounted(() => {
  loadInitial()
})
</script>

<style scoped>
.page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
}

.nav {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px 0 4px;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 22px;
  height: 22px;
}

.nav-title {
  flex: 1;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #191b1e;
  text-align: center;
}

.sub-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 6px;
  flex-shrink: 0;
}

.mark-read {
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-weight: 600;
  font-size: 12.7px;
  color: #8b9097;
  cursor: pointer;
}

.mark-read:disabled {
  color: #d8dbdf;
  cursor: default;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0 0;
}

.state-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 20px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: #9aa0a8;
}

.retry-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.3px solid #e7e9ec;
  background: #ffffff;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
  cursor: pointer;
}

.group {
  padding: 6px 20px 8px;
}

.date-label {
  margin: 0 0 6px;
  font-weight: 600;
  font-size: 11.3px;
  color: #8b9097;
}

.noti-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  cursor: pointer;
}

.icon-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: #f2f4f6;
  border-radius: 50%;
  flex: none;
}

.noti-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.noti-title {
  font-weight: 700;
  font-size: 12.6px;
  letter-spacing: -0.27px;
  color: #191b1e;
}

.noti-detail {
  font-weight: 500;
  font-size: 10.7px;
  color: #b9bec5;
}

.noti-time {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
  flex: none;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background: #ff4d4f;
  border-radius: 50%;
  flex: none;
}

.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 20px 24px;
}

.load-more-btn {
  padding: 10px 24px;
  border-radius: 999px;
  border: 1.3px solid #e7e9ec;
  background: #ffffff;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  color: #4a4e55;
  cursor: pointer;
}

.load-more-btn:disabled {
  color: #b9bec5;
  cursor: not-allowed;
}
</style>
