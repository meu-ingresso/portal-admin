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
          @click="$emit('submit', 'draft')" />

        <DefaultButton
          :text="isEditing ? 'Salvar Alterações' : 'Publicar Evento'"
          :disabled="isSaving"
          @click="$emit('submit', 'pending')" />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { eventPrincipal } from '@/store';
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
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isSaving() {
      return eventPrincipal.$isSaving;
    },
  },
};
</script>

<style scoped>
.fixed-actions {
  border-top: 1px solid var(--tertiary);
}
</style>
