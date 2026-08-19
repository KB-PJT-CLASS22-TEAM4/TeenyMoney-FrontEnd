// public/firebase-messaging-sw.js
// 앱이 백그라운드(다른 탭/최소화)에 있을 때 푸시 알림을 받기 위한 서비스워커

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// firebaseConfig는 클라이언트 코드(src/firebase.js)와 동일한 값
firebase.initializeApp({
  apiKey: "AIzaSyCUzPE3PP6f01Upjx3A655JNClQW33N51Y",
  authDomain: "teenymoney-a1cbc.firebaseapp.com",
  projectId: "teenymoney-a1cbc",
  storageBucket: "teenymoney-a1cbc.firebasestorage.app",
  messagingSenderId: "653068181618",
  appId: "1:653068181618:web:75af387debc81fe2fda2eb",
})

const messaging = firebase.messaging()

// 백그라운드 상태에서 푸시 도착 시 브라우저 알림으로 표시
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '티니머니'
  const options = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
  }
  self.registration.showNotification(title, options)
})