<template>

  <div>

    <div class="px-20">
      <h3 class="d-inline-block px-10">基础信息</h3>
      <span v-if="type !== 'detail'">在商品库添加时创建，不可修改 <a class="" @click="is_show_info = !is_show_info">{{ !is_show_info ? '查看' : '收起'}}</a></span>
    </div>

    <pg-form item-width="240px" label-width="90px" class="px-20" key="pitem" disabled v-if="is_show_info || type === 'detail'">

      <div class="row no-gutters">
        <div class="col-3">
          <pg-form-item label="商品视频" item-width="160px">
            <pg-uploader module="item" v-model="formData.p_item.video" type="video"/>
          </pg-form-item>
        </div>
        <div class="col-9">
          <pg-form-item label="商品图片" rules="required" item-width="450px" help-text="商品详情页面轮播展示图片，最多可设置5张，推荐尺寸750*750">
            <pg-uploader module="item" v-model="formData.p_item.images" multiple/>
          </pg-form-item>
        </div>
      </div>
      <pg-form-item label="商品名称" rules="required|max_length:20" item-width="600px">
        <pg-input v-model="formData.p_item.title" placeholder="请输入商品名称"/>
      </pg-form-item>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="产地" rules="required|max_length:25">
            <pg-input v-model="formData.p_item.origin_place" placeholder="请输入产地"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="品牌" rules="required">
            <pg-input v-model="formData.p_item.brand" placeholder="请输入品牌"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="包装" rules="required|max_length:6">
            <pg-input v-model="formData.p_item.package_spec" placeholder="请输入包装方式"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="重量" rules="required">
            <pg-input type="decimal" v-model="formData.p_item.weight" placeholder="请输入重量， 并指定计量单位">
              <template slot="suffix">
                <pg-select
                  :valid="false"
                  v-model="formData.p_item.weight_unit"
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
          <pg-form-item label="规格" rules="required">
            <pg-input v-model="formData.p_item.item_spec" placeholder="请输入商品规格"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="科学分类" rules="required">
            <pg-cascader
              :options="systemClassTree"
              v-model="formData.p_item.system_class_code"
              @change="changeQuery"
              :clearable="false"
              placeholder="请选择科学分类"
            />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="保质期" rules="required">
            <pg-input type="number" v-model="formData.p_item.shelf_life" placeholder="请输入保质期，并选择计量单位">
              <template slot="suffix">
                <pg-select
                  :valid="false"
                  v-model="formData.p_item.sl_unit"
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
            <pg-input type="number" v-model="formData.p_item.stock_life" placeholder="请输入库存期，并选择计量单位">
              <template slot="suffix">
                <pg-select
                  :valid="false"
                  v-model="formData.p_item.st_unit"
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

      <pg-form-item label="商品详情" item-width="600px">
        <pg-editor v-model="formData.p_item.content" disabled/>
      </pg-form-item>
    </pg-form>

    <pg-form item-width="240px" label-width="90px" ref="form" class="px-20" key="subitem" :disabled="type === 'detail'">
      <h3 class="p-10">销售信息</h3>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="活动" required>
            <pg-button-group v-model="formData.is_presale" :options="{ '非预售': false, '预售': true }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="运营专区" item-width="300px">
            <pg-button disabled class="mr-10 mt-3" v-for="(item, index) in formData.tags" size="sm" :key="index">{{ item }}</pg-button>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6" v-if="formData.is_presale">
          <pg-form-item label="配送日期" rules="required" help-text="用户下单时可以选择具体的配送时间">
            <pg-datepicker
              range
              :limit="{from: tomorrow}"
              :quickable="false"
              :clearable="false"
              v-model="formData"
              beginDateKey="presale_begin"
              endDateKey="presale_end"
            ></pg-datepicker>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="库位序号">
            <pg-input type="number" v-model="formData.location_num" placeholder="请输入库位序号"></pg-input>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="销售价" rules="required|min_value:0.01:blur|max_value:999999">
            <pg-input type="decimal" v-model="formData.price_sale" placeholder="请输入销售价" suffix="元" @change="changePriceSale"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="原价" :rules="{'max_value:999999': true, logic: price_origin_validator}">
            <pg-input type="decimal" v-model="formData.price_origin" placeholder="请输入原价" suffix="元"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="利润分成" rules="required|max_value:999999" help-text="平台与门店进行利润分成，设置好金额后，每销售一件就进行一件分成">
            <pg-input type="decimal" v-model="formData.price_divide" placeholder="请输入利润分成" suffix="元"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="库存">
            <pg-input type="number" disabled v-model="formData.stock" placeholder="请输入库存" suffix="件"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="最小购买数量" rules="required|min_value:0|max_value:999" help-text="商品的起订数量，用户下单时不可以低于该数量否则无法下单">
            <pg-input type="number" v-model="formData.minimum" placeholder="请输入最小购买数量" suffix="件"/>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="最大购买数量" rules="required|min_value:1|max_value:999" help-text="商品的购买上限，防止单个用户将商品全部购买">
            <pg-input type="number" v-model="formData.maximum" placeholder="请输入最大购买数量" suffix="件"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="展示分类" class="mb-0">
            <div class="d-flex">
              <pg-form-item label="一级分类" :show-label="false" item-width="120px" rules="required">
                <pg-select v-model="formData.display_class_id" :clearable="false" placeholder="一级分类" @change="changeDisplayClass">
                  <pg-option
                    v-for="item in displayClassList"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.title }}
                  </pg-option>
                </pg-select>
              </pg-form-item>
              <pg-form-item label="二级分类" :show-label="false" item-width="120px">
                <pg-select :disabled="!formData.display_class_id" v-model="formData.display_sec_id" :clearable="false" placeholder="二级分类">
                  <pg-option
                    v-for="item in displayClassSecList"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.title }}
                  </pg-option>
                </pg-select>
              </pg-form-item>
            </div>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="排序" rules="min_value:0|max_value:999" help-text="排序值越大，在商品列表排序越靠前">
            <pg-input type="number" v-model="formData.rank" placeholder="请输入排序"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="采购员">
            <pg-select v-model="formData.buyer_id" searchable clearable placeholder="请选择采购员">
              <pg-option
                v-for="item in buyerList"
                :key="item.id"
                :value="item.id"
              >
                {{ item.realname }} / {{ item.phone }}
              </pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="概述" rules="max_length:10">
            <pg-input v-model="formData.remark" placeholder="请输入商品概述"/>
          </pg-form-item>
        </div>
      </div>
      <h3 class="p-10">分享信息</h3>
      <pg-form-item label="分享文案" item-width="600px" rules="max_length:30" help-text="用于用户的分享传播，如不设置系统则使用商品的名称和销售价进行组合显示">
        <pg-input v-model="formData.share_content" placeholder="请输入分享文案"/>
      </pg-form-item>
      <pg-form-item label="分享图片" item-width="600px" help-text="用于用户的分享传播，如不设置系统则使用商品图片的第一张图。图片推荐比例 5 : 4">
        <pg-uploader module="item" v-model="formData.share_images" multiple/>
      </pg-form-item>
      <div class="row no-gutters" v-if="type !== 'detail'">
        <div class="col-12 text-center">
          <pg-button @click="onCancel">取消</pg-button>
          <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
        </div>
      </div>
    </pg-form>

  </div>

