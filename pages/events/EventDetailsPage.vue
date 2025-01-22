<template>
  <v-container>
    <Lottie
      v-if="isLoading || isLoadingEvent"
      path="./animations/loading_default.json"
      height="300"
      width="300" />

    <div v-else>
      <EventDrawer :drawer="drawer" :event-data="eventData" />

      <div v-if="eventData && !eventInvalid && userHasPermission">
        <EventDetailsTemplate v-if="isDetails" :event="eventData" />
        <EventDetailsTicketsTemplate v-if="isTickets" :event="eventData" />
      </div>

      <ValueNoExists v-if="eventInvalid" text="Evento não encontrado" />

      <ValueNoExists
        v-else-if="eventData && !userHasPermission"
        text="Você não possui acesso à esse evento" />
    </div>
  </v-container>
</template>

<script>
import { event, loading } from '@/store';

export default {
  data() {
    return {
      eventInvalid: false,
      drawer: true,
      eventData: null,
    };
  },

  computed: {
    isLoading() {
      return loading.$isLoading;
    },

    isLoadingEvent() {
      return event.$isLoading;
    },

    currentRouter() {
      return this.$route;
    },

    isDetails() {
      return this.$route.meta.template === 'details';
    },
    isTickets() {
      return this.$route.meta.template === 'tickets';
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

    userHasPermission() {
      const eventSelected = this.eventData;

      if (!eventSelected || !eventSelected.id) return false;

      return (
        eventSelected.collaborators?.some(
          (collaborator) => collaborator.id === this.userId
        ) ||
        eventSelected.promoter_id === this.userId ||
        this.isAdmin
      );
    },
  },

  mounted() {
    console.log('Buscando dados do evento');
    this.fetchEventData();
  },

  methods: {
    async fetchEventData() {
      try {
        const response = await event.getById(this.$route.params.id);

        if (!response?.body || response.body.code !== 'SEARCH_SUCCESS') {
          this.eventInvalid = true;
          this.eventData = null;
          return;
        }

        this.eventData = event.$selectedEvent;
        this.eventInvalid = false;
      } catch (error) {
        console.error('Erro ao buscar dados do evento:', error);
        this.eventInvalid = true;
        this.eventData = null;
      }
    },
  },
};
</script>
