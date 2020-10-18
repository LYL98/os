<template>
  <div class="p-20">

    <div class="card p-20 position-relative">
      <div class="card-header">
        <h3>品牌信息设置</h3>
      </div>
      <pg-form item-width="200px" ref="brand" class="mt-20 mb-10">
        <div class="row no-gutters">
          <div class="col-4">
            <pg-form-item label="品牌名" rules="required|max_length:15">
              <pg-input v-model="brand_name" placeholder="请输入品牌名"></pg-input>
            </pg-form-item>
          </div>
          <div class="col-4">
            <pg-form-item label="投诉电话" rules="required|phone:blur">
              <pg-input type="number" v-model="complaint_hotline" placeholder="请输入投诉电话"></pg-input>
            </pg-form-item>
          </div>
          <div class="col-4">
            <pg-form-item label="客服微信" rules="required">
              <pg-uploader v-model="qr_code" module="qr_code"></pg-uploader>
            </pg-form-item>
          </div>
        </div>
      </pg-form>
      <pg-button
        class="ml-80 bottom-30"
        color="primary"
        @click="handleSubmitBrand"
        :loading="loading"
        :disabled="brand_name === data_brand.brand_name && complaint_hotline === data_brand.complaint_hotline && qr_code === data_brand.qr_code"
      >保存修改</pg-button>
      <img src="@/assets/overview-forum.svg" alt="" class="position-absolute right-0 bottom-0">
    </div>

    <div class="card p-20 mt-20">
      <div class="card-header d-flex">
        <h3>区域运营设置</h3>
        <pg-select v-model="query.province_code" class="ml-auto mr-20" @change="changeProvince">
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{item.title}}
          </pg-option>
        </pg-select>
      </div>

      <!--  营业时间 与 订单确认时间 begin -->
      <div class="row mt-20 no-gutters">
        <div class="col-8">
          <pg-form vertical item-width="260px" ref="bussiness">
            <div class="row no-gutters">
              <div class="col-6">
                <pg-form-item label="开始营业时间" rules="required">
                  <pg-timepicker placeholder="开始营业时间" v-model="order_start_time" @change="changeOrderStartTime"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitBussiness"
                  :loading="loading"
                  :disabled="order_start_time === data_bussiness.order_start_time"
                >保存修改
                </pg-button>
              </div>
              <div class="col-6">
                <pg-form-item label="结束营业时间" :rules="{ required: true, logic: order_end_time_validator }">
                  <pg-timepicker placeholder="结束营业时间" v-model="order_end_time"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitBussiness"
                  :loading="loading"
                  :disabled="order_end_time === data_bussiness.order_end_time"
                >保存修改
                </pg-button>
              </div>
            </div>
          </pg-form>
        </div>
        <div class="col-4">
          <pg-form vertical item-width="260px" ref="confirm">
            <pg-form-item label="订单确认时间" rules="required" help-text="订单确认时间必须在结束营业时间5分钟之后">
              <pg-timepicker placeholder="订单确认时间" v-model="confirm_time"/>
            </pg-form-item>
            <pg-button
              color="primary"
              @click="handleSubmitConfirm"
              :loading="loading"
              :disabled="confirm_time === data_confirm.confirm_time"
            >保存修改
            </pg-button>
          </pg-form>
        </div>
      </div>
      <!--  营业时间 与 订单确认时间 end -->

      <!--  运费设置 begin -->
      <div class="row no-gutters">
        <div class="col-12">
          <pg-form vertical item-width="260px" ref="delivery">
            <div class="row no-gutters mt-30">
              <div class="col-4">
                <pg-form-item label="大件运费" rules="required|max_value:1000000">
                  <pg-input type="decimal" placeholder="请输入大件运费" v-model="bp_delivery_price" suffix="元 / 件"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitDelivery"
                  :loading="loading"
                  :disabled="bp_delivery_price === data_delivery.bp_delivery_price"
                >保存修改
                </pg-button>
              </div>
              <div class="col-4">
                <pg-form-item label="小件运费" rules="required|max_value:1000000">
                  <pg-input type="decimal" placeholder="请输入小件运费" v-model="sp_delivery_price" suffix="元 / 件"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitDelivery"
                  :loading="loading"
                  :disabled="sp_delivery_price === data_delivery.sp_delivery_price"
                >保存修改
                </pg-button>
              </div>
              <div class="col-4">
                <pg-form-item label="运费上限" rules="max_value:1000000" help-text="0表示无运费上限">
                  <pg-input type="decimal" placeholder="请输入运费上限" v-model="max_delivery_price" suffix="元"/>
                </pg-form-item>
                <pg-button
                  color="primary"
                  @click="handleSubmitDelivery"
                  :loading="loading"
                  :disabled="max_delivery_price === data_delivery.max_delivery_price"
                >保存修改
                </pg-button>
              </div>
            </div>
          </pg-form>
        </div>
      </div>
      <!--  运费设置 end -->

      <!--  商品统一描述 begin -->
      <div class="row no-gutters">
        <div class="col-12">
          <pg-form vertical class="mt-20">
            <pg-form-item label="商品统一描述" item-width="100%">
              <pg-editor v-model="unified_description" @created="settingOperationDescription"></pg-editor>
            </pg-form-item>
            <pg-button
              color="primary"
              class="ml-auto"
              @click="handleSubmitDescription"
              :loading="loading"
              :disabled="unified_description === data_description.unified_description"
            >保存修改
            </pg-button>
          </pg-form>
        </div>
      </div>
      <!--  商品统一描述 end -->

    </div>
  </div>
