<template>
  <div class="container">
    <div>
      <v-row :class="isMobile ? 'searchSessionMobile' : 'searchSession'">
        <v-col cols="12" md="5" :class="!isMobile ? 'content' : ''">
          <v-autocomplete
            v-model="$tariff.destiny"
            :items="destinyItems"
            :loading="isLoadingDestinies"
            :search-input.sync="destinySearch"
            :disabled="$isLoading || isLoadingDestinies"
            item-text="text"
            item-value="value"
            label="Porto*"
            hide-details="auto"
            dense
            outlined
            @input="searchInput.destiny = null" />
        </v-col>

        <v-col cols="12" md="5" :class="!isMobile ? 'content' : ''">
          <v-autocomplete
            v-model="$tariff.shipowner"
            :items="shipownerItems"
            :loading="isLoadingShipowners"
            :search-input.sync="shipownerSearch"
            :disabled="$isLoading || isLoadingShipowners"
            item-text="text"
            item-value="value"
            label="Armador*"
            hide-details="auto"
            dense
            outlined
            clearable
            @input="searchInput.shipowner = null" />
        </v-col>

        <v-col cols="12" md="2" :class="!isMobile ? 'content' : ''" align="center">
          <v-btn color="primary" :disabled="!$tariff.destiny" @click="getTariffs">
            Buscar
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="!$isLoading" class="mt-10">
        <v-row v-if="$tariffList && $tariffList.length">
          <v-col v-for="(item, idx) in $tariffList" :key="idx" cols="12" md="6" lg="6">
            <TariffCard :tariff="item" @openTariffDetails="openDetails" />
          </v-col>
        </v-row>

        <!-- <v-row v-if="$tariffList && $tariffList.length === 0 && $tariff.destiny">
          <v-col cols="12" align="center">
            <span>Nenhum resultado encontrado</span>
          </v-col>
        </v-row> -->
      </v-row>
    </div>

    <div v-if="$isLoading">
      <Lottie path="./animations/loading_ship.json" height="300" width="300" />
    </div>

    <TariffDialog
      v-if="dialog"
      :dialog="dialog"
      :selected-tariff="tariffDialogData"
      @update-dialog="updateDialog" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loading, tariff, shipowner } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {
      search: '',
      isLoadingList: true,

      isLoadingDestinies: false,
      destinySearch: null,

      isLoadingShipowners: false,
      shipownerSearch: null,

      tariffData: [],

      searchInput: {
        destiny: null,
        shipowner: null,
      },

      tariffDialogData: {},
      dialog: false,
    };
  },

  computed: {
    $isLoading() {
      return loading.$isLoading;
    },

    $tariff() {
      return tariff.$tariff;
    },

    $tariffList() {
      return tariff.$tariffList;
    },

    destinyItems() {
      return this.$tariffsDestinyList;
    },

    shipownerItems() {
      return this.$shipownerList.map((item: any) => ({
        text: item.name,
        value: item.id_erp,
      }));
    },

    $tariffsDestinyList() {
      return tariff.$tariffsDestinyList;
    },

    $shipownerList() {
      return shipowner.$shipownerList;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  watch: {
    isMobile(val) {
      if (val) {
        this.getTariffs();
      }
    },
  },

  async mounted() {
    loading.setIsLoading(true);

    await Promise.all([this.getShipowners(), this.getTariffsDestiny()]);

    loading.setIsLoading(false);
  },

  created() {
    this.resetTariff();
  },

  methods: {
    openDetails(param) {
      this.tariffDialogData = param;
      this.updateDialog(true);
    },

    updateDialog(status: boolean): void {
      this.$set(this, 'dialog', status);
    },

    async getTariffsDestiny() {
      this.isLoadingDestinies = true;

      await tariff.getTariffsDestiny();

      this.isLoadingDestinies = false;
    },

    async getShipowners() {
      this.isLoadingShipowners = true;

      await shipowner.getAll();

      this.isLoadingShipowners = false;
    },

    async getTariffs() {
      loading.setIsLoading(true);

      const response = await tariff.getTariffs();

      if (response && response.code === 'SEARCH_SUCCESS') {
        loading.setIsLoading(false);
      } else {
        loading.setIsLoading(false);
      }
    },

    resetTariff(this: any): void {
      tariff.reset();
    },
  },
});
</script>

<style scoped>
.searchSession {
  border-radius: 12px;
  height: 95px;
  background-color: var(--white) !important;
}

.searchSessionMobile {
  border-radius: 12px;
  height: 200px;
  background-color: var(--white) !important;
}

.content {
  margin-top: 10px;
}

.contentMobile {
  margin-top: -45px;
  margin-left: 45px;
}
</style>
