<template>
  <div class="page">
    <header class="nav">
      <button
        class="back-btn"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <img
          src="@/assets/icons/icon-back.svg"
          alt=""
          class="back-icon"
        />
      </button>
      <h1 class="nav-title">FAQ</h1>
      <ParentNavActions v-if="isParent" />
      <ChildNavActions v-else />
    </header>

    <div class="content">
      <section
        v-for="section in sections"
        :key="section.id"
        class="faq-section"
      >
        <h2 class="section-title">{{ section.title }}</h2>

        <div class="faq-list">
          <article
            v-for="item in section.items"
            :key="item.id"
            class="faq-item"
          >
            <button
              class="faq-question"
              type="button"
              :aria-expanded="isOpen(item.id)"
              @click="toggle(item.id)"
            >
              <span>{{ item.q }}</span>
              <span
                class="faq-chevron"
                :class="{ open: isOpen(item.id) }"
              >
                ›
              </span>
            </button>
            <p
              v-show="isOpen(item.id)"
              class="faq-answer"
            >
              {{ item.a }}
            </p>
          </article>
        </div>
      </section>

      <section class="contact-section">
        <h2 class="section-title">1 : 1 문의하기</h2>
        <a
          class="contact-card"
          :href="contactUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="contact-text">
            <p class="contact-title">1 : 1 문의하기</p>
            <p class="contact-url">{{ contactUrl }}</p>
          </div>
          <span class="faq-chevron">›</span>
        </a>
      </section>
    </div>

    <ParentBottomNav
      v-if="isParent"
      active="mypage"
    />
    <BottomTabBar
      v-else
      active="my"
      @select="onChildTabSelect"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ParentNavActions from '@/components/Parents/ParentNavActions.vue'
import ParentBottomNav from '@/components/Parents/BottomNav.vue'
import ChildNavActions from '@/components/Child/ChildNavActions.vue'
import BottomTabBar from '@/components/Child/BottomTabBar.vue'

const router = useRouter()
const route = useRoute()

const isParent = computed(() => route.path.startsWith('/parents'))
const contactUrl = 'https://form.naver.com/response/CYoku9Mj2yd'
const openIds = ref([])

