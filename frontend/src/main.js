import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
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
