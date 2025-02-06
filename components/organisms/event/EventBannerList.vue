<template>
  <v-row>
    <v-col v-for="event in events" :key="event.id" cols="12" md="4" sm="12">
      <EventBanner
        :event-id="event.id"
        :title="event.name"
        :date="event.start_date"
        :location="event.location_name || 'Local não definido'"
        :image="getImage(event)" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },

  methods: {
    getImage(event) {
      const banner = event.attachments.find(
        (attach) => attach.type === 'image' && attach.name === 'banner'
      );

      return banner && banner?.url ? banner?.url : '/assets/images/default_banner.png';
    },
  },
};
</script>
