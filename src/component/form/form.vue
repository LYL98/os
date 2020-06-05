<template>
  <div class="pg-form" :class="classnames">
    <slot></slot>
  </div>
</template>

<script>
  import { findDownComponentList } from '../_util/assist';
  export default {
    name: 'pg-form',
    provide() {
      return {
        pgForm: this,
      };
    },
    props: {
      itemWidth: { type: String, default: '' },
      labelWidth: { type: String, default: '' },
      vertical: { type: Boolean, default: false },
      type: { type: String, default: 'edit', validator: v => !v || ['edit', 'query', 'detail'].includes(v) },
      size: {type: String, default: '', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
    },
    computed: {
      classnames() {
        const type = this.$props.type;
        if (type && type !== 'edit') {
          return `${type}-type`;
        }
        return ''
      }
    },
    methods: {
      // 全部校验
      validateAll() {
        let items = findDownComponentList(this, 'pg-form-item');
        let errors = items.map(item => item.validate?.()).filter(item => Array.isArray(item) && item.length > 0);
        return new Promise((resolve, reject) => {
          if (errors?.length === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      },
      // 单项校验，根据 form-item 的 label 查找
      validate(label) {
        let items = findDownComponentList(this, 'pg-form-item');
        items = items.filter(item => item.label === label);
        return new Promise((resolve, reject) => {
          if (items.length === 1) {
            let errors = items[0]?.validate?.();
            if (errors?.length === 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            console.warn('[pgyos]: Can not found label -- ', label);
            resolve(true);
          }
        });

      },
      reset() {
        let items = findDownComponentList(this, 'pg-form-item');
        items.forEach(item => item.reset());
      },
    }
  };
</script>

<style scoped>

</style>
