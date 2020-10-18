<template>
  <pg-form ref="form" item-width="240px" label-width="90px">
   
        <pg-form-item label="商品编号/名称" class="line-height-28">
          {{formData.code}} / {{formData.title}}
        </pg-form-item>
        <pg-form-item label="原内标签"  class="line-height-28">
          <div v-if="formData.inner_tag && formData.inner_tag.title">{{formData.inner_tag && formData.inner_tag.title || ''}}（加价率：{{Handle.returnPercent(formData.inner_tag && formData.inner_tag.rise_min)}}% - {{Handle.returnPercent(formData.inner_tag && formData.inner_tag.rise_max)}}%）</div>
          <div v-else> - </div>
        </pg-form-item>
        <pg-form-item label="价格标签" rules="required">
            <pg-select   v-model="formData.new_inner_tag_id" placeholder="请选择商品加价标签">
                <pg-option
                    v-for="item in itemInnerTagsList"
                    :key="item.id"
                    :value="item.id"
                    >
                    {{ item.title }}{{`(加价率: ${Handle.returnPercent(item.rise_min)}% - ${Handle.returnPercent(item.rise_max)}%)`}}
                </pg-option>
            </pg-select>
          </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'list-edit-inner-tag',
    inject: ['app'],
    props: {
      type: { type: String, default: 'editInnerTag' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      // const province_code = this.app.userInfo.province_code;
      return {
        formData: {
          inner_tag: {},
          new_inner_tag_id: '',
        },
        loading: false,
        itemInnerTagsList:[],

      }
    },
    created() {
        this.Handle = Handle;
        this.commonItemInnerTagsList()
      if (this.$props.type === 'editInnerTag') {
        this.$data.formData = { ...this.$props.item };
      }
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          this.$data.loading = true;
          // const type = this.$props.type;
          Http.post(Api.itemInnerTagEdit, {
            id: formData.id,
            inner_tag_id: formData.new_inner_tag_id
          })
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `修改内标签成功` });
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
      //价格标签
      commonItemInnerTagsList(){
          Http.get(Api.commonItemInnerTagsList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.itemInnerTagsList = res.data || [];
          });
      },
    }
  }
</script>
<style lang="scss" scoped> 
    .line-height-28{
        line-height: 28px;
    }
</style>