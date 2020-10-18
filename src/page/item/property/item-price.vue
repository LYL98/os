<template>
  <div class="pg-page p-20">
    <div class="d-flex">
      </div>
    <div class="card mt-10 mb-10">
      <div class="card-header border-bottom-solid d-flex">
          <div class="ml-auto my-10 mr-10" v-if="app.auth.isAdmin || app.auth.ItemTagsPriceAdd">
            <pg-button @click="handleAddItem" color="primary">新增</pg-button>
          </div>
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column title="名称" >
            <template v-slot="{row}">
              {{ row.title }}
            </template>
          </pg-column>
          <pg-column  title="加价率" >
            <template v-slot="{row}">
              <div>
                <span>{{Handle.returnPercent(row.rise_min)}}%</span>
                <span> - </span>
                <span>{{Handle.returnPercent(row.rise_max)}}%</span>
              </div>
            </template>
          </pg-column>
          <pg-column  title="备注" >
            <template v-slot="{row}">
              <div class="pre">
                {{row.remark || '-'}}
              </div>
            </template>
          </pg-column>
          <pg-column  title="创建时间">
            <template v-slot="{row}">
                {{row.created || '-'}}
            </template>
          </pg-column>
          <pg-column  title="操作" width="80px">
            <template v-slot="{row}">
              <div>
                <a class="text-decoration-none" @click="handleModifyItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemTagsPriceEdit)">修改</a>
                <pg-confirm @confirm="handleDeleteItem(row)" help-text="您确定删除?" v-if="app.auth.isAdmin || app.auth.ItemTagsPriceDelete">
                  <a class="ml-10 text-decoration-none">删除</a>
                </pg-confirm>
                <div class="" v-else> - </div>
              </div>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
       
      </div>
    </div>

     <pg-dialog append-to-body width="550px;" :title="`${dialog.type === 'add' ? '新增' : '修改'}商品价格标签`" v-model="dialog.visible">
      <item-price-add-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import itemPriceAddEdit from './item-price-add-edit';

  export default {
    name: 'item-price',
    components: {itemPriceAddEdit},
    inject: ['app'],
    data() {
      return {
        query: {},
        list:[],
        dialog: {
          visible: false,
          item: {},
        },
        loading: false,
      }
    },
     watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.changeQuery();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.initQuery()
      document.title = '商品价格标签 - 商品 - 蒲公英运营管理系统';
      this.basicdataItemInnerTagsList()
    },

    methods: {
      initQuery() {
        this.$data.query = {
            province_code: this.app.userInfo.province_code, // 省份
            // page: 1,
            // page_size: 20
        };
        },
        changeQuery(){
          this.basicdataItemInnerTagsList()
        },
    //获取商品价格标签的列表
      basicdataItemInnerTagsList() {
        Http.get(Api.basicdataItemInnerTagsList,this.$data.query)
          .then(res => {
              this.$data.list = res.data || []

          });
      },
      //获取新增页面
      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },
      //获取修改页面
      handleModifyItem(item) {
        if(item){
          this.$data.dialog = { type: 'modify', visible: true, item: item || {} };
        }
      },
      //删除
      handleDeleteItem(item){
        if(item){
               Http.post(Api.basicdataItemInnerTagsDelete,{
              id: item.id
          }).then(()=>{
              this.$toast({
                  type:'success',
                  message:'删除成功'
              })
              this.basicdataItemInnerTagsList()
          })
        }   
      },
    //新增或修改完后的提交触发事件
      handleSubmit() {
        this.handleCancel();
        this.basicdataItemInnerTagsList();
      },
    //新增或修改完后的取消提交时触发事件
      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },
    }

  }
</script>

<style lang="scss" scoped>
  .pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
.border-bottom-solid{
    border-bottom: 1px solid #ddd;
}
</style>
