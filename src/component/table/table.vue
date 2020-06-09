<template>
  <div :style="fixed && 'padding-top: 50px;'" class="pg-table-wrapper" :class="{borderless}">

    <div ref="fixed-header-root" :class="{'fixed-header': fixed}">
      <table class="pg-table">
        <thead>
        <tr>
          <th v-if="checkable" width="38px" class="px-5 text-center">
            <pg-checkbox class="mr-0 ml-10" :value="checkedAll" @change="onCheckAllToggle"
                         :indeterminate="indeterminate"></pg-checkbox>
          </th>
          <th
              v-if="serialable"
              :width="indexWidth"
              :style="'min-width: ' + indexWidth"
              class="font-weight-bolder px-5 text-center"
          >#
          </th>
          <th v-for="option in options" :width="option.width" :key="option.title">
            {{option.title}}
            <span v-html="option.children[0]" v-if="option.children && option.children[0]"></span>
          </th>
        </tr>
        </thead>
      </table>
    </div>

<!--    <div class="loading-box slide-in-down" v-if="loading">-->
<!--      <i class="icon-spinner2 spinner text-primary"></i><span class="ml-10">加载中...</span>-->
<!--    </div>-->

    <pg-checkbox-group
        v-model="checkedList"
        @change="onCheckChange"
        tag="div"
        :style="`height: ${height}; overflow-y: auto; overflow: overlay;`"
        @scroll="$emit('scroll')"
    >
      <div class="pg-table-empty" v-if="empty && !!placeholder">{{ placeholder }}</div>
      <table class="pg-table" :class="{borderless}" v-if="!empty">
        <tbody>
          <pg-row
              v-for="(item, index) in (data || [])"
              :item="item"
              :key="item[primaryKey]"
              @click.native="onSelectRow(item)"
              :class="highlightRow && selectedRow[primaryKey] === item[primaryKey] ? 'selected' : ''"
          >
            <td v-if="checkable" width="38px" class="px-5 text-center">
              <pg-checkbox class="mr-0 ml-10" :value="item" :true-value="item" :false-value="undefined"></pg-checkbox>
            </td>
            <td
                v-if="serialable"
                :width="indexWidth"
                :style="'color: #666; min-width: ' + indexWidth"
                class="font-weight-bold font-size-sm px-5 text-center"
            >
              {{ (page - 1) * pageSize + index + 1 }}
            </td>
            <slot></slot>
          </pg-row>
        </tbody>
      </table>
    </pg-checkbox-group>
  </div>
</template>

<script>

  import pgCheckbox from './../checkbox/checkbox';
  import pgCheckboxGroup from './../checkbox/checkbox-group';
  import {debounce} from '../_util/assist';

  import Row from './row';

  export default {
    name: 'pg-table',
    components: {
      'pg-row': Row,
      'pg-checkbox': pgCheckbox,
      'pg-checkbox-group': pgCheckboxGroup,
    },
    provide() {
      return {
        pgTable: this
      }
    },
    props: {
      data: {type: Array, default: []},
      primaryKey: {type: String, default: 'id'},
      page: {type: Number, default: 1},
      pageSize: {type: Number, default: 30},
      height: {type: String, default: 'auto'},
      fixedHeader: {type: Boolean, default: false},
      borderless: {type: Boolean, default: false},
      serialable: {type: Boolean, default: true},
      checkable: {type: Boolean, default: false},
      highlightRow: {type: Boolean, default: true},
      loading: {type: Boolean, default: false},
      placeholder: {type: String, default: '查询结果为空...'}
    },
    data() {
      return {
        options: [],
        fixed: false,
        empty: false,
        selectedRow: {},
        checkedList: [],
      }
    },

    computed: {
      indexWidth() {
        let size = (this.$props.page - 1) * this.$props.pageSize;

        if (size < 950) {
          return '38px';
        } else if (size < 999950) {
          return '58px';
        } else {
          return '78px';
        }
      },

      checkedAll() {
        let length = this.$data.checkedList.filter(item => !!item).length;
        if (length === 0) return false;
        return length === this.$props.data.length;
      },

      indeterminate() {
        let length = this.$data.checkedList.filter(item => !!item).length;
        if (length > 0 && length < this.$props.data.length) return true;
        return false;
      },
    },

    watch: {
      data: {
        immediate: true,
        handler(next, prev) {
          this.$data.checkedList = [];
          this.$data.empty = !!(prev && next && next.length === 0);
        }
      },
    },

    created() {
      if (this.$props.fixedHeader) {
        window.addEventListener('scroll', this.onScroll);
      }
    },

    beforeDestroy() {
      if (this.$props.fixedHeader) {
        this.debounceScroll && (this.debounceScroll = undefined);
        window.removeEventListener('scroll', this.onScroll);
      }
    },

    mounted() {
      if (this.$props.fixedHeader) {
        this.offsetTop = this.$refs['fixed-header-root'] ? this.$refs['fixed-header-root'].offsetTop : 0;
      }
      this.$data.options = this.$slots.default?.map?.(item => item.componentOptions.propsData) || [];
    },
    methods: {
      onScroll() {
        if (!this.debounceScroll) {
          this.debounceScroll = debounce(() => {
            this.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            this.$data.fixed = this.scrollTop > this.offsetTop - 10;
          }, 10);
          return;
        }

        this.debounceScroll && this.debounceScroll();

        // this.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        // this.$data.fixed = this.scrollTop > this.offsetTop;
      },
      onSelectRow(item) {
        this.$data.selectedRow = item;
        this.$emit('select-row', item);
      },

      onCheckAllToggle() {
        if (this.checkedAll) {
          this.$data.checkedList = [];
        } else {
          this.$data.checkedList = this.$props.data;
        }

        this.$emit('selection', [...this.$data.checkedList]);
      },

      onCheckChange() {
        this.$emit('selection', this.$data.checkedList.filter(item => !!item));
      }
    }
  };
</script>

<style scoped>

</style>
