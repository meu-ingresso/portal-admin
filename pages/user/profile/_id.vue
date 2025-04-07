<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Minha Conta</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon left>mdi-account</v-icon>
            Informações Pessoais
          </v-card-title>
          <v-card-text>
            <UserProfileForm />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-lock</v-icon>
            Segurança
          </v-card-title>
          <v-card-text>
            <UserSecurityForm />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { user } from '@/store';

export default {

  async asyncData({ params, error }) {
    try {
      const userId = params.id;
      await user.getById({ user_id: userId, commit: true });
      return { userId };
    } catch (e) {
      error({ statusCode: 404, message: 'Usuário não encontrado' });
    }
  },
  
  head() {
    return {
      title: 'Minha Conta',
    };
  },
}
</script> 