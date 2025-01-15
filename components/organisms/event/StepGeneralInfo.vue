<template>
  <v-container class="step-general-info py-0 px-0">
    <v-row>
      <v-col cols="12">
        <h3>Sobre o Evento</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="12" sm="12">
        <v-text-field
          v-model="localForm.eventName"
          label="Nome do Evento"
          outlined
          dense
          placeholder="Digite o nome do evento"
          required
          :error="!!errors.eventName"
          :error-messages="errors.eventName"
          hide-details="auto"
          @input="onEventNameChange" />
      </v-col>
    </v-row>

    <v-row v-if="aliasValidation.isValid !== null && localForm.alias.length > 0">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-progress-circular
            v-if="isValidatingAlias"
            class="mr-1"
            color="primary"
            indeterminate
            :size="18" />

          <template v-if="aliasValidation.isValid">
            <v-icon v-if="!isValidatingAlias" class="mr-1" color="green">
              mdi-check-circle
            </v-icon>

            <p class="caption">{{ aliasValidation.alias }}</p>
          </template>

          <template v-else>
            <v-icon v-if="!isValidatingAlias" class="mr-1" color="red">
              mdi-alert-box
            </v-icon>

            <p class="caption">
              {{ aliasValidation.alias }} <span class="red--text">(já reservado)</span>
            </p>
          </template>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Categoria -->
      <v-col cols="12" md="4" sm="12">
        <v-select
          v-model="localForm.category"
          label="Categoria"
          :items="categories"
          outlined
          dense
          return-object
          hide-details="auto"
          required
          :error="!!errors.category"
          :error-messages="errors.category" />
      </v-col>

      <!-- Tipo do Evento -->
      <v-col cols="12" md="4" sm="12">
        <v-select
          v-model="localForm.event_type"
          label="Tipo do Evento"
          :items="types"
          outlined
          dense
          hide-details="auto"
          required
          :disabled="nomenclature === 'Doação'"
          :error="!!errors.event_type"
          :error-messages="errors.event_type" />
      </v-col>

      <!-- Classificação Indicativa -->
      <v-col cols="12" md="4" sm="12">
        <RatingSelect
          v-model="localForm.rating"
          :value="localForm.rating"
          :ratings="ratings"
          :error="!!errors.rating"
          :error-messages="errors.rating" />
      </v-col>

      <v-col v-if="isEventOnlineOrHibrido" cols="12" md="12" sm="12">
        <v-text-field
          v-model="localForm.link_online"
          label="Link do Evento"
          outlined
          dense
          placeholder="Digite o link do evento"
          hide-details="auto"
          :error="!!errors.link_online"
          :error-messages="errors.link_online" />
      </v-col>

      <!-- Descrição do Evento -->
      <v-col cols="12" md="12" sm="12">
        <v-textarea
          v-model="localForm.description"
          label="Descrição"
          rows="5"
          outlined
          dense
          hide-details="auto"
          placeholder="Digite uma descrição para o evento"
          required />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <!-- Campo de Upload / Prévia da Imagem -->
        <div v-if="imagePreview" class="image-preview-container">
          <img :src="imagePreview" alt="Prévia do Banner" class="image-preview" />
          <v-btn icon class="remove-image-btn" @click="onClearBanner">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-file-input
          v-else
          v-model="localForm.banner"
          label="Banner do Evento"
          accept="image/*"
          outlined
          hide-input
          dense
          prepend-icon="mdi-cloud-upload-outline"
          hide-details="auto"
          show-size
          class="custom-file-input"
          @change="validateImageDimensions" />
        <p v-if="!imagePreview" class="caption text-center mt-2">
          Clique para selecionar o banner do evento (954x500px)
        </p>
      </v-col>
    </v-row>

    <!-- Data e Hora -->
    <v-row>
      <v-col cols="12">
        <h3>Data e Horário</h3>
      </v-col>
    </v-row>

    <!-- Outros campos -->
    <DateTimeForm
      :start-date="form.startDate"
      :start-time="form.startTime"
      :end-date="form.endDate"
      :end-time="form.endTime"
      :errors="{
        startDate: errors.startDate,
        startTime: errors.startTime,
        endDate: errors.endDate,
        endTime: errors.endTime,
      }"
      @update:startDate="updateStartDate"
      @update:startTime="updateStartTime"
      @update:endDate="updateEndDate"
      @update:endTime="updateEndTime" />

    <template v-if="isEventPresencialOrHibrito && nomenclature !== 'Doação'">
      <v-row>
        <v-col cols="12">
          <h3>Localização</h3>
        </v-col>
      </v-row>

      <!-- Endereço do Evento -->
      <AddressForm
        :cep="form.cep"
        :location-name="form.location_name"
        :number="form.number"
        :address="form.address"
        :errors="{
          cep: errors.cep,
          location_name: errors.location_name,
          number: errors.number,
        }"
        @update:cep="updateCep"
        @update:location-name="updateLocationName"
        @update:number="updateNumber"
        @update:address="updateAddress" />
    </template>

    <!-- Configurações do Evento/Ingressos -->
    <v-row>
      <v-col cols="12">
        <v-card tile elevation="1" class="ticket-configuration">
          <v-card-title>
            <p class="subtitle-1">Configurações</p>
          </v-card-title>
          <v-card-text>
            <v-row class="d-flex align-start">
              <v-col md="4" sm="12">
                <div class="d-flex align-center">
                  <v-switch
                    v-model="absorveTax"
                    class="inline-switch-checkbox mr-4 pt-0"
                    label="Absorver a taxa de serviço"
                    dense
                    hide-details="auto" />
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-icon color="gray" v-bind="attrs" v-on="on"
                        >mdi-help-circle</v-icon
                      >
                    </template>
                    <span class="tax-container">
                      Ao selecionar essa opção, a taxa de serviço (10%) será incluída no
                      preço final de venda do ingresso e não será mostrada ao comprador
                    </span>
                  </v-tooltip>
                </div>
              </v-col>
              <v-col md="4" sm="12">
                <v-select
                  v-model="localForm.availability"
                  label="Visibilidade"
                  :items="availabilityOptions"
                  persistent-hint
                  :hint="getHintByAvailability"
                  outlined
                  dense
                  hide-details="auto"
                  required />
              </v-col>
              <v-col md="4" sm="12" class="d-flex align-center">
                <v-select
                  v-model="nomenclature"
                  label="Nomenclatura"
                  :items="nomenclatureOptions"
                  outlined
                  dense
                  hide-details="auto"
                  required />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
