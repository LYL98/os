<template>
  <li
      class="pg-tab"
      :class="{'active': actived}"
      @click.stop="onSelect"
  >
    <span
        :class="(indicator || indicator != 0) && 'pg-tab-content'"
        :data-indicator="indicator"
    >
      <slot></slot>
    </span>
  </li>
</template>

<script>
  export default {
    name: 'pg-tab',
    inject: ['pgTabs'],
    props: {
      index: { type: String | Number, default: '' },
      indicator: { type: String | Number, default: '' },
    },
    computed: {
      actived() {
        return this.pgTabs?.$props?.activeIndex === this.$props.index;
      }
    },
    methods: {
      onSelect() {
        this.pgTabs?.update?.(this.$props.index);
        this.$emit('click');
      }
    }
  };
</script>

<style scoped>

</style>
