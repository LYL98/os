<template>
  <pg-form ref="form" item-width="225px" class="pr-10">

    <pg-form-item label="上传头像" rules="required">
      <pg-uploader module="merchant" v-model="formData.avatar"></pg-uploader>
    </pg-form-item>

    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="姓名" rules="required|max_length:10">
          <pg-input v-model="formData.realname" placeholder="请输入姓名"></pg-input>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="登录手机" rules="required|phone:blur">
          <pg-input v-model="formData.phone" placeholder="请输入登录手机"></pg-input>
        </pg-form-item>
      </div>
    </div>

    <pg-form-item item-width="300px" label="账号权限" rules="required" help-text="账号权限设置为子账户，需指定门店，否则无法进入商城">
      <pg-radio-group inline border v-model="formData.is_main">
        <pg-radio :value="1">主账号</pg-radio>
        <pg-radio :value="0">子账号</pg-radio>
      </pg-radio-group>
    </pg-form-item>

    <pg-form-item
      v-if="formData.is_main === 0"
      label="指定门店"
      rules="required"
      item-width="550px"
      :help-text="storeList.length <= 0 ? '无门店信息，请到门店管理新增' : ''"
    >
      <pg-transfer :data="storeList" v-model="formData.store_ids"></pg-transfer>
    </pg-form-item>

    <div class="text-center mt-10">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util';

export default {
  name: 'merchant-detail-member-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'add' },
    item: { type: Object, default() { return {} } },
    merchant_id: { type: Number, default: 0 },
  },
  data() {
    const merchant_id = this.$props.merchant_id;

    return {
      formData: {
        is_main: 1,
        is_header: false,
        realname: '',
        password: '',
        phone: '',
        avatar: '',
        merchant_id: merchant_id,
        store_ids:[],
      },
      loading: false,

      storeList: []
    }
  },
  created() {

    const { type, item } = this.$props;

    if (type === 'modify') {
      const formData = { ...item };
      formData.is_main = formData.is_main ? 1 : 0;
      this.$data.formData = formData;
    }

    this.commonStoreList();

  },

  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};

        this.$data.loading = true;
        const type = this.$props.type;
        Http.post(type === 'add' ? Api.memberAdd : Api.memberEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `用户${type === 'add' ? '新增' : '修改'}成功` });
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

    commonStoreList() {
      Http.get(Api.commonStoreList, {merchant_id: this.$props.merchant_id})
        .then(res => {
          this.$data.storeList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }))
        })
    },
  }
}
</script>

<style scoped>
</style>
