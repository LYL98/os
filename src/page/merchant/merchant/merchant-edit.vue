<template>
  <pg-form ref="form" label-width="90px" item-width="160px" class="px-10" :disabled="type === 'detail'">

    <template v-if="module === 'merchant' || (module === 'intention' && type === 'audit')">
      <h3>商户信息</h3>
      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="商户名称" rules="required|max_length:10">
            <pg-input v-model="formData.merchant_title" placeholder="请输入商户名称"></pg-input>
          </pg-form-item>
        </div>

        <div class="col-4">
          <pg-form-item label="协议商户" rules="required">
            <pg-radio-group inline border v-model="formData.is_post_pay">
              <pg-radio :value="true">是</pg-radio>
              <pg-radio :value="false">否</pg-radio>
            </pg-radio-group>
          </pg-form-item>
        </div>

        <div class="col-4" v-if="formData.is_post_pay === true">
          <pg-form-item label="授信额度" rules="required|min_value:0.01:blur|max_value:1000000">
            <pg-input type="decimal" suffix="元" v-model="formData.credit_limit" placeholder="请输入授信额度"></pg-input>
          </pg-form-item>
        </div>
      </div>

      <h3>用户信息</h3>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="上传头像" class="pb-10">
            <pg-uploader module="merchant" v-model="formData.avatar"></pg-uploader>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="登录手机" rules="required|phone:blur">
            <pg-input type="phone" v-model="formData.login_phone" placeholder="请输入登录手机"></pg-input>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="姓名" rules="required|max_length:10">
            <pg-input v-model="formData.realname" placeholder="请输入姓名"></pg-input>
          </pg-form-item>
        </div>
      </div>

    </template>

    <template>
      <h3>门店信息</h3>
      <div class="row no-gutters" v-if="module === 'store' && type !== 'add'">
        <div class="col-4">
          <pg-form-item label="会员等级" class="pb-10"><span class="form-item-label">{{ formData.vip_title || '无' }}</span></pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="黑名单" class="pb-10"><span class="form-item-label">{{ formData.is_black ? '是' : '否' }}</span></pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4" v-if="module === 'merchant' || module === 'store' || (module === 'intention' && type === 'audit')">
          <pg-form-item label="满天星门店" rules="required">
            <pg-radio-group inline border v-model="formData.gb_included">
              <pg-radio :value="true">是</pg-radio>
              <pg-radio :value="false">否</pg-radio>
            </pg-radio-group>
          </pg-form-item>
        </div>
        <div class="col-8">
          <pg-form-item label="门店图片" rules="required">
            <pg-uploader module="merchant" multiple :limit="6" v-model="formData.images"></pg-uploader>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item key="store_title" label="门店名称" rules="required|max_length:10" v-if="module !== 'store'">
            <pg-input v-model="formData.store_title" placeholder="请输入门店名称"></pg-input>
          </pg-form-item>
          <pg-form-item key="title" label="门店名称" rules="required|max_length:10" v-if="module === 'store'">
            <pg-input v-model="formData.title" placeholder="请输入门店名称"></pg-input>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="区域" rules="required">
            <pg-select
              :disabled="module === 'store' && type === 'modify'"
              v-model="formData.province_code"
              placeholder="选择区域"
            >
              <pg-option
                v-for="item in provinceListAuth"
                :key="item.code"
                :value="item.code"
                @click="changeProvince(item)"
              >{{ item.title }}</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="县域" rules="required">
            <pg-select
              :disabled="(module === 'store' && type === 'modify') || formData.province_code === ''"
              searchable
              v-model="formData.city_id"
              placeholder="选择县域"
              @change="changeCity"
            >
              <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item key="store_csm_id" label="客户经理" v-if="module !== 'store'">
            <pg-select
              :disabled="!formData.city_id"
              v-model="formData.store_csm_id"
              searchable
              placeholder="请选择门店客户经理"
            >
              <pg-option v-for="item in salesmanList" :key="item.id" :value="item.id">{{ item.realname }}({{ item.phone }})</pg-option>
            </pg-select>
          </pg-form-item>
          <pg-form-item key="csm_id" label="客户经理" v-if="module === 'store'">
            <pg-select
              :disabled="!formData.city_id"
              v-model="formData.csm_id"
              searchable
              placeholder="请选择门店客户经理"
            >
              <pg-option v-for="item in salesmanList" :key="item.id" :value="item.id">{{ item.realname }}({{ item.phone }})</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-8">
          <pg-form-item label="地理位置" :rules="{ required: true, logic: geo_validator }" item-width="440px">
            <pg-location :disabled="type === 'detail'" level="province" v-model="formData.geo"></pg-location>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-12">
          <pg-form-item label="收货地址" rules="required|max_length:30" item-width="720px">
            <pg-input v-model="formData.address" placeholder="请输入收货地址" />
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="收货人" :rules="{ required: module === 'merchant' || module === 'store' || (module === 'intention' && type === 'audit'), 'max_length:10': true }">
            <pg-input v-model="formData.linkman" placeholder="请输入收货人" />
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item
            key="store_phone"
            v-if="module !== 'store'"
            label="联系方式"
            :rules="{ required: module === 'merchant' || module === 'store' || (module === 'intention' && type === 'audit'), 'phone:blur': true }"
          >
            <pg-input v-model="formData.store_phone" placeholder="请输入联系方式" />
          </pg-form-item>
          <pg-form-item
            key="phone"
            v-if="module === 'store'"
            label="联系方式"
            rules="required|phone:blur"
          >
            <pg-input v-model="formData.phone" placeholder="请输入联系方式" />
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters" v-if="module === 'store'">
        <div class="col-12">
          <pg-form-item label="指定子账号" item-width="720px" :help-text="memberList.length <= 0 ? '无子账号信息，请到用户管理新增' : ''">
            <pg-transfer v-model="formData.member_ids" :data="memberList"></pg-transfer>
          </pg-form-item>
        </div>
      </div>
    </template>

    <template>
      <h3>其他信息</h3>
      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="门店类型">
            <pg-select v-model="formData.store_type" placeholder="请选择门店类型">
              <pg-option value="boutique_fruit_shop">精品水果店</pg-option>
              <pg-option value="business_super_system">商超系统</pg-option>
              <pg-option value="convenience_system">便利系统</pg-option>
              <pg-option value="volkswagen_fruit_shop">大众水果店</pg-option>
              <pg-option value="not_fresh_shop">非生鲜门店</pg-option>
              <pg-option value="microboss">微商</pg-option>
              <pg-option value="inner_test_account">员工内部账号</pg-option>
              <pg-option value="other">其他</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="经营面积">
            <pg-select v-model="formData.business_ares" placeholder="请选择经营面积">
              <pg-option value="<50平米">&lt; 50平米</pg-option>
              <pg-option value="50-100平米">50-100平米</pg-option>
              <pg-option value=">100平米">>100平米</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="经营年限">
            <pg-select v-model="formData.business_years" placeholder="请选择经营年限">
              <pg-option value="<1年">&lt; 1年</pg-option>
              <pg-option value="1-2年">1-2年</pg-option>
              <pg-option value="3-5年">3-5年</pg-option>
              <pg-option value="5年以上">5年以上</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="一体化收银机">
            <pg-radio-group inline border v-model="formData.is_pos">
              <pg-radio :value="true">是</pg-radio>
              <pg-radio :value="false">否</pg-radio>
            </pg-radio-group>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="KP性别">
            <pg-radio-group inline border v-model="formData.kp_gender">
              <pg-radio :value="0">男</pg-radio>
              <pg-radio :value="1">女</pg-radio>
            </pg-radio-group>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="KP年龄">
            <pg-select v-model="formData.kp_age" placeholder="请选择KP年龄">
              <pg-option value="70前">70前</pg-option>
              <pg-option value="70后">70后</pg-option>
              <pg-option value="80后">80后</pg-option>
              <pg-option value="90后">90后</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="线上销售工具">
            <pg-select v-model="formData.online_sale_tool" placeholder="请选择线上销售工具">
              <pg-option value="">未做线上销售</pg-option>
              <pg-option value="wechat_group_friends">朋友圈+微信群</pg-option>
              <pg-option value="takeaway">外卖平台</pg-option>
              <pg-option value="group_pur">社区团购</pg-option>
              <pg-option value="other">其他电商平台</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="其他采购渠道">
            <pg-select v-model="formData.pur_channels" placeholder="请选择其他采购渠道">
              <pg-option value="inter_service_provider">互联网服务商</pg-option>
              <pg-option value="county_wholesalers">县级批发商</pg-option>
              <pg-option value="city_wholesalers">市级批发市场</pg-option>
              <pg-option value="province_wholesalers">省级批发市场</pg-option>
              <pg-option value="host_distribution">连锁店总部统一配送</pg-option>
              <pg-option value="other">其他</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>

      <div class="row no-gutters">


      </div>

      <div class="row no-gutters">
        <div class="col-4">
          <pg-form-item label="月营业额">
            <pg-select v-model="formData.monthly_turnover" placeholder="请选择月营业额">
              <pg-option value="<3万">&lt; 3万</pg-option>
              <pg-option value="3-6万">3-6万</pg-option>
              <pg-option value="6-9万">6-9万</pg-option>
              <pg-option value="9-12万">9-12万</pg-option>
              <pg-option value="12-15万">12-15万</pg-option>
              <pg-option value="12-15万">12-15万</pg-option>
              <pg-option value="15-18万">15-18万</pg-option>
              <pg-option value="18-21万">18-21万</pg-option>
              <pg-option value="21-24万">21-24万</pg-option>
              <pg-option value="24-27万">24-27万</pg-option>
              <pg-option value="27-30万">27-30万</pg-option>
              <pg-option value="30-40万">30-40万</pg-option>
              <pg-option value="40-50万">40-50万</pg-option>
              <pg-option value="50-60万">50-60万</pg-option>
              <pg-option value=">60万">&gt; 60万</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
        <div class="col-4">
          <pg-form-item label="营业状态">
            <pg-select v-model="formData.business_status" placeholder="请选择营业状态">
              <pg-option value="business">营业中</pg-option>
              <pg-option value="closed">已关闭</pg-option>
              <pg-option value="need_to_freeze">因客户恶意情况需要冻结</pg-option>
            </pg-select>
          </pg-form-item>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <pg-form-item label="经营品类" item-width="720px">
            <pg-checkbox-group v-model="formData.business_category" class="d-flex flex-wrap">
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="零食坚果">零食坚果</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="酒水饮料">酒水饮料</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="奶制品">奶制品</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="蔬菜">蔬菜</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="鲜肉">鲜肉</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="冻品">冻品</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="米面粮油">米面粮油</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="干货调料">干货调料</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="鸡蛋">鸡蛋</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="小百货">小百货</pg-checkbox>
              <pg-checkbox style="min-width: 80px;" class="mr-10 mt-0" value="水果">水果</pg-checkbox>
            </pg-checkbox-group>
          </pg-form-item>
        </div>
      </div>

    </template>

    <div class="row no-gutters" v-if="type === 'detail'">
      <div class="col-5">
        <pg-form-item label="创建人"><span class="form-item-label">{{ formData.creator && formData.creator.realname || '-' }}</span></pg-form-item>
      </div>
      <div class="col-5">
        <pg-form-item label="创建时间"><span class="form-item-label">{{ formData.created }}</span></pg-form-item>
      </div>
    </div>

    <div class="text-center" v-if="type !== 'detail'">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle } from '@/util';

