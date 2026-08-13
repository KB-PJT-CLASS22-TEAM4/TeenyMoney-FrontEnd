<template>
  <div class="qr-scan">
    <!-- 상단 네비 -->
    <div class="nav">
      <h1 class="nav-title">QR 스캔</h1>
      <button class="icon-btn" @click="closeScan" aria-label="닫기">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 안내 문구 -->
    <p class="desc">매장의 QR 코드를 네모 안에 맞춰주세요</p>
    <p v-if="errorMsg" class="err">{{ errorMsg }}</p>

    <!-- 스캔 영역 -->
    <div class="scan-stage">
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
    </div>

    <!-- 하단: QR코드 보여주기로 전환 -->
    <button class="cta" @click="goShowQr">QR코드 보여주기</button>
    <!-- 개발용 임시 버튼 (배포 전 삭제) -->
    <button class="dev-skip" @click="devSkip">[개발용] 스캔 건너뛰기</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'

const router = useRouter()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()

const errorMsg = ref('')       // 카메라/검증 에러 안내
const scanned = ref(false)     // 중복 인식 방지 플래그

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
    router.push({ name: 'pay-password' })
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

// 개발용: 실제 QR 없이 비밀번호 화면으로 바로 이동 (결제 정보가 없어 실제 결제는 실패함)
function devSkip() {
  router.push({ name: 'pay-password' })
}
</script>

<style scoped>
.qr-scan {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  height: 730px;
  margin: 0 auto;
  padding-top: 50px;
  background: #1a1200;
  overflow: hidden;
}

/* 상단 네비 */
.nav {
  box-sizing: border-box;    
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
  padding: 12px 20px 4px;

}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

/* 안내 문구 */
.desc {
  margin: 21px 0 4px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #ffffff;
  text-align: center;
}

.err {
  margin: 0 0 8px;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
}

/* 스캔 영역 */
.scan-stage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  flex: 1;
  padding-top: 50px;
}
.scan-frame {
  position: relative;
  width: 240px;
  height: 240px;
}
.scan-box {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  overflow: hidden;
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
  width: 32px;
  height: 32px;
  border-style: solid;
  border-color: #ffbc00;
  z-index: 5;
  pointer-events: none;
}
.corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 16px 0 0 0; }
.corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 16px 0 0; }
.corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 16px; }
.corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 16px 0; }

/* 스캔 라인 */
.scan-line {
  position: absolute;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffbc00, transparent);
  z-index: 2;
  animation: scan 2.2s ease-in-out infinite;
}

@keyframes scan {
  0%   { top: 20px; opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { top: 218px; opacity: 0; }
}

/* 하단 CTA */
.cta {
  width: 259px;
  margin-bottom: 100px;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: #ffbc00;
  color: #191b1e;
  font-weight: 500;
  font-size: 13.1px;
  cursor: pointer;
}

.cta:hover {
  filter: brightness(0.97);
}
/*  스캔 건너뛰기 버튼 (배포 전 삭제)  */
.dev-skip {
  margin: 8px auto;
  padding: 8px 16px;
  border: 1px dashed #ff6b6b;
  border-radius: 6px;
  background: transparent;
  color: #ff6b6b;
  font-size: 12px;
  cursor: pointer;
}
</style>