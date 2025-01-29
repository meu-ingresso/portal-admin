<template>
  <v-row>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        ref="startDateMenu"
        v-model="startDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedStartDate"
            v-model="formattedStartDate"
            label="Data de Início*"
            prepend-inner-icon="mdi-calendar"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :rules="rules?.startDate"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="formData.start_date"
          locale="pt-br"
          dense
          hide-details="auto"
          no-title
          :min="minDate"
          @input="onStartDateChange" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-text-field
        ref="start_time"
        v-model="formData.start_time"
        v-mask="'##:##'"
        label="Hora de Início*"
        prepend-inner-icon="mdi-clock-outline"
        placeholder="21:30"
        outlined
        dense
        hide-details="auto"
        required
        :rules="rules?.startTime"
        @input="validateTime($event, 'start_time')" />
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        ref="endDateMenu"
        v-model="endDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedEndDate"
            v-model="formattedEndDate"
            label="Data de Término"
            prepend-inner-icon="mdi-calendar"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            :rules="rules?.endDate"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="formData.end_date"
          locale="pt-br"
          dense
          no-title
          hide-details="auto"
          :min="formData.start_date || minDate"
          @input="onEndDateChange" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-text-field
        ref="end_time"
        v-model="formData.end_time"
        v-mask="'##:##'"
        label="Hora de Término"
        prepend-inner-icon="mdi-clock-outline"
        placeholder="00:00"
        outlined
        dense
        hide-details="auto"
        :rules="rules?.endTime"
        @input="validateTime($event, 'end_time')" />
    </v-col>
    <v-col v-if="formData.start_date && formData.end_date" cols="12">
      <p class="subtitle-2" v-html="eventDuration" />
    </v-col>
  </v-row>
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
    const minDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    return {
      startDateMenu: false,
      startTimeMenu: false,
      endDateMenu: false,
      endTimeMenu: false,
      hasErrors: false,
      minDate,
      rules: {
        startDate: [
          (value) => !!value || 'A data de início é obrigatória.',
          (value) => {
            if (!value) return true;

            const today = new Date();
            const startDate = new Date(this.formData.start_date + 'T00:00:00');

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

            if (this.formData.start_time) {
              const [hours, minutes] = this.formData.start_time.split(':').map(Number);
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
        startTime: [
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
        endDate: [
          (value) => !!value || 'A data de término é obrigatória.',
          (value) => {
            if (!value || !this.localStartDate) return true;

            const startDate = new Date(this.formData.start_date + 'T00:00:00');
            const endDate = new Date(this.formData.end_date + 'T00:00:00');

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
              if (!this.localStartTime || !this.localEndTime) return true;

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
        endTime: [
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
    formattedStartDate() {
      return this.formData.start_date ? formatDateToBr(this.formData.start_date) : '';
    },
    formattedEndDate() {
      return this.formData.end_date ? formatDateToBr(this.formData.end_date) : '';
    },
    eventDuration() {
      const startDateTime = new Date(
        `${this.formData.start_date}T${this.formData.start_time}:00`
      );
      const endDateTime = new Date(
        `${this.formData.end_date}T${this.formData.end_time}:00`
      );

      if (
        isNaN(startDateTime.getTime()) ||
        isNaN(endDateTime.getTime()) ||
        endDateTime <= startDateTime
      ) {
        return '';
      }

      const durationMs = endDateTime - startDateTime;
      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      const durationText = 'Seu evento vai durar <strong>';
      const parts = [];

      if (days > 0) {
        parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
      }
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
      }

      if (parts.length === 0) {
        return '';
      } else if (parts.length === 1) {
        return durationText + parts[0] + '</strong>.';
      } else {
        const lastPart = parts.pop();
        return durationText + parts.join(', ') + ' e ' + lastPart + '</strong>.';
      }
    },

    formData() {
      return eventGeneralInfo.$info;
    },

    form() {
      return {
        formattedStartDate: this.formattedStartDate,
        start_time: this.formData.start_time,
        formattedEndDate: this.formattedEndDate,
        end_time: this.formData.end_time,
      };
    },
  },
  watch: {
    'formData.start_date'() {
      // Força revalidação do campo de horário de término
      if (this.$refs.end_time) {
        this.$refs.end_time.validate();
      }
    },
    'formData.start_time'() {
      // Força revalidação do campo de horário de término
      if (this.$refs.end_time) {
        this.$refs.end_time.validate();
      }
    },
    'formData.end_date'() {
      // Força revalidação do campo de horário de término
      if (this.$refs.end_time) {
        this.$refs.end_time.validate();
      }
    },
  },
  methods: {
    validate() {
      this.hasErrors = false;

      Object.keys(this.form).forEach((f) => {
        if (!this.form[f]) this.hasErrors = true;

        this.$refs[f].validate(true);
      });

      return this.hasErrors;
    },
    validateTime(value, field) {
      if (!value) return;

      const [hours, minutes] = value.split(':').map(Number);

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        this.formData[field] = value;
      } else {
        // Se o valor for inválido, limpa o campo
        this.formData[field] = '';
      }
    },
    onStartDateChange() {
      this.startDateMenu = false;
    },
    onEndDateChange() {
      this.endDateMenu = false;
    },
    normalizeDate(date) {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    },
  },
};
</script>

<style scoped>
.mt-3 {
  margin-top: 16px;
}
</style>
