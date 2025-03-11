<template>
    <EventsTemplate
      :events="events"
      :grouped-events="groupedEvents"
      :show-sessions-indicator="true"
      :pagination-meta="paginationMeta"
      @update-search="handleSearchEvents"
      @update-filter="handleFilterChange"
      @load-more="handleLoadMore" />
</template>

<script>

import { event } from '@/store';
import { groupEventsBySession, logEventGroupingDiagnostics } from '~/utils/event-utils';

export default {
  data() {
    return {
      diagnosticRun: false,
      currentFilter: 'Todos',
      currentSearch: '',
      currentPage: 1,
    };
  },

  computed: {
    events() {
      return event.$eventList || [];
    },
    groupedEvents() {
      return groupEventsBySession(this.events);
    },

    paginationMeta() {
      return event.$paginationMeta || {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      };
    },
    hasMorePages() {
      return this.paginationMeta.current_page < this.paginationMeta.last_page;
    },
  },

  async mounted() {
    await this.getData();
    
    if (process.env.NODE_ENV === 'development' && !this.diagnosticRun) {
      this.logGroupedEvents();
      this.diagnosticRun = true;
    }
  },

  methods: {
    async getData() {
      try {
        const { meta } = await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
        this.currentPage = meta.current_page;
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    async handleSearchEvents(search) {
      try {
        this.currentSearch = search;
        this.currentPage = 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    async handleFilterChange(filter) {
      try {
        this.currentFilter = filter.name;
        this.currentPage = 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search: this.currentSearch,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
      } catch (error) {
        console.error('Erro ao filtrar eventos:', error);
      }
    },

    async handleLoadMore() {
      if (!this.hasMorePages) return;
      
      try {
        this.currentPage += 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search: this.currentSearch,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
          append: true,
        });
      } catch (error) {
        console.error('Erro ao carregar mais eventos:', error);
        this.currentPage -= 1;
      }
    },

    /**
     * Método para depuração que mostra no console informações sobre
     * o agrupamento de eventos/sessões
     */
    logGroupedEvents() {
      logEventGroupingDiagnostics(this.events, this.groupedEvents, 'Página de Eventos');
    },
  },
};
</script>
