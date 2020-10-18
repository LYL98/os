<template>
  <pg-form item-width="100px" class="p-20" ref="form" v-if="complete">

    <div class="alert-primary">成长值配置规则用于计算会员积分。单项规则关闭后，统计成长值时不计算该项。单项成长值上限不填写，则表示该项成长值无上限。</div>

    <div class="card mt-10" style="box-shadow: none">
      <div class="card-header font-weight-bolder font-size-lg">
        <pg-tabs>
          <pg-tab>成长值获取</pg-tab>
        </pg-tabs>
      </div>
    </div>

    <!-- GMV  -->
    <div class="card mt-20">
      <div class="card-header px-20 py-15 d-flex align-items-center justify-content-between border-bottom">
        <h3 class="m-0">GMV</h3>
        <div class="d-flex align-items-center">
          <pg-switch v-model="formData.up.gmv.switch"></pg-switch>
          <pg-tooltip class="ml-10 mt-2">该规则关闭后，统计成长值时不计算该项</pg-tooltip>
        </div>
      </div>
      <div class="card-body mt-20">
        <div class="d-flex">
          <span class="mt-5 px-20">下单金额每达到</span>
          <pg-form-item label="下单金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
            <pg-input suffix="元" type="decimal" v-model="formData.up.gmv.amount"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">获得</span>
          <pg-form-item label="成长值" :show-label="false" rules="required|min_value:1:blur|max_value:1000000">
            <pg-input type="number" v-model="formData.up.gmv.growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
          <span class="mt-5 px-20">获取上限</span>
          <pg-form-item label="获取上限" :show-label="false" rules="max_value:1000000">
            <pg-input type="number" v-model="formData.up.gmv.max_growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
        </div>
      </div>
    </div>
    <!-- 下单天数  -->
    <div class="card mt-20">
      <div class="card-header px-20 py-15 d-flex align-items-center justify-content-between border-bottom">
        <h3 class="m-0">下单天数</h3>
        <div class="d-flex align-items-center">
          <pg-switch v-model="formData.up.order.switch"></pg-switch>
          <pg-tooltip class="ml-10 mt-2">该规则关闭后，统计成长值时不计算该项</pg-tooltip>
        </div>
      </div>
      <div class="card-body mt-20">
        <div class="d-flex">
          <span class="mt-5 px-20">每天下单</span>
          <pg-form-item label="下单次数" :show-label="false" rules="required|min_value:1:blur|max_value:1000000">
            <pg-input suffix="次" type="number" v-model="formData.up.order.num"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">获得</span>
          <pg-form-item label="成长值" :show-label="false" rules="required|min_value:1:blur|max_value:1000000">
            <pg-input type="number" v-model="formData.up.order.growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
          <span class="mt-5 px-20">获取上限</span>
          <pg-form-item label="获取上限" :show-label="false" rules="max_value:1000000">
            <pg-input type="number" v-model="formData.up.order.max_growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
        </div>
      </div>
    </div>

    <!-- 退赔率  -->
    <div class="card mt-20">
      <div class="card-header px-20 py-15 d-flex align-items-center justify-content-between border-bottom">
        <h3 class="m-0">退赔率</h3>
        <div class="d-flex align-items-center">
          <pg-switch v-model="formData.up.refund_rate.switch"></pg-switch>
          <pg-tooltip class="ml-10 mt-2">该规则关闭后，统计成长值时不计算该项</pg-tooltip>
        </div>
      </div>
      <div class="card-body mt-20">
        <div class="d-flex">
          <span class="mt-5 px-20">低于</span>
          <pg-form-item label="退赔率" :show-label="false" rules="required|min_value:0.01:blur|max_value:100">
            <pg-input suffix="%" type="decimal" v-model="formData.up.refund_rate.start"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">开始计算</span>
          <span class="mt-5 px-20">每降低</span>
          <pg-form-item label="退赔率等级" :show-label="false" rules="required|min_value:0.01:blur|max_value:100">
            <pg-input suffix="%" type="decimal" v-model="formData.up.refund_rate.step"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">获取</span>
          <pg-form-item label="成长值" :show-label="false" rules="required|min_value:1:blur|max_value:1000000">
            <pg-input type="number" v-model="formData.up.refund_rate.growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
          <span class="mt-5 px-20">获取上限</span>
          <pg-form-item label="获取上限" :show-label="false" rules="max_value:1000000">
            <pg-input type="number" v-model="formData.up.refund_rate.max_growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
        </div>
      </div>
    </div>

    <div class="card mt-20" style="box-shadow: none">
      <div class="card-header font-weight-bolder font-size-lg">
        <pg-tabs>
          <pg-tab>成长值消耗</pg-tab>
        </pg-tabs>
      </div>
    </div>
    <!-- 退赔率  -->
    <div class="card mt-20">
      <div class="card-header px-20 py-15 d-flex align-items-center justify-content-between border-bottom">
        <h3 class="m-0">退赔率</h3>
        <div class="d-flex align-items-center">
          <pg-switch v-model="formData.down.refund_rate.switch"></pg-switch>
          <pg-tooltip class="ml-10 mt-2">该规则关闭后，统计成长值时不计算该项</pg-tooltip>
        </div>
      </div>
      <div class="card-body mt-20">
        <div class="d-flex">
          <span class="mt-5 px-20">高于</span>
          <pg-form-item label="退赔率" :show-label="false" rules="required|min_value:0.01:blur|max_value:100">
            <pg-input suffix="%" type="decimal" v-model="formData.down.refund_rate.start"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">开始计算</span>
          <span class="mt-5 px-20">每提高</span>
          <pg-form-item label="退赔率等级" :show-label="false" rules="required|min_value:0.01:blur|max_value:100">
            <pg-input suffix="%" type="decimal" v-model="formData.down.refund_rate.step"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">消耗</span>
          <pg-form-item label="成长值" :show-label="false" rules="required|min_value:1:blur|max_value:1000000">
            <pg-input type="number" v-model="formData.down.refund_rate.growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
          <span class="mt-5 px-20">消耗上限</span>
          <pg-form-item label="获取上限" :show-label="false" rules="max_value:1000000">
            <pg-input type="number" v-model="formData.down.refund_rate.max_growth"></pg-input>
          </pg-form-item>
          <span class="mt-5 px-20">成长值</span>
        </div>
      </div>
    </div>
    <div class="form-item-footer">
      <pg-button color="primary" @click="onSubmit" :loading="loading">保存修改</pg-button>
    </div>
  </pg-form>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'vip-growth',
    inject: ['app'],
    data() {

      return {
        formData: {
          up: {
            gmv: {
              amount: '',
              growth: '',
              max_growth: '',
              switch: false,
            },
            order: {
              num: '',
              growth: '',
              max_growth: '',
              switch: false,
            },
            refund_rate: {
              start: '',
              step: '',
              growth: '',
              max_growth: '',
              switch: false,
            },
          },
          down: {
            refund_rate: {
              start: '',
              step: '',
              growth: '',
              max_growth: '',
              switch: false,
            },
          }
        },
        loading: false,
        complete: false,
      }
    },

    created() {
      document.title = '会员等级 - 商城 - 蒲公英运营管理系统';
      this.vipConfigGrowthGet();
    },

    methods: {

      vipConfigGrowthGet() {
        Http.get(Api.merchantVipConfigGrowthGet, {})
          .then(res => {
            let { up, down } = res.data || {};
            up.gmv.amount = up && up.gmv && up.gmv.amount ? Handle.returnPrice(up.gmv.amount) : 0;
            up.refund_rate.start = up && up.refund_rate && up.refund_rate.start ? Handle.returnDiscount(up.refund_rate.start) : 0;
            up.refund_rate.step = up && up.refund_rate && up.refund_rate.step ? Handle.returnDiscount(up.refund_rate.step) : 0;

            down.refund_rate.start = down && down.refund_rate && down.refund_rate.start ? Handle.returnDiscount(down.refund_rate.start) : 0;
            down.refund_rate.step = down && down.refund_rate && down.refund_rate.step ? Handle.returnDiscount(down.refund_rate.step) : 0;

            this.$data.formData = { up, down };
            this.$data.complete = true;
          })
          .catch(() => {
            this.$data.complete = true;
          });
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = JSON.parse(JSON.stringify(this.$data.formData));
          const up = formData.up;
          const down = formData.down;

          up.gmv.amount = Handle.handlePrice(up.gmv.amount);
          up.refund_rate.start = Handle.handleDiscount(up.refund_rate.start);
          up.refund_rate.step = Handle.handleDiscount(up.refund_rate.step);

          down.refund_rate.start = Handle.handleDiscount(down.refund_rate.start);
          down.refund_rate.step = Handle.handleDiscount(down.refund_rate.step);

          this.$data.loading = true;
          Http.post(Api.merchantVipConfigGrowthSet, { config: { up, down } })
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `成长值规则配置成功` });
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

    }

  }
</script>

<style lang="scss" scoped>

  .alert-primary {
    font-size: 12px;
    line-height: inherit;
    padding: 5px 30px 5px 10px;
    vertical-align: middle;
    color: #003b80;
    border: 1px solid #97c7ff;
    border-radius: 2px;
    background: #e5f0ff;
    position: relative;
    box-sizing: border-box;
    max-width: 750px;
    margin-right: auto;
  }

  .border-bottom {
    border-bottom: 1px solid #ddd;
  }
  .border-top {
    border-top: 1px solid #ddd;
  }

  .form-item-footer {
    background-color: #FFF;
    text-align: center;
    padding: 13px 0 14px;
    position: fixed;
    left: 200px;
    bottom: 0;
    right: 0;
    border-top: 1px solid #ddd;
  }
</style>

