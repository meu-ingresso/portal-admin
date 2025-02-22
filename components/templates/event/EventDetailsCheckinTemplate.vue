<template>
  <div class="event-details-checkin">
    <EventDetailsHeader />
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="event-details-checkin-title">Check-in</div>
      </v-col>
      <v-col cols="12" md="12" sm="12">
        <v-tabs v-model="activeTab" background-color="white" grow class="custom-tabs">
          <v-tab>
            <v-icon left>mdi-ticket</v-icon>
            Participantes
          </v-tab>
          <v-tab>
            <v-icon left>mdi-account-group</v-icon>
            Convidados
          </v-tab>
        </v-tabs>

        <CheckinTicketsTable v-if="activeTab === 0" />
        <CheckinGuestsTable v-if="activeTab === 1" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    activeTab: 0,
  }),
};
</script>

<style scoped>
.event-details-checkin {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}

.event-details-checkin-title {
  font-weight: 600;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
  font-size: 26px;
}

.custom-tabs {
  margin-bottom: 16px;
}

:deep(.theme--light.v-tabs > .v-tabs-bar) {
  background-color: var(--tertiary) !important;
}
</style>
