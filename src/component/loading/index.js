import Loading from './loading.vue';
import createInstance from '../_util/instance';

let toastInstance;

const getInstance = function () {
  toastInstance = toastInstance || createInstance(Loading);
  return toastInstance;
};

const loading = {
  show: function () {
    let instance = getInstance();
    instance.show();
  },
  hidden: function () {
    let instance = getInstance();
    instance.hidden();
  },
};

export default loading;
