import { ref } from 'vue'

const isOpen = ref(false)

export function useChildMenu() {
  function openMenu() {
    isOpen.value = true
  }

  function closeMenu() {
    isOpen.value = false
  }

  function toggleMenu() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}
