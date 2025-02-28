<template>
  <div>
    <v-row class="mb-4 mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="d-flex justify-space-between align-center">
            <p class="subtitle-1 mb-0">{{ titleText }}</p>
            <v-btn 
              color="primary" 
              outlined
              small 
              @click="handleAddDateClick">
              <v-icon left>mdi-plus</v-icon>
              Adicionar Data
            </v-btn>
          </v-card-title>
          <v-card-text>
            <!-- Inputs diretos para a primeira data (mostrados quando houver 0 ou 1 data) -->
            <div v-if="eventDates.length <= 1">
              <v-form ref="initialForm" v-model="isInitialFormValid">
                <v-row>
                  <!-- Data de Início -->
                  <v-col cols="12" md="3" sm="6">
                    <v-menu
                      v-model="initialDateMenu.start"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto">
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          :value="formattedInitialStartDate"
                          label="Data de Início*"
                          prepend-inner-icon="mdi-calendar"
                          readonly
                          outlined
                          dense
                          required
                          hide-details="auto"
                          :rules="rules.start_date"
                          v-bind="attrs"
                          v-on="on" />
                      </template>
                      <v-date-picker
                        v-model="initialFormData.start_date"
                        locale="pt-br"
                        no-title
                        dense
                        :min="minDate"
                        @input="initialDateMenu.start = false" />
                    </v-menu>
                  </v-col>

                  <!-- Horário de Início -->
                  <v-col cols="12" md="3" sm="6">
                    <v-text-field
                      v-model="initialFormData.start_time"
                      v-mask="'##:##'"
                      label="Horário de Início*"
                      prepend-inner-icon="mdi-clock-outline"
                      placeholder="21:30"
                      outlined
                      dense
                      hide-details="auto"
                      required
                      :rules="rules.start_time"
                      @input="validateTime($event, 'start_time', 'initial')" />
                  </v-col>

                  <!-- Data de Término -->
                  <v-col cols="12" md="3" sm="6">
                    <v-menu
                      v-model="initialDateMenu.end"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto">
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          :value="formattedInitialEndDate"
                          label="Data de Término*"
                          prepend-inner-icon="mdi-calendar"
                          readonly
                          outlined
                          dense
                          required
                          hide-details="auto"
                          :rules="rules.end_date"
                          v-bind="attrs"
                          v-on="on" />
                      </template>
                      <v-date-picker
                        v-model="initialFormData.end_date"
                        locale="pt-br"
                        dense
                        no-title
                        :min="initialFormData.start_date || minDate"
                        @input="initialDateMenu.end = false" />
                    </v-menu>
                  </v-col>

                  <!-- Horário de Término -->
                  <v-col cols="12" md="3" sm="6">
                    <v-text-field
                      v-model="initialFormData.end_time"
                      v-mask="'##:##'"
                      label="Horário de Término*"
                      prepend-inner-icon="mdi-clock-outline"
                      placeholder="00:00"
                      outlined
                      dense
                      hide-details="auto"
                      required
                      :rules="rules.end_time"
                      @input="validateTime($event, 'end_time', 'initial')" />
                  </v-col>

                  <v-col v-if="getEventDuration(initialFormData)" cols="12">
                    <p class="caption grey--text" v-html="getEventDuration(initialFormData)" />
                  </v-col>
                </v-row>
              </v-form>
            </div>

            <!-- Lista de datas existentes (apenas quando há mais de uma data) -->
            <v-list v-else dense>
              <v-list-item v-for="(date, index) in eventDates" :key="index" class="py-2">
                <v-list-item-content>
                  <v-list-item-title>
                    Data {{ index + 1 }}: {{ getFormattedDateRange(date) }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="getEventDuration(date)">
                    <p class="subtitle-2" v-html="getEventDuration(date)" />
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="editDate(index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Entry Dialog (Modal) -->
    <v-dialog v-model="dateDialog.show" max-width="600px">
      <v-card>
        <v-card-title>
          <h3 class="modalTitle">{{ dateDialog.title }}</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDateDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="mt-2">
          <v-form :ref="`dateForm${dateDialog.index !== null ? dateDialog.index : 'new'}`" v-model="isFormValid">
            <v-row>
              <!-- Data de Início -->
              <v-col cols="12" md="6" sm="12">
                <v-menu
                  v-model="dateMenu.start"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto">
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      :value="formattedStartDate"
                      label="Data de Início*"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      required
                      hide-details="auto"
                      :rules="rules.start_date"
                      v-bind="attrs"
                      v-on="on" />
                  </template>
                  <v-date-picker
                    v-model="formData.start_date"
                    locale="pt-br"
                    no-title
                    dense
                    :min="minDate"
                    @input="dateMenu.start = false" />
                </v-menu>
              </v-col>

              <!-- Horário de Início -->
              <v-col cols="12" md="6" sm="12">
                <v-text-field
                  v-model="formData.start_time"
                  v-mask="'##:##'"
                  label="Horário de Início*"
                  prepend-inner-icon="mdi-clock-outline"
                  placeholder="21:30"
                  outlined
                  dense
                  hide-details="auto"
                  required
                  :rules="rules.start_time"
                  @input="validateTime($event, 'start_time')" />
              </v-col>

              <!-- Data de Término -->
              <v-col cols="12" md="6" sm="12">
                <v-menu
                  v-model="dateMenu.end"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto">
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      :value="formattedEndDate"
                      label="Data de Término*"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      required
                      hide-details="auto"
                      :rules="rules.end_date"
                      v-bind="attrs"
                      v-on="on" />
                  </template>
                  <v-date-picker
                    v-model="formData.end_date"
                    locale="pt-br"
                    dense
                    no-title
                    :min="formData.start_date || minDate"
                    @input="dateMenu.end = false" />
                </v-menu>
              </v-col>

              <!-- Horário de Término -->
              <v-col cols="12" md="6" sm="12">
                <v-text-field
                  v-model="formData.end_time"
                  v-mask="'##:##'"
                  label="Horário de Término*"
                  prepend-inner-icon="mdi-clock-outline"
                  placeholder="00:00"
                  outlined
                  dense
                  hide-details="auto"
                  required
                  :rules="rules.end_time"
                  @input="validateTime($event, 'end_time')" />
              </v-col>

              <v-col cols="12">
                <p class="caption grey--text" v-html="getEventDuration(formData)" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="dateDialog.index !== null" color="error" text small @click="removeDate">
            <v-icon left small>mdi-delete</v-icon>
            Remover
          </v-btn>
          <DefaultButton
            text="Adicionar"
            @click="saveDate"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mask } from 'vue-the-mask';
