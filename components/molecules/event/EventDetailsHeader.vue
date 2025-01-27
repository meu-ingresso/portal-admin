<template>
  <div v-if="currentEvent" class="event-details-header">
    <template v-if="!isMobile">
      <div class="event-title-wrapper mb-2">
        <div class="event-title">{{ currentEvent.title }}</div>

        <v-icon class="details-icon">mdi-circle-small</v-icon>

        <StatusBadge :text="currentEvent.statusText" />

        <PromotersBadge :count="currentEvent.promoters" />
      </div>

      <div class="location d-flex align-center mb-2 cursor-pointer">
        <v-icon class="mr-2 details-icon">mdi-map-marker</v-icon>

        <p @click="handleMapDialog">{{ currentEvent.location }}</p>

        <v-dialog v-if="hasValidCoordinates" v-model="mapDialog" width="500">
          <v-card>
            <v-card-title>
              <b>{{ currentEvent.title }}</b>
              <v-spacer />
              <v-btn icon @click="handleMapDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <iframe
                :src="googleMapsEmbedUrl"
                width="100%"
                height="450"
                frameborder="0"
                style="border: 0"
                allowfullscreen
                loading="lazy">
              </iframe>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>

      <div class="date d-flex align-center">
        <v-icon class="mr-2 details-icon">mdi-calendar</v-icon>

        <div class="d-flex align-center">
          <p>{{ formatDateToCustomString(currentEvent.start_date) }}</p>
          <v-icon class="details-icon">mdi-circle-small</v-icon>

          <p>{{ formatHourToBr(currentEvent.start_date) }}</p>
        </div>

        <div class="mr-2 ml-2">
          <v-icon class="details-icon">mdi-chevron-right</v-icon>
        </div>

        <div class="d-flex align-center">
          <p>{{ formatDateToCustomString(currentEvent.end_date) }}</p>

          <v-icon class="details-icon">mdi-circle-small</v-icon>

          <p>{{ formatHourToBr(currentEvent.end_date) }}</p>
        </div>
      </div>

      <div class="alias d-flex align-center">
        <v-icon class="mr-2 details-icon">mdi-link</v-icon>

        <div class="d-flex align-center">
          <a :href="aliasUrl" target="_blank">{{ aliasUrl }}</a>

          <v-icon size="16" class="ml-2" @click="copyAlias">mdi-content-copy</v-icon>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="event-title-wrapper is-mobile mb-2">
        <div class="badge-list">
          <StatusBadge :text="currentEvent.statusText" class="mr-2" />

          <PromotersBadge :count="currentEvent.promoters" />
        </div>
        <div class="event-title is-mobile">{{ currentEvent.title }}</div>

        <div class="location d-flex align-center mb-2">
          <v-icon class="mr-2 details-icon is-mobile">mdi-map-marker</v-icon>

          <p class="location is-mobile">{{ currentEvent.location }}</p>
        </div>

        <div class="date is-mobile d-flex align-center">
          <v-icon class="mr-2 details-icon is-mobile">mdi-calendar</v-icon>

          <div class="d-flex align-center">
            <p>{{ formatDateToCustomString(currentEvent.start_date) }}</p>

            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>

            <p>{{ formatHourToBr(currentEvent.start_date) }}</p>
          </div>

          <div class="mr-2 ml-2">
            <v-icon class="details-icon is-mobile">mdi-chevron-right</v-icon>
          </div>

          <div class="d-flex align-center">
            <p>{{ formatDateToCustomString(currentEvent.end_date) }}</p>

            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>

            <p>{{ formatHourToBr(currentEvent.end_date) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  formatDateToCustomString,
  formatHourToBr,
  formatDateTimeToBr,
} from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import { toast, event } from '@/store';

export default {
  data() {
    return {
      mapDialog: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    currentEvent() {
      return event.$selectedEvent;
    },

    hasValidCoordinates() {
      const { latitude, longitude } = this.currentEvent?.address || {};
      return latitude && longitude && latitude !== '' && longitude !== '';
    },

    googleMapsEmbedUrl() {
      if (!this.hasValidCoordinates) return '';
      const { latitude, longitude } = this.currentEvent.address;
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAnkqplDONBqIfUvJCGfFWpLXAhPPx8ig0&q=${latitude},${longitude}`;
    },

    aliasUrl() {
      return `https://meuingresso.com.br/evento/${this.currentEvent.alias}`;
    },
  },

  methods: {
    formatDateToCustomString,
    formatHourToBr,
    formatDateTimeToBr,

    handleMapDialog() {
      if (this.hasValidCoordinates) {
        this.mapDialog = !this.mapDialog;
      }
    },

    copyAlias() {
      navigator.clipboard.writeText(this.aliasUrl);

      toast.setToast({
        text: `Link copiado com sucesso!`,
        type: 'success',
        time: 5000,
      });
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
  font-size: 0.95rem !important;
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

.date.is-mobile {
  font-size: 0.75rem;
}

.alias {
  padding-top: 5px;
}
</style>
