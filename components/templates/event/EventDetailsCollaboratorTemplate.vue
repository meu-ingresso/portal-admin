<template>
  <div v-if="getEvent" class="event-details-collaborators">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <template v-if="!hasCollaborators">
        <EmptyState
          title="Ainda não há Colaboradores"
          subtitle="Uma vez adicionados, seus colaboradores aparecerão aqui"
          icon="mdi-account-group">
          <template #action>
            <DefaultButton
              text="Adicionar colaborador"
              icon="mdi-plus"
              class="mt-6"
              @click="openAddCollaboratorModal" />
          </template>
        </EmptyState>
      </template>
    </div>

    <AddCollaboratorModal
      :show.sync="showAddCollaboratorModal"
      @save="handleSaveCollaborator" />
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGeneralInfo, toast } from '@/store';

export default {
  data() {
    return {
      hasCollaborators: false,
      showAddCollaboratorModal: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },
  },

  methods: {
    openAddCollaboratorModal() {
      this.showAddCollaboratorModal = true;
    },

    async handleSaveCollaborator(collaborators) {
      try {
        // TODO: Implementar a lógica de salvar o collaborator
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulação de chamada à API
        console.log('Collaborators data:', collaborators);
        toast.setToast({
          text: `${collaborators.length} colaborador${
            collaborators.length > 1 ? 'es' : ''
          } adicionado${collaborators.length > 1 ? 's' : ''} com sucesso!`,
          type: 'success',
        });
      } catch (error) {
        toast.setToast({
          text: 'Erro ao adicionar colaborador',
          type: 'error',
        });
      }
    },
  },
};
</script>

<style scoped>
.event-details-collaborators {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
