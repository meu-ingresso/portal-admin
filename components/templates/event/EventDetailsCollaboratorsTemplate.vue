<template>
  <div class="event-details-wrapper">
    <EventCollaborator
      :event-id="getEvent.id"
      :collaborators="collaborators"/>
  </div>
</template>

<script>
import { eventGeneralInfo, eventCollaborators } from '@/store';

export default {

  computed: {
    getEvent() {
      return eventGeneralInfo.$info;
    },
    collaborators() {
      return eventCollaborators.$collaborators;
    },
  },

};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}
</style>