import { event, eventForm, toast } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    form: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    ratings: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localForm: { ...this.form },
      aliasValidation: {
        isValid: null,
        alias: '',
      },
      types: ['Presencial', 'Online', 'Híbrido'],
      debouncerAlias: null,
      imagePreview: null,
      absorveTax: false,
      availabilityOptions: ['Visível a todos', 'Oculto'],
      nomenclature: this.form.sale_type || 'Ingresso',
      nomenclatureOptions: ['Ingresso', 'Inscrição', 'Doação'],
      errors: {
        eventName: '',
        category: '',
        event_type: '',
        rating: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        cep: '',
        location_name: '',
        link_online: '',
        number: '',
      },
      validationRules: {
        eventName: [(value) => !!value || 'O nome do evento é obrigatório.'],
        category: [(value) => !!value || 'Selecione uma categoria.'],
        event_type: [(value) => !!value || 'Selecione o tipo do evento.'],
        rating: [(value) => !!value || 'Selecione uma classificação indicativa.'],
        startDate: [(value) => !!value || 'A data de início é obrigatória.'],
        startTime: [(value) => !!value || 'A hora de início é obrigatória.'],
        link_online: [
          (value) => !!value || 'O link do evento é obrigatório.',
          (value) =>
            /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(value) || 'Digite um link válido.',
        ],
        endDate: [
          (value) => !!value || 'A data de término é obrigatória.',
          (value) =>
            !value ||
            value >= this.localForm.startDate ||
            'A data de término deve ser posterior à data de início.',
        ],
        endTime: [
          (value) => !!value || 'A hora de término é obrigatória.',
          (value) =>
            !value ||
            this.localForm.endDate > this.localForm.startDate ||
            value > this.localForm.startTime ||
            'A hora de término deve ser posterior à hora de início.',
        ],
        cep: [
          (value) => !!value || 'O CEP é obrigatório.',
          (value) =>
            /^\d{5}-\d{3}$/.test(value) || 'O CEP deve estar no formato 00000-000.',
        ],
        location_name: [(value) => !!value || 'O local do evento é obrigatório.'],
        number: [(value) => !!value || 'O número é obrigatório.'],
      },
    };
  },

  computed: {
    isValidatingAlias() {
      return event.$isLoadingAlias;
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    isEventPresencialOrHibrito() {
      return ['Presencial', 'Híbrido'].includes(this.localForm.event_type);
    },
    isEventOnline() {
      return this.localForm.event_type === 'Online';
    },
    isEventOnlineOrHibrido() {
      return ['Online', 'Híbrido'].includes(this.localForm.event_type);
    },
    getHintByAvailability() {
      switch (this.localForm.availability) {
        case 'Visível a todos':
          return 'O evento será visível para todos os usuários da plataforma.';
        case 'Oculto':
          return 'Apenas quem tiver o link poderá acessar a página do evento.';
        default:
          return '';
      }
    },
  },

  watch: {
    localForm: {
      handler() {
        this.emitChanges();
      },
      deep: true,
    },
    nomenclature(value) {
      // Atualiza o tipo de venda do evento
      this.localForm.sale_type = value;

      if (value === 'Ingresso') {
        this.$emit('update:nomenclature', 'Ingressos');
      } else if (value === 'Inscrição') {
        this.$emit('update:nomenclature', 'Inscrições');
      } else if (value === 'Doação') {
        this.localForm.event_type = 'Online';
        this.$emit('update:nomenclature', 'Doações');
      }
    },
  },

  created() {
    this.debouncerAlias = new Debounce(this.validateAlias, 300);
  },
  methods: {
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
    },

    canProceed(callback) {
      if (!this.validateForm()) {
        return callback(null, false, 'Existem campos inválidos no formulário.');
      }

      callback(null, true);
    },

    async validateAlias() {
      try {
        const alias = this.localForm.alias;

        if (!alias || alias.length === 0) {
          this.setAliasValidation(null, '');
          return;
        }

        const response = await event.validateAlias(alias);
        this.setAliasValidation(response.is_valid, response.alias);
      } catch (error) {
        console.error('Erro ao validar alias:', error);
        this.aliasValidation = {
          isValid: false,
          alias,
        };
      }
    },
    onEventNameChange() {
      this.generateAlias();
      if (this.localForm.alias && this.localForm.alias.length > 0) {
        this.debouncerAlias.execute();
      } else {
        this.setAliasValidation(null, '');
      }
    },
    generateAlias() {
      this.localForm.alias = this.localForm.eventName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    },
    setAliasValidation(isValid, alias) {
      this.$set(this.aliasValidation, 'isValid', isValid);
      this.$set(this.aliasValidation, 'alias', alias);
      this.$set(this.localForm, 'alias', alias);
    },
    validateImageDimensions(file) {
      if (!file) return;

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 954 || img.height !== 500) {
          toast.setToast({
            text: `A imagem enviada tem ${img.width}x${img.height}px. As dimensões recomendadas são 954x500px.`,
            type: 'danger',
            time: 5000,
          });
        }
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;

      // Atualiza a prévia da imagem
      this.imagePreview = objectUrl;
      this.localForm.banner = file;
    },
    onClearBanner() {
      this.imagePreview = null;
      this.localForm.banner = null;
    },
    validateField(fieldName) {
      const value = this.localForm[fieldName];
      const rules = this.validationRules[fieldName];

      // Ignora validação de endereço para eventos Online
      if (['cep', 'location_name', 'number'].includes(fieldName) && this.isEventOnline) {
        this.$set(this.errors, fieldName, '');
        return true;
      }

      // Ignora validação de link_online para eventos Presenciais
      if (fieldName === 'link_online' && !this.isEventOnline) {
        this.$set(this.errors, fieldName, '');
        return true;
      }

      // Se não houver regras definidas, retorna válido
      if (!rules) return true;

      // Aplica as regras de validação
      const error = rules.find((rule) => rule(value) !== true);
      this.$set(this.errors, fieldName, error ? error(value) : '');
      return !error;
    },

    validateForm() {
      const fieldNames = Object.keys(this.validationRules);
      let isValid = true; // Começamos assumindo que o formulário é válido

      // Valida todos os campos e acumula os erros
      fieldNames.forEach((fieldName) => {
        const fieldIsValid = this.validateField(fieldName);
        if (!fieldIsValid) {
          isValid = false; // Se qualquer campo for inválido, marcamos como inválido
        }
      });

      return isValid;
    },

    updateStartDate(value) {
      this.localForm.startDate = value;
      eventForm.updateForm({ startDate: value });
    },
    updateStartTime(value) {
      this.localForm.startTime = value;
      eventForm.updateForm({ startTime: value });
    },
    updateEndDate(value) {
      this.localForm.endDate = value;
      eventForm.updateForm({ endDate: value });
    },
    updateEndTime(value) {
      this.localForm.endTime = value;
      eventForm.updateForm({ endTime: value });
    },
    updateNumber(value) {
      this.localForm.number = value;
      eventForm.updateForm({ number: value });
    },
    updateCep(value) {
      this.localForm.cep = value;
      eventForm.updateForm({ cep: value });
    },
    updateLocationName(value) {
      this.localForm.location_name = value;
      eventForm.updateForm({ location_name: value });
    },
    updateAddress(value) {
      this.localForm.address = value;
      eventForm.updateForm({ address: value });
    },
  },
};
</script>

<style scoped>
.step-general-info {
  margin: 0 auto;
}
.mt-3 {
  margin-top: 16px;
}

.custom-file-input {
  height: 200px; /* Altura maior */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc; /* Estilo da borda */
  background-color: #f9f9f9; /* Cor de fundo */
}

.image-preview {
  text-align: center;
}

.image-preview-container {
  position: relative;
  height: 200px;
  border: 2px dashed #ccc;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 2px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ticket-configuration {
  box-shadow: 0px 0px 2.24px 0px rgba(0, 0, 0, 0.16078) !important;
}
</style>
