<template>
  <div class="checkin-container">
    <h2 class="mb-6">Check-in do Evento</h2>

    <v-tabs v-model="activeTab" background-color="white" grow>
      <v-tab value="tickets">
        <v-icon left>mdi-ticket</v-icon>
        Ingressos
      </v-tab>
      <v-tab value="guests">
        <v-icon left>mdi-account-group</v-icon>
        Convidados
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item value="tickets">
        <CheckinTicketsTable />
      </v-tab-item>
      <v-tab-item value="guests">
        <CheckinGuestsTable />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
export default {
  data: () => ({
    activeTab: 'tickets',
  }),
};
</script> 