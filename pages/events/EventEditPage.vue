<template>
  <v-container>
    <EventStepper :is-editing="true" :event-id="eventId" />
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      eventId: this.$route.params.id,
    };
  },
};
</script>
