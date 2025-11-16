import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import './style.css'
import App from '../app.vue'
import { router } from '../router.ts'

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(PiniaColada)
  
app.mount('#app')
