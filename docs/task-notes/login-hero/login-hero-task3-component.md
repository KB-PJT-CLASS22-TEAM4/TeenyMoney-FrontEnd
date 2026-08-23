# 로그인 히어로 Task 3 — Login.vue 재작성

> 이슈: #265
> 플랜: `~/.claude/plans/drifting-hatching-comet.md` §Task 3
> 산출물: `frontend/src/pages/Login.vue`

---

## 1. 왜 이 구조인가

요구사항의 핵심은 "시트가 영상을 **가리는** 것이 아니라, 시트가 보이는 만큼 영상 영역의
**높이가 줄어든다**"는 것이다. 그래야 짧아진 영역에서 `object-fit: cover`가 다시 크롭하면서
가족의 얼굴과 핵심 행동만 남는다.

그래서 화면 전체가 `visible`이라는 **값 하나**에서 파생된다.

```
visible (PEEK 92 ~ full)
   │
   ├─ stage.height   = viewportH - visible      영상 영역
   └─ sheet.transform = translateY(full - visible)   시트 위치
```

두 값이 같은 소스에서 나오므로 드래그 중에도 어긋나지 않는다. 실측으로 확인했다 —
`visible` 92 / 352 / 552 각 시점에서 `stage.height + visible === 812`이 항상 성립한다.

```
<main class="login-screen">          height: 100dvh, overflow: hidden
  <section class="stage">            영상 2슬롯 + 폴백 이미지 + 브랜드 배지
  <section class="login-sheet">      handle(92px) + sheet-body(스크롤)
```

`handleLogin`, `ConfirmModal`, 역할별 라우팅 등 **인증 로직은 한 줄도 건드리지 않았다.**
마크업과 스타일, 그리고 새로 붙은 영상·시트 제어만 바뀌었다.

## 2. 무엇을 만들었나

### 영상 2슬롯 크로스페이드

video 엘리먼트를 **2개만** 두고 번갈아 쓴다. 5개를 한꺼번에 물면 첫 화면에서 13MB를 받는다.

```
onMounted        slotA.src = 001, play()
  play 성공 →    preloadNext(): slotB.src = 002        ← 여기서 처음 2개째를 받는다
timeupdate       남은 시간 <= 0.4s → advance()
  advance        slotB.play(), active = 1              ← opacity 전환은 CSS가 담당
  0.4s 뒤        preloadNext(): slotA.src = 003
```

첫 `play()`가 성공한 **뒤에야** 다음 것을 받는다. 둘을 동시에 물리면 첫 화면 비용이 5MB가 된다.
브라우저 실측 결과 video 엘리먼트 2개, 물려 있는 src도 2개다.

순환은 `(videoAt[active] + 1) % SOURCES.length`로 돌아 005 다음에 001로 돌아온다.
실측에서 `001 → … → 005` 한 바퀴 뒤 001이 다음 슬롯에 물리는 것을 확인했다.

### 시트 드래그

`pointerdown` / `pointermove` / `pointerup`을 핸들 하나에 건다. 클릭 핸들러를 따로 두지 않는다 —
드래그가 끝날 때 클릭이 같이 발화해 시트가 도로 닫히기 때문이다. 이동 거리가 6px 미만이면 탭으로 본다.

수치 계산은 전부 Task 2의 `clampSheet` / `snapTarget`이 한다. 컴포넌트는 이벤트만 받는다.

### 폴백 — 분기 하나

`videoEnabled`가 false면 기존 `login-family.png`를 보여준다. 세 경우가 여기로 모인다.

1. `VITE_LOGIN_VIDEO_BASE` 미설정 → `videoSources()`가 빈 배열
2. `prefers-reduced-motion: reduce`
3. 자동재생 차단(`NotAllowedError`) 또는 video `error`

`poster` 속성은 쓰지 않는다. `login-family.png`가 **1.8MB PNG**라서, 2.5MB 영상 앞에
1.8MB 포스터를 붙이면 계산이 맞지 않는다. `v-if`로만 렌더하므로 영상이 정상이면 아예 받지 않는다.

## 3. 테스트

```
npm test          17 pass, 0 fail
npm run build     built in 1.43s
```

브라우저(375×812)에서 합성 포인터 이벤트로 실측했다.

| 단계 | visible | stage 높이 | sheet top | 라벨 | 재생 중 |
|---|---|---|---|---|---|
| 초기 | 92 | 720 | 720 | 로그인하기 | 1 |
| 위로 드래그 → 스냅 | 592 | 220 | 220 | 내리기 | 1 |
| 탭 | 92 | 720 | 720 | 로그인하기 | 1 |
| 60px만 끌기 | 92 | 720 | 720 | 로그인하기 | 1 |

