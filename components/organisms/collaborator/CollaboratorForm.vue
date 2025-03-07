<template>
  <v-form ref="form" v-model="isFormValid">
    <div class="form-row">
      <div
        v-for="(collaborator, index) in collaborators"
        :key="index"
        class="collaborator-form-row">
        <v-row>
          <v-col cols="12" md="6" sm="12">
            <v-text-field
              v-model="collaborator.email"
              label="E-mail"
              placeholder="Digite o e-mail do colaborador"
              required
              hide-details="auto"
              :error="collaborator.errors?.email"
              :error-messages="collaborator.errorMessages?.email"
              dense
              outlined />
          </v-col>

          <v-col cols="9" md="5" sm="9">
            <v-autocomplete
              v-model="collaborator.role"
              :items="$roles"
              label="Função"
              placeholder="Selecione a função"
              required
              hide-details="auto"
              :error="collaborator.errors?.role"
              :error-messages="collaborator.errorMessages?.role"
              dense
              outlined />
          </v-col>

          <v-col cols="3" md="1" sm="3" class="d-flex align-center">
            <v-btn icon small color="error" @click="removeCollaboratorRow(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>

    <div class="d-flex justify-center mt-4">
      <v-btn text color="primary" @click="addNewCollaboratorRow">
        <v-icon left>mdi-plus</v-icon>
        Novo colaborador
      </v-btn>
    </div>
  </v-form>
</template>

<script>
import { user, eventCollaborators } from '@/store';

export default {
  props: {
    eventId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      isFormValid: true,
      collaborators: [],
    };
  },

  computed: {
    $roles() {
      return user.$roleList.map((role) => ({
        text: role.name,
        value: role.id,
      }));
    },
  },

  watch: {
    collaborators: {
      deep: true,
      handler(newVal) {
        this.$emit('count-changed', newVal.length);
      },
    },
  },

  created() {
    this.resetForm();
  },

  methods: {
    getEmptyCollaborator() {
      return {
        email: '',
        role: null,
        errors: {},
        errorMessages: {},
      };
    },

    addNewCollaboratorRow() {
      this.collaborators.push(this.getEmptyCollaborator());
    },

    removeCollaboratorRow(index) {
      this.collaborators.splice(index, 1);
    },

    resetForm() {
      this.collaborators = [this.getEmptyCollaborator()];
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    validateCollaborator(collaborator) {
      const errors = {};
      const errorMessages = {};

      if (!collaborator.email) {
        errors.email = true;
        errorMessages.email = 'E-mail é obrigatório';
      } else if (!/.+@.+\..+/.test(collaborator.email)) {
        errors.email = true;
        errorMessages.email = 'E-mail inválido';
      }

      if (!collaborator.role) {
        errors.role = true;
        errorMessages.role = 'Função é obrigatória';
      }

      return { errors, errorMessages, isValid: Object.keys(errors).length === 0 };
    },

    async handleSubmit() {
      let isValid = true;

      // Validate all collaborators
      this.collaborators.forEach((collaborator) => {
        const validation = this.validateCollaborator(collaborator);
        this.$set(collaborator, 'errors', validation.errors);
        this.$set(collaborator, 'errorMessages', validation.errorMessages);
        if (!validation.isValid) {
          isValid = false;
        }
      });

      if (!isValid) {
        return { success: false };
      }

      try {
        // Add collaborators
        const collaboratorPayload = this.collaborators.map((collab) => ({
          email: collab.email,
          role: collab.role,
        }));
        
        const result = await eventCollaborators.addCollaborators({
          eventId: this.eventId,
          collaborators: collaboratorPayload,
        });
        
        if (!result.success && result.invalidEmails && result.invalidEmails.length > 0) {
          // Mark emails that don't exist in the system with errors
          this.collaborators.forEach((collaborator) => {
            if (result.invalidEmails.includes(collaborator.email)) {
              this.$set(collaborator, 'errors', { ...collaborator.errors, email: true });
              this.$set(collaborator, 'errorMessages', { 
                ...collaborator.errorMessages, 
                email: 'Usuário com este e-mail não encontrado no sistema'
              });
            }
          });
          
          return { success: false };
        }
        
        return { success: result.success };
        
      } catch (error) {
        console.error('Erro ao salvar colaborador:', error);
        return { success: false };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.collaborator-form-row {
  padding: 16px;
  margin: 8px 0;
  border-radius: 8px;
  background-color: var(--tertiary);

  &:not(:last-child) {
    border-bottom: 1px solid var(--grey-lighter);
    margin-bottom: 8px;
  }
}

@media (max-width: 600px) {
  .collaborator-form-row {
    padding: 12px;
    margin: 4px 0;
  }
}
</style>
