<template>
    <pg-form ref="form" label-width="90px" item-width="350px">

      <pg-form-item label="绑定门店" rules="required" help-text="输入门店名称，搜索并指定需要开通零售的门店。不支持模糊匹配">
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

      <div class="text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
      </div>
    </pg-form>
  </template>

  <script>
    import { Http, Api } from '@/util';

    export default {
      name: 'user-applicant-edit',
      inject: ['app'],
      props: {
        query: { type: Object, default() { return {} } },
        item: { type: Object, default() { return {} } },
      },
      data() {
        return {

          formData: {
            store_id: '',
            id: '',
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
        this.commonStoreList();
      },

      methods: {

        onSelectStore(item) {
          this.$data.formData = {...this.$data.formData, phone: item.phone, address: item.address};
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

        onSubmit() {
          this.$refs['form'].validateAll().then(valid => {
            if (!valid) return;

            const formData = {...this.$data.formData};
            formData.id = this.$props.item.id;

            this.$data.loading = true;
            Http.post(Api.userApplicantPass, formData)
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
