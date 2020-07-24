<template>
  <pg-form ref="form" item-width="180px">

    <div class="row no-gutters">
      <div class="col-4">
        <pg-form-item label="工号">
          <pg-input v-model="formData.employee_no" :maxlength="10" placeholder="请输入工号"></pg-input>
        </pg-form-item>
      </div>
      <div class="col-4">
        <pg-form-item label="上传头像">
          <pg-uploader v-model="formData.avatar"></pg-uploader>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-4">
        <pg-form-item label="姓名" rules="required">
          <pg-input v-model="formData.realname" :maxlength="10" placeholder="请输入运营人员姓名"></pg-input>
        </pg-form-item>
      </div>
      <div class="col-4">
        <pg-form-item label="手机号" rules="required|phone">
          <pg-input v-model="formData.phone" type="phone" :maxlength="11" placeholder="请输入登录手机号"></pg-input>
        </pg-form-item>
      </div>
      <div class="col-4" v-if="type === 'add'">
        <pg-form-item label="密码" rules="required">
          <pg-input v-model="formData.password" type="password" placeholder="请输入登录密码"></pg-input>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <!--
          1、如果是登录人员为总部：
              可以选择操作 运营人员类型 和 选择所有区域
          2、如果登录人员为区域：
              不允许编辑权限级别，
              在新增或编辑时，只能选择本人所在的区域（此处不做禁用，是需要兼容部分老数据中 区域运营人员没有区域code的情况）
        -->
      <div class="col-4" v-if="app.userInfo.opt_type === 'global'">
        <pg-form-item label="权限级别" rules="required">
          <pg-button-group :options="{ '总部': 'global', '区域': 'local' }" v-model="formData.opt_type"
                           @change="handleChangeOptType"/>
        </pg-form-item>
      </div>
      <div class="col-4" v-if="formData.opt_type === 'local'">
        <pg-form-item label="区域" rules="required">
          <pg-select v-model="formData.province_code" :clearable="false" placeholder="请选择区域" @change="changeProvince">
            <pg-option v-for="item in provinceList" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
          </pg-select>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-12">
        <pg-form-item label="职务" rules="required" item-width="460px">
          <pg-button-group auto-grow :options="OPERATOR_POST_OPTIONS" v-model="formData.post" @change="handleChangePost"></pg-button-group>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-12">
        <pg-form-item label="角色" rules="required" item-width="600px">
          <pg-transfer :data="roles" v-model="formData.role_ids" placeholder="角色列表"></pg-transfer>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">

      <div class="col-8">
        <pg-form-item
            label="数据权限"
            rules="required"
            v-if="formData.opt_type === 'local' && formData.province_code && ['salesman', 'other'].includes(formData.post)"
        >
          <pg-button-group auto-grow v-model="formData.data_level" @change="handleChangeDataLevel">
            <pg-button value="2" v-if="formData.post === 'other'">区域</pg-button>
            <pg-button value="3">片区</pg-button>
            <pg-button value="4">县域</pg-button>
          </pg-button-group>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item
            item-width="600px"
            key="zone"
            label="片区"
            rules="required"
            v-if="formData.opt_type === 'local' && formData.province_code && formData.data_level === '3'"
        >
          <pg-transfer :data="zoneList" v-model="formData.data_value" placeholder="片区列表"/>
        </pg-form-item>
        <pg-form-item
            item-width="600px"
            key="city"
            label="县域"
            rules="required"
            v-if="formData.opt_type === 'local' && formData.province_code && formData.data_level === '4'"
        >
          <pg-transfer :data="cityList" v-model="formData.data_value" placeholder="县域列表"/>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">

      <div class="col-6">
        <pg-form-item label="备注" item-width="600px">
          <pg-textarea v-model="formData.remark" :maxlength="200" placeholder="请输入备注..."></pg-textarea>
        </pg-form-item>
      </div>
    </div>

    <div class="row py-10">
      <div class="col-12 text-center">
        <pg-button @click="cancel">取消</pg-button>
        <pg-button color="primary" :loading="loading" class="ml-20" @click="submit">确认</pg-button>
      </div>
    </div>
  </pg-form>
</template>

