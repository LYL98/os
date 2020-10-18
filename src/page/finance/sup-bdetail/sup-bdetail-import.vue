<template>
  <pg-form ref="form" item-width="260px">
    <div class="mb-20">
      <span style="margin-left: 18px">下载模板：</span>
      <a href="/excel/供应商流水导入模板.xlsx">供应商流水导入模板.xlsx</a>
    </div>

    <div class="mb-20">
      <span style="margin-left: 18px">导入文件：</span>
      <input
        type="file"
        name="file"
        ref="select-import-file"
        accept=".xls,.xlsx"
      />
    </div>

    <div class="text-danger" v-if="isErrorShow">
      <p style="text-indent: 4em">导入文件异常</p>
      <p style="text-indent: 4em" v-for="(item,index) in fileData" :key="index">{{index+1}}、第{{item.row_num}}行，<span v-for="(v,n) in item.col" :key="n">{{v}}、</span>列异常</p>
    </div> 

    <div>
      <p style="text-indent: 4em">*仅支持Excel文件，请使用系统提供的文件模板</p>
      <p style="text-indent: 4em">1、上传文件内容请勿使用标点符号和空格；</p>
      <p style="text-indent: 4em">2、上传文件内容确保Excel每行都有数据。</p>
    </div>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from "@/util";

export default {
  name: "approve-check",
  inject: ["app"],
  props: {
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
        id: "",
        status: "checked",
        audit_remark: ""
      },
      loading: false,
      fileData: [],
      isErrorShow: false
    };
  },
  created() {
    this.$data.formData.id = this.$props.item.id;
  },

  methods: {
    
    onSubmit() {
      this.$refs["form"].validateAll().then(valid => {
        if (!valid) return;
        let dom = this.$refs['select-import-file'];
        if(dom.files.length <= 0){
          this.$toast({message: '请选择excel文件', type: 'warning'});
          return;
        }

        const formData = new FormData();
        const file = dom.files[0]
        formData.append('file', file);

        this.$data.loading = true;
        Http.post(Api.financeSupBDetailAddByExcel, formData , { contentType: 'multipart/form-data' })
          .then((res) => {
            this.$data.loading = false;
            let rd = res.data || []
            if(rd.length <= 0) {
              this.$toast({
                type: "success",
                message: "导入成功"
              });
              this.$emit("submit");
            }else {
              this.$data.fileData = rd
              this.$data.isErrorShow = true
            }
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
