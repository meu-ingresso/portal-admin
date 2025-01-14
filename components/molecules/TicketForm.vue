<template>
  <v-row>
    <v-col cols="12" md="6" sm="12">
      <v-text-field
        v-model="localTicket.name"
        :label="
          nomenclature === 'Doação'
            ? 'Nome da doação'
            : `Nome do ${nomenclature?.toLowerCase()}`
        "
        placeholder="Ex: Ingresso VIP"
        required
        outlined
        dense
        hide-details="auto"
        :error="!!errors.name"
        :error-messages="errors.name" />
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <GenericAutocomplete
        :value="localTicket.category"
        :items="localCategories"
        :label="`Grupo de ${nomenclature?.toLowerCase()}`"
        :placeholder="`Crie categorias para agrupar ${nomenclature?.toLowerCase()}`"
        @input="onCategoryChange"
        @update:items="updateCategories" />
    </v-col>

    <!-- Para casos de doação, não exibir os campos de preço e quantidade -->
    <v-col cols="12" :md="nomenclature != 'Doação' ? 3 : 6" sm="12">
      <v-text-field
        v-model="localTicket.price"
        label="Preço"
        required
        outlined
        dense
        prefix="R$"
        hide-details="auto"
        :error="!!errors.price"
        :error-messages="errors.price"
        @keypress="onPriceChange" />
    </v-col>
    <v-col cols="12" :md="nomenclature != 'Doação' ? 3 : 6" sm="12">
      <v-text-field
        v-model="localTicket.max_quantity"
        :value="localTicket.max_quantity"
        label="Quantidade"
        placeholder="Ex.: 400"
        type="number"
        min="0"
        required
        outlined
        dense
        hide-details="auto"
        :error="!!errors.max_quantity"
        :error-messages="errors.max_quantity"
        @keypress="onNumerFieldChange" />
    </v-col>

    <template v-if="nomenclature != 'Doação'">
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          outlined
          dense
          hide-details="auto"
          :error="!!errors.min_purchase"
          :error-messages="errors.min_purchase"
          @keypress="onNumerFieldChange" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field
          v-model="localTicket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          outlined
          dense
          hide-details="auto"
          :error="!!errors.max_purchase"
          :error-messages="errors.max_purchase" />
      </v-col>
    </template>

    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="openDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedOpenDate"
            label="Início das Vendas"
            readonly
            v-bind="attrs"
            outlined
            dense
            hide-details="auto"
            :error="!!errors.open_date"
            :error-messages="errors.open_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localTicket.open_date"
          locale="pt-br"
          @input="onDateChange('open_date', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="startTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="localTicket.start_time"
            label="Horário de Início"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :error="!!errors.start_time"
            :error-messages="errors.start_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localTicket.start_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('start_time', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="closeDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedCloseDate"
            label="Término das Vendas"
            readonly
            v-bind="attrs"
            outlined
            dense
            hide-details="auto"
            :error="!!errors.close_date"
            :error-messages="errors.close_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localTicket.close_date"
          locale="pt-br"
          dense
          @input="onDateChange('close_date', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="endTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="localTicket.end_time"
            label="Horário de Término"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :error="!!errors.end_time"
            :error-messages="errors.end_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localTicket.end_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('end_time', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-select
        v-model="localTicket.availability"
        :items="availabilityList"
        return-object
        label="Disponibilidade"
        outlined
        placeholder="Selecione a disponibilidade"
        persistent-hint
        :hint="getHintByAvailability"
        required
        dense
        :error="!!errors.availability"
        :error-messages="errors.availability"
        hide-details="auto" />
    </v-col>
    <v-col md="3" sm="8">
      <v-checkbox
        v-model="localTicket.visible"
        label="Visível"
        class="inline-switch-checkbox"
        :hide-details="!errors.availability"
        dense />
    </v-col>
  </v-row>
</template>

