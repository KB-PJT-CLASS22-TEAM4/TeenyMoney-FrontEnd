# Safe Area Edge-to-Edge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 배경은 모바일 화면 끝까지 확장하고 모든 정보·조작 요소는 Safe Area 안쪽에 유지한다.

**Architecture:** `global.css`가 Safe Area 환경변수를 공통 CSS 프로퍼티로 제공하고 `App.vue`가 일반 화면의 상단 헤더 계약을 적용한다. 몰입형 화면과 고정 하단 내비게이션은 같은 프로퍼티를 소비해 별도 JavaScript 높이 계산이나 신규 의존성 없이 대응한다.

**Tech Stack:** Vue 3, CSS `env()`, Node test runner, Vite

**Spec:** `docs/superpowers/specs/2026-08-23-safe-area-edge-to-edge-design.md`

## Global Constraints

- 인증, 금융, 결제, 라우팅과 API 동작은 변경하지 않는다.
- 배경·영상만 Safe Area까지 확장하고 정보·조작 요소는 inset 안쪽에 둔다.
- Safe Area가 없는 환경에서는 기존 간격을 유지한다.
- 신규 패키지를 추가하지 않는다.

---

### Task 1: 공통 Safe Area 계약과 iOS 상태바

**Files:**
- Create: `frontend/test/safeArea.test.js`
- Modify: `frontend/src/styles/global.css`
- Modify: `frontend/index.html`

**Interfaces:**
- Produces: `--safe-area-top`, `--safe-area-right`, `--safe-area-bottom`, `--safe-area-left`

- [ ] **Step 1: 실패 테스트 작성**

`safeArea.test.js`에서 `viewport-fit=cover`, `black-translucent`, 네 공통 CSS 변수와 `.safe-area-test` 오버라이드를 소스 계약으로 검사한다.

- [ ] **Step 2: 실패 확인**

Run: `node --test test/safeArea.test.js`

Expected: `black-translucent` 및 공통 CSS 변수가 없어 FAIL.

- [ ] **Step 3: 최소 구현**

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
}

html.safe-area-test {
  --safe-area-top: 47px;
  --safe-area-right: 0px;
  --safe-area-bottom: 34px;
  --safe-area-left: 0px;
}
```

상태바 메타를 `black-translucent`로 바꾼다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test test/safeArea.test.js`

- [ ] **Step 5: 커밋**

```bash
git add frontend/test/safeArea.test.js frontend/src/styles/global.css frontend/index.html
git commit -m "feat: add shared safe area contract"
```

### Task 2: 일반 화면 상단 헤더와 사이드 메뉴

**Files:**
- Modify: `frontend/test/safeArea.test.js`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/components/Parents/ParentMenu.vue`
- Modify: `frontend/src/components/Child/ChildMenu.vue`

**Interfaces:**
- Consumes: Task 1의 `--safe-area-top`, `--safe-area-bottom`

- [ ] **Step 1: 실패 테스트 작성**

공통 nav 높이가 `calc(64px + var(--safe-area-top))`, nav 상단 패딩이 Safe Area를 포함하고 양쪽 drawer의 닫기 버튼·본문 패딩이 inset을 소비하는지 검사한다.

- [ ] **Step 2: 실패 확인**

Run: `node --test test/safeArea.test.js`

Expected: 헤더와 drawer에 Safe Area 소비 규칙이 없어 FAIL.

- [ ] **Step 3: 최소 구현**

일반 nav의 배경 박스 높이에 top inset을 더하고 콘텐츠는 아래 64px 영역에 둔다. drawer의 배경은 전체 화면을 덮되 닫기 버튼과 스크롤 본문은 top/bottom inset 안쪽에 둔다. 자녀 라우트의 전역 `padding-top: 0 !important` 강제는 제거한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test test/safeArea.test.js`

- [ ] **Step 5: 커밋**

```bash
git add frontend/test/safeArea.test.js frontend/src/App.vue frontend/src/components/Parents/ParentMenu.vue frontend/src/components/Child/ChildMenu.vue
git commit -m "feat: protect header controls with safe area"
```

### Task 3: 하단 내비게이션

**Files:**
- Modify: `frontend/test/safeArea.test.js`
- Modify: `frontend/src/components/Parents/BottomNav.vue`
- Modify: `frontend/src/components/Child/BottomTabBar.vue`

**Interfaces:**
- Consumes: Task 1의 `--safe-area-bottom`

- [ ] **Step 1: 실패 테스트 작성**

부모·자녀 내비게이션과 자녀 anchor 높이가 모두 `70px + bottom inset`을 사용하고 아이콘 영역 아래에 inset이 패딩으로 남는지 검사한다.

- [ ] **Step 2: 실패 확인**

Run: `node --test test/safeArea.test.js`

Expected: 고정 `70px` 규칙 때문에 FAIL.

- [ ] **Step 3: 최소 구현**

```css
height: calc(70px + var(--safe-area-bottom));
padding-bottom: calc(20px + var(--safe-area-bottom));
```

숨김 transform은 늘어난 전체 바를 그대로 이동시키며 이벤트 로직은 변경하지 않는다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test test/safeArea.test.js`

- [ ] **Step 5: 커밋**

```bash
git add frontend/test/safeArea.test.js frontend/src/components/Parents/BottomNav.vue frontend/src/components/Child/BottomTabBar.vue
git commit -m "feat: extend bottom navigation into safe area"
```

### Task 4: 몰입형 로그인·온보딩·QR·카메라 화면

**Files:**
- Modify: `frontend/test/safeArea.test.js`
- Modify: `frontend/src/pages/Child/Payment/QRscan.vue`
- Modify: `frontend/src/pages/Child/Quest/QuestDetail.vue`
- Verify: `frontend/src/pages/Login.vue`
- Verify: `frontend/src/pages/Onboarding.vue`

**Interfaces:**
- Consumes: Task 1의 `--safe-area-top`, `--safe-area-bottom`

- [ ] **Step 1: 실패 테스트 작성**

QR 안내/하단 조작부와 퀘스트 카메라 조작부가 top/bottom inset을 소비하는지 검사하고 로그인·온보딩의 기존 bottom 보호가 유지되는지 확인한다.

- [ ] **Step 2: 실패 확인**

Run: `node --test test/safeArea.test.js`

Expected: QR 및 퀘스트 카메라 컨트롤이 고정 px 위치라 FAIL.

- [ ] **Step 3: 최소 구현**

QR 화면의 검은 배경과 카메라 영역은 전체 높이를 유지하되 루트 상·하단 패딩에 공통 inset을 더한다. 퀘스트 촬영 오버레이는 전체 화면에 유지하고 `.camera-controls`의 bottom을 `calc(28px + var(--safe-area-bottom))`으로 바꾼다. 로그인과 온보딩은 기존 배경 구조와 Safe Area 보호가 이미 충족되므로 불필요한 마크업 변경을 하지 않는다.

- [ ] **Step 4: 전체 자동 검증**

Run: `npm test`

Expected: 모든 테스트 PASS.

Run: `npm run build`

Expected: Vite build 성공.

- [ ] **Step 5: 커밋**

```bash
git add frontend/test/safeArea.test.js frontend/src/pages/Child/Payment/QRscan.vue frontend/src/pages/Child/Quest/QuestDetail.vue
git commit -m "feat: keep camera controls inside safe area"
```

