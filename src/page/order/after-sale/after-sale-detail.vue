<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">基础信息</h4>
    <div class="row">
      <div class="col-4">申请时间：{{ item.created }}</div>
      <div class="col-4">售后单号：{{ item.code }}</div>
    </div>
    <div class="row">
      <div class="col-4">商户等级：{{ item.merchant_grade_code || '无' }}</div>
      <div class="col-4">会员等级：{{ item.vip_title || '-' }}</div>
      <div class="col-4">
        商户过去7天退赔率：{{
          item.aftersale_rate === null ? '-' : item.aftersale_rate / 10 + '%'
        }}
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        该商品（同发货日期）所有客户提报次数/销售人次：{{
          item.merchant_as_same_item
        }}
        次 / {{ item.distinct_merchant }} 人次
      </div>
    </div>

    <h4 class="mt-20">处理结果</h4>
    <div v-if="item.status === 'close'">
      <!--仅退款-->
      <div v-if="item.handle_way === 'only_refund'">
        <div class="row">
          <div class="col-4">
            处理类型：{{ Constant.AFTER_SALE_OPT_TYPE('enum')[item.opt_type] }}
          </div>
          <div class="col-4">
            处理方式：仅退款
            <span
              style="margin-left: 10px"
              v-if="
                item.saleback.code &&
                (app.auth.isAdmin || app.auth.OrderSaleBackDetail)
              "
            >
              （退货单号：
              <a
                href="javascript:void(0);"
                style="text-decoration: underline"
                @click="orderShowHideDetailReturnGoods(item.saleback.id)"
                >{{ item.saleback.code }}</a
              >）
            </span>
          </div>
          <div class="col-4">
            处理件数：{{ item.num ? item.num + '件' : '-' }}
          </div>
        </div>
        <div class="row">
          <div class="col-4">
            退款金额：<span class="text-danger">{{
              JSON.stringify(item.saleback) == '{}'
                ? `¥${Handle.returnPrice(item.refund_amount)}`
                : `¥${Handle.returnPrice(item.saleback.refund_amount)}`
            }}</span>
          </div>
          <div class="col-4">处理描述：{{ item.opt_detail || '无' }}</div>
        </div>
      </div>

      <!--仅退货-->
      <div v-else-if="item.handle_way === 'only_goods'">
        <div class="row">
          <div class="col-4">
            处理类型：{{ Constant.AFTER_SALE_OPT_TYPE('enum')[item.opt_type] }}
          </div>
          <div class="col-4">
            处理方式：仅退货
            <span
              v-if="
                item.saleback.code &&
                (app.auth.isAdmin || app.auth.OrderSaleBackDetail)
              "
            >
              （退货单号：
              <a
                href="javascript:void(0);"
                style="text-decoration: underline"
                @click="orderShowHideDetailReturnGoods(item.saleback.id)"
                >{{ item.saleback.code }}</a
              >）
            </span>
          </div>
          <div class="col-4">
            退货件数：{{ item.num ? item.num + '件' : '-' }}
          </div>
        </div>
        <div class="row">
          <div class="col-4">处理描述：{{ item.opt_detail || '无' }}</div>
        </div>
      </div>
      <!--退货退款-->
      <div v-else-if="item.handle_way === 'refund_goods'">
        <div class="row">
          <div class="col-4">
            处理类型：{{ Constant.AFTER_SALE_OPT_TYPE('enum')[item.opt_type] }}
          </div>
          <div class="col-4">
            处理方式：退货退款
            <span
              v-if="
                item.saleback.code &&
                (app.auth.isAdmin || app.auth.OrderSaleBackDetail)
              "
            >
              （退货单号：
              <a
                href="javascript:void(0);"
                style="text-decoration: underline"
                @click="orderShowHideDetailReturnGoods(item.saleback.id)"
                >{{ item.saleback.code }}</a
              >）
            </span>
          </div>
          <div class="col-4">
            退货件数：{{ item.num ? item.num + '件' : '-' }}
          </div>
          <div class="col-4">
            退货金额：<span class="text-danger">{{
              JSON.stringify(item.saleback) == '{}'
                ? `¥${Handle.returnPrice(item.refund_amount)}`
                : `¥${Handle.returnPrice(item.saleback.refund_amount)}`
            }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-4">处理描述：{{ item.opt_detail || '无' }}</div>
        </div>
      </div>
      <!--其它-->
      <div v-else>
        <div class="row">
          <div class="col-4">
            处理类型：{{ Constant.AFTER_SALE_OPT_TYPE('enum')[item.opt_type] }}
          </div>
          <div class="col-4">
            处理方式：其它
            <span
              v-if="
                item.saleback.code &&
                (app.auth.isAdmin || app.auth.OrderSaleBackDetail)
              "
            >
              （退货单号：
              <a
                href="javascript:void(0);"
                style="text-decoration: underline"
                @click="orderShowHideDetailReturnGoods(item.saleback.id)"
                >{{ item.saleback.code }}</a
              >）
            </span>
          </div>
          <div class="col-4">
            处理件数：{{ item.num ? item.num + '件' : '-' }}
          </div>
        </div>
        <div class="row">
          <div class="col-4">处理描述：{{ item.opt_detail || '无' }}</div>
        </div>
      </div>
    </div>
    <p class="text-secondary" v-if="item.status !== 'close'">
      售后单正在处理中......
    </p>

    <!--二次处理结果-->
    <h4 class="mt-20" v-if="item.handle_second_time">二次处理结果</h4>
    <div class="row" v-if="item.handle_second_time">
      <div class="col-4">
        退款金额：<span class="text-danger" v-if="!!item.handle_second_refund_amount"
          >&yen;{{ Handle.returnPrice(item.handle_second_refund_amount) }}</span
        >
        <span v-else>-</span>
      </div>
      <div class="col-4">
        处理描述：<span style="word-break: break-word">{{
          item.handle_second_remark || '无'
        }}</span>
      </div>
    </div>

    <h4 class="mt-20">售后商品</h4>
    <pg-table
      :data="items"
      primary-key="item_code"
      :highlight-row="false"
      borderless
      placeholder="商品信息为空..."
    >
      <pg-column title="商品图" width="70">
        <template v-slot="{ row }">
          <img
            class="cursor-pointer"
            :src="cos_tenctent_path + row.item_image"
            width="48"
            height="48"
            v-preview="row.item_image"
          />
        </template>
      </pg-column>
      <pg-column title="商品编号/名称" width="100">
        <template v-slot="{ row }">
          <div class="text-wrap">
            <a class="text-dark" @click="showItemDetail(row)">{{ row.item_code }} / {{ row.item_title }}</a>
          </div>
        </template>
      </pg-column>
      <pg-column title="商品参数" width="110px">
        <template v-slot="{ row }">
          <div class="text-wrap">
            <span v-for="(item, index) in row.item_attrs" :key="index">
              {{ item }}
              <span v-if="index < row.item_attrs.length - 1">、</span>
            </span>
          </div>
        </template>
      </pg-column>
      <pg-column title="筐" width="80px" text-align="center">
        <template v-slot="{ row }">
          <span v-if="!!row.frame_price"
            >¥{{ Handle.returnPrice(row.frame_price) }}</span
          >
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="单价" width="80px" text-align="center">
        <template v-slot="{ row }">
          <span v-if="!!row.item_price_sale"
            >¥{{ Handle.returnPrice(row.item_price_sale) }}/件</span
          >
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="件数" width="80px" text-align="center">
        <template v-slot="{ row }">
          <div class="count-weight list-unstyled">
            <!-- <div> -->
            <span>{{ row.count_pre }}件</span>
            <!-- </div> -->
            <template v-if="row.count_real !== row.count_pre">
              <!-- <div class="line"></div> -->
              <span>&nbsp;->&nbsp;</span>
              <span
                v-if="
                  row.count_real !== row.count_pre ||
                  row.weight_real !== row.weight_pre
                "
              >
                <!-- <span :class="row.count_real > row.count_pre ? 'red' : 'green'" -->
                {{ row.count_real }}件
                <!-- </span
                > -->
              </span>
            </template>
          </div>
        </template>
      </pg-column>

      <pg-column title="小计" width="140px" text-align="center">
        <template v-slot="{ row }">
          <div class="count-weight">
            <span>&yen;{{ Handle.returnPrice(row.amount_pre) }}</span>
            <span v-if="row.amount_real !== row.amount_pre"
              >&nbsp;->&nbsp;</span
            >
            <span v-if="row.amount_real !== row.amount_pre"
              >&yen;{{ Handle.returnPrice(row.amount_real) }}</span
            >
          </div>
        </template>
      </pg-column>

      <pg-column title="操作" width="80px" text-align="center">
        <template v-slot="{ row }">
          <a
            @click="orderShowHideDetail(row.order_id)"
            v-if="
              (app.auth.isAdmin || app.auth.OrderDetail) &&
              item.ori_com !== 'user-detail'
            "
            >查看订单</a
          >
        </template>
      </pg-column>
    </pg-table>

    <h4 class="mt-20">操作记录</h4>
    <div class="row">
      <div
        class="col-12 after-divider position-relative"
        v-for="(v, index) in activities"
        :key="v.contnt"
      >
        <template>
          <div>{{ v.title || '-' }}</div>
          <div class="text-secondary">{{ v.content || '-' }}</div>
        </template>

        <a
          class="position-absolute"
          style="left: 225px; top: 46px"
          v-if="index === 2 && item.activities.length > 3"
          @click="showRemainLog"
          >{{ !is_show_remain_log ? '查看' : '收起' }}</a
        >
      </div>
      
    </div>
    <p class="text-secondary" v-if="item.activities.length == 0">
      暂无操作记录
    </p>

    <h4 class="mt-20">问题描述</h4>
    <div class="mt-10">
      <div
        v-for="(v, index) in item.comment"
        :key="index"
        style="width: 100%; overflow: hidden"
      >
        <div v-if="v.operator_class === 'member'" style="width: 48%">
          <div class="d-flex align-items-center">
            <img
              class="rounded-round"
              style="align: center"
              :src="cos_tenctent_path + v.avatar"
              width="48"
              height="48"
            />
            <span class="ml-10 text-secondary">
              {{ v.realname }}
              <br />
              {{ v.phone }}
            </span>
          </div>
          <div
            style="
              margin-left: 50px;
              padding: 10px;
              background: #fafafb;
              border-radius: 2px;
            "
          >
            <p class="content">
              <font v-if="item.reason && index === 0" style="margin-left: -8px"
                >【{{ item.reason }}】</font
              >
              <font v-if="index === 0"
                >【{{ Handle.returnWeight(item.weight_at_created) }}斤】</font
              >
              <br />
              {{ v.content }}
            </p>
            <p class="images">
              <my-image-preview v-if="v.images.length > 0">
                <img
                  v-for="img in v.images"
                  :key="img"
                  width="64"
                  height="64"
                  class="mr-20 cursor-pointer"
                  onerror="this.style.display='none'"
                  :src="cos_tenctent_path + img"
                  v-preview.list="v.images"
                />
              </my-image-preview>
            </p>
            <div v-if="v.media_urls.length > 0">
              <video
                class="mr-20 cursor-pointer"
                style="width: 44%"
                v-for="n in v.media_urls"
                :key="n"
                :src="cos_tenctent_path + n"
                controls
              ></video>
            </div>
            <span class="text-secondary">{{ v.created }}</span>
          </div>
        </div>
        <div
          v-else
          style="width: 50%; float: right; margin-left: 50px; padding: 10px"
        >
          <div class="text-secondary" v-if="v.is_revoke">您撤回了一条消息</div>
          <div v-else>
            <div class="d-flex flex-column">
              <div class="online text-right">
                <span
                  class="text-secondary"
                  style="margin-bottom: 10px; margin-right: 10px"
                  >客服：{{ v.employee_no }}</span
                >
                <img
                  class="rounded-round"
                  src="@/assets/online_avatar.png"
                  alt="avatar"
                  v-if="!v.avatar"
                  width="48"
                  height="48"
                />
                <img
                  v-else
                  :src="cos_tenctent_path + v.avatar + '_min200x200'"
                  width="48"
                  height="48"
                  style="border-radius: 50%"
                />
              </div>
              <div class="position-relative">
                <div
                  class="return-msg cursor-pointer position-absolute"
                  style="left: -30px; top: 50px"
                  @click="returnMsg(v.id)"
                  v-if="
                    v.can_revoke &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleDialogRevoke)
                  "
                >
                  撤回
                </div>
                <div
                  class="d-flex flex-column text-right"
                  style="
                    width: 80%;
                    margin-right: 50px;
                    padding: 10px;
                    background: #fafafb;
                    border-radius: 2px;
                  "
                >
                  <span class="mb-20">{{ v.content }}</span>
                  <span class="text-secondary">{{ v.created }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="audit-input"
      v-if="
        (app.auth.isAdmin || app.auth.OrderAfterSaleAppend) &&
        (item.status === 'waiting_dispose' || 'handling')
      "
    >
      <pg-form
        label-position="right"
        :model="formData"
        :rules="rules"
        ref="form"
      >
        <div
          v-if="item.status !== 'close'"
          class="d-flex pl-50"
        >
        <pg-form-item>
              <pg-textarea
              style="height: 100px;"
                class="border-radius-lg mt-20"
                v-model="formData.content"
                type="textarea"
                :cols="120"
                resize="none"
                placeholder="请输入要回复的内容..."
              />
            </pg-form-item>
            <pg-button
                style="height: 100px"
                class="mt-20"
                color="primary"
                @click="onSubmit"
                :disabled="formData.content === ''"
                >回复</pg-button
              >
        </div>
      </pg-form>
    </div>

    <div style="margin-left: 50px" class="mt-20">
      <pg-button class="mr-20" @click="onCancel">取 消</pg-button>
      <pg-button
        outline
        class="mr-20 primary"
        @click="showRemark(item.id)"
        v-if="
          (item.status === 'waiting_dispose' ||
            item.status === 'handling' ||
            item.status === 'init') &&
          (app.auth.isAdmin || app.auth.OrderAfterSaleAddLog)
        "
        >备 注</pg-button
      >
      <pg-button
        outline
        class="mr-20 primary"
        @click="handleShowHindeLoading()"
        v-if="
          (item.status === 'waiting_dispose' || item.status === 'handling') &&
          (app.auth.isAdmin || app.auth.OrderAfterSaleHandleLoading)
        "
        >处理进度</pg-button
      >
      <pg-button
        outline
        class="primary"
        @click="orderHandleDone()"
        v-if="
          (item.status === 'waiting_dispose' || item.status === 'handling') &&
          (app.auth.isAdmin || app.auth.OrderAfterSaleUpdate)
        "
        >处理完成</pg-button
      >
    </div>
  

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'remark'"
      title="备注"
    >
      <after-sale-remark
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.remarks"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @orderAftersaleDetail="orderAftersaleDetail"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'handle-loading'"
      title="处理进度"
    >
      <after-sale-handle-loading
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @orderAftersaleDetail="orderAftersaleDetail"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'handle-done'"
      title="处理完成"
    >
      <after-sale-handle-done
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
        :orderAftersaleDetail="orderAftersaleDetail"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.code} / ${drawer.item.title} 商品详情`" width="800px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <list-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

  </div>
</template>

<script>
import { Handle, Constant, Http, Api } from '@/util'
import afterSaleRemark from './after-sale-remark'
import afterSaleHandleLoading from './after-sale-handle-loading'
import afterSaleHandleDone from './after-sale-handle-done'
import listEdit from '@/page/item/list/list-edit'

import pgyos from '@/pgyos.entry';
export default {
  name: 'after-sale-detail',
  inject: ['app', 'listQuery'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {
    afterSaleRemark,
    afterSaleHandleLoading,
    afterSaleHandleDone,
    listEdit
  },
  data() {
    return {
      formData: {
        content: '',
      },
      dialog: { visible: false, type: 'remark', remarks: {} },
      drawer: { visible: false, type: '', item: {} },
      is_show_remain_log: false,
      activities: [],
    }
  },
  computed: {
    cos_tenctent_path() {
      return pgyos.osConfig().cos_tenctent_path
    },
    items() {
      const item = { ...this.$props.item }
      let obj = {}
      let items = []
      obj.item_image = item.item_image
      obj.item_code = item.item_code
      obj.item_title = item.item_title
      obj.item_attrs = item.item_attrs
      obj.frame_price = item.frame_price
      obj.item_price_sale = item.item_price_sale
      obj.count_pre = item.count_pre
      obj.count_real = item.count_real
      obj.weight_pre = item.weight_pre
      obj.weight_real = item.weight_real
      obj.amount_pre = item.amount_pre
      obj.amount_real = item.amount_real
      obj.order_id = item.order_id
      items.push(obj)
      return items
    },
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    if (this.$props.item.activities.length < 3) {
      this.$data.activities = this.$props.item.activities
    } else {
      this.$data.activities = this.$props.item.activities.slice(0, 3)
    }
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return
        this.orderAftersaleAppend()
      })
    },

    onCancel() {
      this.$emit('cancel')
    },

    showRemainLog() {
      this.$data.is_show_remain_log = !this.$data.is_show_remain_log
      if (this.$data.is_show_remain_log) {
        this.$data.activities = this.$props.item.activities
      } else {
        this.$data.activities = this.$props.item.activities.slice(0, 3)
      }
    },

    orderAftersaleAppend() {
      const formData = { ...this.$data.formData }
      formData.aftersale_id = this.$props.item.id
      formData.images = []

      this.$data.loading = true
      Http.post(Api.orderAftersaleAppend, formData)
        .then(() => {
          this.$data.loading = false
          this.orderAftersaleDetail()
          this.$toast({ type: 'success', message: '售后回复成功' })
          this.$data.formData.content = ''
        })
        .catch(() => {
          this.$data.loading = false
        })
    },

    returnMsg(id) {
      this.$data.loading = true
      Http.post(Api.orderAftersaleDialogRevoke, { comment_id: id })
        .then(() => {
          this.$data.loading = false
          this.orderAftersaleDetail()
          this.$toast({ type: 'success', message: '撤回成功' })
        })
        .catch(() => {
          this.$data.loading = false
        })
    },

    showRemark() {
      let remarks = this.$props.item
      this.$data.dialog = {
        visible: true,
        type: 'remark',
        remarks: remarks,
      }
    },

    handleShowHindeLoading() {
      let loading = this.$props.item
      this.$data.dialog = {
        visible: true,
        type: 'handle-loading',
        loading: loading,
      }
    },

    orderHandleDone() {
      let loading = this.$props.item
      this.$data.dialog = {
        visible: true,
        type: 'handle-done',
        loading: loading,
      }
    },

    orderShowHideDetail(id) {
      Http.get(Api.orderUserDetail, { id: id }).then((res) => {
        let rd = { ...res.data }
        rd.ori_com = 'after-sale' //追踪组件数据来源标识
        this.listQuery.$data.drawer_inner_user = {
          visible: true,
          type: 'user-detail',
          item: rd || {},
        }
      })
    },

    orderShowHideDetailReturnGoods(id) {
      Http.post(Api.orderSaleBackDetail, { id: id }).then((res) => {
        this.listQuery.$data.drawer_inner_return = {
          visible: true,
          type: 'return-detail',
          item: res.data || {},
        }
      })
    },

    orderAftersaleDetail() {
      let { item } = this
      Http.post(Api.orderAftersaleDetail, { id: item.id }, { throttle: false }).then((res) => {
        this.$props.item = res.data || {}
      })
    },

    showItemDetail() {
      let id = this.$props.item.item_id
      Http.get(Api.itemDetail, { id: id })
      .then(res => {
        console.log(res.data);
        this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
      });
    },

    handleSubmit() {
      this.$data.dialog = { type: 'remark', visible: false, item: {} }
      this.orderAftersaleDetail();
      this.$emit('submit')
    },

    handleCancel() {
      this.$data.dialog = { type: 'remark', visible: false, item: {} }
    },
  },
}
</script>

<style lang="scss" scoped>
.after-divider + .after-divider {
  position: relative;

  &::before {
    display: inline-block;
    content: '';
    background-color: #ddd;
    width: 1px;
    height: 40px;
  }
}
</style>
