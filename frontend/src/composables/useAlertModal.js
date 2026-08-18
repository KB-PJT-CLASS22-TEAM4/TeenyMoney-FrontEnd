import { reactive } from 'vue'

export function useAlertModal() {
  const state = reactive({
    alertVisible: false,
    alertTitle: '알림',
    alertMessage: '',
    confirmVisible: false,
    confirmTitle: '확인',
    confirmMessage: '',
  })

  let confirmResolver = null

  function showAlert(message, title = '알림') {
    state.alertTitle = title
    state.alertMessage = String(message ?? '')
    state.alertVisible = true
  }

  function closeAlert() {
    state.alertVisible = false
  }

  function showConfirm(message, title = '확인') {
    state.confirmTitle = title
    state.confirmMessage = String(message ?? '')
    state.confirmVisible = true

    return new Promise((resolve) => {
      confirmResolver = resolve
    })
  }

  function resolveConfirm(ok) {
    state.confirmVisible = false
    confirmResolver?.(ok)
    confirmResolver = null
  }

  return {
    state,
    showAlert,
    closeAlert,
    showConfirm,
    resolveConfirm,
  }
}
