<template>
  <div class="event-details-guestlists">
    <EventDetailsHeader />
    <div v-if="isShowingMembers" class="breadcrumb-container mb-6">
      <div
        class="d-flex align-center cursor-pointer"
        @click="$router.push(`/events/${$route.params.id}/guestlists`)">
        <v-icon color="primary" class="mr-2">mdi-arrow-left</v-icon>
        <span class="primary--text">Todas as listas de convidados</span>
      </div>
      <v-divider vertical class="mx-4" />
      <span class="grey--text text-truncate">{{ currentList?.name }}</span>
    </div>

    <EventGuestList v-if="isShowingLists" />
    <EventGuestListMembers v-else-if="isShowingMembers" :list-id="$route.params.listId" />
  </div>
</template>

<script>
import { eventGuests } from '@/store';

export default {
  computed: {
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

.breadcrumb-container {
  display: flex;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

.text-truncate {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
