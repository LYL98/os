<template>
  <div :style="fixed && 'padding-top: 50px;'" class="pg-table-wrapper" :class="{borderless}">

    <div ref="fixed-header-root" :class="{'fixed-header': fixed}">
      <table class="pg-table">
        <thead>
        <tr>
          <th width="20px" v-if="expandable">
<!--            <i class="icon-arrow-right22"></i>-->
          </th>
          <th v-if="checkable" width="38px" class="px-5 text-center">
            <pg-checkbox class="mr-0 ml-10" v-if="checkallable" :value="checkedAll" @change="onCheckAllToggle"
                         :indeterminate="indeterminate"></pg-checkbox>
          </th>
          <th
              v-if="serialable"
              :width="indexWidth"
              :style="'min-width: ' + indexWidth"
              class="font-weight-bolder px-5 text-center"
          >#
          </th>
          <th v-for="option in slots_options" :width="option.width" :key="option.title" :style="`text-align: ${option.textAlign}; ${option.minWidth ? 'min-width: ' + option.minWidth : ''}`">
            <slot :name="option.prop">
              {{option.title}}
            </slot>
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
        v-if="checkable"
        v-model="checkedList"
        @change="onCheckChange"
        tag="div"
        :valid="false"
        :style="`height: ${height}; overflow-y: auto; overflow: overlay;`"
        @scroll="$emit('scroll')"
    >
      <div class="pg-table-empty" v-if="Array.isArray(data) && data.length <= 0 && !!placeholder">
        {{ placeholder }}
      </div>
      <table class="pg-table" :class="{borderless}">
        <tbody>
          <template v-for="(item, index) in (data || [])">
            <pg-row
                :item="item"
                :key="item[primaryKey]"
                @click.native="onSelectRow(item)"
                :class="{selected: highlightRow && selectedRow[primaryKey] === item[primaryKey], expandable: expandable }"
            >
              <td width="20px" v-if="expandable">
                <i class="icon-arrow-right22 cursor-pointer pg-expand-icon" :class="{active: expandable && expand_indexs.includes(index)}" @click="onExpandRow(index)"></i>
              </td>
              <td v-if="checkable" width="38px" class="px-5 text-center">
                <pg-checkbox :disabled="disabledKeys.some(d =>  d === item[primaryKey])" class="mr-0 ml-10" :value="item" :true-value="item" :false-value="undefined"></pg-checkbox>
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
            <tr class="expand-row" v-if="expandable && expand_indexs.includes(index)">
              <td :colspan="colspan" class="p-0">
                <slot name="expand-row" :row="item"></slot>
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </pg-checkbox-group>

    <div v-else :style="`height: ${height}; overflow-y: auto; overflow: overlay;`" @scroll="$emit('scroll')">
      <div class="pg-table-empty" v-if="Array.isArray(data) && data.length <= 0 && !!placeholder">
        {{ placeholder }}
      </div>
      <table class="pg-table" :class="{borderless}">
        <tbody>
        <template v-for="(item, index) in (data || [])">
          <pg-row
              :item="item"
              :key="item[primaryKey]"
              @click.native="onSelectRow(item)"
              :class="{selected: highlightRow && selectedRow[primaryKey] === item[primaryKey], expandable: expandable }"
          >
            <td width="20px" v-if="expandable">
              <i class="icon-arrow-right22 cursor-pointer pg-expand-icon" :class="{active: expandable && expand_indexs.includes(index)}" @click="onExpandRow(index)"></i>
            </td>
            <td v-if="checkable" width="38px" class="px-5 text-center">
              <pg-checkbox :disabled="disabledKeys.some(d =>  d === item[primaryKey])" class="mr-0 ml-10" :value="item" :true-value="item" :false-value="undefined"></pg-checkbox>
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
          <tr class="expand-row" v-if="expandable && expand_indexs.includes(index)">
            <td :colspan="colspan" class="p-0">
              <slot name="expand-row" :row="item"></slot>
            </td>
          </tr>
        </template>

        </tbody>
      </table>
    </div>
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
      data: {type: Array, default: null},
      primaryKey: {type: String, default: 'id'},
      page: {type: Number, default: 1},
      pageSize: {type: Number, default: 20},
      height: {type: String, default: 'auto'},
      fixedHeader: {type: Boolean, default: false},
      borderless: {type: Boolean, default: false},
      serialable: {type: Boolean, default: true},
      checkable: {type: Boolean, default: false},
      checkallable: {type: Boolean, default: true}, // 是否显示全选的按钮
      disabledKeys: { type: Array, default() { return [] } },
      highlightRow: {type: Boolean, default: true},
      loading: {type: Boolean, default: false},
      expandAll: {type: Boolean, default: false},
      placeholder: {type: String, default: '查询结果为空...'}
    },
    data() {
      return {
        slots_default: [],
        // collapses: [],
        fixed: false,
        expandable: false,
        expand_indexs: [], // 展开行的index all | array. all 表示全部展开、array.length === 0 表示全部折叠 ｜ 包含展开的行索引
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

      // 去除掉 disabledKeys 之后 可以被选中的列表
      optionalList() {
        const { data, disabledKeys, primaryKey } = this.$props;
        return data.filter(item => !disabledKeys.some(d => d === item[primaryKey]));
      },

      // 选中的列表长度 === 可被选择的列表长度 表示全部选中
      checkedAll() {
        let length = this.$data.checkedList.filter(item => !!item).length;
        if (length === 0) return false;
        return length === this.optionalList.length;
      },

      indeterminate() {
        let length = this.$data.checkedList.filter(item => !!item).length;
        if (length > 0 && this.optionalList && length < this.optionalList.length) return true;
        return false;
      },

      slots_options() {
        return this.$data.slots_default.filter(item => !!item);
      },

      colspan() {
        let l = this.slots_options.length;
        if (this.$props.serialable) {
          l += 1;
        }
        if (this.$props.checkable) {
          l += 1;
        }
        return l + 1;
      }
    },

    watch: {
      data: {
        immediate: true,
        handler(next, prev) {
          this.$data.checkedList = [];
          if (Array.isArray(next) && this.$props.expandAll) {
            this.$data.expand_indexs = [...new Array(next && next.length || 0).keys()];
          } else {
            this.$data.expand_indexs = [];
          }

          if (next === prev) return;

          this.$nextTick(() => {
            let slots_default = (this.$slots.default || [])
              .map(item => {
                if (!item.componentOptions) return undefined; // 表示 v-if 控制的column，初始值为 false 的情况

                return { ...item.componentOptions.propsData };
              });

            [
              this.$props.checkable,
              this.$props.serialable,
              this.$data.expandable
            ].forEach(item => {
              item && (slots_default = [undefined, ...slots_default]);
            });

            this.$data.slots_default = slots_default;
          })
        }
      },
      expandAll: {
        immediate: true,
        handler(val) {
          if (val) {
            this.$data.expand_indexs = [...new Array(this.$props.data && this.$props.data.length || 0).keys()];
          } else {
            this.$data.expand_indexs = [];
          }
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

      // 是否存在可折叠面板
      this.$data.expandable = !!this.$slots['expand-row'] || !!this.$scopedSlots['expand-row'];
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
          this.$data.checkedList = this.optionalList;
        }

        this.$emit('selection', [...this.$data.checkedList]);
      },

      onCheckChange() {
        this.$emit('selection', this.$data.checkedList.filter(item => !!item));
      },

      onExpandRow(index) {
        if (index === null || index === undefined) {
          this.$data.expand_indexs = [];
          return;
        }
        if (this.$data.expand_indexs.includes(index)) {
          this.$data.expand_indexs = this.$data.expand_indexs.filter(d => d !== index);
        } else {
          this.$data.expand_indexs = [...this.$data.expand_indexs, index];
        }

      },
    }
  };
</script>

<style scoped>

</style>
