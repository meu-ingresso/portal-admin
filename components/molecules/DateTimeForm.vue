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
            label="Data de Início"
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
          v-model="localStartDate"
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
        ref="localStartTime"
        v-model="localStartTime"
        v-mask="'##:##'"
        label="Hora de Início"
        prepend-inner-icon="mdi-clock-outline"
        placeholder="21:30"
        outlined
        dense
        hide-details="auto"
        required
        :rules="rules?.startTime"
        @input="validateTime($event, 'localStartTime')" />
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
            required
            :rules="rules?.endDate"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localEndDate"
          locale="pt-br"
          dense
          no-title
          hide-details="auto"
          :min="localStartDate || minDate"
          @input="onEndDateChange" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-text-field
        ref="localEndTime"
        v-model="localEndTime"
        v-mask="'##:##'"
        label="Hora de Término"
        prepend-inner-icon="mdi-clock-outline"
        placeholder="00:00"
        outlined
        dense
        hide-details="auto"
        required
        :rules="rules?.endTime"
        @input="validateTime($event, 'localEndTime')" />
    </v-col>
    <v-col v-if="localStartDate && localEndDate" cols="12">
      <p class="subtitle-2" v-html="eventDuration" />
    </v-col>
  </v-row>
</template>

<script>
import { mask } from 'vue-the-mask';
import { formatDateToBr } from '@/utils/formatters';

export default {
  directives: {
    mask,
  },
  props: {
    startDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
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
      localStartDate: this.startDate,
      localStartTime: this.startTime,
      localEndDate: this.endDate,
      localEndTime: this.endTime,
      formattedStartDate: this.startDate ? formatDateToBr(this.startDate) : '',
      formattedEndDate: this.endDate ? formatDateToBr(this.endDate) : '',
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
            const startDate = new Date(this.localStartDate + 'T00:00:00');

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

            if (this.localStartTime) {
              const [hours, minutes] = this.localStartTime.split(':').map(Number);
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
            const startDate = new Date(this.localStartDate + 'T00:00:00');

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

            const startDate = new Date(this.localStartDate + 'T00:00:00');
            const endDate = new Date(this.localEndDate + 'T00:00:00');

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

              const [startHour, startMinute] = this.localStartTime.split(':').map(Number);
              const [endHour, endMinute] = this.localEndTime.split(':').map(Number);

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
              !this.localStartTime ||
              !this.localEndTime ||
              !this.localStartDate ||
              !this.localEndDate
            )
              return true;

            if (this.localStartDate !== this.localEndDate) return true;

            const [startHour, startMinute] = this.localStartTime.split(':').map(Number);
            const [endHour, endMinute] = this.localEndTime.split(':').map(Number);

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
    eventDuration() {
      const startDateTime = new Date(`${this.localStartDate}T${this.localStartTime}:00`);
      const endDateTime = new Date(`${this.localEndDate}T${this.localEndTime}:00`);

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
    form() {
      return {
        formattedStartDate: this.formattedStartDate,
        localStartTime: this.localStartTime,
        formattedEndDate: this.formattedEndDate,
        localEndTime: this.localEndTime,
      };
    },
  },
  watch: {
    localStartDate(newVal) {
      this.$emit('update:startDate', newVal);
      this.formattedStartDate = newVal ? formatDateToBr(newVal) : '';
    },
    localEndDate(newVal) {
      this.$emit('update:endDate', newVal);
      this.formattedEndDate = newVal ? formatDateToBr(newVal) : '';
    },
    localStartTime(newVal) {
      this.$emit('update:startTime', newVal);
    },
    localEndTime(newVal) {
      this.$emit('update:endTime', newVal);
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
        this[field] = value;
      } else {
        // Se o valor for inválido, limpa o campo
        this[field] = '';
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
