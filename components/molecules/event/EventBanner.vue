<template>
  <v-card class="event-card" @click="goToEventDetail">
    <v-img :src="getImage" class="event-image" alt="Event Image" contain />

    <v-card-text>
      <h3 class="event-title">{{ title }}</h3>

      <p class="event-date">{{ formattedDate }}</p>

      <p class="event-location">{{ location }}</p>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';
export default {
  props: {
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
  },

  computed: {
    formattedDate() {
      return `${formatDateToCustomString(this.date)} - ${formatHourToBr(this.date)}`;
    },
    getImage() {
      if (this.image.startsWith('/assets')) {
        return require(`@/assets/${this.image.split('/assets/')[1]}`);
      }
      return this.image;
    },
  },

  methods: {
    goToEventDetail() {
      this.$router.push({ name: 'Detalhe de Eventos', params: { id: this.eventId } });
    },
  },
};
</script>

<style scoped>
.event-card {
  transition: transform 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 0px 7.24px 0px #00000029 !important;
}

.event-card:hover {
  transform: scale(1.005);
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
