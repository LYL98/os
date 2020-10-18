<template>
  <pg-form ref="form" item-width="225px" class="pr-10">

    <pg-form-item label="商户名称" rules="required|max_length:10">
      <pg-input v-model="formData.title" placeholder="请输入商户名称"></pg-input>
    </pg-form-item>

    <pg-form-item label="协议商户" rules="required">
      <pg-radio-group inline border v-model="formData.is_post_pay">
        <pg-radio :value="true">是</pg-radio>
        <pg-radio :value="false">否</pg-radio>
      </pg-radio-group>
    </pg-form-item>

    <pg-form-item v-if="formData.is_post_pay === true" label="授信额度" rules="required|min_value:0.01:blur|max_value:1000000">
      <pg-input type="decimal" suffix="元" v-model="formData.credit_limit" placeholder="请输入授信额度"></pg-input>
    </pg-form-item>

    <div class="text-center mt-10">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle } from '@/util';

export default {
  name: 'merchant-detail-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'modify' },
    item: { type: Object, default() { return {} } },
  },
  data() {
    return {
      formData: {

      },
      loading: false,
    }
  },
  created() {

    const {id, title, is_post_pay, credit_limit} = this.$props.item;
    this.$data.formData = {
      id: id,
      title: title,
      is_post_pay: is_post_pay,
      credit_limit: is_post_pay ? Handle.returnPrice(credit_limit) : 10000, // 如果之前是授信用户，则获取授信额度；如果之前是非授信用户，则给一个初始值10000
    };
  },

  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};
        formData.credit_limit = formData.is_post_pay ? Handle.handlePrice(formData.credit_limit) : 0;

        this.$data.loading = true;
        Http.post(Api.merchantEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `商户信息修改成功` });
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
