<template>
  <v-form
    ref="form"
    v-model="valid"
    class="login-form text-center mt-4"
    @submit.prevent="validate"
    @keyup.native.enter="validate">
    <v-alert
      v-if="error"
      class="mt-2"
      dense
      outlined
      type="error"
      icon="mdi-alert-outline"
      transition="scale-transition">
      E-mail ou senha inválidos.
    </v-alert>

    <v-row class="text-center">
      <v-col cols="12" class="pa-0 ma-0 emailInput">
        <v-text-field
          v-model="$auth.email"
          :disabled="isLoading"
          class="loginInput"
          label="E-mail"
          placeholder="Digite aqui seu e-mail"
          prepend-inner-icon="mdi-email"
          :rules="rules.email"
          type="email"
          background-color="white"
          validate-on-blur
          dense
          outlined />
      </v-col>

      <v-col cols="12" class="pa-0 ma-0 passwordImput">
        <v-text-field
          v-model="$auth.password"
          :disabled="isLoading"
          class="loginInput"
          label="Senha"
          placeholder="Digite aqui sua senha"
          prepend-inner-icon="mdi-lock"
          :rules="rules.password"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          dense
          outlined
          @click:append="showPassword = !showPassword" />
      </v-col>
    </v-row>

    <v-row class="align-center justify-center">
      <v-col cols="12" class="d-flex align-center justify-center">
        <DefaultButton
          text="LOGIN"
          class="login-button"
          :is-loading="isLoading"
          :disabled="!valid || isLoading"
          @click="validate" />
      </v-col>
      <v-col cols="12" class="d-flex align-center justify-center">
        <DefaultButton
          text="Não possuo conta"
          class="create-account-button"
          disabled
          outlined
          @click="goToCreateAccount" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { auth, loading } from '~/store';

export default {
  data() {
    return {
      valid: true,
      error: false,
      rules: {
        email: [
          (v) => !!v || 'Campo obrigatório',
          (v) => /.+@.+\..+/.test(v) || 'O formato do e-mail não é válido.',
        ],
        password: [(v) => !!v || 'Campo obrigatório'],
      },
      showPassword: false,
    };
  },

  computed: {
    $auth() {
      return auth.$credentials;
    },
    isLoading() {
      return loading.$isLoading;
    },
  },

  methods: {
    goToCreateAccount() {
      this.$router.push({ name: 'create-account' });
    },

    async onLogin() {
      try {
        this.error = false;

        const res = await auth.login(auth.$credentials);

        if (res && res?.body?.code === 'LOGIN_SUCCESS') {
          this.error = false;
          this.$router.push({ name: 'Eventos' });
        } else {
          this.error = true;
          this.$refs.form.resetValidation();
        }
      } catch (error) {
        console.error(error);
      }
    },

    async validate() {
      await this.$refs.form.validate();

      if (this.valid) {
        loading.setIsLoading(true);
        await this.onLogin();
        loading.setIsLoading(false);
      }
    },
  },
};
</script>

<style scoped>
.login-button {
  width: 70%;
  border-radius: 8px;
}
.create-account-button {
  color: var(--primary);
  background-color: var(--white);
  border-radius: 8px;
  width: 70%;
}

.loginInput {
  width: 95% !important;
  margin-left: 12px !important;
  border-radius: 6px !important;
}

.emailInput {
  padding-top: 10px !important;
}

.v-input__slot {
  height: 50px !important;
}
</style>
