<template>
  <v-container class="step-coupons py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Cadastro de Cupons</h3>
          <p class="subtitle-2">Adicione cupons de desconto para o evento.</p>
        </template>
        <ButtonWithIcon
          class="mt-2"
          text="Cupom"
          direction="left"
          @click="openNewCouponModal" />
      </v-col>
    </v-row>

    <!-- Tabela de Cupons -->
    <template v-if="coupons.length">
      <div class="table-container mt-4">
        <div class="table-header">
          <div class="table-cell">Código</div>
          <div class="table-cell">Valor</div>
          <div class="table-cell">Ações</div>
        </div>

        <div
          v-for="(coupon, index) in coupons"
          :key="index"
          class="table-row"
          :class="{ 'disabled-row': coupon.isDefault }">
          <div class="table-cell">{{ coupon.code }}</div>
          <div class="table-cell">
            {{
              coupon.discountType === 'fixed'
                ? `R$ ${coupon.discountValue}`
                : `${coupon.discountValue}%`
            }}
          </div>
          <div class="table-cell actions">
            <v-btn
              icon
              small
              :disabled="coupon.isDefault"
              @click="openEditModal(coupon, index)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small :disabled="coupon.isDefault" @click="removeCoupon(index)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de Novo Cupom -->
    <v-dialog v-model="newCouponModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Novo Cupom</h3>
          <v-btn icon @click="newCouponModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CouponForm
            :coupon="newCoupon"
            :discount-types="discountTypes"
            @update:coupon="updateNewCouponFields" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="newCouponModal = false" />
          <DefaultButton text="Salvar" @click="saveNewCoupon" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="800px" :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Cupom</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CouponForm
            :coupon="selectedCoupon"
            :discount-types="discountTypes"
            @update:coupon="updateCouponFields" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedCoupon" />
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { formatDateToBr, formatPrice } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import { toast } from '@/store';
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
      newCouponModal: false,
      newCoupon: this.getEmptyCoupon(),
      editModal: false,
      selectedCoupon: null,
      selectedCouponIndex: null,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    getEmptyCoupon() {
      return {
        code: '',
        discountType: 'fixed',
        discountValue: 0,
        maxUses: 1,
        expirationDate: '',
        isDefault: false,
      };
    },

    formattedExpirationDate(coupon) {
      return coupon.expirationDate ? formatDateToBr(coupon.expirationDate) : '';
    },

    confirmRemoveCoupon() {
      this.coupons.splice(this.couponIndexToRemove, 1);
      this.confirmDialog = false;
      this.couponIndexToRemove = null;
      this.emitChanges();
      toast.setToast({
        text: 'Cupom removido com sucesso.',
        type: 'success',
        time: 5000,
      });
    },

    openNewCouponModal() {
      this.newCoupon = this.getEmptyCoupon();
      this.newCouponModal = true;
    },

    updateNewCouponFields(updatedCoupon) {
      this.newCoupon = updatedCoupon;
    },

    saveNewCoupon() {
      this.coupons.push({ ...this.newCoupon });
      this.newCouponModal = false;
      this.emitChanges();
    },

    openEditModal(coupon, index) {
      this.selectedCoupon = { ...coupon };
      this.selectedCouponIndex = index;
      this.editModal = true;
    },

    updateCouponFields(updatedCoupon) {
      this.selectedCoupon = updatedCoupon;
    },

    saveEditedCoupon() {
      if (this.selectedCouponIndex !== null) {
        this.$set(this.coupons, this.selectedCouponIndex, this.selectedCoupon);
        this.editModal = false;
        this.emitChanges();
      }
    },

    emitChanges() {
      this.$emit('update:form', { ...this.form, coupons: this.coupons });
    },

    removeCoupon(index) {
      this.couponNameToRemove =
        this.coupons[index].code || 'Cupom de número ' + (index + 1);
      this.couponIndexToRemove = index;
      this.confirmDialog = true;
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

.table-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tertiary);
  border-radius: 8px;
}

.table-header,
.table-row {
  display: flex !important;
}

.table-cell {
  flex: 1;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.table-header .table-cell {
  font-size: 14px;
}

.table-row .table-cell {
  font-size: 12px;
}

.table-header {
  background-color: #f4f4f4;
  font-weight: bold;
  font-size: 16px;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-cell:last-child {
  text-align: right;
}

.table-row.disabled-row {
  opacity: 0.6;
  pointer-events: none;
  background-color: #f9f9f9;
}

.table-row.disabled-row .table-cell {
  font-style: italic;
}
</style>
