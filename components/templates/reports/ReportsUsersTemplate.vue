<template>
  <div class="reports-users">
    <v-row>
      <v-col cols="12">
        <div>
          <h3 class="template-title">Usuários</h3>
        </div>
      </v-col>

      <v-col cols="12" md="12" sm="12">
        <v-tabs v-model="activeTab" background-color="white" grow class="custom-tabs">
          <v-tab>
            <v-icon left>mdi-account</v-icon>
            Clientes
          </v-tab>
          <v-tab>
            <v-icon left>mdi-account-group</v-icon>
            Produtores
          </v-tab>
          <v-tab>
            <v-icon left>mdi-account-tie</v-icon>
            Equipe
          </v-tab>
        </v-tabs>

        <!-- Componentes de cada aba -->
        <ReportsClientsTable v-if="activeTab === 0" />
        <ReportsOrganizersTable v-if="activeTab === 1" />
        <ReportsTeamTable v-if="activeTab === 2" />
      </v-col>
    </v-row>

    <!-- Modal de pedidos do usuário -->
    <UserOrdersModal :show.sync="showUserOrders" :user-id="selectedUserId" :user-name="selectedUserName" />

    <!-- Modal de edição do usuário -->
    <EditUserModal v-if="showEditUserModal" :show.sync="showEditUserModal" :user="selectedUser"
      @saved="handleUserSaved" />

  </div>
</template>

<script>
import { formatDateToCustomString } from '@/utils/formatters';

export default {

  data() {
    return {
      headers: [
        { text: 'E-mail', value: 'email', sortable: true },
        { text: 'Nome', value: 'full_name', sortable: false },
        { text: 'Tipo de Pessoa', value: 'person_type', sortable: false },
        { text: 'Verificado', value: 'account_verified', sortable: false },
        { text: 'Docs. Enviados', value: 'document_sent', sortable: false },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      users: [],
      totalUsers: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
      search: '',
      currentQuery: null,
      searchTimeout: null,
      isLoadingInternal: false,
      showUserOrders: false,
      showEditUserModal: false,
      selectedUserId: null,
      selectedUserName: '',
      selectedUser: null,
      activeTab: 0,
    };
  },

  computed: {
    isLoading() {
      return this.isLoadingInternal || this.$store.getters['loading/$isLoading'];
    },
    isAdmin() {
      const role = this.$auth.user?.role;
      return role && role.name === 'Admin';
    },
  },

  mounted() {
    this.loadUsers();
  },

  methods: {
    formatDateToCustomString,

    getDocumentSent(user) {

      if (!user?.attachments) return false;

      if (user?.people?.person_type === 'PF') {
        return user.attachments.some(attachment => attachment.type === 'document_cnh') ||
          (user.attachments.some(attachment => attachment.type === 'document_rg_front') && user.attachments.some(attachment => attachment.type === 'document_rg_back'));
      } else {
        return user.attachments.some(attachment => attachment.type === 'document_cnpj' || attachment.type === 'document_social_contract');
      }
    },

    getPersonTypeColor(personType) {
      switch (personType) {
        case 'PF':
          return 'primary';
        case 'PJ':
          return 'secondary';
        default:
          return 'grey';
      }
    },

    buildQueryParams() {
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;

      return {
        page,
        limit: itemsPerPage,
        search: this.search || undefined,
        sortBy: sortBy.length ? sortBy : ['created_at'],
        sortDesc: sortDesc.length ? sortDesc : [true],
        preloads: ['people:address', 'attachments'],
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

          const response = await this.$store.dispatch('user/getUsers', query);

          if (response && response.data && response.data !== 'Error') {
            this.users = response.data;
            this.totalUsers = response.total;
          } else {
            this.users = [];
            this.totalUsers = 0;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
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

    handleSearchChange() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.options.page = 1;
        this.loadUsers(true);
      }, 500);
    },

    viewOrders(user) {
      this.selectedUserId = user.id;
      this.selectedUserName = `${user.people?.first_name} ${user.people?.last_name}`;
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
  },
};
</script>

<style scoped>
.reports-users {
  padding: 16px 0;
}

.custom-tabs {
  margin-bottom: 16px;
}

:deep(.theme--light.v-tabs > .v-tabs-bar) {
  background-color: var(--tertiary) !important;
}
</style>