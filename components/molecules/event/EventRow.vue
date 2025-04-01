<template>
  <v-row
    class="event-row cursor-pointer"
    :class="{ deleted: event?.deleted_at !== null }"
    @click="goToEventDetail">
    <v-col sm="12" md="2" class="event-status">
      <StatusBadge :text="event?.deleted_at !== null ? 'Excluído' : event.status.name" />
    </v-col>

    <v-col sm="12" md="2" class="position-relative">
      <v-img :src="getImage" class="event-image"></v-img>
      <v-chip
        v-if="showSessionsIndicator && event.hasSessions"
        color="primary"
        small
        class="sessions-chip ma-2"
        dark>
        {{ event.sessionsCount }} datas disponíveis
      </v-chip>
    </v-col>

    <v-col sm="12" md="3">
      <h4 class="event-title">{{ event.name }}</h4>

      <p class="event-date">{{ formattedDate }}</p>

      <p class="event-location">{{ event.location }}</p>
    </v-col>

    <v-col sm="12" md="2" class="text-right d-flex">
      <div class="d-flex flex-column justify-center">
        <p class="event-revenue">{{ formatToMoney(event.totalizers.totalSalesAmount) }}</p>
        <p class="event-revenue-today">
          {{ formatToMoney(event.totalizers.totalSalesAmountToday) }} hoje
        </p>
      </div>
    </v-col>

    <v-col sm="12" md="1" class="text-right d-flex">
      <div class="d-flex flex-column justify-center">
        <p class="event-tickets">{{ event.totalizers.totalSales }}</p>
        <p class="event-tickets-today">{{ event.totalizers.totalSalesToday }} hoje</p>
      </div>
    </v-col>

    <v-col sm="12" md="2" class="d-flex justify-end">
      <template v-if="isChangingStatus">
        <v-progress-circular indeterminate color="primary" size="24" />
      </template>

      <div v-else class="d-flex justify-center align-center">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="canManageEvent && event.status.name === 'Em Análise'"
              class="approve-icon"
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop="confirmAction('approve')">
              <v-icon> mdi-check </v-icon>
            </v-btn>
          </template>
          <span>Aprovar evento</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="canManageEvent && event.status.name === 'Em Análise'"
              class="reject-icon"
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop="confirmAction('reject')">
              <v-icon> mdi-close </v-icon>
            </v-btn>
          </template>
          <span>Reprovar evento</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="canManageEvent && event.deleted_at === null"
              class="delete-icon"
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop="confirmAction('delete')">
              <v-icon> mdi-delete </v-icon>
            </v-btn>
          </template>
          <span>Deletar evento</span>
        </v-tooltip>
      </div>
    </v-col>

    <ConfirmDialog
      v-model="confirmationDialog.visible"
      :title="confirmationDialog.title"
      :message="confirmationDialog.message"
      confirm-text="Confirmar"
      :loading="isChangingStatus"
      @confirm="handleConfirmation"
      @cancel="confirmationDialog.visible = false" />
  </v-row>
</template>

