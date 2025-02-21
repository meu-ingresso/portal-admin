<template>
  <div class="event-details-guestlists">
    <EventDetailsHeader />
    <!-- Breadcrumb para navegação -->
    <div v-if="isShowingMembers" class="breadcrumb-container mb-6">
      <!-- Versão Mobile -->
      <div v-if="isMobile" class="mobile-breadcrumb">
        <div
          class="d-flex align-center cursor-pointer mb-2"
          @click="$router.push(`/events/${$route.params.id}/guestlists`)">
          <v-icon color="primary" size="20">mdi-arrow-left</v-icon>
          <span class="primary--text ml-2">Voltar para listas</span>
        </div>
      </div>

      <!-- Versão Desktop -->
      <div v-else class="desktop-breadcrumb">
        <div
          class="d-flex align-center cursor-pointer"
          @click="$router.push(`/events/${$route.params.id}/guestlists`)">
          <v-icon color="primary" class="mr-2">mdi-arrow-left</v-icon>
          <span class="primary--text">Todas as listas de convidados</span>
        </div>
      </div>
    </div>

    <EventGuestList v-if="isShowingLists" />
    <EventGuestListMembers v-else-if="isShowingMembers" :list-id="$route.params.listId" />
  </div>
</template>

<script>
import { eventGuests } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default {
  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isShowingLists() {
      return this.$route.meta.view === 'lists';
    },

    isShowingMembers() {
      return this.$route.meta.view === 'members';
    },

    currentList() {
      if (!this.isShowingMembers) return null;
      return eventGuests.$guestLists.find(
        (list) => list.id === this.$route.params.listId
      );
    },
  },
};
</script>

<style scoped>
.event-details-guestlists {
  padding-top: 16px;
  max-width: 72rem;
  margin: 0 auto;
}

/* Estilos compartilhados */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

/* Estilos Desktop */
.desktop-breadcrumb {
  display: flex;
  align-items: center;
}

.text-truncate {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilos Mobile */
.mobile-breadcrumb {
  padding: 0 4px;
}

.mobile-breadcrumb .cursor-pointer {
  font-size: 14px;
}

.current-list-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--grey-dark);
  line-height: 1.2;
  word-break: break-word; /* Permite quebra de palavras longas */
  margin-top: 4px;
}

@media (max-width: 600px) {
  .event-details-guestlists {
    padding-top: 12px;
  }

  .breadcrumb-container {
    margin-bottom: 16px !important; /* Sobrescreve o mb-6 do Vuetify */
  }
}
</style>
