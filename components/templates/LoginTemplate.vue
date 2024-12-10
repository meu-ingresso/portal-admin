<template>
  <v-row class="align-center justify-center">
    <v-col
      :cols="isMobile ? '12' : '4'"
      :lg="isMobile ? '12' : '4'"
      :md="isMobile ? '12' : '4'">
      <v-card class="px-4 py-4 login-card">
        <v-card-title class="text-center login-card-title mb-4">
          Entre na sua conta
        </v-card-title>

        <v-card-text>
          <LoginForm @validated="validated = true" @unValidated="validated = false" />
        </v-card-text>
      </v-card>
    </v-col>

    <Toast />
  </v-row>
</template>

<script>
import { sleep, isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
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
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

@media (max-width: 360px) {
  .login-card-title {
    font-size: 20px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .login-card-title {
    font-size: 26px;
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .login-card-title {
    font-size: 30px;
  }
}

@media (min-width: 1441px) {
  .login-card-title {
    font-size: 36px;
  }
}
</style>
