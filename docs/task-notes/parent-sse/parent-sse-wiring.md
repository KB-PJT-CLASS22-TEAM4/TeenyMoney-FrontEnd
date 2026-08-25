# 부모 화면 SSE 배선 누락

> 이슈: #297
> 브랜치: `297-bugfix-psh-parent-sse-not-signal`
> 산출물: `frontend/src/pages/Parents/` 6개 파일
> 관련: `frontend/src/composables/useServerEvents.js`, `frontend/src/stores/sse.js`

---

## 1. 증상

부모 계정으로 퀘스트 화면을 열어 둔 채 자녀가 인증을 올려도 화면이 갱신되지 않는다.
새로고침해야 '검토 대기'로 바뀐 것이 보인다.

## 2. 원인

SSE 배선 자체는 살아 있다. 끊긴 곳은 **수신부**다.

연결은 `App.vue`가 로그인 여부만 보고 한 번 열고(역할 구분 없음), 백엔드도 부모에게 정확히
발행한다 — 자녀가 인증을 올리면 `QuestProgressService.notifyParent()`가
`createNotification(parentId, …, QUEST, …)`을 부르고, `NotificationService`가 그대로
`SseEvent(parentId, QUEST)`를 발행한다. 부모 스트림에 `QUEST` 이벤트가 실제로 도착한다.

문제는 그 신호를 받아 자기 화면을 다시 부르는 `useServerEvents(load)`를 호출한 부모 페이지가
**36개 중 2개뿐**이었다는 것이다.

| | 배선 전 | 배선 후 |
|---|---|---|
| `Parents/Home.vue` | ✅ | ✅ |
| `Parents/Link/LinkCode.vue` | ✅ | ✅ |
| `Parents/Quest/QuestList.vue` | ❌ | ✅ |
| `Parents/Quest/QuestDetail.vue` | ❌ | ✅ |
| `Parents/RequestList.vue` | ❌ | ✅ |
| `Parents/ParentsNotification.vue` | ❌ | ✅ |
| `Parents/Child/ChildDetail.vue` | ❌ | ✅ |
| `Parents/Child/FinanceApprovalDetail.vue` | ❌ | ✅ |
| 나머지 28개 | ❌ | ❌ (이번 범위 밖) |

자녀 화면 한 곳도 같이 붙였다. 부모 이슈지만 원인이 같고, 08번 시드로 만기 데이터를
넣어 둔 직후라 바로 확인할 수 있어서다.

| 화면 | 배선 전 | 배선 후 |
|---|---|---|
| `Child/Finance/MyProducts.vue` | ❌ | ✅ |
| `Child/Quest/QuestDetail.vue` | ❌ | ✅ |

`Child/Quest/QuestDetail`은 이번 이슈의 거울상이다. 부모 쪽 증상이 "자녀가 인증을 올렸는데
화면이 안 바뀐다"였다면, 자녀 쪽은 "부모가 승인했는데 화면이 안 바뀐다"였다.
인증을 올린 자녀는 이 화면을 켜 둔 채 검토를 기다리므로 체감이 특히 크다.

조회 자체는 정상이었다. `<KeepAlive>`가 어디에도 없어 화면을 나갔다 들어오면 재마운트되고
`onMounted`가 최신 상태를 읽는다. 막혀 있던 것은 "켜 둔 채 기다릴 때의 자동 갱신"뿐이다.

자녀 쪽과 비교하면 비대칭이 뚜렷했다. 자녀 퀘스트 목록에는
`useServerEvents(refreshTabs, ['QUEST'])`가 있는데 부모 퀘스트 목록에는 대응되는 줄이 없었다.

### 이번에 고치지 않은 것

조사 중에 같이 확인했지만 범위를 넘어 남겨 둔다.

- **이벤트 타입 누락은 이미 해결돼 있었다.** `6c1a6d2 sse 제외되어있던 알림 요소 추가 (#295)`가
  `SSE_EVENT_TYPES`를 백엔드 `NotificationReferenceType` 17개와 맞춰 놨다.
  `sse.test.js`의 "백엔드가 발행하는 SSE 이벤트를 모두 구독한다"가 이를 지킨다.
