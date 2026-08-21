# PWA(홈 화면 설치) 지원 추가

작성일: 2026-08-20
브랜치: `238-feat-psh-pwa-install-with-ios`

## 목표
기존 Vue3 + Vite 프론트엔드를 그대로 두고, 안드로이드/iOS에서 "홈 화면에 추가"로
독립 앱처럼 실행되도록 최소 구성만 붙인다. 오프라인 캐싱은 범위에서 제외.

## 변경 파일
| 파일 | 내용 |
|---|---|
| `frontend/public/manifest.webmanifest` | 신규. name/short_name(티니머니), start_url `/`, display `standalone`, portrait, 아이콘 3종 |
| `frontend/public/icons/` | 신규. `logo.svg`에 임베드된 1024px PNG를 추출해 192/512/maskable-512/apple-touch-icon(180, 흰 배경) 생성 |
| `frontend/index.html` | manifest link, theme-color, apple-touch-icon, apple-mobile-web-app-* 메타 추가. `<html lang="ko">` 수정 |
| `frontend/public/sw.js` | 신규. 설치 요건(fetch 핸들러 보유 SW)을 채우는 최소 워커. 캐싱 없음 |
| `frontend/src/main.js` | 앱 mount 후 `/sw.js` 등록 |
| `frontend/src/firebase.js` | FCM 워커 등록 시 `scope: '/firebase-cloud-messaging-push-scope'` 지정 |
| `frontend/public/firebase-messaging-sw.js` | 알림 아이콘을 존재하지 않는 `/favicon.ico` → `/icons/icon-192.png` 로 수정 |
| `frontend/src/stores/auth.js` | 앱 시작 시 FCM 토큰을 서버와 동기화 (아래 참고) |

## 왜 SW를 새로 만들었나
- 크롬의 설치 가능 조건은 HTTPS + manifest + **fetch 핸들러가 있는 서비스워커**다.
  기존 `firebase-messaging-sw.js`에는 fetch 핸들러가 없고, 알림 권한을 허용한
  사용자만 등록되므로 설치 조건을 채우지 못한다.
- 한 scope에는 registration이 하나만 존재한다. `/sw.js`와 FCM 워커를 모두 기본
  scope(`/`)로 등록하면 나중 등록이 앞의 것을 대체해 백그라운드 푸시가 깨진다.
  그래서 FCM 워커를 Firebase 기본값인 `/firebase-cloud-messaging-push-scope`로 분리했다.

## FCM 토큰 동기화 (같이 처리)

기존에는 로그인할 때만 FCM 토큰을 서버로 보냈다. 그런데 리프레시 토큰이 14일이라
로그인 상태가 2주 넘게 유지되고, 그 사이 브라우저가 FCM 토큰을 갱신하면 서버는
옛 토큰으로 계속 발송한다. 에러도 나지 않고 알림만 조용히 끊기며, 다시 로그인하기
전까지 복구되지 않는다.

`auth.js` 스토어 생성 시점(= 앱 시작)에 로그인 상태이고 알림 권한이 이미
`granted`이면 `registerFcmToken()`을 한 번 호출해 서버 값을 현재 토큰으로 덮어쓴다.
`getToken()`은 토큰이 그대로면 같은 값을 돌려주므로 불필요한 변경은 없다.

- 권한이 `granted`일 때만 호출한다. 조건 없이 부르면 앱을 열 때마다 권한 팝업이 뜬다.
- 권한이 없는 신규 사용자는 기존대로 로그인 시 `setUser`가 요청한다.
- 백엔드는 손대지 않았다. `PATCH /fcm-token`이 이미 있어 호출 시점만 늘리면 된다.
- 서버 쪽 `FcmService.send()`는 전송 실패 시 로그만 남긴다. 폐기된 토큰(`UNREGISTERED`)을
  DB에서 지우는 처리는 없지만, 프론트가 새 토큰을 덮어쓰므로 알림 동작에는 영향이 없다.

## 검증
- `npm run build` 성공, `dist/`에 manifest·sw.js·icons 포함 확인
- `vite preview` 기준 `/manifest.webmanifest` 200 `application/manifest+json`,
  `/sw.js` 200 `text/javascript`, `/icons/icon-192.png` 200 확인
- manifest 파싱(name/display/icons 3개) 확인
- 서비스워커 실제 등록은 내장 브라우저 샌드박스에서 등록이 차단되어 검증하지 못함.
  **배포 후 크롬 DevTools → Application → Manifest / Service Workers 에서 확인 필요**

## 남은 것(필요할 때)
- 오프라인 동작·정적 자산 캐싱: `vite-plugin-pwa`(injectManifest 모드로 FCM 워커 코드 병합)
- nginx에 `.webmanifest` MIME 타입이 없으면 `application/manifest+json` 추가
- 자체 설치 버튼(`beforeinstallprompt` 가로채기)
