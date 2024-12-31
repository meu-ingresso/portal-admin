<template>
  <v-container class="step-general-info" :class="{ 'px-0': isMobile }">
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
      <v-col cols="12" md="6" sm="12">
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

      <!-- Classificação Indicativa -->
      <v-col cols="12" md="6" sm="12">
        <v-select
          v-model="localForm.rating"
          label="Classificação Indicativa"
          :items="ratings"
          outlined
          dense
          return-object
          hide-details="auto"
          required />
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

    <!-- Data e Hora -->
    <v-row>
      <v-col cols="12">
        <h3>Data e Hora</h3>
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
import { event, eventForm } from '@/store';
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
      debouncerAlias: null,
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
</style>
