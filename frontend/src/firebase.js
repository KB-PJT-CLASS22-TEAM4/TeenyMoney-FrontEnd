import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyCUzPE3PP6f01Upjx3A655JNClQW33N51Y",
  authDomain: "teenymoney-a1cbc.firebaseapp.com",
  projectId: "teenymoney-a1cbc",
  storageBucket: "teenymoney-a1cbc.firebasestorage.app",
  messagingSenderId: "653068181618",
  appId: "1:653068181618:web:75af387debc81fe2fda2eb",
}

// Firebase Console → 프로젝트 설정 → Cloud Messaging 탭 → 웹 구성 → 키 쌍 생성 에서 발급받은 값
const VAPID_KEY = 'BCfpcdzNZ49Zm6GLf6mabO397bfnCXhA53RJ_UdDQhpbQj2uEhZUxrJKs1pT3eq67WxHpMFTc6x9dFVMLFYewVo'

const app = initializeApp(firebaseConfig)

let messagingInstance = null

async function getMessagingIfSupported() {
  if (messagingInstance) return messagingInstance
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  messagingInstance = getMessaging(app)
  return messagingInstance
}

// 알림 권한 요청 + FCM 토큰 발급
// 반환값: 토큰 문자열 | null (미지원 브라우저·권한 거부·실패 시)
export async function requestFcmToken() {
  try {
    const messaging = await getMessagingIfSupported()
    if (!messaging) {
      console.warn('이 브라우저는 웹 푸시를 지원하지 않습니다.')
      return null
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.')
      return null
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } catch (e) {
    console.error('FCM 토큰 발급 실패:', e)
    return null
  }
}