</template>

<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'subitem-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'on' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      let today = new Date();
      today.setTime(today.getTime() + 48 * 60 * 60 * 1000);
      let tomorrow = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      return {
        tomorrow: tomorrow,

        is_show_info: false,

        formData: {

          p_item: {
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
            video: '', // 视频
          },

          is_presale: 0, // 是否预售商品
          presale_begin: '', // 配送日期 开始
          presale_end: '', // 配送日期 结束
          sample_tags: [], // 运营专区
          location_num: 0, // 库位序号

          price_sale: '', // 销售价
          price_origin: '', // 原价
          price_divide: '', // 利润分成
          stock: '', // 库存
          minimum: '', // 最小购买数量
          maximum: 999, // 最大购买数量
          display_class_id: '', // 一级分类
          display_sec_id: '', // 二级分类
          rank: '', // 排序
          remark: '', // 概述
          buyer_id: '', // 采购员

          share_content: '', // 分享文案
          share_images: [], // 分享图片

        },

        loading: false,

        systemClassTree: [],
        displayClassList: [],
        displayClassSecList: [],
        buyerList: [],
      }
    },
    created() {

      this.commonSystemClassTree();
      this.commonDisplayClassTree();
      this.commonBuyerList();

      const formData = { ...this.$props.item };
      formData.p_item.weight = Handle.returnWeight(formData.p_item.weight);
      formData.price_sale = Handle.returnPrice(formData.price_sale);
      formData.price_origin = Handle.returnPrice(formData.price_origin) || '';
      formData.price_divide = Handle.returnPrice(formData.price_divide) || '';
      this.$data.formData = formData;

      this.price_origin_validator = {
        //  date_type
        validate: v => {
          if (!this.formData.price_sale) return true;
          return Number(v) >= this.formData.price_sale;
        },
        getMsg: '原价不能小于销售价'
      };
    },
    methods: {

      changePriceSale(v) {
        if (v && this.$data.formData.price_origin) {
          this.$refs['form']?.validate('原价');
        }
      },

      changeDisplayClass(v) {
        this.$data.formData.display_sec_id = '';
        const class_item = this.$data.displayClassList.find(item => item.id === v);
        if (!class_item) return;

        this.$data.displayClassSecList = [...class_item.childs];
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.p_item.weight = Handle.handleWeight(formData.p_item.weight);
          formData.price_sale = Handle.handlePrice(formData.price_sale);
          formData.price_origin = Handle.handlePrice(formData.price_origin);
          formData.price_divide = Handle.handlePrice(formData.price_divide);
          formData.location_num = Number(formData.location_num);
          formData.stock = Number(formData.stock);
          formData.minimum = Number(formData.minimum);
          formData.maximum = Number(formData.maximum);
          formData.display_class_id = Number(formData.display_class_id);
          formData.rank = Number(formData.rank);
          formData.is_presale = Number(formData.is_presale);
          formData.buyer_id = Number(formData.buyer_id);

          const type = this.$props.type;
          this.$data.loading = true;
          Http.post(type === 'on' ? Api.subitemOnGround : Api.subitemEdit, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `商品${type === 'on' ? '上架' : '修改'}成功` });
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

      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassList = res.data || [];

            if (!this.$data.formData.display_class_id) return;

            const class_item = this.$data.displayClassList.find(item => item.id === this.$data.formData.display_class_id);
            if (!class_item) return;

            this.$data.displayClassSecList = [...class_item.childs];
          });
      },

      commonBuyerList() {
        Http.get(Api.commonBuyerList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.buyerList = res.data || [];
          });
      },
    }
  }
</script>
