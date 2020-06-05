<template>
  <div class="pg-toast-wrapper" v-if="!!toast.type">
    <div class="pg-toast slide-in-down" :class="toast.type">
      <i class="icon-notification2 text-primary" v-if="toast.type === 'primary'"></i>
      <i class="icon-checkmark-circle text-success" v-if="toast.type === 'success'"></i>
      <i class="icon-spam text-warning" v-if="toast.type === 'warning'"></i>
      <i class="icon-spam text-danger" v-if="toast.type === 'danger'"></i>
      <span class="content">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'pg-toast',
    data() {
      return {
        toast: {  },
      }
    },
    methods: {
      add(toast) {
        this.$data.toast = toast;

        // remove timer. if not? set 2000;
        const duration = toast.duration || 3000;
        let timer = setTimeout(() => {
          this.remove();
          clearTimeout(timer);
        }, duration);
      },

      remove() {
        this.$data.toast = {};
      }
    }
  };
</script>

<style lang="scss" scoped>
</style>
