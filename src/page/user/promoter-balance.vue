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
      <pg-column prop="created" title="操作时间" width="140px"></pg-column>
      <pg-column prop="opt_type" title="变动原因" width="80px">
        <template v-slot="{row}">
          {{OPT_TYPE_ENUM[row.opt_type]}}
        </template>
      </pg-column>
      <pg-column prop="old_balance" title="原有余额" width="90px">
        <template v-slot="{row}">
          <span>¥</span>{{ Handle.returnPrice(row.old_balance) }}
        </template>
      </pg-column>
      <pg-column prop="amount" title="变动金额" width="100px">
        <template v-slot="{row}">
          <span :class="`${row.reckon_flg === 1 ? 'text-success' : 'text-danger'}`">
            <span>{{ row.reckon_flg === 1 ? '+ ' : '- ' }}</span>
            <span>¥</span>
            <span>{{ Handle.returnPrice(row.amount) }}</span>
          </span>
        </template>
      </pg-column>
      <pg-column prop="new_balance" title="现有余额" width="90px">
        <template v-slot="{row}">
          <span>¥</span>{{ Handle.returnPrice(row.new_balance) }}
        </template>
      </pg-column>
      <pg-column prop="relate_code" title="关联单号" width="120px">
        <template v-slot="{row}">
          {{ row.relate_code || '-' }}
        </template>
      </pg-column>
      <pg-column prop="remark" title="调整原因" width="200px">
        <template v-slot="{row}">
          {{ row.remark || '-' }}
        </template>
      </pg-column>
      <pg-column prop="creator" title="调整人" width="100px">
        <template v-slot="{row}">
          {{ row.creator && row.creator.realname || '-' }}
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="userPromoterBalance"/>
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
      this.Handle = Handle;
      this.OPT_TYPE_ENUM = {
        promote: '推广',
        pull_new: '拉新',
        withdraw: '提现',
        withdraw_reject: '提现退回',
        plus: '手动调整',
        minus: '手动调整',
      };
      this.initQuery();
      this.userPromoterBalance();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          id: this.$props.id,
          page: 1,
          page_size: 20,
        }
      },

      userPromoterBalance() {
        Http.get(Api.userPromoterBalance, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] };
          });
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>
