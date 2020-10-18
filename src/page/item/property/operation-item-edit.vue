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
      <pg-cascader
            class="ml-20"
            :level="2"
            primary-key="id"
            parent-key="parent_id"
            :options="displayClassTree"
            v-model="query.display_class_id"
            @change="changeQuery"
            placeholder="按展示分类筛选"
            clearable
        />
      <pg-search class="ml-20" placeholder="商品编号、名称" v-model="query.condition" @change="changeQuery"/>
    </div>

    <pg-form ref="form" item-width="1020px">
      <pg-form-item >
        <pg-transfer :data="itemList" v-model="formData.item_tag_records" :requiredData="editList" @selection="selectData" selectedTableWidth="600px" placeholder="商品列表">
            <template v-slot:unselected>
                 <pg-column title="商品名称" >
                     <template v-slot="{ row }">
                         {{row.code}} / {{row.title}}
                     </template>
                 </pg-column>
            </template>
            <template v-slot:selected>
                    <pg-column title="商品名称" width="">
                        <template v-slot="{ row }">
                            {{row.code}} / {{row.title}}
                        </template>
                    </pg-column>
                    <pg-column title="排序" width="110px">
                        <template v-slot="{ row }">
                            <pg-form-item item-width="60px" :rules="{'max_value:999': true,'required':true}" class="pb-0">
                                <pg-input size="sm" type="number" v-model="row.rank" ></pg-input>
                            </pg-form-item>
                        </template>
                    </pg-column>
            </template>
        </pg-transfer>
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
          item_tag_records: [],
        },
        loading: false,
        systemClassTree: [],
        displayClassTree: [],
        itemList: [],
        editList:[]
      }
    },
    created() {
      this.initQuery();
      this.commonItemList();
      this.commonSystemClassTree();
      this.commonDisplayClassTree();

      if(!Array.isArray(this.$props.item) || this.$props.item.length === 0) return
      this.$data.editList = this.$props.item.map(item =>({
              ...item,
              label: item.title,
              value: item.id
            }));
      this.$data.formData.item_tag_records = (this.$props.item || []).map(item =>(
              item.id
            ));

    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          system_class_code: '',
          display_class_id: '',
          condition: '',
          // need_num: 30,
          out_item_tag_id: this.$props.operation.id,
          is_all: 0,// 上架: 1 ; 全部: 0 或者 ''; 无单独下架
          is_gift: 0,//是否赠品
          is_deleted: 0,// 是否已删除
          // city_or_level: 1  传 1表示商品未参加区域定价 且未参加阶梯定价
          // city_id: 在 city_or_level 传值的情况下生效，过滤出该city下未参加过县域定价的商品
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

          // const formData = {...this.$data.formData, item_tag_id: this.$props.operation.id};
          let item_tag_id = this.$props.operation.id;

          let item_tag_records = this.$data.editList.map(item => ({
                item_id: item.id,
                rank: Number(item.rank) || 0
              }));
          this.$data.loading = true;
          Http.post(Api.itemTagUpdate, {
            item_tag_id: item_tag_id,
            item_tag_records: item_tag_records
          })
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `编辑专区商品成功` });
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
      selectData(list){
        this.$data.editList = list
      },

      commonItemList() {
        Http.get(Api.commonItemList, this.$data.query)
          .then(res => {
            this.$data.itemList = (res.data || []).map(item => ({
              ...item,
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

      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassTree = res.data || [];
          });
      },
    }
  }
</script>
<style lang="scss" scoped>
  .pg-transfer .pg-table tbody td{
    padding: 20px 8px;
    // height: 60px;
  }
</style>
