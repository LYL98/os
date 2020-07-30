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
      <pg-pagination :num="list.num" v-model="query" @change="pitemModifyLog"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'pitem-logs',
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
      this.initQuery();
      this.pitemModifyLog();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          id: this.$props.id,
          page: 1,
          page_size: 20,
        }
      },

      pitemModifyLog() {
        Http.get(Api.pitemModifyLog, this.$data.query)
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
                case 'item_edit':
                  item._logs_str_ = [];
                  (item.modified_attrs || []).forEach(d => {
                    let str = '';
                    for (const k in d) {
                      switch (k) {
                        case '商品详情':
                        case '商品图片':
                        case '商品视频':
                          str = `${k}变更...`;
                          break;
                        case '重量':
                          str = `${k}: ${Handle.returnWeight(d[k].before)} => ${Handle.returnWeight(d[k].after)}`;
                          break;
                        default:
                          str = `${k}: ${d[k].before} => ${d[k].after}`;
                          break;
                      }
                    }
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
