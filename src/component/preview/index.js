import Vue from 'vue';
import Preview from './preview.vue';
import createInstance from '../_util/instance';

let previewInstance;

const getInstance = function () {
  previewInstance = previewInstance || createInstance(Preview);
  return previewInstance;
};

const preview = function ({ src = '', list = [], type = 'image' } = {}) {
  let instance = getInstance();
  return instance.show({ src, list, type });
};

Vue.directive('preview', {
  inserted (el, binding, vnode) {

    function handler () {

      let list = [];
      if (binding.modifiers['list']) {
        list = binding.value;
      }
      getInstance().show({ src: el.src, list: list });

    }

    el.__vueClick__ = handler;
    el.addEventListener('click', el.__vueClick__);
  },
  unbind (el, binding) {
    el.removeEventListener('click', el.__vueClick__);
    delete el.__vueClick__;
  }
});

export default preview;
