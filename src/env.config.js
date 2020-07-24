const local_dev = 'testls';

export const node_env = process.env.NODE_ENV;
export const deploy_env = process.env.DEPLOY_ENV;

export const env = node_env === 'development' ? local_dev : deploy_env;

export const api_prefix_vesta = `https://vesta${env === 'pro' ? '' : env}.pgyscm.com`;
export const api_prefix_apollo = `https://apollo${env === 'pro' ? '' : env}.pgyscm.com`;