<template>
  <div class="pg-login-page">
    <div class="pg-navbar">
      <div class="pg-nav-item pl-20">
        <div class="pg-nav-logo d-flex align-items-center">
          <img src="@/assets/logo.svg" width="28" height="28" />
          <span class="brand">蒲公英</span>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="form-container">
        <div :class="`bg-${type}`" @click="toggleLoginType" v-if="step === 0"></div>
        <h3 class="login-title">{{ step === 0 ? (type === 'qrcode' ? '微信扫码登录' : '蒲公英运营中心') : (type === 'qrcode' ?
          '关联已有账号' : '微信授权') }}</h3>
        <div class="qrcode-container" v-if="type==='qrcode' && step === 0 || type === 'password' && step === 1">
          <iframe frameborder="0" scrolling="no" :src="qrconnect_url">
          </iframe>
          <div class="expiration-mask" v-if="isExpiration">二维码已过期</div>
          <div class="tips mt-30">
            请使用微信扫一扫{{ type==='qrcode' && step === 0 ? '登录' : '授权' }}
            <a class="ml-5" @click="signQrconnectUrl">刷新</a>&nbsp;
            <i class="icon-sync" :class="`${refreshing ? 'spinner' : ''}`"></i>
          </div>
        </div>
        <pg-form
            class="mt-40"
            size="lg"
            item-width="100%"
            v-if="(type==='password' && step === 0) || (type === 'qrcode' && step === 1)"
            ref="loginForm"
        >
          <pg-form-item class="mt-10" label="用户名" :show-label="false" rules="required">
            <pg-input
                ref="login-name"
                placeholder="请输入登录手机"
                v-model="loginData.login_name"
                @keyup.enter.native="handleLogin"
            >
              <span slot="prefix" class="pl-5">
                <i class="icon-mobile"></i>
              </span>
            </pg-input>
          </pg-form-item>
          <pg-form-item class="mt-10" label="密码" :show-label="false" rules="required">
            <pg-input
                type="password"
                ref="login-password"
                placeholder="请输入登录密码"
                v-model="loginData.password"
                @keyup.enter.native="handleLogin"
            >
              <span slot="prefix" class="pl-5">
                <i class="icon-lock2"></i>
              </span>
            </pg-input>
          </pg-form-item>
          <pg-form-item class="mt-20">
            <pg-button size="lg" color="primary" block @click="handleLogin" id="btn-submit" :loading="loading">登录</pg-button>
          </pg-form-item>
        </pg-form>

      </div>

    </div>

    <div class="pg-footer">
      <div class="copyright">
        Copyright &copy; {{ year }} pgyscm.com All Rights Reserved. 深圳蒲公英农业科技有限公司 版权所有
      </div>
    </div>
  </div>
</template>

