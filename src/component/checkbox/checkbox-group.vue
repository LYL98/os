<template>
  <component :is="tag" class="pg-checkbox-group" :class="{ inline }">
    <slot></slot>
  </component>
</template>

<script>
  export default {
    name: 'pg-checkbox-group',
    props: {
      value: { type: Array, default: [] },
      inline: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      size: {type: String, default: 'base', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      tag: { type: String, default: 'ul' },
    },
    model: {
      prop: 'value',
      event: 'change'
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

<style scoped>

</style>
