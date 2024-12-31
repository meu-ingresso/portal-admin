<template>
  <v-row>
    <v-col cols="12" md="6" sm="12">
      <v-menu
        ref="startDateMenu"
        v-model="startDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="formattedStartDate"
            label="Data de Início"
            prepend-inner-icon="mdi-calendar"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localStartDate"
          locale="pt-br"
          dense
          hide-details="auto"
          @input="onStartDateChange" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-menu
        ref="startTimeMenu"
        v-model="startTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="localStartTime"
            label="Hora de Início"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localStartTime"
          format="24hr"
          dense
          hide-details="auto"
          @input="startTimeMenu = false" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="6" sm="12">
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
            v-model="formattedEndDate"
            label="Data de Término"
            prepend-inner-icon="mdi-calendar"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localEndDate"
          locale="pt-br"
          dense
          hide-details="auto"
          @input="onEndDateChange" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-menu
        ref="endTimeMenu"
        v-model="endTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="localEndTime"
            label="Hora de Término"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localEndTime"
          format="24hr"
          dense
          hide-details="auto"
          @input="endTimeMenu = false" />
      </v-menu>
    </v-col>
    <v-col v-if="localStartDate && localEndDate" cols="12">
      <p class="subtitle-2" v-html="eventDuration" />
    </v-col>
  </v-row>
</template>

<script>
import { formatDateToBr } from '@/utils/formatters';
export default {
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
    return {
      localStartDate: this.startDate,
      localStartTime: this.startTime,
      localEndDate: this.endDate,
      localEndTime: this.endTime,
      startDateMenu: false,
      startTimeMenu: false,
      endDateMenu: false,
      endTimeMenu: false,
    };
  },
  computed: {
    formattedStartDate() {
      return this.localStartDate ? formatDateToBr(this.localStartDate) : '';
    },
    formattedEndDate() {
      return this.localEndDate ? formatDateToBr(this.localEndDate) : '';
    },
    eventDuration() {
      const startDateTime = new Date(`${this.localStartDate}T${this.localStartTime}:00`);
      const endDateTime = new Date(`${this.localEndDate}T${this.localEndTime}:00`);

      if (
        isNaN(startDateTime.getTime()) ||
        isNaN(endDateTime.getTime()) ||
        endDateTime <= startDateTime
      ) {
        return 'A data de término deve ser posterior à data de início.';
      }

      const durationMs = endDateTime - startDateTime;
      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      return `Seu evento vai durar <strong>${days} dias, ${hours} horas, ${minutes} minutos</strong>.`;
    },
  },
  watch: {
    localStartDate(newVal) {
      this.$emit('update:startDate', newVal);
    },
    localStartTime(newVal) {
      this.$emit('update:startTime', newVal);
    },
    localEndDate(newVal) {
      this.$emit('update:endDate', newVal);
    },
    localEndTime(newVal) {
      this.$emit('update:endTime', newVal);
    },
  },

  methods: {
    onStartDateChange() {
      this.startDateMenu = false;
    },
    onEndDateChange() {
      this.endDateMenu = false;
    },
  },
};
</script>

<style scoped>
.mt-3 {
  margin-top: 16px;
}
</style>
