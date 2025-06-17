<template>
  <v-container class="events-template py-10">
    <v-row class="d-flex align-center mb-4">
      <v-col cols="12" md="6" sm="12">
        <div class="events-template-title">Lista de Eventos</div>
      </v-col>
      <v-col
cols="12" md="6" sm="12" class="d-flex"
        :class="{ 'justify-md-end': !isMobile, 'justify-space-between': isMobile }">
        <DefaultButton v-if="canCreateEvent" text="Criar um evento" :block="isMobile" to="/events/create" />
      </v-col>
    </v-row>
    <div class="actions">
      <DataSearch :search="search" place-holder="Encontre seu evento" @do-search="handleSearch" />
    </div>

    <FilterButtons
:filters="statusList" :selected="selectedFilter" :is-loading="isLoadingStatus"
      @filter-selected="handleFilterChange" />

    <v-divider class="mb-8 mt-8"></v-divider>

    <EventList
:events="groupedEvents" :show-sessions-indicator="showSessionsIndicator"
      @check-promoter="handleCheckPromoter" />

    <!-- Estado vazio -->
    <template v-if="groupedEvents.length === 0 && !isLoadingEvents">
      <EmptyState
title="Ainda não há eventos para esta busca" subtitle="Uma vez criados, seus eventos aparecerão aqui"
        icon="mdi-calendar-outline" />
    </template>

    <v-row v-if="groupedEvents.length > 0 && !isLoadingEvents">
      <v-col cols="12" class="text-center">
        <v-btn v-if="hasEvents" color="primary" text :disabled="!hasMorePages" @click="loadMore">
          {{ loadMoreButtonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { checkUserPermissionsBatch } from '@/utils/permissions-util';
import { EVENT_PERMISSIONS } from '@/utils/permissions-config';

export default {
  props: {
    groupedEvents: { type: Array, required: true },
    events: { type: Array, required: true },
    showSessionsIndicator: { type: Boolean, default: false },
    paginationMeta: {
      type: Object,
      default: () => ({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      })
    },
  },
  data() {
    return {
      search: '',
      selectedFilter: { name: 'Todos' },
      canCreateEvent: false,
    };
  },
  computed: {

    getUserRole() {
      return this.$store.state.auth.user?.role;
    },

    getUserId() {
      return this.$store.state.auth.user?.id;
    },

    isAdminOrManager() {
      const userRole = this.$store.state.auth.user?.role;
      return userRole && (userRole.name === 'Admin' || userRole.name === 'Gerente');
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoadingEvents() {
      return this.$store.getters['event/$isLoading'];
    },

    isLoadingStatus() {
      return this.$store.getters['status/$isLoading'];
    },

    statusList() {
      return [
        { name: 'Todos' },
        ...this.$store.getters['status/$getStatusByModule']('event'),
      ];
    },

    hasEvents() {
      return this.groupedEvents.length > 0;
    },

    hasMorePages() {
      return this.paginationMeta.current_page < this.paginationMeta.last_page;
    },

    loadMoreButtonText() {
      return this.hasMorePages
        ? 'Ver mais...'
        : 'Não há mais eventos para carregar';
    },

  },

  mounted() {
    // this.checkUserPermission();
  },

  methods: {

    async handleCheckPromoter(promoterId) {
      try {

        const userResponse = await this.$store.dispatch('user/getById', { user_id: promoterId, commit: false });

        if (userResponse && userResponse?.role) {

          const { role } = userResponse;

          // Verifica se o promotor é um cliente para transformar em promotor
          if (role.name === 'Cliente') {
            const roleResponse = await this.$store.dispatch('user/getRoleByName', { name: 'Promoter' });

            if (roleResponse && roleResponse.success) {
              await this.$store.dispatch('user/updateUser', {
                id: userResponse.id,
                role_id: roleResponse.data.id
              });

              this.$store.dispatch('toast/setToast', {
                text: 'Cliente promovido a promotor com sucesso',
                type: 'success',
                time: 3000,
              });
            }
          }
        }

      } catch (error) {
        console.error('Erro ao verificar promotor', error);
      }
    },

    async checkUserPermission() {
      try {

        if (this.isAdminOrManager) {
          this.canCreateEvent = true;
          return;
        }

        const permissions = await checkUserPermissionsBatch(this.getUserRole?.id, this.getUserId);

        if (permissions.has('*') || permissions.has(EVENT_PERMISSIONS.CREATE)) {
          this.canCreateEvent = true;
        }
      } catch (error) {
        console.error('Erro ao verificar permissões do usuário', error);
      }
    },

    handleFilterChange(filter) {
      this.selectedFilter = filter;
      this.$emit('update-filter', filter);
    },
    handleSearch(search) {
      this.search = search;
      this.$emit('update-search', search);
    },
    loadMore() {
      if (this.hasMorePages) {
        this.$emit('load-more');
      }
    },
  },
};
</script>

<style scoped>
.events-template {
  max-width: 1280px;
}

.events-template-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.actions {
  margin-bottom: 20px;
}

@media (max-width: 360px) {
  .events-template-title {
    font-size: 22px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .events-template-title {
    font-size: 24px;
  }
}
</style>
