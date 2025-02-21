<template>
  <div class="event-details-orders">
    <EventDetailsHeader />
    <v-row>
      <v-col cols="12">
        <div class="event-details-orders-title">Pedidos</div>
      </v-col>
      <v-col cols="12">
        <OrdersTable />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.event-details-orders {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}

.event-details-orders-title {
  font-weight: 600;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
  font-size: 26px;
}
</style> 