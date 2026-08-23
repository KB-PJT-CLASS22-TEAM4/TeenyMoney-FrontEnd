<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import familyHeroUrl from '@/assets/login/login-family.png';
import walletLogoUrl from '@/assets/logo.svg';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { login } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { getMyParent } from '@/api/families';
import { clampSheet, snapTarget, videoSources } from '@/utils/loginHero';
import {
  ONBOARDING_PENDING_MEMBER_KEY,
  shouldShowChildOnboarding,
  shouldShowOnboarding,
} from '@/utils/onboarding';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isPasswordVisible = ref(false);
const showLoginErrorModal = ref(false);
const loginErrorMessage = ref('');

// 비밀번호 8자 이상인지 검사
const isPasswordValid = computed(() => password.value.length >= 8);

// 로그인 버튼 활성 조건: 이메일 입력됨 + 비번 8자 이상
const canSubmit = computed(
  () => email.value.length > 0 && isPasswordValid.value,
);

// 안내문구: 비번을 입력하기 시작했는데 아직 8자 미만일 때만 표시
const showPasswordHint = computed(
  () => password.value.length > 0 && !isPasswordValid.value,
);

async function handleLogin() {
  if (!canSubmit.value) return;

  try {
    const res = await login(email.value, password.value);

    if (res.success) {
      authStore.setUser(res.data);

      if (
        shouldShowOnboarding(
          localStorage.getItem(ONBOARDING_PENDING_MEMBER_KEY),
          res.data.memberId,
        )
      ) {
        router.push({ name: 'onboarding' });
        return;
      }

      if (res.data.role === 'CHILD') {
        try {
          const parentRes = await getMyParent(res.data.accessToken);
          if (shouldShowChildOnboarding(parentRes.data)) {
            router.push({ name: 'onboarding' });
          } else {
            router.push({ name: 'child-home' });
          }
        } catch {
          router.push({ name: 'onboarding' });
        }
      } else {
        router.push({ name: 'parents-home' });
      }
      return;
    }

    loginErrorMessage.value =
      res.message || '이메일 또는 비밀번호가 일치하지 않습니다.';
    showLoginErrorModal.value = true;
  } catch (error) {
    console.error('로그인 실패:', error);
    loginErrorMessage.value =
      '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    showLoginErrorModal.value = true;
  }
}

function closeLoginErrorModal() {
  showLoginErrorModal.value = false;
}

const TOAST_MS = 2200;

// 토스트는 항상 마운트해두고 클래스만 토글한다.
//
// v-if로 껐다 켜면 두 가지가 걸린다. 하나는 aria-live 영역이 텍스트와 같은
// 순간에 삽입되어 스크린리더가 변화를 놓치는 것이고, 다른 하나는 Vue의
// Transition이 transitionend를 기다리다 요소를 못 지우는 것이다.
const toastText = ref('');
const toastOn = ref(false);
let toastTimer = null;

function showToast(message) {
  toastText.value = message;
  toastOn.value = true;

  // 연타하거나 다른 버튼을 이어 눌러도 타이머가 겹치지 않게 이전 것을 버린다.
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastOn.value = false;
  }, TOAST_MS);
}

// 아래 셋은 아직 구현되지 않은 기능이다. 버튼을 지우는 대신 짧게 알리고 사라지게
// 둔다. 버튼이 사라지면 "언젠가 생길 기능"이라는 정보까지 같이 사라진다.
//
// useAlertModal(확인 버튼이 있는 모달)을 쓰지 않는다. 아직 없는 기능을 알리려고
// 사용자에게 탭을 하나 더 시킬 이유가 없다.

function handleGoogleLogin() {
  // TODO: 구글 OAuth 연동
  showToast('구글 로그인은 다음 업데이트에 추가됩니다');
}

function handleFindEmail() {
  // TODO: 아이디 찾기 화면
  showToast('아이디 찾기는 다음 업데이트에 추가됩니다');
}

function handleFindPassword() {
  // TODO: 비밀번호 찾기 화면 (api/password.js는 결제 비밀번호용이라 무관하다)
  showToast('비밀번호 찾기는 다음 업데이트에 추가됩니다');
}

