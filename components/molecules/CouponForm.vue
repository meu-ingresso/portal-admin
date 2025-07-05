<template>
  <v-form ref="form" v-model="isFormValid">
    <v-row>
      <!-- Código do Cupom -->
      <v-col cols="12" md="6" sm="12">
        <v-text-field ref="code" v-model.trim="localCoupon.code" label="Código do Cupom" placeholder="Ex: DESCONTO10"
          outlined dense hide-details="auto" required :rules="validationRules.code" :counter="20"
          @input="onCodeInput" />
      </v-col>

      <!-- Tipo de Desconto -->
      <v-col cols="12" md="6" sm="12">
        <v-select ref="discount_type" v-model="localCoupon.discount_type" :items="discountTypes"
          label="Tipo de Desconto" outlined dense hide-details="auto" required :rules="validationRules.discount_type" />
      </v-col>

      <!-- Valor do Desconto -->
      <v-col cols="12" md="6" sm="12">
        <v-text-field ref="discount_value" v-model="localCoupon.discount_value" :label="discountValueLabel"
          :prefix="localCoupon.discount_type === 'FIXED' ? 'R$' : ''"
          :suffix="localCoupon.discount_type === 'PERCENTAGE' ? '%' : ''" outlined dense hide-details="auto" required
          :rules="validationRules.discount_value" @input="onDiscountValueChange" @keypress="onDiscountValueKeyPress" />
      </v-col>

      <!-- Máximo de Usos -->
      <v-col cols="12" md="6" sm="12">
        <v-text-field ref="max_uses" v-model="localCoupon.max_uses" label="Quantidade" placeholder="Ex: 100"
          type="number" min="1" outlined dense hide-details="auto" required :rules="validationRules.max_uses"
          @keypress="onNumberFieldChange" />
      </v-col>

      <!-- Data e Hora de Início -->
      <v-col cols="12" md="3" sm="12">
        <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field :value="formattedStartDate" label="Data de início" prepend-inner-icon="mdi-calendar" readonly
              v-bind="attrs" outlined dense required hide-details="auto" :rules="validationRules.start_date"
              v-on="on" />
          </template>
          <v-date-picker v-model="localCoupon.start_date" locale="pt-br" no-title dense :min="minDate"
            @input="onDateChange('start_date', $event)" />
        </v-menu>
      </v-col>

      <v-col cols="12" md="3" sm="12">
        <v-text-field v-model="localCoupon.start_time" v-mask="'##:##'" label="Horário de início"
          prepend-inner-icon="mdi-clock-outline" placeholder="21:30" outlined dense hide-details="auto" required
          :rules="validationRules.start_time" @input="validateTime($event, 'start_time')" />
      </v-col>

      <!-- Data e Hora de Término -->
      <v-col cols="12" md="3" sm="12">
        <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
          min-width="auto">
          <template #activator="{ on, attrs }">
            <v-text-field :value="formattedEndDate" label="Data de término" prepend-inner-icon="mdi-calendar" readonly
              v-bind="attrs" outlined dense required hide-details="auto" :rules="validationRules.end_date" v-on="on" />
          </template>
          <v-date-picker v-model="localCoupon.end_date" locale="pt-br" no-title dense
            :min="localCoupon.start_date ? localCoupon.start_date : minDate"
            @input="onDateChange('end_date', $event)" />
        </v-menu>
      </v-col>

      <v-col cols="12" md="3" sm="12">
        <v-text-field v-model="localCoupon.end_time" v-mask="'##:##'" label="Horário de término"
          prepend-inner-icon="mdi-clock-outline" placeholder="23:59" outlined dense hide-details="auto" required
          :rules="validationRules.end_time" @input="validateTime($event, 'end_time')" />
      </v-col>

      <!-- Ingressos Associados -->
      <v-col cols="12">
        <v-select v-model="localCoupon.tickets" :items="tickets" :item-value="(item) => item.id"
          :item-text="(item) => item.name" label="Ingressos aplicáveis" placeholder="Selecione o(s) ingresso(s)"
          no-data-text="Nenhum ingresso cadastrado" outlined dense multiple hide-details="auto" return-object>
          <template v-if="tickets.length" #prepend-item>
            <v-list-item ripple @mousedown.prevent @click="toggleAllTickets">
              <v-list-item-action>
                <v-icon :color="localCoupon.tickets.length > 0 ? 'primary' : ''">
                  {{ icon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> Todos </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-select>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { mask } from 'vue-the-mask';
import { formatDateToBr, formatPrice } from '@/utils/formatters';

export default {
  directives: { mask },

  props: {
    editIndex: {
      type: Number,
      default: null,
    },
    tickets: {
      type: Array,
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
      localCoupon: {
        code: '',
        discount_type: 'FIXED',
        discount_value: '',
        max_uses: 1,
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        tickets: [],
      },
      discountTypes: [
        { text: 'Fixo', value: 'FIXED' },
        { text: 'Porcentagem', value: 'PERCENTAGE' },
      ],
      startDateMenu: false,
      endDateMenu: false,
      minDate,
      validationRules: {
        code: [
          (v) => !!v || 'O código do cupom é obrigatório.',
          (v) => v.length <= 20 || 'O código deve ter no máximo 20 caracteres',
        ],
        discount_type: [(v) => !!v || 'O tipo de desconto é obrigatório'],
        discount_value: [
          (v) => !!v || 'O valor do desconto é obrigatório',
          (v) => {
            if (!v) return true;
            const value = parseFloat(v.replace(',', '.'));
            if (this.localCoupon.discount_type === 'PERCENTAGE') {
              return value <= 100 || 'O desconto não pode ser maior que 100%';
            }
            return true;
          },
        ],
        max_uses: [
          (v) => !!v || 'O número máximo de usos é obrigatório.',
          (v) => v > 0 || 'O número máximo de usos deve ser maior que 0.',
        ],
        start_date: [
          (v) => !!v || 'A data de início é obrigatória',
          (v) => {
            if (!v) return true;
            const startDate = new Date(this.localCoupon.start_date + 'T00:00:00');
            const today = new Date();

            const todayDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const couponDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            );

            return couponDate >= todayDate || 'A data deve ser posterior ou igual a hoje';
          },
        ],
        start_time: [
          (v) => !!v || 'O horário de início é obrigatório',
          (v) => {
            if (!v) return true;
            const [hours, minutes] = v.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59';
            }
            return true;
          },
        ],
        end_date: [
          (v) => !!v || 'A data de término é obrigatória',
          (v) => {
            if (!v || !this.localCoupon.start_date) return true;
            const startDate = new Date(this.localCoupon.start_date + 'T00:00:00');
            const endDate = new Date(this.localCoupon.end_date + 'T00:00:00');
            return endDate >= startDate || 'A data deve ser posterior à data de início';
          },
        ],
        end_time: [
          (v) => !!v || 'O horário de término é obrigatório',
          (v) => {
            if (!v) return true;
            const [hours, minutes] = v.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59';
            }

            if (this.localCoupon.start_date === this.localCoupon.end_date) {
              const [startHours, startMinutes] = this.localCoupon.start_time
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
      },
    };
  },
  computed: {
    coupons() {
      return this.$store.getters['eventCoupons/$coupons'];
    },

    formattedStartDate() {
      return this.localCoupon.start_date
        ? formatDateToBr(this.localCoupon.start_date)
        : '';
    },

    formattedEndDate() {
      return this.localCoupon.end_date ? formatDateToBr(this.localCoupon.end_date) : '';
    },
    selectedAllTickets() {
      return this.localCoupon.tickets.length === this.tickets.length;
    },
    selectedSomeTickets() {
      return this.localCoupon.tickets.length > 0 && !this.selectedAllTickets;
    },
    icon() {
      if (this.selectedAllTickets) return 'mdi-checkbox-marked';
      if (this.selectedSomeTickets) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    discountValueLabel() {
      return this.localCoupon.discount_type === 'FIXED'
        ? 'Valor do desconto'
        : 'Porcentagem de desconto';
    },

    isEditing() {
      return this.editIndex !== null;
    },
  },

  created() {
    if (this.isEditing) {
      const couponToEdit = this.coupons[this.editIndex];
      this.localCoupon = { ...couponToEdit };
    }
  },

  methods: {
    onCodeInput(value) {
      this.localCoupon.code = value.toUpperCase();
    },

    validateTime(value, field) {
      if (!value) return;

      const [hours, minutes] = value.split(':').map(Number);

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        this.localCoupon[field] = value;
      } else {
        this.localCoupon[field] = '';
      }

      if (field === 'start_time' && this.$refs.form) {
        this.$refs.form.validate();
      }
    },

    validateForm() {
      return this.$refs.form.validate();
    },

    async handleSubmit(fetchApi = false) {
      try {
        if (!this.validateForm()) {
          return {
            success: false,
            error: 'error.validation',
          };
        }

        if (this.isEditing && !fetchApi) {
          await this.$store.dispatch('eventCoupons/updateCoupon', {
            index: this.editIndex,
            coupon: this.localCoupon,
          });
        } else if (this.isEditing && fetchApi) {
          await this.$store.dispatch('eventCoupons/updateSingleCoupon', {
            couponId: this.localCoupon.id,
            coupon: this.localCoupon,
            eventId: this.eventId,
          });

          return {
            success: true,
            error: null,
          };
        } else if (fetchApi) {
          const couponId = await this.$store.dispatch('eventCoupons/createSingleCoupon', {
            eventId: this.eventId,
            coupon: this.localCoupon,
          });

          await this.$store.dispatch('eventCoupons/fetchAndPopulateByEventId', this.eventId);

          return {
            success: true,
            error: null,
            id: couponId,
          };
        } else {
          await this.$store.dispatch('eventCoupons/addCoupon', this.localCoupon);
        }

        return {
          success: true,
          error: null,
        };
      } catch (error) {
        console.error('Erro ao salvar cupom:', error);
        return {
          success: false,
          error: 'error.exception',
        };
      }
    },

    toggleAllTickets() {
      if (this.selectedAllTickets) {
        this.localCoupon.tickets = [];
      } else {
        this.localCoupon.tickets = [...this.tickets];
      }
    },

    onDiscountValueChange(value) {
      if (!value) {
        this.localCoupon.discount_value = '';
        return;
      }

      if (this.localCoupon.discount_type === 'FIXED') {
        // Remove espaços e caracteres especiais, mas preserva vírgulas
        let cleanValue = value.replace(/[^\d,]/g, '');

        // Se já contém vírgula, trata como valor decimal formatado
        if (cleanValue.includes(',')) {
          // Remove vírgulas extras (mantém apenas a primeira)
          const parts = cleanValue.split(',');
          if (parts.length > 2) {
            cleanValue = parts[0] + ',' + parts.slice(1).join('');
          }

          // Limita a 2 casas decimais
          if (parts[1] && parts[1].length > 2) {
            cleanValue = parts[0] + ',' + parts[1].substring(0, 2);
          }

          // Converte para float para validação
          const floatValue = parseFloat(cleanValue.replace(',', '.'));

          // Se é um valor válido, formata
          if (!isNaN(floatValue)) {
            this.localCoupon.discount_value = formatPrice(floatValue);
          } else {
            this.localCoupon.discount_value = cleanValue;
          }
        } else {
          // Se não tem vírgula, assume que são centavos (lógica original)
          const numericValue = cleanValue;
          const floatValue = parseFloat(numericValue) / 100;

          this.localCoupon.discount_value = formatPrice(floatValue);
        }
      } else {
        const numericValue = value.replace(/[^\d,]/g, '');
        this.localCoupon.discount_value = numericValue;
      }
    },

    onDiscountValueKeyPress(event) {
      const char = String.fromCharCode(event.charCode);
      // Permite números e vírgula para descontos fixos, só números para porcentagem
      if (this.localCoupon.discount_type === 'FIXED') {
        if (!/[0-9,]/.test(char)) {
          event.preventDefault();
        }
      } else if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    },

    onNumberFieldChange(event) {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },

    onDateChange(field, value) {
      this.localCoupon[field] = value;
      if (field === 'start_date') {
        this.startDateMenu = false;
      } else {
        this.endDateMenu = false;
      }
    },
  },
};
</script>

<style scoped></style>
