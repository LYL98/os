<template>
  <pg-popper :trigger="trigger" v-model="expend" :width="popperWidth" :appendToBody="appendToBody" :disabled="is_disabled">

    <pg-input
        class="pg-select"
        :size="size"
        :style="`width: ${popperWidth};`"
        :text-align="textAlign"
        :valid="false"
        :disabled="is_disabled"
        :material="material"
        :flat="flat"
        readonly
        :clearable="clearable"
        :placeholder="placeholder"
        :value="label"
        @click.stop="onToggle"
        @clear="onClear"
        @mouseenter="isHover=true"
        @mouseleave="isHover=false"
    >
      <template slot="suffix">
        <span @click.stop="onToggle">
          <i class="icon-arrow-down5 pr-5"></i>
        </span>
      </template>
    </pg-input>

    <div class="dropdown-box" slot="content" :style="`width: ${popperWidth};`">

      <div class="filter" v-if="searchable">
        <pg-search v-if="expend" material size="sm" auto-focus immediate :valid="false" v-model="keywords" />
      </div>

      <div class="filter-feedback" v-if="noResults">没有符合条件的结果..</div>

      <ul class="dropdown-list">
        <slot></slot>
      </ul>
    </div>

  </pg-popper>
</template>

<script>
  import PinyinEngine from '../_util/pinyin';
  import pgPopper from './../popper/popper';
  import pgInput from './../input/input';
  import pgSearch from './../search/search';

  import {findUpComponent} from './../_util/assist';

  export default {
    name: "pg-select",
    components: {pgPopper, pgInput, pgSearch},
    directives: {
      focus: {
        inserted(el) {
          el.focus();
        }
      },
    },
    provide() {
      return {
        pgSelect: this
      }
    },
    props: {
      value: {type: String | Number | Array, required: true}, // 当前值
      placeholder: {type: String, default: '请选择'},
      textAlign: { type: String, default: 'left' },
      options: {
        type: Array | undefined, default() {
          return undefined;
        }
      },
      size: {
        type: String,
        default: 'base',
        validator: v => ['lg', 'sm', 'base'].includes(v),
      },
      searchable: {type: Boolean, default: false},
      clearable: {type: Boolean, default: false},
      loading: {type: Boolean, default: false},
      disabled: {type: Boolean, default: false},
      valid: {type: Boolean, default: true},
      material: {type: Boolean, default: false},
      flat: {type: Boolean, default: false},
      trigger: {type: String, default: 'click', validator: v => ['click', 'hover'].includes(v)},
      appendToBody: {type: Boolean, default: true},
      placement: {type: String, default: 'bottom-start'} // // bottom-start or bottom-end
    },
    model: {
      prop: 'value',
      event: 'change',
    },

    data() {
      let ev = this.$props.value;
      if (ev && this.$props.valid) {
        this.pgFormItem?.sync?.(ev);
      }
      return {
        expend: false,
        slotOptions: [],
        popperWidth: 'auto',
        isHover: false,
        keywords: '',
      }
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },

      label() {
        if (!this.$props.multiple) {
          return this.list.filter(item => item.value === this.$props.value || (typeof this.$props.equals === 'function' && this.$props.equals(this.$props.value, item.value)) )
            .map(item => item.label)
            .join(",");
        }
        return this.list.filter(item => (this.$props.value || []).includes(item.value)).map(item => item.label).join(",");
      },
      // 分别从 options 或 slots 中获取list
      list() {
        let options = this.$props.options;
        if (Array.isArray(options)) {
          return options;
        }
        return this.$data.slotOptions;
      },
      pinyinEngine() {
        return new PinyinEngine(this.list, ['label']);
      },
      showClear() {
        // clearable = false 不显示 clear feedback icon
        if (!this.$props.clearable || !this.$data.isHover) return false;
        // 存在值的情况下，允许出现清除按钮
        return this.$props.multiple ? Array.isArray(this.$props.value) && this.$props.value.length > 0 : !!this.$props.value;
      },
      noResults() {
        if (!this.$props.searchable) return false;
        return this.pinyinEngine.query(this.$data.keywords).length === 0;
      },
    },
    watch: {
      value: {
        immediate: false,
        deep: true,
        handler: function (val) {
          this.$props.valid && this.pgFormItem?.sync?.(val);
        }
      }
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    mounted() {
      this.$data.popperWidth = window.getComputedStyle(this.$el).width;
    },
    methods: {
      onToggle(e) {
        if (this.is_disabled) {
          e.stopPropagation();
        }
      },
      onSelect(v) {
        this.$emit('change', v);
        this.$data.expend = false;
        let timer = setTimeout(() => {
          clearTimeout(timer);
          this.$data.keywords = '';
        }, 500);
      },
      onClear() {
        this.$emit('change', this.$props.multiple ? [] : '');
      }
    }
  }
</script>