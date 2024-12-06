<template>
  <div>
    <div class="event-tickets-title">Ingressos Vendidos</div>
    <TicketRow
      v-for="ticket in tickets"
      :key="ticket.id"
      :name="ticket.name"
      :price="ticket.price"
      :status-text="ticket.status.name"
      :sold="ticket.total_quantity - ticket.remaining_quantity"
      :total="ticket.total_quantity" />
  </div>
</template>

<script>
export default {
  props: {
    tickets: { type: Array, required: true },
  },
};
</script>

<style scoped>
.event-tickets-title {
  font-size: 40px;
  font-weight: 700;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
}
</style>
