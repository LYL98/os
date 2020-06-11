<template>
  <li class="pg-option" :class="{active, disabled}" @click.stop="onClick" v-show="isShow">
    <slot></slot>
  </li>
</template>

<script>

  export default {
    name: "pg-option",
    props: {
      value: {type: String | Number, default: ''},
      item: {type: Object, default: null}, // 支持 object 类型数据的绑定
      disabled: { type: Boolean, default: false },
    },
    inject: ['pgSelect'],

    data() {
      return {
        label: '',
      }
    },

    computed: {
      isShow() {
        if (!this.pgSelect?.searchable) return true;
        return this.pgSelect?.pinyinEngine.query(this.pgSelect?.keywords || '').find(item => item.label === this.label);
      },
      active() {
        return this.pgSelect?.$props?.value === this.$props.value;
      }
    },

    /**
     * option组件加载后，更新父组件的options列表，当前版本不支持从api异步获取的场景。
     */
    mounted() {
      this.updateOptions();
    },
    beforeDestory() {
      this.destoryOptions();
    },

    methods: {
      updateOptions() {
        let options = this.pgSelect?.$data?.slotOptions;
        if (!Array.isArray(options)) return;
        this.$data.label = this.$slots.default[0].text || '';
        if (!options.some(d => d.value === this.value)) {
          options.push({ label: this.label, value: this.value });
        }
        this.pgSelect.$data.slotOptions = options;
      },
      destoryOptions() {
        let options = this.pgSelect?.$data?.slotOptions;
        if (!Array.isArray(options)) return;
        this.pgSelect.$data.slotOptions = options.filter(item => item.value !== this.$props.value);
      },
      onClick() {
        if (this.$props.disabled) return;
        this.pgSelect?.onSelect?.(this.$props.value);
        this.$emit('click', this.$props.item);
      }
    }
  }
</script>

<style scoped>

</style>