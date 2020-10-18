<template>
  <pg-form ref="form" label-width="90px" item-width="300px" class="pr-20">

    <pg-form-item label="会员等级" rules="required">
      <pg-input placeholder="会员等级" :value="'VIP' + formData.level" disabled></pg-input>
    </pg-form-item>

    <pg-form-item label="会员等级名称" rules="required|max_length:4">
      <pg-input placeholder="请输入会员等级名称" v-model="formData.title"></pg-input>
    </pg-form-item>

    <pg-form-item label="升级条件" rules="required" help-text="等级有效期内成长值达到升级条件时，自动升到当前等级">
      <pg-input suffix="分" type="number" placeholder="请输入升级条件" v-model="formData.growth"></pg-input>
    </pg-form-item>

    <pg-form-item label="优惠折扣" rules="decimal:1|min_value:0.1|max_value:10" help-text="该项未填写！则表示该等级不享受折扣">
      <template v-slot:label>
        优惠折扣
        <pg-tooltip>
          <div style="width: 300px" class="text-center">
            <div>会员消费时在当前会员基准价的基础上，享受优惠折扣</div>
            <div class="text-primary">（仅作用于设置为享受会员折扣的商品）</div>
          </div>
        </pg-tooltip>
        :
      </template>
      <pg-input suffix="折" type="decimal" placeholder="请输入优惠折扣" v-model="formData.discount"></pg-input>
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
    name: 'vip-list-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          level: '',
          title: '',
          growth: '',
          discount: '',
        },
        loading: false,
      }
    },
    created() {

      const { type, item } = this.$props;

      if (type === 'add') {
        this.$data.formData.level = item.level;

      } else if (type === 'modify') {
        const formData = { ...item };
        formData.growth = Number(formData.growth);
        formData.discount = Handle.returnDiscount(formData.discount) || '';
        this.$data.formData = formData;
      }

    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.growth = Number(formData.growth);
          formData.discount = Handle.handleDiscount(formData.discount);

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'add' ? Api.merchantVipAdd : Api.merchantVipModify, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `会员等级${type === 'add' ? '新增' : '修改'}成功` });
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

<style scoped>
</style>
