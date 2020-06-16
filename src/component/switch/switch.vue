<template>
  <component :is="tag" class="pg-switch" :class="{ checked: checked, disabled, 'flex-row-reverse': reverse }">
    <input type="checkbox" :checked="checked" :disabled="disabled" hidden style="position: absolute; left: -9999px; top: -9999px;"/>

    <label class="pg-switch--inner" @click="doToggle" v-if="!disabled">
      <span v-if="checked" class="switchery" style="background-color: #006eff; border-color: #006eff; box-shadow: #006eff 0px 0px 0px 10px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s;">
        <small style="left: 16px; transition-timing-function: cubic-bezier(.54,1.85,.5,1); transition-duration: .4s; transition-property: left;"></small>
        <slot></slot>
      </span>
      <span v-else class="switchery" style="background-color: #888; border-color: #888; box-shadow: #888 0px 0px 0px 0px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s;">
        <small style="left: 1px; transition-timing-function: cubic-bezier(.54,1.85,.5,1); transition-duration: .4s; transition-property: left;"></small>
        <slot></slot>
      </span>
    </label>

    <label class="pg-switch--inner disabled" v-else>
      <span v-if="checked" class="switchery" style="background-color: #006eff; border-color: #006eff; box-shadow: #006eff 0px 0px 0px 10px inset; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s, background-color 1.2s ease 0s; opacity: 0.5;">
        <small style="left: 16px; background-color: rgb(255, 255, 255);"></small>
        <slot></slot>
      </span>
      <span v-else class="switchery" style="box-shadow: #888 0px 0px 0px 0px inset; border-color: #888; background-color: #888; transition: border 0.4s ease 0s, box-shadow 0.4s ease 0s; opacity: 0.5;">
        <small style="left: 1px;"></small>
        <slot></slot>
      </span>
    </label>

<!--    <label @click="doToggle">-->

<!--    </label>-->
  </component>
</template>

<script>
export default {
  name: 'pg-switch',
  props: {
    value: { type: String | Number | Boolean | Object, default: false },
    trueValue: { type: String | Number | Boolean | Object, default: true },
    falseValue: { type: String | Number | Boolean | Object, default: false },
    disabled: { type: Boolean, default: false },
    reverse: { type: Boolean, default: false }, // 反转
    tag: { type: String, default: 'div' },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  computed: {
    checked() {
      return this.$props.value === this.$props.trueValue;
    },
  },
  methods: {
    doToggle() {
      let v = this.$props.value;
      let checked = !this.checked;

      v = checked ? this.$props.trueValue : this.$props.falseValue;
      this.$emit('change', v);
    },
  },
};
</script>

<style scoped></style>
