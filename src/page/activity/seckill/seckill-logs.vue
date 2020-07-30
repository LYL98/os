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
      :serialable="false"
    >
      <pg-column title="操作时间" prop="opt_time" width="140px"></pg-column>
      <pg-column prop="opt" title="操作内容">
        <template v-slot="{row}">
          {{ row.opt || '-' }}
        </template>
      </pg-column>
      <pg-column prop="operator" title="操作人"  width="100px">
        <template v-slot="{row}">
          {{ row.operator || '-' }}
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="activitySeckillLog"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'seckill-logs',
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
      this.activitySeckillLog();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          act_id: this.$props.id,
          page: 1,
          page_size: 20,
        }
      },

      activitySeckillLog() {
        Http.get(Api.activitySeckillLog, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] };
          });
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>
