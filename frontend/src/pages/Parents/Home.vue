<template>
  <div class="parent-home">
    <div class="scroll-area">

      <section class="hero-section">
        <header class="top-nav">
          <div class="brand">
            <img src="@/assets/logo.svg" class="brand-logo" alt="티니머니" />
            <span class="brand-title">티니머니</span>
          </div>

          <ParentNavActions />
        </header>

        <div class="hero-body">
          <div class="hero-text">
            <h2 class="hero-title">
              안녕하세요!<br />
              <span class="highlight-blue">
                {{ authStore.name ? `${authStore.name}님` : '보호자님' }}
              </span>
            </h2>
            <p class="hero-sub">티니와 함께 자녀의 금융 생활을 관리해 보세요</p>
          </div>

          <div class="hero-mascot-wrap" aria-hidden="true">
            <img :src="parentMascot" class="hero-mascot" alt="" />
            <div class="mascot-shadow"></div>
          </div>
        </div>
      </section>

      <section
        v-if="homeRequests.length"
        class="request-section"
      >
        <article
          v-for="item in homeRequests"
          :key="item.key"
          class="home-request-card"
        >
          <div class="home-request-top">
            <span
              class="home-request-badge"
              :class="item.type"
            >
              {{ item.badge }}
            </span>
            <span
              v-if="item.childName"
              class="home-request-child"
            >
              {{ item.childName }}
            </span>
            <span
              v-if="item.timeLabel"
              class="home-request-time"
            >
              {{ item.timeLabel }}
            </span>
          </div>

          <p class="home-request-title">
            {{ item.title }}
          </p>

          <p
            v-if="item.detail"
            class="home-request-detail"
          >
            {{ item.detail }}
          </p>

          <div class="home-request-actions">
            <template v-if="item.type === 'finance'">
              <button
                class="home-request-btn primary"
                type="button"
                @click="openRequestDetail(item)"
              >
                확인하기
              </button>
            </template>

            <template v-else>
              <button
                class="home-request-btn ghost"
                type="button"
                :disabled="processingKey === item.key"
                @click="handleRejectRequest(item)"
              >
                거절
              </button>
              <button
                class="home-request-btn primary"
                type="button"
                :disabled="processingKey === item.key"
                @click="handleApproveRequest(item)"
              >
                {{ processingKey === item.key ? '처리 중...' : '승인' }}
              </button>
            </template>
          </div>
        </article>
      </section>

      <section class="wallet-section" :class="{ 'after-requests': homeRequests.length }">
        <div class="wallet-card">
          <div class="wallet-main">
            <p class="wallet-label">티니머니</p>

            <div class="wallet-row">
              <img
                src="@/assets/logo.svg"
                alt="티니머니 로고"
                class="wallet-logo"
              />

              <p
                v-if="isWalletLoading"
                class="wallet-amount loading-text"
              >
                조회 중...
              </p>

              <p
                v-else-if="walletError"
                class="wallet-amount error-text"
              >
                조회 실패
              </p>

              <p
                v-else
                class="wallet-amount"
              >
                {{ wallet.balance.toLocaleString() }}원
              </p>
            </div>
          </div>

          <div class="wallet-btns">
            <button
              class="btn-pill btn-yellow"
              type="button"
              @click="router.push('/parents/charge')"
            >
              충전
            </button>

            <button
              class="btn-pill btn-gray"
              type="button"
              @click="router.push('/parents/send-allowance')"
            >
              용돈 지급
            </button>
          </div>
        </div>
      </section>

      <section class="allowance-section">
        <button
          class="allowance-card"
          type="button"
          @click="router.push('/parents/regular-allowance')"
        >
          <div class="allowance-left">
            <div class="allowance-icon-wrap">
              <img
                src="@/assets/icons/icon-clock.svg"
                alt=""
                class="clock-icon"
              />
            </div>

            <div>
              <p class="allowance-main">정기용돈 설정</p>
            </div>
          </div>

          <span class="chev">›</span>
        </button>
      </section>

      <section class="history">
        <div class="history-head">
          <span class="history-title">최근 이용내역</span>

          <button
            type="button"
            class="more-button"
            aria-label="전체 거래내역 보기"
            @click="router.push('/parents/transaction')"
          >
            <span class="chev">›</span>
          </button>
        </div>

        <div
          v-if="isWalletLoading"
          class="transaction-state"
        >
          거래내역을 불러오는 중입니다.
        </div>

        <div
          v-else-if="walletError"
          class="transaction-state error-message"
        >
          <p>{{ walletError }}</p>

          <button
            type="button"
            class="retry-button"
            @click="fetchWallet"
          >
            다시 시도
          </button>
        </div>

        <template v-else-if="recentTransactions.length > 0">
          <div
            v-for="item in recentTransactions"
            :key="item.id"
            class="tx-item"
          >
            <div class="tx-info">
              <span class="tx-date">
                {{ formatTransactionDate(item.createdAt) }}
              </span>
              <span class="tx-name">
                {{ item.description || '거래내역' }}
              </span>
              <span class="tx-balance">
                잔액 : {{ item.balanceAfter.toLocaleString() }}원
              </span>
            </div>

            <span
              class="tx-amount"
              :class="{
                plus: item.direction === 'CREDIT',
                minus: item.direction === 'DEBIT',
              }"
            >
              {{ getAmountText(item) }}
            </span>
          </div>
        </template>

      </section>
    </div>

    <ParentBottomNav active="home" />
    <AlertHost :modal="alertModal" />

    <div
      v-if="rejectTarget"
      class="reject-overlay"
      @click.self="closeRejectModal"
    >
      <div class="reject-sheet">
        <p class="reject-title">인증 거절 사유</p>
        <p
          v-if="rejectTarget?.childName"
          class="reject-desc"
        >
          {{ rejectTarget.childName }}에게 전달할 거절 사유를 입력해주세요.
        </p>
        <textarea
          v-model="rejectReason"
          class="reject-input"
          maxlength="200"
          placeholder="거절 사유를 입력해 주세요"
        />
        <div class="home-request-actions">
          <button
            class="home-request-btn ghost"
            type="button"
            @click="closeRejectModal"
          >
            취소
          </button>
          <button
            class="home-request-btn primary"
            type="button"
            :disabled="processingKey === rejectTarget.key"
            @click="submitQuestReject"
          >
            거절하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useAlertModal } from '@/composables/useAlertModal'

