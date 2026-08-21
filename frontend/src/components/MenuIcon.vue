<template>
  <svg
    class="menu-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <template v-if="name === 'home'">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'list'">
      <path
        d="M8 7h12M8 12h12M8 17h12"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M4 7h.01M4 12h.01M4 17h.01"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'qr'">
      <path
        d="M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
      <path
        d="M14 14h3v3h-3v-3ZM19 14v6M14 19h6"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'chart'">
      <path
        d="M4 19h16M7 16V9M12 16V5M17 16v-7"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'wallet'">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17.5v-10Z"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M4 9h16"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'plus'">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'send'">
      <path
        d="M4 12 20 4l-6 16-2.5-7.5L4 12Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'calendar'">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'card'">
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M3 10h18M7 15h4"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'people'">
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M3.5 19c.4-3 2.6-5 5.5-5s5.1 2 5.5 5"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <circle
        cx="17"
        cy="9"
        r="2.4"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M16.2 14.2c2 .4 3.6 1.8 4.3 4.3"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'link'">
      <path
        d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'bank'">
      <path
        d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M12 4l8 6H4l8-6Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'star'">
      <path
        d="M12 4.5 14.2 9l5 .7-3.6 3.5.9 5L12 16.4 7.5 18.2l.9-5L4.8 9.7l5-.7L12 4.5Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'shield'">
      <path
        d="M12 3 5 6v6c0 4.2 2.9 7.2 7 8.5 4.1-1.3 7-4.3 7-8.5V6l-7-3Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'quest'">
      <rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M9 2.8h6v2.4H9zM9 10.5h6M9 14h6"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'person'">
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M5 19c.6-3.4 3.2-5.2 7-5.2s6.4 1.8 7 5.2"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else-if="name === 'bell'">
      <path
        d="M6 16h12l-1.2-2.2V10a4.8 4.8 0 1 0-9.6 0v3.8L6 16ZM10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'lock'">
      <rect
        x="6"
        y="11"
        width="12"
        height="9"
        rx="2"
        stroke="currentColor"
        stroke-width="1.7"
      />
      <path
        d="M8.5 11V8.2a3.5 3.5 0 0 1 7 0V11"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>

    <template v-else>
      <path
        d="M5 12h14"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: 'home',
  },
})
</script>

<style scoped>
.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
