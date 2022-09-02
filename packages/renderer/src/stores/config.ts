import { defineStore } from 'pinia' 
const useWebStore = defineStore({ 
    id: 'config', 
    state: () => ({ 
        token:""
    }),
    persist: {
        beforeRestore: (context: any) => {
            console.log(context)
          },
          afterRestore: (context: any) => {
            console.log(context)
          },
    },
}) 
export default useWebStore