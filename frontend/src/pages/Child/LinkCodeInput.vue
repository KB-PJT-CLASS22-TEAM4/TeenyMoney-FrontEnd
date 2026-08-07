<template>
  <div class="link-screen">
    <div class="pad">
      <div class="heading">
        <h1 class="title">연동 코드를 입력하세요</h1>
        <p class="subtitle">부모님 앱에서 발급한 6자리 코드를 입력하세요</p>
      </div>

      <!-- 6자리 코드 박스 -->
      <div class="code-row" :class="{ error: errorMsg }">
        <div
          v-for="(digit, i) in digits"
          :key="i"
          class="code-box"
          :class="{ filled: digit !== ''}"
        >
          {{ digit }}
        </div>
      </div>

     <!-- 에러 메시지 (코드 박스 아래) -->
  <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
</div>

    <!-- 숫자 키패드 -->
    <div class="keypad">
      <button
        v-for="key in keys"
        :key="key.id"
        class="key"
        :class="{ 'key-empty': key.type === 'empty' }"
        :disabled="key.type === 'empty'"
        @click="onKeyPress(key)"
      >
        <template v-if="key.type === 'num'">{{ key.value }}</template>
        <template v-else-if="key.type === 'back'">⌫</template>
      </button>
    </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { connectFamilyCode } from '@/api/families'
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const authStore = useAuthStore()

const CODE_LENGTH = 6;
const code = ref('');
const errorMsg = ref('');

const digits = computed(() =>
  Array.from({ length: CODE_LENGTH }, (_, i) => code.value[i] ?? '')
);

const keys = [
  { id: 1, type: 'num', value: '1' }, { id: 2, type: 'num', value: '2' }, { id: 3, type: 'num', value: '3' },
  { id: 4, type: 'num', value: '4' }, { id: 5, type: 'num', value: '5' }, { id: 6, type: 'num', value: '6' },
  { id: 7, type: 'num', value: '7' }, { id: 8, type: 'num', value: '8' }, { id: 9, type: 'num', value: '9' },
  { id: 10, type: 'empty' },          { id: 0, type: 'num', value: '0' }, { id: 11, type: 'back' },
];

function onKeyPress(key) {
  if (key.type === 'num' && code.value.length < CODE_LENGTH) {
    errorMsg.value = ''
    code.value += key.value;
    if (code.value.length === CODE_LENGTH) verifyCode();
  } else if (key.type === 'back') {
    errorMsg.value = ''
    code.value = code.value.slice(0, -1);
  }
}

async function verifyCode() {
  try {
    const res = await connectFamilyCode(authStore.accessToken, code.value)
    console.log('연동 성공:', res)  // 이거 추가
    router.push({ name: 'child-link-confirm' })
  } catch (e) {
    console.log('연동 실패:', e.message)  // 이거 추가
    errorMsg.value = e.message || '코드가 일치하지 않아요'
    code.value = ''
  }
}
</script>


<style scoped>
.link-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding: 100px 20px 32px;
  background: #ffffff;
  border: 1px solid #eceef1;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.title {
  margin: 0;
  font-weight: 800;
  font-size: 20px;
  color: #15171b;
}

.subtitle {
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: #8b9097;
}

/* 코드 박스 6칸 */
.code-row {
  display: flex;
  justify-content: center;
  gap: 9px;
}

.code-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 52px;
  border: 1px solid #ccd3dd;
  border-radius: 8px;
  font-weight: 800;
  font-size: 22px;
  color: #15171b;
}

/* 입력된 칸 강조*/
.code-box.filled {
  border-color: #ffbc00;
}

/* 코드 에러 메세지 */
.error-msg {
  margin: 0;
  font-size: 12.5px;
  color: #e5484d;
  text-align: center;
}
.code-row.error .code-box {
  border-color: #e5484d;  
}

/* 키패드 */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 8px;
  width: 100%;
  margin-top: 110px;
}

.key {
  height: 64px;
  border: none;
  background: transparent;
  font-weight: 500;
  font-size: 25px;
  color: #191b1e;
  cursor: pointer;
}

.key:active {
  background: #f5f6f7;
  border-radius: 12px;
}

.key-empty {
  cursor: default;
}
</style>