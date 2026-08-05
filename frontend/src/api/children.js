import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// 요청마다 토큰 자동 첨부
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 연동된 자녀 목록 조회
// GET /api/v1/members/me/children
export async function getChildren() {
  const res = await api.get('/api/v1/members/me/children')
  return res.data // { code, data: [...], message, success }
}