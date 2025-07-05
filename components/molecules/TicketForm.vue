<template>
  <v-form ref="form" v-model="isFormValid">
    <v-row>
      <v-col cols="12" md="6" sm="12">
        <v-text-field ref="name" v-model="localTicket.name" :label="nomenclature === 'Doação'
          ? 'Nome da doação'
          : `Nome do ${nomenclature?.toLowerCase()}`
          " placeholder="Ex: Ingresso VIP" required outlined dense hide-details="auto" :rules="validationRules.name" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <GenericAutocomplete :value="localTicket.category" :items="categories"
          :label="`Grupo de ${nomenclature?.toLowerCase()}`"
          :placeholder="`Crie categorias para agrupar ${nomenclature?.toLowerCase()}`" @input="onCategoryChange" />
      </v-col>

      <!-- Para casos de doação, não exibir os campos de preço e quantidade -->
      <template v-if="!isDonation">
        <v-col cols="12" md="6" sm="12">
          <AMoneyInput v-model="localTicket.price" label="Preço" :min-value="3" required hide-details="auto"
            @input="onPriceChange" />
        </v-col>
        <v-col cols="12" md="6" sm="12">
          <v-text-field ref="total_quantity" v-model="localTicket.total_quantity" :value="localTicket.total_quantity"
            label="Quantidade" placeholder="Ex.: 400" type="number" min="0" required outlined dense hide-details="auto"
            :rules="validationRules.total_quantity" @keypress="onNumerFieldChange" />
        </v-col>
      </template>

      <template v-if="!isDonation && !isMobile">
        <v-col cols="12" md="12" sm="12" class="py-0 my-4">
          <div class="d-flex align-center" style="padding: 0px 4px 0px">
            <h4 class="mr-2">Quantidade permitida por compra</h4>
            <v-tooltip :right="!isMobile" :bottom="isMobile">
              <template #activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
              </template>
              <span> Limite a quantidade mínima e máxima permitida por compra </span>
            </v-tooltip>
          </div>
        </v-col>

        <v-col cols="12" md="6" sm="12">
          <v-text-field ref="min_purchase" v-model="localTicket.min_purchase" label="Mínima" type="number" min="0"
            outlined dense required hide-details="auto" :rules="validationRules.min_purchase"
            @keypress="onNumerFieldChange" />
        </v-col>
        <v-col cols="12" md="6" sm="12">
          <v-text-field ref="max_purchase" v-model="localTicket.max_purchase" label="Máxima" type="number" min="0"
            outlined dense required hide-details="auto" :rules="validationRules.max_purchase" />
        </v-col>
      </template>

      <v-col cols="12" md="3" sm="12">
        <v-menu v-model="openDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field :value="formattedOpenDate" label="Início das Vendas" prepend-inner-icon="mdi-calendar"
              readonly v-bind="attrs" outlined dense required hide-details="auto" :rules="validationRules.start_date"
              v-on="on" />
          </template>
          <v-date-picker v-model="localTicket.start_date" locale="pt-br" no-title dense :min="minDate"
            @input="onDateChange('start_date', $event)" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field v-model="localTicket.start_time" v-mask="'##:##'" label="Horário de Início"
          prepend-inner-icon="mdi-clock-outline" placeholder="21:30" outlined dense hide-details="auto" required
          :rules="validationRules.start_time" @input="validateTime($event, 'start_time')" />
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-menu v-model="closeDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field :value="formattedCloseDate" label="Término das Vendas" prepend-inner-icon="mdi-calendar"
              readonly v-bind="attrs" outlined dense required hide-details="auto" :rules="validationRules.end_date"
              v-on="on" />
          </template>
          <v-date-picker v-model="localTicket.end_date" locale="pt-br" dense no-title
            :min="localTicket.start_date ? localTicket.start_date : minDate"
            @input="onDateChange('end_date', $event)" />
        </v-menu>
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-text-field v-model="localTicket.end_time" v-mask="'##:##'" label="Horário de Término"
          prepend-inner-icon="mdi-clock-outline" placeholder="00:00" outlined dense hide-details="auto" required
          :rules="validationRules.end_time" @input="validateTime($event, 'end_time')" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-select ref="availability" v-model="localTicket.availability" :items="availabilityList"
          label="Disponibilidade" outlined placeholder="Selecione a disponibilidade" persistent-hint
          :hint="getHintByAvailability" required dense :rules="validationRules.availability" hide-details="auto" />
      </v-col>
      <template v-if="!isDonation && isMobile">
        <v-col cols="12" md="12" sm="12" class="py-0 my-2">
          <div class="d-flex align-center" style="padding: 0px 4px 0px">
            <h4 class="mr-2">Quantidade permitida por compra</h4>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
              </template>
              <span>Limite a quantidade permitida por compra com quantidade mínima e
                máxima</span>
            </v-tooltip>
          </div>
        </v-col>

        <v-col cols="12" md="6" sm="12">
          <v-text-field ref="min_purchase" v-model="localTicket.min_purchase" label="Compra Mínima" type="number"
            min="0" outlined dense required hide-details="auto" :rules="validationRules.min_purchase"
            @keypress="onNumerFieldChange" />
        </v-col>
        <v-col cols="12" md="6" sm="12">
          <v-text-field ref="max_purchase" v-model="localTicket.max_purchase" label="Compra Máxima" type="number"
            min="0" outlined dense required hide-details="auto" :rules="validationRules.max_purchase" />
        </v-col>
      </template>
    </v-row>
  </v-form>
