<template>
  <div class="reports-header">
    <v-row align="center" class="mb-4">
  <v-col cols="12" sm="6" md="4">
    <v-autocomplete
      v-model="currentEvent"
      :items="groupedEventItems"
      item-text="name"
      item-value="id"
      label="Selecione o evento"
      outlined
      hide-details
      dense
      @change="onEventChange"
    />
  </v-col>
  <v-col v-if="hasEventSessions" cols="12" sm="6" md="4">
    <ReportSessionSelector 
      :label="'Sessão'" 
      :selected-event="selectedEvent"
      @session-change="onSessionChange" 
    />
  </v-col>
</v-row>
<v-card v-if="selectedEventDetails" elevation="1" class="pa-4 mt-2">
  <div class="d-flex align-center">
    <v-icon small class="mr-2">mdi-calendar</v-icon>
    <span>{{ formatDate(selectedEventDetails.start_date) }} - {{ formatDate(selectedEventDetails.end_date) }}</span>
  </div>
  <div v-if="selectedEventDetails.address" class="d-flex align-center mt-2">
    <v-icon small class="mr-2">mdi-map-marker</v-icon>
    <span>{{ formatLocation(selectedEventDetails.address) }}</span>
  </div>
</v-card>
  </div>
</template>

<script>
import { eventGeneralInfo } from '@/store';
import { getEventsInSameGroup, getSessionsCount } from '@/utils/event-utils';

export default {
  props: {
    selectedEvent: {
      type: Object,
      default: null,
    },
    
    groupedEvents: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      currentEvent: null,
      mainGroupedEvent: null, // Rastreia o evento agrupado principal
      currentSessionId: null, // Nova propriedade para rastrear a sessão selecionada
    };
  },

  computed: {
    getEvents() {
      return eventGeneralInfo.$eventList || [];
    },

    groupedEventItems() {
      return this.groupedEvents.map(event => ({
        id: event.id,
        name: event.name,
        data: event,
        hasSessions: event.hasSessions || false,
        sessionsCount: event.sessionsCount || 0
      }));
    },

    selectedEventDetails() {
      return this.selectedEvent;
    },
    
    hasEventSessions() {
      if (!this.selectedEvent) return false;
      
      return (
        this.selectedEvent.hasSessions || 
        (this.selectedEvent.groups && 
         this.selectedEvent.groups.length > 0 && 
         getEventsInSameGroup(this.selectedEvent, this.getEvents).length > 1)
      );
    },
    
    sessionsCount() {
      return getSessionsCount(this.selectedEvent, this.getEvents);
    }
  },

  watch: {
    selectedEvent: {
      immediate: true,
      handler(val) {
        if (val) {
          // Busca o evento agrupado principal para o evento atual
          const parentGroupedEvent = this.findParentGroupedEvent(val);
          
          // Se for uma sessão de um evento agrupado, mantém a referência ao evento principal no select
          if (parentGroupedEvent && parentGroupedEvent.id !== val.id) {
            this.mainGroupedEvent = parentGroupedEvent;
            this.currentEvent = parentGroupedEvent.id;
            this.currentSessionId = val.id;
          } else {
            // Se for um evento principal, atualiza o currentEvent normalmente
            this.mainGroupedEvent = val;
            this.currentEvent = val.id;
            this.currentSessionId = null;
          }
        }
      },
    },
  },

  methods: {
    findParentGroupedEvent(event) {
      // Se o evento não tem grupos, ele mesmo é o evento principal
      if (!event || !event.groups || !event.groups.length) return event;
      
      const groupId = event.groups[0].id;
      
      // Procura um evento na lista de eventos agrupados que tenha o mesmo groupId
      // e que seja o evento principal do grupo (pela convenção de dados)
      const groupedEvent = this.groupedEvents.find(e => 
        e.groups && e.groups.length && e.groups[0].id === groupId
      );
      
      // Se encontrar o evento agrupado, retorna ele, senão retorna o próprio evento
      return groupedEvent || event;
    },
    
    isSessionOfCurrentGroupedEvent(event) {
      if (!this.mainGroupedEvent || !event || !event.groups || !event.groups.length) return false;
      if (!this.mainGroupedEvent.groups || !this.mainGroupedEvent.groups.length) return false;
      
      // Verifica se o evento é uma sessão do evento agrupado atual
      return this.mainGroupedEvent.groups[0].id === event.groups[0].id && 
             this.mainGroupedEvent.id !== event.id;
    },
    
    onEventChange(eventId) {
      const event = this.groupedEvents.find(e => e.id === eventId) || 
                   this.getEvents.find(e => e.id === eventId);
      
      if (event) {
        // Atualiza o evento agrupado principal
        this.mainGroupedEvent = event;
        this.currentSessionId = null; // Reseta a sessão quando muda o evento principal
        this.$emit('change-event', event);
      }
    },
    
    onSessionChange(sessionId) {
      // Mantém a referência ao evento principal no select, mas emite a sessão selecionada
      this.currentSessionId = sessionId;
      
      // Busca os detalhes da sessão específica
      const sessionEvent = this.getEvents.find(e => e.id === sessionId);
      if (sessionEvent) {
        // Emite o evento de sessão sem alterar o currentEvent no select
        this.$emit('change-event', sessionEvent);
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },

    formatLocation(address) {
      if (!address) return '';
      
      const parts = [];
      if (address.location_name) parts.push(address.location_name);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      
      return parts.join(', ');
    }
  },
};
</script>

<style scoped>
.reports-header {
  width: 100%;
  padding: 16px 0;
}

.event-selector {
  max-width: 400px;
}

.event-details {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
</style> 