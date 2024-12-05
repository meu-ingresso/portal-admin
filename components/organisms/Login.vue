<template>
  <div class="pt-10">
    <Logo />

    <div class="divMain">
      <h4 class="welcomeText text-center">Acesse sua conta!</h4>

      <v-form
        ref="form"
        v-model="valid"
        class="login-form text-center"
        @submit.prevent="validate"
        @keyup.native.enter="validate">
        <LoginForm />

        <v-alert
          v-if="error"
          class="mt-6"
          dense
          outlined
          type="error"
          icon="mdi-alert-outline"
          transition="scale-transition">
          E-mail ou senha inválidos.
        </v-alert>

        <v-btn v-if="!$isLoading" class="buttonBase mt-8" @click="validate">
          Fazer Login
        </v-btn>

        <v-btn v-if="$isLoading" class="buttonBase mt-8">
          <v-progress-circular indeterminate color="white" />
          &nbsp; Fazendo Login
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { auth, user, loading } from '~/store';

export default Vue.extend({
  name: 'LoginOrganism',

  data() {
    return {
      valid: true,
      error: false,
      doingLogin: false,
    };
  },

  computed: {
    $isLoading() {
      return loading.$isLoading;
    },

    $user() {
      return user.$user;
    },
  },

  methods: {
    async onLogin() {
      try {
        const startTime = new Date().getTime();
        loading.setIsLoading(true);

        const res = await auth.login(auth.$credentials);

        if (res.code !== 'LOGIN_SUCCESS') {
          setTimeout(() => {
            this.$set(this, 'error', true);
            loading.setIsLoading(false);
          }, 2000);
        } else {
          this.$set(this, 'error', false);

          const elapsedTime = new Date().getTime() - startTime;
          const timeoutDuration = Math.max(2000 - elapsedTime, 0);

          setTimeout(() => {
            this.$router.replace('/');
            loading.setIsLoading(false);
          }, timeoutDuration);
        }
      } catch (error) {
        loading.setIsLoading(false);
        auth.setError();
      }
    },

    async validate(this: any) {
      await this.$refs.form.validate();

      if (this.valid) {
        await this.onLogin();
      }
    },
  },
});
</script>

<style scoped>
.login-form {
  width: 100%;
  padding-top: 50px !important;
}

.buttonBase {
  text-transform: none !important;
  text-decoration: none !important;
  letter-spacing: normal !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  background-color: var(--primary) !important;
  color: var(--white) !important;
  border-radius: 50px !important;
  width: 100% !important;
  height: 45px !important;
}

.buttonBase:hover {
  background-color: var(--secondary) !important;
  transition: 0.3s ease-in-out;
}

.v-btn--is-elevated,
.v-btn--is-elevated:after {
  box-shadow: none !important;
}

.welcomeText {
  font-family: var(--font-family);
  font-weight: 400;
  color: var(--primary);
  font-size: 20px;
  padding-top: 56px;
  line-height: 100%;
}

.forgotPassword {
  padding-top: 32px !important;
  font-family: var(--font-family);
  font-weight: 400;
  color: var(--primary);
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
}

.divMain {
  max-width: 480px;
}
</style>
