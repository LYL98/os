<template>

</template>

<script>
  export default {
    name: "oauth",
    mounted() {
      window.addEventListener("message", function (evt) {
        if (window.parent !== evt.source) {
          return
        }
        var options = JSON.parse(evt.data);
        if (options.type === "get") {
          var data = window.localStorage.getItem(options.key);
          window.parent.postMessage({ code: 0, type: 'get', data: data }, "*");
        }
        if (options.type === "set") {
          window.localStorage.setItem(options.key, options.value);
          window.parent.postMessage({ code: 0, type: 'set', data: options.value }, "*");
        }
        if (options.type === "remove") {
          window.localStorage.removeItem(options.key);
          window.parent.postMessage({ code: 0, type: 'remove', message: 'success' }, "*");
        }
        if (options.type === "clear") {
          window.localStorage.clear();
          window.parent.postMessage({ code: 0, type: 'clear', message: 'success' }, "*");
        }
      }, false);
    }
  }
</script>

<style scoped>

</style>