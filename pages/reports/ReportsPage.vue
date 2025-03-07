<template>
  <div>
    <v-container>
      <ReportsDrawer :drawer="drawer" :selected-event="selectedEvent" />

      <ReportsLoading
        v-if="isLoading || isLoadingEvents"
        :message="loadingMessage" />

      <div v-else-if="!hasEvents">
        <ValueNoExists text="Nenhum evento encontrado" />
      </div>

      <div v-else class="reports-page">
        <div class="d-flex justify-space-between" :class="{ 'flex-column': isMobile }">
          <ReportsHeader 
            :selected-event="selectedEvent" 
            :grouped-events="groupedEvents"
            @change-event="onChangeEvent" />
        </div>

        <ReportsOverviewTemplate v-if="isOverview" />
        <ReportsSalesTemplate v-if="isSales" />
        <ReportsTicketsTemplate v-if="isTickets" />
        <ReportsAttendanceTemplate v-if="isAttendance" />
      </div>
    </v-container>
    <Toast />
  </div>
</template>

<script>
import {
  eventGeneralInfo,
  eventTickets,
  loading,
} from '@/store';
import { isMobileDevice } from '@/utils/utils';
import { groupEventsBySession } from '@/utils/event-utils';

export default {
  data() {
    return {
      drawer: true,
      selectedEvent: null,
      hasEvents: true,
      currentGroupId: null, // Rastrear o grupo atual
      loadingMessage: 'Carregando dados...'
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoading() {
      return loading.$isLoading;
    },

    isLoadingEvents() {
      return eventGeneralInfo.$isLoading;
    },

    getEvents() {
      return eventGeneralInfo.$eventList || [];
    },

    groupedEvents() {
      // Aplicar o agrupamento de eventos por sessão usando a função de utilidade
      const grouped = groupEventsBySession(this.getEvents);
      
      // Processamento adicional não é necessário, pois nossa utilidade já está completa
      return grouped;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    currentRouter() {
      return this.$route;
    },

    isOverview() {
      return this.$route.meta.template === 'overview';
    },

    isSales() {
      return this.$route.meta.template === 'sales';
    },

    isTickets() {
      return this.$route.meta.template === 'tickets';
    },

    isAttendance() {
      return this.$route.meta.template === 'attendance';
    },

    userRole() {
      return this.$cookies.get('user_role');
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },

    upcomingGroupedEvents() {
      if (!this.groupedEvents) return [];
      
      const now = new Date();
      
      return this.groupedEvents
        .filter(event => {
          const endDate = new Date(event.end_date);
          return endDate >= now;
        })
        .sort((a, b) => {
          const aStart = new Date(a.start_date);
          const bStart = new Date(b.start_date);
          return aStart - bStart;
        });
    },

    pastGroupedEvents() {
      if (!this.groupedEvents) return [];
      
      const now = new Date();
      
      return this.groupedEvents
        .filter(event => {
          const endDate = new Date(event.end_date);
          return endDate < now;
        })
        .sort((a, b) => {
          const aEnd = new Date(a.end_date);
          const bEnd = new Date(b.end_date);
          return bEnd - aEnd; // Most recent past events first
        });
    },
  },

  watch: {
    getEvents: {
      immediate: true,
      handler(events) {
        if (events && events.length > 0) {
          this.hasEvents = true;
          this.selectMostRelevantEvent();
        } else {
          this.hasEvents = false;
        }
      },
    },
    
    // Monitorar mudanças no evento selecionado para atualizar o grupo atual
    selectedEvent: {
      handler(newEvent) {
        if (newEvent && newEvent.groups && newEvent.groups.length > 0) {
          this.currentGroupId = newEvent.groups[0].id;
        }
      }
    }
  },

  mounted() {
    this.fetchEvents();
  },

  methods: {
    async fetchEvents() {
      try {
        loading.setIsLoading(true);
        this.loadingMessage = 'Buscando eventos...';

        // Fetch all events for the user with preloads necessários para agrupamento
        await eventGeneralInfo.fetchEvents({
          preloads: ['rating', 'collaborators:user:people', 'collaborators:role', 'views', 'address', 'attachments', 'fees', 'groups']
        });

        if (this.getEvents && this.getEvents.length > 0) {
          this.hasEvents = true;
          this.selectMostRelevantEvent();
        } else {
          this.hasEvents = false;
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        this.hasEvents = false;
      } finally {
        loading.setIsLoading(false);
      }
    },

    selectMostRelevantEvent() {
      // Prioritize upcoming events, then recent past events
      if (this.upcomingGroupedEvents.length > 0) {
        this.selectedEvent = this.upcomingGroupedEvents[0]; // Soonest upcoming event
      } else if (this.pastGroupedEvents.length > 0) {
        this.selectedEvent = this.pastGroupedEvents[0]; // Most recent past event
      } else if (this.groupedEvents && this.groupedEvents.length > 0) {
        this.selectedEvent = this.groupedEvents[0]; // Fallback to first event
      } else if (this.getEvents && this.getEvents.length > 0) {
        this.selectedEvent = this.getEvents[0]; // Fallback to ungrouped events
      }

      if (this.selectedEvent) {
        // Atualizar o grupo atual
        if (this.selectedEvent.groups && this.selectedEvent.groups.length > 0) {
          this.currentGroupId = this.selectedEvent.groups[0].id;
        }
        
        this.loadEventData(this.selectedEvent.id);
      }
    },
    
    isEventFromCurrentGroup(event) {
      return event && 
             event.groups && 
             event.groups.length > 0 && 
             event.groups[0].id === this.currentGroupId;
    },

    async loadEventData(eventId) {
      if (!eventId) return;
      
      try {
        loading.setIsLoading(true);
        this.loadingMessage = 'Carregando dados do evento...';
        
        // Load detailed event data
        await eventGeneralInfo.fetchAndPopulateByEventId(eventId);
        await eventTickets.fetchAndPopulateByEventId(eventId);
        
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
      } finally {
        loading.setIsLoading(false);
      }
    },

    onChangeEvent(event) {
      // Verificar se estamos alterando para uma sessão do mesmo grupo ou para um novo evento
      const isSessionChange = this.currentGroupId && 
                             event.groups && 
                             event.groups.length > 0 && 
                             event.groups[0].id === this.currentGroupId &&
                             event.id !== this.selectedEvent?.id;
      
      // Se estiver mudando para uma sessão do mesmo evento, mantenha o grupo atual
      if (isSessionChange) {
        // Mantém o currentGroupId inalterado
      } else if (event.groups && event.groups.length > 0) {
        // Atualiza para um novo grupo
        this.currentGroupId = event.groups[0].id;
      }
      
      this.selectedEvent = event;
      this.loadEventData(event.id);
    }
  },
};
</script>

<style scoped>
.reports-page {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
</style> 