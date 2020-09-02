<template>
  <pg-form ref="form" label-width="90px" item-width="270px">

    <pg-form-item label="所属县域" rules="required">
      <pg-select class="mr-20" v-model="formData.city_id" searchable @change="changeQuery">
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item label="绑定门店" help-text="输入门店名称，搜索对应的门店。不支持模糊匹配" rules="required">
      <pg-select searchable v-model="formData.store_id" placeholder="请筛选所属门店" @search="commonStoreList" :disabled='!formData.city_id'>
        <pg-option
          v-for="item in storeList"
          :key="item.id"
          :value="item.id"
        >{{item.title}}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item label="推广者手机号" rules="required|phone:blur">
      <pg-input :disabled="type === 'modify'" type="phone" v-model="formData.login_phone" placeholder="请输入推广者的手机号"></pg-input>
    </pg-form-item>
    <pg-form-item label="昵称" rules="required|max_length:10">
      <pg-input v-model="formData.nickname" placeholder="请输入推广者的昵称"></pg-input>
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
    name: 'promoter-edit',
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
          login_phone: '',
          nickname: '',
          city_id:'',
          province_code: this.$props.query.province_code,
        },
        storeList: [],
        loading: false,
        cityList:[],
      }
    },

    created() {
      if (this.$props.type === 'modify') {
        const { id, store_id, city_id, login_phone, nickname, province_code } = this.$props.item;
        this.$data.formData = {
          id: id,
          store_id: store_id,
          city_id: city_id,
          login_phone: login_phone,
          nickname: nickname,
          province_code: province_code,
        };
      this.commonStoreList();
      }
      this.commonCityList();
    },

    methods: {

      commonCityList() {
        Http.get(Api.commonCityList, { province_code: this.$data.formData.province_code})
          .then(res => {
            this.$data.cityList = res.data || [];
        });
      },

      changeQuery() {
        this.$data.formData.store_id = '';
        this.commonStoreList();
      },

      commonStoreList(condition = '') {
        Http.get(Api.commonStoreList, {
          province_code: this.$props.query.province_code,
          gb_included: 1,
          city_id: this.$data.formData.city_id,
          condition: condition,
          need_num: 500,
        }).then(res => {
          this.$data.storeList = (res.data || []).filter(item => !item.is_freeze_header && !item.is_freeze);
        })
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          const type = this.$props.type;

          this.$data.loading = true;
          Http.post(type === 'add' ? Api.userPromoterAdd : Api.userPromoterModify, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `推广者${type === 'add' ? '新增' : '修改'}成功` });
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
