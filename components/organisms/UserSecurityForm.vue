<template>
  <v-form ref="form" v-model="isValid" class="py-4">

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="newPassword" label="Nova Senha" :rules="passwordRules"
          :type="showNewPassword ? 'text' : 'password'" :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          outlined dense @click:append="showNewPassword = !showNewPassword" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="confirmPassword" label="Confirmar Nova Senha" :rules="confirmPasswordRules"
          :type="showConfirmPassword ? 'text' : 'password'"
          :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'" outlined dense
          @click:append="showConfirmPassword = !showConfirmPassword" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between">

        <DefaultButton text="Cancelar" outlined @click="cancel" />

        <DefaultButton text="Salvar" :loading="isLoading" :disabled="!isValid || !canSubmit" @click="changePassword" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {

  data() {
    return {
      isValid: true,
      isLoading: false,
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      passwordRules: [
        v => !!v || 'Campo obrigatório',
        v => (v && v.length >= 8) || 'Senha deve ter no mínimo 8 caracteres',
        v => /[A-Z]/.test(v) || 'Senha deve conter pelo menos uma letra maiúscula',
        v => /[a-z]/.test(v) || 'Senha deve conter pelo menos uma letra minúscula',
        v => /[0-9]/.test(v) || 'Senha deve conter pelo menos um número',
      ],
    };
  },

  computed: {
    confirmPasswordRules() {
      return [
        v => !!v || 'Confirmação de senha é obrigatória',
        v => v === this.newPassword || 'As senhas não conferem',
      ];
    },

    getUserId() {
      return this.$store.state.auth.user?.id;
    },

    canSubmit() {
      return this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword;
    },
  },

  methods: {

    cancel() {
      this.$emit('cancel');
    },

    async changePassword() {
      if (!this.$refs.form.validate()) {
        return;
      }

      try {
        this.isLoading = true;

        // Aqui você implementaria a chamada para o backend para alterar a senha
        await this.$store.dispatch('user/updateUser', {
          id: this.getUserId,
          password: this.newPassword
        });

        // Resetar o formulário
        this.$refs.form.reset();
        this.newPassword = '';
        this.confirmPassword = '';

        this.$store.dispatch('toast/setToast', {
          text: 'Senha alterada com sucesso!',
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao alterar senha:', error);

        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao alterar a senha. Verifique se sua senha atual está correta.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
}
</script>