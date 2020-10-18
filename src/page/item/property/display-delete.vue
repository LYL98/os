<template>
  <pg-form ref="form" item-width="200px">
    <pg-form-item label="新分类" rules="" help-text="删除分类时先将此分类下的商品转移到新的分类下,如不转移,删除后该分类下的商品将关联到一级展示分类下" >
          <pg-input v-model="formData.title" placeholder="请输入展示分类名称"/>
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
    name: 'display-delete',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      const province_code = this.app.userInfo.province_code;
      return {
        formData: {
          province_code: province_code,
          new_id:''
        },
        loading: false,
        displayClassTree: []
      }
    },
    computed: {

    },
    created() {

        this.commonDisplayClassTree()
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};


          this.$data.loading = true;
          Http.post(Api.basicdataDisplayClassDelete, {
              id: this.$props.item.id || '',
              new_id: formData.new_id
          })
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `删除成功` });
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
</style>
