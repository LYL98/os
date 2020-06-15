<template>
  <span class="pg-column-sort" @click.stop="onSort">
    <i class="icon-arrow-up5" :class="{ active: value && value === desc }"></i>
    <i class="icon-arrow-down5" :class="{ active: value && value === asc }"></i>
  </span>
</template>

<script>
  export default {
    name: 'pg-column-sort',
    inject: ['pgTable'],
    props: {
      value: { type: String | Number, defailt: '' },
      asc: { type: String | Number, default: '' },
      desc: { type: String | Number, default: '' }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      return {}
    },
    methods: {
      onSort() {
        const { value, asc, desc } = this.$props;
        if (!value) { // 如果不存在排序值，则选择正序
          this.$emit('change', asc);
          return;
        }

        if (value === asc) {
          this.$emit('change', desc);
          return;
        }

        if (value === desc) {
          this.$emit('change', asc);
        }

      }
    }
  }
</script>