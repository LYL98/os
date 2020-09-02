<template>
  <div>
    <pg-table
      :data="list.items"
      primary-key="id"
      :height="app.windowHeight - 170 + 'px'"
      :page="query.page"
      :page-size="query.page_size"
      borderless
    >
      <pg-column title="时间" prop="created" width="160px"></pg-column>
      <pg-column title="原有余额" prop="old_balance">
        <template v-slot="{row}">
          <span v-if="!!row.old_balance">
            &yen;{{Handle.returnPrice(row.old_balance)}}
          </span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="变动金额">
        <template v-slot="{row}">
          <span v-if="!!row.amount">
            <span class="text-success" v-if="row.reckon_flg > 0">+ &yen;{{Handle.returnPrice(row.amount)}}</span>
            <span class="text-danger" v-else>- &yen;{{Math.abs(Handle.returnPrice(row.amount))}}</span>
          </span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="现有余额" prop="new_balance">
        <template v-slot="{row}">
          <span v-if="!!row.new_balance">
              &yen;{{Handle.returnPrice(row.new_balance)}}
            </span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="变动原因">
        <template v-slot="{row}">
          {{ Constant.USER_STORE_BALANCE_TYPE('enum')[row.opt_type] || row.opt_type || '-' }}
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="balanceQuery"/>
    </div>
  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  export default {
    name: 'store-balance',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        query: {},
        list: {
          items: [],
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.initQuery();
      this.balanceQuery();
    },

    methods: {

      initQuery() {
        this.$data.query = {
          store_id: this.$props.item.id,
          page: 1,
          page_size: 20,
        }
      },

      balanceQuery() {
        Http.get(Api.userStoreBalanceLogs, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          })
      }
    }

  }
</script>

<style lang="scss" scoped>
  .edit-form-container {
    height: 0;
    overflow: hidden;
    transition: height .2s ease-in-out;
  }
</style>
