import Vue from 'vue';

const createInstance = function(component, properties) {
  const props = properties || {};
  const wrapper = new Vue({
    data: props,
    render(createElement) {
      return createElement(component, { props: props })
    }
  });

  const el = wrapper.$mount().$el;
  document.body.appendChild(el);

  const instance = wrapper.$children[0];
  return instance;
}

export default createInstance;
