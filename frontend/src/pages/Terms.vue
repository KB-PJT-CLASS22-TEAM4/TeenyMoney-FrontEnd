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
      <h1 class="nav-title">약관 및 정책</h1>
      <ParentNavActions v-if="isParent" />
      <ChildNavActions v-else />
    </header>

    <div class="content">
      <section class="terms-section">
        <h2 class="section-title">약관</h2>

        <div v-if="isLoading" class="state-card">
          약관을 불러오는 중입니다.
        </div>

        <div v-else-if="errorMessage" class="state-card error">
          <p>{{ errorMessage }}</p>
          <button
            class="retry-btn"
            type="button"
            @click="fetchTerms"
          >
            다시 시도
          </button>
        </div>

        <div v-else-if="terms.length === 0" class="state-card">
          등록된 약관이 없습니다.
        </div>

        <div v-else class="terms-list">
          <button
            v-for="term in terms"
            :key="term.code"
            class="terms-item"
            type="button"
            @click="openTerm(term)"
          >
            <span class="terms-text">
              <span class="terms-title">{{ term.title }}</span>
              <span
                v-if="termMeta(term)"
                class="terms-meta"
              >
                {{ termMeta(term) }}
              </span>
            </span>
            <span class="terms-chevron">›</span>
          </button>
        </div>
      </section>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'
import {
  formatEffectiveAt,
  formatTermsVersion,
  getTerms,
} from '@/api/terms'

const router = useRouter()
const route = useRoute()

const isParent = computed(() => route.path.startsWith('/parents'))
const terms = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const detailRouteName = computed(() =>
  isParent.value ? 'parents-terms-detail' : 'child-terms-detail',
)

function termMeta(term) {
  const parts = []
  const version = formatTermsVersion(term)
  const effectiveAt = formatEffectiveAt(term.effectiveAt)

  if (version) {
    parts.push(`v${version}`)
  }

  if (effectiveAt) {
    parts.push(`${effectiveAt} 시행`)
  }

  return parts.join(' · ')
}

function openTerm(term) {
  if (!term?.code) {
    return
  }

  router.push({
    name: detailRouteName.value,
    params: { code: term.code },
  })
}

async function fetchTerms() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    terms.value = await getTerms()
  } catch (error) {
    terms.value = []
    errorMessage.value = error.message || '약관 목록을 불러오지 못했습니다.'
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

onMounted(fetchTerms)
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
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

.content {
  flex: 1;
  padding: 16px 16px 90px;
}

.section-title {
  margin: 0 0 10px 4px;
  color: #8b9097;
  font-size: 14px;
  font-weight: 700;
}

.terms-list,
.state-card {
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

.terms-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 14px 16px;
  border: none;
  background: #ffffff;
  color: #191b1e;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.terms-item + .terms-item {
  border-top: 1px solid #f0f1f3;
}

.terms-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.terms-title {
  font-size: 14px;
  font-weight: 700;
}

.terms-meta {
  color: #8b9097;
  font-size: 12px;
  font-weight: 500;
}

.terms-chevron {
  flex-shrink: 0;
  color: #b9bec5;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
}
</style>
