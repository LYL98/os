<template>
  <td :width="width" :class="classnames" :style="`text-align: ${textAlign}; ${minWidth ? 'min-width: ' + minWidth : ''}`" :key="column_index">
    <slot :row="row">{{ row[prop] }}</slot>
  </td>
</template>

<script>
  export default {
    name: 'pg-column',
    inject: ['pgRow', 'pgTable'],
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
    data() {
      return {
        column_index: -1
      }
    },
    mounted() {
      this.$data.column_index = this.getColumnIndex();
      this.pgRow?.registerColumn(this.$data.column_index, this.$props);
    },
    destroyed() {
      if (this.$data.column_index === -1) return;
      this.pgRow?.destoryColumn(this.$data.column_index);
    },
    methods: {
      getColumnIndex() {
        if (!this.pgRow) return -1;
        if (!this.pgTable) return -1;

        let children = [...this.pgRow.$el.children];
        let row_options = [];
        if (this.pgTable.$props.serialable) {
          row_options = [undefined];
        }
        if (this.pgTable.$props.checkable) {
          row_options = [...row_options, undefined];
        }
        if (this.pgTable.$data.expandable) {
          row_options = [...row_options, undefined];
        }
        row_options = [...row_options, ...this.pgTable.$slots.default.map(item => item.elm)];

        row_options.forEach((item, index) => {
          if (item && item.nodeType === 8) {
            children.splice(index, 0, undefined);
          }
        });
        return [].indexOf.call(children, this.$el);
      }
    }
  };
</script>

<style scoped>

</style>
