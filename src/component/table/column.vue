<template>
  <td :width="width" :class="classnames" :style="`text-align: ${textAlign}; ${minWidth ? 'min-width: ' + minWidth : ''}`">
    <slot :row="row">{{ row[prop] }}</slot>
  </td>
</template>

<script>
  export default {
    name: 'pg-column',
    inject: ['pgRow'],
    props: {
      width: { type: String, default: '' },
      minWidth: { type: String, default: '' },
      prop: { type: String, default: '' },
      title: { type: String, default: '' },
      textAlign: { type: String, default: 'left', validator: v => ['left', 'center', 'right'].includes(v) },
      ellipsis: { type: Boolean, default: true },
    },
    computed: {
      row() {
        return this.pgRow?.item || {}
      },
      classnames() {
        return this.$props.ellipsis ? 'overflow-ellipsis' : '';
      },
    },
  };
</script>

<style scoped>

</style>
