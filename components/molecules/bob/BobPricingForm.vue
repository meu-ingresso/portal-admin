<template>
  <v-row :class="isModal ? 'pl-5 pr-5' : 'pa-5'">
    <v-col v-if="isEditing" class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-autocomplete
        v-model="$bob.shipowner_id"
        :items="getShipowners"
        :rules="[validationRequired]"
        :menu-props="{ maxHeight: '400' }"
        label="Armador*"
        persistent-hint
        hide-details="auto"
        dense
        outlined
        :search-input.sync="searchInput.shippingOwners"
        @input="searchInput.shippingOwners = null" />
    </v-col>

    <v-col v-if="isEditing" class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.freight"
        :rules="[validationRequired]"
        prepend-inner-icon="mdi-currency-usd"
        label="Frete*"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col v-if="isEditing" class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.ens_bl"
        prepend-inner-icon="mdi-currency-usd"
        label="ENS/bl*"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col v-if="isEditing" class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.pricing_freetime_origin"
        :rules="[validationRequired]"
        label="FT Origem*"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col v-if="isEditing" class="pr-1" cols="12" :md="isModal ? '6' : '3'">
      <v-text-field
        v-model="$bob.pricing_freetime_destiny"
        :rules="[validationRequired]"
        label="FT Destino*"
        dense
        outlined
        type="number"
        hide-details="auto" />
    </v-col>

    <v-col v-if="isEditing" class="pr-1" cols="12" md="12">
      <v-textarea
        v-model="$bob.pricing_note"
        label="Observações"
        dense
        row-height="1"
        rows="1"
        outlined />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob, shipowner, loading } from '@/store';

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
  },

  data: () => ({
    searchInput: {
      shippingOwners: null,
    },
  }),

  computed: {
    $bob(): any {
      return bob.$bob;
    },

    $isLoading(): any {
      return loading.$isLoading;
    },

    getShipowners() {
      return shipowner.$shipownerList.map((item: any) => ({
        value: item.id,
        text: item.name,
      }));
    },
  },

  methods: {
    validationRequired(value: any): Boolean | String {
      if ((value && value.length === 0) || value === 0) {
        return 'Campo Obrigatório.';
      }
      return !!value || 'Campo Obrigatório.';
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
