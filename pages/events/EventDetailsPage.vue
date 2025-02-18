<template>
  <div>
    <v-container>
      <EventDrawer :drawer="drawer" :event-data="getEvent" />

      <Lottie
        v-if="isLoading || isLoadingEvent"
        path="./animations/loading_default.json"
        height="300"
        width="300" />

      <div v-else-if="eventInvalid">
        <ValueNoExists text="Evento não encontrado" />
      </div>

      <div v-else-if="getEvent && !userHasPermission">
        <ValueNoExists text="Você não possui acesso à esse evento" />
      </div>

      <div v-else-if="getEvent">
        <EventDetailsTemplate v-if="isPanel" />
        <EventDetailsTicketsTemplate v-if="isTickets" />
        <EventDetailsCouponsTemplate v-if="isCoupons" />
        <EventDetailsGuestlistsTemplate v-if="isGuestlists" />
      </div>
    </v-container>
    <Toast />
  </div>
</template>

<script>
import {
  eventGeneralInfo,
  eventTickets,
  eventCoupons,
  eventCustomFields,
  eventGuests,
  loading,
} from '@/store';

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
      return eventGeneralInfo.$isLoading;
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },

    getTickets() {
      return eventTickets.$tickets;
    },

    getCustomFields() {
      return eventCustomFields.$customFields;
    },

    getCoupons() {
      return eventCoupons.$coupons;
    },

    getGuests() {
      return eventGuests.$guests;
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

    isCoupons() {
      return this.$route.meta.template === 'coupons';
    },

    isGuestlists() {
      return this.$route.meta.template === 'guestlists';
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
      if (!this.getEvent) return true;

      return (
        this.getEvent.collaborators?.some(
          (collaborator) => collaborator.id === this.userId
        ) ||
        this.getEvent.promoter_id === this.userId ||
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
        if (this.$route.params.id && !this.getEvent) {
          this.fetchEventData();
        }
      },
    },
  },

  methods: {
    async fetchEventData() {
      try {
        this.eventInvalid = false;
        if (!this.$route.params.id || this.getEvent?.id === this.$route.params.id) {
          return;
        }

        loading.setIsLoading(true);

        const promises = [
          eventGeneralInfo.fetchAndPopulateByEventId(this.$route.params.id),
          eventTickets.fetchAndPopulateByEventId(this.$route.params.id),
          eventCustomFields.fetchAndPopulateByEventId(this.$route.params.id),
          eventCoupons.fetchAndPopulateByEventId(this.$route.params.id),
          eventGuests.fetchAndPopulateByQuery(
            `where[event_id][v]=${this.$route.params.id}`
          ),
        ];

        await Promise.all(promises);
      } catch (error) {
        this.eventInvalid = true;
      } finally {
        loading.setIsLoading(false);
      }
    },
  },
};
</script>
