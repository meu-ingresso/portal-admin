<template>
  <div v-if="getEvent" class="event-details-tickets">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <!-- Estado vazio -->
      <template v-if="getCoupons?.length === 0">
        <EmptyState
          title="Ainda não há cupons"
          subtitle="Uma vez criados, seus cupons aparecerão aqui"
          icon="mdi-ticket">
          <template #action>
            <DefaultButton
              text="Adicionar"
              icon="mdi-plus"
              class="mt-6"
              @click="openAddCouponModal" />
          </template>
        </EmptyState>
      </template>
      <template v-else>
        <StatisticList :statistics="getStatistics" title="Cupons" />

        <EventCoupons :event-id="getEvent.id" @add-coupon="openAddCouponModal" />
      </template>
    </div>

    <!-- Modal de adição -->
    <v-dialog v-model="showAddDialog" max-width="900px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Adicionar Cupom</h3>
          <v-btn icon :disabled="isAddingCoupon" @click="handleCloseAddDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-4">
          <CouponForm
            v-if="showAddDialog"
            ref="couponForm"
            :event-id="getEvent.id"
            :tickets="getTickets" />
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton
            outlined
            text="Cancelar"
            :disabled="isAddingCoupon"
            @click="handleCloseAddDialog" />
          <DefaultButton
            text="Salvar"
            :is-loading="isAddingCoupon"
            :disabled="isAddingCoupon"
            @click="submitAdd" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGeneralInfo, eventCoupons, eventTickets, toast } from '@/store';

export default {
  data() {
    return {
      showAddDialog: false,
      isAddingCoupon: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
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

    getEvent() {
      return eventGeneralInfo.$info;
    },

    getCoupons() {
      return eventCoupons.$coupons;
    },

    getStatistics() {
      if (!this.getEvent || !this.getCoupons) return [];

      const totalUsed = this.getCoupons.reduce((acc, coupon) => acc + coupon.uses, 0);

      const totalQuantity = this.getCoupons.reduce(
        (acc, coupon) => acc + coupon.max_uses,
        0
      );

      return [
        {
          title: 'Usos / Limite',
          value: `${totalUsed} / ${totalQuantity}`,
        },
        {
          title: 'Cupons',
          value: `${this.getCoupons.length}`,
        },
      ];
    },
  },

  methods: {
    handleCloseAddDialog() {
      this.showAddDialog = false;
    },

    openAddCouponModal() {
      this.showAddDialog = true;
    },

    async submitAdd() {
      try {
        this.isAddingCoupon = true;
        const couponForm = this.$refs.couponForm;
        const { success } = await couponForm.handleSubmit(true);
        if (success) {
          this.showAddDialog = false;
          toast.setToast({
            text: `Cupom adicionado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[INSERÇÃO - CouponForm] Erro de validação');
        }
      } catch (error) {
        console.log('[INSERÇÃO - CouponForm] Erro de validação');
      } finally {
        this.isAddingCoupon = false;
      }
    },
  },
};
</script>

<style scoped>
.event-details-tickets {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
