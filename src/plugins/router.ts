import { createRouter, createWebHashHistory } from 'vue-router'
import Welcome from '../pages/Welcome.vue'
import Login from '../pages/Login.vue'
import ReLogin from '../pages/ReLogin.vue'
import Device from '../pages/Device.vue'
import Done from '../pages/Done.vue'
import Pin from '../pages/Pin.vue'
import Lock from '../pages/Lock.vue'
import ChangePin from '../pages/ChangePin.vue'
import ChangeNewPIN from '../pages/ChangeNewPIN.vue'

const routes = [
  { path: '/welcome', name: 'welcome', component: Welcome },
  { path: '/login', name: 'login', component: Login },
  { path: '/re-login', name: 're-login', component: ReLogin },
  { path: '/device', name: 'device', component: Device },
  { path: '/done', name: 'done', component: Done },
  { path: '/pin', name: 'pin', component: Pin },
  { path: '/lock', name: 'lock', component: Lock },
  { path: '/change-pin', name: 'change-pin', component: ChangePin },
  { path: '/set-new-pin', name: 'set-new-pin', component: ChangeNewPIN }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes // short for `routes: routes`
})

export default router
