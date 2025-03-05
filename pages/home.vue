<template>
  <div>
    <HomeTemplate :events="groupedEvents" />
    <Toast />
  </div>
</template>

<script>
/**
 * @page HomePage
 * 
 * @description
 * Página inicial do sistema de venda de ingressos que lista eventos agrupados.
 * 
 * @businessRules
 * - Eventos pertencentes ao mesmo grupo representam "sessões" de um mesmo evento
 * - Na listagem principal, apenas o evento com data mais próxima (mais antiga) de cada grupo é exibido
 * - As informações sobre quantidade de sessões são adicionadas ao evento exibido
 * - As demais sessões serão exibidas na página de detalhes do evento
 */
import { event } from '@/store';
import { groupEventsBySession, logEventGroupingDiagnostics } from '~/utils/event-utils';

export default {
  name: 'HomePage',

  data() {
    return {
      diagnosticRun: false,
    };
  },

  computed: {
    events() {
      return event.$eventList;
    },
    groupedEvents() {
      return groupEventsBySession(this.events);
    },
    isLoadingEvents() {
      return event.$isLoading;
    },
  },

  async mounted() {
    try {
      await event.fetchEvents({
        sortBy: ['name'],
        sortDesc: [false],
      });
      
      // Executar diagnóstico apenas uma vez em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'development' && !this.diagnosticRun) {
        this.logGroupedEvents();
        this.diagnosticRun = true;
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  },
  
  methods: {
    /**
     * Método para depuração que mostra no console informações sobre
     * o agrupamento de eventos/sessões
     */
    logGroupedEvents() {
      logEventGroupingDiagnostics(this.events, this.groupedEvents, 'Página Home');
    }
  }
};
</script>
