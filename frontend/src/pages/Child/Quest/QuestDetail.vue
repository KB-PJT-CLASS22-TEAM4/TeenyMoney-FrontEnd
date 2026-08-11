<template>
  <div class="verify-screen">
    <div class="scroll">

      <!-- 상단 네비 -->
      <div class="nav">
        <button class="back-btn" @click="goBack" aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="nav-title">{{ isViewOnly ? '제출한 인증' : '퀘스트 인증하기' }}</h1>
      </div>

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
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="8.5" r="3.6" fill="#fff"/>
            <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" fill="#fff"/>
          </svg>
        </div>
        <div class="parent-bubble">
          <span class="parent-name">부모님이 남긴 내용</span>
          <p class="parent-text">{{ quest.content }}</p>
        </div>
      </div>

      <!-- 이전 반려 안내 -->
      <div v-if="quest.lastRejectionReason" class="card reject-card">
        <span class="reject-label">이전 인증이 반려됐어요</span>
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
          <span class="photo-hint">사진 예시 (조회 전용)</span>
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

      <!-- 티니 코치 (하단 제출 버튼 바로 위로 이동) -->
      <div class="coach-block">
        <svg class="coach-avatar" viewBox="0 0 40 42" width="38" height="40">
          <!-- 발 -->
          <path d="M15 38l-2.5 3M15 38l1 3.2" stroke="#f2971f" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M25 38l2.5 3M25 38l-1 3.2" stroke="#f2971f" stroke-width="1.6" stroke-linecap="round"/>
          <!-- 몸통 -->
          <ellipse cx="20" cy="27" rx="12.5" ry="10.5" fill="#ffcf3d"/>
          <!-- 날개 -->
          <ellipse cx="9.5" cy="27" rx="4" ry="6.2" fill="#f2b400" transform="rotate(-18 9.5 27)"/>
          <ellipse cx="30.5" cy="27" rx="4" ry="6.2" fill="#f2b400" transform="rotate(18 30.5 27)"/>
          <!-- 머리 -->
          <circle cx="20" cy="13" r="9.5" fill="#ffdd5c"/>
          <!-- 정수리 깃털 -->
          <path d="M18.5 3.5c-.6-1.6.4-3 1.8-3.3-.2 1.5-.7 2.6-1.8 3.3z" fill="#f2b400"/>
          <!-- 볼터치 -->
          <circle cx="13.3" cy="15" r="1.6" fill="#ffb3a7" opacity=".7"/>
          <circle cx="26.7" cy="15" r="1.6" fill="#ffb3a7" opacity=".7"/>
          <!-- 눈 -->
          <circle cx="16.3" cy="12" r="1.5" fill="#3a2b00"/>
          <circle cx="23.7" cy="12" r="1.5" fill="#3a2b00"/>
          <circle cx="16.8" cy="11.5" r=".4" fill="#fff"/>
          <circle cx="24.2" cy="11.5" r=".4" fill="#fff"/>
          <!-- 부리 -->
          <path d="M17.8 15.3h4.4c.3 0 .5.35.3.6l-2 2.3c-.25.3-.75.3-1 0l-2-2.3c-.2-.25 0-.6.3-.6z" fill="#f2971f"/>
        </svg>
        <div class="coach-bubble">
          <span class="coach-name">티니 코치</span>
          <p class="coach-text">{{ coachMessage }}</p>
        </div>
      </div>

      <!-- 제출 버튼 또는 대기 안내 -->
      <button v-if="!isViewOnly" class="btn-submit" :disabled="!canSubmit" @click="submit">
        {{ quest.subStatus === 'REJECTED' ? '다시 인증하기' : '퀘스트 인증하기' }}
      </button>

      <div v-else class="pending-note">
        <span>부모님이 확인하고 있어요. 조금만 기다려주세요!</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// ==================================================================
// API 연동 필요 (지금은 더미 데이터)
// ==================================================================

const QUEST_DB = {
  4: {
    id: 4, title: '화분 물 주기',
    content: '베란다 화분 3개를 잎에 물이 튀지 않게 화분 흙에만 뿌려주고 사진 보내줘~',
    subStatus: 'IN_PROGRESS', score: 2, dDay: 2, rewardAmount: 500,
    verificationRequirement: 'PHOTO_REQUIRED',
    lastRejectionReason: null, remainingCount: 3,
  },
  5: {
    id: 5, title: '강아지 산책시키기',
    content: '초코랑 30분 정도 동네 산책 다녀와주세요. 산책 다녀온 뒤에는 물도 꼭 챙겨주세요.',
    subStatus: 'PENDING', score: 4, dDay: 1, submittedAt: '08.09', rewardAmount: 1200,
    verificationRequirement: 'ANY_REQUIRED',
    lastRejectionReason: null, remainingCount: 3,
  },
  6: {
    id: 6, title: '영어 단어 20개 외우기',
    content: '오늘 배운 영어 단어 20개를 외우고, 단어장에 뜻까지 적어서 보여주세요.',
    subStatus: 'REJECTED', score: 5, dDay: 3, rewardAmount: 1500,
    verificationRequirement: 'TEXT_REQUIRED',
    lastRejectionReason: '인증하기 어려워요', remainingCount: 2,
  },
}

