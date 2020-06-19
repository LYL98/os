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
  hide: function () {
    let instance = getInstance();
    instance.hide();
  },
};

export default loading;
