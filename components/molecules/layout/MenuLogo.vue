<template>
  <div v-if="!isMobile" height="50%">
    <DesktopLogo
      v-if="!miniVariant"
      :class="{ 'cursor-pointer': clickToHome }"
      @click="handleClick" />

    <MobileLogo v-else :class="{ 'cursor-pointer': clickToHome }" @click="handleClick" />
  </div>

  <v-app-bar-nav-icon v-else class="nav-icon" @click="toggleDrawer"></v-app-bar-nav-icon>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    miniVariant: {
      type: Boolean,
      default: false,
    },
    clickToHome: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    handleClick() {
      if (this.clickToHome) {
        this.$router.push('/');
      }
    },
    toggleDrawer() {
      this.$emit('change-drawer');
    },
  },
};
</script>

<style scoped>
.nav-icon {
  color: white !important;
}
</style>
