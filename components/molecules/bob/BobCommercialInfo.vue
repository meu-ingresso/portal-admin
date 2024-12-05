<template>
  <v-row v-if="$bob && $bob.seller" :class="isMobile ? '' : 'mt-5'">
    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Vendedor:</span>
      {{
        `${capitalizeLetters($bob.seller.first_name)} ${capitalizeLetters(
          $bob.seller.last_name
        )}`
      }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Cliente:</span> {{ capitalizeLetters($bob.customer) }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Modal:</span> {{ $bob.modal.name }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Trade:</span>
      {{ $bob.trade ? capitalizeLetters($bob.trade) : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Origem:</span> {{ capitalizeLetters($bob.origin) }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Destino:</span> {{ capitalizeLetters($bob.destiny) }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Volume:</span> {{ $bob.volume }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Produto:</span> {{ capitalizeLetters($bob.product) }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Container:</span>
      {{ $bob.container.name }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Target:</span>
      {{ $bob.seller_target ? formatValue($bob.seller_target) : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> FT Origem:</span>
      {{ $bob.seller_freetime_origin ? $bob.seller_freetime_origin : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> FT Destino:</span>
      {{ $bob.seller_freetime_destiny ? $bob.seller_freetime_destiny : '-' }}
    </v-col>

    <v-col cols="12" md="6" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Vigência:</span>
      {{ $bob.month_effective }}/{{ $bob.year_effective }}
    </v-col>

    <v-col cols="12" md="12" :class="isMobile ? '' : 'pl-10'">
      <span class="bold"> Observações:</span>
      <span
        v-html="$bob.seller_note ? $bob.seller_note.replace(/\n/g, '<br>') : '-'"></span>
    </v-col>

    <v-col v-if="!$bob.is_active" cols="12" md="12" :class="isMobile ? '' : 'pl-10'">
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
    formatValue(value: number): string {
      return formatDollarValue(value);
    },

    capitalizeLetters(value: string): string {
      return capitalizeFirstLetters(value);
    },
  },
});
</script>
