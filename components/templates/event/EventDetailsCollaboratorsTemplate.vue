<template>
  <div class="event-details-wrapper">
    <EventCollaborator
      :event-id="getEvent.id"
      :collaborators="getEvent.collaborators"
      @added="handleCollaboratorAdded"
      @updated="handleCollaboratorUpdated"
      @deleted="handleCollaboratorDeleted" />
  </div>
</template>

<script>
import { eventGeneralInfo } from '@/store';

export default {
  name: 'EventDetailsCollaboratorsTemplate',

  computed: {
    getEvent() {
      return eventGeneralInfo.$info;
    },
  },

  methods: {
    async handleCollaboratorAdded() {
      await eventGeneralInfo.fetchEventById(this.getEvent.id);
    },

    async handleCollaboratorUpdated() {
      await eventGeneralInfo.fetchEventById(this.getEvent.id);
    },

    async handleCollaboratorDeleted() {
      await eventGeneralInfo.fetchEventById(this.getEvent.id);
    },
  },
};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}
</style>
