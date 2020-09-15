const local_env = 'testls';

export const node_env = process.env.NODE_ENV;
export const deploy_env = process.env.DEPLOY_ENV;

export const env = node_env === 'development' ? local_env : deploy_env;

export const api_prefix_mercury = `https://mercury${env === 'pro' ? '' : env}.pgyscm.com`;
export const api_prefix_apollo = `https://apollo${env === 'pro' ? '' : env}.pgyscm.com`;
export const api_prefix_vesta = `https://vesta${env === 'pro' ? '' : env}.pgyscm.com`;
export const api_prefix_juno = `https://juno${env === 'pro' ? '' : env}.pgyscm.com`;

export const oauth_origin = `https://yy${env === 'pro' ? '' : env}.pgyscm.com`;
export const oauth_token_key = 'pgy_user_info';
export const oauth_token_page = oauth_origin + '/oauth.html';
export const oauth_login_page = oauth_origin + '/#/login';