export default {
  name: 'merchant-edit',
  inject: ['app'],
  props: {
    module: { type: String, default: 'merchant' }, // 调用该表单的模块： merchant | intention | store
    type: {type: String, default: ''}, // 调用类型： add ｜ modify ｜ audit | detail
    item: {type: Object, default: () => ({})},
    merchant_id: { type: Number, default: 0 }, // 当门店编辑时，需要指定merchant_id
  },
  data() {
    return {
      loading: false,
      formData: {
        merchant_id: 0, // 在store 编辑模式下需要用到的字段

        // 商户字段 ，在 新增商户 和 激活潜在客户时 ，需要存在
        merchant_title: '',
        is_post_pay: false,
        credit_limit: 10000,

        // 门店字段
        vip_title: '',
        is_black: false,
        gb_included: false, // 是否满天星门店
        images: [], // 图片
        store_title: '', // 门店名称 在编辑 商户的表单中
        title: '', // 门店名称 在编辑门店的表单中
        store_csm_id: '', // 客户经理 在编辑商户的表单中
        csm_id: '', // 客户经理，在编辑门店的表单中
        province_code: '',
        city_id: '',
        geo: { lng: '', lat: '', province_title: '', city_title: '', poi: '' },
        address: '',
        linkman: '',
        store_phone: '', // 门店联系电话 在编辑 商户的表单中
        phone: '', // 门店联系电话 在编辑 门店的表单中
        member_ids: [], //子账号id Array<number>
        store_type: '', // 门店类型
        business_ares: '', // 经营面积
        kp_gender: 0, // KP性别
        kp_age: '', // KP年龄
        pur_channels: '', // 采购渠道
        business_years: '', // 经营年限
        is_pos: true, // 是否一体化POS机
        online_sale_tool: '', // 线上销售工具
        monthly_turnover: '', // 月营业额
        business_status: '', // 经营状态
        business_category: [], // 经营品类

        avatar: '',
        login_phone: '',
        realname: '',
        creator: {}
      },

      salesmanList: [],
      memberList: [], //子账号 Array<object>

      provinceListAuth: [],
      cityList: [],

    }
  },
  created() {

    this.commonProvinceListAuth();
    let { module, type, item } = this.$props;
    const formData = { ...item };

    // 如果是编辑 或 详情模式下
    if (['modify', 'detail', 'audit'].includes(type)) {

      // 兼容历史数据，没有客户经理 和 地理位置的情况
      if (!formData.geo || Object.keys(formData.geo).length < 5) {
        formData.geo = {lng: '', lat: '', province_title: '', city_title: '', poi: ''};
      }

      if (!formData.geo.province_title) {
        const province = formData.province;
        if (province && province.title) {
          formData.geo.province_title = province.title;
        }
      }

      formData.csm_id = formData.csm_id || '';
      formData.store_csm_id = formData.store_csm_id || '';

      this.$data.formData = Object.assign(this.$data.formData, formData);

      this.commonCityList();
      this.commonOperatorList();

    }

    if (module === 'store') {
      this.$data.formData.merchant_id = this.$props.merchant_id;
      this.commonMemberList();
    }

    this.geo_validator = {
      validate: geo => {
        return geo && geo.lng && geo.lat;
      },
      getMsg: '地理位置不能为空'
    }
  },

  methods: {
    //选择区域
    changeProvince(province) {
      this.$data.formData.geo = { lng: '', lat: '', province_title: province.title, city_title: '', poi: '' }

      this.$data.formData.city_id = '';
      this.$data.formData.store_csm_id = '';
      this.$data.formData.csm_id = '';

      this.$data.salesmanList = [];

      this.commonCityList();
    },
    //选择县域
    changeCity() {

      this.$data.formData.store_csm_id = '';
      this.$data.formData.csm_id = '';

      this.$data.salesmanList = [];
      this.commonOperatorList();

    },


    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        switch (this.$props.module) {
          case 'merchant':
            this.merchantEdit();
            break;
          case 'store':
            this.storeEdit();
            break;
          case 'intention':
            this.intentionEdit();
            break;
        }

      });
    },

    intentionEdit() {

      let formData = {...this.$data.formData};
      formData.store_csm_id = Number(formData.store_csm_id);

      let API = 'intentionMerchantAdd';
      let MSG = '意向客户创建成功';
      if (this.$props.type === 'modify') {
        API = 'intentionMerchantEdit';
        MSG = '意向客户修改成功'
      }
      if (this.$props.type === 'audit') {
        API = 'intentionMerchantAudit';
        MSG = '意向客户激活成功'
      }

      this.$data.loading = true;
      Http.post(Api[API], formData)
        .then(() => {
          this.$toast({message: MSG, type: 'success'});
          this.$emit('submit');
          this.$data.loading = false;
        })
        .catch(() => {
          this.$data.loading = false;
        });

    },


    merchantEdit() {

      let formData = {...this.$data.formData};
      formData.store_csm_id = Number(formData.store_csm_id);
      formData.credit_limit =  formData.is_post_pay ? Handle.handlePrice(formData.credit_limit) : 0;

      this.$data.loading = true;
      Http.post(Api.merchantAdd, formData)
        .then(() => {
          this.$toast({message: '商户创建成功', type: 'success'});
          this.$emit('submit');
          this.$data.loading = false;
        })
        .catch(() => {
          this.$data.loading = false;
        });

    },

    storeEdit() {
      let formData = {...this.$data.formData};
      formData.csm_id = Number(formData.csm_id);

      this.$data.loading = true;
      Http.post(Api[this.$props.type === 'add' ? 'storeAdd' : 'storeEdit'], formData)
        .then(() => {
          this.$toast({message: `${this.$props.type === 'add' ? '门店创建' : '门店编辑'}成功`, type: 'success'});
          this.$emit('submit');
          this.$data.loading = false;
        })
        .catch(() => {
          this.$data.loading = false;
        });

    },

    onCancel() {
      this.$emit('cancel');
    },

    commonMemberList() {
      Http.get(Api.memberList, {
        merchant_id: this.$data.formData.merchant_id,
        is_main: 0,
        need_num: 30
      }).then(res => {
        this.$data.memberList = (res.data || []).map(item => ({
          label: item.realname + `(${item.phone})`,
          value: item.id
        }));
      });
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth)
        .then(res => {
          this.$data.provinceListAuth = res.data || [];
        });
    },

    commonCityList() {
      Http.get(Api.commonCityList, {province_code: this.$data.formData.province_code})
        .then(res => {
          this.$data.cityList = res.data || [];
        });
    },

    commonOperatorList() {
      Http.get(Api.commonOperatorList, {post: 'salesman', city_id: this.$data.formData.city_id})
        .then(res => {
          this.$data.salesmanList = res.data || [];
        });
    },
  }
}
</script>

<style scoped>
</style>
