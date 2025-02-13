<template>
  <div>
    <v-container>
      <EventDrawer :drawer="drawer" :event-data="currentEvent" />

      <Lottie
        v-if="(isLoading || isLoadingEvent) && !currentEvent"
        path="./animations/loading_default.json"
        height="300"
        width="300" />

      <div v-else-if="eventInvalid">
        <ValueNoExists text="Evento não encontrado" />
      </div>

      <div v-else-if="currentEvent && !userHasPermission">
        <ValueNoExists text="Você não possui acesso à esse evento" />
      </div>

      <div v-else-if="currentEvent">
        <EventDetailsTemplate v-if="isPanel" />
        <EventDetailsTicketsTemplate v-if="isTickets" />
      </div>
    </v-container>
    <Toast />
  </div>
</template>

<script>
import { event, loading } from '@/store';

export default {
  data() {
    return {
      eventInvalid: false,
      drawer: true,
    };
  },

  computed: {
    isLoading() {
      return loading.$isLoading;
    },

    isLoadingEvent() {
      return event.$isLoading;
    },

    currentEvent() {
      return event.$event;
    },

    currentRouter() {
      return this.$route;
    },

    isPanel() {
      return this.$route.meta.template === 'panel';
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
      if (!this.currentEvent) return true;

      return (
        this.currentEvent.collaborators?.some(
          (collaborator) => collaborator.id === this.userId
        ) ||
        this.currentEvent.promoter_id === this.userId ||
        this.isAdmin
      );
    },
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchEventData();
        }
      },
    },

    '$route.meta.template': {
      handler() {
        if (this.$route.params.id && !this.currentEvent) {
          this.fetchEventData();
        }
      },
    },
  },

  methods: {
    async fetchEventData() {
      try {
        this.eventInvalid = false;
        if (!this.$route.params.id || this.currentEvent?.id === this.$route.params.id) {
          return;
        }

        const response = await event.getById(this.$route.params.id);

        if (!response?.body || response.body.code !== 'SEARCH_SUCCESS') {
          this.eventInvalid = true;
          return;
        }

        if (!event.$event) {
          this.eventInvalid = true;
        }
      } catch (error) {
        this.eventInvalid = true;
      }
    },
  },
};
</script>
