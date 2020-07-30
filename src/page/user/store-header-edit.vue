<template>
  <pg-form ref="form" item-width="220px" class="py-20 d-flex flex-column align-items-center" style="border-bottom: 1px solid #DDD">

    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="选择团长">
          <pg-select v-model="formData.member_id">
            <pg-option v-for="item in member_list" :key="item.id" :value="item.id" :disabled="item.disabled" @click="onSelectMember(item)">{{ item.realname }}</pg-option>
          </pg-select>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="登录手机">
          <pg-input v-model="formData.member_phone" disabled></pg-input>
        </pg-form-item>
      </div>
    </div>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'store-header-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      store: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          store_id: '',
          title: '',
          phone: '',
          address: '',
          member_id: '',
          member_phone: ''
        },
        member_list: [],
        loading: false,
      }
    },
    created() {
      const { id, title, phone, address } = this.$props.store;
      this.$data.formData = {...this.$data.formData, store_id: id, title, phone, address };

      this.commonStoreMemberList();
    },

    methods: {

      onSelectMember(item) {
        this.$data.formData = {...this.$data.formData, member_id: item.id, member_phone: item.phone};
      },

      commonStoreMemberList() {
        const {merchant_id, id} = this.$props.store;

        Http.get(Api.commonStoreMemberList, {merchant_id: merchant_id, store_id: id})
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

          let { store_id, member_id } = this.$data.formData;
          store_id = Number(store_id);
          member_id = Number(member_id);

          this.$data.loading = true;
          Http.post(Api.userStoreHeaderAdd, {store_id, member_id})
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `新增团长成功` });
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
