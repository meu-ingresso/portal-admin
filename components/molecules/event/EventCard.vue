<template>
  <NuxtLink :to="`/events/${event.id}`">
    <v-card class="event-card">
      <v-card-text>
        <div class="d-flex align-items-center">
          <h3 class="event-title mb-4">{{ event.title }}</h3>
          <v-chip
            v-if="showSessionsIndicator && event.hasSessions"
            color="primary"
            small
            class="ml-2"
            dark>
            {{ event.sessionsCount }} datas disponíveis
          </v-chip>
        </div>
        <div class="d-flex align-end justify-space-between">
          <div class="d-flex align-center justify-space-between w-full">
            <div class="d-flex flex-column align-start justify-space-between">
              <p class="event-revenue">{{ formatToMoney(event.totalizers.totalSalesAmount) }}</p>
              <p class="event-revenue-today">{{ formatToMoney(event.totalizers.totalSalesAmountToday) }} hoje</p>
            </div>
            <div class="d-flex flex-column align-start justify-space-between">
              <p class="event-tickets">{{ event.totalizers.totalSales  }}</p>
              <p class="event-tickets-today">{{  event.totalizers.totalSalesToday  }} hoje</p>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </NuxtLink>
</template>

<script>
import { formatDateTimeToBr, formatRealValue } from '@/utils/formatters';
export default {
  props: {
    event: { type: Object, required: true },
    canManageEvent: { type: Boolean, required: true },
    showSessionsIndicator: { type: Boolean, default: false },
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