const isViewOnly = computed(() => route.query.view === '1')

const quest = ref(
  QUEST_DB[route.params.questId] ?? {
    id: route.params.questId, title: '퀘스트', content: '',
    subStatus: 'IN_PROGRESS', score: 0, dDay: 0, rewardAmount: 0,
    verificationRequirement: 'FREE', lastRejectionReason: null, remainingCount: 3,
  }
)

// 제출 시점에 서버에 기록될 인증 일시 미리보기 (실제로는 제출 API 응답의 시각을 써야 함)
const now = new Date()
const nowLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

// 상태별 아이콘 색 - QuestList.vue와 동일한 팔레트
const STATUS_ICON_COLORS = {
  IN_PROGRESS: { bg: '#e8f0fb', stroke: '#4585d6' },
  PENDING:     { bg: '#fff6dd', stroke: '#d99a00' },
  REJECTED:    { bg: '#fbe9e9', stroke: '#e5484d' },
}
const iconColor = computed(() => STATUS_ICON_COLORS[quest.value.subStatus] ?? STATUS_ICON_COLORS.IN_PROGRESS)

// 진행 상태 스텝퍼: 수락 -> 인증 제출 -> 승인
// 티니 코치 - 상태별 격려/안내 메시지
const coachMessage = computed(() => {
  const s = quest.value.subStatus
  if (s === 'REJECTED') return '반려 사유를 확인하고 다시 찍어서 올리면 돼요! 이번엔 성공할 수 있어요!'
  if (isViewOnly.value) return '부모님이 확인하고 있어요! 조금만 기다려요!'
  return '지금 보내면 바꾸거나 취소할 수 없어요! \n 이대로 부모님께 인증을 보낼까요?'
})

const photoRequired = computed(() => true)
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
    photoFile.value = blob
    photoPreview.value = URL.createObjectURL(blob)
    closeCamera()
  }, 'image/jpeg', 0.9)
}

const canSubmit = computed(() => {
  if (!photoFile.value) return false
  if (textRequired.value) return content.value.trim().length > 0
  return true
})

function submit() {
  // TODO: POST /quests/{quest.id}/verifications 연동 (multipart/form-data: photo, content)
  console.log('submit verification', quest.value.id, photoFile.value, content.value)
  router.back()
}

function goBack() {
  router.back()
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
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;
  font-family: 'Pretendard', 'Inter', sans-serif;
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

.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px;
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

/* 티니 코치 말풍선 */
.coach-block {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
}

.coach-avatar {
  flex: 0 0 auto;
  width: 38px;
  height: 40px;
}

.coach-bubble {
  position: relative;
  flex: 1 1 0%;
  min-width: 0;
  margin-top: 4px;
  background: #fff9ec;
  border: 1.4px solid #ffe6a3;
  border-radius: 4px 16px 16px 16px;
  padding: 10px 14px 12px;
  box-shadow: 0 2px 5px rgba(242, 180, 0, 0.12);
}

.coach-bubble::before,
.coach-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.coach-bubble::before {
  left: -11px;
  top: 7px;
  border-width: 0 11px 10px 0;
  border-color: transparent #ffe6a3 transparent transparent;
}

.coach-bubble::after {
  left: -8.5px;
  top: 8px;
  border-width: 0 9px 8px 0;
  border-color: transparent #fff9ec transparent transparent;
}

.coach-name {
  display: block;
  font-weight: 800;
  font-size: 11px;
  color: #b9861a;
  margin-bottom: 2px;
}

.coach-text {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b5a2e;
  line-height: 16.5px;
  word-break: keep-all;
  overflow-wrap: break-word;
  white-space: pre-line;
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
  color: #8a9099;
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
.reject-remaining { font-size: 11.5px; font-weight: 700; color: #d99a00; }

.card-label {
  display: block;
  font-weight: 700;
  font-size: 12.5px;
  color: #8a9099;
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
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6fa3f2, #4585d6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(69, 133, 214, .3);
  overflow: hidden;
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
  gap: 8px;
  width: 100%;
  height: 140px;
  border: 1.5px dashed #d8dbe0;
  border-radius: 12px;
  background: #fafbfc;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  padding: 0;
  font-family: inherit;
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
  color: #b9bec5;
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
.camera-error p { margin: 0; font-size: 12.5px; color: #b9bec5; }

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
  color: #8a9099;
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

.pending-note {
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  color: #d99a00;
  background: #fff6dd;
  border-radius: 12px;
  font-weight: 600;
}
</style>