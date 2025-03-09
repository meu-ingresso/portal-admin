<template>
  <div>
    <v-container>
      <EventDrawer :drawer="drawer" />

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

      <div v-else-if="getEvent" class="event-details-page">

        <div class="d-flex justify-space-between" :class="{ 'flex-column': isMobile }">
          <EventDetailsHeader />
          <EventSessionSelector />
        </div>

        <EventDetailsTemplate v-if="isPanel" />
        <EventDetailsTicketsTemplate v-if="isTickets" />
        <EventDetailsCouponsTemplate v-if="isCoupons" />
        <EventDetailsGuestlistsTemplate v-if="isGuestlists" />
        <EventDetailsCheckinTemplate v-if="isCheckin" />
        <EventDetailsOrdersTemplate v-if="isOrders" />
        <EventDetailsCollaboratorsTemplate v-if="isCollaborators" />
        <EventDetailsPdvTemplate v-if="isPdv" />
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
  eventPdv,
  eventCollaborators, 
  user,
  loading,
} from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      eventInvalid: false,
      drawer: true,
    };
  },

  computed: {

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

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

    isCheckin() {
      return this.$route.meta.template === 'checkin';
    },

    isOrders() {
      return this.$route.meta.template === 'orders';
    },

    isCollaborators() {
      return this.$route.meta.template === 'collaborators';
    },
    
    isPdv() {
      return this.$route.meta.template === 'pdv';
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

        // Primeiro, busca o evento específico para obter o ID do grupo
        await eventGeneralInfo.fetchAndPopulateByEventId(this.$route.params.id);

        const currentEvent = eventGeneralInfo.$info;
        const groupId = currentEvent?.groups?.[0]?.id;

        // Se o evento pertence a um grupo, busca todos os eventos relacionados
        if (groupId) {
          await eventGeneralInfo.fetchEvents({
            whereHas: {
              groups: {
                id: groupId
              }
            },
            preloads: ['rating', 'coupons', 'collaborators:user:people', 'collaborators:role', 'views', 'address', 'attachments', 'fees', 'groups', 'tickets']
          });
        }

        const promises = [
          eventTickets.fetchAndPopulateByEventId(this.$route.params.id),
          eventCustomFields.fetchAndPopulateByEventId(this.$route.params.id),
          eventCoupons.fetchAndPopulateByEventId(this.$route.params.id),
          eventGuests.fetchGuestListAndPopulateByQuery(
            `where[event_id][v]=${this.$route.params.id}&preloads[]=members`
          ),
          eventPdv.fetchAndPopulateByEventId(this.$route.params.id),
          user.getAllUsers(),
          user.getRoles(),
          eventCollaborators.fetchCollaborators({ eventId: this.$route.params.id }),
        ];

        await Promise.all(promises);
      } catch (error) {
        console.error('Erro ao buscar dados do evento:', error);
        this.eventInvalid = true;
      } finally {
        loading.setIsLoading(false);
      }
    },
  },
};
</script>

<style scoped>
.event-details-page {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
</style>