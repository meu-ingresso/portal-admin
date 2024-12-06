<template>
  <div class="event-list">
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
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },

  methods: {
    findBannerImage(event) {
      const banner = event.attachments.find((attach) => attach.type === 'image' && attach.name === 'banner');
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
