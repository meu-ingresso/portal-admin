<template>
  <div>
    <Lottie
      v-if="isLoadingEvents"
      path="./animations/loading_default.json"
      height="300"
      width="300" />

    <div v-else>
      HASPERMISSION {{ userHasPermission() }}

      <div v-if="selectedEvent && !eventInvalid && userHasPermission()">
        <EventDetailsTemplate v-if="inDetails" :event="selectedEvent" />

        <EventDetailsTicketsTemplate v-if="inDetailsTickets" :event="selectedEvent" />
      </div>

      <ValueNoExists v-if="eventInvalid" text="Evento não encontrado" />

      <ValueNoExists
        v-else-if="!userHasPermission()"
        text="Você não possui acesso à esse evento" />
    </div>
  </div>
</template>

<script lang="ts">
import { event, loading } from '@/store';

export default {
  data() {
    return {
      eventInvalid: false,
    };
  },

  computed: {
    selectedEvent() {
      return event.$selectedEvent;
    },

    isLoadingEvents() {
      return event.$isLoading;
    },

    inDetails() {
      return this.$route.meta.name === 'eventsDetails';
    },

    inDetailsTickets() {
      return this.$route.meta.name === 'eventsDetailsTickets';
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
  },

  async mounted() {
    if (!this.selectedEvent || this.selectedEvent.id !== this.$route.params.id) {
      loading.setIsLoading(true);

      await this.eventExists();

      loading.setIsLoading(false);
    }
  },

  methods: {
    async eventExists(): Promise<void> {
      try {
        const response = await event.getById(this.$route.params.id);

        if (
          !response ||
          response.code === 'FIND_NOTFOUND' ||
          response.body?.code !== 'SEARCH_SUCCESS'
        ) {
          this.eventInvalid = true;
        } else {
          this.eventInvalid = false;
        }
      } catch (error) {
        this.eventInvalid = true;
      }
    },

    userHasPermission(): boolean {
      const eventSelected = this.selectedEvent;

      if (!eventSelected || !eventSelected.id) return false;

      console.log('EH ADMIN', this.isAdmin);
      console.log(
        'COLABORADOR',
        eventSelected.collaborators?.some(
          (collaborator) => collaborator.id === this.userId
        )
      );
      console.log('PROMOTER', eventSelected.promoter_id === this.userId);

      return (
        eventSelected.collaborators?.some(
          (collaborator) => collaborator.id === this.userId
        ) ||
        eventSelected.promoter_id === this.userId ||
        this.isAdmin
      );
    },
  },
};
</script>
