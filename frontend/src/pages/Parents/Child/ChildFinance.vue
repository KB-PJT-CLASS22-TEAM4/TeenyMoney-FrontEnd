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

      <div v-if="isLoading" class="state-box">불러오는 중입니다...</div>
      <div v-else-if="errorMessage" class="state-box error-text">{{ errorMessage }}</div>

      <template v-else>
        <div class="filter-row">
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

          <button
            class="origin-filter-btn"
            :class="{ active: activeOrigin !== '전체' }"
            type="button"
            :aria-label="`상품 구분 ${originButtonLabel}`"
            @click="cycleOrigin"
          >
            <img src="@/assets/icons/icon-filter.svg" alt="" class="origin-filter-icon" />
            <span>{{ originButtonLabel }}</span>
          </button>
        </div>

        <section
          v-if="showCreatedProducts && filteredCustomProducts.length"
          class="custom-section"
        >
          <p class="group-title">
            등록한 상품 {{ filteredCustomProducts.length }}
          </p>

          <div
            v-for="product in filteredCustomProducts"
            :key="product.key"
            class="product-card"
          >
            <div class="product-head">
              <div class="product-title-wrap">
                <span class="origin-badge created">등록</span>
                <p class="product-title">{{ product.title }}</p>
              </div>
              <div class="product-head-actions">
                <span class="product-rate">{{ product.rateText }}</span>
                <button
                  class="trash-btn"
                  type="button"
                  :disabled="deletingKey === product.key"
                  :aria-label="`${product.title} 삭제`"
                  @click="handleDeleteCustomProduct(product)"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10Z"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p class="custom-meta">
              {{ product.category }}
              <template v-if="product.limitText">
                · {{ product.limitText }}
              </template>
            </p>
          </div>
        </section>

        <section
          v-if="showEnrolledProducts && pendingApprovals.length"
          class="pending-section"
        >
          <p class="pending-heading">
            처리 필요
            <span class="pending-count">{{ pendingApprovals.length }}</span>
          </p>

          <div
            v-for="item in pendingApprovals"
            :key="item.enrollmentId"
            class="pending-card"
          >
            <div class="pending-top">
              <p class="pending-title">{{ item.title }}</p>
              <span class="pending-badge">승인 대기</span>
            </div>
            <p class="pending-meta">
              {{ formatPendingMeta(item) }}
            </p>
            <div class="pending-actions">
              <button
                class="detail-btn"
                type="button"
                @click="goApprovalDetail(item)"
              >
                상세보기
              </button>
              <button
                class="reject-btn"
                type="button"
                :disabled="processingKey === item.enrollmentId"
                @click="handleRejectApproval(item)"
              >
                거절
              </button>
              <button
                class="approve-btn"
                type="button"
                :disabled="processingKey === item.enrollmentId"
                @click="handleApproveApproval(item)"
              >
                {{ processingKey === item.enrollmentId ? '처리 중...' : '승인' }}
              </button>
            </div>
          </div>
        </section>

        <template v-if="showEnrolledProducts">
          <template v-for="group in groupedActiveProducts" :key="group.label">
            <p class="group-title">{{ group.label }} {{ group.items.length }}</p>

            <div
              v-for="product in group.items"
              :key="product.enrollmentId"
              class="product-card"
            >
              <div class="product-head">
                <div class="product-title-wrap">
                  <span class="origin-badge enrolled">가입</span>
                  <p class="product-title">{{ product.title }}</p>
                </div>
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
        </template>

        <section
          v-if="showEnrolledProducts && filteredCompletedApprovals.length"
          class="completed-list"
        >
          <p class="group-title">
            처리 완료 {{ filteredCompletedApprovals.length }}
          </p>

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
        </section>

        <div
          v-if="
            !hasVisibleProducts
          "
          class="empty-box"
        >
          {{ emptyCategoryMessage }}
        </div>
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
    <AlertHost :modal="alertModal" />
  </div>
</template>

<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useAlertModal } from '@/composables/useAlertModal'
import { getChildren } from '@/api/children'
import * as financialProductsApi from '@/api/financialProducts'
import {
  fetchAllChildFinancialProducts,
  fetchChildApprovalRequests,
  fetchChildCustomProducts,
} from '@/utils/financialProductMapper'
import { parseServerDate } from '@/utils/datetime'
import { CHILD_PROFILE_IMAGE } from '@/utils/profileImages'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const childId = Number(route.params.childId)

