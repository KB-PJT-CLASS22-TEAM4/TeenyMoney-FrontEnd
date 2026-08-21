<template>
  <main
    v-if="config"
    class="onboarding"
    :class="{ 'is-child': config.role === 'CHILD' }"
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

    <section class="bottom-sheet">
      <div class="action-card">
        <div class="action-icon">
          <span v-if="showFeatureIntro" class="feature-symbol">
            {{ featureSymbol }}
          </span>
          <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M8 8.5h8M8 12h8M8 15.5h5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <rect
              x="4"
              y="3.5"
              width="16"
              height="17"
              rx="4"
              stroke="currentColor"
              stroke-width="1.8"
            />
          </svg>
        </div>
        <div class="action-copy">
          <span>{{ screenContent.cardLabel }}</span>
          <strong>{{ screenContent.cardTitle }}</strong>
          <p>{{ screenContent.cardDescription }}</p>
        </div>
        <span class="chevron" aria-hidden="true">›</span>
      </div>

      <footer class="footer">
        <button class="primary" type="button" @click="handlePrimary">
          {{ screenContent.primaryLabel }}
        </button>
        <button class="skip" type="button" @click="handleSecondary">
          {{ showFeatureIntro ? '건너뛰기' : '나중에 하기' }}
        </button>
      </footer>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import childScene from '@/assets/onboarding/child-scene.webp';
import parentScene from '@/assets/onboarding/parent-scene.webp';
import allowanceCardScene from '@/assets/video-concepts/03-allowance-card.webp';
import goalStarScene from '@/assets/video-concepts/02-goal-star-sticker.webp';
import phoneAllowanceScene from '@/assets/video-concepts/04-phone-allowance.webp';
import piggyBankScene from '@/assets/video-concepts/01-piggy-bank-coin.webp';
import { useAuthStore } from '@/stores/auth';
import {
  getFeatureOnboardingSeenKey,
  getFeatureOnboardingSlides,
  getOnboardingConfig,
  ONBOARDING_PENDING_MEMBER_KEY,
  shouldShowFeatureOnboarding,
} from '@/utils/onboarding';

const router = useRouter();
const authStore = useAuthStore();
const currentSlideIndex = ref(0);
const showFeatureIntro = ref(false);

const featureSceneImages = {
  'allowance-card': allowanceCardScene,
  'goal-star': goalStarScene,
  'phone-allowance': phoneAllowanceScene,
  'piggy-bank': piggyBankScene,
};

const featureSymbols = {
  'allowance-card': '₩',
  'goal-star': '★',
  'phone-allowance': '₩',
  'piggy-bank': '●',
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
const featureSymbol = computed(
  () => featureSymbols[currentSlide.value?.scene] || '•',
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
    cardDescription: currentSlide.value.sheetDescription,
    primaryLabel: '다음',
  };
});

function finishFeatureIntro() {
  if (authStore.memberId != null) {
    localStorage.setItem(
      getFeatureOnboardingSeenKey(authStore.memberId),
      'true',
    );
  }
  showFeatureIntro.value = false;
}

function nextFeatureSlide() {
  if (isLastFeatureSlide.value) {
    finishFeatureIntro();
    return;
  }
  currentSlideIndex.value += 1;
}

function goPrimary() {
  localStorage.removeItem(ONBOARDING_PENDING_MEMBER_KEY);
  router.push({ name: config.value.primaryRoute });
}

function skip() {
  localStorage.removeItem(ONBOARDING_PENDING_MEMBER_KEY);
  router.push({ name: config.value.skipRoute });
}

function handlePrimary() {
  if (showFeatureIntro.value) {
    nextFeatureSlide();
    return;
  }
  goPrimary();
}

function handleSecondary() {
  if (showFeatureIntro.value) {
    finishFeatureIntro();
    return;
  }
  skip();
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
  padding-top: max(24px, env(safe-area-inset-top));
  overflow: hidden;
  background: var(--page-bg);
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
}

.scene img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.bottom-sheet {
  position: absolute;
  right: 12px;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 12px;
  z-index: 2;
  width: auto;
  margin: 0;
  padding: 18px 18px 12px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 30px rgba(41, 62, 51, 0.12);
}

.action-card {
  display: flex;
  width: 100%;
  padding: 2px 0 16px;
  align-items: center;
  gap: 13px;
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

.action-icon svg {
  width: 24px;
  height: 24px;
}

.feature-symbol {
  font-size: 20px;
  font-weight: 900;
}

.action-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
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

.action-copy p {
  overflow: hidden;
  margin: 0;
  color: #9ba0a8;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: #c4c8ce;
  font-size: 27px;
  font-weight: 300;
}
.footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.skip {
  align-self: center;
  padding: 8px 16px;
  background: transparent;
  color: #8f969f;
  font-size: 13px;
  font-weight: 600;
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
  .bottom-sheet {
    padding-top: 13px;
  }
  .action-card {
    padding-bottom: 10px;
  }
  .primary {
    height: 48px;
  }
}
</style>
