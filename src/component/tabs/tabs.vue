<template>
  <ul class="pg-tabs" :class="{borderless}">
    <slot></slot>
  </ul>
</template>

<script>
  export default {
    name: 'pg-tabs',
    provide() {
      return {
        pgTabs: this
      }
    },
    props: {
      activeIndex: { type: String | Number, default: '' },
      borderless: { type: Boolean, default: false },
    },
    model: {
      prop: 'activeIndex',
      event: 'change'
    },
    methods: {
      update(index) {
        this.$emit('change', index);
      }
    }
  };
</script>

<style scoped>

</style>
