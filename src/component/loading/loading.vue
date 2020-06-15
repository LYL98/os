<template>
  <div class="pg-loading-wrapper" v-if="visible">
    <i class="icon-spinner2 spinner icon-2x text-light"></i>
  </div>
</template>

<script>
  export default {
    name: 'pg-loading',
    data() {
      return {
        visible: false,
      }
    },
    methods: {
      show() {
        this.$data.visible = true;
      },
      hidden() {
        this.$data.visible = false;
      }
    }
  };
</script>

<style lang="scss" scoped>
</style>
