<template>
  <EventDetailsTemplate v-if="selectedEvent" :event="selectedEvent" />
  <Loading v-else />
</template>

<script>
import { event, loading } from '@/store';
import { formatRealValue } from '@/utils/formatters';
export default {
  computed: {
    selectedEvent() {
      const selectedEvent = event.$selectedEvent;
      if (!selectedEvent) return null;

      const ticketsTypes = selectedEvent.tickets.map((ticket) => ticket.name);

      const ticketSales = selectedEvent.tickets.filter(
        (ticket) => ticket.total_quantity > ticket.remaining_quantity
      );

      return {
        ...selectedEvent,
        title: selectedEvent.name,
        statusText: selectedEvent.status.name,
        date: selectedEvent.start_date,
        statistics: [
          { title: 'Visualizações', value: 0 },
          { title: 'Visibilidade', value: selectedEvent.availability },
          { title: 'Tipos de ingressos', value: `${ticketsTypes.length} Tipos` },
          {
            title: 'Códigos Promocionais',
            value: `${selectedEvent.coupons.length} Códigos`,
          },
        ],
        sales: [
          { title: 'Ingressos Vendidos', value: ticketSales.length },
          {
            title: 'Vendas',
            value: formatRealValue(selectedEvent.totalizers.totalSalesAmout),
          },
        ],
        promoters: selectedEvent.collaborators.length,
        tickets: selectedEvent.tickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          sold: ticket.total_quantity - ticket.remaining_quantity,
          total: ticket.total_quantity,
          status: ticket.status.name,
        })),
      };
    },
    isLoadingEvents() {
      return event.$isLoading;
    },
  },

  async mounted() {
    loading.setIsLoading(true);
    await event.getById(this.$route.params.id);
    loading.setIsLoading(false);
  },
};
</script>

