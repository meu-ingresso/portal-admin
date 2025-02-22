<template>
  <div v-if="getEvent" class="event-details-promoters">
    <EventDetailsHeader />
    <div class="event-details-wrapper">
      <template v-if="!hasPromoters">
        <EmptyState
          title="Ainda não há promoters"
          subtitle="Uma vez adicionados, seus promoters aparecerão aqui"
          icon="mdi-account-group">
          <template #action>
            <DefaultButton
              text="Adicionar promoter"
              icon="mdi-plus"
              class="mt-6"
              @click="openAddPromoterModal" />
          </template>
        </EmptyState>
      </template>
    </div>
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';
import { eventGeneralInfo } from '@/store';

export default {
  data() {
    return {
      hasPromoters: false,
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      return eventGeneralInfo.$info;
    },
  },

  methods: {
    openAddPromoterModal() {
      // Implementar lógica de adicionar promoter
    },
  },
};
</script>

<style scoped>
.event-details-promoters {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}
.event-details-wrapper {
  max-width: 1480px;
}
</style>
