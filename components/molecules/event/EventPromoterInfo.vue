<template>
  <div v-if="promoterInfo" class="event-promoter-info">
    <ABaseTooltip 
      :text="promoterTooltipText"
      position="bottom"
      variant="card"
    >
      <div class="promoter-summary d-flex align-center">
        <v-icon class="mr-2 promoter-icon" small>mdi-account-star</v-icon>
        <span class="promoter-text">Produtor {{ promoterInfo.name }}</span>
      </div>
    </ABaseTooltip>
  </div>
</template>

<script>
import ABaseTooltip from '@/components/atoms/ABaseTooltip.vue';

export default {
  name: 'EventPromoterInfo',

  components: {
    ABaseTooltip,
  },

  computed: {
    currentEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    isAdmin() {
      const role = this.$auth.user?.role;
      return role && role.name === 'Admin';
    },

    promoterInfo() {
      if (!this.currentEvent?.promoter || !this.isAdmin) return null;
      
      const promoter = this.currentEvent.promoter;
      const people = promoter.people;
      
      if (!people) return null;
      
      return {
        name: `${people.first_name || ''} ${people.last_name || ''}`.trim() || 'Nome não informado',
        email: promoter.email || 'Email não informado',
        tax: people.tax || null
      };
    },

    promoterTooltipText() {
      if (!this.promoterInfo) return '';
      
      let tooltipText = `Email: ${this.promoterInfo.email}`;
      
      if (this.promoterInfo.tax) {
        tooltipText += `\n Documento: ${this.promoterInfo.tax}`;
      }
      
      return tooltipText;
    },
  },
};
</script>

<style scoped>

.promoter-summary {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px !important;
  background-color: var(--tertiary);
  border: 0px !important;
  transition: all 0.2s ease;
}

.promoter-summary:hover {
  background-color: rgba(156, 39, 176, 0.1);
  border-color: rgba(156, 39, 176, 0.3);
}

.promoter-icon {
  color: #9c27b0;
}

.promoter-text {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

@media (max-width: 600px) {
  .promoter-summary {
    padding: 6px 10px;
  }

  .promoter-text {
    font-size: 13px;
  }
}
</style> 