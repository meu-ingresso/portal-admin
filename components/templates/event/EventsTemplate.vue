<template>
  <v-container class="events-template py-10">
    <v-row class="d-flex align-center mb-4">
      <v-col cols="12" md="6" sm="12">
        <div class="events-template-title">Lista de Eventos</div>
      </v-col>
      <v-col cols="12" md="6" sm="12" class="d-flex" :class="{ 'justify-md-end': !isMobile, 'justify-space-between': isMobile }">
        <DefaultButton text="Criar um evento" :block="isMobile" to="/events/create" />
      </v-col>
    </v-row>
    <div class="actions">
      <DataSearch
        :search="search"
        place-holder="Encontre seu evento"
        @do-search="handleSearch" />
    </div>

    <FilterButtons
      :filters="statusList"
      :selected="selectedFilter"
      :is-loading="isLoadingStatus"
      @filter-selected="handleFilterChange" />

    <v-divider class="mb-8 mt-8"></v-divider>

    <EventList :events="groupedEvents" :show-sessions-indicator="showSessionsIndicator" />

    <!-- Estado vazio -->
    <template v-if="groupedEvents.length === 0 && !isLoadingEvents">
      <EmptyState
        title="Ainda não há eventos para esta busca"
        subtitle="Uma vez criados, seus eventos aparecerão aqui"
        icon="mdi-calendar-outline" />
    </template>

    <v-row v-if="groupedEvents.length > 0 && !isLoadingEvents">
      <v-col cols="12" class="text-center">
        <v-btn 
          v-if="hasEvents" 
          color="primary" 
          text 
          :disabled="!hasMorePages"
          @click="loadMore">
          {{ loadMoreButtonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { event, status } from '@/store';
import { isMobileDevice } from '@/utils/utils';
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
      showCalendar: false,
    };
  },
  computed: {


    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoadingEvents() {
      return event.$isLoading;
    },

    isLoadingStatus() {
      return status.$isLoading;
    },

    statusList() {
      return [
        { name: 'Todos' },
        ...status.$getStatusByModule('event'),
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

  async mounted() {
    await this.handleFetchFilterStatus();
  },

  methods: {

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
    async handleFetchFilterStatus() {
      try {
        await status.fetchStatusByModule('event');
      } catch (error) {
        console.error('Erro ao carregar lista de status de eventos', error);
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
