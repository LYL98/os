<template>
  <pg-form item-width="298px" ref="form" class="px-20">
    <pg-form-item label="名称" rules="required|max_length:10" >
      <pg-input v-model="formData.title" placeholder="请输入10位以内字符" />
    </pg-form-item>
    <div class="row no-gutters">
        <div class="col-5" >
          <pg-form-item label="加价率"  :rules="{ 'required': true,'logic:blur': v_max }" item-width="100px">
            <pg-input signed type="decimal:1" v-model="formData.rise_min" placeholder="" suffix="%" />
          </pg-form-item>
        </div>
        <div class="col-5" >
          <pg-form-item label="至"  :rules="{ 'required': true, 'logic:blur': v_min,}" item-width="100px">
            <pg-input signed type="decimal:1" v-model="formData.rise_max" placeholder="" suffix="%" />
          </pg-form-item>
        </div>
      </div>
     <pg-form-item label="备注"  rules="max_length:50">
        <pg-textarea  v-model="formData.remark" maxlength="20" placeholder="备注不超过20个字"></pg-textarea>
    </pg-form-item>
    <div class="row no-gutters">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle, Constant } from "@/util";

export default {
  name: "item-price-add-edit",
  inject: ["app"],
  props: {
    type: { type: String, default: "add" },
    item: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      formData: {
        title: "", //名称
        rise_min: "", //加价率
        rise_max: "", //加价率
        remark: "",
        province_code: this.app.userInfo.province_code, // 省份
      },

      loading: false,
    };
  },
  created() {
      this.Handle = Handle;
      this.Constant = Constant;
    if (this.$props.type === "modify") {
      const formData = { ...this.$props.item };
      formData.rise_min = this.Handle.returnPercent(formData.rise_min);
      formData.rise_max = this.Handle.returnPercent(formData.rise_max);

      this.$data.formData = formData;
    }
    // 自定义加价率校验规则
      this.v_min = {
        validate: () => {
          
          let max = this.$data.formData.rise_max * 10
          let min = this.$data.formData.rise_min * 10
          
          return Number(max) > Number(min)
        },
        getMsg: '不能小于或等于前区间'
      };
      this.v_max = {
        validate: () => {
          if(this.$data.formData.rise_max == 0) return true
          let max = this.$data.formData.rise_max  * 10
          let min = this.$data.formData.rise_min  * 10
          return Number(max) > Number(min)
        },
        getMsg: '不能大于或等于后区间'
      }
  },
  methods: {
   //提交数据
    onSubmit() {
      this.$refs["form"].validateAll().then(valid => {
        if (!valid) return;
        const formData = { ...this.$data.formData };
        formData.rise_min = Number(this.Handle.handlePercent(formData.rise_min));
        formData.rise_max = Number(this.Handle.handlePercent(formData.rise_max));
        const type = this.$props.type;
        const api = formData.id ? Api.basicdataItemInnerTagsEdit : Api.basicdataItemInnerTagsAdd
        this.$data.loading = true;
        Http.post(
          api,
          formData
        )
          .then(() => {
              this.$toast({
                type: "success",
                message: `商品价格标签${type === "add" ? "新增" : "修改"}成功`
              });
              this.$data.loading = false;
              this.$emit("submit");
          })
          .catch(() => {
            this.$data.loading = false;
          });
      });
    },

    onCancel() {
      this.$emit("cancel");
    },
  }
};
</script>
