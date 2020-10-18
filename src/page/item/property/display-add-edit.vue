<template>
  <pg-form ref="form" item-width="400px">
    <pg-form-item label="一级分类" rules="required|max_length:6:blur" help-text="小于等于6个字符" v-if="(type === 'modify' && formData.level == 2) || (type === 'add' && formData.parent_title)">
          <pg-input disabled v-model="formData.parent_title" placeholder="请输入展示分类名称"/>
    </pg-form-item>
    <pg-form-item label="名称" rules="required|max_length:6:blur" help-text="小于等于6个字符">
          <pg-input v-model="formData.title" placeholder="请输入展示分类名称"/>
    </pg-form-item>
    <pg-form-item label="排序" rules="min_value:0:blur|max_value:999:blur" help-text="请输入0 - 999的数值, 值越大, 排序越靠前">
          <pg-input type="number" v-model="formData.rank" placeholder="请输入展示分类的排序值"/>
    </pg-form-item>
    <pg-form-item label="备注" rules="max_length:200:blur" help-text="请输入200位以内的字符">
          <pg-textarea v-model="formData.remark" maxlength="200"></pg-textarea>
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
    name: 'display-add-edit',
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
          title: '',
          rank: '',
          remark: '',
          parent_title: '',
          level: 0,
          parent_id:'',

        },
        loading: false,
      }
    },
    computed: {
     
    },
    created() {
      if (this.$props.type === 'modify') {
        this.$data.formData = { ...this.$props.item };
      }else if(this.$props.type === 'add'){
        if(this.$props.item && this.$props.item.id){
          this.$data.formData.parent_title = this.$props.item && this.$props.item.title || '';
          this.$data.formData.parent_id = this.$props.item && this.$props.item.id || '';
          this.$data.formData.level = 2;
        }
         
      }

    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;
          const type = this.$props.type
          const formData = {...this.$data.formData};
          let addData = {}
          if(type === 'add'){
                if(formData.parent_id){
                    addData = {
                        province_code: formData.province_code,
                        title: formData.title,
                        rank: Number(formData.rank) || 0,
                        remark: formData.remark,
                        parent_id: formData.parent_id,
                        level: 2
                    }
                }else{
                  addData = {
                    province_code: formData.province_code,
                    title: formData.title,
                    rank: Number(formData.rank) || 0,
                    remark: formData.remark
                  }
                }
           
          }else{
            addData = {
                province_code: formData.province_code,
                title: formData.title,
                rank: Number(formData.rank) || 0,
                remark: formData.remark,
                id: formData.id,
            }
          }

          this.$data.loading = true;
          Http.post(type === 'add' ? Api.basicdataDisplayClassAdd : Api.basicdataDisplayClassEdit, addData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${type === 'add' ? '新增' : '修改'}展示分类成功` });
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

<style lang="scss" scoped>

</style>
