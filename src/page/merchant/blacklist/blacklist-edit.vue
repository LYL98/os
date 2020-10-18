<template>
  <pg-form ref="form" label-width="90px" item-width="300px" class="px-20">

    <pg-form-item label="门店" :show-label="false" rules="required" item-width="600px" help-text="请添加需要加入黑名单的门店，已在黑名单的门店不在该列表显示">
      <pg-search
        size="lg"
        style="min-width: 265px; width: 265px"
        class="-mb-1"
        placeholder="门店名称"
        v-model="query.condition"
        @change="changeQuery"
        immediate
        debounce
      />
      <pg-transfer :data="storeList" v-model="formData.ids" placeholder="门店列表"></pg-transfer>
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
    name: 'blacklist-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        query: {},
        formData: {
          ids: []
        },
        loading: false,
        storeList: []
      }
    },
    created() {
      this.initQuery();
      this.commonStoreList();
    },

    methods: {

      initQuery() {
        const province_code = this.app.userInfo.opt_type === 'global' ? '' : this.app.userInfo.province_code;
        this.$data.query = {
          province_code: province_code,
          is_black: 0, // 筛选出不在黑名单的门店
          condition: '',
          need_num: 30,
        }
      },

      changeQuery() {
        this.commonStoreList();
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};

          this.$data.loading = true;
          Http.post(Api.merchantBlacklistAdd, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `黑名单添加成功` });
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
        Http.get(Api.commonStoreList, this.$data.query).then(res => {
          this.$data.storeList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        })
      },
    }
  }
</script>

<style scoped>
</style>
