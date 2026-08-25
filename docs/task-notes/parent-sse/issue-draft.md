# 이슈 초안 — `.github/ISSUE_TEMPLATE/02-bug.yml` 양식

제목에는 접두어를 붙이지 않는다(템플릿 안내).

---

## 제목

```
부모 화면 대부분이 SSE 신호를 받고도 갱신되지 않음
```

## 문제 요약

부모 계정에서 실시간 화면 동기화(SSE)가 거의 동작하지 않는다. 서버는 부모에게 이벤트를
정상 발행하고 연결도 열려 있으나, 신호를 받아 자기 화면을 다시 부르는
`useServerEvents(load)`를 호출한 부모 페이지가 36개 중 2개(`Home.vue`, `Link/LinkCode.vue`)뿐이다.
퀘스트·승인 요청·알림함 등 부모가 실시간을 가장 기대하는 화면이 전부 빠져 있다.

## 발생 환경

- 로컬 개발 환경
- Chrome
- Pinia

## 재현 절차

1. 부모 계정으로 로그인해 퀘스트 목록(`/parents/quest`)을 연 채로 둔다.
2. 다른 브라우저나 시크릿 창에서 연동된 자녀 계정으로 로그인한다.
3. 자녀가 진행 중인 퀘스트에 인증을 제출한다.
4. 부모 화면을 그대로 두고 관찰한다.

## 실제 동작

부모 화면이 그대로다. 새로고침하거나 다른 탭에 갔다 돌아와야 '검토 대기'로 바뀐 것이 보인다.
DevTools Network에서 `/api/v1/sse/subscribe`는 `pending`으로 열려 있고 `:ping`도 정상 수신된다.
즉 연결과 이벤트 수신은 되는데 화면이 반응하지 않는다.

승인 요청 목록(`RequestList.vue`)과 알림함(`ParentsNotification.vue`)도 같다.

## 기대 동작

자녀가 인증을 제출하면 부모 퀘스트 목록·상세가 새로고침 없이 '검토 대기'로 바뀌어야 한다.
오늘만 허용 요청이나 예적금 가입 신청이 들어오면 승인 요청 목록에 즉시 나타나야 하고,
새 알림은 알림함 상단에 즉시 쌓여야 한다.

## 영향 범위

- **사용자**: 부모 전체
- **화면**: `Parents/` 36개 중 34개. 이번 이슈에서는 체감이 큰 6개를 우선 처리한다.
  - `Quest/QuestList.vue`, `Quest/QuestDetail.vue`
  - `RequestList.vue`, `ParentsNotification.vue`
  - `Child/ChildDetail.vue`, `Child/FinanceApprovalDetail.vue`
- **자녀 쪽은 영향 없음**: `ChildHome.vue`와 `Child/Quest/QuestList.vue`는 이미 배선돼 있다.
- 백엔드 변경 없음. 프론트 수신부만 고친다.

## 로그·오류 메시지

```shell
# 오류는 발생하지 않는다. 연결과 이벤트 수신은 정상이며 화면만 반응하지 않는다.
# 참고 - 백엔드가 부모에게 발행하는 경로
#   QuestProgressService.notifyParent()
#     -> notificationService.createNotification(parentId, ..., QUEST, questId)
#     -> NotificationService: eventPublisher.publishEvent(new SseEvent(parentId, QUEST))
```

## 수정 후 검증 방법

1. `npm run build` 통과 확인.
2. `npm test`에서 `백엔드가 발행하는 SSE 이벤트를 모두 구독한다` 통과 확인.
   (`onboarding.test.js:122` 실패 1건은 이 변경과 무관한 기존 실패)
3. 위 재현 절차를 그대로 수행해 부모 퀘스트 목록·상세가 새로고침 없이 바뀌는지 확인.
4. 자녀가 오늘만 허용을 요청했을 때 부모 승인 요청 목록에 즉시 뜨는지 확인.
5. 위 두 동작에서 알림함 상단에 새 알림이 즉시 쌓이는지 확인.
6. 회귀: 부모 홈(`Home.vue`)의 기존 실시간 갱신이 그대로인지 확인.

---

## 후속으로 뺄 것 (이 이슈에 포함하지 않음)

1. ~~`api/sse.js`가 401을 조용히 삼킨다.~~ **취소 — 사실이 아니었다.**
   `main.js`의 `setupFetchAuthInterceptor()`가 `window.fetch`를 감싸므로 `api/sse.js`의
   `fetch`도 그 경로를 탄다. 401이면 토큰을 재발급하고 한 번 재시도하며, 재발급까지
   실패하면 `forceLogout`으로 간다. 다른 API와 동일하게 보호되고 있다.
   (부수 발견: `authSession.js`의 `handleUnauthorizedResponse`는 호출부가 없는 죽은 코드다.
   인터셉터 도입 후 남은 것으로 보인다 — 정리 이슈로 따로 뺄 만하다.)
2. **나머지 부모 화면 28개.** 결제·충전·용돈 전송처럼 사용자가 직접 끝까지 진행하는
   단발 플로우가 대부분이라 실시간 갱신의 실익이 작다.
3. **`useRefreshOnVisible` 부재.** 부모는 `Home.vue` 하나뿐이라 백그라운드 복귀 폴백이 없다.
   SSE가 끊겨 있던 구간을 메우는 것은 이쪽이라 따로 다룰 값어치가 있다.

## 이슈 생성 후 확인할 항목

- [ ] Assignee 지정
- [ ] Priority 지정
- [ ] Effort 지정
- [ ] `domain:*` Label 지정
- [ ] `area:*` Label 지정
- [ ] Parent issue 연결
