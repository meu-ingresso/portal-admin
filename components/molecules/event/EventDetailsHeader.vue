<template>
  <div class="event-details-header">
    <template v-if="!isMobile">
      <div class="event-title-wrapper mb-2">
        <div class="event-title">{{ title }}</div>

        <v-icon class="details-icon">mdi-circle-small</v-icon>

        <StatusBadge :text="statusText" />

        <PromotersBadge :count="promoters" />
      </div>

      <div class="location d-flex align-center mb-2">
        <v-icon class="mr-2 details-icon">mdi-map-marker</v-icon>

        <p>{{ location }}</p>
      </div>

      <div class="date d-flex align-center">
        <v-icon class="mr-2 details-icon">mdi-calendar</v-icon>

        <div class="d-flex align-center">
          <p>{{ formattedStartDate }}</p>
          <v-icon class="details-icon">mdi-circle-small</v-icon>
          <p>{{ formattedOpeningHour }}</p>
        </div>
        <div class="mr-2 ml-2">
          <v-icon class="details-icon">mdi-chevron-right</v-icon>
        </div>
        <div class="d-flex align-center">
          <p>{{ formattedEndDate }}</p>
          <v-icon class="details-icon">mdi-circle-small</v-icon>
          <p>{{ formattedEndingHour }}</p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="event-title-wrapper is-mobile mb-2">
        <div class="badge-list">
          <StatusBadge :text="statusText" class="mr-2" />

          <PromotersBadge :count="promoters" />
        </div>
        <div class="event-title is-mobile">{{ title }}</div>

        <div class="location d-flex align-center mb-2">
          <v-icon class="mr-2 details-icon is-mobile">mdi-map-marker</v-icon>

          <p class="location is-mobile">{{ location }}</p>
        </div>

        <div class="date is-mobile d-flex align-center">
          <v-icon class="mr-2 details-icon is-mobile">mdi-calendar</v-icon>

          <div class="d-flex align-center">
            <p>{{ formattedStartDate }}</p>
            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>
            <p>{{ formattedOpeningHour }}</p>
          </div>
          <div class="mr-2 ml-2">
            <v-icon class="details-icon is-mobile">mdi-chevron-right</v-icon>
          </div>
          <div class="d-flex align-center">
            <p>{{ formattedEndDate }}</p>
            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>
            <p>{{ formattedEndingHour }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    title: { type: String, default: '-' },
    statusText: { type: String, default: '-' },
    location: { type: String, default: '-' },
    startDate: { type: String, default: '-' },
    endDate: { type: String, default: '-' },
    openingHour: { type: String, default: '-' },
    endingHour: { type: String, default: '-' },
    promoters: { type: Number, default: 0 },
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
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

.event-title-wrapper.is-mobile {
  display: block;
}

.badge-list {
  display: flex;
  align-items: center;
}

.event-title {
  font-size: 40px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.event-title.is-mobile {
  margin-top: 20px;
  margin-bottom: 16px;
  font-size: 24px;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
}

.details-icon {
  color: var(--black-text);
}

.details-icon.is-mobile {
  font-size: .95rem !important;
}

.opening-icon,
.ending-icon {
  margin-right: 4px;
  font-size: 12px;
}

.opening-icon {
  color: var(--green);
}

.ending-icon {
  color: var(--red);
}

.location.is-mobile {
  font-size: 12px;
}

.date.is-mobile{
  font-size: .75rem;
}
</style>
