<template>
  <div class="event-details-header">
    <div class="event-title-wrapper mb-2">
      <div class="event-title">{{ title }}</div>

      <v-icon>mdi-circle-small</v-icon>

      <StatusBadge :text="statusText" />

      <PromotersBadge :count="promoters" />
    </div>

    <div class="location d-flex align-center mb-2">
      <v-icon class="mr-2">mdi-map-marker</v-icon>

      <p>{{ location }}</p>
    </div>

    <div class="date d-flex align-center">
      <v-icon class="mr-2">mdi-calendar</v-icon>

      <div class="d-flex align-center">
        <p>{{ formattedStartDate }}</p>
        <v-icon>mdi-circle-small</v-icon>
        <p>{{ formattedOpeningHour }}</p>
      </div>
      <div class="mr-2 ml-2">-</div>
      <div class="d-flex align-center">
        <p>{{ formattedEndDate }}</p>
        <v-icon>mdi-circle-small</v-icon>
        <p>{{ formattedEndingHour }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';
export default {
  props: {
    title: { type: String, required: true },
    statusText: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    openingHour: { type: String, required: true },
    promoters: { type: Number, required: true },
  },

  computed: {
    formattedStartDate() {
      return formatDateToCustomString(this.startDate);
    },
    formattedOpeningHour() {
      return formatHourToBr(this.openingHour);
    },
    formattedEndDate() {
      return formatDateToCustomString(this.endDate);
    },
    formattedEndingHour() {
      return formatHourToBr(this.openingHour);
    },
  },
};
</script>

<style scoped>
.event-details-header {
  margin-bottom: 24px;
}
.event-title-wrapper {
  display: flex;
  align-items: center;
}

.event-title {
  font-size: 40px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}
</style>
