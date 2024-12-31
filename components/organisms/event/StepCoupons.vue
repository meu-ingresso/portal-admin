<template>
  <v-container class="step-coupons">
    <v-row>
      <v-col cols="12">
        <h3>Cadastro de Cupons</h3>
        <p class="subtitle-1">Adicione cupons de desconto para o evento.</p>
        <DefaultButton class="mt-2" text="Adicionar Cupom" @click="addCoupon" />
      </v-col>
    </v-row>

    <v-row
      v-for="(coupon, index) in coupons"
      :key="index"
      class="coupon-row bg-light-gray">
      <v-col cols="12" md="4" sm="12">
        <v-text-field
          v-model="coupon.code"
          label="Código do Cupom"
          placeholder="Ex: DESCONTO10"
          outlined
          dense
          hide-details="auto"
          required />
      </v-col>

      <v-col cols="12" md="4" sm="12">
        <v-select
          v-model="coupon.discountType"
          :items="discountTypes"
          label="Tipo de Desconto"
          outlined
          placeholder="Selecione"
          required
          dense
          hide-details="auto" />
      </v-col>

      <v-col cols="12" md="4" sm="12">
        <v-text-field
          v-model="coupon.discountValue"
          :label="
            coupon.discountType === 'percentage'
              ? 'Valor do Desconto (%)'
              : 'Valor do Desconto (R$)'
          "
          :type="coupon.discountType === 'percentage' ? 'number' : 'text'"
          :append-icon="coupon.discountType === 'percentage' ? 'mdi-percent' : ''"
          :prefix="coupon.discountType === 'fixed' ? 'R$' : ''"
          outlined
          required
          dense
          hide-details="auto"
          @input="onDiscountValueInput(coupon, index)" />
      </v-col>

      <v-col cols="12" md="4" sm="12">
        <v-text-field
          v-model="coupon.maxUses"
          label="Máximo de Usos"
          type="number"
          outlined
          dense
          hide-details="auto"
          min="1"
          required />
      </v-col>

      <v-col cols="12" md="4" sm="12">
        <v-menu
          ref="`expirationMenu${index}`"
          v-model="coupon.expirationMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field
              :value="formattedExpirationDate(coupon)"
              label="Data de Expiração"
              readonly
              outlined
              v-bind="attrs"
              required
              dense
              hide-details="auto"
              v-on="on"
              @input="coupon.expirationDate = $event.target.value" />
          </template>
          <v-date-picker
            v-model="coupon.expirationDate"
            locale="pt-br"
            @input="coupon.expirationMenu = false" />
        </v-menu>
      </v-col>

      <v-col cols="12" sm="12" md="2" class="d-flex align-center">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn icon small v-bind="attrs" @click="removeCoupon(index)" v-on="on">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Remover Cupom</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir "{{ couponNameToRemove }}"?
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between align-center">
          <DefaultButton outlined text="Cancelar" @click="confirmDialog = false" />
          <DefaultButton text="Excluir" @click="confirmRemoveCoupon" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { formatRealValue, formatDateToBr, formatPrice } from '@/utils/formatters';

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
      confirmDialog: false,
      couponNameToRemove: '',
      couponIndexToRemove: null,
    };
  },

  methods: {
    addCoupon() {
      this.coupons.push({
        code: '',
        discountType: 'fixed',
        discountValue: 0,
        maxUses: 1,
        expirationDate: '',
        expirationMenu: false,
      });
      this.updateCoupons();
    },

    formattedExpirationDate(coupon) {
      return coupon.expirationDate ? formatDateToBr(coupon.expirationDate) : '';
    },

    confirmRemoveCoupon() {
      this.coupons.splice(this.couponIndexToRemove, 1);
      this.updateCoupons();
      this.confirmDialog = false;
      this.couponIndexToRemove = null;
    },

    removeCoupon(index) {
      this.couponNameToRemove =
        this.coupons[index].code || 'Cupom de número ' + (index + 1);
      this.couponIndexToRemove = index;
      this.confirmDialog = true;
    },
    updateCoupons() {
      this.$emit('update:form', { ...this.form, coupons: this.coupons });
    },
    onDiscountValueInput(coupon, index) {
      this.coupons[index].discountValue = formatPrice(coupon.discountValue);
    },
  },
};
</script>

<style scoped>
.step-coupons {
  margin: 0 auto;
}

.coupon-row {
  margin-bottom: 16px;
}
</style>