- **`api/sse.js`의 401은 문제가 아니었다.** 조사 도중 "`handleUnauthorizedResponse`를
  타지 않아 401을 조용히 삼킨다"고 판단했으나 틀렸다. `main.js`가
  `setupFetchAuthInterceptor()`로 `window.fetch` 자체를 감싸고 있어서, `api/sse.js`의
  평범한 `fetch` 호출도 그 경로를 탄다. 401이면 `shouldAttemptTokenReissue`가 참이 되어
  토큰을 재발급하고 한 번 재시도하며, 재발급까지 실패하면 `forceLogout`으로 이어진다.
  SSE 티켓 발급도 다른 API와 똑같이 보호되고 있다.

  다만 `authSession.js`의 `handleUnauthorizedResponse`는 export만 되어 있고
  **호출하는 곳이 하나도 없다.** 인터셉터가 그 역할을 대신하면서 남은 죽은 코드로 보인다.
  이번 범위가 아니라 손대지 않았고 정리 대상으로만 적어 둔다.
- **나머지 부모 화면 28개.** 결제·충전·용돈 전송처럼 사용자가 직접 끝까지 진행하는
  단발 플로우가 대부분이라 실시간 갱신의 실익이 작다. 필요해지면 그때 붙인다.
- **`useRefreshOnVisible` 부재.** 부모는 `Home.vue` 하나뿐이라 백그라운드 복귀 폴백이 없다.
  SSE가 끊겨 있던 구간을 메우는 것은 이쪽이라 따로 다룰 값어치가 있다.

## 3. 무엇을 했나

각 화면의 기존 로더를 그대로 재사용한다. 새 조회 함수를 만들지 않았다.

```js
// Parents/Quest/QuestList.vue    (loadQuests)
useServerEvents(loadQuests, ['QUEST'])

// Parents/Quest/QuestDetail.vue  (loadQuestDetail)
useServerEvents(loadQuestDetail, ['QUEST'])

// Parents/RequestList.vue        (fetchPendingRequests — useParentRequests에서 옴)
useServerEvents(fetchPendingRequests)

// Parents/ParentsNotification.vue (loadInitial)
useServerEvents(loadInitial)

// Parents/Child/ChildDetail.vue  (loadChildDetail)
useServerEvents(loadChildDetail)

// Parents/Child/FinanceApprovalDetail.vue  (fetchDetail)
useServerEvents(fetchDetail, [
  'DEPOSIT_ENROLLMENT', 'SAVING_ENROLLMENT', 'LOAN_ENROLLMENT',
])

// Child/Finance/MyProducts.vue  (loadProducts + fetchWalletBalance)
useServerEvents(() => { loadProducts(); fetchWalletBalance() })

// Child/Quest/QuestDetail.vue  (loadQuest)
useServerEvents(loadQuest, ['QUEST'])
```

자녀 퀘스트 상세는 `loadParentProfile`을 함께 부르지 않는다. 부모 이름과 프로필은
퀘스트 상태와 함께 바뀌지 않으므로 매 이벤트마다 다시 읽을 이유가 없다.

`MyProducts`만 두 함수를 함께 부른다. 화면 상단의 '내 지갑' 잔액이 납입·만기로 같이
움직이는데, 상품 목록만 다시 읽으면 잔액이 낡은 채로 남는다.

### 타입을 좁힌 곳과 안 좁힌 곳

퀘스트 두 화면만 `['QUEST']`로 좁혔다. 보는 대상이 퀘스트 하나뿐이라 결제·용돈 이벤트로
목록을 다시 부를 이유가 없고, 자녀 `QuestList`가 이미 같은 방식이라 형태도 맞는다.

금융 승인 상세는 예적금·대출 세 종류로 좁혔다. 승인 대기 중인 신청은 자녀가 취소할 수
있는데, 부모가 이 화면을 열어 둔 채로 취소되면 사라진 신청을 승인하려다 실패한다.

