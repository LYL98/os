<template>
  <tr>
    <slot></slot>
  </tr>
</template>

<script>
  import {findUpComponent} from '../_util/assist';
  export default {
    name: 'pg-row',
    provide() {
      return {
        pgRow: this
      }
    },
    props: {
      item: { type: Object, default() { return {}; } },
    },
    beforeCreate() {
      this.pgTable = findUpComponent(this, 'pg-table');
    },
    methods: {
      registerColumn(column_index, column_props) {
        if (!this.pgTable) return;
        if (this.pgTable.$data.slots_default[column_index]) return;
        this.$set(this.pgTable.$data.slots_default, column_index, column_props);
      },
      destoryColumn(column_index) {
        if (!this.pgTable) return;
        if (!this.pgTable.$data.slots_default[column_index]) return;
        this.$set(this.pgTable.$data.slots_default, column_index, undefined);
      },
    }
  };
</script>

<style scoped>

</style>
