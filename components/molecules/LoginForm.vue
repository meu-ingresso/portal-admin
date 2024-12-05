<template>
  <v-row class="text-center">
    <v-col cols="12" class="pa-0 ma-0 emailInput">
      <v-text-field
        v-model="$auth.email"
        :disabled="$isLoading"
        class="loginInput"
        label="Insira seu e-mail"
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
        :disabled="$isLoading"
        class="loginInput"
        label="Insira sua senha"
        prepend-inner-icon="mdi-lock"
        :rules="rules.password"
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        dense
        outlined
        @click:append="showPassword = !showPassword" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { auth, loading } from '~/store';

export default Vue.extend({
  data() {
    return {
      rules: {
        email: [
          (v: string) => !!v || 'Campo obrigatório',
          (v: string) => /.+@.+\..+/.test(v) || 'O formato do e-mail não é válido.',
        ],
        password: [(v: string) => !!v || 'Campo obrigatório'],
      },
      showPassword: false,
    };
  },

  computed: {
    $auth() {
      return auth.$credentials;
    },
    $isLoading() {
      return loading.$isLoading;
    },
  },
});
</script>

<style scoped>
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
