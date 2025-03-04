<template>
  <v-card class="event-card" @click="goToEventDetail">
    <v-img :src="getImage" class="event-image" alt="Event Image">
      <v-chip
        v-if="hasMultipleSessions"
        color="primary"
        small
        class="ma-2"
        dark>
        {{ sessionsCount }} datas disponíveis
      </v-chip>
    </v-img>

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
    image: { type: String, required: false, default: null },
    hasMultipleSessions: { type: Boolean, required: false, default: false },
    sessionsCount: { type: Number, required: false, default: 0 },
  },

  computed: {
    formattedDate() {
      return `${formatDateToCustomString(this.date)} - ${formatHourToBr(this.date)}`;
    },
    getImage() {
      if (!this.image) {
        return require(`~/assets/images/default_banner.png`);
      }

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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: scale(1.005);
}

.event-image {
  height: 200px !important;
  object-fit: cover;
  position: relative;
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