/* ------------------------------------------------------------------ *
 * 배경 영상
 *
 * video 엘리먼트를 2개만 두고 번갈아 쓴다. 5개를 한꺼번에 물면 첫 화면에서
 * 13MB를 받게 되므로, 재생 중인 것과 바로 다음 것까지만 들고 있는다.
 * ------------------------------------------------------------------ */

const FADE_MS = 400;

const SOURCES = videoSources(import.meta.env.VITE_LOGIN_VIDEO_BASE);

// 영상별 초점 위치. 시트가 올라와 영상 영역이 짧아졌을 때 무엇을 남길지 정한다.
//
// Y값은 펼친 상태에서만 의미가 있다. 접힌 상태(375×720)에서는 720×1264 영상을
// cover하면 세로 배율(720/1264)이 이겨 렌더 높이가 정확히 720이 되므로 세로
// 여백이 0이다. 펼친 상태(375×220)에서는 가로 배율(375/720)이 이겨 원본 1264행
// 중 422행만 보이고, 그 창의 위치를 이 값이 고른다.
//
// 실제 프레임을 뽑아 눈으로 맞춘 값이다. 세 얼굴이 모두 들어오면서 각 영상의
// 핵심 소품(저금통, 칠판, 카드, 휴대폰, 별)이 잘리지 않는 지점을 골랐다.
//
// ponytail: 영상을 교체하면 이 배열만 고치면 된다. 숫자 외에는 볼 것이 없다.
const FOCUS = [
  'center 48%', // 001 세 얼굴 + 파란 모자
  'center 38%', // 002 활짝 웃는 부모 + 칠판
  'center 50%', // 003 카드를 든 아기
  'center 45%', // 004 코인이 뜬 휴대폰 화면
  'center 55%', // 005 세 얼굴 + 뒤쪽 저금통
];

const slotA = ref(null);
const slotB = ref(null);
const slots = [slotA, slotB];

// 각 슬롯이 들고 있는 영상 번호. FOCUS 조회에 쓰이므로 반응형이어야 한다.
const videoAt = reactive([0, 0]);
const active = ref(0);

// 영상을 포기하고 정적 이미지로 돌아갈지. CDN 미설정, 모션 줄이기, 자동재생
// 차단, 로드 실패가 전부 여기로 모인다. 분기가 하나면 빠뜨릴 나머지가 없다.
const videoEnabled = ref(SOURCES.length > 0);

let switching = false;
let fadeTimer = null;

function focusOf(slot) {
  return FOCUS[videoAt[slot]] ?? 'center 40%';
}

function disableVideo(reason) {
  if (!videoEnabled.value) return;

  console.warn('[login] 배경 영상을 끄고 이미지로 대체합니다.', reason);
  videoEnabled.value = false;
  releaseVideos();
}

// play() 실패를 전부 폴백으로 취급하면 안 된다.
//
// AbortError는 일시적이다. 오디오 트랙이 없는 영상(-an으로 인코딩했다)은
// 화면에 보이지 않을 때 브라우저가 절전 목적으로 멈추고, 그때 진행 중이던
// play()가 이 이름으로 reject된다. 로그인 페이지를 백그라운드 탭으로 열기만
// 해도 발생하므로, 이걸 폴백으로 넘기면 탭을 다시 켜도 영상이 돌아오지 않는다.
//
// 진짜로 포기해야 하는 건 자동재생이 막힌 경우(NotAllowedError)와 로드 실패다.
function onPlayFailure(error) {
  if (error?.name === 'AbortError') return;
  disableVideo(error);
}

// 절전으로 멈췄거나 백그라운드에서 중단된 재생을 화면이 돌아왔을 때 되살린다.
function resumeIfVisible() {
  if (!videoEnabled.value || document.hidden) return;

  const element = slots[active.value].value;
  if (!element?.paused) return;

  // 첫 play()가 중단됐다면 preloadNext도 못 돌았다. 다음 슬롯이 빈 채로
  // 두면 전환할 때 재생할 것이 없으므로 여기서 같이 채운다.
  element.play()?.then(preloadNext).catch(onPlayFailure);
}

