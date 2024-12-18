<template>
  <v-card class="event-card" @click="goToEventDetail">
    <v-card-text>
      <h3 class="event-title mb-4">{{ title }}</h3>
      <div class="d-flex align-end justify-space-between">
        <div class="d-flex align-center justify-space-between w-full">
          <div class="d-flex flex-column align-start justify-space-between">
            <p class="event-revenue">{{ formatToMoney(revenue) }}</p>
            <p class="event-revenue-today">{{ formatToMoney(revenueToday) }} hoje</p>
          </div>
          <div class="d-flex flex-column align-start justify-space-between">
            <p class="event-tickets">{{ tickets }}</p>
            <p class="event-tickets-today">{{ ticketsToday }} hoje</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatDateTimeToBr, formatRealValue } from '@/utils/formatters';
export default {
  props: {
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    revenue: { type: Number, required: true },
    revenueToday: { type: Number, required: true },
    tickets: { type: Number, required: true },
    ticketsToday: { type: Number, required: true },
    statusText: { type: String, required: true },
  },

  computed: {
    formattedDate() {
      return formatDateTimeToBr(this.date);
    },
  },

  methods: {
    formatToMoney(value) {
      return formatRealValue(value);
    },
    goToEventDetail() {
      this.$router.push({ name: 'Detalhe de Eventos', params: { id: this.eventId } });
    },
  },
};
</script>

<style scoped>
.event-card {
  transition: transform 0.3s ease;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: none !important;
  margin-bottom: 16px;
  background-color: var(--tertiary);
}

.event-card:hover {
  transform: scale(1.005);
}
.event-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
}

.event-revenue,
.event-tickets {
  font-size: 16px;
  font-weight: bold;
  color: var(--font-black);
}
.event-date,
.event-location,
.event-revenue-today,
.event-tickets-today {
  font-size: 14px;
  color: gray;
}
</style>
