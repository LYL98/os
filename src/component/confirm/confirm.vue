<template>
  <pg-popper v-model="expend" :width="popperWidth" :placement="placement" :append-arrow="false">
    <slot></slot>
    <div class="dropdown-box p-15 text-center" slot="content">
      <div class="font-weight-bold font-size-lg d-flex align-items-center justify-content-center">
        <i class="icon-spam text-danger" style="font-size: 20px;"></i>
        <span class="ml-10">{{ helpText }}</span>
      </div>
      <div class="mt-20">
        <pg-button size="sm" @click="onCancel">取消</pg-button>
        <pg-button size="sm" class="ml-15" color="danger" @click="onConfirm">确定</pg-button>
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