import { requireLogin } from '@/utils/pageGuard'

export default {
  onLoad() {
    if (!requireLogin()) {
      return
    }
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
  }
}