<template>
  <v-row v-if="!isLoading" :class="isModal ? 'pl-5 pr-5' : 'pa-5'">
    <v-col
      class="pr-1"
      cols="12"
      :md="!$bob.customer || ($bob.customer.length < 30 && !isModal) ? '3' : '6'">
      <v-autocomplete
        v-model="$bob.customer"
        :rules="[validationRequired]"
        :items="customerItems"
        :loading="isLoadingCustomers"
        :search-input.sync="customerSearch"
        item-text="text"
        item-value="value"
        label="Cliente*"
        hide-details="auto"
        dense
        outlined
        @input="searchInput.customers = null" />
    </v-col>

    <!-- <v-col class="pr-1" cols="12" md="3">
      <v-autocomplete
        v-model="$bob.modal_id"
        :items="getModals"
        :rules="[validationRequired]"
        :menu-props="{ maxHeight: '400' }"
        label="Modal*"
        persistent-hint
        hide-details="auto"
        dense
        outlined
        :search-input.sync="searchInput.modals"
        @input="searchInput.modals = null"
        />
    </v-col> -->

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.trade"
        :items="getTradeList"
        :rules="[validationRequired]"
        :menu-props="{ maxHeight: '400' }"
        label="Trade*"
        persistent-hint
        hide-details="auto"
        dense
        outlined
        :search-input.sync="searchInput.trades"
        @input="searchInput.trades = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.origin"
        :rules="[validationRequired]"
        :items="originItems"
        :loading="isLoadingOrigins"
        :search-input.sync="originSearch"
        item-text="text"
        item-value="value"
        label="Origem*"
        hide-details="auto"
        dense
        outlined
        @input="searchInput.origins = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.destiny"
        :rules="[validationRequired]"
        :items="destinyItems"
        :loading="isLoadingDestiny"
        :search-input.sync="destinySearch"
        item-text="text"
        item-value="value"
        label="Destino*"
        hide-details="auto"
        dense
        outlined
        @input="searchInput.destinys = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.volume"
        :rules="[validationRequired]"
        label="Volume*"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col
      class="pr-1"
      cols="12"
      :md="!$bob.product || ($bob.product.length < 30 && !isModal) ? '3' : '6'">
      <v-autocomplete
        v-model="$bob.product"
        :rules="[validationRequired]"
        :items="productItems"
        :loading="isLoadingProducts"
        :search-input.sync="productSearch"
        item-text="text"
        item-value="value"
        label="Produto"
        hide-details="auto"
        dense
        outlined
        @input="searchInput.products = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.container_id"
        :items="getContainers"
        :rules="[validationRequired]"
        :menu-props="{ maxHeight: '400' }"
        label="Container*"
        persistent-hint
        hide-details="auto"
        dense
        outlined
        :search-input.sync="searchInput.containers"
        @input="searchInput.containers = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.seller_target"
        prepend-inner-icon="mdi-currency-usd"
        label="Target"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.seller_freetime_origin"
        label="FT Origem"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.seller_freetime_destiny"
        label="FT Destino"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.year_effective"
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
        :search-input.sync="searchInput.yearEffectives"
        @change="
          ($event) => {
            $bob.month_effective = null;
            monthList = getListMonth($event);
          }
        "
        @input="searchInput.yearEffectives = null" />
    </v-col>

    <v-col class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.month_effective"
        :items="monthList"
        :rules="[validationRequired]"
        :menu-props="{ maxHeight: '400' }"
        item-text="text"
        item-value="value"
        label="Mês Vigência*"
        persistent-hint
        hide-details="auto"
        dense
        outlined
        :search-input.sync="searchInput.monthEffectives"
        @input="searchInput.monthEffectives = null" />
    </v-col>

    <v-col class="pr-1" cols="12" md="12">
      <v-textarea
        v-model="$bob.seller_note"
        label="Observações"
        dense
        row-height="1"
        rows="1"
        outlined />
    </v-col>
  </v-row>

  <v-row v-else class="pa-5 text-center">
    <Loading />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob, modal, container, headSoft } from '@/store';
import { sleep, getMonthList, getNextYearIfLastMonth, getMonths } from '@/utils/utils';

