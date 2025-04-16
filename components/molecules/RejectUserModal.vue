<template>
  <v-dialog :value="show" max-width="500px" persistent @input="$emit('update:show', $event)">
    <v-card :tile="isMobile">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="modalTitle">Rejeitar Produtor</span>
        <v-btn icon @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-textarea
          v-model="rejectionReason"
          label="Motivo da rejeição"
          :rules="[v => !!v || 'O motivo da rejeição é obrigatório']"
          required
          outlined
          auto-grow
          rows="4"
          counter="500"
          :maxlength="500"
        />
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between align-center py-3 px-6">
        <DefaultButton outlined text="Cancelar" @click="handleClose" />
        <DefaultButton
          text="Rejeitar"
          color="error"
          :disabled="!rejectionReason"
          @click="handleConfirm"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      rejectionReason: '',
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    handleClose() {
      this.rejectionReason = '';
      this.$emit('update:show', false);
      this.$emit('cancel');
    },

    handleConfirm() {
      if (!this.rejectionReason) return;
      this.$emit('confirm', this.rejectionReason);
      this.rejectionReason = '';
    },
  },
};
</script>

<style scoped>
.headline {
  color: var(--black-text);
  font-size: 20px;
  font-weight: 600;
  font-family: var(--font-family);
}

.v-card__text {
  color: var(--black-text) !important;
  font-size: 16px;
  font-family: var(--font-family);
}
</style> 