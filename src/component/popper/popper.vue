<template>
  <div
      class="pg-popper"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
  >
    <div class="pg-popper-toggle" ref="toggle" @click="onToggle">
      <slot></slot>
    </div><!--
   popper 层的最小宽度 通过外部传递进来，如果指定了该宽度，则使用，如果没有指定，则自适应于 slot: content 的宽度
     --><transition name="fade">
      <div
          v-transfer-dom 
          :data-transfer="appendToBody"
          :style="`min-width: ${width};`"
          v-show="visible"
          ref="popper"
          class="pg-popper-content"
          :class="{'has-popper-arrow': appendArrow}"
          @mouseenter="onMouseenter"
          @mouseleave="onMouseleave"
      >
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>

<script>

  import TransferDom from '../_util/transfer-dom';

  export default {
    name: "pg-popper",
    directives: {TransferDom},
    props: {
      expend: {type: Boolean, default: false},
      disabled: {type: Boolean, default: false},
      appendArrow: {type: Boolean, default: false},
      placement: {type: String, default: 'bottom-start'},
      width: { type: String, default: '100px' },
      appendToBody: {type: Boolean, default: false},
      trigger: { type: String, default: 'click', validator: v => ['click', 'hover'].includes(v) },
    },
    model: {
      prop: 'expend',
      event: 'change'
    },
    data() {
      return {
        visible: this.$props.expend,
        created: false,  // 在创建时才渲染 弹出层DOM 的控制开关
      }
    },
    watch: {
      // 外部更新后，同步内部的 visible 状态
      expend: {
        handler(val) {
          this.visible = val;
        }
      },
      // 实际控制 visible 显示/隐藏的开关，内部更新后，检测内外状态 如果不一致，则同步外部的 expend状态
      visible: {
        immediate: true,
        handler(val) {
          // 需要显示
          if (val) {
            this.updatePopper();
            document.addEventListener('click', this.clickOutside);
          } else {
            document.removeEventListener('click', this.clickOutside);
          }
          (this.$props.expend !== val) && this.$emit('change', val);

        }
      }
    },

    mounted() {
    },
    beforeDestroy() {
      this.popperInstance?.destroy(); // 销毁实例
      document.removeEventListener('click', this.clickOutside); // 清除popper层打开后 注册的点击事件
      this.enterTimer && clearTimeout(this.enterTimer); // 清除鼠标悬浮的计时器
    },
    methods: {
      onToggle() {
        if (this.$props.disabled) return;
        this.$data.visible = !this.$data.visible;
      },

      clickOutside(e) {

        if (this.$refs['toggle']?.contains(e.target) || this.$refs['popper']?.contains(e.target)) {
          return;
        }
        this.$data.visible = false;
      },

      createPopper() {
        this.$data.created = true; // 第一次创建时，打开该开关

        this.$nextTick(() => {
          try {

            const toggle = this.$refs['toggle'];
            const popper = this.$refs['popper'];
            const arrow = this.$refs['arrow'];

            if (!toggle || !popper) return;

            if (this.popperInstance && this.popperInstance.hasOwnProperty('destroy')) {
              this.popperInstance.destroy();
            }

            let options = this.$props.options || {};
            options.placement = this.$props.placement;
            if (this.$props.appendArrow) {
              this.createArrow(popper);
            }
            options.onCreate = () => {
              this.$nextTick(this.updatePopper);
              this.$emit('created', this);
            };


            this.popperInstance = Popper.createPopper(toggle, popper, options);
          } catch (err) {
            this.$data.created = false; // 如果创建失败，则重置开关为 false
            console.warn('popperInstance create error: ', err);
          }
        });

      },

      updatePopper() {
        this.popperInstance ? this.popperInstance.update() : this.createPopper();
      },

      createArrow(element) {
        if (this.appendedArrow) {
          return;
        }
        this.appendedArrow = true;
        const arrow = document.createElement('div');
        arrow.setAttribute('data-popper-arrow', true);
        arrow.className = 'popper__arrow';
        element.appendChild(arrow);
      },

      onMouseenter() {
        if (this.disabled) return;

        if (this.trigger !== 'hover') {
          return false;
        }
        if (this.enterTimer) clearTimeout(this.enterTimer);
        this.enterTimer = setTimeout(() => {
          this.visible = true;
        }, 100);
      },
      onMouseleave() {
        if (this.trigger !== 'hover') {
          return false;
        }
        if (this.enterTimer) {
          clearTimeout(this.enterTimer);
          this.enterTimer = setTimeout(() => {
            this.visible = false;
          }, 100);
        }
      },
    }
  }
</script>

<style scoped>

</style>