// 마이페이지 조회 API

//자녀 마이페이지
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL
const MEMBER_URL = `${API_BASE_URL}/api/v1/members`

export async function getMyInfo() {
  const authStore = useAuthStore()

  const res = await fetch(`${MEMBER_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${authStore.accessToken}`   // ← store에서 토큰 꺼냄
    }
  })

  return res.json()
}