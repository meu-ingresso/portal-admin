<template>
  <div v-if="!isLoadingEvents" class="event-list">
    <template v-if="!isMobile">
      <EventRow
        v-for="event in events"
        :key="event.id"
        :event="event"
        :can-manage-event="canManageEvent"
        :image="findBannerImage(event)"
        :show-sessions-indicator="showSessionsIndicator"
        @approved-event="handleApprovedEvent"
        />
    </template>
    <template v-else>
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :can-manage-event="canManageEvent"
        :show-sessions-indicator="showSessionsIndicator" />
    </template>
  </div>

  <div v-else>
    <v-row class="d-flex align-center justify-center mt-4 mb-4">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
  </div>
</template>

<script>
import { event } from '@/store';
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    events: { type: Array, required: true },
    showSessionsIndicator: { type: Boolean, default: false },
  },

  computed: {
    isLoadingEvents() {
      return event.$isLoading;
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    userRole() {
      return this.$cookies.get('user_role');
    },
    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },
    canManageEvent() {
      return this.isAdmin;
    },
  },

  methods: {

    handleApprovedEvent(eventId) {
      try {
        const relatedEvent = this.events.find(event => event.id === eventId);
        if (relatedEvent) {
          const promoterId = relatedEvent?.promoter_id;
          if (promoterId) {
            this.$emit('check-promoter', promoterId);
          }
        }
        
      } catch (error) {
        console.error('Erro ao verificar promotor', error);
      }
    },

    findBannerImage(event) {
      const banner = event.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );
      return banner ? banner.url : '/assets/images/default_banner.png';
    },
  },
};
</script>

<style scoped>
.event-list {
  margin-top: 16px;
}
</style>
