import Toast from './toast.vue';
import createInstance from '../_util/instance';

let toastInstance;

const getInstance = function () {
  toastInstance = toastInstance || createInstance(Toast);
  return toastInstance;
};

const toast = function ({ type = 'success', message = '', duration = 3000, closeable = false } = {}) {
  let instance = getInstance();
  instance.add({ type, message, duration, closeable });
};

export default toast;
