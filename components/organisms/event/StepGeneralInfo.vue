<template>
  <v-container class="step-general-info">
    <v-row>
      <v-col cols="12" md="12" sm="12">
        <v-text-field
          v-model="localForm.eventName"
          label="Nome do Evento"
          placeholder="Digite o nome do evento"
          required
          hide-details
          @input="onEventNameChange" />
      </v-col>
    </v-row>
    <v-row
      v-if="aliasValidation.isValid !== null && localForm.alias.length > 0"
      class="mt-1">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-progress-circular
            v-if="isValidatingAlias"
            class="mr-1"
            color="primary"
            indeterminate
            :size="18" />

          <template v-if="aliasValidation.isValid">
            <v-icon v-if="!isValidatingAlias" class="mr-1" color="green"
              >mdi-check-circle</v-icon
            >
            <p class="caption">{{ aliasValidation.alias }}</p>
          </template>
          <template v-else>
            <v-icon v-if="!isValidatingAlias" class="mr-1" color="red"
              >mdi-alert-box</v-icon
            >
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
          return-object
          required />
      </v-col>
      <!-- Classificação Indicativa -->
      <v-col cols="12" md="4" sm="12">
        <v-select
          v-model="localForm.rating"
          label="Classificação Indicativa"
          :items="ratings"
          return-object
          required />
      </v-col>
      <!-- Capacidade máxima -->
      <v-col cols="12" md="4" sm="12">
        <v-text-field
          v-model="localForm.max_capacity"
          label="Capacidade máxima"
          placeholder="Digite a capacidade máxima de pessoas"
          type="number"
          min="0"
          required
          hide-details />
      </v-col>
      <!-- Descrição do Evento -->
      <v-col cols="12" md="12" sm="12">
        <v-textarea
          v-model="localForm.description"
          label="Descrição"
          rows="4"
          placeholder="Digite uma descrição para o evento"
          required />
      </v-col>
      <v-col cols="12" md="12" sm="12">
        <v-switch v-model="localForm.is_featured" label="Evento em Destaque" inset />
      </v-col>
    </v-row>
    <!-- Data e Hora -->
    <v-row>
      <v-col cols="12">
        <h3>Datas</h3>
        <p class="subtitle-2">
          O fuso-horário do evento é automaticamente configurado a partir da localização.
        </p>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          ref="startDateMenu"
          v-model="startDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localForm.startDate"
              label="Data de Início"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              required
              v-on="on" />
          </template>
          <v-date-picker v-model="localForm.startDate" @input="startDateMenu = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          ref="startTimeMenu"
          v-model="startTimeMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localForm.startTime"
              label="Hora de Início"
              prepend-icon="mdi-clock-outline"
              readonly
              v-bind="attrs"
              required
              v-on="on" />
          </template>
          <v-time-picker v-model="localForm.startTime" @input="startTimeMenu = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          ref="endDateMenu"
          v-model="endDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localForm.endDate"
              label="Data de Término"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              required
              v-on="on" />
          </template>
          <v-date-picker v-model="localForm.endDate" @input="endDateMenu = false" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-menu
          ref="endTimeMenu"
          v-model="endTimeMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="localForm.endTime"
              label="Hora de Término"
              prepend-icon="mdi-clock-outline"
              readonly
              v-bind="attrs"
              required
              v-on="on" />
          </template>
          <v-time-picker v-model="localForm.endTime" @input="endTimeMenu = false" />
        </v-menu>
      </v-col>
      <v-col cols="12">
        <p class="subtitle-2" v-html="eventDuration" />
      </v-col>
    </v-row>
    <!-- Endereço do Evento -->
    <v-row>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="localForm.cep"
          label="CEP"
          placeholder="Digite o CEP"
          required
          @input="onChangeCEP" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="localForm.location_name"
          label="Local do Evento"
          placeholder="Digite o local do evento" />
      </v-col>
      <v-col cols="12">
        <v-card v-if="localForm.address" outlined class="mt-3 mb-3">
          <v-card-text>
            <p><strong>Rua:</strong> {{ localForm.address.street }}</p>
            <p><strong>Bairro:</strong> {{ localForm.address.neighborhood }}</p>
            <p><strong>Cidade:</strong> {{ localForm.address.city }}</p>
            <p><strong>Estado:</strong> {{ localForm.address.state }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="localForm.address.complement"
          label="Complemento"
          placeholder="Digite o complemento" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          v-model="localForm.address.number"
          label="Número"
          type="number"
          min="0"
          placeholder="Digite o número" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
import { onFormatCEP } from '@/utils/formatters';
import { cep, event } from '@/store';
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
      startDateMenu: false,
      endDateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
      debouncerCEP: null,
      debouncerAlias: null,
    };
  },

  computed: {
    eventDuration() {
      const startDateTime = new Date(
        `${this.localForm.startDate}T${this.localForm.startTime}:00`
      );
      const endDateTime = new Date(
        `${this.localForm.endDate}T${this.localForm.endTime}:00`
      );

      if (
        isNaN(startDateTime.getTime()) ||
        isNaN(endDateTime.getTime()) ||
        endDateTime <= startDateTime
      ) {
        return '';
      }

      const durationMs = endDateTime - startDateTime;

      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      return `Seu evento vai durar <strong>${days} dias, ${hours} horas, ${minutes} minutos</strong>.`;
    },
    isValidatingAlias() {
      return event.$isLoadingAlias;
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
    this.debouncerCEP = new Debounce(this.fetchAddressByCEP, 300);
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
    onChangeCEP() {
      this.localForm.cep = onFormatCEP(this.localForm.cep);
      this.debouncerCEP.execute();
    },
    setAliasValidation(isValid, alias) {
      this.$set(this.aliasValidation, 'isValid', isValid);
      this.$set(this.aliasValidation, 'alias', alias);
      this.$set(this.localForm, 'alias', alias);
    },
    async fetchAddressByCEP() {
      if (this.localForm.cep.length === 9) {
        try {
          const responseCEP = await cep.fetchCep(this.localForm.cep);

          this.localForm.address = {
            street: responseCEP.logradouro,
            neighborhood: responseCEP.bairro,
            city: responseCEP.localidade,
            state: responseCEP.uf,
          };
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
        }
      }
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
