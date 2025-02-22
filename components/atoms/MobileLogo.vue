<template>
  <img
    v-if="isDark"
    src="~/assets/images/logo_web.png"
    class="logoMenu"
    @click="handleClick" />
  <img
    v-else
    src="~/assets/images/logo_footer.png"
    class="logoMenu"
    @click="handleClick" />
</template>

<script>
export default {
  props: {
    isDark: {
      type: Boolean,
      default: false,
    },
    clickToHome: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    handleClick() {
      if (this.clickToHome) {
        this.$router.push('/');
      }
    },
  },
};
</script>

<style scoped>
.logoMenu {
  width: 100%;
  height: 100%;
}
</style>
