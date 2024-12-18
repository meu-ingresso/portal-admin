<template>
  <div v-if="!isLoadingEvents" class="event-list">
    <template v-if="!isMobile">
      <EventRow
        v-for="event in events"
        :key="event.id"
        :event-id="event.id"
        :title="event.name"
        :date="event.start_date"
        :location="event.location"
        :revenue="event.totalizers.totalSalesAmout"
        :revenue-today="event.totalizers.totalSalesAmountToday"
        :tickets="event.totalizers.totalSales"
        :tickets-today="event.totalizers.totalSalesToday"
        :status-text="event.status.name"
        :image="findBannerImage(event)" />
    </template>
    <template v-else>
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event-id="event.id"
        :title="event.name"
        :date="event.start_date"
        :location="event.location"
        :revenue="event.totalizers.totalSalesAmout"
        :revenue-today="event.totalizers.totalSalesAmountToday"
        :tickets="event.totalizers.totalSales"
        :tickets-today="event.totalizers.totalSalesToday"
        :status-text="event.status.name"/>
    </template>
  </div>

  <div v-else>
    <v-row class="d-flex align-center justify-center mt-4 mb-4">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
  </div>
</template>

<script>
import { event } from '@/store';
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    events: { type: Array, required: true },
  },

  computed: {
    isLoadingEvents() {
      return event.$isLoading;
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    findBannerImage(event) {
      const banner = event.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );
      return banner ? banner.image_url : '';
    },
  },
};
</script>

<style scoped>
.event-list {
  margin-top: 16px;
}
</style>
