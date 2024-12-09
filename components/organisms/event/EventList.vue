<template>
  <div v-if="!isLoadingEvents" class="event-list">
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
  </div>
  <v-row v-else class="align-center justify-center">
    <v-col v-for="n in 2" :key="n" cols="12">
      <v-skeleton-loader width="100%" type="card" />
    </v-col>
  </v-row>
</template>

<script>
import { event } from '@/store';
export default {
  props: {
    events: { type: Array, required: true },
  },

  computed: {
    isLoadingEvents() {
      return event.$isLoading;
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
