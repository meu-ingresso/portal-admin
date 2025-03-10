<template>
  <EventsTemplate
    v-if="!isLoading"
    :events="events"
    :grouped-events="groupedEvents"
    :show-sessions-indicator="true"
    @update-search="handleSearchEvents" />

  <Lottie v-else path="./animations/loading_default.json" height="300" width="300" />
</template>
<script>
/**
 * @page EventsPage
 * 
 * @description
 * Página de listagem de eventos do sistema de venda de ingressos.
 * 
 * @businessRules
 * - Eventos pertencentes ao mesmo grupo representam "sessões" de um mesmo evento
 * - Na listagem, apenas o evento com data mais próxima (mais antiga) de cada grupo é exibido
 * - As informações sobre quantidade de sessões são adicionadas ao evento exibido
 * - As demais sessões serão exibidas na página de detalhes do evento
 */
import { event, loading } from '@/store';
import { groupEventsBySession, logEventGroupingDiagnostics } from '~/utils/event-utils';

export default {
  data() {
    return {
      diagnosticRun: false,
    };
  },

  computed: {
    events() {
      return event.$eventList || [];
    },
    groupedEvents() {
      return groupEventsBySession(this.events);
    },
    isLoading() {
      return loading.$isLoading;
    },
  },

  async mounted() {
    await this.getData();
    
    // Executar diagnóstico apenas uma vez em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development' && !this.diagnosticRun) {
      this.logGroupedEvents();
      this.diagnosticRun = true;
    }
  },

  methods: {
    async getData() {
      try {
        await event.fetchEvents({
          sortBy: ['name'],
          sortDesc: [false],
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    async handleSearchEvents(search) {
      try {
        await event.fetchEvents({
          sortBy: ['name'],
          sortDesc: [false],
          search,
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
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