승인 요청 목록과 알림함, 자녀 상세는 **일부러 좁히지 않았다.** 둘 다 여러 도메인을 한데 모아 보여주는
화면이라, 타입을 나열하는 순간 그 목록이 `NotificationReferenceType`과 따로 놀기 시작한다.
신청 종류가 하나 늘 때 여기를 같이 고치지 않으면 그 종류만 조용히 실시간에서 빠진다.
`useServerEvents`의 주석이 정한 기본값("빗나간 이벤트로 조회가 한 번 더 나가는 비용이
목록을 관리하는 비용보다 싸다")을 그대로 따랐다.

### 알림함은 `loadMore`가 아니라 `loadInitial`

새 알림은 맨 위에 쌓인다. 뒤를 이어 붙이는 `loadMore()`로는 보이지 않고, 커서도 새로 잡아야 한다.

## 4. 검증

```
npm run build   ✅ 통과 (built in 1.28s)
npm test        31 pass / 1 fail
```

실패한 1건은 `onboarding.test.js:122` "강조 영역은 실제 캡처의 기능 카드 경계에 맞는다"로,
온보딩 하이라이트 좌표 테스트다. 이번 변경과 무관한 기존 실패다 —
`git status`상 변경 파일은 `Parents/` 4개뿐이고 온보딩 관련 파일은 건드리지 않았다.

SSE 관련 테스트(`백엔드가 발행하는 SSE 이벤트를 모두 구독한다`)는 통과한다.

### 수동 확인 절차

1. 부모로 로그인 → DevTools Network에서 `/api/v1/sse/subscribe`가 `pending`으로 열려 있는지 확인
   (25초마다 `:ping`이 쌓이면 정상)
2. 부모 퀘스트 목록을 열어 둔다
3. 다른 브라우저(또는 시크릿 창)에서 자녀로 로그인해 퀘스트 인증을 제출한다
4. 부모 화면이 새로고침 없이 '검토 대기'로 바뀌는지 확인
5. 같은 방식으로 승인 요청 목록(오늘만 허용 요청)과 알림함도 확인

## 5. 변경 파일

```
frontend/src/pages/Parents/Quest/QuestList.vue
frontend/src/pages/Parents/Quest/QuestDetail.vue
frontend/src/pages/Parents/RequestList.vue
frontend/src/pages/Parents/ParentsNotification.vue
frontend/src/pages/Parents/Child/ChildDetail.vue
frontend/src/pages/Parents/Child/FinanceApprovalDetail.vue
frontend/src/pages/Child/Finance/MyProducts.vue
frontend/src/pages/Child/Quest/QuestDetail.vue
```

## 6. 남은 구멍 — 별도 이슈

전수 대조 중 확인한 것. 이번 브랜치에서는 손대지 않았다.

### 부모가 자녀 지갑 변화를 못 받는 경로 (백엔드)

`TransferService.publishWalletOwnerChanged()`는 **지갑 주인**에게만 발행한다.
자녀 지갑 → 적금·예금 상품 지갑처럼 양쪽이 모두 자녀 소유인 이동은 자녀에게만 신호가 가고,
자녀 잔액을 보여주는 부모 홈·자녀 상세는 낡은 채로 남는다.

결제는 이 문제를 이미 알고 `PaymentService.publishParentWalletViewChangedBestEffort()`로
막아 뒀다(주석: "알림 수신자와 동기화 수신자가 갈리는 자리"). 예적금 쪽에는 그 대응이 없다.

해당 경로는 적금 자동납입, 예금 예치, 그리고 **이자가 0원인 만기**다.
(이자가 있으면 부모 지갑에서 이자가 나가므로 부모도 이체 신호를 받는다)

중도해지·가입 신청은 부모에게 알림이 가므로 신호도 함께 간다 — 구멍이 아니다.

### `CHARGE` 타입은 발행처가 없다

enum·DB CHECK·프론트 구독 목록에 모두 있으나 백엔드에서 한 번도 발행하지 않는다.
`charge` 도메인 전체에 `notificationService`도 `eventPublisher`도 없다.

영향은 작다. 충전은 `ChargeService`가 `principal`로 부모 지갑을 직접 조회하는 동기 플로우라
(walletId를 파라미터로 받지 않는다) 부모가 그 화면에서 결과를 바로 본다.
다른 탭에 홈을 열어 뒀을 때만 낡는다. 쓸 게 아니라면 enum에서 빼는 것도 방법이다.

각 파일에 `import { useServerEvents } from '@/composables/useServerEvents'` 한 줄과
호출 한 줄씩. 기존 로직은 건드리지 않았다.
