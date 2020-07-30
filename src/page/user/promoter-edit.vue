<template>
  <pg-form ref="form" label-width="90px" item-width="270px">

    <pg-form-item label="所属门店" rules="required" help-text="输入门店名称，搜索对应的门店。不支持模糊匹配">
      <pg-select searchable v-model="formData.store_id" placeholder="请筛选所属门店" @search="commonStoreList">
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
        },
        storeList: [],
        loading: false,
      }
    },
    created() {
      if (this.$props.type === 'modify') {
        const { id, store_id, login_phone, nickname } = this.$props.item;
        this.$data.formData = {
          id: id,
          store_id: store_id,
          login_phone: login_phone,
          nickname: nickname
        };
      }
      this.commonStoreList();
    },

    methods: {

      commonStoreList(condition = '') {
        Http.get(Api.commonStoreList, {
          province_code: this.$props.query.province_code,
          gb_included: 1,
          condition: condition,
          need_num: 30,
        }).then(res => {
          let list = (res.data || []).filter(item => !item.is_freeze_header && !item.is_freeze);
          if (this.$props.type === 'modify') {
            const { store } = this.$props.item;
            if (list.some(d => d.id === store.id)) {

            } else {
              list = [store, ...list];
            }
          }
          this.$data.storeList = list;
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
