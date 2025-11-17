import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '../app.vue'
import { router } from '../router.ts'

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(VueQueryPlugin)
  .use(PiniaColada)
  
app.mount('#app')
