<template>
  <pg-popper
      class="pg-tooltip"
      v-model="expend"
      width="100px"
      :placement="placement"
      :append-arrow="true"
      :trigger="trigger"
      appendToBody
  >
    <span class="cursor-pointer">
      <slot name="toggle">
        <i class="icon-question4 text-secondary"></i>
      </slot>
    </span>
    <div class="dropdown-box text-center p-10" slot="content">
      <slot></slot>
    </div>
  </pg-popper>
</template>

<script>
  import pgPopper from './../popper/popper';
  export default {
    name: 'pg-tooltip',
    components: { pgPopper },
    props: {
      placement: { type: String, default: 'top' },
      trigger: { type: String, default: 'hover', validator: v => ['click', 'hover'].includes(v) },
    },
    data() {
      return {
        expend: false,
      }
    },
    methods: {
    }
  }
</script>