<script>
  import md5 from 'md5';
  import {Http, Config, Constant} from '@/util';
  import PgTextarea from "../../component/textarea/textarea";

  export default {
    name: 'operator-edit',
    components: {PgTextarea},
    inject: ['app'],
    props: {
      type: {type: String, default: 'add'},
      item: {
        type: Object, default() {
          return {};
        }
      },
    },
    data() {
      return {
        formData: {
          opt_type: this.app.userInfo.opt_type || 'global', // global | local，根据当前登录人员来判断
          province_code: this.app.userInfo.opt_type === 'local' ? this.app.userInfo.province_code : '', // 区域
          realname: '', // 姓名
          employee_no: '', // 工号
          phone: '', // 手机号
          password: '', // 密码
          avatar: '', // 头像
          post: 'buyer', // 职务 buyer(商品) salesman(业务) supply(供应链) service(客服) other(其他)
          role_ids: [],
          data_level: '1', // 数据权限 1:总部 2:区域 3:片区 4:县域
          data_value: [], //  数据权限范围 1:空白 2:province_codes 3:zone_ids 4:city_ids
          remark: '',
        },
        loading: false,

        roleList: [],
        provinceList: [],
        zoneList: [],
        cityList: [],
      };
    },
    computed: {
      roles() {
        return this.$data.roleList.filter(item => item.role_type === this.formData.opt_type);
      },
    },

    created() {

      if (this.$props.type === 'modify') {
        this.$data.formData = {...this.$props.item};
        if (this.$data.formData.opt_type === 'local') {
          this.commonZoneList();
          this.commonCityList();
        }
      } else {
        if (this.app.userInfo.opt_type === 'local') {
          this.commonZoneList();
          this.commonCityList();
        }
      }

      this.OPERATOR_POST_OPTIONS = Constant.OPERATOR_POST('options');

      this.commonProvinceListAuth();
      this.commonRoleList();
    },

    methods: {

      // 改变权限级别
      handleChangeOptType(opt_type) {
        switch (opt_type) {
          case 'global':
            this.$data.formData.province_code = '';
            this.$data.formData.data_level = '1'; // 数据权限 1:总部 2:区域 3:片区 4:县域
            this.$data.formData.data_value = [];
            this.$data.formData.role_ids = [];
            break;
          case 'local':
            this.$data.formData.role_ids = [];
            this.$data.formData.data_level = '2'; // 数据权限 1:总部 2:区域 3:片区 4:县域

            this.handleChangePost(this.$data.formData.post);
            break;
        }
      },

      // 改变省份
      changeProvince() {
        this.handleChangePost(this.$data.formData.post);
        this.commonZoneList();
        this.commonCityList();
      },

      // 改变职务
      handleChangePost(post) {
        if (!this.$data.formData.province_code) return;
        switch (post) {
          case 'buyer':
            this.$data.formData.data_level = '2';
            this.$data.formData.data_value = [this.$data.formData.province_code];
            break;
          case 'salesman':
            this.$data.formData.data_level = '3';
            this.$data.formData.data_value = [];
            break;
          case 'supply':
            this.$data.formData.data_level = '2';
            this.$data.formData.data_value = [this.$data.formData.province_code];
            break;
          case 'other':
            this.$data.formData.data_level = '2';
            this.$data.formData.data_value = [this.$data.formData.province_code];
            break;
          case 'service':
            this.$data.formData.data_level = '2';
            this.$data.formData.data_value = [this.$data.formData.province_code];
            break;
        }
      },

      // 改变数据权限
      handleChangeDataLevel(level) {
        if (level === '2') {
          this.$data.formData.data_value = [this.$data.formData.province_code];
          return;
        }
        this.$data.formData.data_value = [];
      },


      // 获取所有区域
      commonProvinceListAuth() {
        Http.get(Config.api.commonProvinceListAuth).then((res) => {
          this.$data.provinceList = (res.data || []).map(item => ({
            label: item.title,
            value: item.code
          }));
        });
      },
      // 获取所有区域
      commonZoneList() {
        Http.get(Config.api.commonZoneList, {province_code: this.$data.formData.province_code}).then((res) => {
          this.$data.zoneList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        });
      },
      // 获取所有区域
      commonCityList() {
        Http.get(Config.api.commonCityList, {province_code: this.$data.formData.province_code}).then((res) => {
          this.$data.cityList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        });
      },
      // 获取角色列表
      commonRoleList() {
        Http.get(Config.api.roleList)
          .then(res => {
            this.$data.roleList = (res.data || []).map(item => ({
              label: item.title,
              value: item.id,
              role_type: item.role_type
            }));
          });
      },

      submit() {
        this.$refs['form']?.validateAll().then((valid) => {
          console.log('valid', valid);
          
          if (!valid) return;
          this.$data.loading = true;
          let data = {...this.$data.formData};
          this.$props.type === 'add' && (data.password = md5(data.password));
          const API = this.$props.type === 'add' ? Config.api.operatorAdd : Config.api.operatorEdit;
          Http.post(API, data)
            .then(() => {
              this.$toast({
                type: 'success',
                message: `运营人员${this.$props.type === 'add' ? '新增' : '修改'}成功`,
              });
              this.$data.loading = false;
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });
        });
      },

      cancel() {
        this.$emit('cancel');
      },
    },
  };
</script>

<style scoped></style>
