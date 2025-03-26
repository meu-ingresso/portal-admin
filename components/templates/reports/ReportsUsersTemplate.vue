<template>
  <div class="reports-users">
    <v-row>

      <v-col cols="12">
        <div>
          <h3 class="template-title">Usuários</h3>
        </div>
      </v-col>

      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="users"
          :items-per-page="100"
          :loading="isLoading"
          :server-items-length="totalUsers"
          :footer-props="{
            itemsPerPageOptions: [100, 200, 500],
            itemsPerPageText: 'Usuários por página',
            pageText: '{0}-{1} de {2}',
          }"
          :no-data-text="'Nenhum usuário encontrado'"
          :no-results-text="'Nenhum usuário encontrado'"
          :loading-text="'Carregando...'"
          class="elevation-1"
          :options.sync="options"
          @update:options="handleTableUpdate"
        >
          <!-- Campo de busca -->
          <template #top>
            <v-toolbar flat>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="search"
                    label="Buscar por nome ou email"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details="auto"
                    class="mr-4"
                    @input="handleSearchChange" />
                </v-col>
              </v-row>
            </v-toolbar>
          </template>
          
          <template #[`item.created_at`]="{ item }">
            {{ formatDateToCustomString(item.created_at) }}
          </template>
          
          <template #[`item.full_name`]="{ item }">

            <span v-if="item.people?.person_type === 'PF'">
              {{ item.people?.first_name }} {{ item.people?.last_name }}
            </span>

            <span v-else>
              {{ item.people?.social_name }}
            </span>
          </template>
          
          <template #[`item.account_verified`]="{ item }">
            <v-chip
              :color="item.account_verified ? 'success' : 'error'"
              small
            >
              {{ item.account_verified ? 'Sim' : 'Não' }}
            </v-chip>
          </template>

          <template #[`item.document_sent`]="{ item }">
            <v-chip
              :color="getDocumentSent(item) ? 'success' : 'error'"
              small
            >
              {{ getDocumentSent(item) ? 'Sim' : 'Não' }}
            </v-chip>
          </template>
          
          <template #[`item.person_type`]="{ item }">
            <v-chip
              :color="getPersonTypeColor(item.people?.person_type)"
              small
            >
              {{ item.people?.person_type }}
            </v-chip>
          </template>
          
          <template #[`item.actions`]="{ item }">
            <ActionsMenu
              :show-edit="isAdmin"
              :show-delete="false"
              :show-duplicate="false"
              icon="mdi-dots-horizontal"
              @edit="editUser(item)"
              @view-orders="viewOrders(item)"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Modal de pedidos do usuário -->
    <UserOrdersModal
      :show.sync="showUserOrders"
      :user-id="selectedUserId"
      :user-name="selectedUserName" />

    <!-- Modal de edição do usuário -->
    <EditUserModal
      v-if="showEditUserModal"
      :show.sync="showEditUserModal"
      :user="selectedUser"
      @saved="handleUserSaved"
    />

  </div>
</template>

<script>
import { user, loading } from '@/store';
import { formatDateToCustomString } from '@/utils/formatters';

export default {

  data() {
    return {
      headers: [
        { text: 'E-mail', value: 'email', sortable: true },
        { text: 'Nome / Empresa', value: 'full_name', sortable: false },
        { text: 'Tipo de Pessoa', value: 'person_type', sortable: false },
        { text: 'Verificado', value: 'account_verified', sortable: false },
        { text: 'Docs. Enviados', value: 'document_sent', sortable: false },
        { text: 'Data de Cadastro', value: 'created_at', sortable: true },
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
    };
  },
  
  computed: {
    isLoading() {
      return this.isLoadingInternal || loading.$isLoading;
    },
    isAdmin() {
      const role = this.$cookies.get('user_role');
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
          
          const response = await user.getUsers(query);
          
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
</style> 