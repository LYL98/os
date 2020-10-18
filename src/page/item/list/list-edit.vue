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
            <pg-uploader module="item" v-model="formData.video" type="video"/>
          </pg-form-item>
        </div>
        <div class="col-9">
          <pg-form-item label="商品图片" rules="required" item-width="450px" help-text="商品详情页面轮播展示图片，最多可设置5张，推荐尺寸750*750">
            <pg-uploader module="item" v-model="formData.images" multiple/>
          </pg-form-item>
        </div>
      </div>
      <pg-form-item label="商品名称"  item-width="600px">
        <pg-input :value="`${formData.code}/${formData.title}`" placeholder="请输入商品名称"/>
      </pg-form-item>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="规格">
            <pg-input :value="`${formData.item_spec ? formData.item_spec : '-'}`" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="筐" >
            <pg-input v-if="formData.frame_id" :value="`${formData.frame.title} (￥${Handle.returnPrice(formData.frame.price)})`" />
            <pg-input v-else value="-" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="包装规格" >
            <pg-input v-model="formData.package_spec" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="产地" >
            <pg-input v-model="formData.origin_place" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="毛重" >
            <pg-input :value="Handle.returnWeight(formData.gross_weight)" placeholder="毛重" suffix="斤" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="净重" >
            <pg-input :value="Handle.returnWeight(formData.net_weight)" placeholder="净重" suffix="斤" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="保质期" >
            <pg-input v-model="formData.shelf_life"  suffix="天" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="库存期" >
            <pg-input v-model="formData.stock_life" suffix="天" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="科学分类" >
            <pg-input :value="formData.system_class && formData.system_class.title || '-' " placeholder="请输入产地"/>
          </pg-form-item>
        </div>
      </div>
    <!-- 附加信息 -->
        <div class="mb-10 font-weight-bolder">附加信息</div>
        <div class="row no-gutters">
            <div class="mr-20">
              <pg-form-item label="可能存在的瑕疵" item-width="614px" label-width="90px" >
                <pg-input v-model="formData.flaw" placeholder="请输入100位以内的字符" />
              </pg-form-item>
            </div>
        </div>
        <div class="row no-gutters" >
          <div class="col-12">
              <pg-form-item item-width="614px" label="卖点" >
                  <pg-input v-model="formData.selling_points" placeholder="请输入100位以内的字符" />
              </pg-form-item>
          </div>
        </div>

        <div class="row no-gutters">
          <div class="col-6">
              <pg-form-item label="综合等级" >
              <pg-select v-model="formData.grade" :clearable="false" placeholder="选择等级" >
                      <pg-option
                      v-for="item in ['A', 'B', 'C', 'D']"
                      :key="item"
                      :value="item"
                      >{{item}}</pg-option>
                  </pg-select>
              </pg-form-item>
          </div>
          <div class="col-6">
              <pg-form-item label="口感星级" >
              <pg-select v-model="formData.toast" :clearable="false" placeholder="选择口感星级" >
                      <pg-option
                      v-for="item in 5"
                      :key="item"
                      :value="item"
                      >{{item + '星'}}</pg-option>
                  </pg-select>
              </pg-form-item>
          </div>
        </div>
        <div class="row no-gutters">
          <div class="col-6">
              <pg-form-item label="外观星级" >
                  <pg-select v-model="formData.appearance" :clearable="false" placeholder="选择外观星级" >
                      <pg-option
                      v-for="item in 5"
                      :key="item"
                      :value="item"
                      >{{item + '星'}}</pg-option>
                  </pg-select>
              </pg-form-item>
          </div>
          <div class="col-6">
              <pg-form-item label="果型星级" >
                  <pg-select v-model="formData.shape" :clearable="false" placeholder="选择果型星级" >
                      <pg-option
                      v-for="item in 5"
                      :key="item"
                      :value="item"
                      >{{item + '星'}}</pg-option>
                  </pg-select>
              </pg-form-item>
          </div>
        </div>
        <div class="row no-gutters">
          <div class="col-6">
              <pg-form-item label="新鲜星级" >
                  <pg-select v-model="formData.fresh" :clearable="false" placeholder="选择新鲜星级" >
                      <pg-option
                      v-for="item in 5"
                      :key="item"
                      :value="item"
                      >{{item + '星'}}</pg-option>
                  </pg-select>
              </pg-form-item>
          </div>
        </div>

    </pg-form>
