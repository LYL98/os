<template>
  <div v-transfer-dom :data-transfer="true">
    <transition name="fade">
      <div class="pg-drawer-wrapper" @click.self="onMaskClick" v-if="isShow">
        <div class="pg-drawer right" :class="{drawing}" :style="`width: ${width || 'auto'}; right: -${drawing ? width : 0}`">
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
    name: 'pg-drawer',
    components: { pgButton },
    directives: {TransferDom},
    props: {
      maskCloseable: {type: Boolean, default: true},
      title: {type: String, default: ''},
      width: {type: String, default: '200px'},
      visible: { type: Boolean, default: false }
    },
    model: {
      prop: 'visible',
      event: 'closed'
    },
    data() {
      return {
        isShow: false,
        drawing: false,
      };
    },
    watch: {
      visible: {
        immediate: true,
        handler(v) {
          if (v) {
            // document.body.style.overflowY = "hidden";
            this.onOpen();
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
      onOpen() {
        this.$data.isShow = v;
        this.$data.drawing = true;
        let timer = setTimeout(() => {
          this.$data.drawing = false;
          clearTimeout(timer);
        }, 0);
      },
      onClose() {
        this.$data.drawing = true;
        let timer = setTimeout(() => {
          this.$data.drawing = false;
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
