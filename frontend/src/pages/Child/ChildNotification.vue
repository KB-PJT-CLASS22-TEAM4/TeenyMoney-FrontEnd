<template>
  <div class="noti-screen">
<!-- 상단 네비 -->
<div class="nav">
  <div class="nav-left">
    <button class="back-btn" @click="goBack">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="#15171b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <h1 class="nav-title">알림</h1>
  </div>
  <span class="mark-read" @click="markAllRead">모두 읽음</span>
</div>

    <div class="scroll">
      <!-- 날짜 그룹 -->
      <div v-for="group in groupedList" :key="group.date" class="group">
        <p class="date-label">{{ group.date }}</p>

        <div
          v-for="n in group.items"
          :key="n.id"
          class="noti-item"
          @click="readOne(n.id)"
        >
          <div class="icon-circle">
            <span v-html="n.icon"></span>
          </div>
          <div class="noti-text">
            <b class="noti-title">{{ n.title }}</b>
            <span class="noti-detail">{{ n.detail }}</span>
          </div>
          <span class="noti-time">{{ n.time }}</span>
          <span v-if="!n.read" class="unread-dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import { useRouter } from 'vue-router';
const router = useRouter();

function goBack() {
  router.back();
}

// ==== API 연동 필요 (지금은 더미 데이터) ====
// [API] 알림 목록 조회
const notifications = ref([
  { id: 1, group: '오늘 · 7월 30일', title: '용돈이 입금되었어요', detail: '정기 용돈', time: '방금', read: false,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="8" width="18" height="13" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 12h18M12 8v13" stroke="#8b9097" stroke-width="1.6"/><path d="M12 8s-1-4-4-4-2 4 4 4zM12 8s1-4 4-4 2 4-4 4z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/></svg>` },
  { id: 2, group: '오늘 · 7월 30일', title: '목표저축을 달성했어요', detail: '자전거 사기', time: '2시간 전', read: false,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="8" stroke="#8b9097" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="#8b9097" stroke-width="1.6"/><circle cx="12" cy="12" r="1" fill="#8b9097"/></svg>` },
  { id: 3, group: '오늘 · 7월 30일', title: 'GS25에서 결제했어요', detail: '-3,200원 · 편의점', time: '오후 9:17', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 10h18" stroke="#8b9097" stroke-width="1.6"/></svg>` },
  { id: 4, group: '오늘 · 7월 30일', title: '교통카드를 충전했어요', detail: '-10,000원 · 교통', time: '오후 4:07', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M8 19l-1 2M16 19l1 2" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round"/></svg>` },
  { id: 5, group: '어제 · 7월 29일', title: '퀘스트가 승인되었어요', detail: '방 청소하기', time: '어제', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#8b9097" stroke-width="1.6"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: 6, group: '어제 · 7월 29일', title: '적금이 만기되었어요', detail: '티니 첫걸음 적금', time: '어제', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#8b9097" stroke-width="1.6"/></svg>` },
  { id: 7, group: '어제 · 7월 29일', title: '새로운 금융상품이 나왔어요', detail: '티니 스타 예금 확인하기', time: '어제', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round"/></svg>` },
  { id: 8, group: '어제 · 7월 29일', title: '퀘스트가 새로 등록되었어요', detail: '설거지 돕기', time: '어제', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 4h11l3 3v13H5z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 10h8M8 14h5" stroke="#8b9097" stroke-width="1.6" stroke-linecap="round"/></svg>` },
  { id: 9, group: '7월 28일', title: '용돈이 입금되었어요', detail: '심부름 보상', time: '2일 전', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="8" width="18" height="13" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 12h18M12 8v13" stroke="#8b9097" stroke-width="1.6"/><path d="M12 8s-1-4-4-4-2 4 4 4zM12 8s1-4 4-4 2 4-4 4z" stroke="#8b9097" stroke-width="1.6" stroke-linejoin="round"/></svg>` },
  { id: 10, group: '7월 28일', title: 'CU에서 결제했어요', detail: '-1,500원 · 편의점', time: '2일 전', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#8b9097" stroke-width="1.6"/><path d="M3 10h18" stroke="#8b9097" stroke-width="1.6"/></svg>` },
  { id: 11, group: '7월 28일', title: '목표저축에 돈을 넣었어요', detail: '자전거 사기 · +5,000원', time: '2일 전', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="8" stroke="#8b9097" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="#8b9097" stroke-width="1.6"/><circle cx="12" cy="12" r="1" fill="#8b9097"/></svg>` },
  { id: 12, group: '7월 27일', title: '보호자와 연동되었어요', detail: '김부모님과 연결', time: '3일 전', read: true,
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="9" cy="9" r="3" stroke="#8b9097" stroke-width="1.6"/><circle cx="16" cy="14" r="3" stroke="#8b9097" stroke-width="1.6"/><path d="M11 11l3 1.5" stroke="#8b9097" stroke-width="1.6"/></svg>` },
]);

// 날짜별로 그룹핑
const groupedList = computed(() => {
  const groups = {};
  notifications.value.forEach(n => {
    if (!groups[n.group]) groups[n.group] = [];
    groups[n.group].push(n);
  });
  return Object.keys(groups).map(date => ({ date, items: groups[date] }));
});

function markAllRead() {
  notifications.value.forEach(n => (n.read = true));
   // ===== API 연동 필요 =====
  // [API 2] 모든 알림 읽음 처리
}

function readOne(id) {
  const item = notifications.value.find(n => n.id === id);
  if (item) item.read = true;
  // ===== API 연동 필요 =====
  // [API 3] 개별 알림 읽음 처리

  // [라우터] 알림 종류에 따라 관련 화면으로 이동 (대상 화면 만들면 연결)
  //   결제 알림   → router.push({ name: 'child-transaction-detail' })
  //   오늘만 허용 알림 → router.push({ name: 'child-payment-allow' })
  //   금융상품 알림 → router.push({ name: 'child-finance' })
}
</script>

<style scoped>
.noti-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 730px;         
  margin: 0 auto;
  padding-top: 50px;
  background: #ffffff;
  border: 1px solid #eceef1;
  overflow: hidden;     
}

/* 상단 네비 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 20px 6px;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
}

.mark-read {
  font-weight: 600;
  font-size: 12.7px;
  color: #8b9097;
  cursor: pointer;
}

.scroll {
  flex: 1;             
  overflow-y: auto;    
  padding: 10px 0 0;
}
.scroll::-webkit-scrollbar {
  width: 5px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #d8dbdf;      /* 스크롤바 막대 색 (연회색) */
  border-radius: 999px;
}
.scroll::-webkit-scrollbar-track {
  background: transparent;  /* 배경은 투명 */
}


/* 날짜 그룹 */
.group {
  padding: 6px 20px 8px;
}

.date-label {
  margin: 0 0 6px;
  font-weight: 600;
  font-size: 11.3px;
  color: #8b9097;
}

/* 알림 항목 */
.noti-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  cursor: pointer;
}

.icon-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: #f2f4f6;
  border-radius: 50%;
  flex: none;
}

.noti-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.noti-title {
  font-weight: 700;
  font-size: 12.6px;
  letter-spacing: -0.27px;
  color: #191b1e;
}

.noti-detail {
  font-weight: 500;
  font-size: 10.7px;
  color: #b9bec5;
}

.noti-time {
  font-weight: 500;
  font-size: 12px;
  color: #b9bec5;
  flex: none;
}


.unread-dot {
  width: 7px;
  height: 7px;
  background: #ff4d4f;
  border-radius: 50%;
  flex: none;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 16px 6px;
}

/* 뒤로가기 + 제목 묶음 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.nav-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #191b1e;
}

.mark-read {
  font-weight: 600;
  font-size: 12.7px;
  color: #8b9097;
  cursor: pointer;
   margin-right: 8px;
}
</style>