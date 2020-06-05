<template>
  <div class="pg-timer">
    <ul ref="hh">
      <li
          v-for="h in hh"
          :key="'hh-' + h"
          @click="select_h(h)"
          :class="ev[0] === h && 'active'"
      >{{h}}</li>
    </ul>
    <ul ref="mm">
      <li
          v-for="m in mm"
          :key="'mm-' + m"
          @click="select_m(m)"
          :class="ev[1] === m && 'active'"
      >{{m}}</li>
    </ul>
    <ul ref="ss" v-if="type !== 'hh:mm'">
      <li
          v-for="s in ss"
          :key="'ss-' + s"
          @click="select_s(s)"
          :class="ev[2] === s && 'active'"
      >{{s}}</li>
    </ul>
  </div>
</template>

<script>
  import { scrollTop } from '../_util/assist';
  export default {
    name: 'pg-timer',
    props: {
      value: {type: String, default: ''},
      type: { type: String, default: 'hh:mm:ss' },
      visible: { type: Boolean, default: false }

    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      let v = this.$props.value;
      if (!v) {
        v = ['00', '00', '00'];
      } else {
        v = v.split(':');
      }

      return {
        ev: v,

        hh: [],
        mm: [],
        ss: []
      }
    },
    watch: {
      value(v) {
        if (v) {
          this.$data.ev = v.split(':');
        } else {
          this.$data.ev === ['00', '00', '00'];
        }
      },
      visible(val) {
        if (val) {
          this.initScroll();
        }
      },
    },
    created() {
      this.$data.hh = this.createList(24);
      this.$data.mm = this.createList(60);
      this.$data.ss = this.createList(60);
    },
    mounted() {
      this.initScroll();
    },
    methods: {

      submit() {
        let v = this.$data.ev;
        if (this.$props.type === 'hh:mm') {
          v = v.slice(0, 2);
        }

        v = v.join(":");
        this.$emit('change', v);
      },

      select_h(h) {
        this.$set(this.$data.ev, 0, h);
        this.scroll('hh', Number(h));
        this.submit();
      },

      select_m(m) {
        this.$set(this.$data.ev, 1, m);
        this.scroll('mm', Number(m));
        this.submit();
      },

      select_s(s) {
        this.$set(this.$data.ev, 2, s);
        this.scroll('ss', Number(s));
        this.submit();
      },

      scroll (type, index) {
        const from = this.$refs[type].scrollTop;
        const to = 30 * index;
        scrollTop(this.$refs[type], from, to, 900);
      },

      initScroll() {

        let val = this.$data.ev;
        let hh = this.$refs['hh'];
        let mm = this.$refs['mm'];
        let ss = this.$refs['ss'];

        // 同步日期选择器的位置
        if (hh && hh.scrollTop !== Number(val[0]) * 30) {
          this.$nextTick(() => { hh.scrollTop = Number(val[0]) * 30 });
        }
        if (mm && mm.scrollTop !== Number(val[1]) * 30) {
          this.$nextTick(() => { mm.scrollTop = Number(val[1]) * 30 });
        }
        if (ss && ss.scrollTop !== Number(val[2]) * 30) {
          this.$nextTick(() => { ss.scrollTop = Number(val[2]) * 30 });
        }
      },

      createList(length) {
        return Array.from({length: length}).map((d, i) => (i += '')[1] ? i : '0' + i)
      },

    }
  };
</script>

<style scoped>

</style>
