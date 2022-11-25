import { defineStore } from 'pinia'
const useWebStore = defineStore({
  id: 'config',
  state: () => ({
    token: ''
  }),
  persist: {
    beforeRestore: (context: unknown) => {
      console.log(context)
    },
    afterRestore: (context: unknown) => {
      console.log(context)
    }
  }
})
export default useWebStore
