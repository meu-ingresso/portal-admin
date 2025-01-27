<template>
  <div v-if="currentEvent" class="event-details">
    <div class="event-details-wrapper">
      <h3 class="section-title">Informações Gerais</h3>

      <v-row>
        <v-col cols="12" md="6">
          <div class="info-card">
            <h4 class="card-title">Evento</h4>

            <div class="info-item">
              <span class="info-label">Nome do Evento:</span>
              <span class="info-value">{{ currentEvent.title || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Categoria:</span>
              <span class="info-value">{{ currentEvent.category?.name || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Classificação:</span>
              <span class="info-value">{{ currentEvent.rating?.name || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Tipo de Evento:</span>
              <span class="info-value">{{ currentEvent.event_type || '-' }}</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="info-card">
            <h4 class="card-title">Local e Data</h4>

            <div class="info-item">
              <span class="info-label">Nome:</span>
              <span class="info-value">{{ currentEvent.location_name || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Endereço:</span>
              <span class="info-value cursor-pointer" @click="handleMapDialog">{{
                fullAddress || '-'
              }}</span>

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

            <div class="info-item">
              <span class="info-label">Início:</span>
              <span class="info-value">{{
                formatDateTimeToBr(currentEvent.start_date) || '-'
              }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Término:</span>
              <span class="info-value">{{
                formatDateTimeToBr(currentEvent.end_date) || '-'
              }}</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <div class="info-card">
            <h4 class="card-title d-flex align-center">
              Descrição

              <v-spacer />
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    class="ml-2"
                    v-bind="attrs"
                    :disabled="isLoadingDescription"
                    v-on="on"
                    @click="handleImproveDescription">
                    <v-icon small color="primary">
                      {{ isLoadingDescription ? 'mdi-loading mdi-spin' : 'mdi-robot' }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>Melhorar descrição com IA</span>
              </v-tooltip>
            </h4>
            <div
              v-if="isLoadingDescription"
              class="d-flex justify-center align-center pa-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <p v-else class="info-text">{{ currentEvent.description || '-' }}</p>
          </div>

          <v-dialog v-model="improveDescriptionDialog" max-width="700px">
            <v-card>
              <v-card-title class="d-flex align-center">
                Melhorar Descrição com IA
                <v-spacer />
                <v-btn icon @click="improveDescriptionDialog = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text>
                <v-textarea
                  v-model="improvedDescription"
                  outlined
                  label="Descrição sugerida pela IA"
                  rows="10"
                  hide-details />
              </v-card-text>

              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  text
                  color="grey darken-1"
                  :disabled="isUpdatingDescription"
                  @click="improveDescriptionDialog = false">
                  Cancelar
                </v-btn>
                <v-btn
                  color="primary"
                  :loading="isUpdatingDescription"
                  :disabled="!improvedDescription || isUpdatingDescription"
                  @click="confirmImprovedDescription">
                  Aplicar Sugestão
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>

        <v-col cols="12" md="12">
          <div class="info-card">
            <h4 class="card-title">Configurações</h4>

            <v-row>
              <v-col cols="12" sm="6" md="3" class="pl-2">
                <div class="info-item mb-0 d-flex justify-space-between">
                  <div class="d-flex align-center">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon color="grey" v-bind="attrs" v-on="on">
                          mdi-information
                        </v-icon>
                      </template>
                      <span>
                        {{
                          currentEvent.is_featured
                            ? 'Este evento aparecerá em destaque na página inicial do site'
                            : 'Este evento não aparecerá em destaque na página inicial do site'
                        }}
                      </span>
                    </v-tooltip>

                    <span class="info-label ml-2">Evento em Destaque:</span>
                    <span class="info-value">{{
                      currentEvent.is_featured ? 'Sim' : 'Não'
                    }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="info-item mb-0 d-flex justify-space-between">
                  <div class="d-flex align-center">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon color="grey" v-bind="attrs" v-on="on">
                          mdi-information
                        </v-icon>
                      </template>
                      <span>
                        {{
                          currentEvent.absorb_service_fee
                            ? 'O organizador absorverá a taxa de serviço do ingresso'
                            : 'A taxa de serviço será repassada ao comprador do ingresso'
                        }}
                      </span>
                    </v-tooltip>

                    <span class="info-label ml-2">Absorver Taxa:</span>
                    <span class="info-value">{{
                      currentEvent.absorb_service_fee ? 'Sim' : 'Não'
                    }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="info-item mb-0">
                  <span class="info-label">Disponibilidade:</span>
                  <span class="info-value">{{ currentEvent.availability || '-' }}</span>
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <div class="info-item mb-0">
                  <span class="info-label">Tipo de Venda:</span>
                  <span class="info-value">{{ currentEvent.sale_type || '-' }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { formatDateTimeToBr } from '@/utils/formatters';
import { openAI, event } from '@/store';

export default {
  data() {
    return {
      mapDialog: false,
      improveDescriptionDialog: false,
      improvedDescription: '',
      isLoadingDescription: false,
      isUpdatingDescription: false,
    };
  },

  computed: {
    currentEvent() {
      return event.$selectedEvent;
    },

    fullAddress() {
      const address = this.currentEvent?.address;
      if (!address) return '';

      const parts = [
        address.street,
        address.number,
        address.complement ? `- ${address.complement}` : '',
        address.neighborhood,
        address.city,
        address.state,
      ].filter(Boolean);

      return parts.join(', ');
    },

    hasValidCoordinates() {
      const { latitude, longitude } = this.currentEvent?.address || {};
      return latitude && longitude && latitude !== '' && longitude !== '';
    },

    googleMapsEmbedUrl() {
      const { latitude, longitude } = this.currentEvent?.address || {};
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAnkqplDONBqIfUvJCGfFWpLXAhPPx8ig0&q=${latitude},${longitude}`;
    },
  },

  mounted() {
    // Garantir que temos os dados do evento
    if (!this.currentEvent && this.$route.params.id) {
      event.getById(this.$route.params.id);
    }
  },

  methods: {
    formatDateTimeToBr,

    handleMapDialog() {
      if (this.hasValidCoordinates) {
        this.mapDialog = !this.mapDialog;
      }
    },

    async handleImproveDescription() {
      try {
        this.isLoadingDescription = true;

        // Emitir evento para obter sugestão da IA
        const suggestion = await openAI.improveDescription({
          event_description: this.currentEvent?.description,
        });

        // Atualizar o texto sugerido e abrir o dialog
        this.improvedDescription =
          suggestion.body.result || this.currentEvent?.description;
        this.improveDescriptionDialog = true;
      } catch (error) {
        console.error('Erro ao obter sugestão da IA:', error);
      } finally {
        this.isLoadingDescription = false;
      }
    },

    async confirmImprovedDescription() {
      try {
        this.isUpdatingDescription = true;
        await event.updateEvent({
          id: this.currentEvent?.id,
          description: this.improvedDescription,
        });

        // Recarregar dados do evento
        await event.getById(this.currentEvent?.id);

        // Fechar o dialog apenas após sucesso da atualização
        this.improveDescriptionDialog = false;
      } catch (error) {
        console.error('Erro ao atualizar descrição:', error);
      } finally {
        this.isUpdatingDescription = false;
      }
    },
  },
};
</script>

<style scoped>
.event-details {
  padding-top: 16px;
}

.event-details-wrapper {
  max-width: 1480px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--black-text);
  font-family: var(--font-family-poppins-bold);
  margin-bottom: 16px;
}

.info-card {
  background-color: var(--tertiary);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  border: 0px !important;
}

.info-item {
  margin-bottom: 13px;
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--black-text);
  min-width: unset;
  margin-right: 8px;
}

.info-value {
  font-size: 14px;
  color: var(--black-text);
}

.info-text {
  color: var(--black-text);
  white-space: pre-line;
}

.cursor-pointer {
  cursor: pointer;
}

.v-icon {
  font-size: 20px !important;
}

@media (max-width: 360px) {
  .section-title {
    font-size: 16px;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .section-title {
    font-size: 18px;
  }
}

.v-textarea {
  font-family: inherit;
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