// 재생 중인 영상의 다음 것을 놀고 있는 슬롯에 미리 물린다.
function preloadNext() {
  if (!videoEnabled.value) return;

  const idle = 1 - active.value;
  const element = slots[idle].value;
  if (!element) return;

  const next = (videoAt[active.value] + 1) % SOURCES.length;
  // 같은 src를 다시 대입하면 브라우저가 처음부터 다시 받는다. 복구 경로에서
  // 여러 번 불릴 수 있으므로 이미 물려 있으면 넘어간다.
  if (videoAt[idle] === next && element.src) return;

  videoAt[idle] = next;
  element.src = SOURCES[next];
  element.load();
}

function advance() {
  const next = 1 - active.value;
  const element = slots[next].value;
  if (!element) return;

  // 첫 play()가 중단되면 preloadNext가 돌지 않아 다음 슬롯이 빈 채로 남는다.
  // 그대로 전환하면 src 없는 슬롯이 화면을 차지해 배경이 비어버린다.
  if (!element.src) preloadNext();
  if (!element.src) return;

  switching = true;
  element.currentTime = 0;
  element.play()?.catch(onPlayFailure);

  // opacity 전환은 CSS가 맡는다. 두 영상이 FADE_MS 동안 겹쳐 재생된다.
  active.value = next;

  // 페이드가 완전히 끝난 뒤에 preload를 건다.
  //
  // preloadNext는 물러난 슬롯에 element.load()를 부르는데, load()는 요소를
  // 리셋해 프레임이 없는 상태로 만든다. 프레임 없는 video는 검게 칠해지므로
  // 이 타이머가 opacity 전환과 같은 길이면 아직 덜 사라진 요소가 검게 번쩍인다.
  fadeTimer = setTimeout(() => {
    preloadNext();
    switching = false;
  }, FADE_MS + 120);
}

// timeupdate는 마지막 0.4초 동안 여러 번 발화하므로 한 번만 통과시킨다.
function onTimeUpdate(slot) {
  if (slot !== active.value || switching) return;

  const element = slots[slot].value;
  if (!element?.duration) return;
  if (element.duration - element.currentTime > FADE_MS / 1000) return;

  advance();
}

// timeupdate가 마지막 0.4초 창을 놓치면(백그라운드 탭에서는 발화가 크게
// 느려진다) 영상이 끝난 채로 멈춘다. 그 경우를 여기서 받는다.
// 정상 경로에서는 이미 active가 넘어가 있으므로 이 핸들러는 그냥 빠진다.
function onEnded(slot) {
  if (slot !== active.value) return;
  advance();
}

function releaseVideos() {
  clearTimeout(fadeTimer);
  fadeTimer = null;

  for (const slot of slots) {
    const element = slot.value;
    if (!element) continue;
    element.pause();
    // src를 비우지 않으면 화면을 떠난 뒤에도 다운로드가 계속된다.
    element.removeAttribute('src');
    element.load();
  }
}

/* ------------------------------------------------------------------ *
 * 바텀시트
 *
 * 시트가 영상을 가리는 것이 아니라, 시트가 보이는 만큼 영상 영역의 높이가
 * 줄어든다. stage 높이와 시트 transform이 같은 값(visible)에서 나온다.
 * ------------------------------------------------------------------ */

const PEEK = 52;
const MAX_SHEET_RATIO = 0.78;

const sheetEl = ref(null);
const handleEl = ref(null);
const bodyEl = ref(null);

const full = ref(PEEK);
const visible = ref(PEEK);
const dragging = ref(false);
const measured = ref(false);

// 화면 높이를 JS로 재서 들고 있는다.
//
// stage 높이를 CSS로 calc(100dvh - Npx)라고 쓰면 안 된다. 양끝이 dvh가 섞인
// calc인 height 트랜지션은 브라우저가 애니메이션을 걸지 못하고 이전 값을 그대로
// 들고 있어서, 시트를 올려도 영상 영역이 줄지 않는다(실측으로 확인).
// 순수 px 값끼리는 문제없이 전환된다.
const viewportH = ref(typeof window === 'undefined' ? 0 : window.innerHeight);

