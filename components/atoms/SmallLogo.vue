<template>
  <img v-if="isDark" src="~/assets/images/logo_menu1.png" class="logoMenu dark" />
  <img v-else src="~/assets/images/logo_menu.png" class="logoMenu" />
</template>

<script>
export default {
  props: {
    isDark: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.logoMenu {
  width: 35px;
  height: 30px;
}
.logoMenu.dark {
  width: 100px;
  height: auto;
  margin: 0 auto;
}
</style>
