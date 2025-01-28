<template>
  <v-row
    class="event-row cursor-pointer"
    :class="{ deleted: deletedAt !== null }"
    @click="goToEventDetail">
    <v-col sm="12" md="2" class="event-status">
      <StatusBadge :text="deletedAt !== null ? 'Excluído' : statusText" />
    </v-col>

    <v-col sm="12" md="2">
      <v-img :src="getImage" class="event-image"></v-img>
    </v-col>

    <v-col sm="12" md="3">
      <h4 class="event-title">{{ title }}</h4>

      <p class="event-date">{{ formattedDate }}</p>

      <p class="event-location">{{ location }}</p>
    </v-col>

    <v-col sm="12" md="2" class="text-right">
      <p class="event-revenue">{{ formatToMoney(revenue) }}</p>

      <p class="event-revenue-today">{{ formatToMoney(revenueToday) }} hoje</p>
    </v-col>

    <v-col sm="12" md="1" class="text-right">
      <p class="event-tickets">{{ tickets }}</p>

      <p class="event-tickets-today">{{ ticketsToday }} hoje</p>
    </v-col>

    <v-col sm="12" md="2" class="text-right">
      <template v-if="isChangingStatus">
        <v-progress-circular indeterminate color="primary" size="24" />
      </template>

      <template v-else>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="statusText === 'Rascunho' && deletedAt === null"
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
              v-if="statusText === 'Rascunho' && deletedAt === null"
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
              v-if="deletedAt === null"
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
      </template>
    </v-col>

    <!-- Dialog de Confirmação -->
    <v-dialog v-model="confirmationDialog.visible" persistent max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>{{ confirmationDialog.title }}</h3>
          <v-btn icon @click="confirmationDialog.visible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>{{ confirmationDialog.message }}</v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between py-5">
          <DefaultButton
            outlined
            text="Cancelar"
            @click="confirmationDialog.visible = false" />
          <DefaultButton text="Confirmar" @click="handleConfirmation" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {
  formatHourToBr,
  formatRealValue,
  formatDateToCustomString,
} from '@/utils/formatters';
import { toast, event } from '@/store';
export default {
  props: {
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    revenue: { type: Number, required: true },
    revenueToday: { type: Number, required: true },
    tickets: { type: Number, required: true },
    ticketsToday: { type: Number, required: true },
    statusText: { type: String, required: true },
    image: { type: String, required: true },
    deletedAt: { type: String, required: false },
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
      return `${formatDateToCustomString(this.date)} - ${formatHourToBr(this.date)}`;
    },

    getImage() {
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
      this.$router.push({ name: 'Detalhe de Eventos', params: { id: this.eventId } });
    },
    async approveEvent() {
      try {
        const responseStatus = await event.fetchEventStatuses({ status: 'Publicado' });

        const newStatusId = responseStatus.data.id;

        await event.updateEvent({
          id: this.eventId,
          status_id: newStatusId,
        });
      } catch (error) {
        console.error(error);
      }
    },
    async rejectEvent() {
      try {
        const responseStatus = await event.fetchEventStatuses({ status: 'Reprovado' });

        const newStatusId = responseStatus.data.id;

        await event.updateEvent({
          id: this.eventId,
          status_id: newStatusId,
        });
      } catch (error) {
        console.error(error);
      }
    },
    async deleteEvent() {
      try {
        this.isDeleting = true;
        await event.deleteEvent({ eventId: this.eventId });
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
  max-width: 300px;
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
</style>