const expanded = computed(() => visible.value > (PEEK + full.value) / 2);

// 영상 영역 높이. 시트가 보이는 만큼 그대로 줄어든다.
const stageHeight = computed(() =>
  Math.max(0, viewportH.value - visible.value),
);

let observer = null;
let dragStartY = 0;
let dragStartVisible = 0;
let moved = 0;

// 시트를 얼마나 올릴 수 있는지. 핸들과 폼 전체 높이를 쓰되 화면의 78%를 넘지
// 않는다. 작은 화면에서 폼이 화면을 다 먹고 영상이 사라지는 것을 막는다.
//
// 시트 자체(sheetEl)가 아니라 본문(bodyEl)을 재는 이유는, 시트 높이가 여기서
// 나온 값으로 정해지기 때문이다. 시트를 재면 값이 자기 자신을 참조하게 된다.
function measure() {
  const body = bodyEl.value;
  if (!body) return;

  viewportH.value = window.innerHeight;

  const natural = (handleEl.value?.offsetHeight ?? PEEK) + body.scrollHeight;
  const limit = window.innerHeight * MAX_SHEET_RATIO;
  const wasExpanded = expanded.value;

  full.value = Math.max(PEEK, Math.min(natural, limit));
  if (wasExpanded) visible.value = full.value;
}

function toggleSheet() {
  visible.value = expanded.value ? PEEK : full.value;
}

// 포인터 캡처는 실패할 수 있다. 이미 해제된 포인터를 놓아주려 하면 예외가 난다.
// 캡처가 없어도 드래그 자체는 동작하므로, 시트 조작이 여기에 걸려 넘어지지
// 않도록 삼킨다.
function capturePointer(id, take) {
  try {
    if (take) handleEl.value?.setPointerCapture(id);
    else handleEl.value?.releasePointerCapture(id);
  } catch {
    /* 캡처 없이 진행한다 */
  }
}

function onPointerDown(event) {
  dragging.value = true;
  dragStartY = event.clientY;
  dragStartVisible = visible.value;
  moved = 0;
  capturePointer(event.pointerId, true);
}

function onPointerMove(event) {
  if (!dragging.value) return;

  const delta = dragStartY - event.clientY;
  moved = Math.max(moved, Math.abs(delta));
  visible.value = clampSheet(dragStartVisible + delta, PEEK, full.value);
}

function onPointerUp(event) {
  if (!dragging.value) return;

  dragging.value = false;

  // 위치를 먼저 확정한다. 캡처 해제보다 뒤에 두면 해제가 실패했을 때 시트가
  // 어중간한 높이에 멈춘다.
  //
  // 거의 움직이지 않았으면 드래그가 아니라 탭이다. 클릭 핸들러를 따로 두면
  // 드래그가 끝날 때 클릭이 같이 발화해 시트가 도로 닫힌다.
  if (moved < 6) toggleSheet();
  else visible.value = snapTarget(visible.value, PEEK, full.value);

  capturePointer(event.pointerId, false);
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    videoEnabled.value = false;
  }

  measure();
  // 항상 폼이 올라온 상태로 연다. 로그인 화면은 감상하는 곳이 아니라 입력하는
  // 곳이고, 접힌 채로 열면 누구든 입력 전에 탭을 한 번 더 해야 한다.
  // measure() 뒤라야 full이 실제 높이고, measured가 켜지기 전이라 이 초기
  // 상태는 애니메이션 없이 그려진다.
  visible.value = full.value;

  // 첫 프레임은 is-static으로 두고 다음 프레임에 트랜지션을 켠다. 측정으로
  // full이 PEEK에서 실제 높이로 뛰는 것이 애니메이션으로 보이면 안 된다.
  requestAnimationFrame(() => {
    measured.value = true;
  });
  observer = new ResizeObserver(measure);
  if (bodyEl.value) observer.observe(bodyEl.value);
  window.addEventListener('resize', measure);
  document.addEventListener('visibilitychange', resumeIfVisible);

  if (!videoEnabled.value) return;

  // muted는 속성만으로는 부족하다. iOS는 프로퍼티가 켜져 있어야 자동재생을
  // 허용하고, 없으면 play()가 조용히 reject된다.
  for (const slot of slots) {
    if (slot.value) slot.value.muted = true;
  }

  const first = slotA.value;
  if (!first) return;

  videoAt[0] = 0;
  first.src = SOURCES[0];
  // 첫 영상이 실제로 재생된 뒤에야 다음 것을 받는다. 둘을 동시에 물리면
  // 첫 화면에서 5MB를 받게 된다.
  first.play().then(preloadNext).catch(onPlayFailure);
});

