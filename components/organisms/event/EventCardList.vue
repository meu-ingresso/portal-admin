<template>
  <v-row>
    <v-col v-for="event in events" :key="event.id" cols="12" md="4" sm="12">
      <EventCard
        :title="event.name"
        :date="event.start_date"
        :location="event.location_name || 'Local não definido'"
        :image="defaultImage" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    events: { type: Array, required: true },
  },
  data() {
    return {
      defaultImage:
        'https://d2s7f8q1bxluur.cloudfront.net/gYXnIIwLdURfffTGlV4yNiHTGLs=/545x286/https%3A//s3-sa-east-1.amazonaws.com/s3-eventos-saas/media/eventos/481c26e8-1fdb-4c6d-8c1c-cd73f27c5f09.png',
    };
  },
};
</script>