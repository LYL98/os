<template>
    <div class="pg-page">
      <div class="p-20">
        <div class="d-flex">
          <pg-select class="mr-20" v-model="query.city_id" placeholder="按县域筛选" searchable clearable @change="changeQuery" :disabled="!query.province_code">
            <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
          </pg-select>
          <pg-select class="mr-20" v-model="query.status" placeholder="按状态筛选" searchable clearable @change="changeQuery">
            <pg-option  value="wait_audit">待审核</pg-option>
            <pg-option  value="pass">审核通过</pg-option>
            <pg-option  value="reject">审核拒绝</pg-option>
          </pg-select>
          <pg-search class="w-25" clearable placeholder="手机号码、姓名" v-model="query.condition" @change="changeQuery"/>
          <pg-button class="mr-10" flat @click="resetQuery">重置筛选条件</pg-button>
        </div>
  
        <div class="card mt-10">
          <div class="card-body">
            <pg-table
              fixed-header
              :data="list.items"
              primary-key="id"
              :page="query.page"
              :page-size="query.page_size"
              borderless
            >
              <pg-column title="手机号码" width="100">
                <template v-slot="{row}">
                  {{ row && row.login_phone || '' }}
                </template>
              </pg-column>
              <pg-column title="姓名" width="80">
                <template v-slot="{row}">
                  {{ row && row.nickname || '-' }}
                </template>
              </pg-column>
              <pg-column title="所在县域" width="100">
                <template v-slot="{row}">
                  {{ row && row.city || '-' }}
                </template>
              </pg-column>
              <pg-column title="群人数" width="70">
                <template v-slot="{row}">
                  {{ row && row.people_num || '-' }}
                </template>
              </pg-column>
              <pg-column title="职业" width="70">
                <template v-slot="{row}">
                  {{ row && row.profession || '-' }}
                </template>
              </pg-column>
              <pg-column prop="created" title="申请时间" width="140"></pg-column>
              <pg-column prop="updated" title="操作时间" width="140"></pg-column>
              <pg-column title="状态" width="80px" text-align="center">
                <template v-slot="{row}">
                  <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                    <span :class="`status-dot mr-5 bg-${Constant.APPLICANT_AUDITING_STATUS('color')[row.status]}`"></span>
                    {{ Constant.APPLICANT_AUDITING_STATUS('enum')[row.status] || row.status || '-' }}
                  </div>
                </template>
              </pg-column>
              <pg-column title="操作" width="140">
               <template v-slot="{row}" >
                 <pg-confirm
                   v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.ClsUserPromoterApplyPass)"
                   help-text="审核通过"
                   @confirm="handlePassItem(row)"
                  >
                   <a class="text-decoration-none mr-10">审核通过</a>
                  </pg-confirm>
                 <pg-confirm
                   v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.ClsUserPromoterApplyReject)"
                   help-text="确认拒绝"
                   @confirm="handleRejectItem(row)"
                  >
                   <a class="text-decoration-none mr-10">审核拒绝</a>
                  </pg-confirm>
               </template>
              </pg-column>
            </pg-table>
          </div>
          <div class="card-footer">
            <pg-pagination :num="list.num" v-model="query" @change="userApplicantQuery"/>
          </div>
        </div>
      </div>
  
    </div>
  
  </template>
  <script>
  
    import { Http, Api, Handle, Constant } from '@/util';

    export default {
      name: 'applicant-list',
      inject: ['app'],
      data() {
        return {
          query: {},
          list: {
            items: [],
          },
          loading: false,
          cityList: [],
        }
      },
  
      created() {
        this.Handle = Handle;
        this.Constant = Constant;
        document.title = '推广者 - 零售中心 - 蒲公英运营管理系统';
        this.initQuery();
        this.userApplicantQuery();
        this.commonCityList();
      },

      watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.$data.query.city_id = '';
          this.changeQuery();
          this.commonCityList()
        }
      }
    },
  
      methods: {
        initQuery() {
          this.$data.query = {
            province_code: this.app.userInfo.province_code,
            city_id: '',
            status: '',
            condition: '',
            page: 1,
            page_size: 20,
          }
        },

        changeQuery() {
          this.$data.query.page = 1;
          this.userApplicantQuery();
        },
  
        resetQuery() {
          this.initQuery();
          this.userApplicantQuery();
        },
  
        userApplicantQuery() {
          Http.get(Api.userApplicantQuery, this.$data.query)
            .then(res => {
              this.$data.list = res.data || { items: [] }
            });
        },
  
        commonCityList() {
          Http.get(Api.commonCityList, { province_code: this.$data.query.province_code })
            .then(res => {
              this.$data.cityList = res.data || [];
            });
        },

        handleRejectItem(item) {
          Http.post(Api.userApplicantReject, { id: item.id })
            .then(() => {
              this.$toast({ type: 'success', message: '已拒绝' });
              this.userApplicantQuery();
            });
        },

        handlePassItem(item) {
          Http.post(Api.userApplicantPass, { id: item.id })
            .then(() => {
              this.$toast({ type: 'success', message: '已通过' });
              this.userApplicantQuery();
          });
        },
    },
  }
  </script>
  
  <style lang="scss" scoped>
    .status-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }
  </style>
  