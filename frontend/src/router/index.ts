import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

function isAuthenticated(): boolean {
  const token = localStorage.getItem('jwt_token');
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
    // Wildcard route to catch all undefined routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: () => {
        if (isAuthenticated()) {
          return { name: 'home' };  // Redirect to home if authenticated
        } else {
          return { name: 'login' }; // Redirect to login if not authenticated
        }
      },
      meta: { requiresAuth: false }
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'login' });
  }
  else if (authenticated && to.name === 'login') {
    next({ name: 'home' });
  }
  else {
    next();
  }
});

export default router
