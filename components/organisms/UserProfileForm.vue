<template>
  <v-form ref="form" v-model="isValid">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="firstName"
          label="Primeiro Nome"
          :rules="nameRules"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="lastName"
          label="Sobrenome"
          :rules="nameRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="email"
          label="E-mail"
          :rules="emailRules"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <v-row class="d-flex justify-end mb-4">
      <v-btn
        color="primary"
        :loading="isLoading"
        :disabled="!isValid || !hasChanges"
        @click="saveProfile"
      >
        Salvar alterações
      </v-btn>
    </v-row>
  </v-form>
</template>

<script>
import { user, auth } from '@/store';

export default {
  name: 'UserProfileForm',
  
  data() {
    return {
      isValid: true,
      isLoading: false,
      firstName: '',
      lastName: '',
      email: '',
      nameRules: [
        v => !!v || 'Campo obrigatório',
        v => (v && v.length <= 50) || 'Nome deve ter no máximo 50 caracteres',
      ],
      emailRules: [
        v => !!v || 'E-mail obrigatório',
        v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
      ],
    };
  },

  computed: {
    hasChanges() {
      const { people, email } = user.$user;
      return (
        this.firstName !== people.first_name || 
        this.lastName !== people.last_name ||
        this.email !== email
      );
    },
  },

  created() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      const { people, email } = user.$user;
      this.firstName = people.first_name || '';
      this.lastName = people.last_name || '';
      this.email = email || '';
    },

    async saveProfile() {
      try {
        this.isLoading = true;
        
        if (!this.$refs.form.validate()) {
          return;
        }

        const userId = user.$user.id;
        const peopleId = user.$user.people_id;
        const currentUser = user.$user;
        
        // Update user email
        await user.updateUser({
          id: userId,
          people_id: peopleId,
          email: this.email,
          alias: currentUser.alias,
          role_id: currentUser.role_id,
          account_verified: currentUser.account_verified,
          created_at: currentUser.created_at,
          updated_at: currentUser.updated_at
        });
        
        // Update people information
        await user.updatePeople({
          id: peopleId,
          first_name: this.firstName,
          last_name: this.lastName,
        });

        // Update username in auth store and cookies
        await auth.updateUserName({ 
          first: this.firstName, 
          last: this.lastName 
        });
        
        // Update email cookie
        this.$cookies.set('user_email', this.email, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        this.$toast.success('Informações pessoais atualizadas com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar informações pessoais:', error);
        this.$toast.error('Erro ao atualizar informações pessoais. Tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
  },
}
</script> 