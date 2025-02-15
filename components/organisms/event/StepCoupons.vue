<template>
  <v-container class="step-coupons py-0 px-0">
    <v-row>
      <v-col cols="12">
        <template v-if="isMobile">
          <h3>Cupons</h3>
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
    <template v-if="getNonDeletedCoupons.length">
      <div class="table-container mt-4">
        <div class="table-header">
          <div class="table-cell">Código</div>
          <div class="table-cell">Valor</div>
          <div class="table-cell">Ingressos</div>
          <div class="table-cell informations">Detalhes</div>
          <div class="table-cell">Ações</div>
        </div>

        <div
          v-for="(coupon, index) in getNonDeletedCoupons"
          :key="index"
          class="table-row">
          <div class="table-cell">{{ coupon.code }}</div>
          <div class="table-cell">
            {{
              coupon.discount_type === 'FIXED'
                ? `R$ ${coupon.discount_value.replace('.', ',')}`
                : `${coupon.discount_value}%`
            }}
          </div>
          <div class="table-cell">{{ getArrayObjectText(coupon.tickets, 'name') }}</div>

          <div class="table-cell informations">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <div class="info-icon-wrapper" v-bind="attrs" v-on="on">
                  <v-icon class="mr-3">mdi-information</v-icon>
                </div>
              </template>
              <div class="ticket-info-tooltip">
                <div class="info-row">
                  <span class="info-label">Utilizados:</span>
                  <span class="info-value"
                    >{{ coupon.uses }} / {{ coupon.max_uses }}</span
                  >
                </div>
                <div class="info-row">
                  <span class="info-label">Início:</span>
                  <span class="info-value">{{
                    formatDateTime(coupon.start_date, coupon.start_time)
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Término:</span>
                  <span class="info-value">{{
                    formatDateTime(coupon.end_date, coupon.end_time)
                  }}</span>
                </div>
              </div>
            </v-tooltip>
          </div>

          <div class="table-cell actions">
            <v-btn icon small class="mr-2" @click="openEditModal(index)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="handleRemoveCoupon(index)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de Novo Cupom -->
    <v-dialog
      v-model="newCouponModal"
      max-width="960px"
      :fullscreen="isMobile"
      persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Novo Cupom</h3>
          <v-btn icon @click="newCouponModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CouponForm v-if="newCouponModal" ref="newCouponForm" :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex align-center py-5">
          <v-spacer />

          <DefaultButton outlined text="Cancelar" @click="newCouponModal = false" />
          <DefaultButton text="Salvar" @click="saveNewCoupon" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="editModal" max-width="960px" :fullscreen="isMobile" persistent>
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Cupom</h3>
          <v-btn icon @click="editModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4 py-2">
          <CouponForm
            v-if="editModal"
            ref="editCouponForm"
            :edit-index="selectedCouponIndex"
            :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton outlined text="Cancelar" @click="editModal = false" />
          <DefaultButton text="Salvar" @click="saveEditedCoupon" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Confirmar exclusão</h3>
          <v-btn icon @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          {{ confirmMessage }}
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
import { formatDateToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import { toast, eventTickets, eventCoupons } from '@/store';
export default {
  data() {
    return {
      confirmDialog: false,
      confirmMessage: '',
      couponIdxToRemove: null,
      editModal: false,
      selectedCouponIndex: null,
      newCouponModal: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getNonDeletedTickets() {
      return eventTickets.$tickets.filter((ticket) => !ticket._deleted);
    },

    getTickets() {
      return eventTickets.$tickets.map((ticket) => {
        return {
          id: ticket.id,
          name: ticket.name,
          _deleted: ticket._deleted,
        };
      });
    },

    getNonDeletedCoupons() {
      return eventCoupons.$coupons.filter((coupon) => !coupon._deleted);
    },
  },

  methods: {
    formatDateTime(date, time) {
      if (!date || !time) return '-';
      try {
        const formattedDate = formatDateToBr(date);
        return `${formattedDate} às ${time}`;
      } catch (error) {
        console.error('Erro ao formatar data/hora:', error);
        return '-';
      }
    },

    formattedExpirationDate(coupon) {
      return coupon.end_date ? formatDateToBr(coupon.end_date) : '';
    },

    handleRemoveCoupon(index) {
      this.couponIdxToRemove = index;
      const couponToRemove = this.getNonDeletedCoupons[index];
      this.confirmMessage = `Tem certeza de que deseja excluir o cupom "${couponToRemove.code}"?`;
      this.confirmDialog = true;
    },

    confirmRemoveCoupon() {
      eventCoupons.removeCoupon(this.couponIdxToRemove);
      toast.setToast({
        text: 'Cupom removido com sucesso.',
        type: 'success',
        time: 5000,
      });
      this.confirmDialog = false;
    },

    openNewCouponModal() {
      this.newCouponModal = true;
    },

    async saveNewCoupon() {
      const couponForm = this.$refs.newCouponForm;
      const result = await couponForm.handleSubmit();

      if (result && result.success) {
        this.newCouponModal = false;
      }
    },

    openEditModal(index) {
      this.selectedCouponIndex = index;
      this.editModal = true;
    },

    async saveEditedCoupon() {
      if (this.selectedCouponIndex !== null) {
        const couponForm = this.$refs.editCouponForm;

        const result = await couponForm.handleSubmit();

        if (result && result.success) {
          this.editModal = false;
          this.selectedCouponIndex = null;
        }
      }
    },

    getArrayObjectText(array, key = null) {
      if (!array) return '-';

      return array.map((item) => (key ? item[key] : item)).join(', ') || '-';
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
  align-items: center;
  display: flex;
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
  justify-content: end;
}

.table-cell.informations {
  text-align: right;
  justify-content: end;
}

.table-row.disabled-row {
  opacity: 0.6;
  pointer-events: none;
  background-color: #f9f9f9;
}

.table-row.disabled-row .table-cell {
  font-style: italic;
}

.info-icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  white-space: nowrap;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: var(--grey-text);
  margin-right: 12px;
  font-weight: 500;
}

.info-value {
  color: white;
  text-align: right;
}
</style>
