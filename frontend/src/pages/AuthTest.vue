<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const email = ref('parent1@test.com')
const password = ref('Local1234!')
const auth = useAuthStore()
const { member, lastResult, busy, hasAccessToken } = storeToRefs(auth)

function login() {
  return auth.login({ email: email.value, password: password.value })
}
</script>

<template>
  <main class="auth-test">
    <h1>인증 API 임시 테스트</h1>
    <p class="notice">
      Access Token은 Pinia 메모리에만 저장하고 Refresh Token은 HttpOnly 쿠키로 전송합니다.
    </p>

    <section class="panel">
      <label>
        이메일
        <input v-model.trim="email" type="email" autocomplete="username" />
      </label>
      <label>
        비밀번호
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>
    </section>

    <section class="actions" aria-label="인증 테스트 작업">
      <button :disabled="busy" @click="auth.fetchCsrf">CSRF 발급</button>
      <button :disabled="busy" @click="login">로그인</button>
      <button :disabled="busy" @click="auth.fetchMe">내 정보 조회</button>
      <button :disabled="busy" @click="auth.clearAccessForReloadTest">
        Access Token 제거(새로고침 모의)
      </button>
      <button :disabled="busy" @click="auth.reissue">재발급</button>
      <button :disabled="busy" class="danger" @click="auth.logout">로그아웃</button>
    </section>

    <section class="panel status" aria-live="polite">
      <h2>현재 상태</h2>
      <dl>
        <div>
          <dt>Access Token 보유</dt>
          <dd>{{ hasAccessToken ? '예' : '아니오' }}</dd>
        </div>
        <div>
          <dt>회원 ID</dt>
          <dd>{{ member?.memberId ?? member?.id ?? '-' }}</dd>
        </div>
        <div>
          <dt>이름</dt>
          <dd>{{ member?.name ?? '-' }}</dd>
        </div>
        <div>
          <dt>역할</dt>
          <dd>{{ member?.role ?? '-' }}</dd>
        </div>
      </dl>
    </section>

    <section class="panel result" aria-live="polite">
      <h2>최근 요청 결과</h2>
      <p v-if="busy">요청 중...</p>
      <dl v-else-if="lastResult">
        <div><dt>요청</dt><dd>{{ lastResult.action }}</dd></div>
        <div><dt>HTTP</dt><dd>{{ lastResult.status ?? '-' }}</dd></div>
        <div><dt>코드</dt><dd>{{ lastResult.code }}</dd></div>
        <div><dt>메시지</dt><dd>{{ lastResult.message }}</dd></div>
      </dl>
      <p v-else>위 버튼을 순서대로 눌러 테스트하세요.</p>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-test {
  width: min(720px, calc(100% - 32px));
  margin: 40px auto;
  color: #202124;
  font-family: Arial, sans-serif;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: 28px;
}

h2 {
  font-size: 18px;
}

.notice {
  color: #5f6368;
  line-height: 1.5;
}

.panel {
  display: grid;
  gap: 16px;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #dadce0;
  border-radius: 10px;
  background: #fff;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #bdc1c6;
  border-radius: 6px;
  font: inherit;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 14px;
  border: 0;
  border-radius: 6px;
  background: #ffbc00;
  color: #202124;
  font-weight: 700;
  cursor: pointer;
}

button.danger {
  background: #d93025;
  color: #fff;
}

button:disabled {
  cursor: wait;
  opacity: 0.55;
}

dl,
dd {
  margin: 0;
}

dl {
  display: grid;
  gap: 10px;
}

dl div {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
}

dt {
  color: #5f6368;
}

dd {
  overflow-wrap: anywhere;
  font-weight: 700;
}

@media (max-width: 520px) {
  .auth-test {
    margin-top: 20px;
  }

  dl div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
