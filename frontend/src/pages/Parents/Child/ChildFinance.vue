<template>
  <div class="page">
    <header class="nav">
      <button class="back-btn" type="button" aria-label="뒤로" @click="router.back()">
        <img src="@/assets/icons/icon-back.svg" alt="" class="back-icon" />
      </button>
      <h1 class="nav-title">자녀관리</h1>
      <ParentNavActions />
    </header>

    <div class="scroll-area">
      <section class="child-info-card">
        <div class="child-info-left">
          <img :src="CHILD_PROFILE_IMAGE" alt="" class="child-avatar" />
          <div>
            <p class="child-info-label">자녀 정보</p>
            <p class="child-info-name">{{ childName }}</p>
          </div>
        </div>
      </section>

      <div class="approval-tabs">
        <button
          v-for="tab in approvalTabs"
          :key="tab.value"
          class="approval-tab"
          :class="{ active: activeApprovalTab === tab.value }"
          type="button"
          @click="activeApprovalTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="isLoading" class="state-box">불러오는 중입니다...</div>
      <div v-else-if="errorMessage" class="state-box error-text">{{ errorMessage }}</div>

      <template v-else>
        <div class="filters">
          <button
            v-for="category in categories"
            :key="category"
            class="chip"
            :class="{ off: activeCategory !== category }"
            type="button"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-if="activeApprovalTab === 'pending'">

          <div
            v-for="item in filteredPendingApprovals"
            :key="item.enrollmentId"
            class="pending-card clickable"
            role="button"
            tabindex="0"
            @click="goApprovalDetail(item)"
            @keydown.enter="goApprovalDetail(item)"
          >
            <div class="pending-top">
              <p class="pending-title">{{ item.title }}</p>
              <span class="pending-badge">승인 대기</span>
            </div>
            <p class="pending-meta">
              {{ formatPendingMeta(item) }}
            </p>
          </div>
        </div>

        <div v-if="activeApprovalTab === 'completed'">
          <div
            v-if="!filteredCompletedApprovals.length"
            class="empty-box"
          >
            처리 완료된 승인 요청이 없습니다.
          </div>

          <div
            v-for="item in filteredCompletedApprovals"
            :key="`${item.enrollmentId}-${item.status}`"
            class="completed-card clickable"
            role="button"
            tabindex="0"
            @click="goApprovalDetail(item)"
            @keydown.enter="goApprovalDetail(item)"
          >
            <div class="pending-top">
              <p class="pending-title">{{ item.title }}</p>
              <span
                class="completed-badge"
                :class="item.status === 'REJECTED' ? 'rejected' : 'approved'"
              >
                {{ item.status === 'REJECTED' ? '거절' : '승인' }}
              </span>
            </div>
            <p class="pending-meta">{{ formatPendingMeta(item) }}</p>
          </div>
        </div>

        <template v-if="activeApprovalTab === 'pending'">
          <template v-for="group in groupedActiveProducts" :key="group.label">
            <p class="group-title">{{ group.label }} {{ group.items.length }}</p>

            <div
              v-for="product in group.items"
              :key="product.enrollmentId"
              class="product-card"
            >
              <div class="product-head">
                <p class="product-title">{{ product.title }}</p>
                <span class="product-rate">{{ product.rateText }}</span>
              </div>

              <p class="product-amount-label">
                누적 금액
                <strong>{{ product.accumulatedAmount.toLocaleString() }}원</strong>
              </p>

              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: product.progress + '%' }"
                ></div>
              </div>

              <div class="product-foot">
                <span>
                  {{ product.periodMonths }}개월
                  <template v-if="product.totalPayments">
                    ({{ product.paymentCount }}회납)
                  </template>
                </span>
                <span>만기 {{ product.maturityDate }}</span>
              </div>
            </div>
          </template>

          <div
            v-if="!groupedActiveProducts.length"
            class="empty-box"
          >
            {{ emptyCategoryMessage }}
          </div>
        </template>
      </template>
    </div>

    <button
      class="fab"
      type="button"
      aria-label="금융 상품 추가"
      @click="goCreate"
    >
      +
    </button>

    <ParentBottomNav active="child" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getChildren } from '@/api/children'
import * as financialProductsApi from '@/api/financialProducts'
import {
  fetchAllChildFinancialProducts,
  fetchChildApprovalRequests,
} from '@/utils/financialProductMapper'
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childId = Number(route.params.childId)

const childName = ref('자녀')
const approvalRequests = ref([])
const activeProducts = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const activeApprovalTab = ref('pending')
const activeCategory = ref('전체')

const categories = ['전체', '적금', '예금', '대출']
const approvalTabs = [
  { label: '대기중', value: 'pending' },
  { label: '처리완료', value: 'completed' },
]

const pendingApprovals = computed(() =>
  approvalRequests.value.filter((item) => item.isPending)
)

const filteredPendingApprovals = computed(() => {
  if (activeCategory.value === '전체') {
    return pendingApprovals.value
  }

  return pendingApprovals.value.filter(
    (item) => item.category === activeCategory.value
  )
})

const completedApprovals = computed(() =>
  approvalRequests.value.filter((item) => item.isCompleted)
)

const filteredCompletedApprovals = computed(() => {
  if (activeCategory.value === '전체') {
    return completedApprovals.value
  }

  return completedApprovals.value.filter(
    (item) => item.category === activeCategory.value
  )
})

