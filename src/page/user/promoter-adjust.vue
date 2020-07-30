<template>
  <pg-form ref="form" label-width="90px" item-width="270px">

    <pg-form-item label="所属门店" class="pb-10">
      <span class="form-item-label">{{ item.store && item.store.title || '-' }}</span>
    </pg-form-item>

    <pg-form-item label="账户余额" class="pb-20">
      <span class="form-item-label">{{ !!item.balance ? `¥${Handle.returnPrice(item.balance)}` : '-' }}</span>
    </pg-form-item>

    <pg-form-item label="调整类型" rules="required">
      <pg-button-group :options="{ '增加': 'plus', '减少': 'minus' }" v-model="formData.type" @change="changeType"></pg-button-group>
    </pg-form-item>

    <pg-form-item label="调整金额" :rules="{ required: true, custom_logic: amount_logic }">
      <pg-input suffix="元" v-model="formData.amount" type="decimal" placeholder="请输入调整的金额"></pg-input>
    </pg-form-item>

    <pg-form-item label="调整后余额" class="pb-20">
      <span class="form-item-label" v-if="formData.type === 'plus'">
        {{ !!(item.balance + formData.amount) ? `¥${Handle.returnPrice(item.balance + Handle.handlePrice(formData.amount))}` : '-' }}
      </span>
      <span class="form-item-label" v-else>
        {{ !!(item.balance - formData.amount) ? `¥${Handle.returnPrice(item.balance - Handle.handlePrice(formData.amount))}` : '-' }}
      </span>
    </pg-form-item>

    <pg-form-item label="调整原因">
      <pg-textarea v-model="formData.remark" maxlength="15"></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'promoter-adjust',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {

        formData: {
          id: '',
          type: 'plus', // plus | minus
          amount: '',
          remark: '',
        },
        storeList: [],
        loading: false,
      }
    },
    created() {
      const { id } = this.$props.item;
      this.$data.formData.id = id;

      this.Handle = Handle;

      this.amount_logic = {
        validate: (v) => {
          if (this.$data.formData.type === 'plus') return true;
          return Handle.handlePrice(v) <= this.$props.item.balance
        },
        getMsg: '减少金额不能大于账户余额'
      }
    },

    methods: {

      changeType() {
        if (this.$data.formData.amount) {
          this.$refs['form']?.validate('调整金额');
        }
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.amount = Handle.handlePrice(formData.amount);

          this.$data.loading = true;
          Http.post(Api.userPromoterBalanceAdjust, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `账户余额调整成功` });
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

    }
  }
</script>
