<template>
  <div class="finance-card">
    <div class="card-top">
      <span class="type">{{ type }}</span>
      <span class="rate" :class="{ outline: type === '대출' }">{{ rate }}</span>
    </div>
    <p class="name">{{ name }}</p>
    <p class="amount" :style="{ color: amountColor }">{{ amount }}</p>
    <p class="sub">{{ sub }}</p>
    <div class="progress">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
// 부모가 카드마다 다른 데이터를 넘겨줌
defineProps({
  type:     { type: String, default: '' },      // 적금/예금/대출
  rate:     { type: String, default: '' },      // 금리
  name:     { type: String, default: '' },      // 상품명
  amount:   { type: String, default: '' },      // 금액
  sub:      { type: String, default: '' },      // 기간/상환일 등
  progress: { type: Number, default: 0 },       // 진척도 %
  amountColor: { type: String, default: '#15171b' },  // 금액/바 색
});
</script>

<style scoped>
.finance-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
  flex: none;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #eaedf1;
  border-radius: 16px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.33px;
  color: #6a6f76;
}

.rate {
  padding: 3px 9px;
  background: #ffbc00;
  border-radius: 7px;
  font-weight: 600;
  font-size: 11px;
  color: #fff;
}

/* 대출은 테두리 스타일 */
.rate.outline {
  background: #fff;
  border: 1px solid #e7e9ec;
  color: #4a4e55;
}

.name {
  margin: 0;
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
}

.amount {
  margin: 0;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -0.38px;
}

.sub {
  margin: 0;
  font-weight: 600;
  font-size: 11px;
  color: #8b9097;
}

.progress {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffbc00; 
  border-radius: 999px;
}
</style>