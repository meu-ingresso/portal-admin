<template>
  <div class="reports-clients">
    <v-data-table :headers="headers" :items="users" :loading="isLoading" :server-items-length="totalUsers"
      :options.sync="options" :footer-props="{
        itemsPerPageOptions: [50, 100, 200],
        itemsPerPageText: 'Clientes por página',
        pageText: '{0}-{1} de {2}',
      }" :no-data-text="'Nenhum cliente encontrado'" :no-results-text="'Nenhum cliente encontrado'"
      :loading-text="'Carregando...'" class="elevation-1" @update:options="handleTableUpdate">
      <!-- Campo de busca e filtros -->
      <template #top>
        <v-toolbar flat>
          <v-row class="align-center">
            <v-col cols="6">
              <v-text-field v-model="filters.search" label="Buscar por nome ou email" prepend-inner-icon="mdi-magnify"
                clearable hide-details="auto" class="mr-4" @input="handleFilterChange" />
            </v-col>

            <v-col cols="6" class="d-flex justify-end align-center">
              <TableFilter :active-filters-count="activeFiltersCount" @clear-filters="clearFilters">
                <template #filter-content>
                  <v-row>
                    <!-- Filtro de data de cadastro -->
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="6">
                          <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field v-model="filters.startDate" label="Data inicial de cadastro" readonly
                                outlined dense v-bind="attrs" clearable hide-details="auto" v-on="on"
                                @click:clear="clearStartDate" />
                            </template>
                            <v-date-picker v-model="filters.startDate" no-title locale="pt-br"
                              @input="handleDateSelect('start')" />
                          </v-menu>
                        </v-col>
                        <v-col cols="6">
                          <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field v-model="filters.endDate" label="Data final de cadastro" readonly outlined
                                dense v-bind="attrs" clearable hide-details="auto" v-on="on"
                                @click:clear="clearEndDate" />
                            </template>
                            <v-date-picker v-model="filters.endDate" no-title locale="pt-br"
                              @input="handleDateSelect('end')" />
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- Filtro de status de verificação -->
                    <v-col cols="6">
                      <v-select v-model="filters.verifiedStatus" :items="verifiedStatusOptions"
                        label="Status de Verificação" outlined dense clearable hide-details="auto"
                        @change="handleFilterChange" />
                    </v-col>
                  </v-row>
                </template>
              </TableFilter>
            </v-col>
          </v-row>
        </v-toolbar>

        <!-- Chips de filtros ativos -->
        <v-sheet v-if="activeFiltersCount" class="px-4 py-2 chip-filters">
          <v-chip v-if="filters.startDate || filters.endDate" class="mr-2 chip-filter" close dark color="primary"
            @click:close="clearDates">
            <v-icon left small>mdi-calendar-range</v-icon>
            Período de cadastro: {{ formatDateRange }}
          </v-chip>

          <v-chip v-if="filters.verifiedStatus" class="mr-2 chip-filter" close dark color="primary"
            @click:close="clearVerifiedStatus">
            <v-icon left small>mdi-check-circle</v-icon>
            Status: {{ getVerifiedStatusText(filters.verifiedStatus) }}
          </v-chip>
        </v-sheet>
      </template>

      <!-- Nome do cliente -->
      <template #[`item.full_name`]="{ item }">
        <span v-if="item.people?.person_type === 'PF'">
          {{ item.people?.first_name }} {{ item.people?.last_name }}
        </span>
        <span v-else>
          {{ item.people?.social_name }}
        </span>
      </template>


      <!-- Status de verificação -->
      <template #[`item.account_verified`]="{ item }">
        <v-icon :color="item.account_verified ? 'primary' : 'gray'">
          {{ item.account_verified ? 'mdi-check-bold' : 'mdi-close' }}
        </v-icon>
      </template>

      <!-- Ações -->
      <template #[`item.actions`]="{ item }">
        <ActionsMenu :show-edit="isAdmin" :show-delete="false" :show-duplicate="false" :show-activate-deactivate="true"
          :is-inactive="!!item.deleted_at" icon="mdi-dots-horizontal" @edit="editUser(item)"
          @view-orders="viewOrders(item)" @activate="activateUser(item)" @deactivate="deactivateUser(item)" />
      </template>
    </v-data-table>

    <!-- Modal de pedidos do usuário -->
    <UserOrdersModal :show.sync="showUserOrders" :user-id="selectedUserId" :user-name="selectedUserName" />

    <!-- Modal de edição do usuário -->
    <EditUserModal v-if="showEditUserModal" :show.sync="showEditUserModal" :user="selectedUser"
      @saved="handleUserSaved" />

    <!-- Modal de confirmação -->
    <ConfirmDialog :loading="isLoading" :value="showConfirmDialog" :title="confirmDialogTitle"
      :message="confirmDialogMessage" :confirm-text="confirmDialogConfirmText" :cancel-text="confirmDialogCancelText"
      @confirm="handleConfirmAction" @cancel="handleCloseConfirmDialog" />
  </div>
