<template>
  <v-row>
    <!-- Código do Cupom -->
    <v-col cols="12" md="6">
      <v-text-field
        ref="code"
        v-model="localCoupon.code"
        label="Código do Cupom"
        placeholder="Ex: DESCONTO10"
        outlined
        dense
        hide-details="auto"
        required
        :rules="validationRules.code" />
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
        <template v-if="tickets.length" #prepend-item>
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
    <v-col cols="12" md="4">
      <v-select
        ref="discountType"
        v-model="localCoupon.discountType"
        :items="discountTypes"
        return-object
        label="Tipo de Desconto"
        outlined
        dense
        hide-details="auto"
        required />
    </v-col>

    <!-- Valor do Desconto -->
    <v-col cols="12" md="4">
      <v-text-field
        ref="discountValue"
        v-model="localCoupon.discountValue"
        :label="
          localCoupon.discountType?.value === 'PERCENTAGE'
            ? 'Valor do Desconto (%)'
            : 'Valor do Desconto (R$)'
        "
        :prefix="localCoupon.discountType?.value === 'FIXED' ? 'R$' : ''"
        :suffix="localCoupon.discountType?.value === 'PERCENTAGE' ? '%' : ''"
        outlined
        dense
        hide-details="auto"
        required
        :rules="validationRules.discountValue"
        @keypress="onPriceOrNumberChange" />
    </v-col>

    <!-- Máximo de Usos -->
    <v-col cols="12" md="4">
      <v-text-field
        ref="maxUses"
        v-model="localCoupon.maxUses"
        label="Máximo de Usos"
        placeholder="Ex: 100"
        type="number"
        min="1"
        outlined
        dense
        hide-details="auto"
        required
        :rules="validationRules.maxUses"
        @keypress="onNumerFieldChange" />
    </v-col>

    <!-- Data de Início -->
    <v-col cols="12" md="3">
      <v-menu
        v-model="startDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedStartDate"
            :value="formattedStartDate"
            label="Data de Início"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            :rules="validationRules.start_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localCoupon.start_date"
          locale="pt-br"
          no-title
          dense
          @input="onDateChange('start_date')" />
      </v-menu>
    </v-col>

    <!-- Hora de Início -->
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
            ref="end_time"
            v-model="localCoupon.start_time"
            label="Horário de Início"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :rules="validationRules.start_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localCoupon.start_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('start_time')" />
      </v-menu>
    </v-col>

    <!-- Data de Expiração -->
    <v-col cols="12" md="3">
      <v-menu
        v-model="endDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedEndDate"
            :value="formattedEndDate"
            label="Data de Expiração"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            :rules="validationRules.end_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localCoupon.end_date"
          locale="pt-br"
          no-title
          dense
          @input="onDateChange('end_date')" />
      </v-menu>
    </v-col>

    <!-- Hora de Expiração -->
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
            ref="end_time"
            v-model="localCoupon.end_time"
            label="Horário de Término"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :rules="validationRules.end_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localCoupon.end_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('end_time')" />
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
        { text: 'Fixo', value: 'FIXED' },
        { text: 'Porcentagem', value: 'PERCENTAGE' },
      ],
      formHasErrors: false,
      startDateMenu: false,
      endDateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
      validationRules: {
        code: [(value) => !!value || 'O código do cupom é obrigatório.'],
        discountValue: [
          (v) => !!v || 'O valor do desconto é obrigatório.',
          (v) => parseFloat(v) > 0 || 'O valor do desconto deve ser maior que 0.',
        ],
        maxUses: [
          (v) => !!v || 'O número máximo de usos é obrigatório.',
          (v) => v > 0 || 'O número máximo de usos deve ser maior que 0.',
        ],
        start_date: [(v) => !!v || 'A data de início é obrigatória.'],
        start_time: [(value) => !!value || 'A hora de início é obrigatória.'],
        end_date: [
          (v) => !!v || 'A data de expiração é obrigatória.',
          () =>
            this.normalizeDate(this.localCoupon.end_date) >=
              this.normalizeDate(new Date()) ||
            'A data de expiração deve ser posterior a hoje.',
          () =>
            this.normalizeDate(this.localCoupon.end_date) >=
              this.normalizeDate(this.localCoupon.start_date) ||
            'A data de expiração deve ser posterior à data de início do evento.',
        ],
        end_time: [(value) => !!value || 'A hora de término é obrigatória.'],
      },
    };
  },
  computed: {
    formattedEndDate() {
      return this.localCoupon.end_date ? formatDateToBr(this.localCoupon.end_date) : '';
    },
    formattedStartDate() {
      return this.localCoupon.start_date
        ? formatDateToBr(this.localCoupon.start_date)
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
    form() {
      return {
        code: this.localCoupon.code,
        discountValue: this.localCoupon.discountValue,
        maxUses: this.localCoupon.maxUses,
        formattedEndDate: this.localCoupon.end_date,
        formattedStartDate: this.localCoupon.start_date,
      };
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
      if (this.coupon.discountType === 'PERCENTAGE') {
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
    onDateChange(field) {
      if (field === 'start_date') {
        this.startDateMenu = false;
      } else {
        this.endDateMenu = false;
      }
    },
    onHourChange(field) {
      if (field === 'start_time') {
        this.startTimeMenu = false;
      } else {
        this.endTimeMenu = false;
      }
    },
    validateForm() {
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        if (!this.form[f]) this.formHasErrors = true;

        this.$refs[f].validate(true);
      });

      if (!this.formHasErrors) {
        this.emitChanges();
      }

      return this.formHasErrors;
    },
  },
};
</script>

<style scoped>
</style>