const sections = [
  {
    id: 'parent',
    title: '보호자',
    items: [
      {
        id: 'p-link',
        q: '자녀는 어떻게 연동하나요?',
        a: '마이페이지 또는 메뉴의 자녀 연동에서 연동 코드를 만든 뒤, 자녀가 앱에서 코드를 입력하면 연결됩니다.',
      },
      {
        id: 'p-send',
        q: '용돈은 어떻게 보내나요?',
        a: '홈의 용돈 지급 또는 용돈 보내기 화면에서 자녀와 금액을 선택한 뒤 보내면 자녀 지갑으로 바로 들어갑니다.',
      },
      {
        id: 'p-regular',
        q: '정기용돈은 무엇인가요?',
        a: '설정한 주기마다 자녀에게 용돈이 자동으로 보내지는 기능입니다. 용돈 보내기 화면의 정기용돈 설정에서 켜고 끌 수 있습니다.',
      },
      {
        id: 'p-charge',
        q: '지갑 충전은 어떻게 하나요?',
        a: '홈의 충전에서 금액과 카드를 고른 뒤 결제 비밀번호를 입력하면 보호자 지갑에 충전됩니다. 카드는 결제수단에서 등록할 수 있습니다.',
      },
      {
        id: 'p-pin',
        q: '결제 비밀번호는 왜 필요한가요?',
        a: '충전과 자녀 결제에 쓰이는 6자리 비밀번호입니다. 마이페이지의 결제 비밀번호 설정에서 처음 한 번 등록하면 됩니다.',
      },
      {
        id: 'p-allow',
        q: '오늘만 허용 요청은 어디서 확인하나요?',
        a: '알림 또는 유해업소 설정(카테고리) 화면의 승인 요청 내역에서 확인하고 승인·거절할 수 있습니다.',
      },
      {
        id: 'p-harmful',
        q: '유해업소 설정은 무엇인가요?',
        a: '자녀가 결제할 수 있는 업종을 허용·주의·차단으로 나누는 기능입니다. 차단·주의 업종은 오늘만 허용을 승인하면 그날만 결제할 수 있습니다.',
      },
      {
        id: 'p-quest',
        q: '퀘스트는 어떻게 만들고 보상하나요?',
        a: '퀘스트 만들기에서 미션과 보상 금액을 정하면 자녀에게 전달됩니다. 자녀가 인증하면 알림이 오고, 승인하면 보상이 지급됩니다.',
      },
      {
        id: 'p-finance',
        q: '자녀가 금융상품 가입을 요청하면 어떻게 하나요?',
        a: '알림 또는 자녀 금융상품 화면에서 가입 신청을 확인할 수 있습니다. 내용을 본 뒤 승인하거나 거절하면 됩니다.',
      },
      {
        id: 'p-score',
        q: '티니점수는 무엇인가요?',
        a: '자녀의 금융 습관을 점수와 등급으로 보여주는 지표입니다. 퀘스트 수행, 저축, 건전한 소비 등에 따라 오르거나 내릴 수 있습니다.',
      },
    ],
  },
  {
    id: 'child',
    title: '자녀',
    items: [
      {
        id: 'c-allow',
        q: '오늘만 허용은 무엇인가요?',
        a: '부모님이 주의 또는 차단으로 둔 업종을 오늘 하루만 결제할 수 있게 요청하는 기능입니다. 하루에 한 번만 보낼 수 있고, 부모님이 승인해야 적용됩니다.',
      },
      {
        id: 'c-pay',
        q: '가게에서 어떻게 결제하나요?',
        a: '홈에서 QR 결제 또는 QR 스캔으로 가게 정보를 확인한 뒤, 결제 비밀번호 6자리를 입력하면 자녀 지갑에서 결제됩니다.',
      },
      {
        id: 'c-block',
        q: '차단된 업종에서 결제하고 싶어요.',
        a: '오늘만 허용으로 해당 업종을 요청해 보세요. 부모님이 승인하면 오늘 하루만 그 업종에서 결제할 수 있습니다.',
      },
      {
        id: 'c-quest',
        q: '퀘스트는 어떻게 인증하나요?',
        a: '퀘스트 목록에서 받은 미션을 고르고 인증을 올리면 부모님에게 요청이 갑니다. 승인되면 보상 용돈이 지갑에 들어옵니다.',
      },
      {
        id: 'c-finance',
        q: '예금·적금·대출은 어떻게 가입하나요?',
        a: '금융상품에서 원하는 상품을 고르고 가입을 신청하면 부모님 승인을 기다립니다. 승인되면 내 상품에서 확인할 수 있습니다.',
      },
      {
        id: 'c-allowance',
        q: '용돈이 안 들어왔어요.',
        a: '부모님이 용돈을 보내거나 정기용돈이 지급되면 지갑 잔액과 거래내역에 표시됩니다. 퀘스트 보상은 부모님이 인증을 승인한 뒤에 들어옵니다.',
      },
      {
        id: 'c-pin',
        q: '결제 비밀번호를 잊어버렸어요.',
        a: '결제 비밀번호는 보호자가 설정한 6자리입니다. 부모님께 여쭤보거나, 보호자 마이페이지의 결제 비밀번호 설정에서 다시 안내받을 수 있습니다.',
      },
      {
        id: 'c-link',
        q: '부모님과는 어떻게 연동하나요?',
        a: '부모님이 만든 연동 코드를 자녀 앱의 연동 화면에 입력하면 연결됩니다. 연동되면 용돈, 퀘스트, 오늘만 허용을 함께 쓸 수 있습니다.',
      },
    ],
  },
]

function isOpen(id) {
  return openIds.value.includes(id)
}

function toggle(id) {
  if (isOpen(id)) {
    openIds.value = openIds.value.filter((item) => item !== id)
    return
  }
  openIds.value = [...openIds.value, id]
}

function onChildTabSelect(key) {
  if (key === 'home') router.push({ name: 'child-home' })
  if (key === 'my') router.push({ name: 'child-mypage' })
  if (key === 'q') router.push({ name: 'qr-scan' })
  if (key === 'finance') router.push({ name: 'child-finance-myproducts' })
  if (key === 'quest') router.push({ name: 'child-quest-list' })
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #f8fafc;
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f1f3;
  background: #ffffff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.nav-title {
  position: absolute;
  left: 50%;
  margin: 0;
  color: #191b1e;
  font-size: 16px;
  font-weight: 700;
  transform: translateX(-50%);
}

.content {
  flex: 1;
  padding: 16px 16px 90px;
}

.faq-section,
.contact-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 10px 4px;
  color: #8b9097;
  font-size: 14px;
  font-weight: 700;
}

.faq-list,
.contact-card {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
}

.faq-item + .faq-item {
  border-top: 1px solid #f0f1f3;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  padding: 14px 16px;
  border: none;
  background: #ffffff;
  color: #191b1e;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.faq-chevron {
  flex-shrink: 0;
  color: #b9bec5;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transform: rotate(90deg);
  transition: transform 0.15s ease;
}

.faq-chevron.open {
  transform: rotate(-90deg);
}

.faq-answer {
  margin: 0;
  padding: 0 16px 14px;
  color: #4a4e55;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
}

.contact-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
}

.contact-title {
  margin: 0 0 4px;
  color: #191b1e;
  font-size: 15px;
  font-weight: 800;
}

.contact-url {
  margin: 0;
  overflow: hidden;
  color: #3178c6;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-card .faq-chevron {
  transform: none;
}
</style>