onBeforeUnmount(() => {
  releaseVideos();
  clearTimeout(toastTimer);
  observer?.disconnect();
  window.removeEventListener('resize', measure);
  document.removeEventListener('visibilitychange', resumeIfVisible);
});
</script>

<template>
  <main class="login-screen">
    <section
      class="stage"
      :class="{ 'is-static': !measured || dragging }"
      :style="{ height: `${stageHeight}px` }"
    >
      <template v-if="videoEnabled">
        <video
          ref="slotA"
          class="reel"
          :class="{ 'is-active': active === 0 }"
          :style="{ objectPosition: focusOf(0) }"
          muted
          playsinline
          preload="none"
          aria-hidden="true"
          @timeupdate="onTimeUpdate(0)"
          @ended="onEnded(0)"
          @error="disableVideo"
        ></video>
        <video
          ref="slotB"
          class="reel"
          :class="{ 'is-active': active === 1 }"
          :style="{ objectPosition: focusOf(1) }"
          muted
          playsinline
          preload="none"
          aria-hidden="true"
          @timeupdate="onTimeUpdate(1)"
          @ended="onEnded(1)"
          @error="disableVideo"
        ></video>
      </template>

      <img
        v-else
        class="reel is-active"
        :src="familyHeroUrl"
        alt="함께 웃고 있는 티니머니 가족"
      />

    </section>

    <section
      ref="sheetEl"
      class="login-sheet"
      :class="{ 'is-static': !measured || dragging }"
      :style="{
        height: `${full}px`,
        transform: `translateY(${full - visible}px)`,
      }"
    >
      <button
        ref="handleEl"
        class="handle"
        type="button"
        :aria-expanded="expanded"
        :aria-label="expanded ? '로그인 창 내리기' : '로그인 창 올리기'"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <span class="grip"></span>
      </button>

      <div ref="bodyEl" class="sheet-body">
        <div class="heading">
          <img class="brand" :src="walletLogoUrl" alt="" />
          <h1 class="welcome">티니머니에 오신 걸 환영해요</h1>
          <p class="subtitle">
            용돈을 충전하고 목표를 모아요.<br />
            로그인하고 자녀와 함께 시작해 보세요.
          </p>
        </div>

        <div class="form">
          <div class="field">
            <label class="eyebrow" for="email">이메일</label>
            <div class="input-wrap">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="이메일을 입력하세요"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field">
            <label class="eyebrow" for="password">비밀번호</label>
            <div class="input-wrap" :class="{ 'has-error': showPasswordHint }">
              <input
                id="password"
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
              <button
                class="toggle-password"
                type="button"
                :aria-label="
                  isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
                "
                @click="isPasswordVisible = !isPasswordVisible"
              >
                <svg
                  v-if="isPasswordVisible"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                  <path
                    d="M4 4l16 16"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            <p v-if="showPasswordHint" class="hint">
              <span class="hint-icon">!</span>
              비밀번호는 8자 이상 입력해주세요
            </p>
          </div>

          <button
            class="cta"
            type="button"
            :disabled="!canSubmit"
            @click="handleLogin"
          >
            로그인
          </button>

          <div class="links">
            <button class="link" type="button" @click="handleFindEmail">
              아이디 찾기
            </button>
            <span class="sep">|</span>
            <button class="link" type="button" @click="handleFindPassword">
              비밀번호 찾기
            </button>
            <span class="sep">|</span>
            <button
              class="link signup-link"
              type="button"
              @click="router.push('/signup')"
            >
              회원가입
            </button>
          </div>

          <div class="divider">
            <span class="line"></span>
            <span class="or">또는</span>
            <span class="line"></span>
          </div>

          <button class="google-btn" type="button" @click="handleGoogleLogin">
            <svg
              class="google-logo"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span class="google-text">Google로 로그인 하기</span>
          </button>
        </div>
      </div>
    </section>

    <p
      class="toast"
      :class="{ 'is-on': toastOn }"
      role="status"
      aria-live="polite"
    >
      {{ toastText }}
    </p>
  </main>

  <ConfirmModal
    :show="showLoginErrorModal"
    title="로그인에 실패했어요"
    :description="loginErrorMessage"
    confirm-text="확인"
    hide-cancel
    @confirm="closeLoginErrorModal"
    @cancel="closeLoginErrorModal"
  />
