<template>
  <v-row>
    <!-- Código do Cupom -->
    <v-col cols="12" md="6">
      <v-text-field
        v-model="localCoupon.code"
        label="Código do Cupom"
        placeholder="Ex: DESCONTO10"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.code.length > 0"
        :error-messages="errors.code" />
    </v-col>

    <!-- Ingressos Associados -->
    <v-col cols="12" md="6">
      <v-select
        v-model="localCoupon.tickets"
        :items="tickets"
        label="Ingressos"
        placeholder="Selecione o(s) ingresso(s)"
        no-data-text="Nenhum ingresso cadastrado"
        outlined
        dense
        multiple
        hide-details="auto">
        <template #prepend-item>
          <v-list-item ripple @mousedown.prevent @click="toggleAllTickets">
            <v-list-item-action>
              <v-icon :color="localCoupon.tickets.length > 0 ? 'primary' : ''">
                {{ icon }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title> Todos </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>
      </v-select>
    </v-col>

    <!-- Tipo de Desconto -->
    <v-col cols="12" md="6">
      <v-select
        v-model="localCoupon.discountType"
        :items="discountTypes"
        label="Tipo de Desconto"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.discountType.length > 0"
        :error-messages="errors.discountType" />
    </v-col>

    <!-- Valor do Desconto -->
    <v-col cols="12" md="6">
      <v-text-field
        v-model="localCoupon.discountValue"
        :label="
          localCoupon.discountType === 'percentage'
            ? 'Valor do Desconto (%)'
            : 'Valor do Desconto (R$)'
        "
        :prefix="localCoupon.discountType === 'fixed' ? 'R$' : '%'"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.discountValue.length > 0"
        :error-messages="errors.discountValue"
        @keypress="onPriceOrNumberChange" />
    </v-col>

    <!-- Máximo de Usos -->
    <v-col cols="12" md="6">
      <v-text-field
        v-model="localCoupon.maxUses"
        label="Máximo de Usos"
        placeholder="Ex: 100"
        type="number"
        min="1"
        outlined
        dense
        hide-details="auto"
        required
        :error="errors.maxUses.length > 0"
        :error-messages="errors.maxUses"
        @keypress="onNumerFieldChange" />
    </v-col>

    <!-- Data de Expiração -->
    <v-col cols="12" md="6">
      <v-menu
        v-model="expirationMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            :value="formattedExpirationDate"
            label="Data de Expiração"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            :error="errors.expirationDate.length > 0"
            :error-messages="errors.expirationDate"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localCoupon.expirationDate"
          locale="pt-br"
          @input="onDateChange" />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import { formatDateToBr, formatPrice } from '@/utils/formatters';

export default {
  props: {
    coupon: {
      type: Object,
      required: true,
    },
    tickets: {
      type: Array,
      required: true,
    },
    eventStartDate: {
      type: String,
      required: true,
    },
    eventEndDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localCoupon: { ...this.coupon },
      discountTypes: [
        { text: 'Fixo', value: 'fixed' },
        { text: 'Porcentagem', value: 'percentage' },
      ],
      expirationMenu: false,
      errors: {
        code: [],
        tickets: [],
        discountType: [],
        discountValue: [],
        maxUses: [],
        expirationDate: [],
      },
      validationRules: {
        code: [(value) => !!value || 'O código do cupom é obrigatório.'],
        discountType: [(v) => !!v || 'O tipo de desconto é obrigatório.'],
        discountValue: [
          (v) => !!v || 'O valor do desconto é obrigatório.',
          (v) => parseFloat(v) > 0 || 'O valor do desconto deve ser maior que 0.',
        ],
        maxUses: [
          (v) => !!v || 'O número máximo de usos é obrigatório.',
          (v) => v > 0 || 'O número máximo de usos deve ser maior que 0.',
        ],
        expirationDate: [
          (v) => !!v || 'A data de expiração é obrigatória.',
          (v) =>
            this.normalizeDate(v) >= this.normalizeDate(new Date()) ||
            'A data de expiração deve ser posterior a hoje.',
          (v) =>
            this.normalizeDate(v) >= this.normalizeDate(this.eventStartDate) ||
            'A data de expiração deve ser posterior à data de início do evento.',
        ],
      },
    };
  },
  computed: {
    formattedExpirationDate() {
      return this.localCoupon.expirationDate
        ? formatDateToBr(this.localCoupon.expirationDate)
        : '';
    },
    selectedAllTickets() {
      return this.localCoupon.tickets.length === this.tickets.length;
    },
    selectedSomeTickets() {
      return this.localCoupon.tickets.length > 0 && !this.selectedAllTickets;
    },
    icon() {
      if (this.selectedAllTickets) return 'mdi-close-box';
      if (this.selectedSomeTickets) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
  },
  watch: {
    coupon: {
      handler() {
        this.localCoupon = { ...this.coupon };
      },
      deep: true,
    },
  },

  methods: {
    toggleAllTickets() {
      if (this.selectedAllTickets) {
        this.localCoupon.tickets = [];
      } else {
        this.localCoupon.tickets = [...this.tickets];
      }
    },

    normalizeDate(date) {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    },

    onNumerFieldChange(event) {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },

    onPriceOrNumberChange(event) {
      if (this.coupon.discountType === 'percentage') {
        this.onNumerFieldChange(event);
        this.localCoupon.discountValue = Math.min(this.localCoupon.discountValue, 100);
      } else {
        const charCode = event.charCode || event.keyCode;
        const char = String.fromCharCode(charCode);

        if (
          !/[0-9,]/.test(char) ||
          (char === ',' && this.localCoupon.discountValue.includes(','))
        ) {
          event.preventDefault();
        }

        const value = event.target.value;
        this.localCoupon.discountValue = formatPrice(value);
      }
    },

    emitChanges() {
      this.$emit('update:coupon', this.localCoupon);
    },
    onDateChange() {
      this.expirationMenu = false;
    },
    validateField(fieldName) {
      const rules = this.validationRules[fieldName];
      if (!rules) return true;

      const value = this.localCoupon[fieldName];
      const error = rules.find((rule) => rule(value) !== true);

      this.$set(this.errors, fieldName, error ? error(value) : '');
      return !error;
    },
    validateForm() {
      let isValid = true;

      Object.keys(this.validationRules).forEach((fieldName) => {
        if (!this.validateField(fieldName)) {
          isValid = false;
        }
      });

      if (isValid) {
        this.emitChanges();
      }

      return isValid;
    },
  },
};
</script>

<style scoped>
</style>

