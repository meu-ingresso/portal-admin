<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col cols="12" md="4">
          <v-icon
            :color="
              tariff.Nome_Cliente || tariff.Nome_Fantasia_Cliente ? 'orange' : 'green'
            "
            size="25">
            mdi-circle
          </v-icon>

          <span class="nameTitle"> {{ tariff.Numero }} </span>
        </v-col>

        <v-col
          v-if="tariff.Nome_Cliente || tariff.Nome_Fantasia_Cliente"
          cols="12"
          md="8"
          :class="isMobile ? 'clientMobile' : ''"
          :align="isMobile ? 'center' : 'end'">
          <span :class="isMobile ? 'clientNameMobile' : 'clientName'">
            {{
              tariff.Nome_Fantasia_Cliente
                ? tariff.Nome_Fantasia_Cliente
                : tariff.Nome_Cliente
            }}
          </span>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="text--primary">
      <v-row>
        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Operação: {{ tariff.Operacao }} </span>
        </v-col>

        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Modal: {{ tariff.Modal }} </span>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Porto: {{ tariff.Porto }} </span>
        </v-col>

        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Armador: {{ tariff.Nome_Fantasia_Armador || tariff.Armador }} </span>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Início Vigência: {{ formatDate(tariff.Data_Inicio_Vigencia) }} </span>
        </v-col>

        <v-col cols="6" class="mt-1 tariffInfos">
          <span> Validade: {{ formatDate(tariff.Data_Validade) }} </span>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-icon size="30" color="primary" class="mr-2" @click="openTariffDetails(tariff)">
        mdi-eye
      </v-icon>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { formatDateToBr } from '~/utils/formatters';
import { isMobileDevice } from '@/utils/utils';

export default Vue.extend({
  props: {
    tariff: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {};
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  methods: {
    formatDate(param: string) {
      return formatDateToBr(param);
    },

    openTariffDetails(param) {
      this.$emit('openTariffDetails', param);
    },
  },
});
</script>

<style scoped>
.nameTitle,
.nameSubtitle {
  margin-left: 5px;
}

.nameTitle {
  color: var(--black);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%;
  width: 100%;
}

.tariffInfos {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.clientName,
.clientNameMobile {
  font-weight: bold !important;
}

.clientName {
  font-size: 14px !important;
}

.clientNameMobile {
  font-size: 13px !important;
}

.clientMobile {
  margin-top: -20px !important;
}
</style>
