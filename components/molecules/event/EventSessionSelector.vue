<template>
  <div v-if="sessions.length > 1" class="event-session-selector">
    <v-select
      v-model="selectedSession"
      :items="sessions"
      item-text="formattedDate"
      item-value="id"
      label="Selecione a data do evento"
      dense
      outlined
      class="session-select"
      @change="handleSessionChange"
    >
      <template #selection="{ item }">
        <v-icon small class="mr-2">mdi-calendar</v-icon>
        {{ item.formattedDate }}
      </template>
      <template #item="{ item }">
        <v-icon small class="mr-2">mdi-calendar</v-icon>
        {{ item.formattedDate }}
      </template>
    </v-select>
  </div>
</template>

<script>
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';
import { eventGeneralInfo } from '@/store';

export default {
  name: 'EventSessionSelector',

  data() {
    return {
      selectedSession: null,
    };
  },

  computed: {
    currentEvent() {
      return eventGeneralInfo.$info;
    },

    sessions() {
      if (!this.currentEvent?.groups?.[0]?.id) return [];

      const currentGroupId = this.currentEvent.groups[0].id;
      
      return eventGeneralInfo.$eventList
        .filter(event => 
          event.groups?.length && 
          event.groups[0].id === currentGroupId
        )
        .map(event => ({
          id: event.id,
          date: event.start_date,
          formattedDate: `${formatDateToCustomString(event.start_date)} - ${formatHourToBr(event.start_date)}`,
          status: event.status_id,
          isCurrentSession: event.id === this.currentEvent.id
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  },

  watch: {
    currentEvent: {
      immediate: true,
      handler(newEvent) {
        if (newEvent?.id) {
          this.selectedSession = newEvent.id;
        }
      },
    },
  },

  methods: {
    handleSessionChange(newSessionId) {
      if (newSessionId !== this.currentEvent.id) {
        this.$router.push({
          name: this.$route.name,
          params: { ...this.$route.params, id: newSessionId },
        });
      }
    },
  },
};
</script>

<style scoped>
.event-session-selector {
  margin-bottom: 16px;
}

.session-select {
  max-width: 400px;
}
</style> 