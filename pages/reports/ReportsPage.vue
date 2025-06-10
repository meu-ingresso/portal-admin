<template>
  <div>
    <v-container>
      <ReportsDrawer :drawer="drawer" :selected-event="selectedEvent" :selected-view="$route.meta.template" />

      <ReportsLoading v-if="isLoading || isLoadingEvents" :message="loadingMessage" />

      <div v-else-if="!hasEvents">
        <ValueNoExists text="Nenhum evento encontrado" />
      </div>

      <div v-else class="reports-page">
        <div v-if="currentTemplate !== 'users'" class="d-flex justify-space-between"
          :class="{ 'flex-column': isMobile }">
          <ReportsHeader :selected-event="selectedEvent" :grouped-events="groupedEvents"
            @change-event="onChangeEvent" />
        </div>

        <ReportsOverviewTemplate v-if="isOverview" />
        <ReportsSalesTemplate v-if="isSales" />
        <ReportsTicketsTemplate v-if="isTickets" />
        <ReportsAttendanceTemplate v-if="isAttendance" />
        <ReportsUsersTemplate v-if="isUsers" />
      </div>
    </v-container>
    <Toast />
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { groupEventsBySession } from '@/utils/event-utils';

export default {
  data() {
    return {
      drawer: true,
      selectedEvent: null,
      hasEvents: true,
      currentGroupId: null,
      loadingMessage: 'Carregando dados...'
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoading() {
      return this.$store.getters['loading/$isLoading'];
    },

    isLoadingEvents() {
      return this.$store.getters['eventGeneralInfo/$isLoading'];
    },

    getEvents() {
      return this.$store.getters['eventGeneralInfo/$eventList'] || [];
    },

    groupedEvents() {
      const grouped = groupEventsBySession(this.getEvents);

      return grouped;
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    currentRouter() {
      return this.$route;
    },

    currentTemplate() {
      return this.$route.meta.template;
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

    isUsers() {
      return this.$route.meta.template === 'users';
    },

    userRole() {
      return this.$store.state.auth.user?.role;
    },

    userId() {
      return this.$store.state.auth.user?.id;
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
          return bEnd - aEnd;
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
        this.$store.dispatch('loading/setIsLoading', true);
        this.loadingMessage = 'Buscando eventos...';

        await this.$store.dispatch('eventGeneralInfo/fetchEvents', {
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
        this.$store.dispatch('loading/setIsLoading', false);
      }
    },

    selectMostRelevantEvent() {
      if (this.upcomingGroupedEvents.length > 0) {
        this.selectedEvent = this.upcomingGroupedEvents[0];
      } else if (this.pastGroupedEvents.length > 0) {
        this.selectedEvent = this.pastGroupedEvents[0];
      } else if (this.groupedEvents && this.groupedEvents.length > 0) {
        this.selectedEvent = this.groupedEvents[0];
      } else if (this.getEvents && this.getEvents.length > 0) {
        this.selectedEvent = this.getEvents[0];
      }

      if (this.selectedEvent) {
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
        this.$store.dispatch('loading/setIsLoading', true);
        this.loadingMessage = 'Carregando dados do evento...';

        // Load detailed event data
        await this.$store.dispatch('eventGeneralInfo/fetchAndPopulateByEventId', eventId);
        await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', eventId);

      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
      } finally {
        this.$store.dispatch('loading/setIsLoading', false);
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