import {
  computed,
  onActivated,
  onMounted,
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyWallet } from '@/api/wallet'
import { getChildren } from '@/api/children'
import {
  getPermissions,
  approvePermission,
  rejectPermission,
} from '@/api/permissions'
import {
  getQuests,
  getQuestDetail,
  approveQuestVerification,
  rejectQuestVerification,
} from '@/api/quest'
import * as financialProductsApi from '@/api/financialProducts'
import {
  extractApprovalRequestList,
  normalizeApprovalRequest,
} from '@/utils/financialProductMapper'
import {
  PARENT_PROFILE_IMAGE,
} from '@/utils/profileImages'

const router = useRouter()
const authStore = useAuthStore()
const alertModal = useAlertModal()

const parentMascot = PARENT_PROFILE_IMAGE

const isWalletLoading = ref(false)
const walletError = ref('')

const wallet = reactive({
  walletId: null,
  balance: 0,
  updatedAt: '',
})

const recentTransactions = ref([])

const pendingPermissions = ref([])
const pendingQuests = ref([])
const pendingFinances = ref([])
const processingKey = ref('')
const rejectTarget = ref(null)
const rejectReason = ref('')

function extractPermissionsList(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.permissions)) return payload.permissions
  if (Array.isArray(payload.items)) return payload.items
  if (payload.isExist && payload.permission) return [payload.permission]
  if (payload.permission) return [payload.permission]
  return []
}

function getPermissionId(permission) {
  return permission?.id ?? permission?.permissionId ?? null
}

function getPermissionChildId(permission) {
  return permission?.childId
    ?? permission?.child?.childId
    ?? permission?.child?.id
    ?? null
}

function getCategoryLabel(category) {
  if (typeof category === 'string') return category
  if (typeof category === 'number') return String(category)

  return category?.category
    ?? category?.categoryName
    ?? category?.merchantCategoryName
    ?? category?.name
    ?? ''
}

function extractCategories(permission) {
  if (typeof permission?.category === 'string' && permission.category) {
    return [permission.category]
  }

  if (!Array.isArray(permission?.categories)) {
    const single = getCategoryLabel(permission?.category)
    return single ? [single] : []
  }

  return permission.categories.map(getCategoryLabel).filter(Boolean)
}

function parseCreatedAt(createdAt) {
  if (!createdAt) return null

  if (Array.isArray(createdAt)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt
    return new Date(year, month - 1, day, hour, minute, second)
  }

  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRelativeTime(createdAt) {
  const date = parseCreatedAt(createdAt)
  if (!date) return ''

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60)

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffMinutes / 1440)
  return `${diffDays}일 전`
}

