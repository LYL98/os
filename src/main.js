import Vue from 'vue';
import App from './app/app';
import router from './router';
import pgyos from './index';
Vue.use(pgyos);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
