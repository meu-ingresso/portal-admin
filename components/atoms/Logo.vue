<template>
  <img
    src="~/assets/images/logo.jpg"
    :class="$vuetify.breakpoint.mobile ? 'logoMobile' : 'logo'" />
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  name: 'LogoApp',

  data() {
    return {
      dialog: false,
    };
  },
});
</script>

<style scoped>
.logo {
  width: 500px;
  height: 100px;
  margin: 0 auto;
  display: block;
}

.logoMobile {
  width: 300px;
  height: 70px;
  margin: 0 auto;
  display: block;
}
</style>
