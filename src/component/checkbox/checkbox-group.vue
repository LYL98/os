<template>
  <component :is="tag" class="pg-checkbox-group" :class="{ inline }">
    <slot></slot>
  </component>
</template>

<script>
  import {findUpComponent} from './../_util/assist';
  export default {
    name: 'pg-checkbox-group',
    props: {
      value: { type: Array, default: [] },
      disabled: {type: Boolean, default: false},
      inline: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      valid: { type: Boolean, default: true },
      size: {type: String, default: 'base', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      tag: { type: String, default: 'ul' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
    },
    watch: {
      value: {
        deep: true,
        immediate: false,
        handler:function(val){
          this.$props.valid && this.pgFormItem?.sync?.(val);
        }

      }
    },
    data() {
      let ev = this.$props.value;
      if (Array.isArray(ev) && ev.length > 0) {
        this.$props.valid && this.pgFormItem?.sync?.(ev);
      }
      return {}
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    methods: {
      onCheck(v) {
        let vs = [...this.$props.value];

        if (!Array.isArray(vs)) {
          return console.warn('[pgyos]: the checkbox-group component need array type value!');
        }

        if (vs.indexOf(v) > -1) {
          vs = vs.filter(item => item !== v);
        } else {
          vs = [...vs, v];
        }
        
        this.$emit('change', vs);
      }
    }
  };
</script>
