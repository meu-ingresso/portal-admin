<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    persistent
    transition="dialog-top-transition"
    class="event-edit-form">
    <v-card>
      <v-card-title>
        <h3>Editar Evento</h3>
        <v-spacer />
        <v-icon class="close-button" @click="close">mdi-close</v-icon>
      </v-card-title>

      <v-card-text v-if="!isLoading">
        <v-container>
          <v-form ref="form" v-model="isFormValid">
            <div class="section-wrapper">
              <v-row>
                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="editedEvent.name"
                    label="Nome do Evento"
                    outlined
                    dense
                    :rules="validationRules.eventName" />
                </v-col>
              </v-row>

              <v-row class="mt-0">
                <v-col cols="12" md="6">
                  <v-select
                    ref="category"
                    v-model="editedEvent.category_id"
                    label="Categoria"
                    :items="categories"
                    outlined
                    dense
                    hide-details="auto"
                    required
                    :rules="validationRules.category" />
                </v-col>

                <v-col cols="12" md="3">
                  <v-select
                    ref="event_type"
                    v-model="editedEvent.event_type"
                    label="Tipo de Evento"
                    :items="types"
                    outlined
                    dense
                    hide-details="auto"
                    required
                    :rules="validationRules.rating" />
                </v-col>

                <v-col cols="12" md="3">
                  <RatingSelect
                    ref="rating"
                    v-model="currentRating"
                    :value="currentRating"
                    :ratings="ratings" />
                </v-col>
              </v-row>
            </div>

            <!-- Descrição -->
            <div class="section-wrapper">
              <h4 class="section-title d-flex align-center">
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
                      <v-icon color="primary" size="24"> mdi-robot </v-icon>
                    </v-btn>
                  </template>
                  <span>Melhorar descrição com IA</span>
                </v-tooltip>
              </h4>

              <v-row>
                <v-col cols="12">
                  <div
                    v-if="isLoadingDescription"
                    class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>

                  <v-textarea
                    v-else
                    v-model="editedEvent.description"
                    label="Descrição do Evento"
                    outlined
                    rows="5"
                    hide-details="auto"
                    placeholder="Digite uma descrição para o evento" />
                </v-col>
              </v-row>
            </div>

            <!-- Data e Hora -->
            <div class="section-wrapper">
              <h4 class="section-title">Data e Hora</h4>
              <DateTimeForm
                ref="dateTimeForm"
                :start-date="editedEvent.start_date"
                :start-time="editedEvent.start_time"
                :end-date="editedEvent.end_date"
                :end-time="editedEvent.end_time"
                @update:startDate="updateStartDate"
                @update:startTime="updateStartTime"
                @update:endDate="updateEndDate"
                @update:endTime="updateEndTime" />
            </div>

            <v-dialog v-model="improveDescriptionDialog" max-width="700px" persistent>
              <v-card>
                <v-card-title class="d-flex align-center">
                  Melhorar Descrição com IA
                  <v-spacer />

                  <v-btn icon @click="improveDescriptionDialog = false">
                    <v-icon color="white">mdi-close</v-icon>
                  </v-btn>
                </v-card-title>

                <v-card-text>
                  <v-row class="mt-5">
                    <v-col cols="12">
                      <v-textarea
                        v-model="improvedDescription"
                        outlined
                        label="Descrição sugerida pela IA"
                        rows="10"
                        hide-details />
                    </v-col>
                  </v-row>
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
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="primary"
          :loading="isUpdating"
          :disabled="!isFormValid || isUpdating"
          @click="saveEvent">
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { event, category, rating, openAI } from '@/store';

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isFormValid: true,
      isUpdating: false,
      isLoading: false,
      editedEvent: {
        name: '',
        category_id: '',
        event_type: '',
        description: '',
        rating_id: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        address: {},
      },
      isLoadingDescription: false,
      isUpdatingDescription: false,
      improveDescriptionDialog: false,
      improvedDescription: '',

      types: ['Presencial', 'Online', 'Híbrido'],
      validationRules: {
        eventName: [
          (value) => !!value || 'O nome do evento é obrigatório.',
          (value) =>
            value.length <= 60 || 'O nome do evento deve ter no máximo 50 caracteres.',
        ],
        category: [(value) => !!value || 'Selecione uma categoria.'],
        event_type: [(value) => !!value || 'Selecione o tipo do evento.'],
        link_online: [
          (value) => !!value || 'O link do evento é obrigatório.',
          (value) =>
            /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(value) || 'Digite um link válido.',
        ],
      },
    };
  },

  computed: {
    dialog: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    currentEvent() {
      return event.$event;
    },

    categories() {
      return category.$categoryList.map((category) => ({
        value: category.id,
        text: category.name,
      }));
    },

    ratings() {
      return rating.$ratingList.map((rating) => ({
        value: rating.id,
        text: rating.description,
        img: rating.image,
      }));
    },

    currentRating() {
      return {
        value: this.currentEvent.rating.id,
        text: this.currentEvent.rating.description,
        img: this.currentEvent.rating.image,
      };
    },
  },

  watch: {
    dialog(val) {
      if (val && this.currentEvent) {
        this.initializeForm();
      }
    },

    currentEvent: {
      handler(val) {
        if (val && this.dialog) {
          this.initializeForm();
        }
      },
      immediate: true,
    },
  },

  async mounted() {
    this.isLoading = true;

    const promises = [
      category.fetchCategories({ sortBy: ['name'], sortDesc: [false] }),
      rating.fetchRatings({ sortBy: ['name'], sortDesc: [false] }),
    ];

    await Promise.all(promises);

    this.isLoading = false;
  },

  methods: {
    initializeForm() {
      if (!this.currentEvent) return;

      // Extrai as horas das datas ISO
      const startTime = this.extractTimeFromDate(this.currentEvent.start_date);
      const endTime = this.extractTimeFromDate(this.currentEvent.end_date);

      this.editedEvent = {
        ...this.currentEvent,
        start_date: this.currentEvent.start_date,
        end_date: this.currentEvent.end_date,
        start_time: startTime || '',
        end_time: endTime || '',
        address: this.currentEvent.address || {},
      };
    },

    extractTimeFromDate(isoDate) {
      if (!isoDate) return '';

      const date = new Date(isoDate);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes}`;
    },

    combineDateAndTime(date, time) {
      if (!date || !time) return null;

      const [hours, minutes] = time.split(':');
      const dateObj = new Date(date);
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0);

      return dateObj.toISOString();
    },

    close() {
      this.dialog = false;
    },

    async saveEvent() {
      if (!this.$refs.form.validate()) return;

      try {
        this.isUpdating = true;

        // Combina data e hora em um único campo
        const payload = {
          ...this.editedEvent,

          start_date: this.combineDateAndTime(
            this.editedEvent.start_date,
            this.editedEvent.start_time
          ),
          end_date: this.combineDateAndTime(
            this.editedEvent.end_date,
            this.editedEvent.end_time
          ),
        };

        // Remove os campos de tempo que não são necessários no payload
        delete payload.start_time;
        delete payload.end_time;

        await event.updateEvent({
          id: this.currentEvent.id,
          ...payload,
        });

        // Recarrega os dados do evento
        await event.getById(this.currentEvent.id);
        this.close();
      } catch (error) {
        console.error('Erro ao atualizar evento:', error);
      } finally {
        this.isUpdating = false;
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

    confirmImprovedDescription() {
      try {
        this.isUpdatingDescription = true;
        this.editedEvent.description = this.improvedDescription;
        this.improveDescriptionDialog = false;
      } catch (error) {
        console.error('Erro ao atualizar descrição:', error);
      } finally {
        this.isUpdatingDescription = false;
      }
    },

    updateStartDate(value) {
      this.editedEvent.start_date = value;
    },
    updateStartTime(value) {
      this.editedEvent.start_time = value;
    },
    updateEndDate(value) {
      this.editedEvent.end_date = value;
    },
    updateEndTime(value) {
      this.editedEvent.end_time = value;
    },
    updateAddress(value) {
      this.editedEvent.address = value;
    },
  },
};
</script>

<style scoped>
::v-deep.v-card__title {
  background-color: var(--primary) !important;
  color: white !important;
}

::v-deep .v-sheet.v-card {
  border-radius: 0 !important;
}

.close-button {
  color: white !important;
}

.section-wrapper {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--black-text);
  margin-bottom: 16px;
}

::v-deep .v-card {
  background-color: var(--light-gray) !important;
}
</style>