const childName = ref('자녀')
const approvalRequests = ref([])
const activeProducts = ref([])
const customProducts = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const deletingKey = ref('')
const processingKey = ref('')
const activeCategory = ref('전체')
const activeOrigin = ref('전체')

const categories = ['전체', '적금', '예금', '대출']
const origins = ['전체', '가입한 상품', '등록한 상품']

const showEnrolledProducts = computed(() => activeOrigin.value !== '등록한 상품')
const showCreatedProducts = computed(() => activeOrigin.value !== '가입한 상품')
const originButtonLabel = computed(() => {
  if (activeOrigin.value === '가입한 상품') return '가입'
  if (activeOrigin.value === '등록한 상품') return '등록'
  return '전체'
})

function cycleOrigin() {
  const currentIndex = origins.indexOf(activeOrigin.value)
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % origins.length
  activeOrigin.value = origins[nextIndex]
}

const pendingApprovals = computed(() =>
  [...approvalRequests.value.filter((item) => item.isPending)].sort((a, b) => {
    const left = parseServerDate(a.requestedAt)?.getTime() ?? 0
    const right = parseServerDate(b.requestedAt)?.getTime() ?? 0
    return right - left
  })
)

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

const filteredCustomProducts = computed(() => {
  if (activeCategory.value === '전체') {
    return customProducts.value
  }

  return customProducts.value.filter(
    (item) => item.category === activeCategory.value
  )
})

const hasVisibleProducts = computed(() => {
  const hasCreated = showCreatedProducts.value && filteredCustomProducts.value.length
  const hasEnrolled = showEnrolledProducts.value && (
    groupedActiveProducts.value.length
    || pendingApprovals.value.length
    || filteredCompletedApprovals.value.length
  )
  return Boolean(hasCreated || hasEnrolled)
})

const emptyCategoryMessage = computed(() => {
  if (activeOrigin.value === '등록한 상품') {
    return activeCategory.value === '전체'
      ? '등록한 상품이 없습니다.'
      : `등록한 ${activeCategory.value} 상품이 없습니다.`
  }

  if (activeOrigin.value === '가입한 상품') {
    if (activeCategory.value === '전체') {
      return pendingApprovals.value.length
        ? '가입 중인 상품이 없습니다.'
        : '가입한 금융 상품이 없습니다.'
    }
    return `가입한 ${activeCategory.value} 상품이 없습니다.`
  }

  if (activeCategory.value === '전체') {
    return pendingApprovals.value.length
      ? '가입 중인 상품이 없습니다.'
      : '조회할 금융 상품이 없습니다.'
  }

  return `${activeCategory.value} 상품이 없습니다.`
})

function toProductType(item) {
  const raw = String(item?.productType || item?.category || '').toUpperCase()
  if (raw.includes('LOAN') || raw.includes('대출')) return 'LOAN'
  if (raw.includes('DEPOSIT') || raw.includes('예금')) return 'DEPOSIT'
  return 'SAVING'
}

function mergeApprovalRequests(approvals, products) {
  const merged = new Map()

  approvals.forEach((item) => {
    merged.set(Number(item.enrollmentId), item)
  })

  products
    .filter((item) => item.isPending)
    .forEach((item) => {
      const key = Number(item.enrollmentId)
      if (merged.has(key)) return

      merged.set(key, {
        ...item,
        productType: toProductType(item),
        isPending: true,
        isCompleted: false,
      })
    })

  return Array.from(merged.values())
}
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
    const [approvals, products, created] = await Promise.all([
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
      fetchChildCustomProducts(
        authStore.accessToken,
        childId,
        financialProductsApi,
      ).catch(() => []),
    ])

    approvalRequests.value = mergeApprovalRequests(approvals, products)
    activeProducts.value = products.filter(
      (item) => !item.isPending && item.status !== 'REJECTED',
    )
    customProducts.value = created
  } catch (error) {
    console.error('금융 상품 조회 실패:', error)
    errorMessage.value = error.message || '금융 상품을 불러오지 못했습니다.'
    approvalRequests.value = []
    activeProducts.value = []
    customProducts.value = []
  } finally {
    isLoading.value = false
  }
}

function goApprovalDetail(item) {
  router.push({
    name: 'parents-finance-approval-detail',
    params: {
      childId,
      productType: toProductType(item),
      enrollmentId: item.enrollmentId,
    },
  })
}