import { formatDateToBr } from '@/utils/formatters';
import { eventGeneralInfo } from '@/store';

export default {
  directives: {
    mask,
  },
  data() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    return {
      dateDialog: {
        show: false,
        title: 'Adicionar Data',
        index: null,
      },
      dateMenu: {
        start: false,
        end: false,
      },
      // Formulário para o modal
      formData: {
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      },
      // Formulário para os inputs diretos
      initialFormData: {
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      },
      initialDateMenu: {
        start: false,
        end: false,
      },
      isFormValid: false,
      isInitialFormValid: false,
      minDate,
      rules: {
        start_date: [
          (value) => !!value || 'A data de início é obrigatória.',
          (value) => {
            if (!value) return true;

            const today = new Date();
            const startDate = new Date(value + 'T00:00:00');

            const todayDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const eventDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            );

            if (eventDate > todayDate) return true;

            if (eventDate < todayDate)
              return 'A data de início não pode ser anterior à data atual.';

            return true;
          },      
        ],
        start_time: [
         (value) => !!value || 'A hora de início é obrigatória.',
          (value) => {
            if (!value) return true;
            const [hours, minutes] = value.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23.';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59.';
            }

            const today = new Date();
            const startDate = new Date(this.formData.start_date + 'T00:00:00');

            if (
              startDate.getDate() === today.getDate() &&
              startDate.getMonth() === today.getMonth() &&
              startDate.getFullYear() === today.getFullYear()
            ) {
              const eventTime = hours * 60 + minutes;
              const currentTime = today.getHours() * 60 + today.getMinutes();

              return (
                eventTime > currentTime ||
                'O horário de início deve ser posterior ao horário atual.'
              );
            }

            return true;
          },
        ],
        end_date: [
          (value) => !!value || 'A data de término é obrigatória.',
          (value) => {
            if (!value || !this.formData.start_date) return true;

            const startDate = new Date(this.formData.start_date + 'T00:00:00');
            const endDate = new Date(value + 'T00:00:00');

            const startDateOnly = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            );
            const endDateOnly = new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            );

            if (endDateOnly < startDateOnly) {
              return 'A data de término não pode ser anterior à data de início.';
            }

            if (endDateOnly.getTime() === startDateOnly.getTime()) {
              if (!this.formData.start_time || !this.formData.end_time) return true;

              const [startHour, startMinute] = this.formData.start_time
                .split(':')
                .map(Number);
              const [endHour, endMinute] = this.formData.end_time.split(':').map(Number);

              const startMinutes = startHour * 60 + startMinute;
              const endMinutes = endHour * 60 + endMinute;

              return (
                endMinutes > startMinutes ||
                'O horário de término deve ser posterior ao horário de início.'
              );
            }

            return true;
          },
        ],
        end_time: [
         (value) => !!value || 'A hora de término é obrigatória.',
          (value) => {
            if (!value) return true;
            const [hours, minutes] = value.split(':').map(Number);
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return 'Hora inválida. Use valores entre 00 e 23.';
            }
            if (isNaN(minutes) || minutes < 0 || minutes > 59) {
              return 'Minutos inválidos. Use valores entre 00 e 59.';
            }
            return true;
          },
          (value) => {
            if (
              !value ||
              !this.formData.start_time ||
              !this.formData.end_time ||
              !this.formData.start_date ||
              !this.formData.end_date
            )
              return true;

            // Verifica se as datas são iguais
            const startDate = new Date(this.formData.start_date);
            const endDate = new Date(this.formData.end_date);

            // Se as datas forem diferentes, não precisa validar o horário
            if (startDate.getTime() !== endDate.getTime()) return true;

            // Se for o mesmo dia, valida o horário
            const [startHour, startMinute] = this.formData.start_time
              .split(':')
              .map(Number);
            const [endHour, endMinute] = this.formData.end_time.split(':').map(Number);

            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            return (
              endMinutes > startMinutes ||
              'O horário de término deve ser posterior ao horário de início'
            );
          },
        ],
      },
    };
  },
  computed: {
    eventDates() {
      return eventGeneralInfo.$info.event_dates || [];
    },
    // Título dinâmico conforme o número de datas
    titleText() {
      return this.eventDates.length <= 1 ? 'Data e Horário' : 'Datas e Horários';
    },
    formattedStartDate() {
      return this.formData.start_date ? formatDateToBr(this.formData.start_date) : '';
    },
    formattedEndDate() {
      return this.formData.end_date ? formatDateToBr(this.formData.end_date) : '';
    },
    formattedInitialStartDate() {
      return this.initialFormData.start_date ? formatDateToBr(this.initialFormData.start_date) : '';
    },
    formattedInitialEndDate() {
      return this.initialFormData.end_date ? formatDateToBr(this.initialFormData.end_date) : '';
    },
  },
  watch: {
    eventDates: {
      handler(newDates) {
        // Se não houver datas, resetar o formulário
        if (newDates.length === 0) {
          this.resetInitialForm();
        } 
        // Se tiver exatamente uma data, preencher o formulário com ela
        else if (newDates.length === 1) {
          const firstDate = newDates[0];
          this.initialFormData = {
            start_date: firstDate.start_date || '',
            start_time: firstDate.start_time || '',
            end_date: firstDate.end_date || '',
            end_time: firstDate.end_time || '',
          };
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // Método de validação para ser chamado pelo componente pai
    validate(showErrors = false) {
      let hasErrors = false;
      
      // Se tivermos datas múltiplas, verificamos se há pelo menos uma data
      if (this.eventDates.length > 1) {
        // Já temos várias datas cadastradas, então está válido
        return false; // Retorna false para indicar que não há erros
      } 
      // Se tivermos 0 ou 1 data, validamos o formulário inicial
      else if (this.$refs.initialForm) {
          if (showErrors) {
            this.$refs.initialForm.validate();
          }
          
          if (!this.isInitialFormValid) {
            hasErrors = true;
          }
          
          // Verificamos se todos os campos estão preenchidos
          if (!this.initialFormData.start_date || 
              !this.initialFormData.start_time || 
              !this.initialFormData.end_date || 
              !this.initialFormData.end_time) {
            hasErrors = true;
          }
          
          // Se for válido e tivermos 0 datas, vamos salvar a primeira data
          if (!hasErrors && this.eventDates.length === 0) {
            this.saveInitialDate();
          } 
          // Se for válido e tivermos 1 data, vamos atualizá-la
          else if (!hasErrors && this.eventDates.length === 1) {
            this.saveInitialDate();
          }
        } else {
          hasErrors = true;
        }
      
      return hasErrors; // Retorna true se houver erros, false caso contrário
    },
    
    handleAddDateClick() {
      // Se não tiver datas ou tiver apenas uma, valida e salva o formulário
      if (this.eventDates.length <= 1 && this.$refs.initialForm) {
        // Forçar validação do formulário para exibir os erros
        this.$refs.initialForm.validate(true);
        
        if (this.isInitialFormValid && this.allFieldsFilled(this.initialFormData)) {
          this.saveInitialDate();
          
          // Se já tiver salvo uma data, abrir modal para adicionar a segunda
          if (this.eventDates.length === 1) {
            this.openAddDateModal();
          }
        }
      } else {
        // Se já tiver mais de uma data, apenas abre o modal
        this.openAddDateModal();
      }
    },
    openAddDateModal() {
      this.formData = {
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      };
      this.dateDialog = {
        show: true,
        title: 'Adicionar Data',
        index: null,
      };
    },
    validateTime(value, field, formType = 'modal') {
      if (!value) return;

      const [hours, minutes] = value.split(':').map(Number);

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        if (formType === 'initial') {
          this.initialFormData[field] = value;
        } else {
          this.formData[field] = value;
        }
      } else if (formType === 'initial') {
          this.initialFormData[field] = '';
        } else {
          this.formData[field] = '';
        }

      // Força revalidação do formulário se necessário
      this.$nextTick(() => {
        if (formType === 'initial' && this.$refs.initialForm) {
          this.$refs.initialForm.validate();
        } else if (this.$refs[`dateForm${this.dateDialog.index !== null ? this.dateDialog.index : 'new'}`]) {
          this.$refs[`dateForm${this.dateDialog.index !== null ? this.dateDialog.index : 'new'}`].validate();
        }
      });
    },
    allFieldsFilled(formData) {
      return formData.start_date && 
             formData.start_time && 
             formData.end_date && 
             formData.end_time;
    },
    editDate(index) {
      const date = this.eventDates[index];
      this.formData = {
        start_date: date.start_date,
        start_time: date.start_time,
        end_date: date.end_date,
        end_time: date.end_time,
      };
      this.dateDialog = {
        show: true,
        title: `Editar Data ${index + 1}`,
        index,
      };
    },
    closeDateDialog() {
      this.dateDialog.show = false;
      this.resetForm();
    },
    saveDate() {
      // Primeiro validamos o formulário e garantimos que os erros sejam exibidos
      const formRef = this.$refs[`dateForm${this.dateDialog.index !== null ? this.dateDialog.index : 'new'}`];
      
      if (formRef) {
        // Forçar validação do formulário para exibir os erros
        formRef.validate(true);
        
        // Verificar se todos os campos obrigatórios estão preenchidos
        if (!this.allFieldsFilled(this.formData)) {
          return; // Não prossegue se campos obrigatórios estiverem vazios
        }
        
        // Verificar se o formulário está válido após a validação
        if (!this.isFormValid) {
          return; // Não prossegue se o formulário tiver erros de validação
        }
      } else {
        return; // Não prossegue se não encontrar a referência do formulário
      }

      const dateObj = {
        start_date: this.formData.start_date,
        start_time: this.formData.start_time,
        end_date: this.formData.end_date,
        end_time: this.formData.end_time,
      };

      if (this.dateDialog.index === null) {
        eventGeneralInfo.addEventDate(dateObj);
      } else {
        eventGeneralInfo.updateEventDate({
          index: this.dateDialog.index,
          eventDate: dateObj
        });
      }

      this.closeDateDialog();
    },
    saveInitialDate() {
      // Forçar validação do formulário para exibir os erros
      if (this.$refs.initialForm) {
        this.$refs.initialForm.validate(true);
        
        // Verificar se todos os campos obrigatórios estão preenchidos
        if (!this.allFieldsFilled(this.initialFormData)) {
          return; // Não prossegue se campos obrigatórios estiverem vazios
        }
        
        // Verificar se o formulário está válido após a validação
        if (!this.isInitialFormValid) {
          return; // Não prossegue se o formulário tiver erros de validação
        }
      } else {
        return; // Não prossegue se não encontrar a referência do formulário
      }

      const dateObj = {
        start_date: this.initialFormData.start_date,
        start_time: this.initialFormData.start_time,
        end_date: this.initialFormData.end_date,
        end_time: this.initialFormData.end_time,
      };

      // Se não tiver datas, adiciona uma nova
      if (this.eventDates.length === 0) {
        eventGeneralInfo.addEventDate(dateObj);
      } 
      // Se já tiver uma data, atualiza a primeira
      else if (this.eventDates.length === 1) {
        eventGeneralInfo.updateEventDate({
          index: 0,
          eventDate: dateObj
        });
      }
    },
    removeDate() {
      if (this.dateDialog.index !== null) {
        eventGeneralInfo.removeEventDate(this.dateDialog.index);
        this.closeDateDialog();
      }
    },
    getFormattedDateRange(date) {
      if (!date.start_date || !date.end_date) return '';

      const startFormatted = formatDateToBr(date.start_date) + ' ' + date.start_time;
      const endFormatted = formatDateToBr(date.end_date) + ' ' + date.end_time;

      return date.start_date === date.end_date
        ? `${startFormatted} - ${date.end_time}`
        : `${startFormatted} - ${endFormatted}`;
    },
    getEventDuration(date) {
      if (!date.start_date || !date.start_time || !date.end_date || !date.end_time) return '';

      let startDateTime, endDateTime;
      
      try {
        startDateTime = new Date(`${date.start_date}T${date.start_time}:00`);
        endDateTime = new Date(`${date.end_date}T${date.end_time}:00`);
        
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
          return '';
        }
        
        const durationMs = endDateTime - startDateTime;
        const totalMinutes = Math.floor(durationMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
        if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
        if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);

        return parts.length ? `Duração: <strong>${parts.join(', ')}</strong>` : '';
      } catch (e) {
        return '';
      }
    },
    resetForm() {
      this.formData = {
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      };
      this.isFormValid = false;
      
      // Resetar validação do formulário se existir
      this.$nextTick(() => {
        const formRef = this.$refs[`dateForm${this.dateDialog.index !== null ? this.dateDialog.index : 'new'}`];
        if (formRef) {
          formRef.resetValidation();
        }
      });
    },
    resetInitialForm() {
      this.initialFormData = {
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      };
      this.isInitialFormValid = false;
      
      // Resetar validação do formulário se existir
      this.$nextTick(() => {
        if (this.$refs.initialForm) {
          this.$refs.initialForm.resetValidation();
        }
      });
    }
  }
};
</script>

<style scoped>
.v-card {
  box-shadow: none !important;
}

.v-list-item {
  border-bottom: 1px solid #eee;
}
</style>