<!-- 销售信息 -->
    <pg-form item-width="240px" label-width="90px" ref="form" class="px-20" key="list" :disabled="type === 'detail'">
      <h3 class="p-10">销售信息</h3>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="价格标签" >
            <pg-select style="width: 240px" :disabled="type === 'on_sale' ? false : true" v-model="formData.inner_tag_id" placeholder="请选择商品加价标签">
                <pg-option
                    v-for="item in itemInnerTagsList"
                    :key="item.id"
                    :value="item.id"
                    >
                    {{ item.title }}{{`(加价率: ${Handle.returnPercent(item.rise_min)}% - ${Handle.returnPercent(item.rise_max)}%)`}}
                </pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="采购价" >
                <pg-input disabled :value="Handle.returnPrice(formData.price_buy)" placeholder="采购价" suffix="元" />
          </pg-form-item>
        </div>
        <!-- <pg-form-item label="销售价" :help-text="formData.has_price_fix_plan ? '定时调价生效中，如需修改销售价请进入定时调价' : ''" :rules="{'required': (formData.sale_type === '自营') && (formData.is_standard) , 'decimal:2': (formData.sale_type === '自营') && (formData.is_standard), 'min_value:0.01': (formData.sale_type === '自营') && (formData.is_standard)}">
                <pg-input type="decimal" :disabled="(formData.has_price_fix_plan) || (!formData.is_standard || formData.sale_type === '平台')" v-model="formData.price_sale" placeholder="销售价" suffix="元" />
          </pg-form-item> -->
        <div class="col-6" v-if="formData.is_standard && formData.sale_type === '自营'">
          <pg-form-item label="销售价" :help-text="formData.has_price_fix_plan ? '定时调价生效中，如需修改销售价请进入定时调价' : ''" :rules="{'required': true , 'decimal:2': true, 'min_value:0.01': true}">
                <pg-input type="decimal" :disabled="formData.has_price_fix_plan" v-model="formData.price_sale" placeholder="销售价" suffix="元" />
          </pg-form-item>
        </div>
        <div class="col-6" v-else>
          <pg-form-item label="销售价" :help-text="formData.has_price_fix_plan ? '定时调价生效中，如需修改销售价请进入定时调价' : ''" >
                <pg-input type="decimal" :disabled="true" v-model="formData.price_sale" placeholder="销售价" suffix="元" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <!-- rules="decimal:2|max_value:1000000" -->
          <pg-form-item label="原价"  :rules="{'decimal:2': true, 'max_value:1000000':true,'logic': price_validate}">
            <pg-input type="decimal" v-model="formData.price_origin" placeholder="0 - 1000000" suffix="元" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="排序" >
            <pg-input type="number" v-model="formData.rank"   />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="最小订货数量" rules="min_value:1|max_value:999">
            <pg-input type="number" v-model="formData.min_num_per_order"  placeholder="1 - 999" suffix="件" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="最大订货数量" rules="min_value:1|max_value:999">
                <pg-input type="number" v-model="formData.order_num_max"  placeholder="1 - 999" suffix="件" />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6" v-if="formData.is_standard && formData.sale_type === '自营' && formData.is_presale">
          <pg-form-item label="总库存" :rules="{'required': true }">
            <pg-input :disabled="false" type="number" v-model="formData.item_stock" suffix="件" />
          </pg-form-item>
        </div>
        <div class="col-6" v-else>
          <pg-form-item label="总库存" >
            <pg-input :disabled="true" type="number" v-model="formData.item_stock" suffix="件" />
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="展示分类" :rules="{required: true, logic: ''}"  item-width="">
              <pg-cascader
                :level="2"
                primary-key="id"
                parent-key="parent_id"
                :options="displayClassTree"
                v-model="formData.display_class_id"
                :clearable="false"
                placeholder="请选择展示分类"
                :disabled="type === 'detail' ? true : false"
              />
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6" v-if="!formData.frame_id">
          <pg-form-item label="是否赠品" rules='required'>
            <pg-button-group :disabled="formData.is_quoted" v-model="formData.is_gift" :options="{ '是': true, '否': false }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <div class="col-6">
          <pg-form-item label="采购员" item-width="">
            <pg-select
                    v-model="formData.buyer_id"
                    searchable
                    @search="commonBuyerList"
                    placeholder="采购员"
                     clearable
                    >
                    <pg-option
                        v-for="item in buyerList"
                        :key="item.id"
                        :value="item.id"
                        >
                    {{`${item.realname} ${item.phone ? '('+item.phone+')':''}`}}
                    </pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <!--报价后不可更改是否预售-->
          <pg-form-item label="是否预售" v-if="!formData.is_gift" rules='required'>
            <pg-button-group :disabled="formData.is_quoted" v-model="formData.is_presale" :options="{ '预售': true ,'非预售': false  }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <div class="col-6" v-if="!formData.is_gift && formData.is_presale">

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
      </div>
      <div class="row no-gutters">
        <div class="col-6">
          <pg-form-item label="会员折扣商品" rules='required'>
            <pg-button-group v-model="formData.is_vip_item" :options="{ '是': true, '否': false }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <!-- 标品并且平台 -->
        <div class="col-6" v-if="formData.is_standard && formData.sale_type === '平台'">
          <pg-form-item label="销售类型" rules='required' :help-text="'当日报价后不可切换平台类型'">
           <pg-button-group :disabled="formData.is_quoted" v-model="formData.sale_type" :options="{ '自营': '自营', '平台': '平台' }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <!-- 标品并且自营 -->
        <div class="col-6" v-else-if="formData.is_standard && formData.sale_type === '自营'">
          <pg-form-item label="销售类型" rules='required' :help-text="'自营商品开市后不能修改'">
           <pg-button-group :disabled="isOpen" v-model="formData.sale_type" :options="{ '自营': '自营', '平台': '平台' }">
            </pg-button-group>
          </pg-form-item>
        </div>
        <div class="col-6" v-else>
          <pg-form-item label="销售类型" rules='required'>
           <pg-button-group v-model="formData.sale_type" :options="{ '自营': '自营', '平台': '平台' }">
            </pg-button-group>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-6" v-if="formData.sale_type === '平台'">
          <pg-form-item label="供应商" rules="required">
            <pg-select
                v-model="formData.supplier_id"
                searchable
                @search="commonSupplierList"
                placeholder="供应商"
                @change="changeQuery">
                  <pg-option
                    v-for="item in supplierList"
                    :key="item.id"
                    :value="item.id"
                    >
                    {{item.title}}
                    </pg-option>
            </pg-select>
          </pg-form-item>
        </div>

      </div>
      <div class="row no-gutters">
        <div class="col-12" v-if="formData.sale_type === '平台'">
          <pg-form-item label="赔付范围" item-width="600px" rules="required|max_length:100">
            <pg-input v-model="formData.compensated" placeholder="请输入100位以内的字符"/>
          </pg-form-item>
        </div>
      </div>
      <div class="row no-gutters">
        <div class="col-12" >
          <pg-form-item label="商品专区" item-width="600px" rules="max_length:10">
            <pg-button disabled class="mr-10 mt-3" v-for="(item, index) in formData.relate_tags" size="sm" :key="index">{{ item }}</pg-button>
          </pg-form-item>
        </div>
      </div>
      <!-- 供应商信息 -->
    <div v-if="supplierData.length > 0">
        <h3 class="subtitle">供应商信息</h3>
        <pg-form-item label="" class="ml-40">
          <template v-for="(item, index) in supplierData">
            <!-- v-if="item.province_code === app.userInfo.province_code" -->
              <div :key="index" class="local-pur-item" >
              
                  <p v-for="(s, i) in item.suppliers" :key="i">
                      {{s.supplier.title}}
                      <span v-if="s.is_main" class="main-span">反采供应商</span>
                  </p>
              </div>
          </template>
        </pg-form-item>
    </div>
    <!-- 其他信息 -->
      <h3 class="p-10">其他信息</h3>
      <pg-form-item label="商品详情" item-width="600px">
        <pg-editor v-model="formData.content" disabled/>
      </pg-form-item>
    <!-- 操作记录 -->
    <div v-if="type === 'detail'">
            <h3 class="p-10" v-if="(formData.first_grounder && formData.first_grounder.id) || (formData.last_updater && formData.last_updater.id)">操作记录</h3>
            <div class="row no-gutters" v-if="formData.first_grounder && formData.first_grounder.id">
                <div class="col-6">
                <pg-form-item label="第一次上架人" class="line-height-28">
                    第一次{{ formData.first_grounder && formData.first_grounder.realname || '-' }}
                </pg-form-item>
                </div>
                <div class="col-6">
                <pg-form-item label="上架时间" class="line-height-28">
                    {{ formData.first_grounder && formData.first_grounder.created || '-' }}
                </pg-form-item>
                </div>
            </div>
            <div class="row no-gutters" v-if="formData.last_updater && formData.last_updater.id">
                <div class="col-6">
                <pg-form-item label="最后更新人" class="line-height-28">
                    {{ formData.last_updater && formData.last_updater.realname || '-' }}
                </pg-form-item>
                </div>
                <div class="col-6">
                <pg-form-item label="更新时间" class="line-height-28">
                    {{ formData.last_updater && formData.last_updater.created || '-' }}
                </pg-form-item>
                </div>
            </div>
    </div>


      <div class="row no-gutters" v-if="type !== 'detail'">
        <div class="col-12 text-center">
          <pg-button @click="onCancel">取消</pg-button>
          <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">{{type === 'on_sale' ? '上架':'确定'}}</pg-button>
        </div>
      </div>
      <!-- <div class="row no-gutters" v-if="type !== 'detail'">
        <div class="col-12 text-center">
          <pg-button @click="onCancel">取消</pg-button>
          <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
        </div>
      </div> -->
    </pg-form>

  </div>

