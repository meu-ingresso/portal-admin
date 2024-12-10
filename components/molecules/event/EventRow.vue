<template>
  <v-row class="event-row cursor-pointer" @click="goToEventDetail">
    <v-col sm="12" md="2" class="event-status">
      <StatusBadge :text="statusText" />
    </v-col>

    <v-col sm="12" md="2">
      <v-img :src="image" class="event-image"></v-img>
    </v-col>

    <v-col sm="12" md="3">
      <h4 class="event-title">{{ title }}</h4>

      <p class="event-date">{{ formattedDate }}</p>

      <p class="event-location">{{ location }}</p>
    </v-col>

    <v-col sm="12" md="3" class="text-right">
      <p class="event-revenue">{{ formatToMoney(revenue) }}</p>

      <p class="event-revenue-today">{{ formatToMoney(revenueToday) }} hoje</p>
    </v-col>

    <v-col sm="12" md="2" class="text-right">
      <p class="event-tickets">{{ tickets }}</p>

      <p class="event-tickets-today">{{ ticketsToday }} hoje</p>
    </v-col>
  </v-row>
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
    image: { type: String, required: true },
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
.event-row:hover {
  transform: scale(1.005);
}

.event-row {
  transition: transform 0.3s ease;
  margin-bottom: 16px;
  background-color: var(--tertiary);
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 14px;
  padding-left: 14px;
}

.event-status {
  display: flex;
  align-items: center;
  justify-content: center;
}
.event-image {
  border-radius: 8px;
  max-width: 300px;
}
.event-title {
  font-size: 16px;
  font-weight: bold;
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
