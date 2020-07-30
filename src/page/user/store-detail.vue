<template>
  <div>
    <h4 class="mt-20">门店信息</h4>
    <div class="row">
      <div class="col-4 overflow-ellipsis">门店名称：{{ detail.title || '-' }}</div>
      <div class="col-8 overflow-ellipsis">门店地址：{{ detail.address || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">所在县域：{{ detail.city && detail.city.title || '-' }}</div>
      <div class="col-4">联系方式：{{ detail.phone || '-' }}</div>
      <div class="col-4">创建时间：{{ detail.created || '-' }}</div>
    </div>

<!--    <div class="d-flex align-items-center mt-20">-->
<!--      <h4 class="mb-0">推广者管理</h4>-->
<!--      <pg-button color="primary" class="ml-auto" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsUserStoreHeaderAdd">新增</pg-button>-->
<!--    </div>-->

<!--    <div class="edit-form-container" :style="`height: ${dialog.visible ? '150px' : '0'}`">-->
<!--      &lt;!&ndash; subitem 对应的是在售商品。item 对应的是单条调价记录 &ndash;&gt;-->
<!--      <store-header-edit-->
<!--        v-if="dialog.visible"-->
<!--        :type="dialog.type"-->
<!--        :store="item"-->
<!--        @submit="handleSubmit"-->
<!--        @cancel="handleCancel"-->
<!--      />-->
<!--    </div>-->

<!--    <pg-table-->
<!--      :data="detail.headers"-->
<!--      primary-key="id"-->
<!--      :serialable="false"-->
<!--      borderless-->
<!--    >-->
<!--      <pg-column title="推广者名称" prop="realname"></pg-column>-->
<!--      <pg-column title="登录手机" prop="phone" width="200px"></pg-column>-->
<!--      <pg-column prop="" title="状态"  width="140px">-->
<!--        <template v-slot="{row}">-->
<!--          <pg-confirm-->
<!--            v-if="app.auth.isAdmin || app.auth.ClsUserStoreHeaderFreeze"-->
<!--            :help-text="`确认${row.is_freeze_header ? '解冻' : '冻结'}该用户`"-->
<!--            @confirm="handleFreezeHeader(row)"-->
<!--          >-->
<!--            <pg-switch :value="!row.is_freeze_header"/>-->
<!--          </pg-confirm>-->
<!--          <span v-else>{{ row.is_freeze_header ? '已冻结' : '正常' }}</span>-->
<!--        </template>-->
<!--      </pg-column>-->
<!--    </pg-table>-->
  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'store-detail',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        },
        detail: {
          headers: []
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.userStoreDetail();
    },

    methods: {

      userStoreDetail() {
        Http.get(Api.userStoreDetail, { id: this.$props.item.id })
          .then(res => {
            this.$data.detail = res.data || { headers: [] };
          });
      },

      // handleAddItem() {
      //   this.$data.dialog = { type: 'add', visible: true, item: {} };
      // },

      // handleFreezeHeader(item) {
      //   Http.post(!item.is_freeze_header ? Api.userStoreHeaderFreeze : Api.userStoreHeaderUnFreeze, {member_id: item.id})
      //     .then(() => {
      //       this.$toast({ type: 'success', message: `团长${!item.is_freeze_header ? '冻结' : '解冻'}成功` });
      //       item.is_freeze_header = !item.is_freeze_header;
      //     });
      // },

      handleSubmit() {
        this.handleCancel();
        this.userStoreDetail(); // 更新详情
        // this.$emit('submit'); // 向列表提交事件！目前 在新增团长后，外部列表 不需要更新。
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },
    }

  }
</script>

<style lang="scss" scoped>
  .edit-form-container {
    height: 0;
    overflow: hidden;
    transition: height .2s ease-in-out;
  }
</style>
