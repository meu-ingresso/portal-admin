<template>
  <div class="event-details-wrapper">
    <EventCollaborator :event-id="getEvent.id" :collaborators="collaborators" />
  </div>
</template>

<script>
export default {

  computed: {
    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },
    collaborators() {
      return this.$store.getters['eventCollaborators/$collaborators'];
    },
  },

};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}
</style>