</template>
<script>

  import {Http, Api, Handle} from '@/util';

  export default {
    name: 'operation',
    inject: ['app'],
    data() {

      return {
        query: {},

        data_brand: {
          brand_name: '',
          complaint_hotline: '',
          qr_code: '',
        },

        brand_name: '', // 品牌名称
        complaint_hotline: '', // 客服电话
        qr_code: '', // 客服二维码

        data_bussiness: {
          order_start_time: '',
          order_end_time: '',
        }, // 接口请求回来的数据 存在该对象中。
        order_start_time: '', // 开始营业时间
        order_end_time: '', // 结束营业时间

        data_confirm: {
          confirm_time: ''
        },
        confirm_time: '', // 订单确认时间

        data_delivery: {
          bp_delivery_price: '',
          sp_delivery_price: '',
          max_delivery_price: '',
        },
        bp_delivery_price: '', // 大件运费
        sp_delivery_price: '', // 小件运费
        max_delivery_price: '', // 运费上限

        data_description: {
          unified_description: ''
        },
        unified_description: '',

        provinceListAuth: [],
        loading: false,
      }
    },

    created() {
      document.title = '区域运营设置 - 商城 - 蒲公英运营管理系统';
      this.initQuery();
      this.settingOperationBrand();
      this.settingOperationBusiness();
      this.settingOperationConfirm();
      this.settingOperationDelivery();
      this.commonProvinceListAuth();

      this.order_end_time_validator = {
        validate: (v) => {
          if (!this.$data.order_start_time) return true;
          if (!v) return true;
          return new Date('2020/01/01 ' + this.$data.order_start_time).getTime() < new Date('2020/01/01 ' + v).getTime();
        },
        getMsg: '结束营业时间 必须大于 开始营业时间'
      };

    },

    methods: {

      changeOrderStartTime(v) {
        if (v && this.$data.order_end_time) {
          this.$refs['bussiness']?.validate('结束营业时间');
        }
      },

      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code
        }
      },

      changeProvince() {
        this.settingOperationBusiness();
        this.settingOperationConfirm();
        this.settingOperationDelivery();
        this.settingOperationDescription();
      },

      settingOperationBrand() {
        Http.get(Api.settingOperationBrand)
          .then(res => {
            const rd = res.data || {};

            rd.brand_name = rd.brand_name || '';
            rd.complaint_hotline = rd.complaint_hotline || '';
            rd.qr_code = rd.qr_code || '';

            this.$data.data_brand = rd;

            const { brand_name, complaint_hotline, qr_code } = rd;
            this.$data.brand_name = brand_name;
            this.$data.complaint_hotline = complaint_hotline;
            this.$data.qr_code = qr_code;
          })
      },

      handleSubmitBrand() {
        this.$refs['brand'].validateAll().then(valid => {
          if (!valid) return;

          const data_brand = {...this.$data.data_brand};

          data_brand.brand_name = this.$data.brand_name;
          data_brand.complaint_hotline = this.$data.complaint_hotline;
          data_brand.qr_code = this.$data.qr_code;

          this.$data.loading = true;
          Http.post(Api.settingOperationBrand, data_brand)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `品牌信息设置成功` });
              this.settingOperationBrand();
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      settingOperationBusiness() {
        Http.get(Api.settingOperationBusiness, this.$data.query)
          .then(res => {
            const rd = res.data || {};

            rd.order_start_time = rd.order_start_time || '';
            rd.order_end_time = rd.order_end_time || '';

            this.$data.data_bussiness = rd;

            const {order_start_time, order_end_time} = rd;
            this.$data.order_start_time = order_start_time;
            this.$data.order_end_time = order_end_time;
          });
      },

      settingOperationConfirm() {
        Http.get(Api.settingOperationConfirm, this.$data.query)
          .then(res => {
            const rd = res.data || {};

            rd.confirm_time = rd.confirm_time || '';

            this.$data.data_confirm = rd;

            const {confirm_time} = rd;
            this.$data.confirm_time = confirm_time;
          });
      },

      settingOperationDelivery() {
        Http.get(Api.settingOperationDelivery, this.$data.query)
          .then(res => {
            const rd = res.data || {};

            rd.bp_delivery_price = Handle.returnPrice(rd.bp_delivery_price);
            rd.sp_delivery_price = Handle.returnPrice(rd.sp_delivery_price);
            rd.max_delivery_price = Handle.returnPrice(rd.max_delivery_price);

            this.$data.data_delivery = rd;

            const {bp_delivery_price, sp_delivery_price, max_delivery_price} = rd;
            this.$data.bp_delivery_price = bp_delivery_price;
            this.$data.sp_delivery_price = sp_delivery_price;
            this.$data.max_delivery_price = max_delivery_price;
          });
      },

      settingOperationDescription() {
        Http.get(Api.settingOperationDescription, this.$data.query)
          .then(res => {
            const rd = res.data || '';

            this.$data.data_description = {unified_description: rd};
            this.$data.unified_description = rd;
          });
      },

      handleSubmitBussiness() {
        this.$refs['bussiness'].validateAll().then(valid => {
          if (!valid) return;

          const data_bussiness = {...this.$data.data_bussiness};

          data_bussiness.order_start_time = this.$data.order_start_time;
          data_bussiness.order_end_time = this.$data.order_end_time;

          data_bussiness.province_code = this.$data.query.province_code;

          this.$data.loading = true;
          Http.post(Api.settingOperationBusiness, data_bussiness)
            .then(() => {
              this.$data.loading = false;
              this.$toast({type: 'success', message: `区域运营配置成功`});
              this.settingOperationBusiness();
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      handleSubmitConfirm() {
        this.$refs['confirm'].validateAll().then(valid => {
          if (!valid) return;

          const data_confirm = {...this.$data.data_confirm};

          data_confirm.confirm_time = this.$data.confirm_time;

          data_confirm.province_code = this.$data.query.province_code;

          this.$data.loading = true;
          Http.post(Api.settingOperationConfirm, data_confirm)
            .then(() => {
              this.$data.loading = false;
              this.$toast({type: 'success', message: `区域运营配置成功`});
              this.settingOperationConfirm();
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      handleSubmitDelivery() {
        this.$refs['delivery'].validateAll().then(valid => {
          if (!valid) return;

          const data_delivery = {...this.$data.data_delivery};

          data_delivery.bp_delivery_price = Handle.handlePrice(this.$data.bp_delivery_price);
          data_delivery.sp_delivery_price = Handle.handlePrice(this.$data.sp_delivery_price);
          data_delivery.max_delivery_price = Handle.handlePrice(this.$data.max_delivery_price);

          data_delivery.province_code = this.$data.query.province_code;

          this.$data.loading = true;
          Http.post(Api.settingOperationDelivery, data_delivery)
            .then(() => {
              this.$data.loading = false;
              this.$toast({type: 'success', message: `区域运营配置成功`});
              this.settingOperationDelivery();
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      handleSubmitDescription() {
        const data_description = {...this.$data.data_description};

        data_description.unified_description = this.$data.unified_description;
        data_description.province_code = this.$data.query.province_code;

        this.$data.loading = true;
        Http.post(Api.settingOperationDescription, data_description)
          .then(() => {
            this.$data.loading = false;
            this.$toast({type: 'success', message: `区域运营配置成功`});
            this.settingOperationDescription();
          })
          .catch(() => {
            this.$data.loading = false;
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
  .ml-80 {
    margin-left: 80px;
  }
  .bottom-30 {
    position: absolute;
    bottom: 30px;
  }
</style>

