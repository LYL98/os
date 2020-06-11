<template>
  <div class="pg-search">
    <pg-input
        :size="size"
        :placeholder="placeholder"
        :auto-focus="autoFocus"
        :disabled="disabled"
        :material="material"
        :flat="flat"
        :clearable="clearable"
        :valid="false"
        :value="ev"
        @keyup.enter.native="onSubmit"
        @clear="onClear"
        @change="onChange"
    >
      <template slot="prefix" v-if="immediate">
        <i class="icon-search4 immediate ml-5" :class="`${disabled ? 'cursor-not-allowed' : ''}${size !== ' base' ? size : ''}`"></i>
      </template>
      <template slot="suffix" v-else>
        <i v-if="autoComplete" class="icon-search4 mr-10 ml-10" :class="`${disabled ? 'cursor-not-allowed' : ''}${size !== ' base' ? size : ''}`"></i>
        <pg-button
            v-else
            square
            flat
            :size="size"
            color="light"
            @click.stop="onSubmit"
            :disabled="disabled"
        >
          <i class="icon-search4" :class="`${disabled ? 'cursor-not-allowed' : ''}${size !== ' base' ? size : ''}`"></i>
        </pg-button>
      </template>
    </pg-input>
    <!-- input focus时显示   -->
    <ul class="pg-search-result" v-if="autoComplete && ev && popper_visible">
      <li class="empty" v-if="results.length === 0">没有找到结果，请重新输入</li>
      <li v-for="item in results" :key="item.value" @click="onSelect(item)">{{ item.label }}</li>
    </ul>
  </div>
</template>

<script>

  import PinyinEngine from '../_util/pinyin';
  import pgInput from './../input/input';
  import pgButton from './../button/button';
  import {debounce} from '../_util/assist';

  export default {
    name: "pg-search",
    components: {
      pgInput,
      pgButton
    },
    props: {
      placeholder: {type: String, default: '搜索...'},
      autoComplete: { type: Boolean, default: false },
      options: { type: Array, default() { return []; } },
      value: {type: String | Number, default: ''},
      autoFocus: {type: Boolean, default: false},
      disabled: {type: Boolean, default: false},
      material: {type: Boolean, default: false},
      flat: {type: Boolean, default: false},
      clearable: {type: Boolean, default: false},
      immediate: {type: Boolean, default: false},
      debounce: {type: Boolean, default: false},
      size: {type: String, default: 'base', validator: v => ['lg', 'sm', 'base'].includes(v) }
    },
    model: {
      prop: 'value',
      event: 'sync'
    },
    data() {
      return {
        ev: '',
        popper_visible: true,
      }
    },
    computed: {
      results() {
        if (!this.$props.autoComplete) return [];
        return this.pinyinEngine.query(this.$data.ev || '');
      },
      pinyinEngine() {
        return new PinyinEngine(this.$props.options, ['label']);
      },
    },
    watch: {
      value: {
        deep: true,
        immediate: true,
        handler(v) {
          this.$data.ev = v;
        }
      }
    },
    created() {
      document.addEventListener('click', this.clickOutside);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.clickOutside);
    },
    methods: {
      clickOutside(e) {
        if (this.$el?.contains?.(e.target)) {
          this.$data.popper_visible = true;
          return;
        }
        this.$data.popper_visible = false;
      },
      onChange(v) {
        if (this.$props.immediate) {

          this.$data.ev = v;
          if (this.$props.debounce) {

            if (!this.debounceEmit) {
              this.debounceEmit = debounce(v => {
                this.$emit('sync', v);
                this.$emit('change', v);
              }, 300);
              return;
            }
            this.debounceEmit(v);

          } else {
            this.$emit('sync', v);
            this.$emit('change', v);
          }

        } else {
          this.$data.ev = v;
          this.$emit('sync', v);
        }
      },
      onSelect(item) {
        this.$data.popper_visible = false;
        this.$emit('select', item);
      },
      onSubmit() {
        if (this.$props.disabled) return;
        this.$emit('change', this.$data.ev);
      },
      onClear() {
        this.$data.ev = '';
        this.$emit('sync', '');
        this.$emit('change', '');
      }
    },
  }
</script>

<style scoped>

</style>