async function handleApproveApproval(item) {
  if (processingKey.value) return

  const confirmed = await alertModal.showConfirm(
    `${childName.value}님의 ${item.title} 가입을 승인할까요?`
  )
  if (!confirmed) return

  processingKey.value = item.enrollmentId

  try {
    await financialProductsApi.approveFinancialProductApprovalRequest(
      authStore.accessToken,
      toProductType(item),
      item.enrollmentId,
    )
    alertModal.showAlert('가입 신청을 승인했습니다.')
    await fetchProducts()
  } catch (error) {
    alertModal.showAlert(error.message || '승인에 실패했습니다.')
  } finally {
    processingKey.value = ''
  }
}

async function handleRejectApproval(item) {
  if (processingKey.value) return

  const confirmed = await alertModal.showConfirm(
    `${childName.value}님의 ${item.title} 가입을 거절할까요?`
  )
  if (!confirmed) return

  processingKey.value = item.enrollmentId

  try {
    await financialProductsApi.rejectFinancialProductApprovalRequest(
      authStore.accessToken,
      toProductType(item),
      item.enrollmentId,
    )
    alertModal.showAlert('가입 신청을 거절했습니다.')
    await fetchProducts()
  } catch (error) {
    alertModal.showAlert(error.message || '거절에 실패했습니다.')
  } finally {
    processingKey.value = ''
  }
}

function goCreate() {
  router.push({
    path: `/parents/children/${childId}/finance/create`,
  })
}

async function handleDeleteCustomProduct(product) {
  if (deletingKey.value) return

  const confirmed = await alertModal.showConfirm(
    `"${product.title}" 상품을 삭제할까요?`
  )
  if (!confirmed) return

  deletingKey.value = product.key

  try {
    await financialProductsApi.deleteFinancialProduct(
      authStore.accessToken,
      childId,
      product.productType,
      product.productId,
    )
    customProducts.value = customProducts.value.filter(
      (item) => item.key !== product.key
    )
    alertModal.showAlert('상품을 삭제했습니다.')
  } catch (error) {
    alertModal.showAlert(error.message || '상품 삭제에 실패했습니다.')
  } finally {
    deletingKey.value = ''
  }
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
  position: relative;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
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
  background: #ffffff;

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
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.pending-section {
  margin-bottom: 18px;
}

.pending-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.pending-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ffbc00;
  color: #191b1e;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
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

.pending-card,
.completed-card {
  padding: 16px;
  margin-bottom: 14px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.pending-card {
  border: 1.5px solid #ffd86a;
  background: #fff9e8;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.16);
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
  background: #ffbc00;
  color: #191b1e;
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
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.pending-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.detail-btn,
.reject-btn,
.approve-btn {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.detail-btn:disabled,
.reject-btn:disabled,
.approve-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.detail-btn {
  border: 1px solid #e0e2e6;
  background: #ffffff;
  color: #191b1e;
}

.reject-btn {
  border: 1px solid #e0e2e6;
  background: #ffffff;
  color: #ff3b30;
}

.approve-btn {
  border: none;
  background: #ffbc00;
  color: #191b1e;
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

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 16px;
}

.filters {
  display: flex;
  gap: 8px;
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.origin-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 7px 10px;
  border: 1.3px solid #e7e9ec;
  border-radius: 999px;
  background: #ffffff;
  color: #4a4e55;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.origin-filter-btn.active {
  border-color: #ffbc00;
  background: #fff8e6;
  color: #191b1e;
}

.origin-filter-icon {
  width: 13px;
  height: 12px;
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
  white-space: nowrap;
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

.custom-section {
  margin-bottom: 18px;
}

.custom-meta {
  margin: 0;
  font-size: 12px;
  color: #8b9097;
}

.product-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.trash-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #eceef1;
  border-radius: 10px;
  background: #ffffff;
  color: #8b9097;
  cursor: pointer;
}

.trash-btn:hover {
  color: #ff3b30;
  border-color: #ffd0cd;
  background: #fff5f5;
}

.trash-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.product-card {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #ffffff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.product-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.product-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.origin-badge {
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.origin-badge.created {
  background: #eef4ff;
  color: #2e7bf0;
}

.origin-badge.enrolled {
  background: #fff6d9;
  color: #b45309;
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
  transform: scaleX(0);
  transform-origin: left center;
  animation: bar-grow 0.4s ease-out forwards;
}

@keyframes bar-grow {
  to {
    transform: scaleX(1);
  }
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
