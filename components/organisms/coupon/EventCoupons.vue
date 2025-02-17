<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div class="event-coupons-title">Tipos de Cupons</div>
    </v-col>

    <v-col cols="12" md="12" sm="12">
      <CouponRow
        v-for="coupon in getCoupons"
        :id="coupon.id"
        :key="coupon.id"
        :code="coupon.code"
        :discount-type="coupon.discount_type"
        :discount-value="coupon.discount_value"
        :max-uses="coupon.max_uses"
        :uses="coupon.uses"
        :tickets="coupon.tickets"
        :event-tickets="getTickets"
        :event-promoter="getEventPromoter"
        @edit="handleEditCoupon"
        @delete="handleDeleteCoupon" />
    </v-col>

    <!-- Modal de edição -->
    <v-dialog
      v-model="showEditDialog"
      max-width="900px"
      persistent
      :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Editar Cupom</h3>
          <v-btn icon :disabled="isLoading" @click="handleCloseEditDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <CouponForm
            v-if="showEditDialog"
            ref="couponEditForm"
            :edit-index="selectedCouponIndex"
            :event-id="eventId"
            :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end py-3 px-6">
          <DefaultButton
            outlined
            text="Cancelar"
            class="mr-4"
            :disabled="isLoading"
            @click="handleCloseEditDialog" />
          <DefaultButton
            text="Salvar"
            :is-loading="isLoading"
            :disabled="isLoading"
            @click="submitEdit" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmação -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="500px"
      persistent
      :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title v-if="!isLoading" class="d-flex justify-space-between align-center">
          <h3>Confirmar Exclusão</h3>
          <v-btn icon :disabled="isLoading" @click="handleCloseDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <template v-if="!isLoading">
            Tem certeza que deseja excluir o cupom "{{ selectedCoupon?.code }}"? Esta ação
            não pode ser desfeita.
          </template>
          <template v-else>
            <div class="text-center">
              <div class="pt-10">
                <h2 class="pt-10">Excluindo cupom...</h2>
              </div>
              <Lottie
                path="./animations/loading_default.json"
                height="130"
                width="200"
                class="teste" />
            </div>
          </template>
        </v-card-text>
        <v-card-actions
          v-if="!isLoading"
          class="d-flex align-center justify-space-between py-5">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isLoading"
            @click="handleCloseDialog" />
          <DefaultButton
            text="Excluir"
            :is-loading="isLoading"
            :disabled="isLoading"
            @click="confirmDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventCoupons, toast, eventTickets, eventGeneralInfo } from '@/store';
export default {
  props: {
    eventId: { type: String, required: true },
  },
  data() {
    return {
      showConfirmDialog: false,
      showEditDialog: false,
      isLoading: false,
      selectedCouponIndex: null,
      selectedCoupon: null,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
    getCoupons() {
      return eventCoupons.$coupons;
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
    getEventPromoter() {
      return eventGeneralInfo.$info?.promoter_id;
    },
  },
  methods: {
    handleCloseDialog() {
      if (!this.isLoading) {
        this.showConfirmDialog = false;
        this.selectedCoupon = null;
      }
    },

    handleCloseEditDialog() {
      if (!this.isLoading) {
        this.showEditDialog = false;
        this.selectedCouponIndex = null;
      }
    },

    handleDeleteCoupon(coupon) {
      this.selectedCoupon = coupon;
      this.showConfirmDialog = true;
    },

    handleEditCoupon(couponId) {
      console.log('[EDITAR CUPOM] - couponId', couponId);
      this.selectedCouponIndex = this.getCoupons.findIndex(
        (coupon) => coupon.id === couponId
      );
      console.log('[EDITAR CUPOM] - selectedCouponIndex', this.selectedCouponIndex);
      this.showEditDialog = true;
    },

    async submitEdit() {
      try {
        this.isLoading = true;

        const couponEditForm = this.$refs.couponEditForm;
        const { success } = await couponEditForm.handleSubmit(true);

        if (success) {
          this.isLoading = false;

          this.handleCloseEditDialog();
          toast.setToast({
            text: `Cupom atualizado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[ATUALIZAÇÃO - CouponForm] Erro de validação');
        }
      } catch (error) {
        this.showEditDialog = false;
        this.isLoading = false;
        console.error('Erro ao atualizar cupom:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async confirmDelete() {
      if (!this.selectedCoupon) return;

      try {
        this.isLoading = true;

        await eventCoupons.fetchDeleteCoupon(this.selectedCoupon.id);
        this.$emit('deleted', this.selectedCoupon.id);
        this.handleCloseDialog();

        // Notifica o usuário
        toast.setToast({
          text: `Cupom "${this.selectedCoupon.code}" removido com sucesso!`,
          type: 'success',
          time: 5000,
        });

        await eventCoupons.fetchAndPopulateByEventId(this.eventId);
      } catch (error) {
        console.error('Erro ao remover cupom:', error);
        toast.setToast({
          text: `Falha ao remover cupom. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
        this.showConfirmDialog = false;
      }
    },
  },
};
</script>

<style scoped>
.event-coupons-title {
  font-weight: 700;
  text-align: left;
  color: var(--black-text);
  font-family: var(--font-family-inter-bold);
  font-size: 26px;
}

@media (max-width: 360px) {
  .event-coupons-title {
    font-size: 16px !important;
  }
}

@media (min-width: 361px) and (max-width: 480px) {
  .event-coupons-title {
    font-size: 18px !important;
  }
}
</style>
