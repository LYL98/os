<template>
  <component :is="tag" class="pg-radio-group" :class="{ inline }">
    <slot></slot>
  </component>
</template>

<script>
  import {findUpComponent} from './../_util/assist';
  export default {
    name: 'pg-radio-group',
    provide() {
      return {
        pgRadioGroup: this
      }
    },
    props: {
      value: { type: String | Number, default: false },
      inline: { type: Boolean, default: true },
      tag: { type: String, default: 'ul' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      let ev = this.$props.value;
      if (ev || ev === 0) {
        this.pgFormItem?.sync?.(ev);
      }
      return {
        ev: ev
      }
    },
    watch: {
      value: {
        immediate: false,
        handler:function(val){
          this.$data.ev = val;
          this.pgFormItem?.sync?.(val);
        }

      }
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    methods: {
      onCheck(v) {
        this.$emit('change', v);
      }
    }
  };
</script>

<style scoped>

</style>
