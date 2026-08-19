import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadNotificationCount } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)

  async function fetchUnreadCount(accessToken) {
    try {
      const res = await getUnreadNotificationCount(accessToken)
      unreadCount.value = res.data ?? 0
    } catch (e) {
      console.log('안읽은 알림 개수 조회 실패:', e.message)
    }
  }

  // 알림 하나를 읽음 처리했을 때 낙관적으로 1 감소
  function decrementUnread() {
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  // 전체 읽음 처리했을 때
  function resetUnread() {
    unreadCount.value = 0
  }

  return { unreadCount, fetchUnreadCount, decrementUnread, resetUnread }
})