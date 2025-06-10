<template>
  <div class="reports-organizers">
    <v-data-table :headers="headers" :items="users" :loading="isLoading" :server-items-length="totalUsers"
      :options.sync="options" :footer-props="{
        itemsPerPageOptions: [50, 100, 200],
        itemsPerPageText: 'Produtores por página',
        pageText: '{0}-{1} de {2}',
      }" :no-data-text="'Nenhum produtor encontrado'" :no-results-text="'Nenhum produtor encontrado'"
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

                    <!-- Filtro de Função 
                    <v-col cols="6">
                      <v-select
                        v-model="filters.role"
                        :items="roleOptions"
                        label="Função"
                        outlined
                        dense
                        clearable
                        hide-details="auto"
                        @change="handleFilterChange" />
                    </v-col>
                    -->

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

          <v-chip v-if="filters.role" class="mr-2 chip-filter" close dark color="primary" @click:close="clearRole">
            <v-icon left small>mdi-badge-account</v-icon>
            Função: {{ filters.role }}
          </v-chip>

          <v-chip v-if="filters.verifiedStatus" class="mr-2 chip-filter" close dark color="primary"
            @click:close="clearVerifiedStatus">
            <v-icon left small>mdi-check-circle</v-icon>
            Status: {{ getVerifiedStatusText(filters.verifiedStatus) }}
          </v-chip>
        </v-sheet>
      </template>

      <!-- Tipo de pessoa dos dados fiscais -->
      <template #[`item.fiscal_person_type`]="{ item }">
        <v-chip color="primary">
          {{ item.fiscal_info?.person_type }}
        </v-chip>
      </template>

      <!-- Nome do organizador a partir dos dados fiscais -->
      <template #[`item.fiscal_name`]="{ item }">
        <span v-if="item.fiscal_info?.person_type === 'PF'">
          {{ item.fiscal_info?.first_name }} {{ item.fiscal_info?.last_name }}
        </span>
        <span v-else>
          {{ item.fiscal_info?.company_name }}
        </span>
      </template>

      <!-- Função -->
      <template #[`item.role_name`]="{ item }">
        <v-chip color="secondary">
          {{ item.role?.name }}
        </v-chip>
      </template>

      <!-- Status de verificação -->
      <template #[`item.account_verified`]="{ item }">
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div class="menu-activator" v-bind="attrs" v-on="on">
              <v-icon :color="getVerificationColor(item)">
                {{ getVerificationIcon(item) }}
              </v-icon>
            </div>
          </template>
          <v-card class="menu-popup pa-4" max-width="300">
            <template v-if="item.rejection_reason">
              <div class="menu-header mb-2">Conta Rejeitada</div>
              <div class="rejection-reason-text">{{ item.rejection_reason }}</div>
            </template>
            <template v-else>
              <div class="menu-header mb-2">Status da Verificação:</div>
              <span>{{ getVerificationStatus(item) }}</span>
            </template>
          </v-card>
        </v-menu>
      </template>

      <!-- Documentos enviados -->
      <template #[`item.document_sent`]="{ item }">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" :color="getDocumentSent(item) ? 'primary' : 'grey'" v-on="on">
              {{ getDocumentSent(item) ? 'mdi-check-bold' : 'mdi-close' }}
            </v-icon>
          </template>
          <span>{{ getDocumentTooltip(item) }}</span>
        </v-tooltip>
      </template>

      <!-- Ações -->
      <template #[`item.actions`]="{ item }">
        <ActionsMenu :show-edit="isAdmin" :show-delete="false" :show-duplicate="false" :show-activate-deactivate="true"
          :show-verify="isAdmin && !item.account_verified && getDocumentSent(item)"
          :show-reject="isAdmin && !item.account_verified && getDocumentSent(item)" :is-inactive="!!item.deleted_at"
          icon="mdi-dots-horizontal" @edit="editUser(item)" @view-orders="viewOrders(item)"
          @activate="activateUser(item)" @deactivate="deactivateUser(item)" @verify="verifyUser(item)"
          @reject="rejectUser(item)" />
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

    <!-- Modal de rejeição -->
    <RejectUserModal :show.sync="showRejectModal" @confirm="handleRejectConfirm" @cancel="handleRejectCancel" />

    <!-- TODO: Modal para mostrar eventos do organizador -->
  </div>
