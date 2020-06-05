const handleType = (data, type) => {
  let obj = {};
  if (type === 'options') {
    data.forEach((item) => {
      obj[item.label] = item.value;
    });
    return obj;
  }

  if (type === 'enum') {
    data.forEach((item) => {
      if (item.value) {
        obj[item.value] = item.label;
      }
    });
    return obj;
  }

  return data;
};

module.exports = {
  PAGE_SIZE: 20,
  LOCAL_USER_INFO: 'pgy_user_info',
  LOCAL_ROUTE_RECORDS: 'pgy_route_records', // 路由访问记录

  //运营人员职务
  OPERATOR_POST: (type) => {
    return handleType([
      { label: '商品', value: 'buyer' },
      { label: '业务', value: 'salesman' },
      { label: '供应链', value: 'supply' },
      { label: '客服', value: 'service' },
      { label: '其他', value: 'other' },
    ], type);
  },
};