function formatFinanceMeta(item) {
  const parts = []

  if (item.requestedAmount) {
    parts.push(`${Number(item.requestedAmount).toLocaleString()}원`)
  } else if (item.monthlyAmount) {
    parts.push(`월 ${Number(item.monthlyAmount).toLocaleString()}원`)
  }

  if (item.termMonths) {
    parts.push(`${item.termMonths}개월`)
  }

  if (item.rateText && item.rateText !== '-') {
    parts.push(item.rateText)
  }

  return parts.join(' · ')
}

const homeRequests = computed(() => {
  const permissions = pendingPermissions.value.map((permission) => {
    const categories = extractCategories(permission)
    const categoryTitle = permission.category || categories.join(', ')

    return {
      type: 'permission',
      key: `permission-${getPermissionId(permission)}-${categoryTitle}`,
      badge: '요청',
      childName: permission.child?.name || permission.childName || '',
      childId: getPermissionChildId(permission),
      title: categoryTitle || '오늘만 허용 요청',
      detail: permission.reason || '',
      timeLabel: formatRelativeTime(permission.createdAt),
      id: getPermissionId(permission),
    }
  })

  const quests = pendingQuests.value.map((quest) => ({
    type: 'quest',
    key: `quest-${quest.questId}`,
    badge: '인증 대기',
    childName: quest.child?.name || '',
    title: quest.title || '퀘스트 인증 요청',
    detail: quest.rewardAmount != null
      ? `보상 ${Number(quest.rewardAmount).toLocaleString()}원`
      : '',
    timeLabel: formatRelativeTime(
      quest.submittedAt || quest.updatedAt || quest.createdAt
    ),
    questId: quest.questId,
  }))

  const finances = pendingFinances.value.map((item) => ({
    type: 'finance',
    key: `finance-${item.enrollmentId}`,
    badge: '승인 대기',
    childName: item.childName || '',
    childId: item.childId,
    title: item.title || '금융상품 가입 신청',
    detail: formatFinanceMeta(item),
    timeLabel: formatRelativeTime(item.requestedAt),
    productType: item.productType,
    enrollmentId: item.enrollmentId,
  }))

  return [...permissions, ...quests, ...finances]
})

async function fetchPendingRequests() {
  if (!authStore.accessToken) return

  try {
    const childrenRes = await getChildren(authStore.accessToken).catch(() => null)
    const children = Array.isArray(childrenRes?.data) ? childrenRes.data : []

    const [permRes, questRes, financeRes] = await Promise.allSettled([
      children.length
        ? Promise.allSettled(
            children.map((child) =>
              getPermissions(authStore.accessToken, child.childId)
            )
          )
        : getPermissions(authStore.accessToken).then((res) => [
            { status: 'fulfilled', value: res },
          ]),
      getQuests(authStore.accessToken, 'ONGOING'),
      financialProductsApi.getFinancialProductApprovalRequests(
        authStore.accessToken
      ),
    ])

    let permissions = []

    if (permRes.status === 'fulfilled' && Array.isArray(permRes.value)) {
      permissions = permRes.value.flatMap((result, index) => {
        if (result.status !== 'fulfilled') return []
        return extractPermissionsList(result.value.data).map((permission) => ({
          ...permission,
          childName:
            permission.child?.name
            || permission.childName
            || children[index]?.name,
          childId:
            getPermissionChildId(permission)
            || children[index]?.childId,
        }))
      })
    } else if (permRes.status === 'fulfilled') {
      permissions = extractPermissionsList(permRes.value.data)
    }

    pendingPermissions.value = permissions.filter((permission) => {
      const status = permission.status || 'PENDING'
      return status === 'PENDING' && getPermissionId(permission) != null
    })

    const questItems =
      questRes.status === 'fulfilled' && Array.isArray(questRes.value.data?.items)
        ? questRes.value.data.items
        : []

    pendingQuests.value = questItems.filter(
      (quest) => quest.status === 'PENDING'
    )

    if (financeRes.status === 'fulfilled') {
      pendingFinances.value = extractApprovalRequestList(financeRes.value.data)
        .map((item) => normalizeApprovalRequest(item))
        .filter((item) => item.isPending)
        .map((item) => {
          const matched = children.find(
            (child) => Number(child.childId) === Number(item.childId)
          )
          return {
            ...item,
            childName: item.childName && item.childName !== '자녀'
              ? item.childName
              : (matched?.name || item.childName),
          }
        })
    } else {
      pendingFinances.value = []
    }
  } catch (error) {
    console.error('홈 요청 조회 실패:', error)
  }
}

async function findVerificationId(questId) {
  const res = await getQuestDetail(questId, authStore.accessToken)
  const verificationId = res.data?.latestVerification?.verificationId
  if (verificationId == null) {
    throw new Error('인증 요청 정보를 찾을 수 없습니다.')
  }
  return verificationId
}

