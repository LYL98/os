<template>
  <div>

    <div class="d-flex mt-20 mb-10">
      <pg-button-group v-model="query.status" :options="{ '未生效': 'not_applied', '已生效': 'applied', '已过期':'dead' }" @change="changeQuery"/>
      <pg-button color="primary" class="ml-auto" @click="handleAddItem" v-if="(app.auth.isAdmin || app.auth.ItemPriceFixPlanAdd)">新增</pg-button>
    </div>

    <div class="edit-form-container" :style="`height: ${dialog.visible ? '400px' : '0'}`">
      <!-- subitem 对应的是在售商品。item 对应的是单条调价记录 -->
      <list-price-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :subitem="subitem"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      :serialable="false"
      :height="app.windowHeight - 210 + 'px'"
      borderless
      placeholder="暂无定时调价记录..."
    >
      <pg-column title="调价生效时间"  width="260px">
          <template v-slot="{row}">
            {{ row.start_time || '-' }} 至 {{ row.end_time || '-' }}
        </template>
      </pg-column>
      <pg-column prop="origin_price" title="原销售价" width="80px">
        <template v-slot="{row}">
          {{ row.origin_price ? '¥' : '' }}{{ Handle.returnPrice(row.origin_price) || '-' }}
        </template>
      </pg-column>
      <pg-column prop="price_sale" title="新销售价" width="80px">
        <template v-slot="{row}">
          {{ row.new_price ? '¥' : '' }}{{ Handle.returnPrice(row.new_price) || '-' }}
        </template>
      </pg-column>
      <!-- <pg-column prop="price_divide" title="利润分成" width="100px">
        <template v-slot="{row}">
          {{ row.price_divide ? '¥' : '' }}{{ Handle.returnPrice(row.price_divide) }}
        </template>
      </pg-column> -->
      <pg-column prop="" title="创建人"  width="100px">
        <template v-slot="{row}">
          {{ row.creator_name|| '-' }}
        </template>
      </pg-column>
      <pg-column prop="" title="操作"  width="100px">
        <template v-slot="{row}">
          <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemPriceFixPlanEdit) && (query.status !== 'dead')">修改</a>
          <pg-confirm help-text="确认删除定时调价" @confirm="handleDeleteItem(row)" class="mr-10" v-if="(app.auth.isAdmin || app.auth.ItemPriceFixPlanDelete) && (query.status !== 'applied')">
            <a class="text-decoration-none">删除</a>
          </pg-confirm>
          <!-- <div v-else> - </div> -->
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="itemPriceFixPlanQuery"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  import listPriceEdit from './list-price-edit';

  export default {
    name: 'list-price',
    components: {listPriceEdit},
    props: {
      subitem: { type: Object, default() { return {} } },
    },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.itemPriceFixPlanQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          sub_item_id: this.$props.subitem.id,
          status: 'not_applied',
          page: 1,
          page_size: 10,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.itemPriceFixPlanQuery();
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: {...item,status:this.$data.query.status} };
      },

      handleSubmit() {
        this.handleCancel();
        this.itemPriceFixPlanQuery();
      },

      handleDeleteItem(item) {
        Http.post(Api.itemPriceFixPlanDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '定时调价删除成功' });
            this.itemPriceFixPlanQuery();
          });
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },

      itemPriceFixPlanQuery() {
        Http.get(Api.itemPriceFixPlanQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] };
          });
      },
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