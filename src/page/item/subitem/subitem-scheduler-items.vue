<template>
  <pg-table
    :data="items"
    primary-key="code"
    :highlight-row="false"
    :height="app.windowHeight - 70 + 'px'"
    borderless
  >
    <pg-column title="商品编号" prop="code" width="100px"></pg-column>
    <pg-column title="商品名称" prop="title" width="300px"></pg-column>
  </pg-table>

</template>
<script>

  export default {
    name: 'subitem-scheduler-items',
    inject: ['app'],
    props: {
      items: { type: Number, default: () => [] },
    },

  }
</script>

<style lang="scss" scoped>

</style>