- `stage 높이 + visible === 812`이 모든 단계에서 성립한다 — 시트가 가리는 게 아니라 영역이 줄어든다.
- `sheet top === stage 높이` — 영상이 끝나는 지점에서 시트가 정확히 시작한다.
- **재생 중 개수가 내내 1이다.** 시트를 움직이는 동안 영상이 멈추지 않는다.
- 60px 드래그는 중간점(342)에 못 미쳐 접힌 상태로 되돌아간다.

## 4. 판단 근거 — 실측으로 잡은 문제 셋

셋 다 코드를 눈으로 읽어서는 안 보였고, 브라우저에 올려보고 나서야 드러났다.

### AbortError를 폴백으로 취급하면 안 된다

처음에는 `play().catch(disableVideo)`였다. 실행해보니 바로 이미지로 내려앉았다.

```
AbortError: The play() request was interrupted because
video-only background media was paused to save power.
```

영상을 `-an`으로 인코딩해 **오디오 트랙이 없다.** Chrome은 그런 영상을 화면에 보이지 않을 때
절전 목적으로 멈추고, 진행 중이던 `play()`를 이 이름으로 reject한다.
**사용자가 로그인 페이지를 백그라운드 탭으로 열기만 해도 발생한다.** 그걸 폴백으로 넘기면
탭을 다시 켜도 영상이 영영 돌아오지 않는다.

진짜로 포기해야 하는 건 자동재생 차단(`NotAllowedError`)과 로드 실패뿐이다.
`AbortError`는 흘려보내고, `visibilitychange`에서 재생을 되살린다.

여기서 파생된 구멍도 같이 막았다 — 첫 `play()`가 중단되면 `.then(preloadNext)`가 돌지 않아
다음 슬롯이 빈 채로 남는다. 그 상태에서 `advance()`가 전환하면 **src 없는 슬롯이 화면을 차지해
배경이 비어버린다.** `advance()`가 빈 슬롯을 만나면 그 자리에서 채우도록 했고,
`timeupdate`가 마지막 0.4초 창을 놓치는 경우를 위해 `ended`도 받는다.

### height를 calc(100dvh - Npx)로 트랜지션하면 안 된다

`stage`에 `height: calc(100dvh - ${visible}px)`를 걸었더니 인라인 스타일은 정확히 갱신되는데
**렌더된 높이가 이전 값에 그대로 멈춰 있었다.**

```
inline: height: calc(-592px + 100dvh)   →  실제 렌더 720px  (기대 220px)
2초간 6회 샘플링 → 계속 720px           →  트랜지션 진행 중이 아니다
height 제거 후 다시 세팅                →  즉시 220px
```

양끝이 `dvh`가 섞인 `calc`인 `height` 트랜지션을 브라우저가 애니메이션하지 못하고
이전 used value를 들고 있었다. **시트를 올려도 영상 영역이 줄지 않는다** — 이 작업의 핵심
요구사항이 조용히 깨지는 것이다.

화면 높이를 `viewportH` ref로 재서 들고, `stageHeight`를 **순수 px**로 계산하도록 바꿨다.
px끼리는 문제없이 전환된다. 덤으로 `resize`에서 이미 `measure()`를 부르고 있었으므로
모바일 주소창 여닫힘도 그대로 따라간다.

### 캡처 해제 예외가 스냅을 삼킨다

`onPointerUp`이 `releasePointerCapture`를 먼저 부르고 그 아래에서 스냅을 계산했다.
캡처 해제가 예외를 던지면 **그 아래 줄이 통째로 날아가 시트가 어중간한 높이에 멈춘다.**
(합성 이벤트에서 재현했지만, 실사용에서도 `pointercancel` 이후 등에서 발생할 수 있다.)

순서를 뒤집어 위치를 먼저 확정하고, 캡처 조작은 `try/catch`로 감쌌다.
캡처가 없어도 드래그 자체는 동작하므로 삼켜도 안전하다.

### 폴백 시 console.warn을 남긴다

영상이 이미지로 내려앉는 건 **에러 없이 조용히** 일어난다. 이번에 원인을 찾는 데 시간이
걸린 이유가 그것이다. 한 줄이면 다음 사람이 콘솔만 보고 안다.

## 5. 범위 밖

- **영상별 초점 위치** — `FOCUS` 배열이 전부 `center 40%` 기본값이다. Task 4에서 실제 프레임을 보고 채운다.
- **`.env.example`, `deploy-dev.yml` 배선** — Task 1. 배포 직전에 한다.
- **드래그 속도 기반 스냅** — 중간점 기준만 쓴다. 빠르게 튕기는 제스처는 지원하지 않는다.
- **`login-family.png`의 WebP 전환** — 1.8MB PNG로 남아 있다. 폴백 경로에서만 쓰이므로
  이번 작업을 막지는 않지만, `#263`에서 다른 에셋을 webp로 바꿀 때 빠진 것으로 보인다.
- **구글 OAuth** — `handleGoogleLogin`의 TODO 그대로.
