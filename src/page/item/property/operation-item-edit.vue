<template>
  <div class="px-20">
    <div class="d-flex mb-20">
      <pg-cascader
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-select v-model="query.display_class_id" class="ml-20" placeholder="按展示分类筛选" clearable @change="changeQuery">
        <pg-option
          v-for="item in displayClassList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.title }}
        </pg-option>
      </pg-select>
      <pg-search class="ml-20" placeholder="商品编号、名称" v-model="query.condition" @change="changeQuery"/>
    </div>

    <pg-form ref="form" item-width="620px">
      <pg-form-item rules="required">
        <pg-transfer :data="itemList" v-model="formData.item_ids" placeholder="商品列表"></pg-transfer>
      </pg-form-item>
      <div class="text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
      </div>
    </pg-form>

  </div>

</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'operation-item-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
      operation: { type: Object, default() { return {} } },
    },
    data() {
      return {
        query: {},
        formData: {
          item_ids: [],
        },
        loading: false,
        systemClassTree: [],
        displayClassList: [],
        itemList: [],
      }
    },
    created() {
      this.initQuery();
      this.commonItemList();
      this.commonSystemClassTree();
      this.commonDisplayClassList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          system_class_code: '',
          display_class_id: '',
          condition: '',
          need_num: 30,
          out_item_tag_id: this.$props.operation.id,
          is_on_sale: 1,
          is_deleted: 0,
        }
      },

      changeQuery() {
        this.commonItemList();
      },

      resetQuery() {
        this.initQuery();
        this.commonItemList();
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData, item_tag_id: this.$props.operation.id};

          this.$data.loading = true;
          Http.post(Api.operationItemAdd, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `新增专区商品成功` });
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

      commonItemList() {
        Http.get(Api.commonItemList, this.$data.query)
          .then(res => {
            this.$data.itemList = (res.data || []).map(item => ({
              label: item.title,
              value: item.id
            }));
          })
      },

      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTree)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },

      commonDisplayClassList() {
        Http.get(Api.commonDisplayClassList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassList = res.data || [];
          });
      },
    }
  }
</script>
