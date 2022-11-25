import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import ArcoVue from '@arco-design/web-vue'
import './assets/css/reset.css'
import '@arco-themes/vue-db-mock/index.less'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(ArcoVueIcon)
app.use(router)
app.use(pinia)
app.use(ArcoVue)
app.mount('#app').$nextTick(window.removeLoading)
