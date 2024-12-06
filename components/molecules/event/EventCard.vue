<template>
  <v-card class="event-card">
    <v-img :src="image" class="event-image" alt="Event Image" contain></v-img>
    <v-card-text>
      <h3 class="event-title">{{ title }}</h3>
      <p class="event-date">{{ formattedDate }}</p>
      <p class="event-location">{{ location }}</p>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatDateTimeToBr } from '@/utils/formatters';
export default {
  props: {
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
  },
  computed: {
    formattedDate() {
      return formatDateTimeToBr(this.date);
    },
  },
};
</script>

<style scoped>
.event-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 0px 7.24px 0px #00000029 !important;
}
.event-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
}

.event-date {
  color: var(--black-text);
  font-weight: 600;
  font-size: 14px;
}
.event-location {
  color: var(--black-text);
  font-weight: 400;
  font-size: 14px;
}
</style>
