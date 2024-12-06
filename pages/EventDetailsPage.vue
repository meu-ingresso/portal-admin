<template>
  <EventDetailsTemplate v-if="selectedEvent" :event="selectedEvent" />
</template>

<script>
import { event } from '@/store';
export default {

  computed: {
    selectedEvent() {
        const selectedEvent = event.$selectedEvent;
        if (!selectedEvent) return null;

        const ticketsTypes = selectedEvent.tickets.map((ticket) => ticket.name);

        return {
            ...selectedEvent,
            title: selectedEvent.name,
            statusText: selectedEvent.status.name,
            date: selectedEvent.start_date,
            statistics: [
                { title: "Visualizações", value: 0 },
                { title: "Visibilidade", value: selectedEvent.availability },
                { title: "Tipos de ingressos", value: `${ticketsTypes.lenght} Tipos` },
            ],
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
    await event.getById(this.$route.params.id);
  },
};
</script>

