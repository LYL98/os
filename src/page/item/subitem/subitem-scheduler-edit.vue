<template>
  <div class="pr-20">

    <pg-form ref="form" item-width="300px">

      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="操作类型" rules="required">
            <pg-button-group
              v-model="formData.opt_type"
              :options="{ '定时上架': 'on_shelf', '定时下架': 'off_shelf' }"
              @change="changeOptType"
            ></pg-button-group>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="生效时间" rules="required">
            <pg-datepicker placeholder="请选择定时任务的生效时间" :limit="{ from: today }" timeable v-model="formData.effect_time"></pg-datepicker>
          </pg-form-item>
        </div>
      </div>

      <pg-form-item label="商品" rules="required" item-width="900px" help-text="从未上过架的商品，不可进行定时上下架操作，不在该列表展示">
        <pg-search
          size="lg"
          style="min-width: 380px; width: 380px"
          class="-mb-1"
          placeholder="商品编号、名称"
          v-model="query.condition"
          @change="changeQuery"
          immediate
          debounce
        />
        <pg-transfer
          :data="itemList"
          v-model="formData.item_ids"
          placeholder="商品列表"
          selected-table-width="450px"
        >
          <template v-slot:selected>
            <pg-column prop="label" title="商品编号/名称"></pg-column>
            <pg-column title="状态" width="80px">
              <template v-slot="{row}">
                {{ row.is_on_sale ? '已上架' : '已下架' }}
              </template>
            </pg-column>
          </template>
        </pg-transfer>
      </pg-form-item>

      <div class="text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
      </div>
    </pg-form>

  </div>

</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'operation-item-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      let today = new Date();
      today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      const province_code = this.app.userInfo.province_code;
      return {
        today: today,
        query: {},
        formData: {
          province_code: province_code,
          opt_type: 'on_shelf',
          effect_time: '',
          item_ids: [],
        },
        loading: false,
        itemList: [],
      }
    },
    created() {
      this.initQuery();
      this.commonItemList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          condition: '',
          need_num: 30,
          is_deleted: 0,
          is_ready: 1, // 是否上过架
        }
      },

      changeQuery() {
        this.commonItemList();
      },

      resetQuery() {
        this.initQuery();
        this.commonItemList();
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = { ...this.$data.formData };

          this.$data.loading = true;
          Http.post(Api.subitemSchedulerAdd, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `定时上下架任务创建成功` });
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },
      onCancel() {
        this.$emit('cancel');
      },

      commonItemList() {

        Http.get(Api.commonItemList, this.$data.query)
          .then(res => {
            this.$data.itemList = (res.data || []).map(item => ({
              label: item.code + ' / ' + item.title,
              value: item.id,
              is_on_sale: item.is_on_sale
            }));
          })
      },

    }
  }
</script>

<style scoped>
  .pg-transfer-table-wrapper.selected {
    width: 500px;
    min-width: 500px;
  }
</style>
