<template>
  <div>
    <HomeTemplate :events="groupedEvents" />
    <Toast />
  </div>
</template>

<script>
/**
 * Home Page - Listagem de Eventos
 * 
 * Implementa a regra de negócio de agrupamento de eventos:
 * - Eventos que pertencem ao mesmo grupo representam "sessões" do mesmo evento
 * - Na listagem principal, apenas o evento com data mais próxima (mais antiga) de cada grupo é exibido
 * - As informações sobre quantidade de sessões são adicionadas ao evento exibido
 * - As demais sessões serão exibidas na página de detalhes do evento
 */
import { event } from '@/store';
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
      // Implementação da regra de negócio: exibir apenas o evento mais próximo (data mais antiga) de cada grupo (sessão)
      const eventsByGroupId = {};
      
      this.events.forEach(event => {
        if (event.groups && event.groups.length > 0) {
          event.groups.forEach(group => {
            if (!group.id) {
              console.error('Grupo sem ID encontrado:', group);
              return;
            }
            
            const groupId = group.id;
            if (!eventsByGroupId[groupId]) {
              eventsByGroupId[groupId] = [];
            }
            
            eventsByGroupId[groupId].push(event);
          });
        } else {
          const eventId = event.id;
          eventsByGroupId[`event_${eventId}`] = [event];
        }
      });
      
      const filteredEvents = [];
      
      Object.entries(eventsByGroupId).forEach(([_groupId, eventsInGroup]) => {
        if (eventsInGroup.length === 1) {
          const singleEvent = {...eventsInGroup[0]};
          singleEvent.hasSessions = false;
          filteredEvents.push(singleEvent);
          return;
        }
        
        const sortedByDate = [...eventsInGroup].sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          
          const isValidA = !isNaN(dateA.getTime());
          const isValidB = !isNaN(dateB.getTime());
          
          if (!isValidA && !isValidB) return 0;
          if (!isValidA) return 1;
          if (!isValidB) return -1;
          
          return dateA - dateB;
        });
        
        if (sortedByDate.length > 0) {
          const nearestEvent = {...sortedByDate[0]};
          
          nearestEvent.hasSessions = true;
          nearestEvent.sessionsCount = sortedByDate.length;
          nearestEvent.sessionIds = sortedByDate.map(event => event.id);
          
          filteredEvents.push(nearestEvent);
        }
      });
      
      return filteredEvents;
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
      
      if (!this.diagnosticRun) {
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
      console.log('===== DIAGNÓSTICO DO AGRUPAMENTO DE EVENTOS =====');
      console.log('Total de eventos originais:', this.events.length);
      
      this.events.forEach(evento => {
        console.log(`Evento: ${evento.name} (ID: ${evento.id})`);
        console.log(`  Data: ${new Date(evento.start_date).toLocaleString()}`);
        
        if (evento.groups && evento.groups.length > 0) {
          console.log(`  Grupos (${evento.groups.length}):`);
          evento.groups.forEach(group => {
            console.log(`    - ${group.name} (ID: ${group.id})`);
          });
        } else {
          console.log('  Não pertence a nenhum grupo');
        }
        console.log('--------------------------');
      });
      
      console.log('\n===== RESULTADO DO AGRUPAMENTO =====');
      console.log('Total após agrupamento:', this.groupedEvents.length);
      
      const eventsWithSessions = this.groupedEvents.filter(e => e.hasSessions);
      console.log('Eventos com múltiplas sessões:', eventsWithSessions.length);
      
      eventsWithSessions.forEach(event => {
        console.log(`Evento: ${event.name} (ID: ${event.id})`);
        console.log(`  Data selecionada: ${new Date(event.start_date).toLocaleString()} (evento mais próximo do grupo)`);
        console.log(`  Total de sessões: ${event.sessionsCount}`);
        console.log(`  IDs das sessões: ${event.sessionIds.join(', ')}`);
        console.log('--------------------------');
      });
      
      console.log('===== FIM DO DIAGNÓSTICO =====');
    }
  }
};
</script>