<script>
import {
  formatHourToBr,
  formatRealValue,
  formatDateToCustomString,
} from '@/utils/formatters';
import { toast, event, eventGeneralInfo } from '@/store';
export default {
  props: {
    event: { type: Object, required: true },
    canManageEvent: { type: Boolean, required: true },
    image: { type: String, required: false, default: null },
    showSessionsIndicator: { type: Boolean, default: false },
  },

  data() {
    return {
      confirmationDialog: {
        visible: false,
        action: null,
        title: '',
        message: '',
      },
      isChangingStatus: false,
      isDeleting: false,
    };
  },

  computed: {
    formattedDate() {
      return `${formatDateToCustomString(this.event.start_date)} - ${formatHourToBr(
        this.event.start_date
      )}`;
    },

    getImage() {
      if (!this.image) {
        return require(`~/assets/images/default_banner.png`);
      }

      if (this.image.startsWith('/assets')) {
        return require(`@/assets/${this.image.split('/assets/')[1]}`);
      }
      return this.image;
    },
  },

  methods: {
    formatToMoney(value) {
      return formatRealValue(value);
    },

    confirmAction(action) {
      let title, message;

      if (action === 'approve') {
        title = 'Aprovar Evento';
        message = 'Tem certeza que deseja aprovar este evento?';
      } else if (action === 'reject') {
        title = 'Reprovar Evento';
        message = 'Tem certeza que deseja reprovar este evento?';
      } else if (action === 'delete') {
        title = 'Deletar Evento';
        message =
          'Tem certeza que deseja deletar este evento? Esta ação não poderá ser desfeita.';
      }

      this.confirmationDialog = {
        visible: true,
        action,
        title,
        message,
      };
    },

    async handleConfirmation() {
      const { action } = this.confirmationDialog;
      this.confirmationDialog.visible = false;

      try {
        this.isChangingStatus = true;

        if (action === 'approve') {
          await this.approveEvent();
        } else if (action === 'reject') {
          await this.rejectEvent();
        } else if (action === 'delete') {
          await this.deleteEvent();
        }

        this.isChangingStatus = false;

        toast.setToast({
          text: `Evento ${action} com sucesso!`,
          type: 'success',
          time: 5000,
        });

        this.refresh();
      } catch (error) {
        console.error(error);

        this.isChangingStatus = false;

        toast.setToast({
          text: `Falha ao ${action} o evento. Tente novamente.`,
          type: 'danger',
          time: 5000,
        });
      }
    },

    async refresh() {
      try {
        await event.fetchEvents({
          sortBy: ['name'],
          sortDesc: [false],
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    goToEventDetail() {
      this.$router.push({ name: 'Detalhe de Eventos', params: { id: this.event.id } });
    },
    async approveEvent() {
      try {
        await eventGeneralInfo.updateEventStatus({
          eventId: this.event.id,
          statusName: 'Publicado',
        });
      } catch (error) {
        console.error(error);
      }
    },
    async rejectEvent() {
      try {
        await eventGeneralInfo.updateEventStatus({
          eventId: this.event.id,
          statusName: 'Reprovado',
        });
      } catch (error) {
        console.error(error);
      }
    },
    async deleteEvent() {
      try {
        this.isDeleting = true;
        await event.deleteEvent({ eventId: this.event.id });
        this.isDeleting = false;
      } catch (error) {
        this.isDeleting = false;
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.event-row:hover {
  transform: scale(1.005);
}

.event-row {
  transition: transform 0.3s ease;
  margin-bottom: 16px;
  background-color: var(--tertiary);
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 14px;
  padding-left: 14px;
}

.event-row.deleted {
  opacity: 0.6;
}

.event-row.deleted:hover {
  transform: none;
}

.event-status {
  display: flex;
  align-items: center;
  justify-content: center;
}
.event-image {
  border-radius: 8px;
  aspect-ratio: 954/500; /* Mantém a proporção exata */
  width: 100%; /* Ocupa toda a largura da coluna */
  height: auto; /* Altura ajustada automaticamente */
  object-fit: cover; /* Garante que a imagem cubra todo o espaço sem distorção */
  max-height: 120px; /* Limita a altura máxima na listagem */
}
.event-title {
  font-size: 16px;
  font-weight: bold;
}

.event-revenue,
.event-tickets {
  font-size: 16px;
  font-weight: bold;
  color: var(--font-black);
}
.event-date,
.event-location,
.event-revenue-today,
.event-tickets-today {
  font-size: 14px;
  color: gray;
}

.approve-icon {
  color: green !important;
}

.reject-icon {
  color: #f9a825 !important;
}

.delete-icon {
  color: red !important;
}

.position-relative {
  position: relative;
}

.sessions-chip {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}
</style>
