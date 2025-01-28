<template>
  <v-row>
    <v-col cols="12" md="6" sm="12">
      <v-text-field
        ref="name"
        v-model="localTicket.name"
        :label="
          nomenclature === 'Doação'
            ? 'Nome da doação'
            : `Nome do ${nomenclature?.toLowerCase()}`
        "
        placeholder="Ex: Ingresso VIP"
        required
        outlined
        dense
        hide-details="auto"
        :rules="validationRules.name" />
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <GenericAutocomplete
        :value="localTicket.category"
        :items="localCategories"
        :label="`Grupo de ${nomenclature?.toLowerCase()}`"
        :placeholder="`Crie categorias para agrupar ${nomenclature?.toLowerCase()}`"
        @input="onCategoryChange"
        @update:items="updateCategories" />
    </v-col>

    <!-- Para casos de doação, não exibir os campos de preço e quantidade -->
    <v-col cols="12" md="6" sm="12">
      <v-text-field
        ref="price"
        v-model="localTicket.price"
        label="Preço"
        required
        outlined
        dense
        prefix="R$"
        hide-details="auto"
        :rules="validationRules.price"
        @input="onPriceChange"
        @keypress="onPriceKeyPress" />
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-text-field
        ref="max_quantity"
        v-model="localTicket.max_quantity"
        :value="localTicket.max_quantity"
        label="Quantidade"
        placeholder="Ex.: 400"
        type="number"
        min="0"
        required
        outlined
        dense
        hide-details="auto"
        :rules="validationRules.max_quantity"
        @keypress="onNumerFieldChange" />
    </v-col>

    <template v-if="nomenclature != 'Doação' && !isMobile">
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
        <v-text-field
          ref="min_purchase"
          v-model="localTicket.min_purchase"
          label="Mínima"
          type="number"
          min="0"
          outlined
          dense
          required
          hide-details="auto"
          :rules="validationRules.min_purchase"
          @keypress="onNumerFieldChange" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          ref="max_purchase"
          v-model="localTicket.max_purchase"
          label="Máxima"
          type="number"
          min="0"
          outlined
          dense
          required
          hide-details="auto"
          :rules="validationRules.max_purchase" />
      </v-col>
    </template>

    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="openDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedOpenDate"
            v-model="formattedOpenDate"
            label="Início das Vendas"
            readonly
            v-bind="attrs"
            outlined
            dense
            required
            hide-details="auto"
            :rules="validationRules.open_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localTicket.open_date"
          locale="pt-br"
          no-title
          dense
          @input="onDateChange('open_date', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="startTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="start_time"
            v-model="localTicket.start_time"
            label="Horário de Início"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :rules="validationRules.start_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localTicket.start_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('start_time', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="closeDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="formattedCloseDate"
            v-model="formattedCloseDate"
            label="Término das Vendas"
            readonly
            v-bind="attrs"
            outlined
            dense
            required
            hide-details="auto"
            :rules="validationRules.close_date"
            v-on="on" />
        </template>
        <v-date-picker
          v-model="localTicket.close_date"
          locale="pt-br"
          dense
          no-title
          @input="onDateChange('close_date', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="3" sm="12">
      <v-menu
        v-model="endTimeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        dense
        hide-details="auto"
        min-width="auto">
        <template #activator="{ on, attrs }">
          <v-text-field
            ref="end_time"
            v-model="localTicket.end_time"
            label="Horário de Término"
            prepend-inner-icon="mdi-clock-outline"
            readonly
            outlined
            dense
            hide-details="auto"
            v-bind="attrs"
            required
            :rules="validationRules.end_time"
            v-on="on" />
        </template>
        <v-time-picker
          v-model="localTicket.end_time"
          format="24hr"
          dense
          hide-details="auto"
          @input="onHourChange('end_time', $event)" />
      </v-menu>
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-select
        ref="availability"
        v-model="localTicket.availability"
        :items="availabilityList"
        return-object
        label="Disponibilidade"
        outlined
        placeholder="Selecione a disponibilidade"
        persistent-hint
        :hint="getHintByAvailability"
        required
        dense
        :rules="validationRules.availability"
        hide-details="auto" />
    </v-col>
    <v-col md="3" sm="8">
      <div class="mt-2">
        <v-icon
          v-if="localTicket.visible"
          color="primary"
          size="24"
          @click="handleVisibility">
          mdi-checkbox-marked
        </v-icon>

        <v-icon v-else size="24" @click="handleVisibility">
          mdi-checkbox-blank-outline
        </v-icon>

        <span class="ml-1"> Visível </span>
      </div>
    </v-col>

    <template v-if="nomenclature != 'Doação' && isMobile">
      <v-col cols="12" md="12" sm="12" class="py-0 my-2">
        <div class="d-flex align-center" style="padding: 0px 4px 0px">
          <h4 class="mr-2">Quantidade permitida por compra</h4>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
            </template>
            <span
              >Limite a quantidade permitida por compra com quantidade mínima e
              máxima</span
            >
          </v-tooltip>
        </div>
      </v-col>

      <v-col cols="12" md="6" sm="12">
        <v-text-field
          ref="min_purchase"
          v-model="localTicket.min_purchase"
          label="Compra Mínima"
          type="number"
          min="0"
          outlined
          dense
          required
          hide-details="auto"
          :rules="validationRules.min_purchase"
          @keypress="onNumerFieldChange" />
      </v-col>
      <v-col cols="12" md="6" sm="12">
        <v-text-field
          ref="max_purchase"
          v-model="localTicket.max_purchase"
          label="Compra Máxima"
          type="number"
          min="0"
          outlined
          dense
          required
          hide-details="auto"
          :rules="validationRules.max_purchase" />
      </v-col>
    </template>
  </v-row>
