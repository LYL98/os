<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-select :value="app.userInfo.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <div class="p-20">
      <div class="card position-relative">
        <div class="p-20">
          <pg-form class="mt-20" item-width="300px" ref="setting">
            <div class="row no-gutters">
              <div class="col-6">
                <h3>订单确认时间</h3>
                <pg-form-item help-text="系统会在此时间之后30分钟开始集单，集单成功的订单将于明日配送">
                  <pg-timepicker placeholder="请选择订单确认时间" v-model="order_confirm_time"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitSetting"
                  :loading="loading"
                  :disabled="order_confirm_time === data_record.order_confirm_time"
                >保存修改</pg-button>
              </div>
              <div class="col-6">
                <h3>自提点佣金比例</h3>
                <pg-form-item help-text="自提点获得的佣金金额 = 在该自提点取货的订单金额 * 配置的佣金比例" rules="required|min_value:0:blur|max_value:100:blur">
                  <pg-input type="decimal" v-model="commission_rate" placeholder="请输入自提点佣金比例" suffix="%"></pg-input>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitSetting"
                  :loading="loading"
                  :disabled="commission_rate === data_record.commission_rate"
                >保存修改</pg-button>
              </div>
              <div class="col-6 mt-30">
                <h3>拉新返现金额</h3>
                <pg-form-item help-text="新用户下单成功后，给其推广者返此笔金额" rules="required|min_value:0:blur|max_value:100000:blur">
                  <pg-input type="decimal" v-model="new_cash_back" placeholder="请输入拉新返现金额" suffix="元 / 人"></pg-input>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitSetting"
                  :loading="loading"
                  :disabled="new_cash_back === data_record.new_cash_back"
                >保存修改</pg-button>
              </div>
            </div>
          </pg-form>
        </div>
        <img src="@/assets/overview-forum.svg" alt="" class="position-absolute right-0 bottom-0">
      </div>
      <div class="card mt-20">
        <div class="px-20 py-15 d-flex align-items-center">
          <h3 class="mb-0">商品统一描述</h3>
          <pg-button
            color="primary"
            class="ml-auto"
            @click="handleSubmitSetting"
            :loading="loading"
            :disabled="item_content === data_record.item_content"
          >保存修改</pg-button>
        </div>
        <pg-editor v-model="item_content" @created="settingConstantGet"></pg-editor>
      </div>
    </div>


  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import pgyos from '@/pgyos.entry';

  export default {
    name: 'operation',
    inject: ['app'],
    data() {

      return {
        query: {},
        data_record: {}, // 接口请求回来的数据 存在该对象中。
        order_confirm_time: '', // 订单确认时间
        commission_rate: '',   // 自提点佣金比例
        new_cash_back: '', // 拉新返现金额
        item_content: '',
        provinceListAuth: [],
        loading: false,
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      document.title = '区域运营设置 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.commonProvinceListAuth();
    },

    methods: {

      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code
        }
      },

      changeProvince(province_code) {
        this.app.changeProvince(province_code);
        this.$data.query.province_code = province_code;
        this.settingConstantGet();
      },

      settingConstantGet() {
        Http.get(Api.settingConstantGet, this.$data.query)
          .then(res => {
            const rd = res.data || {};

            rd.order_confirm_time = rd.order_confirm_time || '23:00:00';
            rd.commission_rate = (rd.commission_rate + '') ? Handle.returnPercent(rd.commission_rate) : '';
            rd.new_cash_back = (rd.new_cash_back + '') ? Handle.returnPrice(rd.new_cash_back) : '';
            rd.item_content = rd.item_content || '';

            this.$data.data_record = rd;

            const { order_confirm_time, commission_rate, new_cash_back, item_content } = rd;
            this.$data.order_confirm_time = order_confirm_time;
            this.$data.commission_rate = commission_rate;
            this.$data.new_cash_back = new_cash_back;
            this.$data.item_content = item_content;
          })
      },

      handleSubmitSetting() {
        this.$refs['setting'].validateAll().then(valid => {
          if (!valid) return;

          const data_record = {...this.$data.data_record};

          data_record.order_confirm_time = this.$data.order_confirm_time;
          data_record.commission_rate = Handle.handlePercent(this.$data.commission_rate);
          data_record.new_cash_back = Handle.handlePrice(this.$data.new_cash_back);
          data_record.item_content = this.$data.item_content;

          data_record.province_code = this.app.userInfo.province_code;

          this.$data.loading = true;
          Http.post(Api.settingConstantedit, data_record)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `区域运营配置成功` });
              this.settingConstantGet();
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      commonProvinceListAuth() {
        Http.get(Api.commonProvinceListAuth)
          .then(res => {
            this.$data.provinceListAuth = res.data || [];
          });
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>

