<template>
  <v-dialog
    :value="show"
    max-width="800px"
    persistent
    :fullscreen="isMobile"
    @input="$emit('update:show', $event)">
    <v-card :tile="isMobile" class="form-card">
      <v-card-title class="d-flex justify-space-between align-center form-header">
        <h3>{{ modalTitle }}</h3>
        <v-btn icon :disabled="isSaving" @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        Colaborador é outro produtor de evento com quem você pode compartilhar um evento.
      </v-card-subtitle>

      <v-card-text class="form-content">
        <v-form v-if="show" ref="form" v-model="isFormValid">
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
                    :rules="validationRules.email"
                    dense
                    outlined />
                </v-col>

                <v-col cols="9" md="5" sm="9">
                  <v-select
                    v-model="collaborator.role"
                    :items="roles"
                    label="Papel"
                    placeholder="Selecione o papel"
                    required
                    hide-details="auto"
                    :rules="validationRules.role"
                    dense
                    outlined />
                </v-col>

                <v-col cols="3" md="1" sm="3" class="d-flex align-center">
                  <v-btn icon small color="error" @click="removecollaboratorRow(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-form>

        <div class="d-flex justify-center mt-4 mb-6">
          <v-btn text color="primary" :disabled="isSaving" @click="addNewcollaboratorRow">
            <v-icon left>mdi-plus</v-icon>
            Novo colaborador
          </v-btn>
        </div>
      </v-card-text>

      <div :class="['form-actions', { 'form-actions--mobile': isMobile }]">
        <div class="d-flex align-center justify-space-between py-4 px-4 w-100">
          <DefaultButton
            text="Cancelar"
            outlined
            :disabled="isSaving"
            @click="closeModal" />

          <DefaultButton
            text="Adicionar"
            :is-loading="isSaving"
            :disabled="(isSaving || !isFormValid) && !collaborators.length"
            @click="savecollaborator" />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      isSaving: false,
      isFormValid: true,
      collaborators: [],
      roles: [
        { text: 'Administrador', value: 'admin' },
        { text: 'Editor', value: 'editor' },
        { text: 'Visualizador', value: 'viewer' },
      ],
      validationRules: {
        email: [
          (v) => !!v || 'E-mail é obrigatório',
          (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
        ],
        role: [(v) => !!v || 'Papel é obrigatório'],
      },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    modalTitle() {
      return `Novos colaboradores: ${this.collaborators.length}`;
    },
  },

  created() {
    this.resetForm();
  },

  methods: {
    getEmptycollaborator() {
      return {
        email: '',
        role: null,
      };
    },

    addNewcollaboratorRow() {
      this.collaborators.push(this.getEmptycollaborator());
    },

    removecollaboratorRow(index) {
      this.collaborators.splice(index, 1);
    },

    closeModal() {
      this.$emit('update:show', false);
      this.resetForm();
    },

    resetForm() {
      this.collaborators = [this.getEmptycollaborator()];
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
        this.$refs.form.reset();
      }
    },

    savecollaborator() {
      if (!this.$refs.form.validate()) return;

      try {
        this.isSaving = true;
        // TODO: Implementar a lógica de salvar o collaborator
        this.$emit('save', this.collaborators);
        this.closeModal();
      } catch (error) {
        console.error('Erro ao salvar collaborator:', error);
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  flex-shrink: 0;
  border-bottom: 1px solid var(--grey-lighter);
}

.form-content {
  flex-grow: 1;
  overflow-y: auto;
}

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

.form-actions {
  border-top: 1px solid var(--grey-lighter);
  background: white;
}

/* Estilos específicos para mobile */
.form-actions--mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

@media (max-width: 600px) {
  .form-card {
    height: 100vh;
  }

  .form-content {
    padding-bottom: 100px !important;
  }

  .collaborator-form-row {
    padding: 12px;
    margin: 4px 0;
  }

  .form-actions--mobile {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