</template>

<style scoped>
.login-screen,
.login-screen * {
  box-sizing: border-box;
}

.login-screen {
  position: relative;
  width: 100%;
  max-width: 430px;
  height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: #fff8e8;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #191b1e;
}

/* 영상 무대. 시트가 올라온 만큼 height가 줄어든다. */
.stage {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: #fff1bd;
  transition: height 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 드래그 중과 최초 측정 시에는 애니메이션을 끈다. 손가락을 따라와야 하고,
   측정 직후의 높이 보정이 애니메이션으로 보이면 안 된다. */
.stage.is-static,
.login-sheet.is-static {
  transition: none;
}

.reel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* 아래로 1px 넘긴다. stage 높이가 애니메이션될 때 영상 레이어가 한 프레임
     늦게 따라오면서 바닥에 얇은 띠가 드러나는 것을 덮는다. stage가
     overflow: hidden이므로 넘친 부분은 보이지 않는다.
     height를 auto로 두면 안 된다 — video는 replaced element라서 고유 비율로
     높이가 정해지고 top/bottom inset이 무시된다. */
  height: calc(100% + 1px);
  object-fit: cover;
  opacity: 0;
  /* 프레임이 아직 없는 video는 크로미움이 검게 칠한다. 배경을 깔아두면
     load() 직후나 디코딩 전에도 무대 색이 보인다. */
  background: #fff1bd;
  transition: opacity 0.4s linear;
}

.reel.is-active {
  opacity: 1;
}

/* 로고는 영상 위 오버레이가 아니라 시트 안 머리말에 있다. 흰 배경 위라
   그림자가 필요 없다. */
.brand {
  /* logo.svg는 69×63 비율이다. 높이만 정하고 너비를 auto로 두어야 여백 없이
     원래 비율로 그려진다. 정사각형으로 고정하면 위아래에 빈 띠가 생긴다. */
  width: auto;
  height: 56px;
  object-fit: contain;
}

/* 시트. bottom에 붙여두고 translateY로 내려놓는다. 보이는 높이가 visible이고,
   stage의 height도 같은 값에서 나오므로 둘이 붙어서 움직인다. */
.login-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  border-radius: 28px 28px 0 0;
  background: #ffffff;
  box-shadow: 0 -10px 28px rgba(104, 75, 0, 0.14);
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.handle {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  padding: 0;
  border: 0;
  border-radius: 28px 28px 0 0;
  background: transparent;
  font-family: inherit;
  cursor: grab;
  touch-action: none;
}

.handle:active {
  cursor: grabbing;
}

.grip {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #e7e9ed;
}

.sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 24px max(28px, env(safe-area-inset-bottom));
  overscroll-behavior: contain;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 0;
  text-align: center;
}

.welcome {
  margin: 0;
  font-weight: 800;
  font-size: 22px;
  line-height: 1.3;
  letter-spacing: -0.6px;
}

.subtitle {
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.6;
  color: #8b9097;
}

.form {
  display: flex;
  flex-direction: column;
  /* 밑줄형은 박스형보다 경계가 약해서 필드 사이를 더 벌려야 구분이 된다. */
  gap: 18px;
  width: 100%;
  padding-top: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-weight: 600;
  font-size: 12.2px;
  line-height: 15px;
  letter-spacing: -0.13px;
  color: #8b9097;
}

