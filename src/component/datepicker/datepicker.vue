<template>
  <pg-popper
      class="pg-datepicker-wrapper"
      :placement="quickable ? 'bottom-end' : placement"
      trigger="click"
      :disabled="is_disabled"
      v-model="visiblePopper"
      @created="popperCreated"
      :width="popperWidth"
      :appendToBody="appendToBody"
  >
    <div v-if="quickable" class="quick-range">
      <pg-button :size="size" @click.stop="setFixDateRange(1)" :disabled="is_disabled">今天</pg-button>
      <pg-button :size="size" @click.stop="setFixDateRange(2)" :disabled="is_disabled">昨天</pg-button>
      <pg-button :size="size" @click.stop="setFixDateRange(6)" :disabled="is_disabled">本月</pg-button>
      <pg-button :size="size" @click.stop="setFixDateRange(7)" :disabled="is_disabled">上月</pg-button>
    </div>
    <pg-input
        class="pg-picker flex-grow-1"
        :size="size"
        :style="`width: ${popperWidth}; min-width: ${popperWidth}`"
        :text-align="textAlign"
        :valid="false"
        :disabled="is_disabled"
        :material="material"
        :flat="flat"
        readonly
        :clearable="clearable"
        :placeholder="placeholderText"
        :value="label"
        @click.stop="onToggle"
        @clear="onClear"
        @mouseenter="isHover=true"
        @mouseleave="isHover=false"
    >
      <template slot="suffix">
        <span @click.stop="onToggle">
          <i class="icon-calendar font-size-sm font-weight-bolder pr-10 pl-5"></i>
        </span>
      </template>
    </pg-input>

    <template v-slot:content>
      <div class="pg-daterangepicker" v-if="range">
        <div class="panel">
          <pg-calendar
              v-if="!showTimer"
              v-model="days"
              :range="range"
              :limit="limit"
              @change="changeDays"
          ></pg-calendar>
          <ul class="timers list-unstyled" v-else>
            <li class="timer">
              <h3 class="day">{{ days[0] }}</h3>
              <pg-timer v-model="times[0]" type="hh:mm:ss"></pg-timer>
            </li>
            <li class="timer">
              <h3 class="day">{{ days[1] }}</h3>
              <pg-timer v-model="times[1]" type="hh:mm:ss"></pg-timer>
            </li>
          </ul>
          <div class="footer">
            <pg-button
                v-if="timeable"
                :disabled="days.length < 2"
                flat
                color="primary"
                size="sm"
                @click="selectTime = !selectTime"
            >
              {{ selectTime ? '返回日期选择' : '选择时间' }}
            </pg-button>
            <div class="ml-auto">
              <pg-button size="sm" @click="cancel">取消</pg-button>
              <pg-button size="sm" color="primary" @click="confirm" :disabled="days.length < 2">确定</pg-button>
            </div>
          </div>
        </div>
      </div>
      <div class="pg-datepicker" v-else>
        <pg-calendar
            v-model="days"
            :range="range"
            :limit="limit"
            @change="changeDays"
            v-if="!showTimer"
            å></pg-calendar>
        <div class="timer" v-else>
          <h3 class="day">{{ days[0] }}</h3>
          <pg-timer v-model="times[0]" type="hh:mm:ss"></pg-timer>
        </div>
        <div class="footer" v-if="timeable">
          <pg-button
              v-if="timeable"
              :disabled="days.length === 0"
              flat
              color="primary"
              size="sm"
              @click="selectTime = !selectTime"
          >
            {{ selectTime ? '返回日期选择' : '选择时间' }}
          </pg-button>
          <pg-button size="sm" @click="cancel">取消</pg-button>
          <pg-button size="sm" color="primary" @click="confirm" :disabled="days.length < 1">确定</pg-button>
        </div>
      </div>
    </template>
  </pg-popper>
</template>