<script>
import { formatPrice, formatDateToBr } from '@/utils/formatters';
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    nomenclature: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localTicket: { ...this.ticket },
      localCategories: [...this.categories],
      availabilityList: [
        { text: 'Para todo o público', value: 'Publico' },
        { text: 'Restrito a convidados', value: 'Restrito' },
        { text: 'Apenas PDV interno', value: 'Interno' },
      ],
      openDateMenu: false,
      closeDateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
      errors: {
        name: '',
        price: '',
        max_quantity: '',
        min_purchase: '',
        max_purchase: '',
        open_date: '',
        start_time: '',
        close_date: '',
        end_time: '',
        availability: '',
      },
      validationRules: {
        name: [(value) => !!value || 'O nome é obrigatório.'],
        price: [
          (value) => !!value || 'O preço é obrigatório.',
          (value) => parseFloat(value) > 0 || 'O preço deve ser maior que zero.',
        ],
        max_quantity: [
          (value) => !!value || 'A quantidade máxima é obrigatória.',
          (value) => value > 0 || 'A quantidade deve ser maior que zero.',
        ],
        min_purchase: [
          (value) => value > 0 || 'A compra mínima deve ser maior ou igual a zero.',
        ],
        max_purchase: [
          (value) => value > 0 || 'A compra máxima deve ser maior ou igual a zero.',
          (value) =>
            !value ||
            value >= this.localTicket.min_purchase ||
            'A compra máxima deve ser maior ou igual à compra mínima.',
        ],
        open_date: [(value) => !!value || 'A data de abertura é obrigatória.'],
        start_time: [(value) => !!value || 'A hora de início é obrigatória.'],
        close_date: [
          (value) => !!value || 'A data de fechamento é obrigatória.',
          (value) =>
            !value ||
            value >= this.localTicket.open_date ||
            'A data de fechamento deve ser posterior à data de abertura.',
        ],
        end_time: [
          (value) => !!value || 'A hora de término é obrigatória.',
          (value) =>
            !value ||
            this.localTicket.close_date > this.localTicket.open_date ||
            value > this.localTicket.start_time ||
            'A hora de término deve ser posterior à hora de início.',
        ],
        availability: [(value) => !!value || 'A disponibilidade é obrigatória.'],
      },
    };
  },

  computed: {
    formattedOpenDate() {
      return this.localTicket.open_date ? formatDateToBr(this.localTicket.open_date) : '';
    },
    formattedCloseDate() {
      return this.localTicket.close_date
        ? formatDateToBr(this.localTicket.close_date)
        : '';
    },
    getHintByAvailability() {
      switch (this.localTicket.availability?.value) {
        case 'Publico':
          if (this.nomenclature === 'Doação') {
            return 'A doação ficará visível para todos que acessarem a página de vendas.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'O ingresso ficará visível para todos que acessarem a página de vendas.';
          } else {
            return 'A inscrição ficará visível para todos que acessarem a página de vendas.';
          }

        case 'Restrito':
          if (this.nomenclature === 'Doação') {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão fazer doações.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar o ingresso.';
          } else {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar a inscrição.';
          }
        case 'Interno':
          if (this.nomenclature === 'Doação') {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir doações através do PDV';
          } else if (this.nomenclature === 'Ingresso') {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir ingressos através do PDV';
          } else {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir inscrições através do PDV';
          }
        default:
          return '';
      }
    },
  },

  watch: {
    ticket: {
      handler() {
        this.localTicket = { ...this.ticket };
      },
      deep: true,
    },
  },

  methods: {
    validateField(fieldName) {
      const rules = this.validationRules[fieldName];
      if (!rules) return true;

      const value = this.localTicket[fieldName];
      const error = rules.find((rule) => rule(value) !== true);

      this.$set(this.errors, fieldName, error ? error(value) : '');
      return !error;
    },

    validateForm() {
      let isValid = true;

      Object.keys(this.validationRules).forEach((fieldName) => {
        if (!this.validateField(fieldName)) {
          console.log('Field', fieldName, 'is invalid');
          isValid = false;
        }
      });

      if (isValid) this.emitChanges();

      return isValid;
    },

    emitChanges() {
      this.$emit('update:ticket', this.localTicket);
      this.$emit('update:categories', this.localCategories);
    },
    onCategoryChange(value) {
      this.localTicket.category = value;
    },
    onPriceChange(event) {
      const charCode = event.charCode || event.keyCode;
      const char = String.fromCharCode(charCode);

      if (
        !/[0-9,]/.test(char) ||
        (char === ',' && this.localTicket.price.includes(','))
      ) {
        event.preventDefault();
      }

      const value = event.target.value;
      this.localTicket.price = formatPrice(value);
    },

    onNumerFieldChange(event) {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },

    onDateChange(field, value) {
      this.localTicket[field] = value;
      this.openDateMenu = false;
      this.closeDateMenu = false;
    },
    onHourChange(field, value) {
      this.localTicket[field] = value;
      this.startTimeMenu = false;
      this.endTimeMenu = false;
    },
    updateCategories(categories) {
      this.localCategories = [...categories];
    },
  },
};
</script>

<style scoped>
</style>
