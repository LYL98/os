<template>
  <div class="p-20">

    <pg-dialog :visible="true">
      <pg-form ref="form">

        <pg-form-item rules="required">
          <pg-locationpicker v-model="location" level="all" @change="changeLocation"></pg-locationpicker>
        </pg-form-item>

        <pg-form-item rules="required">
          <pg-input ></pg-input>
        </pg-form-item>

        <div class="">
          <pg-button @click="onSubmit" color="primary">submit</pg-button>
        </div>
      </pg-form>
    </pg-dialog>


  </div>
</template>

<script>
  export default {
    name: 'demo',
    data() {
      return {
        location: {
          city_title: "南充市",
          lat: 30.9849,
          lng: 105.888562,
          poi: "四川省西充中学",
          province_title: "四川省",
        }
      }
    },

    methods: {
      changeLocation(v) {
        console.log('v', v);
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(res => {
          console.log('validate result: ', res);
        })
      }
    }
  }
</script>