</template>

<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'list-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: '' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      let today = new Date();
      //48
      today.setTime(today.getTime() + 24 * 60 * 60 * 1000);
      let tomorrow = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      return {
        tomorrow: tomorrow,

        is_show_info: false,

        formData: {
            images: [],// 商品图片
            is_weigh: true,
            price_origin: '',
            inner_tag_id: '',
            tags: [],
            content: '',
            is_presale: false,
            is_gift: false,
            min_num_per_order: null,
            order_num_max: null,
            display_class: {},
            frame: {},
            system_class: {},
            first_grounder: {},
            last_updater: {},
            relate_tags:[],
            is_vip_item: false,
            sale_type: '自营',
            supplier_id: '',
            code:'',
            title:'',
            compensated:'',
            display_class_ids:[],
            buyer_id: ''
        },
        supplierData: [],

        loading: false,


        displayClassTree: [],
        itemInnerTagsList:[],
        buyerList:[],
        supplierList: [],
        isOpen: false,//是否营业时间

      }
    },
    computed: {
    },
    created() {
      this.Handle = Handle
      
      this.commonDisplayClassTree();
      this.commonItemInnerTagsList();
      this.commonBuyerList();
      this.settingOperationBusiness();
      const formData = { ...this.$props.item };
        formData.sale_type = formData.sale_type || '自营'
        formData.supplier_id = formData.supplier_id || '';
        formData.price_origin = Handle.returnPrice(formData.price_origin) || '';
        formData.price_sale = Handle.returnPrice(formData.price_sale); //销售价
        if (!formData.gross_weight) {
          formData.gross_weight = '';
        }
        //如果是上架
        if(this.$props.type === 'on_sale'){
          formData.price_buy = formData.price_buy || '';
          formData.price_sale = formData.price_sale || '';
          formData.price_origin = formData.price_origin || '';
          formData.item_stock = formData.item_stock || '';
        }
        //处理最小、最大定货数
        if(formData.min_num_per_order === 0) formData.min_num_per_order = '';
        if(formData.order_num_max === 1000) formData.order_num_max = '';
      this.$data.formData = formData;
      this.commonSupplierList();

      this.pItemGetSuppliers();

      this.price_validate = {
        validate: v => {
         return  Handle.handlePrice(v) > Handle.handlePrice(this.$data.formData.price_sale)
        },
        getMsg: '原价必须大于销售价'
      }

    },
    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};

          formData.min_num_per_order = Number(formData.min_num_per_order) || 0;//最小起定数，如果不填 默认0
          formData.order_num_max = Number(formData.order_num_max) || 1000; //最大定货数，如果不填 默认1000
          formData.price_origin = Handle.handlePrice(formData.price_origin);
          formData.rank = Number(formData.rank || 0);
          formData.price_sale = Handle.handlePrice(formData.price_sale);
          formData.item_stock = Number(formData.item_stock) || 0;

          const type = this.$props.type; //有三种 detail modify on_sale
          this.$data.loading = true;
          Http.post(type === 'on_sale' ? Api.itemOnGround : Api.itemEdit, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `商品${type === 'on_sale' ? '上架' : '修改'}成功` });
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
    // //科学分类
    //   commonSystemClassTree() {
    //     Http.get(Api.commonSystemClassTree)
    //       .then(res => {
    //         this.$data.systemClassTree = res.data || [];
    //       });
    //   },
    //展示分类
      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassTree = res.data || [];
          });
      },
      //价格标签
      commonItemInnerTagsList(){
          Http.get(Api.commonItemInnerTagsList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.itemInnerTagsList = res.data || [];
          });
      },
      //采购员
      commonBuyerList(condition=""){
          Http.get(Api.commonBuyerList, {
            province_code: this.app.userInfo.province_code,
            condition: condition,

          }).then(res => {
            this.$data.buyerList = res.data || [];
          });
      },
      //供应商列表
      commonSupplierList(condition=""){
           Http.get(Api.commonSupplierList, {
               province_code:'',
               condition: condition,
               p_item_id: '',
               supplier_type: '',
               bill_term: '',
               is_audited: 1, // 是否审核通过？ 0 否 1 是 null 全部
               is_freeze: 0, // 是否冻结？ 0 否 1 是 null 全部
               custom_type: ''

          }).then(res => {
            this.$data.supplierList = res.data || [];
            let formData = {...this.$data.formData}
            this.$data.supplierList.unshift(formData.supplier)
            let newobj = {}; 
              this.$data.supplierList =this.$data.supplierList.reduce((preVal, curVal) => {
                newobj[curVal.id] ? '' : newobj[curVal.id] = preVal.push(curVal); 
                return preVal 
              }, [])
          });
      },
      //返回商品的供应商
      pItemGetSuppliers(){
           Http.get(Api.pItemGetSuppliers, { c_item_id: this.$data.formData.c_item_id, province_code: this.$data.formData.province_code})
          .then(res => {
            this.$data.supplierData = res.data || [];
          });
      },
      //营业时间
      settingOperationBusiness(){
        Http.get(Api.settingOperationBusiness,{province_code:this.app.userInfo.province_code}).then(res => {
          let rd = res.data
          console.log(rd);
          let date = Handle.returnDateStr()
          date = Handle.returnDateFormat(date,'HH:mm:ss')
          //开市时间
          if(date > rd.order_start_time && date < rd.order_end_time){
            this.$data.isOpen = true
          }else{
            this.$data.isOpen = false
          }
          
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .local-pur-item{
    margin-bottom: 10px;
    >.title{
      margin-bottom: 6px;
      font-weight: bold;
    }
  }
  .main-span{
    background: #ff5252;
    color: #fff;
    padding: 0 3px;
    border-radius: 3px;
    font-size: 12px;
    position: relative;
    top: -1px;
    }
    .line-height-28{
        line-height: 28px;
    }
    .line-height-20{
      line-height: 20px;
    }
</style>
