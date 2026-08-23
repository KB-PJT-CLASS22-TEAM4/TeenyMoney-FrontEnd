<template>
  <div class="verify-screen">
    <ChildPageNav :title="isViewOnly ? '제출한 인증' : '퀘스트 인증하기'" @back="goBack" />

    <div class="scroll">

      <!-- 퀘스트 요약 카드 -->
      <div class="card summary-card">
        <div class="summary-head">
          <div class="summary-icon" :style="{ background: iconColor.bg }">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect x="6" y="4" width="12" height="16" rx="2" :stroke="iconColor.stroke" stroke-width="1.6"/>
              <rect x="9" y="2.5" width="6" height="3" rx="1" :stroke="iconColor.stroke" stroke-width="1.6" fill="#fff"/>
              <line x1="9" y1="10.5" x2="15" y2="10.5" :stroke="iconColor.stroke" stroke-width="1.6"/>
              <line x1="9" y1="14" x2="15" y2="14" :stroke="iconColor.stroke" stroke-width="1.6"/>
            </svg>
          </div>
          <div class="summary-text">
            <b class="quest-title">{{ quest.title }}</b>
            <div class="quest-meta-row">
              <span v-if="quest.score" class="badge badge-score">티니점수 +{{ quest.score }}</span>
              <span v-if="quest.subStatus !== 'PENDING'" class="badge badge-dday">D-{{ quest.dDay }}</span>
              <span v-else class="badge badge-dday">{{ quest.submittedAt }} 제출</span>
            </div>
          </div>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-rows">
          <div class="summary-row">
            <span class="summary-label">제목</span>
            <span class="summary-value">{{ quest.title }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">보상</span>
            <span class="summary-value">
              {{ quest.rewardAmount > 0 ? quest.rewardAmount.toLocaleString() + '원' : '없음' }}<template v-if="quest.rewardAmount > 0 && quest.score"> · </template><template v-if="quest.score">티니점수 +{{ quest.score }}</template>
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">인증 일시</span>
            <span class="summary-value">{{ isViewOnly ? (quest.submittedAt + ' 제출') : nowLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 부모님이 작성한 퀘스트 내용 -->
      <div class="parent-note">
        <div class="parent-avatar">
          <img
            v-if="parentProfileImage"
            :src="parentProfileImage"
            alt="부모님 프로필"
            class="parent-avatar-img"
          />
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="8.5" r="3.6" fill="#fff"/>
            <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" fill="#fff"/>
          </svg>
        </div>
        <div class="parent-bubble">
          <span class="parent-name">{{ parentName ? `${parentName}님이 남긴 내용` : '부모님이 남긴 내용' }}</span>
          <p class="parent-text">{{ quest.content }}</p>
        </div>
      </div>

      <!-- 이전 반려 안내 -->
      <div v-if="quest.lastRejectionReason" class="card reject-card">
        <span class="reject-label">인증이 반려되었습니다</span>
        <p class="reject-reason">{{ quest.lastRejectionReason }}</p>
        <span class="reject-remaining">재시도 {{ quest.remainingCount }}회 남음</span>
      </div>

      <!-- 사진 업로드 -->
      <div class="card">
        <span class="card-label">사진 {{ photoRequired ? '(필수)' : '(선택)' }}</span>

        <button v-if="!isViewOnly" type="button" class="photo-upload" :class="{ filled: photoPreview }"
                @click="openCamera">
          <img v-if="photoPreview" :src="photoPreview" class="photo-preview" alt="인증 사진 미리보기">
          <template v-else>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2"
                    stroke="#b9bec5" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="3.2" stroke="#b9bec5" stroke-width="1.8"/>
            </svg>
            <span class="photo-hint">카메라로 사진 찍기</span>
          </template>
          <span v-if="photoPreview" class="photo-retake">다시 찍기</span>
        </button>

        <div v-else class="photo-upload filled">
          <img v-if="photoPreview" :src="photoPreview" class="photo-preview" alt="제출한 인증 사진">
          <span v-else class="photo-hint">사진이 만료됐거나 없어요</span>
        </div>
      </div>

      <!-- 카메라 촬영 오버레이 -->
      <div v-if="cameraOpen" class="camera-overlay">
        <video v-show="!cameraError" ref="videoRef" class="camera-video" autoplay playsinline muted></video>
        <canvas ref="canvasRef" class="camera-canvas-hidden"></canvas>

        <div v-if="cameraError" class="camera-error">
          <span>카메라를 열 수 없어요</span>
          <p>{{ cameraError }}</p>
        </div>

        <div class="camera-controls">
          <button type="button" class="camera-close" @click="closeCamera" aria-label="닫기">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button v-if="!cameraError" type="button" class="camera-shutter" @click="capturePhoto" aria-label="촬영">
            <span class="camera-shutter-inner"></span>
          </button>
        </div>
      </div>

      <!-- 인증 글 -->
      <div class="card">
        <span class="card-label">인증 내용 {{ textRequired ? '(필수)' : '(선택)' }}</span>
        <textarea class="content-textarea" v-model="content" :disabled="isViewOnly"
                  placeholder="어떻게 수행했는지 알려주세요"></textarea>
      </div>

      <!-- 제출 버튼 또는 대기 안내 -->
      <button v-if="!isViewOnly" class="btn-submit" :disabled="!canSubmit" @click="submit">
        {{ quest.subStatus === 'REJECTED' ? '다시 인증하기' : '퀘스트 인증하기' }}
      </button>

      <!-- 안내 배너 -->
      <div v-else class="notice-banner" :class="quest.subStatus === 'REJECTED' ? 'rejected' : 'pending'">
        <div class="notice-banner-icon">
          <svg v-if="quest.subStatus === 'REJECTED'" viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M12 9v4.5M12 16.2v.1" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="8.5" stroke="#dc2626" stroke-width="1.8"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="#d97706" stroke-width="1.8"/>
            <path d="M12 7v5l3 2" stroke="#d97706" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="notice-banner-text">
          <template v-if="quest.subStatus === 'REJECTED'">
            부모님이 인증을 반려했어요! 다시 요청해보세요
          </template>
          <template v-else>
            부모님이 확인하고 있어요. 조금만 기다려주세요!
          </template>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuestStore } from '@/stores/quest'
import { getQuestDetail, submitQuestVerification } from '@/api/quest'
import { getMyParent } from '@/api/families'
import { PARENT_PROFILE_IMAGE, resolveProfileImageUrl } from '@/utils/profileImages'
import { calcKstDDay, formatKstDateTime, getKstParts, parseServerDate } from '@/utils/datetime'
import ChildPageNav from '@/components/Child/ChildPageNav.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const questStore = useQuestStore()

const parentName = ref('')
const parentProfileImage = ref('')

const isViewOnly = computed(() => route.query.view === '1')

const quest = ref({
  id: route.params.questId, title: '', content: '',
  subStatus: 'IN_PROGRESS', score: null, dDay: null, rewardAmount: 0,
  submittedAt: '', verificationRequirement: 'FREE',
  lastRejectionReason: null, remainingCount: 0,
})

const loadError = ref('')

// deadline(ISO 문자열 또는 [y,m,d,h,mi,s] 배열) → Date 객체
function parseDeadline(deadline) {
  return parseServerDate(deadline)
}

function calcDDay(deadline) {
  return calcKstDDay(deadline)
}

function formatShortDate(value) {
  const d = parseDeadline(value)
  if (!d) return ''
  const { month, day } = getKstParts(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(month)}.${pad(day)}`
}

async function loadQuest() {
  loadError.value = ''
  try {
    const result = await getQuestDetail(route.params.questId, authStore.accessToken)
    const d = result.data
    const isRejectedStatus = d.status === 'REJECTED' ||
      d.latestVerification?.status === 'REJECTED' ||
      Boolean(d.latestVerification?.rejectionReason)

    quest.value = {
      id: d.questId,
      title: d.title,
      content: d.content,
      subStatus: isRejectedStatus ? 'REJECTED' : d.status,
      score: null, // 티니점수 값은 API에 없음(teenyScoreEnabled 여부만 존재)
      dDay: calcDDay(d.deadline),
      rewardAmount: d.rewardAmount ?? 0,
      submittedAt: d.latestVerification ? formatShortDate(d.latestVerification.submittedAt) : '',
      verificationRequirement: d.verificationRequirement,
      lastRejectionReason: d.latestVerification?.rejectionReason ?? null,
      remainingCount: d.remainingCount ?? 0,
    }

    // 조회 전용(view=1)이거나 이전에 낸 인증이 있으면 그 내용을 채워서 보여줌
    // (반려된 뒤 재시도하는 화면에서는 사진을 다시 찍어야 하므로 사진은 채우지 않음)
    if (d.latestVerification) {
      content.value = d.latestVerification.content ?? ''
      if (isViewOnly.value && d.latestVerification.imageUrl && !d.latestVerification.imageExpired) {
        photoPreview.value = d.latestVerification.imageUrl
      }
    }
  } catch (e) {
    loadError.value = e.message || '퀘스트를 불러오지 못했습니다.'
    alert(loadError.value)
  }
}

async function loadParentProfile() {
  try {
    const res = await getMyParent(authStore.accessToken)
    if (res?.data) {
      parentName.value = res.data.name || ''
      parentProfileImage.value = resolveProfileImageUrl(
        res.data.profileImageUrl,
        PARENT_PROFILE_IMAGE
      )
    }
  } catch (e) {
    console.warn('부모 프로필 조회 실패:', e.message)
  }
}

onMounted(() => {
  loadQuest()
  loadParentProfile()
})

// 제출 시점 인증 일시 미리보기 (실제 저장 시각은 서버 응답 기준)
const nowLabel = formatKstDateTime(new Date())

// 상태별 아이콘 색 - QuestList.vue와 동일한 팔레트
const STATUS_ICON_COLORS = {
  IN_PROGRESS: { bg: '#e8f0fb', stroke: '#4585d6' },
  PENDING:     { bg: '#fffbeb', stroke: '#ffbc00' },
  REJECTED:    { bg: '#fbe9e9', stroke: '#e5484d' },
}
const iconColor = computed(() => STATUS_ICON_COLORS[quest.value.subStatus] ?? STATUS_ICON_COLORS.IN_PROGRESS)

const photoRequired = computed(() => quest.value.verificationRequirement === 'PHOTO_REQUIRED')
const textRequired = computed(() => quest.value.verificationRequirement === 'TEXT_REQUIRED')

const photoFile = ref(null)
const photoPreview = ref(null)
const content = ref('')

// ==== 실시간 카메라 촬영 (getUserMedia) ====
const cameraOpen = ref(false)
const cameraError = ref('')
const videoRef = ref(null)
const canvasRef = ref(null)
let mediaStream = null

async function openCamera() {
  cameraError.value = ''
  cameraOpen.value = true
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    // videoRef가 v-if 렌더링 이후에 붙으므로 다음 틱까지 대기
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  } catch (err) {
    cameraError.value = err.name === 'NotAllowedError'
      ? '카메라 권한을 허용해주세요'
      : '이 기기에서는 카메라를 사용할 수 없어요'
  }
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  cameraOpen.value = false
  cameraError.value = ''
}

function capturePhoto() {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob((blob) => {
    if (!blob) return
    // multipart 전송 시 파일명이 있는 게 서버 처리에 안전해서 File로 감쌈
    photoFile.value = new File([blob], 'verification.jpg', { type: 'image/jpeg' })
    photoPreview.value = URL.createObjectURL(blob)
    closeCamera()
  }, 'image/jpeg', 0.9)
}

const canSubmit = computed(() => {
  if (photoRequired.value && !photoFile.value) return false
  if (textRequired.value) return content.value.trim().length > 0
  return true
})

const submitting = ref(false)

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await submitQuestVerification(authStore.accessToken, quest.value.id, {
      content: content.value,
      image: photoFile.value,
    })
    questStore.invalidateTab('ongoing')
    const targetTab = route.query.fromTab || 'ongoing'
    router.push({ name: 'child-quest-list', query: { tab: targetTab } })
  } catch (e) {
    alert(e.message || '인증 제출에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  const targetTab = route.query.fromTab || 'ongoing'
  router.push({ name: 'child-quest-list', query: { tab: targetTab } })
}

// 화면을 벗어날 때 카메라 스트림이 계속 켜져있지 않도록 정리
onBeforeUnmount(() => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.verify-screen {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  background: #f8fafc;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scroll::-webkit-scrollbar { width: 3px; }
.scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }

/* 상단 네비 — 화면 좌우 끝까지 꽉 차게 */
.nav {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 26px 16px 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  min-width: 44px;
  min-height: 44px;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 17px;
  color: #15171b;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.summary-divider {
  height: 1px;
  background: #f2f4f6;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-label {
  font-weight: 600;
  font-size: 12.5px;
  color: #6a6f76;
  flex-shrink: 0;
}

.summary-value {
  font-weight: 700;
  font-size: 12.5px;
  color: #15171b;
  text-align: right;
}

.quest-title { font-weight: 700; font-size: 15px; color: #15171b; }

.quest-meta-row { display: flex; gap: 6px; flex-wrap: wrap; }

.badge {
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11px;
  white-space: nowrap;
}

.badge-reward { background: #eef2f6; color: #4a4e55; }
.badge-score  { background: #e8f0fb; color: #4585d6; }
.badge-dday   { background: #fff1d6; color: #d99a00; }

.reject-card {
  background: #fff6f6;
  box-shadow: none;
  border: 1px solid #ffdede;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reject-label { font-weight: 700; font-size: 13px; color: #e5484d; }
.reject-reason { margin: 0; font-size: 12.5px; color: #8a5a5a; line-height: 18px; }
.reject-remaining { font-size: 11.5px; font-weight: 700; color: #e5484d; }

.card-label {
  display: block;
  font-weight: 700;
  font-size: 12.5px;
  color: #6a6f76;
  margin-bottom: 10px;
}

.quest-content {
  margin: 0;
  font-size: 13px;
  line-height: 19px;
  color: #4a4e55;
}

/* 부모님이 남긴 내용 - 노트 카드 */
/* 부모님이 남긴 내용 - 아바타 + 말풍선 */
.parent-note {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.parent-avatar {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6fa3f2, #4585d6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1.5px solid #ffffff;
  box-sizing: border-box;
}

.parent-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}

.parent-bubble {
  position: relative;
  flex: 1 1 0%;
  min-width: 0;
  margin-top: 3px;
  background: #eef2fb;
  border: 1.4px solid #d3e0f7;
  border-radius: 4px 16px 16px 16px;
  padding: 10px 14px 12px;
  box-shadow: 0 2px 5px rgba(69, 133, 214, .1);
}

.parent-bubble::before,
.parent-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.parent-bubble::before {
  left: -11px;
  top: 7px;
  border-width: 0 11px 10px 0;
  border-color: transparent #d3e0f7 transparent transparent;
}

.parent-bubble::after {
  left: -8.5px;
  top: 8px;
  border-width: 0 9px 8px 0;
  border-color: transparent #eef2fb transparent transparent;
}

.parent-name {
  display: block;
  font-weight: 800;
  font-size: 11px;
  color: #4585d6;
  margin-bottom: 3px;
}

.parent-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 19px;
  color: #3d4a63;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1.5px dashed #d8dbe0;
  border-radius: 16px;
  background: #fafbfc;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  padding: 0;
  font-family: inherit;
  box-sizing: border-box;
}

.photo-upload.filled {
  border-style: solid;
  border-color: #eceef1;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-retake {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 5px 10px;
  background: rgba(0,0,0,.55);
  color: #fff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.photo-hint {
  font-size: 12.5px;
  color: #8b9097;
  font-weight: 600;
}

/* 카메라 촬영 오버레이 */
.camera-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-canvas-hidden {
  display: none;
}

.camera-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #fff;
  text-align: center;
  padding: 0 30px;
}

.camera-error span { font-weight: 700; font-size: 15px; }
.camera-error p { margin: 0; font-size: 12.5px; color: #8b9097; }

.camera-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-close {
  position: absolute;
  left: 20px;
  bottom: 4px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,.16);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.camera-shutter {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: transparent;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.camera-shutter-inner {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fff;
}

.content-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 90px;
  border: 1px solid #eceef1;
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
}

.content-textarea:disabled {
  background: #fafbfc;
  color: #6a6f76;
}

.btn-submit {
  width: 100%;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  padding: 15px 0;
  cursor: pointer;
  min-height: 48px;
  margin-top: 4px;
}

.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.notice-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  box-sizing: border-box;
  margin-top: 4px;
}

.notice-banner.pending {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.notice-banner.rejected {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.notice-banner-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-banner-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.4;
  word-break: keep-all;
}
</style>