<template>
  <div v-if="getEvent" class="event-details-header">
    <template v-if="!isMobile">
      <div class="event-title-wrapper mb-2">
        <div class="event-title">{{ getEvent.name }}</div>

        <v-icon class="details-icon">mdi-circle-small</v-icon>

        <StatusBadge v-if="getEventStatus" :text="getEventStatus" />

        <NuxtLink :to="`/events/${getEvent.id}/promoters`">
          <PromotersBadge :count="getEvent.collaborators.length" class="cursor-pointer" />
        </NuxtLink>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon
              v-bind="attrs"
              color="primary"
              size="30"
              class="ml-3 cursor-pointer"
              v-on="on"
              @click="openFeeModal">
              mdi-sack-percent
            </v-icon>
          </template>
          <span> Taxa negociada: {{ getEvent.fees.platform_fee }}% </span>
        </v-tooltip>
      </div>

      <div class="alias d-flex align-center">
        <v-icon class="mr-2 details-icon">mdi-link</v-icon>

        <div class="d-flex align-center">
          <a :href="aliasUrl" target="_blank">{{ aliasUrl }}</a>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                size="16"
                class="ml-2 cursor-pointer"
                v-on="on"
                @click="copyAlias">
                mdi-content-copy
              </v-icon>
            </template>
            <span>Copiar link do evento</span>
          </v-tooltip>
        </div>
      </div>

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

      <!-- Informações de Localização/Link -->
      <template v-if="isOnlineOrHybridEvent">
        <div class="online-event d-flex align-center mb-2">
          <v-icon class="mr-2 details-icon">mdi-web</v-icon>

          <a :href="onlineLink" target="_blank" class="online-link">
            {{ onlineLink }}
          </a>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                size="16"
                class="ml-2 cursor-pointer"
                v-on="on"
                @click="copyOnlineLink">
                mdi-content-copy
              </v-icon>
            </template>
            <span>Copiar link do evento online</span>
          </v-tooltip>
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
          <v-icon class="mr-2 details-icon">mdi-web</v-icon>

          <a :href="onlineLink" target="_blank" class="online-link">
            {{ onlineLink }}
          </a>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                size="16"
                class="ml-2 cursor-pointer"
                v-on="on"
                @click="copyOnlineLink">
                mdi-content-copy
              </v-icon>
            </template>
            <span>Copiar link do evento online</span>
          </v-tooltip>
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
    </template>

    <template v-else>
      <div class="event-title-wrapper is-mobile mb-2">
        <div class="badge-list justify-center">
          <StatusBadge v-if="getEventStatus" :text="getEventStatus" class="mr-2" />

          <NuxtLink :to="`/events/${getEvent.id}/promoters`">
            <PromotersBadge
              :count="getEvent.collaborators.length"
              class="cursor-pointer" />
          </NuxtLink>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                color="primary"
                size="30"
                class="ml-3 cursor-pointer"
                v-on="on"
                @click="openFeeModal">
                mdi-sack-percent
              </v-icon>
            </template>
            <span> Taxa negociada: {{ getEvent.fees.platform_fee }}% </span>
          </v-tooltip>
        </div>
        <div class="event-title is-mobile">{{ getEvent.name }}</div>

        <!-- Informações de Localização/Link Mobile -->
        <template v-if="isOnlineOrHybridEvent">
          <div class="online-event d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-web</v-icon>
            <p class="online-link is-mobile">{{ onlineLink }}</p>
          </div>

          <div class="location d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-map-marker</v-icon>
            <p class="location is-mobile">{{ getEventLocation }}</p>
          </div>
        </template>

        <template v-else-if="isOnlineEvent">
          <div class="online-event d-flex align-center mb-2">
            <v-icon class="mr-2 details-icon is-mobile">mdi-web</v-icon>
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

    <v-dialog v-model="feeDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3 class="modalTitle">Configurar Taxa Negociada</h3>

          <v-btn icon :disabled="isChangingFee" @click="closeFeeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="feeForm" v-model="isFormValid">
            <v-text-field
              v-model="negotiatedFee"
              outlined
              dense
              min="0"
              max="99"
              type="number"
              hide-details="auto"
              label="Taxa negociada"
              :rules="[
                (v) => !!v || 'Campo obrigatório',
                (v) => v >= 0 || 'Deve ser maior que 0',
                (v) => v < 100 || 'Deve ser menor que 100',
              ]"
              suffix="%" />
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between">
          <DefaultButton
            text="Cancelar"
            outlined
            :disabled="isChangingFee"
            @click="closeFeeModal" />

          <DefaultButton
            text="Salvar"
            :disabled="!isFormValid || isChangingFee || !isDifferentFee"
            :is-loading="isChangingFee"
            @click="saveFee" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  formatDateToCustomString,
  formatHourToBr,
  formatDateTimeToBr,
} from '@/utils/formatters';
import { isMobileDevice, isUserAdmin } from '@/utils/utils';
import { toast, eventGeneralInfo } from '@/store';

export default {
  data() {
    return {
      mapDialog: false,
      feeDialog: false,
      isFormValid: true,
      isChangingFee: false,
      negotiatedFee: 0,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isAdmin() {
      return isUserAdmin(this.$cookies);
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

    isDifferentFee() {
      return this.getEvent.fees.platform_fee !== this.negotiatedFee;
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

    openFeeModal() {
      if (!this.isAdmin) return;

      this.negotiatedFee = this.getEvent.fees.platform_fee;

      this.feeDialog = true;
    },

    closeFeeModal() {
      this.feeDialog = false;
    },

    async saveFee() {
      if (this.$refs.feeForm.validate()) {
        const payload = {
          feeId: this.getEvent.fees.id,
          platformFee: Number(this.negotiatedFee.replace(',', '.')),
        };

        try {
          this.isChangingFee = true;
          await eventGeneralInfo.updatePlatformFee(payload);

          this.closeFeeModal();

          toast.setToast({
            text: 'Taxa negociada atualizada com sucesso!',
            type: 'success',
            time: 5000,
          });
        } catch (error) {
          toast.setToast({
            text: 'Erro ao atualizar taxa negociada!',
            type: 'error',
            time: 5000,
          });
        } finally {
          this.isChangingFee = false;
        }
      }
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
  font-size: 26px;
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
