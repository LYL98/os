<template>

  <!--  支持 横向排列 和 纵向排列 两种模式 -->
  <div class="pg-form-item" :class="classnames">

    <label
        class="form-item-label"
        :class="{required}"
        :style="`min-width: ${_vertical_ ? 'auto' : _label_width_}; width: ${_vertical_ ? 'auto' : _label_width_}`"
        v-if="showLabel && label"
    >{{label}}{{pgForm && pgForm.type !== 'query' ? ':' : ''}}</label>

    <div class="form-item-content" :style="`min-width: ${_item_width_}; width: ${_item_width_}`">
      <slot></slot>

      <!--   反馈信息容器，包含：验证消息 和 帮助信息   -->
      <div class="form-item-feedback">
        <div class="validate-text" v-if="errors.length > 0">{{errors[0].msg}}</div>
        <div class="help-text" v-if="helpText">{{ helpText }}</div>
      </div>
    </div>

  </div>

</template>

<script>
  import createValidator from '../_util/validator';

  export default {
    name: 'pg-form-item',
    provide() {
      return {
        pgFormItem: this,
      };
    },
    inject: ['pgForm'],
    props: {
      size: {type: String, default: '', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      label: { type: String, default: '' },
      labelWidth: { type: String, default: '' },
      itemWidth: { type: String, default: '' },
      showLabel: { type: Boolean, default: true },
      helpText: { type: String, default: '' },
      vertical: { type: Boolean, default: false }, // label 和 form-content 垂直排列
      /**
       * string: 'required|phone|integer|decimal:2|max_value:100000|min_value:0',
       * object: { required: true, 'decimal:2': true, 'servie':  }
       */

      rules: { type: Object | String, default: '' },
    },

    watch: {
      rules: {
        immediate: true,
        deep: true,
        handler(val) {
          try {
            this.$data.validator = createValidator(val, this.$props.label);
            this.$data.required = this.$data.validator.some(item => item.key === 'required');
          } catch (e) {
            console.warn("createValidator fail: ", e);
          }
        },
      },
    },

    computed: {
      disabled() {
        return this.pgForm?.$props?.disabled;
      },
      readonlay() {
        return this.pgForm?.$props?.readonlay;
      },
      // label width
      _label_width_() {
        if (this.$props.labelWidth) return this.$props.labelWidth;
        if (this.pgForm?.labelWidth) return this.pgForm.labelWidth;
        if (this.pgForm?.type === 'query') return '70px';
        return '70px';
      },
      // item width
      _item_width_() {
        if (this.$props.itemWidth) return this.$props.itemWidth;
        if (this.pgForm?.itemWidth) return this.pgForm.itemWidth;
        return 'auto';
      },
      // vertical model
      _vertical_() {
        if (this.$props.vertical) return true;
        return !!this.pgForm?.vertical;
      },
      _size_() {
        let size = this.$props.size;
        // 如果size 不存在，则判断 form 的 size 属性
        if (!size) {
          if (this.pgForm?.size && this.pgForm?.size !== 'base') {
            size = this.pgForm.size;
          }
        }
        return size;
      },
      classnames() {
        let classnames = {
          'has-help-text': !!this.$props.helpText,
          'has-error': this.$data.errors.length > 0,
          vertical: this._vertical_,
        };

        if (!!this._size_) {
          classnames[this._size_] = true;
        }

        return classnames;
      },
      nonEmpty() {
        return this.$data.validator.filter(item => item.key === 'required');
      },
      changed() {
        return this.$data.validator.filter(item => item.key !== 'required' && !item.blur);
      },
      blured() {
        return this.$data.validator.filter(item => item.key !== 'required' && item.blur);
      },
    },

    data() {
      return {
        validator: [],
        errored: [],
        errors: [],
        v: '',
        isBlured: false,
        required: false
      };
    },

    /**
     * 校验分为：非空校验、逻辑校验、关联校验
     *
     */
    methods: {
      reset() {
        this.$forceUpdate();
      },
      // 需要校验项的值
      sync(v) {
        this.$data.v = v;
        if (this.$data.v === '' && (!this.$data.required)) {
          this.$data.errors = [];
          return;
        }
        this.onChange();
      },
      // 校验项发生变化时的值
      validate() {
        if (this.$data.v === '' && (!this.$data.required)) {
          this.$data.errors = [];
          return;
        }
        this.onChange();
        !this.$data.isBlured && this.onBlur();
        return this.$data.errors;
      },

      onChange() {
        let v = this.$data.v;

        // 第一步非空校验
        let errors = this.nonEmpty.map(item => item.validate(v)).filter(item => !!item);

        if (errors.length === 0) {

          // 第二步 不包含 blur 的项目
          errors = this.changed.map(item => item.validate(v)).filter(item => !!item);
          /*在change的时候只判断已有的错误，失焦事件在失焦时判断*/
          this.blured.filter(item => this.$data.errored.some(key => key === item.key))
            .forEach(item => {
              if (item.validate(v)) {
                errors.push(item.validate(v));
              }
            });
        }

        this.$data.errors = errors;
      },

      onBlur() {
        let v = this.$data.v;
        if(!(v + '').trim()) return;
        // 触发一次后，设置为已经失去过焦点
        this.$data.isBlured = true;


        let errors = this.$data.errors; // 当前的错误列表
        let errored = this.$data.errored; // 已经出现过的错误列表

        this.blured.forEach(item => {
          let error = item.validate(v);
          if (error) {
            // 向里边推入错误，需要将之前相同的清除掉

            errored.push(item.key);
            errored = errored.filter((key, index, array) => array.indexOf(key) === index);

            errors = [
              ...(errors.filter(item => item.key !== error.key)),
              error
            ];
          }
        });
        this.$data.errors = errors;
        this.$data.errored = errored;
      },
    }

  };
</script>

<style scoped>

</style>
