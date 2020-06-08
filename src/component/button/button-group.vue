<template>
  <div class="pg-button-group" :class="autoGrow && 'basis-auto'">
    <slot>
      <pg-button
          v-for="(value, key) of options"
          :key="key"
          :value="value"
          :disabled="is_disabled"
          @click="update(value)"
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
      size: { type: String, default: '', validator: v => !v || ['lg', 'sm', 'base'].includes(v), },
      autoGrow: { type: Boolean, default: false }, // 指定内部的 子元素 是否自适应宽度，默认是等宽设置。
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
      }
    },
    data() {
      let ev = this.$props.value;
      if (!!ev) {
        this.pgFormItem?.sync?.(ev);
      }
      return {
        groupList: []
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
    /**
     * 加载完成后，查找子组件的 所有的pg-button 以及值列表
     */
    mounted() {
      this.childrens = findDownComponentList(this, 'pg-button');
      this.$data.groupList = this.childrens.map(item => item.value);
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
