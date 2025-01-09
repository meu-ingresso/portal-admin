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
          required />
      </v-col>

      <!-- Tipo do Evento -->
      <v-col cols="12" md="4" sm="12">
        <v-select
          v-model="localForm.event_type"
          label="Tipo do Evento"
          :items="types"
          outlined
          dense
          return-object
          hide-details="auto"
          required />
      </v-col>

      <!-- Classificação Indicativa -->
      <v-col cols="12" md="4" sm="12">
        <!--         <v-select
          v-model="localForm.rating"
          label="Classificação Indicativa"
          :items="ratings"
          outlined
          dense
          return-object
          hide-details="auto"
          required /> -->
        <RatingSelect v-model="localForm.rating" :value="localForm.rating" :ratings="ratings" />
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

    <!-- Campo de Upload da Imagem -->
    <!--     <v-row>
      <v-col cols="12">
        <v-file-input
          v-model="localForm.banner"
          label="Banner do Evento"
          placeholder="Clique ou arraste a imagem principal aqui (954x500px)"
          accept="image/*"
          outlined
          dense
          prepend-icon="mdi-camera"
          hide-details="auto"
          show-size
          @change="validateImageDimensions"
          @click:clear="onClearBanner"
           />
        <div v-if="imagePreview" class="image-preview mt-3">
          <img :src="imagePreview" alt="Prévia do Banner" />
        </div>
      </v-col>
    </v-row> -->
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
      @update:startDate="updateStartDate"
      @update:startTime="updateStartTime"
      @update:endDate="updateEndDate"
      @update:endTime="updateEndTime" />

    <v-row>
      <v-col cols="12">
        <h3>Localização</h3>
      </v-col>
    </v-row>

    <!-- Endereço do Evento -->
    <AddressForm
      :cep="form.cep"
      :location-name="form.location_name"
      :address="form.address"
      @update:cep="updateCep"
      @update:location-name="updateLocationName"
      @update:address="updateAddress" />
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
    };
  },

  computed: {
    isValidatingAlias() {
      return event.$isLoadingAlias;
    },
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  watch: {
    localForm: {
      handler() {
        this.emitChanges();
      },
      deep: true,
    },
  },

  created() {
    this.debouncerAlias = new Debounce(this.validateAlias, 300);
  },
  methods: {
    emitChanges() {
      this.$emit('update:form', { ...this.localForm });
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

    updateStartDate(value) {
      eventForm.updateForm({ startDate: value });
    },
    updateStartTime(value) {
      eventForm.updateForm({ startTime: value });
    },
    updateEndDate(value) {
      eventForm.updateForm({ endDate: value });
    },
    updateEndTime(value) {
      eventForm.updateForm({ endTime: value });
    },
    updateCep(value) {
      eventForm.updateForm({ cep: value });
    },
    updateLocationName(value) {
      eventForm.updateForm({ location_name: value });
    },
    updateAddress(value) {
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
</style>
