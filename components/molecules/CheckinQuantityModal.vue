<template>
  <v-dialog :value="show" max-width="480" persistent @input="$emit('update:show', $event)">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="modalTitle">Check-in de Convidado</h3>
        <v-btn icon @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="text-center mb-6">
          <h4 class="text-subtitle-1 mb-2">{{ memberName }}</h4>
          <div class="text-body-2 grey--text">
            Quantidade validada: {{ validatedQuantity }}/{{ totalQuantity }}
          </div>
          <div class="text-body-2 grey--text mb-4">
            Quantidade disponível para check-in: {{ remainingQuantity }}
          </div>

          <div class="quantity-controls d-flex align-center justify-center">
            <v-btn
              icon
              :disabled="!canDecrement"
              class="mx-2"
              color="primary"
              @click="decrementQuantity"
            >
              <v-icon size="24">mdi-minus</v-icon>
            </v-btn>

            <div class="quantity-display mx-4">
              {{ quantity }}
            </div>

            <v-btn
              icon
              :disabled="!canIncrement"
              class="mx-2"
              color="primary"
              @click="incrementQuantity"
            >
              <v-icon size="24">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
        <DefaultButton
          text="Cancelar"
          outlined
          @click="handleClose"
        />
        <DefaultButton
          text="Fazer Check-in"
          color="primary"
          :disabled="quantity === 0"
          @click="confirmCheckIn"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    memberId: {
      type: [Number, String],
      default: null
    },
    memberName: {
      type: String,
      default: ""
    },
    totalQuantity: {
      type: Number,
      default: 0
    },
    validatedQuantity: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      quantity: 0
    };
  },

  computed: {
    remainingQuantity() {
      return this.totalQuantity - this.validatedQuantity;
    },
    
    canDecrement() {
      return this.quantity > 0;
    },
    
    canIncrement() {
      return this.quantity < this.remainingQuantity;
    }
  },

  watch: {
    show(newValue) {
      if (newValue) {
        // Reset quantity when modal opens
        const maxInitial = Math.min(1, this.remainingQuantity);
        this.quantity = maxInitial;
      }
    },
    
    // Garantir que a quantidade seja atualizada se as props mudarem
    remainingQuantity(newValue) {
      if (this.show && this.quantity > newValue) {
        this.quantity = Math.max(0, newValue);
      }
    }
  },

  methods: {
    incrementQuantity() {
      if (this.canIncrement) {
        this.quantity++;
      }
    },
    
    decrementQuantity() {
      if (this.canDecrement) {
        this.quantity--;
      }
    },
    
    confirmCheckIn() {
      this.$emit('confirm', {
        id: this.memberId,
        quantity: this.quantity
      });
      this.handleClose();
    },
    
    handleClose() {
      this.quantity = 0;
      this.$emit('update:show', false);
    }
  }
};
</script>

<style scoped>
.quantity-display {
  font-size: 24px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.quantity-controls {
  border-radius: 8px;
  padding: 16px;
  background-color: #f5f5f5;
  margin: 0 auto;
  max-width: 220px;
}
</style> 