<template>
  <div v-transfer-dom :data-transfer="true">
    <transition name="fade">
      <div class="pg-dialog-wrapper" @click.self="onMaskClick" v-if="isShow">
        <div class="pg-dialog center" :class="`${closing ? 'closing' : ''}`" :style="`width: ${width || 'auto'};`">
          <div class="header">
            <slot name="header"><h3 class="title">{{title}}</h3></slot>
            <pg-button class="icon" square flat @click="onClose"><i class="icon-cross2"></i></pg-button>
          </div>
          <div class="body">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import pgButton from './../button/button';
  import TransferDom from '../_util/transfer-dom';

  export default {
    name: 'pg-dialog',
    components: { pgButton },
    directives: {TransferDom},
    props: {
      maskCloseable: {type: Boolean, default: false},
      title: {type: String, default: ''},
      width: {type: String, default: ''},
      visible: { type: Boolean, default: false }
    },
    model: {
      prop: 'visible',
      event: 'closed'
    },
    data() {
      return {
        isShow: false,
        closing: false
      };
    },
    watch: {
      visible: {
        immediate: true,
        handler(v) {
          if (v) {
            this.$data.isShow = v;
            // document.body.style.overflowY = "hidden";
          } else {
            this.onClose();
          }
        }
      }
    },
    methods: {
      onMaskClick() {
        if (this.$props.maskCloseable) {
          this.onClose();
        }
      },
      onClose() {
        this.$data.closing = true;
        let timer = setTimeout(() => {
          this.$data.closing = false;
          this.$data.isShow = false;
          this.$emit('closed');
          clearTimeout(timer);
        }, 0);
      },
    },
  };
</script>

<style scoped>

</style>
