<template>
  <v-row v-if="!isLoading" class="align-center justify-center">
    <v-col
      :cols="isMobile ? '12' : '4'"
      :lg="isMobile ? '12' : '4'"
      :md="isMobile ? '12' : '4'">
      <v-card class="px-4 py-4 login-card">
        <v-card-title class="text-center login-card-title mb-4"
          >Entre na sua conta</v-card-title
        >
        <v-card-text>
          <LoginForm @validated="validated = true" @unValidated="validated = false" />
        </v-card-text>
      </v-card>
    </v-col>

    <Toast />
  </v-row>

  <v-row v-else class="container-main">
    <v-progress-circular indeterminate color="primary" />
  </v-row>
</template>

<script>
import { sleep, isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      isLoading: true,
      validated: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    await sleep(50);
    this.$set(this, 'isLoading', false);
  },

};
</script>

<style scoped>
.login-card {
  border-radius: 32px;
}
.login-card-title {
  font-size: 40px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}
</style>
