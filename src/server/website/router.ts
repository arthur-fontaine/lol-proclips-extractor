import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import PlayerView from './views/PlayerView.vue'

const routes = [
  { path: '/players/:playerName', component: PlayerView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