</template>

<script>
import { mask } from 'vue-the-mask';
import { formatDateToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
import AMoneyInput from '@/components/atoms/AMoneyInput.vue';

export default {
  components: {
    AMoneyInput,
  },

  directives: {
    mask,
  },

  props: {
    editIndex: {
      type: Number,
      default: null,
    },
    nomenclature: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    return {
      isFormValid: false,
      localTicket: {
        id: '-1',
        name: '',
        category: null,
        price: 0,
        total_quantity: '',
        min_purchase: 1,
        max_purchase: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        availability: 'Publico',
      },
      availabilityList: [
        { text: 'Para todo o público', value: 'Publico' },
        { text: 'Restrito a convidados', value: 'Privado' },
        { text: 'Apenas PDV interno', value: 'PDV' },
      ],
      openDateMenu: false,
      closeDateMenu: false,
      minDate,
      validationRules: {
        name: [
          (v) => !!v || 'O nome é obrigatório.',
          (v) => v.length <= 60 || 'O nome deve ter no máximo 60 caracteres.',
        ],
        total_quantity: [
          (v) => !!v || 'A quantidade é obrigatória.',
          (v) => v > 0 || 'A quantidade deve ser maior que zero.',
        ],
        min_purchase: [
          (v) => !!v || 'A compra mínima é obrigatória.',
          (v) => v >= 0 || 'A compra mínima deve ser maior ou igual a zero.',
        ],
        max_purchase: [
          (v) => !!v || 'A compra máxima é obrigatória.',
          (v) => v > 0 || 'A compra máxima deve ser maior que zero.',
          (v) =>
            !v ||
            Number(v) >= Number(this.localTicket.min_purchase) ||
            'A compra máxima deve ser maior ou igual à compra mínima.',
          (v) =>
            !v ||
            Number(v) <= Number(this.localTicket.total_quantity) ||
            'A compra máxima por compra deve ser menor ou igual à quantidade total.',
        ],
        start_date: [
          (v) => !!v || 'A data de início é obrigatória.',
          (v) => {
            if (!v) return true;
            const today = new Date();
            const startDate = new Date(this.localTicket.start_date + 'T00:00:00');

            const todayDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const ticketDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            );

            if (ticketDate >= todayDate) return true;
            return 'A data de início não pode ser anterior à data atual.';
          },
        ],
        start_time: [
          (v) => !!v || 'O horário de início é obrigatório.',
          (v) => {
            if (!v) return true;
            const [hours, minutes] = v.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23.';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59.';
            }
            return true;
          },
        ],
        end_date: [
          (v) => !!v || 'A data de término é obrigatória.',
          (v) => {
            if (!v || !this.localTicket.start_date) return true;

            const startDate = new Date(this.localTicket.start_date + 'T00:00:00');
            const endDate = new Date(this.localTicket.end_date + 'T00:00:00');

            if (endDate >= startDate) return true;
            return 'A data de término deve ser posterior ou igual à data de início.';
          },
        ],
        end_time: [
          (v) => !!v || 'O horário de término é obrigatório.',
          (v) => {
            if (!v) return true;
            const [hours, minutes] = v.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23.';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59.';
            }

            // Validação adicional quando as datas são iguais
            if (this.localTicket.start_date === this.localTicket.end_date) {
              const [startHours, startMinutes] = this.localTicket.start_time
                .split(':')
                .map(Number);
              const startTotal = startHours * 60 + startMinutes;
              const endTotal = hours * 60 + minutes;

              return (
                endTotal > startTotal ||
                'O horário de término deve ser posterior ao horário de início'
              );
            }
            return true;
          },
        ],
        availability: [(v) => !!v || 'A disponibilidade é obrigatória.'],
      },
    };
  },

  computed: {
    formattedOpenDate() {
      return this.localTicket.start_date
        ? formatDateToBr(this.localTicket.start_date)
        : '';
    },

    formattedCloseDate() {
      return this.localTicket.end_date ? formatDateToBr(this.localTicket.end_date) : '';
    },

    isDonation() {
      // Verifica se o evento é de doação baseado no sale_type da store
      const eventInfo = this.$store.getters['eventGeneralInfo/$info'];
      return eventInfo?.sale_type === 'Doação' || this.nomenclature === 'Doação';
    },

    getHintByAvailability() {
      switch (this.localTicket.availability) {
        case 'Publico':
          if (this.isDonation) {
            return 'A doação ficará visível para todos que acessarem a página de vendas.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'O ingresso ficará visível para todos que acessarem a página de vendas.';
          } else {
            return 'A inscrição ficará visível para todos que acessarem a página de vendas.';
          }

        case 'Privado':
          if (this.isDonation) {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão fazer doações.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar o ingresso.';
          } else {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar a inscrição.';
          }
        case 'PDV':
          if (this.isDonation) {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir doações através do PDV';
          } else if (this.nomenclature === 'Ingresso') {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir ingressos através do PDV';
          } else {
            return 'Somente o proprietário do evento e pessoas autorizadas da equipe poderão ver e emitir inscrições através do PDV';
          }
        default:
          return '';
      }
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isEditing() {
      return this.editIndex !== null;
    },

    formTitle() {
      return this.isEditing ? 'Editar Ingresso' : 'Novo Ingresso';
    },

    categories() {
      return this.$store.getters['eventTickets/$ticketCategories'].filter((category) => !category._deleted);
    },

    tickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },
  },

  watch: {
    'localTicket.total_quantity': {
      handler() {
        // Força a revalidação do formulário quando total_quantity mudar
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.validate();
          }
        });
      }
    }
  },

  created() {
    if (this.isEditing) {
      const ticketToEdit = this.tickets[this.editIndex];
      this.localTicket = { ...ticketToEdit };
    }
  },

  methods: {
    validateTime(value, field) {
      if (!value) return;

      const [hours, minutes] = value.split(':').map(Number);

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        this.localTicket[field] = value;
      } else {
        this.localTicket[field] = '';
      }

      // Força revalidação do campo de término se necessário
      if (field === 'start_time' && this.$refs.form) {
        this.$refs.form.validate();
      }
    },

    async handleSubmit(fetchApi = false) {
      if (!this.validateForm()) {
        return {
          success: false,
          error: 'error.validation',
        };
      }

      try {
        if (this.isEditing && !fetchApi) {
          console.log('[TICKET FORM] - isEditing && !fetchApi');
          await this.$store.dispatch('eventTickets/updateTicket', {
            index: this.editIndex,
            ticket: this.localTicket,
          });
        } else if (this.isEditing && fetchApi) {
          await this.$store.dispatch('eventTickets/updateSingleTicket', {
            ticketId: this.localTicket.id,
            ticket: this.localTicket,
            eventId: this.eventId,
          });

          await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);

          return {
            success: true,
            error: null,
          };
        } else if (fetchApi) {
          // Usa o novo método para criar um ticket individual
          const ticketId = await this.$store.dispatch('eventTickets/createSingleTicket', {
            eventId: this.eventId,
            ticket: this.localTicket,
          });

          await this.$store.dispatch('eventTickets/fetchAndPopulateByEventId', this.eventId);
          return {
            success: true,
            error: null,
            id: ticketId,
          };
        } else {
          await this.$store.dispatch('eventTickets/addTicket', this.localTicket);
        }

        return {
          success: true,
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          error: 'error.exception: ' + error,
        };
      }
    },

    validateForm() {
      return this.$refs.form.validate();
    },
    normalizeDate(date) {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    },
    onCategoryChange(value) {
      this.localTicket.category = value;
    },

    onPriceChange(value) {
      // O componente AMoneyInput já cuida da formatação
      this.localTicket.price = value;
    },
    onNumerFieldChange(event) {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },
    onDateChange(field, value) {
      this.localTicket[field] = value;
      if (field === 'start_date') {
        this.openDateMenu = false;
      } else {
        this.closeDateMenu = false;
      }
    },

    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
        // Reseta para os valores iniciais
        this.localTicket = {
          id: '-1',
          name: '',
          category: null,
          price: 0,
          total_quantity: '',
          min_purchase: 1,
          max_purchase: '',
          start_date: '',
          start_time: '',
          end_date: '',
          end_time: '',
          availability: 'Publico',
        };
        // Força a revalidação do formulário
        this.isFormValid = false;
        this.$refs.form.reset();
      }
    },
  },
};
</script>

<style scoped></style>
