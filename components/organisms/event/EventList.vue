<template>
  <div class="event-list">
    <EventRow
      v-for="event in events"
      :key="event.id"
      :title="event.name"
      :date="event.start_date"
      :location="formatedLocation(event)"
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
    formatedLocation(event) {
      return event.address
        ? `${event.address.street}, ${event.address.number} - ${event.address.neighborhood}, ${event.address.city.name} - ${event.address.city.state.name}`
        : 'Local não definido';
    },
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
