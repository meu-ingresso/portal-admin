<template>
  <v-row class="event-row">
    <v-col cols="1" class="event-status">
      <EventStatusBadge :text="statusText" />
    </v-col>
    <v-col cols="2">
      <v-img :src="image" class="event-image"></v-img>
    </v-col>
    <v-col cols="4">
      <h4 class="event-title">{{ title }}</h4>
      <p class="event-date">{{ formattedDate }}</p>
      <p class="event-location">{{ location }}</p>
    </v-col>
    <v-col cols="3" class="text-right">
      <p class="event-revenue">{{ formatToMoney(revenue) }}</p>
      <p class="event-revenue-today">{{ formatToMoney(revenueToday) }} hoje</p>
    </v-col>
    <v-col cols="2" class="text-right">
      <p class="event-tickets">{{ tickets }}</p>
      <p class="event-tickets-today">{{ ticketsToday }} hoje</p>
    </v-col>
  </v-row>
</template>

<script>
import { formatDateTimeToBr, formatRealValue } from '@/utils/formatters';
export default {
  props: {
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
  },
};
</script>

<style scoped>
.event-row {
  margin-bottom: 16px;
  background-color: #521f8e0d;
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