const filteredActiveProducts = computed(() => {
  if (activeCategory.value === '전체') {
    return activeProducts.value
  }

  return activeProducts.value.filter(
    (item) => item.category === activeCategory.value
  )
})

const groupedActiveProducts = computed(() => {
  const groups = new Map()

  filteredActiveProducts.value.forEach((item) => {
    const label =
      item.category === '예금'
        ? '정기예금'
        : item.category

    if (!groups.has(label)) {
      groups.set(label, [])
    }

    groups.get(label).push(item)
  })

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }))
})

function formatPendingMeta(item) {
  const parts = []

  if (item.requestedAmount) {
    parts.push(`${item.requestedAmount.toLocaleString()}원`)
  } else if (item.monthlyAmount) {
    parts.push(`월 ${item.monthlyAmount.toLocaleString()}원`)
  }

  if (item.termMonths || item.periodMonths) {
    parts.push(`${item.termMonths || item.periodMonths}개월`)
  }

  if (item.rateText && item.rateText !== '-') {
    parts.push(item.rateText)
  }

  return parts.join(' | ') || item.description || '-'
}

async function fetchChildInfo() {
  const res = await getChildren(authStore.accessToken)
  const matched = res.data?.find(
    (item) => Number(item.childId) === childId
  )

  if (matched) {
    childName.value = matched.name
  }
}

async function fetchProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [approvals, products] = await Promise.all([
      fetchChildApprovalRequests(
        authStore.accessToken,
        childId,
        financialProductsApi,
      ),
      fetchAllChildFinancialProducts(
        authStore.accessToken,
        childId,
        financialProductsApi,
      ),
    ])

    approvalRequests.value = approvals
    activeProducts.value = products.filter(
      (item) => !item.isPending && item.status !== 'REJECTED',
    )
  } catch (error) {
    console.error('금융 상품 조회 실패:', error)
    errorMessage.value = error.message || '금융 상품을 불러오지 못했습니다.'
    approvalRequests.value = []
    activeProducts.value = []
  } finally {
    isLoading.value = false
  }
}

function goApprovalDetail(item) {
  router.push({
    name: 'parents-finance-approval-detail',
    params: {
      childId,
      productType: item.productType,
      enrollmentId: item.enrollmentId,
    },
  })
}

function goCreate() {
  router.push({
    path: `/parents/children/${childId}/finance/create`,
  })
}

onMounted(async () => {
  if (!authStore.accessToken) {
      authStore.openLoginModal('서비스를 이용하려면 로그인해 주세요.')
      return
    }

  await Promise.all([
    fetchChildInfo(),
    fetchProducts(),
  ])
})
</script>

<style scoped>
.page {
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
}

.back-btn {
  position: absolute;
  left: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.alarm-btn {
  position: absolute;
  right: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon,
.alarm-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191b1e;
}

.scroll-area {
  flex: 1;
  padding: 16px;
}

.child-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.child-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.child-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: contain;
  background-color: #f4f5f7;
}

.child-info-label {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8b9097;
}

.child-info-name {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #191b1e;
}

.approval-tabs {
  display: flex;
  gap: 18px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f1f3;
}

.approval-tab {
  padding: 0 0 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8b9097;
  cursor: pointer;
}

.approval-tab.active {
  color: #191b1e;
  font-weight: 800;
  border-bottom: 2px solid #ffbc00;
}

.pending-card,
.completed-card {
  padding: 16px;
  margin-bottom: 14px;
  border-radius: 16px;
  background: #f8fafc;
}

.clickable {
  cursor: pointer;
}

.clickable:active {
  opacity: 0.92;
}

.pending-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.pending-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
}

.pending-badge,
.completed-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pending-badge {
  background: #eef2f7;
  color: #8b9097;
}

.completed-badge.approved {
  background: #e8f8ee;
  color: #34c759;
}

.completed-badge.rejected {
  background: #ffe5e5;
  color: #ff3b30;
}

.pending-meta {
  margin: 0 0 12px;
  font-size: 12px;
  color: #8b9097;
}

.pending-btns {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #ffbc00;
  color: #191b1e;
}

.btn-secondary {
  background: #ffffff;
  color: #191b1e;
  border: 1px solid #e7e9ec;
}

.filters {
  display: flex;
  gap: 8px;
  margin: 0 0 16px;
}

.chip {
  padding: 7px 16px;
  border: none;
  border-radius: 999px;
  background: #ffbc00;
  color: #15171b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.chip.off {
  background: #ffffff;
  border: 1.3px solid #e7e9ec;
  color: #4a4e55;
  font-weight: 600;
}

.group-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.product-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #eef0f3;
}

.product-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.product-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #191b1e;
}

.product-rate {
  font-size: 13px;
  font-weight: 700;
  color: #2e7bf0;
}

.product-amount-label {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8b9097;
}

.product-amount-label strong {
  display: block;
  margin-top: 4px;
  font-size: 18px;
  color: #191b1e;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: #eef0f3;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #ffbc00;
}

.product-foot {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8b9097;
}

.state-box,
.empty-box {
  padding: 24px 0;
  text-align: center;
  color: #8b9097;
  font-size: 13px;
}

.error-text {
  color: #ff3b30;
}

.fab {
  position: fixed;
  right: calc(50% - 180px + 20px);
  bottom: 96px;
  z-index: 20;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #ffbc00;
  color: #191b1e;
  font-size: 30px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 188, 0, 0.35);
}
</style>
