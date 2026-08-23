# 로그인 히어로 Task 2 — 순수 로직과 테스트

> 플랜: `~/.claude/plans/drifting-hatching-comet.md` §Task 2
> 산출물: `frontend/src/utils/loginHero.js`, `frontend/test/loginHero.test.js`

---

## 1. 왜 이 구조인가

로그인 화면을 영상 배경 + 끌어올리는 바텀시트로 바꾼다. 그 안에 판단이 필요한 지점이
세 군데 있고, 셋 다 DOM이 없어도 답이 정해지는 순수 계산이다.

```
clampSheet(value, peek, full)   드래그 중 손가락 위치를 시트 높이 범위로 자른다
snapTarget(value, peek, full)   손을 뗐을 때 접을지 펼칠지
videoSources(base, count)       영상 주소 목록. base가 없으면 빈 배열
```

`Login.vue` 안에 두면 이 세 줄을 확인하려고 브라우저를 띄우고 손으로 드래그해야 한다.
밖으로 빼면 `node --test` 한 번으로 끝난다. 파일 하나 늘어나는 값은 그걸로 회수된다.

기존 패턴을 그대로 따랐다 — 순수 함수는 `src/utils/*.js`, 테스트는 `test/*.test.js`,
`node:test` + 한국어 테스트명. `latestRequestGuard.js` / `latestRequestGuard.test.js`와 같은 모양이다.

## 2. 무엇을 만들었나

**`clampSheet`** — 드래그 중 시트가 접힌 높이 아래로 내려가거나 펼친 높이 위로
올라가지 않게 자른다. 단순한 min/max지만 경계를 뒤집어 쓰면 시트가 화면 밖으로
사라지고, 그 버그는 손으로 끝까지 끌어봐야 재현된다.

**`snapTarget`** — 중간점을 기준으로 가까운 쪽에 붙인다. `>=`를 쓰므로 정확히
중간점이면 펼쳐진다. 어중간한 높이에서 멈추는 상태를 만들지 않기 위한 함수다.

**`videoSources`** — 여기가 이번 Task의 핵심이다.

```js
export function videoSources(base, count = VIDEO_COUNT) {
  if (!base) return []
  const origin = base.replace(/\/+$/, '')
  return Array.from({ length: count },
    (_, index) => `${origin}/${String(index + 1).padStart(3, '0')}.mp4`)
}
```

`base`가 비면 **빈 배열**을 돌려준다. 이 빈 배열이 "CDN 미설정 → 이미지 폴백"의
유일한 판정 지점이다. 자세한 이유는 4절에 적었다.

끝의 슬래시를 떼는 건 주소에 `//`가 생기면 CDN 캐시 키가 갈리기 때문이다.
`https://cdn/login/v1`과 `https://cdn/login/v1/`을 env에 어떻게 적든 결과가 같아야 한다.

## 3. 테스트

```
node --test test/loginHero.test.js
# tests 8
# pass 8
# fail 0
```

전체 스위트도 통과한다 (`npm test` → 17/17).

경계값을 못 박는 데 집중했다.

| 테스트 | 고정하는 것 |
|---|---|
| 접힌 높이 아래로 끌어내려도 멈춘다 | 하한 |
| 펼친 높이 위로 끌어올려도 멈춘다 | 상한 |
| 범위 안에서는 손가락을 따라간다 | 자르지 말아야 할 때 자르지 않음 |
| 중간점에 못 미치면 접힌다 (295) | 스냅 경계 바로 아래 |
| 중간점에 닿으면 펼쳐진다 (296) | 스냅 경계 |
| 주소가 없으면 빈 목록 | 폴백 진입 조건 |
| 파일명은 세 자리 | `1.mp4`가 아니라 `001.mp4` |
| 끝 슬래시가 있어도 `//` 없음 | env 표기 흔들림 흡수 |

295/296은 `PEEK=92, FULL=500`의 중간점 296을 기준으로 양쪽 한 칸씩이다.
부등호를 `>`로 바꾸거나 나눗셈을 잘못 쓰면 이 두 개 중 하나가 깨진다.

## 4. 판단 근거

**폴백 판정을 왜 `videoSources`에 몰았나**

영상 대신 정적 이미지를 보여줘야 하는 경우가 셋이다.

1. `VITE_LOGIN_VIDEO_BASE`가 없음 (CDN 미설정, 로컬 개발)
2. 사용자가 `prefers-reduced-motion: reduce`를 켜둠
3. 자동재생 차단 또는 영상 로드 실패

컴포넌트가 `if (!base)`로 직접 분기하면 1번만 별도 경로가 되고 2·3번과 갈라진다.
그러면 폴백 UI를 고칠 때 한쪽만 고치고 나머지를 빠뜨리게 된다.

빈 배열로 통일하면 세 경우가 `videoEnabled = false` 한 곳으로 모인다.
분기가 하나면 빠뜨릴 나머지가 없다.

**왜 이 세 개만 뺐나**

드래그 이벤트 처리, 크로스페이드 타이밍, ResizeObserver는 빼지 않았다.
전부 DOM과 타이머에 붙어 있어서 밖으로 빼려면 가짜 DOM을 만들어야 하고,
그 비용이 얻는 것보다 크다. 순수하게 떨어지는 것만 뺐다.

## 5. 범위 밖

- **`Login.vue` 수정** — Task 3. 이 파일들을 import하는 쪽은 아직 없다.
- **`.env.example`, `deploy-dev.yml` 배선** — Task 1. 배포 시점에만 필요해서 뒤로 미뤘다.
- **영상별 초점 위치(`object-position`)** — Task 4에서 실제 프레임을 보고 정한다.
- **드래그 속도(velocity) 기반 스냅** — 중간점 기준만 쓴다. 빠르게 튕기는 제스처를
  살리려면 속도를 봐야 하지만, 지금 필요한 동작은 아니다.
