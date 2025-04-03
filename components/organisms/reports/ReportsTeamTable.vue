<template>
  <div class="reports-team">
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="isLoading"
      :server-items-length="totalUsers"
      :options.sync="options"
      :footer-props="{
        itemsPerPageOptions: [50, 100, 200],
        itemsPerPageText: 'Membros da equipe por página',
        pageText: '{0}-{1} de {2}',
      }"
      :no-data-text="'Nenhum membro da equipe encontrado'"
      :no-results-text="'Nenhum membro da equipe encontrado'"
      :loading-text="'Carregando...'"
      class="elevation-1"
      @update:options="handleTableUpdate"
    >
      <!-- Campo de busca e filtros -->
      <template #top>
        <v-toolbar flat>
          <v-row class="align-center">
            <v-col cols="6">
              <v-text-field
                v-model="filters.search"
                label="Buscar por nome ou email"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details="auto"
                class="mr-4"
                @input="handleFilterChange" />
            </v-col>

            <v-col cols="6" class="d-flex justify-end align-center">
              <TableFilter
                :active-filters-count="activeFiltersCount"
                @clear-filters="clearFilters">
                <template #filter-content>
                  <v-row>
                    <!-- Filtro de data de cadastro -->
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="6">
                          <v-menu
                            v-model="startDateMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field
                                v-model="filters.startDate"
                                label="Data inicial de cadastro"
                                readonly
                                outlined
                                dense
                                v-bind="attrs"
                                clearable
                                hide-details="auto"
                                v-on="on"
                                @click:clear="clearStartDate" />
                            </template>
                            <v-date-picker
                              v-model="filters.startDate"
                              no-title
                              locale="pt-br"
                              @input="handleDateSelect('start')" />
                          </v-menu>
                        </v-col>
                        <v-col cols="6">
                          <v-menu
                            v-model="endDateMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="290px">
                            <template #activator="{ on, attrs }">
                              <v-text-field
                                v-model="filters.endDate"
                                label="Data final de cadastro"
                                readonly
                                outlined
                                dense
                                v-bind="attrs"
                                clearable
                                hide-details="auto"
                                v-on="on"
                                @click:clear="clearEndDate" />
                            </template>
                            <v-date-picker
                              v-model="filters.endDate"
                              no-title
                              locale="pt-br"
                              @input="handleDateSelect('end')" />
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- Filtro de Função -->
                    <v-col cols="6">
                      <v-select
                        v-model="filters.role"
                        :items="roleOptions"
                        label="Função na Equipe"
                        outlined
                        dense
                        clearable
                        hide-details="auto"
                        @change="handleFilterChange" />
                    </v-col>

                    <!-- Filtro de atividade -->
                    <v-col cols="6">
                      <v-select
                        v-model="filters.active"
                        :items="activeOptions"
                        label="Status"
                        outlined
                        dense
                        clearable
                        hide-details="auto"
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
          <v-chip
            v-if="filters.startDate || filters.endDate"
            class="mr-2 chip-filter"
            close
            dark
            color="primary"
            @click:close="clearDates">
            <v-icon left small>mdi-calendar-range</v-icon>
            Período de cadastro: {{ formatDateRange }}
          </v-chip>

          <v-chip
            v-if="filters.role"
            class="mr-2 chip-filter"
            close
            dark
            color="primary"
            @click:close="clearRole">
            <v-icon left small>mdi-badge-account</v-icon>
            Função: {{ filters.role }}
          </v-chip>

          <v-chip
            v-if="filters.active"
            class="mr-2 chip-filter" 
            close
            dark
            color="primary"
            @click:close="clearActive">
            <v-icon left small>mdi-account-check</v-icon>
            Status: {{ getActiveText(filters.active) }}
          </v-chip>
        </v-sheet>
      </template>
      
      <!-- Nome do membro da equipe -->
      <template #[`item.full_name`]="{ item }">
        <span v-if="item.people?.person_type === 'PF'">
          {{ item.people?.first_name }} {{ item.people?.last_name }}
        </span>
        <span v-else>
          {{ item.people?.social_name }}
        </span>
      </template>
      
      <!-- Função -->
      <template #[`item.role_name`]="{ item }">
        <v-chip :color="getRoleColor(item.role?.name)">
          {{ item.role?.name }}
        </v-chip>
      </template>
      
      <!-- Status -->
      <template #[`item.active`]="{ item }">
        <v-icon :color="!item.deleted_at ? 'green' : 'error'">
          {{ !item.deleted_at ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
      </template>
      
      <!-- Ações -->
      <template #[`item.actions`]="{ item }">
        <ActionsMenu
          :show-edit="isAdmin"
          :show-delete="false"
          :show-duplicate="false"
          icon="mdi-dots-horizontal"
          @edit="editUser(item)"
        />
      </template>
    </v-data-table>

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

export default {
  data() {
    return {
      headers: [
        { text: 'E-mail', value: 'email', sortable: true },
        { text: 'Nome', value: 'full_name', sortable: false },
        { text: 'Função', value: 'role_name', sortable: true },
        { text: 'Status', value: 'active', sortable: false },
        { text: 'Ações', value: 'actions', sortable: false }
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
        active: '',
      },
      currentQuery: null,
      searchTimeout: null,
      isLoadingInternal: false,
      showEditUserModal: false,
      selectedUser: null,
      startDateMenu: false,
      endDateMenu: false,
      roleOptions: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Financeiro', value: 'Financeiro' },
        { text: 'Analista', value: 'Analista' },
        { text: 'Operador', value: 'Operador' }
      ],
      activeOptions: [
        { text: 'Ativo', value: 'active' },
        { text: 'Inativo', value: 'inactive' }
      ],
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

    getRoleColor(role) {
      switch (role) {
        case 'Admin':
          return 'deep-purple';
        case 'Financeiro':
          return 'green';
        case 'Analista':
          return 'blue';
        case 'Operador':
          return 'orange';
        default:
          return 'grey';
      }
    },

    getActiveText(status) {
      return this.activeOptions.find(opt => opt.value === status)?.text || status;
    },
    
    buildQueryParams() {
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      const { search, startDate, endDate, role, active } = this.filters;
      
      // Definir os roles de equipe que queremos buscar
      const teamRoles = ['Admin', 'Financeiro', 'Analista', 'Operador'];
      
      return {
        page,
        limit: itemsPerPage,
        search: search || undefined,
        sortBy: sortBy.length ? sortBy : ['created_at'],
        sortDesc: sortDesc.length ? sortDesc : [true],
        preloads: ['people:address', 'role'],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        roleFilter: role || teamRoles,
        active: active || undefined
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
          
          const response = await user.getUsersByRole(query);
          
          if (response && response.data && response.data !== 'Error') {
            this.users = response.data;
            this.totalUsers = response.meta.total;
          } else {
            this.users = [];
            this.totalUsers = 0;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
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
        active: '',
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
    
    clearActive() {
      this.filters.active = '';
      this.handleFilterChange();
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
.reports-team {
  padding: 16px 0;
}

.chip-filters {
  background-color: transparent !important;
}
</style> 