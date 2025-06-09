<template>
  <div>
    <v-container>
      <EventDrawer :drawer="drawer" />

      <Lottie v-if="isLoading || isLoadingEvent" path="./animations/loading_default.json" height="300" width="300" />

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
import { isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      eventInvalid: false,
      drawer: true,
      attemptedTemplate: null
    };
  },

  computed: {

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isLoading() {
      return this.$store.getters['loading/$isLoading'];
    },

    isLoadingEvent() {
      return this.$store.getters['eventGeneralInfo/$isLoading'];
    },

    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    getCustomFields() {
      return this.$store.getters['eventCustomFields/$customFields'];
    },

    getCoupons() {
      return this.$store.getters['eventCoupons/$coupons'];
    },

    getGuests() {
      return this.$store.getters['eventGuests/$guests'];
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
      return this.$store.state.auth.user?.auth?.role;
    },

    userId() {
      return this.$auth.user?.auth?.id;
    },

    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },

    userHasPermission() {
      if (!this.getEvent) return true;

      return (
        this.getEvent.collaborators?.some(
          (collaborator) => collaborator?.user?.id === this.userId
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
          this.checkUrlParams();
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

    '$route.query': {
      immediate: true,
      handler() {
        this.checkUrlParams();
      }
    }
  },

  methods: {
    async fetchEventData() {
      try {
        this.eventInvalid = false;
        if (!this.$route.params.id) {
          return;
        }

        this.$store.dispatch('loading/setIsLoading', true);

        // Primeiro, busca o evento específico para obter o ID do grupo
        await this.$store.dispatch('eventGeneralInfo/fetchAndPopulateByEventId', this.$route.params.id);

        const currentEvent = this.$store.getters['eventGeneralInfo/$info'];
        const groupId = currentEvent?.groups?.[0]?.id;

        // Se o evento pertence a um grupo, busca todos os eventos relacionados
        if (groupId) {
          await this.$store.dispatch('eventGeneralInfo/fetchEvents', {
            whereHas: {
              groups: {
                id: groupId
              }
            },
            preloads: ['rating', 'coupons', 'collaborators:user:people', 'collaborators:role', 'views', 'address', 'attachments', 'fees', 'groups', 'tickets']
          });
        }

        const promises = [
          this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.$route.params.id),
          this.$store.dispatch('eventCustomFields/fetchAndPopulateByEventId', this.$route.params.id),
          this.$store.dispatch('eventCoupons/fetchAndPopulateByEventId', this.$route.params.id),
          this.$store.dispatch('eventGuests/fetchGuestListAndPopulateByQuery',
            `where[event_id][v]=${this.$route.params.id}&preloads[]=members`
          ),
          this.$store.dispatch('eventPdv/fetchAndPopulateByEventId', this.$route.params.id),
          this.$store.dispatch('user/getAllUsers'),
          this.$store.dispatch('user/getRoles'),
          this.$store.dispatch('eventCollaborators/fetchCollaborators', { eventId: this.$route.params.id }),
        ];

        await Promise.all(promises);
      } catch (error) {
        console.error('Erro ao buscar dados do evento:', error);
        this.eventInvalid = true;
      } finally {
        this.$store.dispatch('loading/setIsLoading', false);
      }
    },

    checkUrlParams() {
      const { noPermission, template } = this.$route.query;

      if (noPermission === 'true' && template) {

        this.$store.dispatch('toast/setToast', {
          text: 'Você não possui permissão para acessar a seção de ' + this.getTemplateLabel(),
          type: 'error',
          time: 5000
        });

        this.attemptedTemplate = template;

        // Remover os parâmetros da URL sem recarregar a página
        const query = { ...this.$route.query };
        delete query.noPermission;
        delete query.template;

        this.$router.replace({
          path: this.$route.path,
          query
        });
      }
    },


    getTemplateLabel() {
      const templateMap = {
        'tickets': 'Ingressos',
        'coupons': 'Cupons',
        'checkin': 'Check-in',
        'orders': 'Pedidos',
        'guestlists': 'Listas de Convidados',
        'collaborators': 'Colaboradores',
        'pdv': 'PDV'
      };

      return templateMap[this.attemptedTemplate] || this.attemptedTemplate;
    }
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