<script>

  import md5 from 'md5';
  import {Http, Config} from '@/util';

  export default {
    name: "login",
    inject: ['app'],
    computed: {
      year() {
        return new Date().getFullYear();
      }
    },
    created() {
      document.title = '用户登录 - 蒲公英运营管理中心';
      this.$data.type === 'qrcode' && this.signQrconnectUrl();

      // 在登录页面 判断子系统跳转该页面传递的参数，向app 注册参数。
      const {href, origin, client} = this.$route.query;
      !this.app.isPro && console.log('【$route query】:', this.$route.query);
      this.app.$data.oauth_href = href ? decodeURIComponent(href) : '';
      this.app.$data.oauth_origin = origin ? decodeURIComponent(origin) : '';
      this.app.$data.oauth_client = client ? decodeURIComponent(client) : '';
    },
    beforeDestroy() {
      this.interval && clearInterval(this.interval);
    },
    data() {
      return {
        type: 'qrcode', //  qrcode | password
        step: 0,

        refreshing: false, // 刷新二维码
        loading: false, // 提交loading
        isExpiration: false,

        login_key: '',
        qrconnect_url: '',

        loginData: {
          login_name: '',
          password: '',
        },

        wechatInfo: {
          snsapi_openid: '',
          wechat_unionid: '',
        },

      }
    },
    methods: {
      /**
       * 账号密码 + 扫码:
       *  /m/sign/login 返回的login_key、qrconnect_url
       *  轮询: /sign/login/confirm 参数login_key
       *
       * 直接扫码:
       *  /m/sign/qrconnect/url
       *  轮询: /sign/login/confirm 参数login_key
       *
       * 登陆失败账号绑定:
       *  /sign/wechat/bind  参数: login_name、password、snsapi_openid、wechat_unionid
       */
      intervalConfirm() {
        this.interval = setInterval(() => {
          Http.post(Config.api.signLoginConfirm, {login_key: this.$data.login_key}, {throttle: false, handleError: false})
            .then(res => {

              if (res.code === 0) { // 表示绑定成功 或者 登录成功
                this.interval && clearInterval(this.interval);
                let rd = res.data || {};
                if (!rd.jwt_token) {
                  this.$toast({ type: 'danger', message: '用户登录异常' });
                  return;
                }
                this.app?.handleLogin(res.data);
                return;
              }

              if (res.code === 2) { // 表示需要绑定账号密码
                this.interval && clearInterval(this.interval);
                this.$data.wechatInfo = res.data;
                this.$data.step = 1;
                return;
              }

              if (res.code === 9) { // 表示二维码已过期
                this.interval && clearInterval(this.interval);
                this.$data.isExpiration = true;
                return;
              }

              if (res.code === 1) { // 登录报错
                this.interval && clearInterval(this.interval);
                this.$toast({ type: 'danger', message: res.message });
                return;
              }

            });
        }, 2000);
      },

      toggleLoginType() {
        this.interval && clearInterval(this.interval);
        if (this.$data.type === 'qrcode') {
          this.$data.type = 'password';
        } else if (this.$data.type === 'password') {
          this.$data.type = 'qrcode';
          this.signQrconnectUrl();
        }
        this.$data.step = 0;
      },

      // 如果是切换到了 qrcode 登录，则自动刷新URL
      async signQrconnectUrl() {

        this.$data.login_key = '';
        this.$data.qrconnect_url = '';
        this.interval && clearInterval(this.interval); // 请求二维码时，首先重置url 和 计时器

        if (this.$data.refreshing) return;

        this.$data.refreshing = true;
        let res = await Http.get(Config.api.signQrconnectUrl);
        this.$data.refreshing = false;

        if (res.code !== 0) return;
        this.$data.isExpiration = false; // 二维码请求成功后，设定过期状态为false
        this.intervalConfirm(); // 二维码请求成功后，开始计时器
        this.$data.login_key = res.data.login_key;
        this.$data.qrconnect_url = res.data.qrconnect_url;
      },

      handleLogin() {
        this.$refs['loginForm'].validateAll().then(async (valid) => {

          if (!valid) return;

          // 用户输入合法校验通过。
          if (this.$data.type === 'qrcode' && this.$data.step === 1) { // 表示当前是绑定微信操作
            let formData = {...this.$data.loginData, ...this.$data.wechatInfo};
            formData.password = md5(formData.password);

            try {
              this.$data.loading = true;
              let res = await Http.post(Config.api.signWechatBind, formData);
              this.$data.loading = false;

              if (res.code === 0) {
                let rd = res.data || {};
                if (!rd.jwt_token) {
                  this.$toast({ type: 'danger', message: '用户登录异常' });
                  return;
                }
                this.app?.handleLogin(res.data);
              } else {
                this.$toast({type: 'danger', message: res.message});
              }
            } catch (e) {
              this.$data.loading = false;
            }
          }

          if (this.$data.type === 'password' && this.$data.step === 0) { // 表示当前是用户输入用户名和密码登录
            let formData = {...this.$data.loginData};
            formData.password = md5(formData.password);
            try {
              this.$data.loading = true;
              let res = await Http.post(Config.api.signLogin, formData, {throttle: false});
              this.$data.loading = false;

              // 暂时禁止 用户扫码确认。

              if (res.code === 0) {
                this.$data.login_key = res.data.login_key;
                this.$data.qrconnect_url = res.data.qrconnect_url;
                this.$data.step = 1;
                this.intervalConfirm();
              } else {
                this.$toast({type: 'danger', message: res.message});
              }
            } catch (e) {
              this.$data.loading = false;
            }

          }

        });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .pg-login-page {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
    overflow: hidden;
  }

  .pg-login-page .body {
    width: 900px;
    height: 400px;
    position: absolute;
    top: 50%;
    margin-top: -200px;
    left: 50%;
    margin-left: -450px;
    border-radius: 12px;

    background: url("data:image/png;base64,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") no-repeat 30px center;
    background-size: contain;
    background-color: #FFF;
  }

  .body .form-container {
    display: block;
    margin-left: auto;
    width: 380px;
    height: 100%;
    background: #FFFFFF;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    position: relative;
    padding: 40px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .body .form-container .login-title {
    font-weight: 600;
    font-size: 26px;
    line-height: 42px;
    color: #333;
    user-select: none;
  }

  .body .form-container .bg-password,
  .body .form-container .bg-qrcode {
    position: absolute;
    right: 0;
    top: 0;
    width: 80px;
    height: 80px;
    background-size: cover;
    cursor: pointer;
  }

  .body .form-container .bg-password {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAPFBMVEUAAAD////d3d2ZmZn////////////////////////d3d2ZmZn09PSjo6PJycnh4eG9vb329va3t7ehoaFhNwwiAAAACXRSTlMAgICAkvPVK73BDujrAAABD0lEQVRYw9XWTU7DQBBE4RfsBMzYJsD978qyhGbRifptUgf4NH+aLi6bk+ttfQcgYj+rLn68wBr1c1yRxRuyeMUWsUVsEVvEFrFF/mcZz+W47xPYE8fvPoGdXe8/4z6BPXEcFcjb56P5+t62MSawI84gPbEAI1pgRAuMaIERLTCiBUa0wIgWGNECI1pgRAuMaIERLTCiBUa0wIgWGNECI1pgRAuMaIERLTCiCUasx2hDrAZ9ncsjVaQh1mWpzlLXuYZYF846ddvDFrFFbBFbxBaxRQRRAPPCj9MBI47TAPObndNv0xFtkMXacsTiUozXgy1ii9gitogtYovYIraILWKL2CK2iC1ii9gitogt/gFNhHSCpdN/wQAAAABJRU5ErkJggg==") no-repeat center center;
    transition: all .3s ease-in-out;

    &:hover {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAANlBMVEUAAAD///8Aref///////////////////////////8ArecXturj9v131PNZyvAct+q26PlJxe5RQKRzAAAACXRSTlMAgICS89UrBr0xa+FRAAABCklEQVRYw63WXQ6CMBBF4aP4R0HB/W/WxxvBpJE5dwFfettJOpxGJ5frcAMgYj3D3RYfujhgi/o9DsjiFVm8YIvYIraILWKL2CLfObf/Mr3mLXhQDDnvwErr+d1eG7AqtmkHHm+9rOPY2gasiT/AmtgBI1pgRAuMaIERLTCiBUa0wIgWGNECI1pgRAuMaIERLTCiBUa0wIgWGNECI1pgRAuMaIERLTCiCUbsf6MVcVlrIKcDq0hf7C9Lldb9da4v9hfOSut9sEVsEVvEFrFFbBFBFMBM+PR0wIjtKYE5owZytsCIVuWInUcxpgdbxBaxRWwRW8QWsUVsEVvEFrFFbBFbxBaxRWwRW/wA4GVzfKb+HQAAAAAASUVORK5CYII=");
    }

    &::after {
      display: inline-block;
      content: '账号登录';
      text-align: center;
      font-size: 12px;
      color: #BBBBBB;
      width: 68px;
      height: 20px;
      line-height: 20px;
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAUBAMAAADGs4Z2AAAAGFBMVEUAAADu7u7u7u7x8fHx8fHw8PDu7u7u7u5/e4H9AAAAB3RSTlMA4/BJNzC3wPsnVwAAAD5JREFUKM9jMCzHC4QZGBjE8SspBCopJwDopiSAsBIVwkqKHAgqKVclrKSMKkpUiXIu5Z4OoGM0Ek5SRCRMABHZLM7/8+8oAAAAAElFTkSuQmCC") no-repeat center center;
      background-size: cover;

      position: absolute;
      top: 13px;
      right: 80px;
    }
  }

  .body .form-container .bg-qrcode {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAQlBMVEUAAAD///+ZmZn////r6+vX19f////////////////////Dw8P///+ZmZnX19fr6+vCwsL5+fn09PSioqK9vb3v7++CBWtlAAAADHRSTlMAgICSgIDz1SsGvYBMRb1uAAABMElEQVRYw63WOW7DMABE0dFmZxMZyc79r5qAKmTgIwU18zsCxCuIKajhK9PtPr2pdYp203ta/IiLk9Ji/B0nhcW7wuJNaVFpUWlRaVFpURCjoMb1v0q7Xo9DbYeyro/nDhBiD/hH7gAhdoHrEyDEPvABEGIfuAKkmAa1lNdewa20tg6QezzBs15QgwtSdEGKLkgxDWreCW61tV0C9Qmwb4dscEGKLkjRBSm6IEUXpJgGNbogRRek6IIUXZCiC1IsBOt36xqoBSDqAzW4IEUXpOiCFF2QYhrUbO6QjS5I0QUpuiBFF6SYBrUcP4ef0jJA/nuY0qLSotKi0qKuN9ejGKjR3yFFgqZI0BQJuiJAWwRoi1GQC1daVFpUWlRaVFpUWlRaVFpUWlRaVFpUWlRa/AWmD5hBMXr7vwAAAABJRU5ErkJggg==") no-repeat center center;
    transition: all .3s ease-in-out;

    &:hover {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAA85JREFUeAHt28tr1EAcB/BJX7KFWqV7sCBqj4L4qteC9OZV/wVpPXvw2vTqwWutePfUf0Cw+AdYvfg4KirsZVFLiwu1dv19F2adzSbZTDaPefwGQmYmM5PNhwmTmWSDbrcbCiE2aOMQL3BI2V9pe0nb8yAIPqjFAiQYUSVJjZ/Q0S3aHhLkEUr2ABFhRChkDrtU8g4QJ2QVSoQU35Rp3qcKrNLRJyjR74GyOPdEKTFyj9v5ar8HyuLcE6XEyD3s7g/1QFmNe6KUSN1/TARENUZMxcPBw1RAlGBEKCSHkYCoyohjAjJiAYCMGI+Y6RZWq/LtrGrEPEgPHo5PMeJ/F+0e2K+60wopXvoqzvbNebF2qdE/rYzs/ToWt3bbMjmwf7PaFMtnpgbykHj2pSPW3+738hcbk+J2c0Y8vjInzjeG5hNDdZMy8te8txhSo5tJDZue3+r8FS++dcS1V23xvYNZWb6QHxDnsxwRl/Dj6EQ8en+AaK4wHiBO6QDi63Zvaa8mQAcQcTvnDeP3QHlmB3qivBSd/fBQpVM7WpYQtz93KLerPTrL0THaZFL64uykwAgdF3CsqlAsIP3q9aVGSM+J+P1aiLqAzZkg9vGmKjh5nuJuYdki7X1alC0FEJa+IJYG6AtiqYA+IBY+iAAtGnA77/38I5qnJjYujDHvVNv9TY9unw6O1ax+/PLclKhqIK4EEFe2fHY6fPBuX2xdP601OvdVIhHg6S4mRJooJFn6Laz+yqc35kNKW7sAoV6LjFcKiJO6NjpXDugaYi2ALiHWBugKYq2ALiDWDmg7ohGAQLR1ZdscQEsRzQK0ENE8QMsQK5sLw0Ur4B3LTgtVCpk7oyEsMqwtzSJaWDAXEJcIxN47lmIQVxamBbYig5m3sHKFeMdCSWMXIIwHhKXJCxBWAJqMaA2gqYhWAZqIaPYoDLGYIN+x0CGtRxz1+8Bos92756JZmdLW9UB5VXjHQvHaR2drAXuQBnzQZDcgFGtGtB+wZkQ3AGtEtHIUhldsoNsZ3yfS94Gxo/PKwkziN4Wx7fmaif+x0FZJcNaY9CpBdBYQF1YFotOAVSA6D1g2YuCFIF0kfZ8YdlPmznH/rcti4w1gDyPlD5LeLSZk6R1DZUqY9rkzExnSSsgoGNE/QLgWiOgnYIGI/gIWiIim/A40OuedOPsNp1x93mmf0gRH8yCyWkRAFzFSnZMQ0EFksQSBrIgJ1TkbAlkQWWqEwCjEEdX5MATSEFkoo0ASYsbqXAwCcYgsoykQRdSszsUhoCKySE4BiZizOleDABD/AfOzmFyDEMRqAAAAAElFTkSuQmCC");
    }

    &::after {
      display: inline-block;
      content: '扫码登录';
      text-align: center;
      font-size: 12px;
      color: #BBBBBB;
      width: 68px;
      height: 20px;
      line-height: 20px;
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAUBAMAAADGs4Z2AAAAGFBMVEUAAADu7u7u7u7x8fHx8fHw8PDu7u7u7u5/e4H9AAAAB3RSTlMA4/BJNzC3wPsnVwAAAD5JREFUKM9jMCzHC4QZGBjE8SspBCopJwDopiSAsBIVwkqKHAgqKVclrKSMKkpUiXIu5Z4OoGM0Ek5SRCRMABHZLM7/8+8oAAAAAElFTkSuQmCC") no-repeat center center;
      background-size: cover;

      position: absolute;
      top: 13px;
      right: 80px;
    }
  }

  .body .qrcode-container {
    margin-top: 28px;
    width: 300px;
    height: 330px;
    overflow: hidden;
    text-align: center;
    position: relative;

    iframe {
      width: 100%;
      height: 100%;
      transform: scale(.7);
      margin-top: -82px;
    }

    .expiration-mask {
      position: absolute;
      z-index: 100;
      width: 200px;
      height: 200px;
      line-height: 200px;
      top: 0px;
      left: 50px;
      text-align: center;
      font-size: 14px;
      color: #5A5D64;
      font-weight: 600;
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  /*.body .qrcode-container .qrcode {*/
  /*  display: block;*/
  /*  width: 200px;*/
  /*  height: 200px;*/
  /*  background: #DDD;*/
  /*  margin: 0 auto;*/
  /*  overflow: hidden;*/
  /*  text-align: center;*/

  /*  */
  /*}*/

  .body .qrcode-container .tips {
    position: absolute;
    top: 190px;
    width: 100%;
    font-size: 14px;
    color: #666666;

    a {
      user-select: none;
      color: #666666;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .pg-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #f7f8fa;
    border-top: #dedfe1 1px solid;

    .copyright {
      line-height: 60px;
      color: #999;
      font-size: 12px;
      text-align: center;
    }
  }


</style>