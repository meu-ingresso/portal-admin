<template>
  <v-row justify="space-between" class="mt-4" :class="{ 'fixed-actions px-2': isMobile }">
    <v-col cols="12" class="d-flex justify-space-between">
      <DefaultButton
        outlined
        :disabled="isSaving"
        class="mr-2"
        text="Voltar"
        @click="$emit('previous')" />

      <template v-if="!isLastStep">
        <DefaultButton text="Próximo" :disabled="isSaving" @click="$emit('next')" />
      </template>

      <div v-else>
        <DefaultButton
          v-if="!isEditing"
          text="Salvar em rascunho"
          :disabled="isSaving"
          class="mr-2"
          @click="$emit('submit', 'Rascunho')" />

        <DefaultButton
          :text="buttonText"
          :disabled="isSaving"
          @click="$emit('submit', 'Em Análise')" />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  props: {
    isFirstStep: {
      type: Boolean,
      default: false,
    },
    isLastStep: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    hasSubmittedDocuments: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isSaving() {
      return this.$store.getters['eventPrincipal/$isSaving'];
    },

    buttonText() {
      if (this.isEditing) {
        return 'Salvar Alterações';
      }
      
      if (!this.hasSubmittedDocuments) {
        return 'Enviar para análise';
      }
      
      return 'Publicar Evento';
    },
  },
};
</script>

<style scoped>
.fixed-actions {
  border-top: 1px solid var(--tertiary);
}
</style>
