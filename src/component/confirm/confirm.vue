<template>
  <pg-popper v-model="expend" :width="popperWidth" :placement="placement" :append-arrow="true">
    <slot></slot>
    <div class="dropdown-box text-center pt-20 px-15 pb-10" slot="content">
        <div class="d-flex align-items-center justify-content-center">
          <i class="icon-spam text-warning" style="font-size: 20px;"></i>
          <div class="ml-10">
            <slot name="help-text">{{ helpText }}</slot>
          </div>
        </div>
      <div class="mt-15">
        <pg-button size="sm" @click="onCancel">取消</pg-button>
        <pg-button size="sm" class="ml-15" color="primary" @click="onConfirm">确定</pg-button>
      </div>
    </div>
  </pg-popper>
</template>

<script>
  import pgPopper from './../popper/popper';
  export default {
    name: 'pg-confirm',
    components: { pgPopper },
    props: {
      popperWidth: { type: String, default: '180px' },
      placement: { type: String, default: 'top' },
      helpText: { type: String, default: '确认继续进行操作' },
    },
    data() {
      return {
        expend: false,
      }
    },
    methods: {
      onCancel() {
        this.$data.expend = false;
        this.$emit('cancel');
      },
      onConfirm() {
        this.$data.expend = false;
        this.$emit('confirm');
      }
    }
  }
</script>