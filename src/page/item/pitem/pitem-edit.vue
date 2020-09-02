<template>
  <pg-form item-width="260px" ref="form" class="px-20" :disabled="type === 'detail'">
    <div class="row no-gutters">
      <div class="col-3">
        <pg-form-item label="商品视频" item-width="200px" help-text="建议视频文件不超过50M">
          <pg-uploader module="item" v-model="formData.video" type="video"/>
        </pg-form-item>
      </div>
      <div class="col-9">
        <pg-form-item label="商品图片" rules="required" item-width="320px" help-text="商品轮播图片, 最多可设置5张, 推荐尺寸750*750。鼠标悬浮可预览, 拖拽可排序">
          <pg-uploader module="item" v-model="formData.images" multiple/>
        </pg-form-item>
      </div>
    </div>
    <pg-form-item label="商品名称" rules="required|max_length:20" item-width="620px">
      <pg-input v-model="formData.title" placeholder="请输入商品名称"/>
    </pg-form-item>
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="产地" rules="required|max_length:25">
          <pg-input v-model="formData.origin_place" placeholder="请输入产地"/>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="品牌" rules="required|max_length:20">
          <pg-input v-model="formData.brand" placeholder="请输入品牌"/>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="包装" rules="required|max_length:6">
          <pg-input v-model="formData.package_spec" placeholder="请输入包装方式"/>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="重量" rules="required|max_value:100000|decimal:1">
          <pg-input type="decimal" v-model="formData.weight" placeholder="请输入重量， 并选择计量单位">
            <template slot="suffix">
              <pg-select
                :valid="false"
                append-to-body
                v-model="formData.weight_unit"
                style="width: 50px; min-width: 50px;"
                :clearable="false"
                text-align="right"
                placeholder=""
              >
                <pg-option value="jin">斤</pg-option>
                <pg-option value="g">g</pg-option>
                <pg-option value="kg">kg</pg-option>
                <pg-option value="ml">ml</pg-option>
                <pg-option value="L">L</pg-option>
              </pg-select>
            </template>
          </pg-input>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="规格" rules="required|max_length:20">
          <pg-input v-model="formData.item_spec" placeholder="请输入商品规格"/>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="科学分类" :rules="{required: true, logic: systemClassValid}">
          <pg-cascader
            :level="4"
            :options="systemClassTree"
            v-model="formData.system_class_code"
            @selection="selectClsId"
            :clearable="false"
            placeholder="请选择科学分类"
          />
        </pg-form-item>
        <!-- :disabled="type === 'modify'" -->
      </div>
    </div>
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="保质期" rules="required">
          <pg-input type="number" v-model="formData.shelf_life" placeholder="请输入保质期，并选择计量单位">
            <template slot="suffix">
              <pg-select
                :valid="false"
                append-to-body
                v-model="formData.sl_unit"
                style="width: 50px; min-width: 50px;"
                :clearable="false"
                text-align="right"
                placeholder=""
              >
                <pg-option value="天">天</pg-option>
                <pg-option value="月">月</pg-option>
                <pg-option value="年">年</pg-option>
              </pg-select>
            </template>
          </pg-input>
        </pg-form-item>

      </div>
      <div class="col-6">
        <pg-form-item label="库存期" rules="required">
          <pg-input type="number" v-model="formData.stock_life" placeholder="请输入库存期，并选择计量单位">
            <template slot="suffix">
              <pg-select
                :valid="false"
                append-to-body
                v-model="formData.st_unit"
                style="width: 50px; min-width: 50px;"
                :clearable="false"
                text-align="right"
                placeholder=""
              >
                <pg-option value="天">天</pg-option>
                <pg-option value="月">月</pg-option>
                <pg-option value="年">年</pg-option>
              </pg-select>
            </template>
          </pg-input>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="条形码" rules="max_length:35">
          <pg-input type="number" v-model="formData.barcode" placeholder="请输入条形码" />
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <div class="col-12">
        <pg-form-item label="商品详情" item-width="620px" rules="required" help-text="富文本编辑器支持全屏编辑模式, 点击操作栏第一行右侧的全屏ICON, 开启该模式">
          <pg-editor v-model="formData.content"/>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters" v-if="type !== 'detail'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>
</template>

<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'pitem-edit',
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          source: 'retail',
          video: '', // 视频
          images: [], // 商品图片
          title: '', // 商品名称
          origin_place: '', // 产地
          brand: '', // 品牌
          package_spec: '', // 包装
          weight: '', // 重量
          weight_unit: 'jin', // 重量单位
          item_spec: '', // 规格
          system_class_code: '', // 科学分类
          shelf_life: '', // 保质期
          sl_unit: '天', // 保质期单位
          stock_life: '', // 库存期
          st_unit: '天', // 库存期单位
          content: '', // 富文本详情
          cls_id: '',
          barcode:''//条形码
        },

        loading: false,

        systemClassTree: [],
      }
    },
    created() {
      this.systemClassValid = {
        validate: (v) => {
          return v.length >= 8;
        },
        getMsg: '科学分类必须选择四级'
      };

      this.commonSystemClassTree();
      if (this.$props.type !== 'add') {
        const formData = {...this.$props.item};
        formData.weight = Handle.returnWeight(formData.weight);
        formData.source = 'retail'; // 兼容历史数据缺失 类型的问题
        formData.system_class_code = formData.system_classes[formData.system_classes.length - 1].code //设置正确的system_class_code
        this.$data.formData = formData;
      }


    },
    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.weight = Handle.handleWeight(formData.weight);
          formData.shelf_life = Number(formData.shelf_life);
          formData.stock_life = Number(formData.stock_life);

          const type = this.$props.type;
          this.$data.loading = true;
          Http.post(type === 'add' ? Api.pitemAdd : Api.pitemEdit, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `商品${type === 'add' ? '新增' : '修改'}成功` });
              this.$data.loading = false;
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

      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTreeNew)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },
      selectClsId(v){
        this.$data.formData.cls_id = v.cls_id
      }
    }
  }
</script>