/* 밑줄형 입력. 채워진 박스 대신 아래 선 하나만 둔다.
   box-shadow로 두께를 더하는 이유는, border-width를 바꾸면 포커스 순간
   높이가 1px 튀기 때문이다. */
.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 2px;
  border: 0;
  border-bottom: 1px solid #e7e9ed;
  border-radius: 0;
  background: transparent;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrap:focus-within {
  border-bottom-color: #ffbc00;
  box-shadow: 0 1px 0 0 #ffbc00;
}

.input-wrap.has-error {
  border-bottom-color: #e5484d;
  box-shadow: 0 1px 0 0 #e5484d;
}

.input-wrap input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  font-family: inherit;
  font-weight: 500;
  /* 16px 미만이면 iOS 사파리가 포커스할 때 화면을 확대한다. 로그인은 반드시
     타이핑하는 화면이라 그 확대가 매번 일어난다. */
  font-size: 16px;
  line-height: 1.5;
  color: #191b1e;
  background: transparent;
}

.toggle-password {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #b9bec5;
  cursor: pointer;
}

.input-wrap input::placeholder {
  color: #8b9097;
}

/* 비밀번호 경고 문구 (아이콘 + 빨간 글씨) */
.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #e5484d;
}

.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e5484d;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  flex: none;
}

.cta {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 54px;
  margin-top: 2px;
  padding: 16px;
  background: #ffbc00;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.145px;
  color: #191b1e;
  cursor: pointer;
}

.cta:hover {
  filter: brightness(0.97);
}

/* 비활성화 상태: 회색 + 클릭 불가 */
.cta:disabled {
  background: #ecedf0;
  color: #b9bec5;
  cursor: not-allowed;
  filter: none;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
  padding-top: 2px;
}

.link {
  padding: 4px 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-weight: 600;
  font-size: 12.5px;
  line-height: 15px;
  color: #8b9097;
  cursor: pointer;
}

.signup-link {
  font-weight: 700;
  color: #b27e00;
}

.sep {
  font-weight: 400;
  font-size: 11px;
  color: #b9bec5;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.divider .line {
  flex: 1;
  height: 1px;
  background: #f0f1f3;
}

.divider .or {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
}

.google-btn {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 14px;
  cursor: pointer;
}

.google-btn:hover {
  background: #fafbfc;
}

.google-logo {
  width: 19px;
  height: 19px;
  flex: none;
}

.google-text {
  font-weight: 500;
  font-size: 14.4px;
  line-height: 17px;
  color: #191b1e;
}

/* 잠깐 떴다 사라지는 안내. 시트 위에 겹쳐 뜨므로 시트가 접혀 있든 펼쳐져
   있든 같은 자리에 보인다. pointer-events를 꺼서 아래 버튼을 가리지 않는다. */
.toast {
  position: absolute;
  left: 50%;
  bottom: max(26px, env(safe-area-inset-bottom));
  z-index: 3;
  max-width: calc(100% - 24px);
  margin: 0;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(25, 27, 30, 0.92);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  color: #ffffff;
  font-weight: 600;
  font-size: 12.5px;
  line-height: 1.4;
  letter-spacing: -0.3px;
  text-align: center;
  /* 한 줄로 유지한다. 두 줄이 되면 알약 모양이 무너져 보인다.
     문구가 길어져 폭을 넘으면 줄바꿈 대신 말줄임으로 처리한다. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 8px);
  /* 꺼져 있을 때는 접근성 트리에서도 빠지도록 가시성까지 함께 끈다.
     opacity만 0으로 두면 빈 문단이 계속 읽힌다. */
  visibility: hidden;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    visibility 0s linear 0.25s;
}

.toast.is-on {
  opacity: 1;
  transform: translateX(-50%);
  visibility: visible;
  transition-delay: 0s, 0s, 0s;
}

@media (prefers-reduced-motion: reduce) {
  .stage,
  .login-sheet,
  .reel,
  .toast {
    transition: none;
  }
}

@media (max-height: 700px) {
  .welcome {
    font-size: 23px;
  }
}
</style>
