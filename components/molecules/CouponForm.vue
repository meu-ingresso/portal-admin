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
        @input="emitChanges" />
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
        @input="emitChanges" />
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
        :type="localCoupon.discountType === 'percentage' ? 'number' : 'text'"
        :append-icon="localCoupon.discountType === 'percentage' ? 'mdi-percent' : ''"
        :prefix="localCoupon.discountType === 'fixed' ? 'R$' : ''"
        outlined
        dense
        hide-details="auto"
        required
        @input="emitChanges" />
    </v-col>

    <!-- Máximo de Usos -->
    <v-col cols="12" md="6">
      <v-text-field
        v-model="localCoupon.maxUses"
        label="Máximo de Usos"
        type="number"
        outlined
        dense
        hide-details="auto"
        min="1"
        required
        @input="emitChanges" />
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
import { formatDateToBr } from '@/utils/formatters';

export default {
  props: {
    coupon: {
      type: Object,
      required: true,
    },
    discountTypes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localCoupon: { ...this.coupon },
      expirationMenu: false,
    };
  },
  computed: {
    formattedExpirationDate() {
      return this.localCoupon.expirationDate
        ? formatDateToBr(this.localCoupon.expirationDate)
        : '';
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
    emitChanges() {
      this.$emit('update:coupon', this.localCoupon);
    },
    onDateChange() {
      this.expirationMenu = false;
      this.emitChanges();
    },
  },
};
</script>

<style scoped>
</style>
