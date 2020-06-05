import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from './app/home.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ './app/home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ './app/login.vue')
  },
  {
    path: '/oauth',
    name: 'oauth',
    component: () => import(/* webpackChunkName: "oauth" */ './app/oauth.vue')
  },
  {
    path: '/form',
    name: 'form',
    component: () => import(/* webpackChunkName: "oauth" */ './views/form.vue')
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import(/* webpackChunkName: "oauth" */ './views/layout.vue')
  },

];

const router = new VueRouter({
  routes
});

export default router
