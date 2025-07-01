<template>
  <NuxtLink :to="`/events/${event.id}`">
    <v-card class="event-card mb-2" flat>
      <div class="event-date">
        <div class="date-day">{{ displayDay }}</div>
        <div class="date-month">{{ displayMonth }}</div>
      </div>
      <div class="event-details">
        <div class="event-name">{{ event.name }}</div>
        <div class="event-date-range">{{ formattedDateRange }}</div>
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
import { formatDateTimeToBr, formatRealValue, formatMonth, formatDateRange, formatShortDate } from '@/utils/formatters';
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

    formattedDateRange() {
      if (this.event.hasSessions && this.event.sessionIds && this.event.sessionIds.length > 1) {
        // Calcular range de datas usando as informações do dateRange já processado
        if (this.event.dateRange && this.event.dateRange.isMultiSession) {
          const startDate = new Date(this.event.dateRange.startDate);
          const endDate = new Date(this.event.dateRange.endDate);

          return formatDateRange(startDate, endDate);
        }
      }

      // Se for um evento único no grupo
      return formatShortDate(this.event.start_date);
    },

    displayDay() {
      // Para eventos multi-sessão, mostra o dia da primeira sessão
      const dateToUse = this.event.hasSessions && this.event.dateRange
        ? this.event.dateRange.startDate
        : this.event.start_date;

      const date = new Date(dateToUse);
      return date.getDate();
    },

    displayMonth() {
      // Para eventos multi-sessão, mostra o mês da primeira sessão
      const dateToUse = this.event.hasSessions && this.event.dateRange
        ? this.event.dateRange.startDate
        : this.event.start_date;

      return formatMonth(dateToUse);
    }
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

.event-date-range {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
  font-weight: 500;
}

.event-location {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.event-sessions {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.7);
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
