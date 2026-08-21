import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './styles/global.css'
import {
  setupAuthRouterGuard,
  setupFetchAuthInterceptor,
} from './utils/setupFetchAuthInterceptor'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

setupFetchAuthInterceptor()
setupAuthRouterGuard(router)

app.mount('#app')

// PWA 설치용 서비스워커 (FCM 워커와 scope가 겹치지 않도록 분리)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
