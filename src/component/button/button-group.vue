<template>
  <div class="pg-button-group" :class="{ 'basis-auto': basisAuto, borderless: borderless }">
    <slot>
      <pg-button
          v-for="(v, key) of options"
          :key="key"
          :value="v"
          :flat="borderless"
      >{{key}}</pg-button>
    </slot>
  </div>
</template>

<script>
  import { findDownComponentList, findUpComponent } from '../_util/assist';
  import pgButton from './button';

  // 获取页面中的
  export default {
    name: 'pg-button-group',
    components: {pgButton},
    props: {
      value: { type: String | Number | Boolean, default: '' },
      disabled: {type: Boolean, default: false},
      borderless: {type: Boolean, default: false},
      size: { type: String, default: '', validator: v => !v || ['lg', 'sm', 'base'].includes(v), },
      basisAuto: { type: Boolean, default: false }, // 指定内部的 子元素 是否自适应宽度，默认是等宽设置。
      options: { type: Object | undefined, default() { return {} } }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
      editValue: {
        get() {
          return this.$props.value;
        },
        set(val) {
          this.$emit('change', val);
        }
      },
    },
    data() {
      let ev = this.$props.value;
      if (!!ev || ev === false) { // 兼容boolean的情况
        this.pgFormItem?.sync?.(ev);
      }
      return {
        slotOptions: []
      }
    },
    watch: {
      value: {
        deep: true,
        immediate: false,
        handler(next, prev) {
          this.$nextTick(() => {
            this.pgFormItem?.sync?.(next);
          });
        }
      }
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },

    methods: {
      update(val) {
        this.editValue = val;
      }
    }
  };
</script>

<style scoped>

</style>
