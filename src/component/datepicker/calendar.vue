<template>
  <div class="calendars">
    <div class="pg-calendar" v-for="(calendar, index) in calendars" :key="index === 0 ? 'main' : 'auxil'">
      <table class="pg-table-calendar">
        <thead>
        <tr>
          <th class="prev available" @click="onPrevYear">
            <i class="icon-backward2 font-size-lg"></i>
          </th>
          <th class="prev available" @click="onPrev">
            <i class="icon-arrow-left5"></i>
          </th>

          <th colspan="3" class="month">{{ calendar.year }} 年 {{ calendar.month + 1 }} 月</th>

          <th class="next available" @click="onNext">
            <i class="icon-arrow-right5"></i>
          </th>
          <th class="next available" @click="onNextYear">
            <i class="icon-forward3 font-size-lg"></i>
          </th>
        </tr>
        <tr>
          <th>日</th>
          <th>一</th>
          <th>二</th>
          <th>三</th>
          <th>四</th>
          <th>五</th>
          <th>六</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(week, index) in calendar.weeks" :key="index">
          <!--
          available: 日期可选择
          current: 当日
          off: 非本月的日期
          disabled: 日期禁用
          active: 选中的日期
          range: 是否在选择范围内
          begin: 范围内开始日期
          end: 范围内结束日期
        -->
          <td v-for="day in week" :key="day.date" @click.stop="onSelect(day)" @mouseenter="enterDay=day"
              class="available" :class="{
              current: day.year === today.year && day.month === today.month && day.date === today.date,
              off: day.month !== calendar.month || day.year !== calendar.year,
              disabled: day.disabled,
              active: selected.some(item => item.year === day.year && item.month === day.month && item.date === day.date)
                            && day.year === calendar.year
                            && day.month === calendar.month,
              range: (range && selected.length === 2
                       && new Date(day.year, day.month, day.date) >= new Date(selected[0].year, selected[0].month, selected[0].date)
                       && new Date(day.year, day.month, day.date) <= new Date(selected[1].year, selected[1].month, selected[1].date)
                     ) || (range && selected.length === 1
                          && new Date(day.year, day.month, day.date) >= new Date(selected[0].year, selected[0].month, selected[0].date)
                          && new Date(day.year, day.month, day.date) <= new Date(enterDay.year, enterDay.month, enterDay.date)
                     )
            }">
            {{day.date}}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>

<script>

  import { formatDate, convertDate, prevMonth, nextMonth, generateCalendar } from '../_util/date';

  export default {
    name: 'pg-calendar',
    props: {

      // 指定 calendar 需要渲染的日期值
      value: {
        type: Array,
        required: true,
        validator: vs => vs.every(v => (!v || /^(19|20)\d{2}\-((0?[1-9])|(1[0-2]))\-((0?[1-9])|([1-2]\d)|3[01])$/.test(v)))
      },
      limit: { type: Object, default() { return { from: '', to: '' } } },
      range: { type: Boolean, default: false },
    },

    model: {
      prop: 'value',
      event: 'change'
    },

    data() {
      let now = new Date();
      let today = { year: now.getFullYear(), month: now.getMonth(), date: now.getDate() + 4 };
      return {

        year: now.getFullYear(),
        month: 0,

        selected: [],

        enterDay: {},

        today: today,

      }
    },
    computed: {

      /**
       *                           GET                                       SET
       *    '2019-10-01' 格式    -------->    { year, month, date } 格式    -------->    '2019-10-01' 格式
       *
       */
      current: {
        get() {
          // 转换 str 为 date 格式数据，并清除空值
          return this.$props.value
            .map(v => v && convertDate(v))
            .filter(item => !!item);
        },
        set(vs) {
          this.$emit('change', vs.map(formatDate));
        }
      },
      calendars() {
        let { year, month } = this.$data;
        let vs = [generateCalendar(year, month, this.$props.limit)];
        if (!this.$props.range) {
          return vs;
        }

        let next = nextMonth(year, month);
        vs.push(generateCalendar(next.year, next.month, this.$props.limit));
        return vs;
      }

    },
    watch: {
      /**
       *                 单向同步
       *     current    -------->     year、month
       */

      // []、['', ''], ['2019-10-30', ''], ['2019-10-30', '2019-12-31']
      current: {
        immediate: true,
        deep: true,
        handler(vs) {
          // 同步 selected
          this.$data.selected = vs;

          // current 初始值为空的情况下，设置panel为当前日期
          if (vs.length === 0) {
            let day = new Date();
            this.$data.year = day.getFullYear();
            this.$data.month = day.getMonth();
            return;
          }

          // current 有值的情况下，检测year、month 与 current 是否同步状态，如果同步，则不做处理
          let { year, month } = this.$data;
          if (vs[0].year === year && vs[0].month === month) {
            return;
          }
          // range 模式下 开始时间和结束时间，都在右侧日历板(2019-12 2020-1)，不做任何处理 ||
          if (this.$props.range && (vs[0].month - month === 1 || (vs[0].month - month === -11 && vs[0].year - year === 1))) {
            return;
          }
          // 在current 异步更新后，同步panel
          this.$data.year = vs[0].year;
          this.$data.month = vs[0].month;
        }
      },

    },
    methods: {

      onSelect(day) {

        // 单选模式
        if (!this.$props.range) {
          return this.current = [day];
        }

        let list = [...this.$data.selected];
        let length = list.length;

        // 如果点击了 左侧上一个月的日期 则刷新 日历
        if (day.month - this.$data.month === -1 || (day.month - this.$data.month === 11 && day.year - this.$data.year === -1)) {
          this.$data.year = day.year;
          this.$data.month = day.month;
        }

        if (length === 1) {
          // 如果第二次选择的日期 小于 当前已选中的日期
          if (new Date(day.year, day.month, day.date) < new Date(list[0].year, list[0].month, list[0].date)) {
            list = [day]

          } else {

            //  如果第一个选择的日期在右侧日历板 并且 第二次选择的日期是右侧的下一个月的日期
            if ((Math.abs(list[0].month - this.$data.month) === 1 || Math.abs(list[0].month - this.$data.month) === 11)
              && (Math.abs(day.month - this.$data.month) === 2 || Math.abs(day.month - this.$data.month) === 10)
            ) {
              this.$data.year = list[0].year;
              this.$data.month = list[0].month;
            }

            list.push(day);
            // this.current = list;
            // return;
          }

        } else {
          // 如果点击了 右侧下一月的日历 则刷新 日历
          if (Math.abs(day.month - this.$data.month) === 2 || Math.abs(day.month - this.$data.month) === 10) {
            this.$data.year = day.year;
            this.$data.month = day.month;
          }
          list = [day];

        }



        // this.$data.selected = list;
        this.current = list;

      },

      initToday() {
        let today = new Date();
        this.$data.today = { year: today.getFullYear(), month: today.getMonth(), date: today.getDate() };
      },

      onPrev() {
        let { year, month } = prevMonth(this.$data.year, this.$data.month);
        this.$data.year = year;
        this.$data.month = month;
      },
      onPrevYear() {
        this.$data.year--;
      },
      onNext() {
        let { year, month } = nextMonth(this.$data.year, this.$data.month);
        this.$data.year = year;
        this.$data.month = month;
      },
      onNextYear() {
        this.$data.year++;
      }
    }
  };
</script>
