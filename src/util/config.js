
// 服务器地址
let url = window.location.origin;
// 是否是开发环境
let isLocalhost = url.indexOf('localhost') >= 0 || url.indexOf('192.168') >= 0 || url.indexOf('127.0') >= 0 || url.indexOf('172.') >= 0 || url.indexOf('10.') >= 0;
let isDev = url.indexOf('dev') >= 0 || url.indexOf('test') >= 0; //是否是测试环境
let isPre = url.indexOf('pre') >= 0; //是否是预发布环境
let isPro = !isLocalhost && !isDev && !isDev;

let acc_url = 'https://apollodev.pgyscm.com';
let tob_url = 'https://vestadev.pgyscm.com';

if (isLocalhost || isDev) { //测试环境
  acc_url = 'https://apollodev.pgyscm.com';
  tob_url = 'https://vestadev.pgyscm.com';
} else if (isPre) { //预发布环境
  acc_url = 'https://apollopre.pgyscm.com';
  tob_url = 'https://vestapre.pgyscm.com';
} else { //正式环境
  acc_url = 'https://apollo.pgyscm.com';
  tob_url = 'https://vesta.pgyscm.com';
}

const api_acc = acc_url + '/m';
const api_tob = tob_url;

module.exports = {
  api: {

    // 外部系统调用
    tencentPresignedUrl: api_tob + '/common/tencent/presigned_url', //腾讯Buckettoken
    commonProvinceList: api_tob + '/m/common/province/list', //区域列表
    commonZoneList: api_tob + '/m/common/zone/list', // 片区列表
    commonCityList: api_tob + '/m/common/city/list', // 县域列表
    commonProvinceListAuth: api_tob + '/m/common/my_province', //区域列表 含数据权限(我的区域列表)（全局区域）

    // common接口
    commonOperatorList: api_acc + '/common/operator/list',// 运营人员列表

    // 登录接口
    signLogin: api_acc + '/sign/login',//用户登录
    signQrconnectUrl: api_acc + '/sign/qrconnect/url',// 获取登录二维码
    signLoginConfirm: api_acc + '/sign/login/confirm',// 轮询扫码状态
    signWechatBind: api_acc + '/sign/wechat/bind',// 轮询扫码状态
    signLogout: api_acc + '/sign/logout',//用户退出
    signIsLogin: api_acc + '/sign/is_login',//判断是否登录

    // 运营人员
    operatorQuery: api_acc + '/operator/query', //运营人员列表，分页查询
    operatorAdd: api_acc + '/operator/add', //运营人员新增
    operatorList: api_acc + '/operator/list', // 运营人员列表，可以根据条件 过滤出对应的人员。post = salesman(业务员)
    operatorEdit: api_acc + '/operator/edit', //运营人员修改
    operatorDetail: api_acc + '/operator/detail', //运营人员详情
    operatorPwdReset: api_acc + '/operator/password_reset', //运营人员重置密码
    operatorPwdModify: api_acc + '/operator/password_modify', //运营人员修改密码（自己密码）
    operatorFreeze: api_acc + '/operator/freeze', //运营人员冻结
    operatorUnFreeze: api_acc + '/operator/unfreeze', //运营人员解冻
    operatorWechatUnbound: api_acc + '/operator/wechat/unbound', //解绑微信

    //角色、权限
    permissionTree: api_acc + '/system/permission/list/tree',// 权限树
    roleAdd: api_acc + '/system/role/add',//新增
    roleEdit: api_acc + '/system/role/edit',//修改
    roleDetail: api_acc + '/system/role/detail',// 角色详情
    roleList: api_acc + '/system/role/list',// 查询权限角色
    roleDelete: api_acc + '/system/role/delete',// 删除权限角色
    roleExportCheck: api_acc + '/system/role/export_check',// 导出检查
    roleExport: api_acc + '/system/role/export', // 导出
  },

  tencentPath: isPro ? "https://cdn-vesta.pgyscm.com/" : "https://cdn-vesta-dev.pgyscm.com/",
};
