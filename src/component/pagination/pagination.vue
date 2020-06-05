<template>
  <div class="pg-pagination">

    <div class="pg-pagination__state">
      <span class="pg-pagination__text">共 <strong>{{ num }}</strong> 条</span>
    </div>

    <div class="pg-pagination__operate">

      <pg-select
          size="sm"
          v-model="page_size"
          flat
          text-align="center"
          :clearable="false"
          style="width: 60px"
      >
        <pg-option :value="10">10</pg-option>
        <pg-option :value="20">20</pg-option>
        <pg-option :value="30">30</pg-option>
        <pg-option :value="40">40</pg-option>
        <pg-option :value="50">50</pg-option>
      </pg-select>

      <span class="pg-pagination__text">条 / 页</span>

      <pg-button square size="sm" style="margin-right: -1px;" :disabled="page === 1" @click="page=1">
        <i class="icon-previous2 font-size-lg"></i>
      </pg-button>

      <pg-button square size="sm" style="margin-right: -1px;" :disabled="page === 1" @click="page-=1">
        <i class="icon-arrow-left5"></i>
      </pg-button>

      <pg-input type="number" size="sm" style="width: 60px;" :value="page" text-align="center" @keyup.enter.native="changePage"/>
      <span class="pg-pagination__totalpage"> / {{ total }} 页</span>

      <pg-button square size="sm" style="margin-left: -1px;" :disabled="page === total" @click="page+=1">
        <i class="icon-arrow-right5"></i>
      </pg-button>

      <pg-button square size="sm" style="margin-left: -1px;" :disabled="page === total"  @click="page=total">
        <i class="icon-next2 font-size-lg"></i>
      </pg-button>

    </div>

  </div>
</template>

<script>

  import pgButton from './../button/button';
  import pgSelect from './../select/select';
  import pgOption from './../select/option';
  import pgInput from './../input/input';

  export default {
    name: "pg-pagination",
    components: {
      pgButton, pgSelect, pgOption, pgInput
    },
    props: {
      num: { type: Number, default: 0 }, // 总共多少条记录
      query: {
        type: Object,
        validator: v => v && v['page'] !== undefined && v['page_size'] !== undefined,
        default() { return { page: 1, page_size: 20 }; }
      }, // 列表的查询对象
    },
    model: {
      prop: 'query',
      event: 'change'
    },
    computed: {
      total() {
        return Math.ceil(this.$props.num / this.$props.query.page_size);
      },
      page: {
        get() {
          return this.$props.query.page;
        },
        set(v) {
          let query = { ...this.$props.query };
          if (v <= 0) v = 1;
          if (v > this.total) v = this.total;
          query.page = v;
          this.$emit('change', query);
        }
      },
      page_size: {
        get() {
          return this.$props.query.page_size;
        },
        set(v) {
          let query = { ...this.$props.query };
          query.page = 1;
          query.page_size = Number(v);
          this.$emit('change', query);
        }
      }

    },

    methods: {
      changePage(e) {
        this.page = e.target.value;
      },
      prePage() {
        if (this.page <= 1) return;
        this.page = this.page - 1;
      },
      nextPage() {
        if (this.page >= this.total) return;
        this.page = this.page + 1;
      },
    }
  }
</script>

<style scoped>

</style>