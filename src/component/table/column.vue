<template>
  <td :width="width">
    <slot :row="row">{{ row[prop] }}</slot>
  </td>
</template>

<script>
  export default {
    name: 'pg-column',
    inject: ['pgRow'],
    props: {
      width: { type: String, default: '' },
      prop: { type: String, default: '' },
      title: { type: String, default: '' },
    },
    computed: {
      row() { return this.pgRow.item; }
    }
  };
</script>

<style scoped>

</style>
