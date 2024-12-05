<template>
  <v-row v-if="$bob && $bob.user_id && $bob.is_active" :class="isMobile ? '' : 'mt-5'">
    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Armador:</span> {{ $bob.shipowner ? $bob.shipowner.name : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Frete:</span>
      {{ $bob.freight ? formatValue($bob.freight) : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> ENS/bl:</span>
      {{ $bob.ens_bl ? formatValue($bob.ens_bl) : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Target Batido:</span>
      {{ $bob.pricing_target ? $bob.pricing_target : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> FT Origem:</span>
      {{ $bob.pricing_freetime_origin ? $bob.pricing_freetime_origin + ' dias' : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> FT Destino:</span>
      {{ $bob.pricing_freetime_destiny ? $bob.pricing_freetime_destiny + ' dias' : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Responsável:</span>
      {{
        $bob.user_id && $bob.user
          ? `${capitalizeLetters($bob.user.first_name)} ${capitalizeLetters(
              $bob.user.last_name
            )}`
          : '-'
      }}
    </v-col>

    <v-col v-if="$bob.pricing_note" cols="12" md="12" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Observações:</span>
      <span
        v-html="
          $bob.pricing_note ? $bob.pricing_note.replace(/\n/g, '<br>') : '-'
        "></span>
    </v-col>
  </v-row>

  <v-row v-else :class="isMobile ? '' : 'mt-5'">
    <v-col cols="12" md="12" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Responsável pela exclusão:</span>
      {{
        $bob.user_id && $bob.user
          ? `${capitalizeLetters($bob.user.first_name)} ${capitalizeLetters(
              $bob.user.last_name
            )}`
          : '-'
      }}
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { bob } from '@/store';
import { capitalizeFirstLetters, formatDollarValue } from '@/utils/formatters';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  data() {
    return {};
  },

  computed: {
    $bob(): any {
      return bob.$bob;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    capitalizeLetters(value: string): string {
      return capitalizeFirstLetters(value);
    },

    formatValue(value: number): string {
      return formatDollarValue(value);
    },
  },
});
</script>
