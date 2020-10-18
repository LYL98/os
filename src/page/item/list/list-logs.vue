<template>
  <div>
    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      :highlight-row="false"
      :height="app.windowHeight - 170 + 'px'"
      borderless
    >
      <pg-column title="操作时间" prop="created" width="140px"></pg-column>
      <pg-column prop="_logs_str_" title="操作内容">
        <template v-slot="{row}">
          <div v-if="Array.isArray(row._logs_str_)">
            <div v-for="(item, index) in row._logs_str_" :key="index" class="overflow-ellipsis">{{ item }}</div>
          </div>
          <div v-else>{{ row._logs_str_ || '-' }}</div>
        </template>
      </pg-column>
      <pg-column prop="" title="操作人"  width="100px">
        <template v-slot="{row}">
          <div class="overflow-ellipsis">
            {{ row.operator && row.operator.realname || '-' }}
          </div>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="itemModifyDetail"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'list-logs',
    inject: ['app'],
    props: {
      id: { type: Number, default: 0 },
    },
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.itemModifyDetail();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          id: this.$props.id,
          page: 1,
          page_size: 20,
        }
      },

      itemModifyDetail() {
        Http.get(Api.itemModifyDetail, this.$data.query)
          .then(res => {
            let list = res.data || { items: [] };
            list.items.map(item => {
              switch (item.category) {
                case 'item_add':
                  item._logs_str_ = '创建商品';
                  break;
                case 'item_delete':
                  item._logs_str_ = '放入回收站';
                  break;
                case 'item_recover':
                  item._logs_str_ = '从回收站恢复';
                  break;
                case 'item_on_ground':
                  item._logs_str_ = '上架';
                  break;
                case 'item_under_ground':
                  item._logs_str_ = '下架';
                  break;
                case 'item_out_edit':
                  item._logs_str_ = '外标签相关修改';
                  break;
                case 'item_inner_audit':
                  item._logs_str_ = '内标签审核';
                  break;
                case 'add_price_fix_plan':
                  item._logs_str_ = '定时调价';
                  break;
                case 'item_edit':
                  item._logs_str_ = [];
                  (item.modified_detail || []).forEach(d => {
                    let str = '';
                    str = `${d.attr}：${d.before} 【改成】 ${d.after}`;
                    item._logs_str_.push(str);
                  });
                  break;
              }
              return item;
            });
            this.$data.list = list;
          });
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>
