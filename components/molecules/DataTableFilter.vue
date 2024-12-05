<template>
  <v-menu
    :close-on-content-click="false"
    :max-width="isMobile ? '350' : '500'"
    :min-width="isMobile ? '350' : '500'"
    max-height="400"
    min-height="50"
    :offset-y="!isMobile"
    right>
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon color="primary" :size="isMobile ? '40' : '30'">mdi-filter</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-row class="text-center pt-4 pb-4">
        <h2>Filtros</h2>
      </v-row>
      <v-row v-if="filterType === 'bob'" class="pl-5 pr-5">
        <v-col class="pr-1" cols="6" md="6">
          <v-autocomplete
            v-model="filterYear"
            :items="yearList"
            :rules="[validationRequired]"
            :menu-props="{ maxHeight: '400' }"
            item-text="text"
            item-value="value"
            label="Ano Vigência*"
            persistent-hint
            hide-details="auto"
            dense
            outlined
            :search-input.sync="searchInput.years"
            @change="
              ($event) => {
                filterMonth = null;
                isFilterValid = false;
                monthList = getListMonth();
              }
            "
            @input="searchInput.years = null" />
        </v-col>

        <v-col class="pr-4" cols="6" md="6">
          <v-autocomplete
            v-model="filterMonth"
            :items="monthList"
            :rules="[validationRequired]"
            :menu-props="{ maxHeight: '400' }"
            item-text="text"
            item-value="value"
            label="Mês Vigência*"
            persistent-hint
            hide-details="auto"
            return-object
            dense
            outlined
            :search-input.sync="searchInput.months"
            @input="searchInput.months = null" />
        </v-col>
      </v-row>
      <div v-if="filterType === 'bob' && isFilterValid" class="mt-3">
        <v-row v-for="(option, i) in getFilters" :key="i" :index="i" class="pl-5 pr-5">
          <v-col cols="12">
            <v-autocomplete
              v-if="option.items"
              v-model="option.selected"
              :disabled="loadingValues || !isFilterValid"
              :items="option.items"
              :label="option.text"
              persistent-hint
              hide-details="auto"
              chips
              clearable
              deletable-chips
              :dense="option.selected.length < 4"
              multiple
              outlined
              :search-input.sync="searchInput[option.type]"
              @input="searchInput[option.type] = null" />
          </v-col>
        </v-row>
      </div>
      <br />
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import { filter } from '@/store';
import {
  isMobileDevice,
  getYearList,
  getNextYearIfLastMonth,
  getInitialMonth,
  getMonths,
} from '@/utils/utils';

export default Vue.extend({
  props: {
    filterType: { type: String, default: '' },
    loadingValues: { type: Boolean, default: false },
  },

  data: () => ({
    searchInput: {
      customer: null,
      seller_id: null,
      user_id: null,
      origin: null,
      destiny: null,
      product: null,

      years: null,
      months: null,
    },
    monthList: [],
    yearList: [],
    filterYear: null,
    filterMonth: null,
    bobLimitDate: 12,
    isFilterValid: true,
  }),

  computed: {
    getFilters() {
      return filter.$filters[this.filterType];
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  watch: {
    filterMonth(val) {
      if (val && val.value) {
        this.$emit(
          'update-bob-list',
          JSON.stringify({ year: this.filterYear, month: val.value })
        );

        this.isFilterValid = true;
      }
    },
  },

  created() {
    if (this.filterType === 'bob') {
      this.yearList = getYearList();

      this.setInitialYearAndMonth();
    }
  },

  methods: {
    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }

      return !!value || 'Campo Obrigatório.';
    },

    getListMonth() {
      return getMonths();
    },

    setInitialYearAndMonth() {
      this.filterYear = getNextYearIfLastMonth();

      this.monthList = this.getListMonth();

      this.filterMonth = getInitialMonth();
    },
  },
});
</script>
