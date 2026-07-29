<template>
  <div class="container">
    <img src="@/assets/logo.svg" class="logo" alt="티니머니 로고" />
    <h1 class="title">티니머니</h1>
    <p class="desc">
      용돈을 충전해서 쓰고, 목표를 모으고<br />
      부모님이 함께 관리해요
    </p>
    <img src="@/assets/rabbit.png" class="character" alt="티니머니 캐릭터" />

    <div class="actions">
      <button class="start-btn" type="button" @click="goToSignup">시작하기</button>
      <p class="login-text">
        이미 계정이 있으신가요? <span>로그인</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToSignup() {
  router.push({ name: 'signup' });
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  min-height: 730px;
  margin: 0 auto;
  padding: 0 24px 32px;
  background-color: #ffffff;
  border: 1px solid #eceef1;
}

.logo {
  margin-top: 48px;
  width: 64px;
  height: 64px;
}

.title {
  margin: 16px 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #111111;
}

.desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  color: #666666;
}

.character {
  flex: 1;
  width: 100%;
  max-width: 280px;
  margin-top: 24px;
  object-fit: contain;
}

.actions {
  width: 100%;
  margin-top: 16px;
}

.start-btn {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  background-color: #ffd600;
  font-size: 16px;
  font-weight: 700;
  color: #111111;
  cursor: pointer;
}

.login-text {
  margin: 16px 0 0;
  font-size: 14px;
  text-align: center;
  color: #888888;
}

.login-text span {
  font-weight: 700;
  color: #111111;
  cursor: pointer;
}
</style>
