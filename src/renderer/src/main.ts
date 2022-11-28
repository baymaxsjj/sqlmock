import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import ArcoVue from '@arco-design/web-vue'
import './assets/css/reset.css'
import '@arco-themes/vue-db-mock/index.less'
import './samples/node-api'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// @ts-ignore
console.log('\n'.concat(' %c SqlMock v', APP_VERSION).concat(' %c https://gitee.com/baymaxsjj ', '\n', '\n'), 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;');

const app = createApp(App)
app.use(ArcoVueIcon)
app.use(router)
app.use(pinia)
app.use(ArcoVue)
app.mount('#app').$nextTick(window.removeLoading)
