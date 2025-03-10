<template>
  <v-dialog v-model="dialog" max-width="900">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="modalTitle">Calendário de Eventos</span>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-row class="mb-4">
          <v-col cols="12" sm="4">
            <v-select
              v-model="calendarType"
              :items="viewTypes"
              label="Visualização"
              dense
              hide-details
              outlined
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-menu
              v-model="monthMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  :value="formattedDate"
                  label="Selecionar mês/ano"
                  readonly
                  v-bind="attrs"
                  outlined
                  hide-details
                  dense
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="focus"
                type="month"
                locale="pt-br"
                no-title
                hide-details
                @input="monthMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center">
            <v-btn icon class="mr-2" @click="previousPeriod">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn text @click="goToToday">Hoje</v-btn>
            <v-btn icon class="ml-2" @click="nextPeriod">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-calendar
          ref="calendar"
          v-model="focus"
          locale="pt-br"
          :events="calendarEvents"
          :type="calendarType"
          :weekdays="[0, 1, 2, 3, 4, 5, 6]"
          color="primary"
          @click:event="showEvent"
        >
          <template #event="{ event }">
            <div class="event-content">
              <div class="text-truncate">{{ event.name }}</div>
              <small v-if="event.time" class="event-time">{{ event.time }}</small>
            </div>
          </template>
        </v-calendar>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    events: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      focus: new Date().toISOString().substr(0, 10),
      calendarType: 'month',
      monthMenu: false,
      viewTypes: [
        { text: 'Mês', value: 'month' },
        { text: 'Semana', value: 'week' },
        { text: 'Dia', value: 'day' }
      ]
    }
  },

  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    formattedDate() {
      if (!this.focus) return ''
      const date = new Date(this.focus)
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
    },
    calendarEvents() {
      const events = []
      
      this.events.forEach(event => {
        // Verifica se o evento tem datas múltiplas
        if (Array.isArray(event.dates) && event.dates.length > 0) {
          // Adiciona um evento para cada data
          event.dates.forEach(date => {
            events.push({
              name: event.name,
              start: new Date(date.start_date || date.date),
              end: new Date(date.end_date || date.date),
              color: event.status?.color || 'primary',
              time: this.formatEventTime(date.start_date || date.date),
              originalEvent: event,
              timed: false
            })
          })
        } else {
          // Caso seja um evento com data única
          events.push({
            name: event.name,
            start: new Date(event.start_date),
            end: new Date(event.end_date),
            color: event.status?.color || 'primary',
            time: this.formatEventTime(event.start_date),
            originalEvent: event,
            timed: false
          })
        }
      })

      return events
    }
  },

  methods: {
    formatEventTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    },
    showEvent({ event }) {
      if (event.originalEvent) {
        this.$router.push(`/events/${event.originalEvent.id}`)
        this.dialog = false
      }
    },
    previousPeriod() {
      this.$refs.calendar.prev()
    },
    nextPeriod() {
      this.$refs.calendar.next()
    },
    goToToday() {
      this.focus = new Date().toISOString().substr(0, 10)
    }
  }
}
</script>

<style scoped>
.v-calendar {
  max-height: 600px;
}
.event-content {
  padding: 2px 4px;
}
.event-time {
  font-size: 0.75rem;
  opacity: 0.8;
}
.modalTitle {
  font-size: 1.25rem;
  font-weight: 500;
}
</style> 