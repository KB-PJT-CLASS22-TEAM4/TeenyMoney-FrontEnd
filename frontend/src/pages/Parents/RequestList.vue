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
      <h1 class="nav-title">요청 목록</h1>
      <ParentNavActions />
    </header>

    <div class="content">
      <div
        v-if="!requests.length"
        class="empty-state"
      >
        대기 중인 요청이 없습니다.
      </div>

      <article
        v-for="item in requests"
        :key="item.key"
        class="request-card"
        role="button"
        tabindex="0"
        @click="openRequestDetail(item)"
        @keydown.enter="openRequestDetail(item)"
      >
        <div class="request-top">
          <span
            class="request-badge"
            :class="item.type"
          >
            {{ item.badge }}
          </span>
          <span
            v-if="item.childName"
            class="request-child"
          >
            {{ item.childName }}
          </span>
          <span
            v-if="item.timeLabel"
            class="request-time"
          >
            {{ item.timeLabel }}
          </span>
        </div>

        <p class="request-title">
          {{ item.title }}
        </p>

        <p
          v-if="item.detail"
          class="request-detail"
        >
          {{ item.detail }}
        </p>

        <div class="request-actions">
          <button
            class="request-btn ghost"
            type="button"
            :disabled="processingKey === item.key"
            @click.stop="handleRejectRequest(item)"
          >
            거절
          </button>
          <button
            class="request-btn primary"
            type="button"
            :disabled="processingKey === item.key"
            @click.stop="handleApproveRequest(item)"
          >
            {{ processingKey === item.key ? '처리 중...' : '승인' }}
          </button>
        </div>

        <button
          class="detail-link"
          type="button"
          :disabled="processingKey === item.key"
          @click.stop="openRequestDetail(item)"
        >
          상세보기
        </button>
      </article>
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
        <div class="request-actions">
          <button
            class="request-btn ghost"
            type="button"
            @click="closeRejectModal"
          >
            취소
          </button>
          <button
            class="request-btn primary"
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
import { onActivated, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import AlertHost from '@/components/AlertHost.vue'
import { useParentRequests } from '@/composables/useParentRequests'

const router = useRouter()

const {
  alertModal,
  requests,
  processingKey,
  rejectTarget,
  rejectReason,
  fetchPendingRequests,
  openRequestDetail,
  handleApproveRequest,
  handleRejectRequest,
  closeRejectModal,
  submitQuestReject,
} = useParentRequests()

onMounted(() => {
  fetchPendingRequests()
})

onActivated(() => {
  fetchPendingRequests()
})
</script>

<style scoped>
.page {
  display: flex;
  width: 360px;
  min-height: 100dvh;
  flex-direction: column;
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

.empty-state {
  padding: 48px 16px;
  color: #8b9097;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.request-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  margin-bottom: 10px;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.request-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.request-badge.permission {
  background: #ffe5e5;
  color: #ff3b30;
}

.request-badge.quest,
.request-badge.finance {
  background: #fff3e0;
  color: #ff9500;
}

.request-child {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #191b1e;
}

.request-time {
  margin-left: auto;
  font-size: 12px;
  color: #8b9097;
}

.request-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191b1e;
}

.request-detail {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #8b9097;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.detail-link {
  margin: 2px 0 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #8b9097;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.detail-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.request-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.request-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.request-btn.ghost {
  background: #f4f5f7;
  color: #191b1e;
}

.request-btn.primary {
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
</style>