<script>

  import pgCalendar from './calendar';
  import pgTimer from './../timepicker/timer';
  import pgButton from '../button/button';
  import {findUpComponent} from "../_util/assist";
  import {formatDate, fixDateRange} from '../_util/date';

  export default {
    name: 'pg-datepicker',
    components: {pgCalendar, pgTimer, pgButton},
    props: {
      value: {type: Object | String, default: {}},
      beginDateKey: {type: String, default: 'begin_date'},
      endDateKey: {type: String, default: 'end_date'},
      limit: {
        type: Object,
        default() {
          return {from: '', to: ''};
        },
      },
      size: {
        type: String,
        default: 'base',
        validator: v => ['lg', 'sm', 'base'].includes(v),
      },
      placeholder: {type: String, default: ''},
      range: {type: Boolean, default: false},
      quickable: { type: Boolean, default: false },
      clearable: {type: Boolean, default: false},
      loading: {type: Boolean, default: false},
      disabled: {type: Boolean, default: false},
      appendToBody: {type: Boolean, default: true},
      flat: {type: Boolean, default: false}, // 是否显示平面btn
      timeable: { type: Boolean, default: false },  // 是否开启时间选择
      placement: { type: String, default: 'bottom-start' } // // bottom-start or bottom-end
    },
    model: {
      prop: 'value',
      event: 'change',
    },
    watch: {
      value: {
        handler(next, prev) {
          // 判断两次是否变化
          if (this.pgFormItem?.sync) {

            if (this.$props.range) {
              const {beginDateKey, endDateKey} = this.$props;
              if (next[beginDateKey] !== prev[beginDateKey] || next[endDateKey] !== prev[endDateKey]) {
                this.pgFormItem.sync?.({ [beginDateKey]: next[beginDateKey], [endDateKey]: next[endDateKey] });
              }
            } else {
              this.pgFormItem.sync?.(next);
            }

          }
          this.initData(next);
        },
      },
      visiblePopper(v) {
        if (!v && this.$data.selectTime) {
          let _timer = setTimeout(() => {
            this.$data.selectTime = false;
            clearTimeout(_timer);
          }, 500);
        }
      }
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },

      label() {
        const { range, value, beginDateKey, endDateKey } = this.$props;
        if (range) {
          return value[beginDateKey] && value[endDateKey] ? `${value[beginDateKey]} ~ ${value[endDateKey]}` : '';
        } else {
          return value;
        }
      },

      placeholderText() {
        if (this.$props.placeholder) {
          return this.$props.placeholder;
        }

        if (this.$props.range) {
          return this.$props.timeable ? '开始时间 ~ 结束时间' : '开始日期 ~ 结束日期';
        } else {
          return this.$props.timeable ? '选择时间' : '选择日期';
        }
      },

      showTimer() {
        return this.$props.timeable
          && this.$data.selectTime
          && (this.$props.range ? this.$data.days.length === 2 : this.$data.days.length === 1);
      },
    },
    data() {
      return {
        visiblePopper: false,
        isHover: false,
        days: [],
        times: [],

        selectTime: false,

        popperWidth: 'auto'
      };
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    created() {
      let val = this.$props.value;
      if (this.$props.range) {
        const {beginDateKey, endDateKey} = this.$props;
        if (val[beginDateKey] || val[endDateKey]) {
          this.pgFormItem?.sync?.({ [beginDateKey]: val[beginDateKey], [endDateKey]: val[endDateKey] })
        }
      } else {
        val && this.pgFormItem?.sync?.(val);
      }
      this.initData(val);
    },
    mounted() {
      let width = window.getComputedStyle(this.$el).width;
      if (this.$props.quickable) {
        width = parseFloat(width) - 236 + 'px'; // 236 为 quickable 按钮的宽度；
      }
      this.$data.popperWidth = width;
    },
    methods: {

      onToggle(e) {
        if (this.is_disabled) {
          e.stopPropagation();
        }
      },

      initData(val) {

        if (this.$props.timeable) {

          if (!this.$props.range) {
            val = val.split(' ');
            this.$data.days = [val[0]].filter(item => !!item);
            this.$data.times = [val[1]];
            return;
          }

          let begin = val[this.$props.beginDateKey] || '';
          let end = val[this.$props.endDateKey] || '';

          begin = begin.split(' ');
          end = end.split(' ');
          this.$data.days = [begin[0], end[0]].filter(item => !!item);
          this.$data.times = [begin[1], end[1]].filter(item => !!item);

        } else {

          if (!this.$props.range) {
            this.$data.days = [val].filter(item => !!item);
            return;
          }
          let begin = val[this.$props.beginDateKey] || '';
          let end = val[this.$props.endDateKey] || '';
          this.$data.days = [begin, end].filter(item => !!item);
        }

      },

      // 改变日期
      changeDays(v) {

        if (!this.$props.timeable && !this.$props.range) {
          this.$emit('change', v[0]);
          this.visiblePopper = false;
        }

      },
      onClear() {

        // 如果是 borderless 模式，则重置 popper 层的位置
        if (this.$props.borderless) {
          this.$nextTick(() => {
            this.popperComp && this.popperComp.updatePopper();
          })
        }

        if (!this.$props.range) {
          this.$emit('change', '');
          return;
        }

        this.$data.days = ['', ''];
        this.$data.times = ['', ''];
        this.submit();

      },

      confirm() {
        let list = [...this.$data.days];
        let date = new Date();

        if (this.$props.range) {

          if (list.length === 1) {
            let today = formatDate({year: date.getFullYear(), month: date.getMonth(), date: date.getDate()});
            if (new Date(list[0]) > new Date(today)) {
              list.unshift(today);
            } else {
              list.push(today);
            }
          }

        } else {

          let day = this.$data.days[0];
          let time = this.$data.times[0];

          if (!day) {
            let today = formatDate({year: date.getFullYear(), month: date.getMonth(), date: date.getDate()});
            list = [today];
          }

          if (!time) {
            this.$data.times = [
              [date.getHours(), date.getMinutes(), date.getSeconds()]
                .map(d => (d+='')[1] ? d : '0'+d)
                .join(':')
            ];
          }

        }

        this.$data.days = list;
        this.submit();
        this.$data.visiblePopper = false;
      },

      submit() {

        // 如果是 borderless 模式，则重置 popper 层的位置
        if (this.$props.borderless) {
          this.$nextTick(() => {
            this.popperComp && this.popperComp.updatePopper();
          })
        }

        // 范围模式
        if (this.$props.range) {

          let {beginDateKey, endDateKey, timeable} = this.$props;
          let { days, times } = this.$data;
          let val = {};

          if (timeable) {
            let begin = days[0];
            let end = days[1];
            begin && (begin += times[0] ? (' ' + times[0]) : ' 00:00:00');
            end && (end += times[1] ? (' ' + times[1]) : ' 23:59:59');

            val[beginDateKey] = begin;
            val[endDateKey] = end;

          } else {
            val[beginDateKey] = days[0];
            val[endDateKey] = days[1];
          }

          this.$emit('change', {...this.$props.value, ...val});

        } else {  // 单选模式

          let day = this.$data.days[0];

          if (this.$props.timeable) {
            let time = this.$data.times[0];

            this.$emit('change', day + ' ' + time);
          } else {
            this.$emit('change', day);
          }

        }
      },

      // 还原初始值
      cancel() {
        this.initData(this.$props.value);
        this.$data.visiblePopper = false;
      },

      popperCreated(comp) {
        this.popperComp = comp;
      },
      setFixDateRange(type) {
        this.$data.days = fixDateRange(type).map(formatDate);
        this.submit();
        this.$data.visiblePopper = false;
      },
    },
  };
</script>

<style scoped>

</style>
