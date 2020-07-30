<template>
  <pg-form ref="form" label-width="90px" item-width="350px">

    <pg-form-item label="零售门店" rules="required" help-text="输入门店名称，搜索并指定需要开通零售的门店。不支持模糊匹配">
      <pg-select searchable v-model="formData.store_id" placeholder="请筛选需要开通零售的门店名称" @search="commonStoreList">
        <pg-option
          v-for="item in storeList"
          :key="item.value"
          :value="item.value"
          :disabled="item.disabled"
          @click="onSelectStore(item)"
        >{{item.label}}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item label="联系方式">
      <pg-input v-model="formData.phone" disabled></pg-input>
    </pg-form-item>

    <pg-form-item label="收货地址">
      <pg-input v-model="formData.address" disabled></pg-input>
    </pg-form-item>

    <pg-form-item label="团长" rules="required" help-text="选择零售门店后，可指定该门店下的会员成为团长" >
      <pg-select v-model="formData.member_id" :disabled="!formData.store_id" placeholder="请选择门店会员，成为零售门店团长">
        <pg-option v-for="item in member_list" :key="item.id" :value="item.id" :disabled="item.disabled" @click="onSelectMember(item)">{{ item.realname }}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item label="登录手机" help-text="指定团长后，会将团长的手机号，自动注册成零售商城的登录手机号">
      <pg-input v-model="formData.member_phone" disabled></pg-input>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'store-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      query: { type: Object, default() { return {} } },
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {

        formData: {
          store_id: '',
          member_id: '',
          phone: '',
          address: '',
          member_phone: ''
        },
        storeList: [],
        member_list: [],
        loading: false,
      }
    },
    created() {
      if (this.$props.type === 'modify') {
        this.$data.formData = { ...this.$props.item };
      }

      this.commonStoreList();
    },

    methods: {

      onSelectStore(item) {
        this.$data.formData = {...this.$data.formData, phone: item.phone, address: item.address};
        this.commonStoreMemberList(item.merchant_id, item.id);
      },

      onSelectMember(item) {
        this.$data.formData = {...this.$data.formData, member_id: item.id, member_phone: item.phone};
      },

      commonStoreList(condition = '') {
        Http.get(Api.commonStoreList, {
          province_code: this.$props.query.province_code,
          gb_included: 0,
          condition: condition,
          need_num: 30,
        }).then(res => {
          this.$data.storeList = (res.data || [])
            .filter(item => !item.is_freeze_header && !item.is_freeze)
            .map(item => {
              item.label = item.title;
              item.value = item.id;
              return item;
            });
        })
      },

      commonStoreMemberList(merchant_id, store_id) {

        Http.get(Api.commonStoreMemberList, {merchant_id: merchant_id, store_id: store_id})
          .then(res => {
            this.$data.member_list = (res.data || [])
              .filter(item => !item.is_deleted)
              .map(item => {
                let realname = item.realname || '';
                if (item.is_header) {
                  item.realname = realname + '(已绑定其他门店)';
                }
                if (item.is_freeze_header || item.is_freeze) {
                  item.realname = realname + '(已冻结)';
                }
                item.disabled = item.is_header || item.is_freeze_header || item.is_freeze;
                return item;
              });
          });
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};

          this.$data.loading = true;
          Http.post(Api.userStoreAdd, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `新增零售门店成功` });
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