</template>

<script>
import { EVENT_COLLABORATOR_ROLES, PRODUCER_ROLE } from '@/utils/permissions-config';

export default {

  data() {
    return {
      headers: [
        { text: 'Tipo', value: 'fiscal_person_type', sortable: false, align: 'center' },
        { text: 'Nome/Razão Social', value: 'fiscal_name', sortable: false },
        { text: 'E-mail', value: 'email', sortable: true },
        { text: 'Verificado', value: 'account_verified', sortable: false, align: 'center' },
        { text: 'Docs', value: 'document_sent', sortable: false, align: 'center' },
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
        role: '',
        verifiedStatus: '',
      },
      currentQuery: null,
      searchTimeout: null,
      isLoadingInternal: false,
      showUserOrders: false,
      showEditUserModal: false,
      showRejectModal: false,
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

    organizerRoles() {
      // return EVENT_COLLABORATOR_ROLES.map(role => role.name);
      return PRODUCER_ROLE;
    },

    roleOptions() {
      return EVENT_COLLABORATOR_ROLES.map(role => ({ text: role.name, value: role.name }));
    },

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

    getDocumentSent(user) {
      if (!user?.attachments) return false;

      if (user?.fiscal_info?.person_type === 'PF') {
        return user.attachments.some(attachment => attachment.type === 'document_cnh') ||
          (user.attachments.some(attachment => attachment.type === 'document_rg_front') &&
            user.attachments.some(attachment => attachment.type === 'document_rg_back'));
      } else {
        return user.attachments.some(attachment =>
          attachment.type === 'document_cnpj' ||
          attachment.type === 'document_social_contract'
        );
      }
    },

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
      const { search, startDate, endDate, role, verifiedStatus } = this.filters;


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
        roleFilter: role || this.organizerRoles,
        includeEventCount: true
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

    // TODO: Refatorar para usar o useUserStore
    mapUsersResponse(users) {
      try {

        if (!users) return [];

        return users.map(user => {
          const accountVerification = user.attachments.find(attachment => attachment.type === 'account_verification');
          const rejectionReason = user.attachments.find(attachment => attachment.type === 'rejection_reason');
          const fiscalInfo = user.attachments.find(attachment => attachment.name === 'fiscal_info');

          const parsedFiscalInfo = fiscalInfo ? JSON.parse(fiscalInfo.value) : null;

          return {
            ...user,
            account_verified: accountVerification?.value === 'verified',
            rejection_reason: rejectionReason?.value,
            fiscal_info: {
              person_type: parsedFiscalInfo?.personType || user.people?.person_type,
              first_name: parsedFiscalInfo?.firstName || user.people?.first_name,
              last_name: parsedFiscalInfo?.lastName || user.people?.last_name,
              company_name: parsedFiscalInfo?.companyName || user.people?.social_name,
              trade_name: parsedFiscalInfo?.tradeName || user.people?.social_reason,
            }
          };
        });
      } catch (error) {
        console.error('Erro ao mapear usuários:', error);
        return users;
      }
    },

    async loadUsers(force = false) {
      try {
        const query = this.buildQueryParams();

        if (this.isQueryDifferent(query, force)) {
          this.isLoadingInternal = true;

          const response = await this.$store.dispatch('user/getUsersByRole', query);

          if (response && response.data && response.data !== 'Error') {
            this.users = this.mapUsersResponse(response.data);
            this.totalUsers = response.meta.total;
          } else {
            this.users = [];
            this.totalUsers = 0;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar organizadores:', error);
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
        role: '',
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

    clearRole() {
      this.filters.role = '';
      this.handleFilterChange();
    },

    clearVerifiedStatus() {
      this.filters.verifiedStatus = '';
      this.handleFilterChange();
    },

    viewOrders(user) {
      this.selectedUserId = user.id;
      this.selectedUserName = user.fiscal_info?.person_type === 'PF'
        ? `${user.fiscal_info?.first_name} ${user.fiscal_info?.last_name}`
        : user.fiscal_info?.company_name;
      this.showUserOrders = true;
    },

    editUser(user) {
      this.selectedUser = user;
      this.showEditUserModal = true;
    },

    handleUserSaved() {
      this.showEditUserModal = false;
      this.loadUsers(true);
    },

    deactivateUser(userItem) {
      this.userToUpdate = userItem;
      this.confirmDialogTitle = 'Inativar Organizador';
      this.confirmDialogMessage = `Tem certeza que deseja inativar o organizador ${userItem.fiscal_info?.first_name || userItem.email}?`;
      this.confirmDialogConfirmText = 'Inativar';
      this.confirmAction = this.performDeactivation;
      this.showConfirmDialog = true;
    },

    activateUser(userItem) {
      this.userToUpdate = userItem;
      this.confirmDialogTitle = 'Ativar Organizador';
      this.confirmDialogMessage = `Tem certeza que deseja ativar o organizador ${userItem.fiscal_info?.first_name || userItem.email}?`;
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
            text: 'Organizador inativado com sucesso',
            type: 'success',
            time: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao inativar organizador:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao inativar organizador',
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
            text: 'Organizador ativado com sucesso',
            type: 'success',
            time: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao ativar organizador:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao ativar organizador',
          type: 'error',
          time: 5000,
        });
      }
    },

    verifyUser(userItem) {
      this.userToUpdate = userItem;
      this.confirmDialogTitle = 'Verificar Produtor';
      this.confirmDialogMessage = `Tem certeza que deseja verificar o produtor ${userItem.fiscal_info?.first_name || userItem.email}?`;
      this.confirmDialogConfirmText = 'Verificar';
      this.confirmAction = this.performVerification;
      this.showConfirmDialog = true;
    },

    rejectUser(userItem) {
      this.userToUpdate = userItem;
      this.showRejectModal = true;
    },

    async performVerification() {
      try {
        if (this.userToUpdate) {
          const response = await this.$store.dispatch('userDocuments/verifyAccount', this.userToUpdate.id);

          if (response) {
            this.$store.dispatch('toast/setToast', {
              text: 'Produtor verificado com sucesso',
              type: 'success',
              time: 5000,
            });

            this.loadUsers(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar produtor:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao verificar produtor',
          type: 'error',
          time: 5000,
        });
      }
    },

    handleRejectCancel() {
      this.showRejectModal = false;
      this.userToUpdate = null;
    },

    async handleRejectConfirm(rejectionReason) {
      try {
        if (this.userToUpdate) {
          const response = await this.$store.dispatch('userDocuments/rejectAccount', {
            userId: this.userToUpdate.id,
            rejectionReason,
          });

          if (response) {

            this.$store.dispatch('toast/setToast', {
              text: 'Produtor rejeitado com sucesso',
              type: 'success',
              time: 5000,
            });

            this.loadUsers(true);
          }
        }
      } catch (error) {
        console.error('Erro ao rejeitar produtor:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao rejeitar produtor',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.showRejectModal = false;
        this.userToUpdate = null;
      }
    },

    getVerificationColor(item) {
      if (!item.account_verified && !item.rejection_reason) return 'grey';

      return item.account_verified ? 'primary' : item.rejection_reason ? 'error' : 'grey';
    },

    getVerificationIcon(item) {
      if (!item.account_verified && !item.rejection_reason) return 'mdi-help-circle-outline';

      return item.account_verified ? 'mdi-check-bold' : item.rejection_reason ? 'mdi-close' : 'mdi-help-circle-outline';
    },

    getVerificationStatus(item) {
      if (!item.account_verified) return 'Aguardando verificação';

      if (item.account_verified) {
        return 'Conta verificada';
      }

      return item.rejection_reason
        ? `Conta rejeitada: ${item.rejection_reason}`
        : 'Conta rejeitada';
    },

    getDocumentTooltip(item) {
      return this.getDocumentSent(item)
        ? 'Documentos enviados'
        : 'Documentos não enviados';
    },
  },
};
</script>

<style scoped>
.reports-organizers {
  padding: 16px 0;
}

.chip-filters {
  background-color: transparent !important;
}

.events-link {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

.events-link:hover {
  opacity: 0.8;
}

.menu-activator {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-activator:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-popup {
  border-radius: 8px;
}

.menu-header {
  font-weight: 600;
  font-size: 14px;
  color: var(--black-text);
}

.menu-content {
  font-size: 14px;
}

.rejection-reason-label {
  font-weight: 500;
  color: var(--error);
}

.rejection-reason-text {
  color: var(--error);
  opacity: 0.9;
  line-height: 1.4;
  word-break: break-word;
}
</style>