</template>

<script>
import { formatPrice, formatDateToBr } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';
export default {
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    nomenclature: {
      type: String,
      required: true,
    },
    eventStartDate: {
      type: String,
      required: true,
    },
    eventEndDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localTicket: { ...this.ticket },
      localCategories: [...this.categories],
      availabilityList: [
        { text: 'Para todo o público', value: 'Publico' },
        { text: 'Restrito a convidados', value: 'Privado' },
        { text: 'Apenas PDV interno', value: 'PDV' },
      ],
      openDateMenu: false,
      closeDateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
      formHasErrors: false,
      validationRules: {
        name: [(value) => !!value || 'O nome é obrigatório.'],
        price: [(value) => !!value || 'O preço é obrigatório.'],
        max_quantity: [
          (value) => !!value || 'A quantidade máxima é obrigatória.',
          (value) => value > 0 || 'A quantidade deve ser maior que zero.',
        ],
        min_purchase: [
          (value) => value >= 0 || 'A compra mínima deve ser maior ou igual a zero.',
        ],
        max_purchase: [
          (value) => value > 0 || 'A compra máxima deve ser maior ou igual a zero.',
          (value) =>
            !value ||
            Number(value) >= Number(this.localTicket.min_purchase) ||
            'A compra máxima deve ser maior ou igual à compra mínima.',
        ],
        open_date: [(value) => !!value || 'A data de abertura é obrigatória.'],
        start_time: [(value) => !!value || 'A hora de início é obrigatória.'],
        close_date: [
          (value) => !!value || 'A data de fechamento é obrigatória.',
          (value) =>
            !value ||
            this.normalizeDate(this.localTicket.close_date) >=
              this.normalizeDate(this.localTicket.open_date) ||
            'A data de fechamento deve ser posterior à data de abertura.',
        ],
        end_time: [(value) => !!value || 'A hora de término é obrigatória.'],
        availability: [(value) => !!value || 'A disponibilidade é obrigatória.'],
      },
    };
  },

  computed: {
    formattedOpenDate() {
      return this.localTicket.open_date ? formatDateToBr(this.localTicket.open_date) : '';
    },
    formattedCloseDate() {
      return this.localTicket.close_date
        ? formatDateToBr(this.localTicket.close_date)
        : '';
    },
    getHintByAvailability() {
      switch (this.localTicket.availability?.value) {
        case 'Publico':
          if (this.nomenclature === 'Doação') {
            return 'A doação ficará visível para todos que acessarem a página de vendas.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'O ingresso ficará visível para todos que acessarem a página de vendas.';
          } else {
            return 'A inscrição ficará visível para todos que acessarem a página de vendas.';
          }

        case 'Restrito':
          if (this.nomenclature === 'Doação') {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão fazer doações.';
          } else if (this.nomenclature === 'Ingresso') {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar o ingresso.';
          } else {
            return 'Um link será criado e somente pessoas que acessarem através dele poderão comprar a inscrição.';
          }
        case 'Interno':
          if (this.nomenclature === 'Doação') {
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
    form() {
      return {
        name: this.localTicket.name,
        category: this.localTicket.category,
        price: this.localTicket.price,
        max_quantity: this.localTicket.max_quantity,
        min_purchase: this.localTicket.min_purchase,
        max_purchase: this.localTicket.max_purchase,
        formattedOpenDate: this.localTicket.open_date,
        start_time: this.localTicket.start_time,
        formattedCloseDate: this.localTicket.close_date,
        end_time: this.localTicket.end_time,
        availability: this.localTicket.availability?.value,
      };
    },
  },

  watch: {
    ticket: {
      handler() {
        this.localTicket = { ...this.ticket };
      },
      deep: true,
    },
  },

  methods: {
    handleVisibility() {
      this.localTicket.visible = !this.localTicket.visible;
    },

    validateForm() {
      this.formHasErrors = false;

      Object.keys(this.form).forEach((f) => {
        // Não validar grupo de ingressos
        if (f === 'category') return;

        // Doação não tem preço
        const limitFields = ['min_purchase', 'max_purchase'].includes(f);

        if (this.nomenclature === 'Doação' && limitFields) return;

        if (!this.form[f]) this.formHasErrors = true;

        this.$refs[f].validate(true);
      });

      if (!this.formHasErrors) this.emitChanges();

      return this.formHasErrors;
    },

    normalizeDate(date) {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    },

    emitChanges() {
      this.$emit('update:ticket', this.localTicket);
      this.$emit('update:categories', this.localCategories);
    },
    onCategoryChange(value) {
      this.localTicket.category = value;
    },
    onPriceKeyPress(event) {
      const charCode = event.charCode || event.keyCode;
      const char = String.fromCharCode(charCode);

      if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    },
    onPriceChange(value) {
      if (!value) {
        this.localTicket.price = '';
        return;
      }

      const numericValue = value.replace(/\D/g, '');
      const floatValue = parseFloat(numericValue) / 100;

      this.localTicket.price = formatPrice(floatValue);
    },
    onNumerFieldChange(event) {
      const charCode = event.charCode || event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },
    onDateChange(field, value) {
      this.localTicket[field] = value;
      this.openDateMenu = false;
      this.closeDateMenu = false;
    },
    onHourChange(field, value) {
      this.localTicket[field] = value;
      this.startTimeMenu = false;
      this.endTimeMenu = false;
    },
    updateCategories(categories) {
      this.localCategories = [...categories];
    },
  },
};
</script>

<style scoped></style>
