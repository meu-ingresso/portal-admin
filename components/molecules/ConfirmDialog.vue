<template>
  <v-dialog :value="value" max-width="500px" persistent @input="$emit('input', $event)">
    <v-card :tile="isMobile">
      <v-card-title v-if="!loading" class="d-flex justify-space-between align-center">
        <span class="modalTitle">{{ title }}</span>
        <v-btn icon :disabled="loading" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <template v-if="!loading">
          {{ message }}
        </template>
        <template v-else>
          <div class="text-center">
            <div v-if="loadingText" class="pt-10">
              <h2 class="pt-10">{{ loadingText }}</h2>
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
        v-if="!loading"
        class="d-flex justify-space-between align-center py-3 px-6">
        <DefaultButton outlined :text="cancelText" @click="handleClose" />
        <DefaultButton :text="confirmText" :color="confirmColor" @click="handleConfirm" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  name: 'ConfirmDialog',

  props: {
    value: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: 'Confirmar',
    },
    cancelText: {
      type: String,
      default: 'Cancelar',
    },
    loadingText: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    confirmColor: {
      type: String,
      default: 'primary',
    },
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    handleClose() {
      if (this.loading) return;
      this.$emit('input', false);
      this.$emit('cancel');
    },

    handleConfirm() {
      if (this.loading) return;
      this.$emit('confirm');
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
