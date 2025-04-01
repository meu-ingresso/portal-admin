<template>
  <NuxtLink :to="`/events/${event.id}`">
    <v-card class="event-card mb-2" flat>
      <div class="event-date">
        <div class="date-day">{{ formatDay(event.start_date) }}</div>
        <div class="date-month">{{ formatMonth(event.start_date) }}</div>
      </div>
      <div class="event-details">
        <div class="event-name">{{ event.name }}</div>
        <div class="event-location">
          <template v-if="event.event_type === 'Online'">
            <v-icon small class="mr-1">mdi-web</v-icon>
            <span>Evento online</span>
          </template>
          <template v-else>
            <v-icon small class="mr-1">mdi-map-marker</v-icon>
            {{ event.location_name }}
          </template>
        </div>
      </div>
      <div class="event-stats">
        <div class="event-stat">
          <v-icon small>mdi-ticket</v-icon>
          <span>{{ event.totalizers.totalSales || 0 }}</span>
        </div>
        <div class="event-stat">
          <span>{{ formatRealValue(event.totalizers.totalSalesAmount || 0) }}</span>
        </div>
      </div>
    </v-card>
  </NuxtLink>
</template>

<script>
import { formatDateTimeToBr, formatRealValue, formatMonth } from '@/utils/formatters';
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
    formatRealValue,
    formatMonth,
    formatDay(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    },
  },
};
</script>

<style scoped>
.event-card {
  display: flex;
  background-color: var(--tertiary) !important;
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--primary, #1976d2);
  color: white;
  border-radius: 8px;
  padding: 8px;
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

.date-day {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-name {
  font-weight: 600;
  font-size: .875rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.event-location {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.event-status {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
}

.event-stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.event-stat {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4px;
}

.event-stat i {
  margin-right: 4px;
}
</style>
