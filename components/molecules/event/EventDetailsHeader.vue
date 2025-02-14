<template>
  <div v-if="getEvent" class="event-details-header">
    <template v-if="!isMobile">
      <div class="event-title-wrapper mb-2">
        <div class="event-title">{{ getEvent.name }}</div>
        <v-icon class="details-icon">mdi-circle-small</v-icon>
        <StatusBadge v-if="getEventStatus" :text="getEventStatus" />
        <PromotersBadge :count="getEvent.collaborators.length" />
      </div>

      <!-- Informações de Localização/Link -->
      <template v-if="isOnlineOrHybridEvent">
        <div class="online-event d-flex align-center mb-2">
          <v-icon class="mr-2 details-icon">mdi-video</v-icon>
          <a :href="onlineLink" target="_blank" class="online-link">
            {{ onlineLink }}
          </a>
          <v-icon size="16" class="ml-2 cursor-pointer" @click="copyOnlineLink">
            mdi-content-copy
          </v-icon>
        </div>
        <div class="location d-flex align-center mb-2 cursor-pointer">
          <v-icon class="mr-2 details-icon">mdi-map-marker</v-icon>

          <p @click="handleMapDialog">{{ getEventLocation }}</p>

          <v-dialog v-if="hasValidCoordinates" v-model="mapDialog" width="500">
            <v-card>
              <v-card-title>
                <b>{{ getEvent.name }}</b>
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
      </template>
      <template v-else-if="isOnlineEvent">
        <div class="online-event d-flex align-center mb-2">
          <v-icon class="mr-2 details-icon">mdi-video</v-icon>
          <a :href="onlineLink" target="_blank" class="online-link">
            {{ onlineLink }}
          </a>
          <v-icon size="16" class="ml-2 cursor-pointer" @click="copyOnlineLink">
            mdi-content-copy
          </v-icon>
        </div>
      </template>
      <template v-else>
        <div class="location d-flex align-center mb-2 cursor-pointer">
          <v-icon class="mr-2 details-icon">mdi-map-marker</v-icon>

          <p @click="handleMapDialog">{{ getEventLocation }}</p>

          <v-dialog v-if="hasValidCoordinates" v-model="mapDialog" width="500">
            <v-card>
              <v-card-title>
                <b>{{ getEvent.name }}</b>
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
      </template>

      <div class="date d-flex align-center">
        <v-icon class="mr-2 details-icon">mdi-calendar</v-icon>

        <div class="d-flex align-center">
          <p>{{ formatDateToCustomString(getEvent.start_date) }}</p>
          <v-icon class="details-icon">mdi-circle-small</v-icon>

          <p>{{ getEvent.start_time }}</p>
        </div>

        <div class="mr-2 ml-2">
          <v-icon class="details-icon">mdi-chevron-right</v-icon>
        </div>

        <div class="d-flex align-center">
          <p>{{ formatDateToCustomString(getEvent.end_date) }}</p>

          <v-icon class="details-icon">mdi-circle-small</v-icon>

          <p>{{ getEvent.end_time }}</p>
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
          <StatusBadge v-if="getEventStatus" :text="getEventStatus" class="mr-2" />
          <PromotersBadge :count="getEvent.collaborators.length" />
        </div>
        <div class="event-title is-mobile">{{ getEvent.name }}</div>

        <!-- Informações de Localização/Link Mobile -->
        <template v-if="isOnlineOrHybridEvent">
          <div class="online-event d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-video</v-icon>
            <p class="online-link is-mobile">{{ onlineLink }}</p>
          </div>
          <div class="location d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-map-marker</v-icon>
            <p class="location is-mobile">{{ getEventLocation }}</p>
          </div>
        </template>
        <template v-else-if="isOnlineEvent">
          <div class="online-event d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-video</v-icon>
            <p class="online-link is-mobile">{{ onlineLink }}</p>
          </div>
        </template>
        <template v-else>
          <div class="location d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-map-marker</v-icon>
            <p class="location is-mobile">{{ getEventLocation }}</p>
          </div>
        </template>

        <div class="date is-mobile d-flex align-center">
          <v-icon class="mr-2 details-icon is-mobile">mdi-calendar</v-icon>

          <div class="d-flex align-center">
            <p>{{ formatDateToCustomString(getEvent.start_date) }}</p>

            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>

            <p>{{ getEvent.start_time }}</p>
          </div>

          <div class="mr-2 ml-2">
            <v-icon class="details-icon is-mobile">mdi-chevron-right</v-icon>
          </div>

          <div class="d-flex align-center">
            <p>{{ formatDateToCustomString(getEvent.end_date) }}</p>

            <v-icon class="details-icon is-mobile">mdi-circle-small</v-icon>

            <p>{{ getEvent.end_time }}</p>
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
import { toast, eventGeneralInfo } from '@/store';

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

    onlineLink() {
      if (!this.isOnlineOrHybridEvent) return '';

      const linkOnline = this.getEvent?.attachments?.find(
        (attachment) => attachment.name === 'link_online'
      );

      return linkOnline?.url;
    },

    currentEventType() {
      return eventGeneralInfo.$info?.event_type;
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },

    getEventLocation() {
      return eventGeneralInfo.$formattedLocation;
    },

    getEventStatus() {
      return this.getEvent?.status?.name;
    },

    isOnlineOrHybridEvent() {
      return this.currentEventType === 'Online' || this.currentEventType === 'Híbrido';
    },

    isOnlineEvent() {
      return this.currentEventType === 'Online';
    },

    hasValidCoordinates() {
      const { latitude, longitude } = this.getEvent?.address || {};
      return latitude && longitude && latitude !== '' && longitude !== '';
    },

    googleMapsEmbedUrl() {
      if (!this.hasValidCoordinates) return '';
      const { latitude, longitude } = this.getEvent?.address || {};
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAnkqplDONBqIfUvJCGfFWpLXAhPPx8ig0&q=${latitude},${longitude}`;
    },

    aliasUrl() {
      return `https://meuingresso.com.br/evento/${this.getEvent?.alias}`;
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
      this.showCopyToast('Link copiado com sucesso!');
    },

    copyOnlineLink() {
      navigator.clipboard.writeText(this.onlineLink);
      this.showCopyToast('Link do evento online copiado com sucesso!');
    },

    showCopyToast(message) {
      toast.setToast({
        text: message,
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

.online-event {
  color: var(--black-text);
}

.online-link {
  color: var(--primary);
  text-decoration: none;
}

.online-link:hover {
  text-decoration: underline;
}

.online-link.is-mobile {
  font-size: 12px;
  word-break: break-all;
}
</style>
