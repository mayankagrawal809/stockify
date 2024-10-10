import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

function isAuthenticated(): boolean {
  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  return !!token;
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },

    {
      path: '/login',
      name: 'login',
      component: () => LoginView
    },

  ]
})

router.beforeEach((to, from, next) => {

  if (to.name === 'login' && isAuthenticated()) {
    next({ name: 'home' });
  } else if (!isAuthenticated() && to.name !== 'login') {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router
