import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAllowRequestStore = defineStore('allowRequest', () => {
  const categoryIds    = ref([])
  const categoryLabels = ref([])
  const reason         = ref('')

  function set(ids, labels, text) {
    categoryIds.value    = ids
    categoryLabels.value = labels
    reason.value         = text
  }

  function reset() {
    categoryIds.value    = []
    categoryLabels.value = []
    reason.value         = ''
  }

  return { categoryIds, categoryLabels, reason, set, reset }
})