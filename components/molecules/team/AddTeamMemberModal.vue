<template>
  <v-dialog :value="show" max-width="500" persistent @input="$emit('update:show', $event)">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3>{{ title }}</h3>
        <v-btn icon @click="$emit('update:show', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <AddTeamMemberForm 
          ref="form" 
          v-model="formData" 
          @update:valid="formValid = $event" 
        />
      </v-card-text>
      <v-card-actions class="d-flex justify-space-between align-center py-3 px-6">
        <DefaultButton
          outlined
          text="Cancelar"
          @click="$emit('update:show', false)"
        />
        <DefaultButton
          text="Adicionar"
          :disabled="!formValid || loading"
          :is-loading="loading"
          @click="handleSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { user, toast } from '@/store';
import { extractNameFromEmail } from '@/utils/utils';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Adicionar membro'
    }
  },
  
  data() {
    return {
      formData: {
        email: '',
        role: ''
      },
      formValid: false,
      loading: false
    };
  },
  
  watch: {
    show(newValue) {
      if (newValue === false) {
        // Reset o formulário quando o modal for fechado
        this.resetForm();
      } else {
        // Garante que começamos com um formulário limpo ao abrir o modal
        this.$nextTick(() => {
          this.resetForm();
        });
      }
    }
  },

  methods: {
    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.formValid = false;
      }
      this.formData = {
        email: '',
        role: ''
      };
    },
    
    async handleSubmit() {
      if (!this.$refs.form || !this.$refs.form.validate()) {
        return;
      }
      
      // Validação adicional
      if (!this.formData.email || !this.formData.role) {
        toast.setToast({
          text: 'Preencha todos os campos obrigatórios',
          type: 'error',
          time: 3000,
        });
        return;
      }
      
      this.loading = true;
      
      try {
        // Verificar se o usuário já existe pelo email
        const userResult = await user.findUserByEmail(this.formData.email);
        
        if (!userResult.success) {
          throw new Error(userResult.error);
        }
        
        // Obter o ID do cargo selecionado
        const roleResult = await user.getRoleByName(this.formData.role);
        
        if (!roleResult.success) {
          throw new Error(roleResult.error);
        }
        
        const roleId = roleResult.data.id;
        
        if (userResult.exists) {
          // Usuário existe, atualizar o cargo
          await user.updateUser({
            id: userResult.data.id,
            role_id: roleId,
          });
          
          toast.setToast({
            text: 'Cargo do usuário atualizado com sucesso!',
            type: 'success',
            time: 3000,
          });
        } else {
          // Extrair nome e sobrenome do e-mail para criar o usuário com dados iniciais
          const { firstName, lastName } = extractNameFromEmail(this.formData.email);
          
          // Usuário não existe, criar um novo
          const createResult = await user.createUser({
            email: this.formData.email,
            role_id: roleId,
            firstName,
            lastName
          });
          
          if (!createResult.success) {
            throw new Error(createResult.error);
          }
          
          toast.setToast({
            text: 'Novo membro da equipe criado com sucesso!',
            type: 'success',
            time: 3000,
          });
        }
        
        this.$emit('saved');
        this.$emit('update:show', false);
        this.$refs.form.reset();
        
      } catch (error) {
        console.error('Erro ao adicionar membro da equipe:', error);
        toast.setToast({
          text: 'Erro ao adicionar membro da equipe: ' + (error.message || 'Erro desconhecido'),
          type: 'error',
          time: 5000,
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script> 