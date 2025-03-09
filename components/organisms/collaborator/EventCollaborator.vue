<template>
  <div>

    <template v-if="showEmptyState">
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
          <div class="template-title">Colaboradores</div>
          <DefaultButton text="Adicionar" @click="handleShowModal" />
        </div>
      </v-col>

      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="collaborators"
          :loading="isLoading"
          :server-items-length="meta.total"
          :options.sync="options"
          :footer-props="{
            itemsPerPageOptions: [10, 25, 50],
            itemsPerPageText: 'Colaboradores por página',
            pageText: '{0}-{1} de {2}',
          }"
          :no-data-text="'Nenhum colaborador encontrado'"
          :no-results-text="'Nenhum colaborador encontrado'"
          :loading-text="'Carregando...'"
          @update:options="handleTableUpdate"
          >

          <!-- Slot para filtros -->
          <template #top>
            <v-toolbar flat>
              <v-row>
                <v-col cols="6">
                  <!-- Campo de busca -->
                  <v-text-field
                    v-model="filters.search"
                    label="Buscar por nome ou email"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details="auto"
                    class="mr-4"
                    @input="handleFiltersChange" />
                </v-col>
              </v-row>
            </v-toolbar>
          </template>

          <template #[`item.name`]="{ item }">
            {{ item.user.people.first_name }} {{ item.user.people.last_name }}
          </template>

          <template #[`item.email`]="{ item }">
            {{ item.user.email }}
          </template>

          <template #[`item.role`]="{ item }">
            {{ item?.role?.name }}
          </template>

          <template #[`item.actions`]="{ item }">
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
      @update:show="showDialog = $event"
      @close="handleCloseModal"
      @added="handleAddedCollaborator" />

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
import { toast, eventCollaborators } from '@/store';

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
        { text: 'Função', value: 'role', sortable: true, width: '20%' },
        {
          text: 'Ações',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '10%',
        },
      ],
      filters: {
        search: '',
      },
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      currentQuery: null,
      searchTimeout: null,
      isClearingFilters: false,
    };
  },

  computed: {

    showEmptyState() {
      return !this.collaborators.length && this.activeFiltersCount === 0 && !this.isClearingFilters && !this.isLoading;
    },

    activeFiltersCount() {
      let count = 0;
      if (this.filters.search) count++;
      return count;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    meta() {
      return eventCollaborators.$meta;
    },
  },

  watch: {
    options: {
      handler() {
        this.loadItems();
      },
      deep: true,
    },
  },

  mounted() {
    this.loadItems();
  },

  methods: {

    handleAddedCollaborator() {
      this.handleCloseModal();
      this.loadItems(true);
    },

    buildQueryParams() {
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      
      const sort = sortBy.length
        ? sortBy.map((field, index) => (sortDesc[index] ? '-' : '') + field).join(',')
        : '-created_at';

      return {
        eventId: this.$route.params.id,
        page,
        limit: itemsPerPage,
        sort,
        search: this.filters.search || undefined,
      };
    },

    async loadItems(force = false) {
      try {
        const query = this.buildQueryParams();
        if (this.isQueryDifferent(query, force)) {
          this.isLoading = true;
          await eventCollaborators.fetchCollaborators(query);
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
      } finally {
        this.isLoading = false;
      }
    },

    isQueryDifferent(newQuery, force = false) {
      // Se forceUpdate está ativo ou não há query atual, permite a atualização
      if (force || !this.currentQuery) {
        this.currentQuery = JSON.stringify(newQuery);
        return true;
      }

      const stringifiedNewQuery = JSON.stringify(newQuery);
      if (this.currentQuery !== stringifiedNewQuery) {
        this.currentQuery = stringifiedNewQuery;
        return true;
      }

      return false;
    },


    handleTableUpdate(options) {
      this.options = options;
    },

    handleShowModal() {
      this.showDialog = true;
    },

    handleCloseModal() {
      this.showDialog = false;
      this.selectedCollaborator = null;
    },

    handleDeleteCollaborator(collaborator) {
      this.selectedCollaborator = collaborator;
      this.showConfirmDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedCollaborator) return;

      try {
        this.isLoading = true;
        
        const success = await eventCollaborators.deleteCollaborator({
          id: this.selectedCollaborator.id,
          eventId: this.eventId,
        });

        if (success) {
          toast.setToast({
            text: `Colaborador "${this.selectedCollaborator.user.email}" removido com sucesso!`,
            type: 'success',
            time: 5000,
          });
          
          this.loadItems(true);
        }
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

    handleFiltersChange() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.isClearingFilters = true;
      this.searchTimeout = setTimeout(() => {
        this.options.page = 1;
        this.isClearingFilters = false;
        this.loadItems();
      }, 500);
    },

  },
};
</script>
