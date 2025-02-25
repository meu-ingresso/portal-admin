<template>
  <div>
    <template v-if="!collaborators.length">
      <EmptyState
        title="Sem colaboradores"
        subtitle="Após o convite, os colaboradores vão aparecer aqui">
        <template #action>
          <DefaultButton
            text="Adicionar colaborador"
            icon="mdi-plus"
            class="mt-6"
            @click="handleShowModal" />
        </template>
      </EmptyState>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <div class="d-flex justify-space-between">
          <div class="event-collaborators-title">Colaboradores</div>
          <DefaultButton text="Adicionar" @click="handleShowModal" />
        </div>
      </v-col>

      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="collaborators"
          :footer-props="{
            itemsPerPageOptions: [10, 25, 50],
            itemsPerPageText: 'Colaboradores por página',
            pageText: '{0}-{1} de {2}',
          }"
          :no-data-text="'Nenhum colaborador encontrado'"
          :no-results-text="'Nenhum colaborador encontrado'"
          :loading-text="'Carregando...'">
          <template #[`item.name`]="{ item }">
            {{ item.user.people.first_name }} {{ item.user.people.last_name }}
          </template>

          <template #[`item.email`]="{ item }">
            {{ item.user.email }}
          </template>

          <template #[`item.role`]="{ item }">
            {{ item.role.name }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  class="mr-2"
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleEditCollaborator(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleDeleteCollaborator(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Remover</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <CollaboratorModal
      :show="showDialog"
      :event-id="eventId"
      :collaborator="selectedCollaborator"
      @update:show="showDialog = $event"
      @close="handleCloseModal"
      @added="$emit('added')"
      @updated="$emit('updated')" />

    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Remover Colaborador"
      :message="`Deseja remover o colaborador ${selectedCollaborator?.user?.email}?`"
      confirm-text="Excluir"
      :loading="isLoading"
      @confirm="confirmDelete" />
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { toast, user } from '@/store';

export default {
  name: 'EventCollaborator',
  props: {
    eventId: {
      type: String,
      required: true,
    },
    collaborators: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showDialog: false,
      showConfirmDialog: false,
      isLoading: false,
      selectedCollaborator: null,
      headers: [
        { text: 'Nome', value: 'name', sortable: true, width: '35%' },
        { text: 'Email', value: 'email', sortable: true, width: '35%' },
        { text: 'Papel', value: 'role', sortable: true, width: '20%' },
        {
          text: 'Ações',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '10%',
        },
      ],
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    await user.getRoles();
  },

  methods: {
    handleShowModal() {
      this.showDialog = true;
    },

    handleCloseModal() {
      this.showDialog = false;
      this.selectedCollaborator = null;
    },

    handleEditCollaborator(collaborator) {
      this.selectedCollaborator = collaborator;
      this.showDialog = true;
    },

    handleDeleteCollaborator(collaborator) {
      this.selectedCollaborator = collaborator;
      this.showConfirmDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedCollaborator) return;

      try {
        this.isLoading = true;
        await this.$emit('deleted', this.selectedCollaborator.id);

        toast.setToast({
          text: `Colaborador "${this.selectedCollaborator.user.email}" removido com sucesso!`,
          type: 'success',
          time: 5000,
        });
      } catch (error) {
        console.error('Erro ao remover colaborador:', error);
        toast.setToast({
          text: `Falha ao remover colaborador. Tente novamente.`,
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
        this.showConfirmDialog = false;
        this.selectedCollaborator = null;
      }
    },
  },
};
</script>

<style scoped>
.event-collaborators-title {
  font-weight: 600;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
  font-size: 26px;
}
</style>
