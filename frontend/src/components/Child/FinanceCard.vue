<template>
  <div class="finance-card">
    <div class="card-top">
      <span class="type-badge">{{ type }}</span>
      <span class="rate-badge">{{ rate }}</span>
    </div>

    <p class="name">{{ name }}</p>
    <p class="amount">{{ amount }}</p>

    <div class="card-bottom">
      <div class="sub-row">
        <p class="sub">{{ sub }}</p>
        <p class="maturity" v-if="maturity">{{ maturity }}</p>
      </div>
      <div class="progress" v-if="hasProgress">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 부모가 카드마다 다른 데이터를 넘겨줌
defineProps({
  type:     { type: String, default: '' },      // 적금/예금/대출/자유적금/정액적금
  rate:     { type: String, default: '' },      // 금리
  name:     { type: String, default: '' },      // 상품명
  amount:   { type: String, default: '' },      // 금액
  sub:      { type: String, default: '' },      // 기간/상환일 등
  maturity: { type: String, default: '' },      // 만기일
  progress: { type: Number, default: 0 },       // 진척도 %
  hasProgress: { type: Boolean, default: false }, // 정액적금/대출만 진행바 표시
  amountColor: { type: String, default: '#15171b' },  // 미사용(호환용)
})
</script>

<style scoped>
.finance-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 210px;
  min-height: 132px;
  flex: none;
  padding: 16px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  scroll-snap-align: start;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 0.2px;
  background: #facc15;
  color: #ffffff;
}

.rate-badge {
  padding: 3px 9px;
  border-radius: 7px;
  font-weight: 700;
  font-size: 11px;
  background: #facc15;
  color: #ffffff;
}

.name {
  margin: 0;
  font-weight: 700;
  font-size: 13.5px;
  color: #15171b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.amount {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -0.3px;
  color: #15171b;
}

.card-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.sub {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-weight: 600;
  font-size: 11px;
  color: #8b9097;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.maturity {
  margin: 0;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 10.5px;
  color: #a0a5ad;
  white-space: nowrap;
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
