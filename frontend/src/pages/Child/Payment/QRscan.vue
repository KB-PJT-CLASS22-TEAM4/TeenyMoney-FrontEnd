<template>
  <div class="qr-scan">
    <!-- 안내 문구 (줄바꿈 없이 1줄) + 스캔 프레임 -->
    <main class="scan-stage">
      <div class="guide-box">
        <p class="desc">매장의 QR 코드를 네모 안에 맞춰주세요</p>
        <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
      </div>

      <div class="scan-frame">
        <!-- 카메라 박스 -->
        <div class="scan-box">
          <QrcodeStream
            @detect="onDetect"
            @error="onError"
            @camera-on="onCameraOn"
            class="camera"
          />
          <span class="scan-line"></span>
        </div>

        <span class="corner tl"></span>
        <span class="corner tr"></span>
        <span class="corner bl"></span>
        <span class="corner br"></span>
      </div>
    </main>

    <!-- 하단 액션 영역 (원형 닫기 버튼 + QR코드 보여주기 버튼) -->
    <footer class="bottom-action-group">
      <button class="close-action-btn" type="button" @click="closeScan" aria-label="닫기">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="cta-show-qr" type="button" @click="goShowQr">
        QR코드 보여주기
      </button>
    </footer>

    <!-- 결제 비밀번호 미설정 안내 모달 -->
    <div v-if="showPasswordModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-icon-wrap">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#ffbc00" stroke-width="2"/>
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#ffbc00" stroke-width="2"/>
            <circle cx="12" cy="15.5" r="1.3" fill="#ffbc00"/>
          </svg>
        </div>
        <h3 class="modal-title">결제 비밀번호가 필요해요</h3>
        <p class="modal-desc">안전한 QR 결제를 위해<br />먼저 결제 비밀번호 6자리를 등록해 주세요.</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" type="button" @click="closeScan">
            다음에 하기
          </button>
          <button class="modal-btn confirm" type="button" @click="goPasswordSetting">
            비밀번호 설정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { getMyInfo } from '@/api/member'

const router = useRouter()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()

const errorMsg = ref('')       // 카메라/검증 에러 안내
const scanned = ref(false)     // 중복 인식 방지 플래그
const showPasswordModal = ref(false) // 비밀번호 미설정 모달 노출 여부

// 화면 진입 시 결제 비밀번호 설정 여부 체크
onMounted(async () => {
  if (!authStore.accessToken) return
  try {
    const data = await getMyInfo(authStore.accessToken)
    const isPasswordNotSet = data?.paymentPassword == null && data?.hasPaymentPassword !== true
    if (isPasswordNotSet) {
      showPasswordModal.value = true
    }
  } catch (e) {
    console.error('회원 정보 조회 실패:', e)
  }
})

function goPasswordSetting() {
  showPasswordModal.value = false
  router.replace({ name: 'child-password-setting' })
}

// X(닫기) -> 홈으로 이동
function closeScan() {
  router.push({ name: 'child-home' })
}

// 'QR코드 보여주기' -> QR코드 페이지로 이동
function goShowQr() {
  router.push({ name: 'qr-code' })
}

// 카메라가 정상적으로 켜지면 에러 문구 초기화
function onCameraOn() {
  errorMsg.value = ''
}

// QR 인식됨. detected[0].rawValue 에 QR 안의 값(JSON 문자열)이 들어옴
async function onDetect(detected) {
  if (scanned.value) return              // 이미 한 번 인식했으면 무시
  const raw = detected[0]?.rawValue
  if (!raw) return

  scanned.value = true
  errorMsg.value = ''

  let qrPayload
  try {
    qrPayload = JSON.parse(raw)
  } catch {
    errorMsg.value = '올바른 QR 코드가 아니에요'
    scanned.value = false
    return
  }

  try {
    await paymentStore.verifyQr(authStore.accessToken, qrPayload)
    router.push({ name: 'pay-info' })
  } catch (e) {
    errorMsg.value = e.message || 'QR 코드를 확인할 수 없어요'
    scanned.value = false
  }
}