export default Vue.extend({
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },

    isModal: {
      type: Boolean,
      default: false,
    },

    duplicateBobInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    customerEntries: [],
    isLoadingCustomers: false,
    customerSearch: null,

    productEntries: [],
    isLoadingProducts: false,
    productSearch: null,

    originEntries: [],
    isLoadingOrigins: false,
    originSearch: null,

    destinyEntries: [],
    isLoadingDestiny: false,
    destinySearch: null,

    bobLimitDate: 12,
    monthList: [],

    isLoading: false,
    searchInput: {
      customers: null,
      modals: null,
      trades: null,
      origins: null,
      destinys: null,
      products: null,
      containers: null,
      yearEffectives: null,
      monthEffectives: null,
    },
  }),

  computed: {
    $bob(): any {
      return bob.$bob;
    },

    getModals() {
      return modal.$modalList.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },

    getContainers() {
      return container.$containerList.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },

    $api_host() {
      return process.env.api_host;
    },

    getTradeList() {
      return [
        'Asia',
        'Oriente Médio',
        'Mediterrâneo',
        'Norte da Europa',
        'África',
        'América do Sul',
        'América Central',
        'América do Norte',
        'Oceania',
      ];
    },

    productItems() {
      return this.productEntries && this.productEntries.length
        ? this.productEntries.map((entry) => {
            return Object.assign({}, entry, { value: entry.text });
          })
        : [];
    },

    $productList() {
      return headSoft.$productList;
    },

    originItems() {
      return this.originEntries && this.originEntries.length
        ? this.originEntries.map((entry) => {
            return Object.assign({}, entry, { value: entry.text });
          })
        : [];
    },

    $originList() {
      return headSoft.$originList;
    },

    destinyItems() {
      return this.destinyEntries && this.destinyEntries.length
        ? this.destinyEntries.map((entry) => {
            return Object.assign({}, entry, { value: entry.text });
          })
        : [];
    },

    $destinyList() {
      return headSoft.$destinyList;
    },

    customerItems() {
      return this.customerEntries && this.customerEntries.length
        ? this.customerEntries.map((entry) => {
            return Object.assign({}, entry, { value: entry.text });
          })
        : [];
    },

    $customerList() {
      return headSoft.$customerList;
    },

    yearList() {
      const now = new Date();
      const currentYear = now.getFullYear();

      const years = [];

      for (let i = 0; i < 5; i++) {
        const year = currentYear + i;
        years.push({ value: String(year), text: String(year) });
      }

      return years;
    },
  },

  watch: {
    async productSearch(val) {
      if ((val && val.length < 3) || !val) {
        return;
      }

      this.$set(this, 'isLoadingProducts', true);

      await headSoft.getProducts(val);

      this.productEntries = this.$productList;

      this.$set(this, 'isLoadingProducts', false);
    },

    async originSearch(val) {
      if ((val && val.length < 3) || !val) {
        return;
      }

      this.$set(this, 'isLoadingOrigins', true);

      await headSoft.getOriginPorts(val);

      this.originEntries = this.$originList;

      this.$set(this, 'isLoadingOrigins', false);
    },

    async destinySearch(val) {
      if ((val && val.length < 3) || !val) {
        return;
      }

      this.$set(this, 'isLoadingDestiny', true);

      await headSoft.getDestinyPorts(val);

      this.destinyEntries = this.$destinyList;

      this.$set(this, 'isLoadingDestiny', false);
    },

    async customerSearch(val) {
      if ((val && val.length < 3) || !val) {
        return;
      }

      this.$set(this, 'isLoadingCustomers', true);

      await headSoft.getCustomers(val);

      this.customerEntries = this.$customerList;

      this.$set(this, 'isLoadingCustomers', false);
    },
  },

  async created() {
    this.$set(this, 'isLoading', true);

    if (Object.keys(this.$route.query).length > 0) {
      this.setBobDuplicate(this.$route.query);
      await sleep(600);
    } else if (this.isEditing) {
      await container.getAll();

      this.$set(this, 'monthList', this.getListMonth(this.$bob.year_effective));

      await this.setBobFiledsToEdit();
    } else {
      this.setInitialYearAndMonth(new Date().getFullYear);
    }

    this.$set(this, 'isLoading', false);
  },

  mounted() {
    if (Object.keys(this.duplicateBobInfo).length > 0) {
      this.setBobDuplicate(this.duplicateBobInfo);
    }
  },

  methods: {
    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }
      return !!value || 'Campo Obrigatório.';
    },

    getListMonth(year) {
      const yearParam = Number(year);

      return getMonthList(yearParam);
    },

    setInitialYearAndMonth() {
      const now = new Date();
      this.$bob.year_effective = getNextYearIfLastMonth();

      this.monthList = this.getListMonth(this.$bob.year_effective);

      const months = getMonths();
      let initialMonth = now.getMonth() + 1 > 11 ? 0 : now.getMonth() + 1;

      const currentDay = now.getDate();

      if (currentDay > this.bobLimitDate) {
        initialMonth += 1;
      }

      this.$bob.month_effective = months[initialMonth];
    },

    setBobFiledsToEdit() {
      this.$set(this, 'customerSearch', this.$bob.customer);

      this.$set(this, 'originSearch', this.$bob.origin);

      this.$set(this, 'destinySearch', this.$bob.destiny);

      this.$set(this, 'productSearch', this.$bob.product);
    },

    setBobDuplicate(data: any) {
      this.$set(this, 'customerSearch', data.customer);
      this.$set(this.$bob, 'customer', data.customer);

      this.$set(this, 'originSearch', data.origin);
      this.$set(this.$bob, 'origin', data.origin);

      this.$set(this, 'destinySearch', data.destiny);
      this.$set(this.$bob, 'destiny', data.destiny);

      this.$set(this, 'productSearch', data.product);
      this.$set(this.$bob, 'product', data.product);

      this.$set(this.$bob, 'trade', data.trade);
      this.$set(this.$bob, 'container_id', data.container_id);
      this.$set(this.$bob, 'seller_freetime_origin', data.seller_freetime_origin);
      this.$set(this.$bob, 'seller_freetime_destiny', data.seller_freetime_destiny);
      this.$set(this.$bob, 'year_effective', data.year_effective);

      this.setInitialYearAndMonth(Number(data.year_effective));

      const month = this.getMonths().find((item) => item.value === data.month_effective);

      this.$set(this.$bob, 'month_effective', month);
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep {
  .v-input--selection-controls {
    margin-top: 0px !important;
  }
}
</style>
