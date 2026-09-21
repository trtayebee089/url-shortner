export type ToastKind = 'success' | 'error' | 'info'
export function useToast() {
  const toast = useState<{ message: string; type: ToastKind } | null>('global-toast', () => null)
  let timer: ReturnType<typeof setTimeout> | undefined
  function show(message: string, type: ToastKind = 'success') {
    toast.value = { message, type }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { toast.value = null }, 3500)
  }
  return { toast, show, close: () => { toast.value = null } }
}
