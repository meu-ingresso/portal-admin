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
          v-model="credentials.email"
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
          v-model="credentials.password"
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
          :class="{'login-button': !isMobile, 'login-button button-mobile': isMobile}"
          :is-loading="isLoading"
          :disabled="!valid || isLoading"
          @click="validate" />
      </v-col>
      <v-col cols="12" class="d-flex align-center justify-center">
        <DefaultButton
          text="Não possuo conta"
          :class="{
            'create-account-button': !isMobile,
            'create-account-button button-mobile': isMobile,
          }"
          disabled
          outlined
          @click="goToCreateAccount" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      valid: true,
      error: false,
      isLoading: false,
      credentials: {
        email: '',
        password: ''
      },
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
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    goToCreateAccount() {
      this.$router.push({ name: 'create-account' });
    },

    async onLogin() {
      try {
        this.error = false;
        this.isLoading = true;

        // Usando o Nuxt Auth Module oficial
        await this.$auth.loginWith('local', {
          data: {
            email: this.credentials.email,
            password: this.credentials.password
          }
        });

        // Se chegou aqui, login foi bem-sucedido
        // O Nuxt Auth faz o redirect automaticamente
        // ou podemos forçar o redirect:
        this.$router.push({ name: 'Lista de Eventos' });

      } catch (error) {
        console.error('Erro no login:', error);
        this.error = true;
        this.$refs.form.resetValidation();
      } finally {
        this.isLoading = false;
      }
    },

    async validate() {
      await this.$refs.form.validate();

      if (this.valid) {
        await this.onLogin();
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

.button-mobile {
  width: 100% !important;
}

.emailInput {
  padding-top: 10px !important;
}

.v-input__slot {
  height: 50px !important;
}
</style>