</template>

<script>
import { CLIENT_ROLE } from '@/utils/permissions-config';

export default {
  data() {
    return {
      headers: [
        { text: 'Nome', value: 'full_name', sortable: false },
        { text: 'E-mail', value: 'email', sortable: true },
        { text: 'E-mail verificado', value: 'account_verified', sortable: false, align: 'center' },
        { text: 'Ações', value: 'actions', sortable: false, align: 'center' }
      ],
      users: [],
      totalUsers: 0,
      options: {
        page: 1,
        itemsPerPage: 50,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      filters: {
        search: '',
        startDate: '',
        endDate: '',
        verifiedStatus: '',
      },
      currentQuery: null,
      searchTimeout: null,
      isLoadingInternal: false,
      showUserOrders: false,
      showEditUserModal: false,
      selectedUserId: null,
      selectedUserName: '',
      selectedUser: null,
      startDateMenu: false,
      endDateMenu: false,
      verifiedStatusOptions: [
        { text: 'Verificado', value: 'verified' },
        { text: 'Não Verificado', value: 'not_verified' }
      ],
      showConfirmDialog: false,
      confirmDialogTitle: '',
      confirmDialogMessage: '',
      confirmDialogConfirmText: '',
      confirmDialogCancelText: 'Cancelar',
      confirmAction: null,
      userToUpdate: null,
    };
  },

  computed: {
    isLoading() {
      return this.isLoadingInternal || this.$store.getters['loading/$isLoading'];
    },
    isAdmin() {
      const role = this.$store.state.auth.user?.role;
      return role && role.name === 'Admin';
    },
    activeFiltersCount() {
      return Object.keys(this.filters).filter(key =>
        key !== 'search' && this.filters[key]
      ).length;
    },
    formatDateRange() {
      const { startDate, endDate } = this.filters;
      if (startDate && endDate) {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      }
      if (startDate) {
        return `A partir de ${this.formatDate(startDate)}`;
      }
      if (endDate) {
        return `Até ${this.formatDate(endDate)}`;
      }
      return '';
    },
  },

  mounted() {
    this.loadUsers();
  },

  methods: {

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    },


    getVerifiedStatusText(status) {
      return this.verifiedStatusOptions.find(opt => opt.value === status)?.text || status;
    },

    buildQueryParams() {
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      const { search, startDate, endDate, verifiedStatus } = this.filters;

      return {
        page,
        limit: itemsPerPage,
        search: search || undefined,
        sortBy: sortBy.length ? sortBy : ['created_at'],
        sortDesc: sortDesc.length ? sortDesc : [true],
        preloads: ['people:address', 'attachments', 'role'],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        verifiedStatus: verifiedStatus || undefined,
        roleFilter: CLIENT_ROLE
      };
    },

    isQueryDifferent(newQuery, force = false) {
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

    async loadUsers(force = false) {
      try {
        const query = this.buildQueryParams();

        if (this.isQueryDifferent(query, force)) {
          this.isLoadingInternal = true;

          const response = await this.$store.dispatch('user/getUsersByRole', query);

          if (response && response.data && response.data !== 'Error') {
            this.users = response.data;
            this.totalUsers = response.meta.total;
          } else {
            this.users = [];
            this.totalUsers = 0;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        this.users = [];
        this.totalUsers = 0;
      } finally {
        this.isLoadingInternal = false;
      }
    },

    handleTableUpdate(options) {
      if (!this.isLoading) {
        this.options = options;
        this.loadUsers();
      }
    },

    handleFilterChange() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.options.page = 1;
        this.loadUsers(true);
      }, 500);
    },

    handleDateSelect(type) {
      if (type === 'start') {
        this.startDateMenu = false;
      } else {
        this.endDateMenu = false;
      }
      this.handleFilterChange();
    },

    clearFilters() {
      this.filters = {
        search: '',
        startDate: '',
        endDate: '',
        verifiedStatus: '',
      };
      this.loadUsers(true);
    },

    clearDates() {
      this.filters.startDate = '';
      this.filters.endDate = '';
      this.handleFilterChange();
    },

    clearStartDate() {
      this.filters.startDate = '';
      this.handleFilterChange();
    },

    clearEndDate() {
      this.filters.endDate = '';
      this.handleFilterChange();
    },

    clearVerifiedStatus() {
      this.filters.verifiedStatus = '';
      this.handleFilterChange();
    },

    viewOrders(user) {
      this.selectedUserId = user.id;
      this.selectedUserName = user.people?.person_type === 'PF'
        ? `${user.people?.first_name} ${user.people?.last_name}`
        : user.people?.social_name;
      this.showUserOrders = true;
    },

    editUser(user) {
      this.selectedUser = user;
      this.showEditUserModal = true;
    },

    async handleUserSaved() {
      this.showEditUserModal = false;
      await this.loadUsers(true);
    },

    deactivateUser(userItem) {
      this.userToUpdate = userItem;
      this.confirmDialogTitle = 'Inativar Usuário';
      this.confirmDialogMessage = `Tem certeza que deseja inativar o usuário ${userItem.people?.first_name || userItem.email}?`;
      this.confirmDialogConfirmText = 'Inativar';
      this.confirmAction = this.performDeactivation;
      this.showConfirmDialog = true;
    },

    activateUser(userItem) {
      this.userToUpdate = userItem;
      this.confirmDialogTitle = 'Ativar Usuário';
      this.confirmDialogMessage = `Tem certeza que deseja ativar o usuário ${userItem.people?.first_name || userItem.email}?`;
      this.confirmDialogConfirmText = 'Ativar';
      this.confirmAction = this.performActivation;
      this.showConfirmDialog = true;
    },

    handleCloseConfirmDialog() {
      this.showConfirmDialog = false;
      this.userToUpdate = null;
      this.confirmAction = null;
    },

    async handleConfirmAction() {
      if (this.confirmAction) {
        await this.confirmAction();
        this.showConfirmDialog = false;
        this.userToUpdate = null;
        this.confirmAction = null;
        this.loadUsers(true);
      }
    },

    async performDeactivation() {
      try {
        if (this.userToUpdate) {
          await this.$store.dispatch('user/deleteUser', { user_id: this.userToUpdate.id });
          this.$store.dispatch('toast/setToast', {
            text: 'Usuário inativado com sucesso',
            type: 'success',
            time: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao inativar usuário:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao inativar usuário',
          type: 'error',
          time: 5000,
        });
      }
    },

    async performActivation() {
      try {
        if (this.userToUpdate) {
          await this.$store.dispatch('user/updateUser', {
            id: this.userToUpdate.id,
            deleted_at: null
          });
          this.$store.dispatch('toast/setToast', {
            text: 'Usuário ativado com sucesso',
            type: 'success',
            time: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao ativar usuário:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao ativar usuário',
          type: 'error',
          time: 5000,
        });
      }
    },
  },
};
</script>

<style scoped>
.reports-clients {
  padding: 16px 0;
}

.chip-filters {
  background-color: transparent !important;
}
</style>