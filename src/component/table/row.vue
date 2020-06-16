<template>
  <tr>
    <slot></slot>
  </tr>
</template>

<script>
  export default {
    name: 'pg-row',
    provide() {
      return {
        pgRow: this
      }
    },
    props: {
      item: { type: Object, default() { return {}; } },
    }
  };
</script>

<style scoped>

</style>
