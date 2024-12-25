<template>
  <v-container class="step-coupons">
    <v-row>
      <v-col cols="12">
        <h3>Cadastro de Cupons</h3>
        <p class="subtitle-1">Adicione cupons de desconto para o evento.</p>
        <DefaultButton class="mt-2" text="Adicionar Cupom" @click="addCoupon" />
      </v-col>
    </v-row>

    <v-row v-for="(coupon, index) in coupons" :key="index" class="coupon-row">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="coupon.code"
          label="Código do Cupom"
          placeholder="Ex: DESCONTO10"
          required />
      </v-col>

      <v-col cols="12" sm="4">
        <v-select
          v-model="coupon.discountType"
          :items="discountTypes"
          label="Tipo de Desconto"
          placeholder="Selecione"
          required
          @change="onDiscountTypeChange(index)" />
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="coupon.discountValue"
          :label="
            coupon.discountType === 'percentage'
              ? 'Valor do Desconto (%)'
              : 'Valor do Desconto (R$)'
          "
          :type="coupon.discountType === 'percentage' ? 'number' : 'text'"
          :append-icon="coupon.discountType === 'percentage' ? 'mdi-percent' : ''"
          required
          @input="onDiscountValueInput(coupon, index)" />
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="coupon.maxUses"
          label="Máximo de Usos"
          type="number"
          min="1"
          required />
      </v-col>

      <v-col cols="12" sm="4">
        <v-menu
          ref="`expirationMenu${index}`"
          v-model="coupon.expirationMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="coupon.expirationDate"
              label="Data de Expiração"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              required
              v-on="on" />
          </template>
          <v-date-picker
            v-model="coupon.expirationDate"
            @input="coupon.expirationMenu = false" />
        </v-menu>
      </v-col>

      <v-col cols="12" sm="2">
        <v-btn color="red" text @click="removeCoupon(index)"> Remover </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { formatRealValue } from '@/utils/formatters';

export default {
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      coupons: this.form.coupons || [],
      discountTypes: [
        { text: 'Fixo', value: 'fixed' },
        { text: 'Porcentagem', value: 'percentage' },
      ],
    };
  },
  methods: {
    addCoupon() {
      this.coupons.push({
        code: '',
        discountType: '',
        discountValue: 0,
        maxUses: 1,
        expirationDate: '',
        expirationMenu: false,
      });
      this.updateCoupons();
    },
    removeCoupon(index) {
      this.coupons.splice(index, 1);
      this.updateCoupons();
    },
    updateCoupons() {
      this.$emit('update:form', { ...this.form, coupons: this.coupons });
    },
    onDiscountTypeChange(index) {
      const coupon = this.coupons[index];
      if (coupon.discountType === 'fixed') {
        coupon.discountValue = formatRealValue(coupon.discountValue);
      }
    },
    onDiscountValueInput(coupon, index) {
      if (coupon.discountType === 'fixed') {
        this.coupons[index].discountValue = formatRealValue(coupon.discountValue);
      }
    },
  },
};
</script>

<style scoped>
.step-coupons {
  max-width: 1280px;
  margin: 0 auto;
}

.coupon-row {
  margin-bottom: 16px;
}
</style>
