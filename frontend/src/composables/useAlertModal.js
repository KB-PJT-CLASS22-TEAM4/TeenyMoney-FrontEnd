import { reactive } from 'vue'

export function useAlertModal() {
  const state = reactive({
    alertVisible: false,
    alertTitle: '알림',
    alertMessage: '',
    alertVariant: 'alert',
    confirmVisible: false,
    confirmTitle: '확인',
    confirmMessage: '',
    confirmVariant: 'alert',
  })

  let confirmResolver = null
  let alertResolver = null

  function showAlert(message, title = '알림', variant = 'alert') {
    state.alertTitle = title
    state.alertMessage = String(message ?? '')
    state.alertVariant = variant
    state.alertVisible = true

    return new Promise((resolve) => {
      alertResolver = resolve
    })
  }

  function closeAlert() {
    state.alertVisible = false
    alertResolver?.()
    alertResolver = null
  }

  function showConfirm(message, title = '확인', variant = 'alert') {
    state.confirmTitle = title
    state.confirmMessage = String(message ?? '')
    state.confirmVariant = variant
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
