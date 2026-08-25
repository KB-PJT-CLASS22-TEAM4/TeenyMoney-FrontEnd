<template>
  <main
    v-if="config"
    class="onboarding"
    :class="{
      'is-child': config.role === 'CHILD',
      'has-screen-preview': isExpanded,
    }"
  >
    <section class="visual-stage">
      <div class="scene" aria-hidden="true">
        <img :src="sceneImage" alt="" />
      </div>

      <header class="progress" :aria-label="`시작하기 ${stageNumber}단계`">
        <template v-for="step in 4" :key="step">
          <span class="progress-step">
            <span
              class="progress-node"
              :class="{ current: step === stageNumber }"
            >
              {{ step === stageNumber ? step : '' }}
            </span>
            <span
              v-if="step === stageNumber && step < 4"
              class="progress-line"
            ></span>
          </span>
        </template>
      </header>

      <section class="hero">
        <h1>{{ screenContent.title }}</h1>
        <p>{{ screenContent.description }}</p>
      </section>
    </section>

    <section
      id="onboarding-feature-preview"
      class="feature-preview"
      :class="{ 'is-visible': isExpanded }"
      :aria-hidden="!isExpanded"
      :inert="!isExpanded"
    >
      <header class="preview-header">
        <div class="action-icon">
          <img class="feature-icon" :src="featureIcon" alt="" />
        </div>
        <div class="action-copy">
          <span>{{ screenContent.cardLabel }}</span>
          <strong>{{ screenContent.cardTitle }}</strong>
        </div>
      </header>
      <div
        class="phone-shell"
        :style="{
          '--screen-ratio': `${preview.screenSize.width} / ${preview.screenSize.height}`,
        }"
      >
        <span class="phone-speaker" aria-hidden="true"></span>
        <div class="phone-screen">
          <img :src="previewScreen" :alt="preview.screenAlt" />
          <svg
            class="screen-dimmer"
            :viewBox="`0 0 ${preview.screenSize.width} ${preview.screenSize.height}`"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <mask
                id="onboarding-focus-mask"
                x="0"
                y="0"
                :width="preview.screenSize.width"
                :height="preview.screenSize.height"
                maskUnits="userSpaceOnUse"
              >
                <rect
                  :width="preview.screenSize.width"
                  :height="preview.screenSize.height"
                  fill="#fff"
                />
                <rect
                  v-for="region in focusRegions"
                  :key="region.title"
                  :x="region.maskX"
                  :y="region.maskY"
                  :width="region.maskWidth"
                  :height="region.maskHeight"
                  :rx="region.maskRadius"
                  :ry="region.maskRadius"
                  fill="#000"
                />
              </mask>
            </defs>
            <rect
              :width="preview.screenSize.width"
              :height="preview.screenSize.height"
              fill="rgba(18, 24, 31, 0.48)"
              mask="url(#onboarding-focus-mask)"
            />
          </svg>
          <span
            v-for="region in focusRegions"
            :key="region.title"
            class="screen-focus"
            :class="{ 'screen-callout': region.isCallout }"
            :style="{
              top: `${region.top}%`,
              left: `${region.left}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
            }"
            aria-hidden="true"
          >
            <span>{{ region.title }}</span>
          </span>
        </div>
      </div>
      <p class="preview-caption">{{ preview.caption }}</p>
    </section>

    <footer class="footer">
      <button
        class="primary"
        type="button"
        :disabled="isTransitioning"
        @click="handlePrimary"
      >
        {{ screenContent.primaryLabel }}
      </button>
      <button
        v-if="screenContent.skipLabel"
        class="skip"
        type="button"
        :disabled="isTransitioning"
        @click="handleSkip"
      >
        {{ screenContent.skipLabel }}
      </button>
    </footer>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import childScene from '@/assets/onboarding/child-scene.webp';
import parentScene from '@/assets/onboarding/parent-scene.webp';
import childFinanceScreen from '@/assets/onboarding/screens/child-finance.png';
import childLinkScreen from '@/assets/onboarding/screens/child-link.png';
import childQuestScreen from '@/assets/onboarding/screens/child-quest.png';
import childWalletScreen from '@/assets/onboarding/screens/child-wallet.png';
import parentFinanceScreen from '@/assets/onboarding/screens/parent-finance.png';
import parentLinkScreen from '@/assets/onboarding/screens/parent-link.png';
import parentQuestScreen from '@/assets/onboarding/screens/parent-quest.png';
import parentWalletScreen from '@/assets/onboarding/screens/parent-wallet.png';
import linkIcon from '@/assets/icons/icon-link.svg';
import questIcon from '@/assets/icons/icon-quest.svg';
import walletIcon from '@/assets/icons/icon-wallet.svg';
import walletLogo from '@/assets/logo.svg';
import allowanceCardScene from '@/assets/video-concepts/03-allowance-card.webp';
import goalStarScene from '@/assets/video-concepts/02-goal-star-sticker.webp';
import phoneAllowanceScene from '@/assets/video-concepts/04-phone-allowance.webp';
import piggyBankScene from '@/assets/video-concepts/01-piggy-bank-coin.webp';
import { useAuthStore } from '@/stores/auth';
import {
  getFeatureOnboardingSeenKey,
  getFeatureOnboardingSlides,
  getOnboardingFocusRegions,
  getOnboardingConfig,
  ONBOARDING_PENDING_MEMBER_KEY,
  scheduleOnboardingPreview,
  scheduleOnboardingPreviewSwap,
  shouldShowFeatureOnboarding,
} from '@/utils/onboarding';

const router = useRouter();
const authStore = useAuthStore();
const currentSlideIndex = ref(0);
const showFeatureIntro = ref(false);
const isExpanded = ref(false);
const isTransitioning = ref(false);
let autoExpandTimer = null;
let previewSwapTimer = null;

const featureSceneImages = {
  'allowance-card': allowanceCardScene,
  'goal-star': goalStarScene,
  'phone-allowance': phoneAllowanceScene,
  'piggy-bank': piggyBankScene,
};

const config = computed(() => getOnboardingConfig(authStore.role));
const featureSlides = computed(
  () => getFeatureOnboardingSlides(authStore.role) || [],
);
const currentSlide = computed(
  () => featureSlides.value[currentSlideIndex.value],
);
const isLastFeatureSlide = computed(
  () => currentSlideIndex.value === featureSlides.value.length - 1,
);
const stageNumber = computed(() =>
  showFeatureIntro.value ? currentSlideIndex.value + 1 : 4,
);
const sceneImage = computed(() => {
  if (showFeatureIntro.value && currentSlide.value) {
    return featureSceneImages[currentSlide.value.scene];
  }
  return config.value?.role === 'CHILD' ? childScene : parentScene;
});
const screenContent = computed(() => {
  if (!showFeatureIntro.value) {
    return config.value;
  }

  return {
    title: currentSlide.value.title,
    description: currentSlide.value.description,
    cardLabel: currentSlide.value.eyebrow,
    cardTitle: currentSlide.value.sheetTitle,
    primaryLabel: '다음',
    preview: currentSlide.value.preview,
  };
});
const preview = computed(() => screenContent.value.preview);
const focusRegions = computed(() => getOnboardingFocusRegions(preview.value));
const previewIcons = {
  wallet: walletLogo,
  finance: walletIcon,
  quest: questIcon,
  link: linkIcon,
};
const featureIcon = computed(() => previewIcons[preview.value.kind] || walletIcon);
const previewScreens = {
  'parent-wallet': parentWalletScreen,
  'parent-finance': parentFinanceScreen,
  'parent-quest': parentQuestScreen,
  'parent-link': parentLinkScreen,
  'child-wallet': childWalletScreen,
  'child-finance': childFinanceScreen,
  'child-quest': childQuestScreen,
  'child-link': childLinkScreen,
};
const previewScreen = computed(() => previewScreens[preview.value.screen]);

function cancelAutoExpand() {
  if (autoExpandTimer == null) return;
  clearTimeout(autoExpandTimer);
  autoExpandTimer = null;
}

function cancelPreviewSwap() {
  if (previewSwapTimer == null) return;
  clearTimeout(previewSwapTimer);
  previewSwapTimer = null;
}

function startAutoExpand() {
  cancelAutoExpand();
  autoExpandTimer = scheduleOnboardingPreview(() => {
    isExpanded.value = true;
    isTransitioning.value = false;
    autoExpandTimer = null;
  });
}

function transitionPreview(swapContent) {
  cancelPreviewSwap();
  isTransitioning.value = true;
  isExpanded.value = false;
  startAutoExpand();
  previewSwapTimer = scheduleOnboardingPreviewSwap(() => {
    swapContent();
    previewSwapTimer = null;
  });
}

function finishFeatureIntro() {
  transitionPreview(() => {
    if (authStore.memberId != null) {
      localStorage.setItem(
        getFeatureOnboardingSeenKey(authStore.memberId),
        'true',
      );
    }
    showFeatureIntro.value = false;
  });
}

function nextFeatureSlide() {
  if (isLastFeatureSlide.value) {
    finishFeatureIntro();
    return;
  }
  transitionPreview(() => {
    currentSlideIndex.value += 1;
  });
}

function leaveOnboarding(routeName) {
  localStorage.removeItem(ONBOARDING_PENDING_MEMBER_KEY);
  router.push({ name: routeName });
}

function handlePrimary() {
  if (isTransitioning.value) return;
  cancelAutoExpand();
  if (showFeatureIntro.value) {
    nextFeatureSlide();
    return;
  }
  leaveOnboarding(config.value.primaryRoute);
}

function handleSkip() {
  if (isTransitioning.value || !config.value?.skipRoute) return;
  cancelAutoExpand();
  leaveOnboarding(config.value.skipRoute);
}

onMounted(() => {
  if (!config.value) {
    router.replace({ name: 'login' });
    return;
  }

  const seenValue =
    authStore.memberId == null
      ? null
      : localStorage.getItem(getFeatureOnboardingSeenKey(authStore.memberId));
  showFeatureIntro.value = shouldShowFeatureOnboarding(seenValue);
  startAutoExpand();
});

onBeforeUnmount(() => {
  cancelAutoExpand();
  cancelPreviewSwap();
});
</script>

<style scoped>
.onboarding {
  --accent: #67bf8f;
  --accent-soft: rgba(103, 191, 143, 0.22);
  --accent-line: rgba(103, 191, 143, 0.34);
  --accent-deep: #d99a00;
  --page-bg: #effbf5;
  position: relative;
  display: flex;
  width: 100%;
  max-width: 430px;
  height: 100dvh;
  margin: 0 auto;
  padding-top: 0;
  overflow: hidden;
  flex-direction: column;
  background: #fff;
  color: #191b1e;
}

.onboarding.is-child {
  --accent: #579be9;
  --accent-soft: rgba(87, 155, 233, 0.22);
  --accent-line: rgba(87, 155, 233, 0.34);
  --page-bg: #eaf7ff;
}

.visual-stage {
  position: absolute;
  inset: 0;
  min-height: 0;
  padding-top: calc(24px + var(--safe-area-top));
  overflow: hidden;
  background: var(--page-bg);
}

.has-screen-preview .scene {
  filter: brightness(0.78);
}

.progress {
  position: relative;
  z-index: 2;
  display: flex;
  height: 28px;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.progress-step {
  position: relative;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
}

.progress-node {
  display: grid;
  width: 9px;
  height: 9px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: transparent;
  font-size: 12px;
  font-weight: 800;
}

.progress-node.current {
  position: relative;
  z-index: 1;
  width: 26px;
  height: 26px;
  background: var(--accent);
  color: #fff;
}

.progress-line {
  position: absolute;
  top: 12px;
  left: 22px;
  width: 18px;
  height: 2px;
  background: var(--accent-line);
}

.hero {
  position: relative;
  z-index: 2;
  padding: 22px 24px 16px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 10px;
  font-size: clamp(27px, 7.4vw, 32px);
  font-weight: 850;
  line-height: 1.22;
  letter-spacing: -1.45px;
  white-space: pre-line;
}

.hero p {
  margin: 0;
  color: #707983;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.3px;
  white-space: pre-line;
}

.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--page-bg);
  transition: filter 0.32s ease;
}

.scene img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.preview-header {
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0 0 12px;
  align-items: center;
  gap: 13px;
  text-align: left;
}

.action-icon {
  display: grid;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #ecf8f0;
  color: #51ad79;
}

.is-child .action-icon {
  background: #eef5ff;
  color: #4f96e5;
}

.feature-icon {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

.action-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
}

.action-copy span {
  color: var(--accent-deep);
  font-size: 10px;
  font-weight: 800;
}

.action-copy strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-preview {
  position: absolute;
  top: clamp(155px, 22dvh, 205px);
  left: 50%;
  z-index: 3;
  display: flex;
  visibility: hidden;
  width: min(calc(100% - 40px), 350px);
  height: min(64dvh, 600px);
  min-height: 0;
  padding: 18px 16px 14px;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(226, 231, 235, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 48px rgba(25, 35, 45, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 20px);
  transition:
    visibility 0.36s ease,
    opacity 0.28s ease,
    transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.feature-preview.is-visible {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.phone-shell {
  position: relative;
  height: 100%;
  max-height: 535px;
  aspect-ratio: var(--screen-ratio);
  padding: 8px 5px 5px;
  overflow: hidden;
  flex: 1 1 auto;
  border: 2px solid #22272e;
  border-radius: 30px;
  background: #15191e;
  box-shadow: 0 15px 32px rgba(31, 41, 55, 0.2);
}

.phone-speaker {
  position: absolute;
  top: 4px;
  left: 50%;
  z-index: 3;
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: #4b5159;
  transform: translateX(-50%);
}

.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 22px;
  background: #f6f8fa;
}

.phone-screen > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.screen-dimmer {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.screen-focus {
  position: absolute;
  z-index: 2;
  border: 2px solid var(--accent);
  border-radius: 12px;
  pointer-events: none;
}

.screen-focus > span {
  position: absolute;
  top: -29px;
  left: 50%;
  width: max-content;
  max-width: 205px;
  padding: 5px 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 4px 12px rgba(25, 31, 38, 0.2);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;
}

.screen-callout {
  z-index: 3;
  border-radius: 18px;
}

.preview-caption {
  flex: none;
  margin: 10px 12px 0;
  color: #59616a;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.5;
  text-align: center;
}
.footer {
  position: absolute;
  right: 18px;
  bottom: max(16px, var(--safe-area-bottom));
  left: 18px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}
button {
  border: 0;
  cursor: pointer;
}

.primary {
  width: 100%;
  height: 54px;
  border-radius: 13px;
  background: linear-gradient(135deg, #ffca24, #ffb800);
  box-shadow: 0 9px 22px rgba(255, 184, 0, 0.2);
  color: #191b1e;
  font-size: 15px;
  font-weight: 800;
}

.primary:active {
  transform: translateY(1px);
}

.primary:disabled {
  cursor: default;
  pointer-events: none;
}

.skip {
  height: 36px;
  background: transparent;
  color: #8b939c;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.2px;
}

.skip:active {
  color: #59616a;
}

.skip:disabled {
  cursor: default;
  pointer-events: none;
}

@media (max-height: 700px) {
  .hero {
    padding: 12px 22px 10px;
  }
  .hero h1 {
    margin-bottom: 6px;
    font-size: 23px;
  }
  .hero p {
    font-size: 12px;
  }
  .feature-preview {
    top: 160px;
    width: min(calc(100% - 48px), 310px);
    height: min(57dvh, 400px);
    padding: 14px 13px 11px;
  }
  .preview-header {
    height: 40px;
    padding: 0 0 9px;
    gap: 10px;
  }
  .preview-header .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 13px;
  }
  .preview-header .action-copy strong {
    font-size: 14px;
  }
  .primary {
    height: 48px;
  }
  .preview-caption {
    margin-top: 7px;
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scene,
  .feature-preview {
    transition: none;
  }
}
</style>