// 카메라 에러 처리 (권한 거부 등)
function onError(err) {
  console.log('카메라 에러:', err.name, err.message)
  if (err.name === 'NotAllowedError') {
    errorMsg.value = '카메라 권한을 허용해주세요'
  } else if (err.name === 'NotFoundError') {
    errorMsg.value = '카메라를 찾을 수 없어요'
  } else if (err.name === 'NotReadableError') {
    errorMsg.value = '다른 앱이 카메라를 사용 중이에요'
  } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
    // https 또는 localhost 가 아닐 때
    errorMsg.value = '보안 연결(https)에서만 카메라를 쓸 수 있어요'
  } else {
    errorMsg.value = '카메라를 열 수 없어요'
  }
}
</script>

<style scoped>
.qr-scan {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 48px 20px 36px;
  background: #111418;
  overflow: hidden;
  font-family: 'KBFGText', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* 안내 문구 + 스캔 영역 (문구를 위로 올려 여백 확보) */
.scan-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  gap: 48px;
  margin-top: -24px;
}

.guide-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.desc {
  margin: 0;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
  color: #ffffff;
  text-align: center;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

.err {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #ff6b6b;
  text-align: center;
}

.scan-frame {
  position: relative;
  width: 290px;
  height: 290px;
  flex-shrink: 0;
}

.scan-box {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
}

/* 카메라 */
.camera {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.camera :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.corner {
  position: absolute;
  width: 42px;
  height: 42px;
  border-style: solid;
  border-color: #ffbc00;
  z-index: 5;
  pointer-events: none;
}

.corner.tl { top: 0; left: 0; border-width: 4px 0 0 4px; border-radius: 24px 0 0 0; }
.corner.tr { top: 0; right: 0; border-width: 4px 4px 0 0; border-radius: 0 24px 0 0; }
.corner.bl { bottom: 0; left: 0; border-width: 0 0 4px 4px; border-radius: 0 0 0 24px; }
.corner.br { bottom: 0; right: 0; border-width: 0 4px 4px 0; border-radius: 0 0 24px 0; }

/* 스캔 라인 */
.scan-line {
  position: absolute;
  left: 20px;
  right: 20px;
  height: 2.5px;
  background: linear-gradient(90deg, transparent, #ffbc00, transparent);
  box-shadow: 0 0 10px rgba(255, 188, 0, 0.85);
  z-index: 2;
  animation: scan 2.2s ease-in-out infinite;
}

@keyframes scan {
  0%   { top: 20px; opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { top: 268px; opacity: 0; }
}

/* 하단 액션 그룹 (한 손 조작 최적화) */
.bottom-action-group {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 340px;
}

/* 닫기 원형 버튼 */
.close-action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);
}

.close-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
}

.close-action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
}

/* QR코드 보여주기 메인 버튼 */
.cta-show-qr {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 188, 0, 0.3);
  transition: background 0.15s ease, transform 0.1s ease;
}

.cta-show-qr:hover {
  background: #f5b300;
}

.cta-show-qr:active {
  transform: scale(0.98);
}

/* 안내 모달 스타일 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 24px;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 24px;
  padding: 28px 20px 20px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-icon-wrap {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 56px;
  height: 56px;
  border-radius: 20px;
  background: #fffdf2;
  border: 1px solid #fef3c7;
  margin-bottom: 16px;
}

.modal-title {
  margin: 0 0 8px;
  font-weight: 800;
  font-size: 18px;
  color: #111418;
  letter-spacing: -0.4px;
}

.modal-desc {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.45;
  color: #4d596b;
  letter-spacing: -0.2px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #4d596b;
}

.modal-btn.cancel:active {
  background: #e2e8f0;
}

.modal-btn.confirm {
  background: #ffbc00;
  color: #191b1e;
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.3);
}

.modal-btn.confirm:active {
  background: #f5b300;
  transform: scale(0.97);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>