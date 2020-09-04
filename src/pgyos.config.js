let config = {
  is_main: false,
  cos_tenctent_path: '',
  cos_presigned_api: '',
  modify_password_api: '',
  logout_api: '',
  origin_yy: '',
  origin_gyl: '',
  origin_gylref: '',
  origin_bsc: '',
  origin_sc: '',
  origin_cls: '',
  auth: {},
  env: '',
  debug: false,
  jwt_token: '',
};

export const init = (options) => {
  //  env 取值：'dev' | 'test' | 'pre' | .... | 'pro'

  const { debug, env, jwt_token, auth, is_main } = options;

  config = {
    is_main: !!is_main,
    jwt_token: jwt_token,
    debug: debug,
    env: env,
    auth: {...auth},
    cos_tenctent_path: `https://cdn-vesta-${['pro', 'pre', 'prels'].includes(env) ? 'pro' : 'dev'}.pgyscm.com/`,
    cos_presigned_api: `https://vesta${env === 'pro' ? '' : env}.pgyscm.com/common/tencent/presigned_url`,
    nav_router_api: `https://apollo${env === 'pro' ? '' : env}.pgyscm.com/m/common/system/permission/list/tree`,
    modify_password_api: `https://apollo${env === 'pro' ? '' : env}.pgyscm.com/m/operator/password_modify`,
    logout_api: `https://apollo${env === 'pro' ? '' : env}.pgyscm.com/m/sign/logout`,
    origin_yy: `https://yy${env === 'pro' ? '' : env}.pgyscm.com`,
    origin_gyl: `https://gyl${env === 'pro' ? '' : env}.pgyscm.com`,
    origin_gylref: `https://gylref${env === 'pro' ? '' : env}.pgyscm.com`,
    origin_bsc: `https://bsc${env === 'pro' ? '' : env}.pgyscm.com`,
    origin_sc: `https://sc${env === 'pro' ? '' : env}.pgyscm.com`,
    origin_cls: `https://cls${env === 'pro' ? '' : env}.pgyscm.com`,
  };
};

export const destory = () => {
  config = {
    is_main: false,
    cos_tenctent_path: '',
    cos_presigned_api: '',
    modify_password_api: '',
    logout_api: '',
    origin_yy: '',
    origin_gyl: '',
    origin_gylref: '',
    origin_bsc: '',
    origin_sc: '',
    origin_cls: '',
    auth: {},
    env: '',
    debug: false,
    jwt_token: '',
  };
};

export const osConfig = () => {
  return config;
};
