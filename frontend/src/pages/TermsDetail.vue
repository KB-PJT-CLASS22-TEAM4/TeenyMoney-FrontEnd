<template>
  <div class="page">
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>
      <h1 class="nav-title">{{ navTitle }}</h1>
      <ParentNavActions v-if="isParent" />
      <ChildNavActions v-else />
    </header>

    <div class="content">
      <div v-if="isLoading" class="state-card">
        약관 내용을 불러오는 중입니다.
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <p>{{ errorMessage }}</p>
        <button
          class="retry-btn"
          type="button"
          @click="fetchTerm"
        >
          다시 시도
        </button>
      </div>

      <article v-else-if="term" class="term-card">
        <h2 class="term-title">{{ term.title }}</h2>
        <p v-if="termMeta" class="term-meta">{{ termMeta }}</p>
        <p class="term-content">{{ term.content || '등록된 약관 내용이 없습니다.' }}</p>
      </article>
    </div>

    <ParentBottomNav
      v-if="isParent"
      active="mypage"
    />
    <BottomTabBar
      v-else
      active="my"
      @select="onChildTabSelect"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import {
  formatEffectiveAt,
  formatTermsVersion,
  getTermByCode,
} from '@/api/terms'

const router = useRouter()
const route = useRoute()

const isParent = computed(() => route.path.startsWith('/parents'))
const term = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const navTitle = computed(() => term.value?.title || '약관 및 정책')

const termMeta = computed(() => {
  if (!term.value) {
    return ''
  }

  const parts = []
  const version = formatTermsVersion(term.value)
  const effectiveAt = formatEffectiveAt(term.value.effectiveAt)

  if (version) {
    parts.push(`v${version}`)
  }

  if (effectiveAt) {
    parts.push(`${effectiveAt} 시행`)
  }

  return parts.join(' · ')
})

const listRouteName = computed(() =>
  isParent.value ? 'parents-terms' : 'child-terms',
)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: listRouteName.value })
}

async function fetchTerm() {
  const code = route.params.code

  if (!code) {
    term.value = null
    errorMessage.value = '약관 코드가 없습니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  term.value = null

  try {
    term.value = await getTermByCode(code)
  } catch (error) {
    errorMessage.value = error.message || '약관 내용을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

function onChildTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest') router.push({ name: 'child-quest-list' })
}

watch(() => route.params.code, fetchTerm, { immediate: true })

</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  max-width: 180px;
  overflow: hidden;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateX(-50%);
}

.content {
  flex: 1;
  padding: 16px 16px 90px;
}

.state-card,
.term-card {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
}

.state-card {
  padding: 24px 16px;
  color: #4a4e55;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.state-card.error {
  color: #e5484d;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 14px;
  border: 1px solid #eceef1;
  border-radius: 8px;
  background: #ffffff;
  color: #191b1e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.term-card {
  padding: 20px 16px 24px;
}

.term-title {
  margin: 0 0 8px;
  color: #191b1e;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
}

.term-meta {
  margin: 0 0 16px;
  color: #8b9097;
  font-size: 12px;
  font-weight: 500;
}

.term-content {
  margin: 0;
  color: #4a4e55;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
