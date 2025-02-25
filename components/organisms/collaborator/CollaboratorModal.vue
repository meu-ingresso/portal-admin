<template>
  <v-dialog
    :value="show"
    max-width="900px"
    persistent
    :fullscreen="isMobile"
    @input="$emit('update:show', $event)">
    <v-card :tile="isMobile" class="form-card">
      <v-card-title class="d-flex justify-space-between align-center form-header">
        <h3>{{ isEditing ? 'Editar Colaborador' : getAddTitle }}</h3>
        <v-btn icon :disabled="isLoading" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-subtitle v-if="!isEditing">
        Colaborador é outro produtor de evento com quem você pode compartilhar um evento.
      </v-card-subtitle>

      <v-card-text class="form-content px-4">
        <CollaboratorForm
          ref="collaboratorForm"
          :event-id="eventId"
          :collaborator="collaborator"
          :edit-mode="isEditing"
          @count-changed="collaboratorCount = $event" />
      </v-card-text>

      <div :class="['form-actions', { 'form-actions--mobile': isMobile }]">
        <div class="d-flex align-center justify-space-between py-4 px-4 w-100">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isLoading"
            @click="handleClose" />

          <DefaultButton
            :text="isEditing ? 'Salvar' : 'Adicionar'"
            :is-loading="isLoading"
            :disabled="isLoading || collaboratorCount === 0"
            @click="handleSubmit" />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { toast } from '@/store';

export default {
  name: 'CollaboratorModal',

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    collaborator: {
      type: Object,
      default: null,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      isLoading: false,
      collaboratorCount: 1,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    isEditing() {
      return !!this.collaborator;
    },
    getAddTitle() {
      return `Adicionar ${this.collaboratorCount} ${
        this.collaboratorCount === 1 ? 'Colaborador' : 'Colaboradores'
      }`;
    },
  },

  methods: {
    handleClose() {
      if (!this.isLoading) {
        this.$emit('update:show', false);
        this.$emit('close');
      }
    },

    async handleSubmit() {
      try {
        this.isLoading = true;

        const collaboratorForm = this.$refs.collaboratorForm;

        const { success } = await collaboratorForm.handleSubmit();

        if (success) {
          this.handleClose();
          toast.setToast({
            text: `Colaborador ${
              this.isEditing ? 'atualizado' : 'adicionado'
            } com sucesso!`,
            type: 'success',
            time: 5000,
          });
          this.$emit(this.isEditing ? 'updated' : 'added');
        }
      } catch (error) {
        console.error('Erro ao salvar colaborador:', error);
        toast.setToast({
          text: `Erro ao ${this.isEditing ? 'atualizar' : 'adicionar'} colaborador`,
          type: 'error',
        });
      } finally {
        this.isLoading = false;
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

  .form-actions--mobile {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