async function openRequestDetail(item) {
  if (item.type === 'permission' && item.childId) {
    router.push({
      name: 'parents-harmful-category',
      query: { childId: item.childId },
    })
    return
  }

  if (item.type === 'quest') {
    try {
      const verificationId = await findVerificationId(item.questId)
      router.push({
        name: 'ParentQuestApproval',
        params: {
          questId: item.questId,
          verificationId,
        },
      })
    } catch (error) {
      alertModal.showAlert(error.message || '인증 요청을 열 수 없습니다.')
    }
    return
  }

  if (item.type === 'finance' && item.childId && item.enrollmentId) {
    router.push({
      name: 'parents-finance-approval-detail',
      params: {
        childId: item.childId,
        productType: item.productType || 'SAVING',
        enrollmentId: item.enrollmentId,
      },
    })
  }
}

async function handleApproveRequest(item) {
  if (processingKey.value) return

  if (item.type === 'quest') {
    const confirmed = await alertModal.showConfirm(
      `"${item.title}" 인증을 승인하시겠습니까?`
    )
    if (!confirmed) return
  }

  processingKey.value = item.key

  try {
    if (item.type === 'permission') {
      await approvePermission(authStore.accessToken, item.id)
      pendingPermissions.value = pendingPermissions.value.filter(
        (permission) => getPermissionId(permission) !== item.id
      )
    } else {
      const verificationId = await findVerificationId(item.questId)
      await approveQuestVerification(
        item.questId,
        verificationId,
        authStore.accessToken
      )
      pendingQuests.value = pendingQuests.value.filter(
        (quest) => quest.questId !== item.questId
      )
    }
  } catch (error) {
    console.error('요청 승인 실패:', error)
    alertModal.showAlert(error.message || '승인에 실패했습니다.')
  } finally {
    processingKey.value = ''
  }
}

async function handleRejectRequest(item) {
  if (item.type === 'quest') {
    rejectTarget.value = item
    rejectReason.value = ''
    return
  }

  if (processingKey.value) return
  processingKey.value = item.key

  try {
    await rejectPermission(authStore.accessToken, item.id)
    pendingPermissions.value = pendingPermissions.value.filter(
      (permission) => getPermissionId(permission) !== item.id
    )
  } catch (error) {
    console.error('요청 거절 실패:', error)
    alertModal.showAlert(error.message || '거절에 실패했습니다.')
  } finally {
    processingKey.value = ''
  }
}

function closeRejectModal() {
  rejectTarget.value = null
  rejectReason.value = ''
}

async function submitQuestReject() {
  const item = rejectTarget.value
  const reason = rejectReason.value.trim()
  if (!item) return

  if (!reason) {
    alertModal.showAlert('거절 사유를 입력해 주세요.')
    return
  }

  processingKey.value = item.key

  try {
    const verificationId = await findVerificationId(item.questId)
    await rejectQuestVerification(
      item.questId,
      verificationId,
      reason,
      authStore.accessToken
    )
    pendingQuests.value = pendingQuests.value.filter(
      (quest) => quest.questId !== item.questId
    )
    closeRejectModal()
  } catch (error) {
    console.error('퀘스트 거절 실패:', error)
    alertModal.showAlert(error.message || '거절에 실패했습니다.')
  } finally {
    processingKey.value = ''
  }
}

async function fetchWallet() {
  isWalletLoading.value = true
  walletError.value = ''

  try {
    if (!authStore.accessToken) {
      walletError.value = '로그인이 필요합니다.'
      return
    }

    const res = await getMyWallet(authStore.accessToken)

    if (res.success) {
      wallet.walletId = res.data.walletId
      wallet.balance = res.data.balance ?? 0
      wallet.updatedAt = res.data.updatedAt || ''
      recentTransactions.value = res.data.recentTransactions || []
    }
  } catch (error) {
    console.error('지갑 정보 조회 실패:', error)

    if (error.status === 401) {
      authStore.handleUnauthorized('로그인이 만료되었습니다.\n다시 로그인해 주세요.')
      return
    }

    walletError.value =
      error.message || '지갑 정보를 불러오지 못했습니다.'
  } finally {
    isWalletLoading.value = false
  }
}

function getAmountText(item) {
  const amount = Math.abs(Number(item.amount || 0))

  if (item.direction === 'CREDIT') {
    return `+${amount.toLocaleString()} 원`
  }

  if (item.direction === 'DEBIT') {
    return `-${amount.toLocaleString()} 원`
  }

  return `${Number(item.amount || 0).toLocaleString()} 원`
}

function formatTransactionDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(() => {
  fetchWallet()
  fetchPendingRequests()
})

onActivated(() => {
  fetchPendingRequests()
})
</script>


<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.parent-home {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
  color: #191b1e;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
  scrollbar-width: none;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 36px 18px 28px;
  background: linear-gradient(180deg, #eef7ff 0%, #fffbe8 100%);
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
}

.hero-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.hero-text {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
}

.hero-mascot-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 118px;
  height: 118px;
  overflow: hidden;
  pointer-events: none;
}

.hero-mascot {
  width: 100%;
  height: 100%;
  max-width: 118px;
  max-height: 118px;
  object-fit: contain;
  object-position: bottom center;
}

.mascot-shadow {
  width: 72px;
  height: 8px;
  margin-top: -10px;
  border-radius: 50%;
  background: rgba(220, 190, 80, 0.28);
  filter: blur(4px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-logo {
  width: 26px;
  height: 26px;
}

.brand-title {
  font-size: 17px;
  font-weight: 900;
  color: #1c1e22;
}

.bell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bell-icon {
  width: 22px;
  height: 22px;
}

.hero-title {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  color: #191b1e;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}

.highlight-blue {
  color: #2563eb;
}

.hero-sub {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #71717a;
}

.wallet-section {
  position: relative;
  z-index: 2;
  margin-top: -10px;
  padding: 0 18px;
}

.wallet-section.after-requests {
  margin-top: 0;
}

.request-section {
  position: relative;
  z-index: 3;
  margin-top: -10px;
  padding: 0 18px 14px;
}

.request-section-title {
  margin: 0 0 10px 4px;
  font-size: 13px;
  font-weight: 800;
  color: #334155;
}

.home-request-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  margin-bottom: 10px;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.home-request-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-request-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.home-request-badge.permission {
  background: #ffe5e5;
  color: #ff3b30;
}

.home-request-badge.quest {
  background: #fff3e0;
  color: #ff9500;
}

.home-request-badge.finance {
  background: #e8f0fb;
  color: #2563eb;
}

.home-request-child {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.home-request-time {
  margin-left: auto;
  font-size: 12px;
  color: #8b9097;
}

.home-request-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.home-request-detail {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #8b9097;
}

.home-request-actions {
  display: flex;
  gap: 8px;
}

.home-request-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.home-request-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.home-request-btn.ghost {
  background: #f4f5f7;
  color: #191b1e;
}

.home-request-btn.primary {
  background: #ffbc00;
  color: #191b1e;
}

.reject-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.reject-sheet {
  width: 360px;
  padding: 20px 18px 24px;
  border-radius: 20px 20px 0 0;
  background: #ffffff;
}

.reject-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 800;
}

.reject-desc {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
}

.reject-input {
  width: 100%;
  min-height: 88px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #eceef1;
  border-radius: 12px;
  resize: none;
  font: inherit;
  font-size: 13px;
  box-sizing: border-box;
}

.wallet-card {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.wallet-main {
  min-width: 0;
}

.wallet-label {
  margin: 0 0 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #71717a;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.wallet-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.wallet-amount {
  margin: 0;
  min-width: 0;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-text {
  font-size: 14px;
  font-weight: 700;
  color: #8b9097;
}

.error-text {
  font-size: 14px;
  font-weight: 700;
  color: #d14343;
}

.wallet-btns {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
}

.btn-pill {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-yellow {
  background: #facc15;
  color: #18181b;
}

.btn-gray {
  background: #f4f4f5;
  color: #27272a;
}

.allowance-section {
  padding: 16px 18px 0;
}

.allowance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.allowance-left {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.allowance-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #fff8e6;
}

.clock-icon {
  width: 22px;
  height: 22px;
}

.allowance-main {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.chev {
  font-size: 18px;
  color: #a1a1aa;
}

.history {
  margin: 12px 18px 16px;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tx-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.tx-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tx-date {
  font-size: 10px;
  font-weight: 600;
  color: #8b9097;
}

.tx-name {
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
}

.tx-balance {
  font-size: 10px;
  font-weight: 600;
  color: #8b9097;
}

.tx-amount {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 800;
  color: #191b1e;
  white-space: nowrap;
}

.tx-amount.plus {
  color: #3178c6;
}

.tx-amount.minus {
  color: #ef4444;
}

.transaction-state {
  padding: 28px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #8b9097;
  text-align: center;
}

.error-message {
  color: #d14343;
}

.error-message p {
  margin: 0;
}

.retry-button {
  margin-top: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: #facc15;
  color: #191b1e;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
</style>
