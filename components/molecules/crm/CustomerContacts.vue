<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="ma-0 pa-0">
    <v-row class="ma-0 pa-0">
      <v-col cols="12" class="ma-0 pa-0">
        <v-data-table
          v-if="!isMobile"
          :headers="getHeaders"
          :items="$customerContacts"
          dense
          hide-default-footer
          :items-per-page="50"
          :loading="$isLoadingContacts"
          loading-text="Carregando Lista de Contatos..."
          no-data-text="Nenhum Contato encontrado"
          :height="$customerContacts.length > 8 ? '50vh' : '35vh'">
          <template #item.Contato="{ item }">
            <span>{{ item.Contato ? capitalizeLetters(item.Contato) : '-' }}</span>
          </template>

          <template #item.Setor="{ item }">
            <span>{{ item.Setor ? capitalizeLetters(item.Setor) : '-' }}</span>
          </template>

          <template #item.Cargo="{ item }">
            <span>{{ item.Cargo ? capitalizeLetters(item.Cargo) : '-' }}</span>
          </template>

          <template #item.Telefone="{ item }">
            <span>{{ item.Telefone || '-' }}</span>
          </template>

          <template #item.Email="{ item }">
            <span>{{ item.Email.toLowerCase() || '-' }}</span>
          </template>
        </v-data-table>

        <div v-if="isMobile && !$isLoadingContacts" class="ma-0 pa-0">
          <v-row v-for="(item, idx) in $customerContacts" :key="idx" align-items="center">
            <v-col cols="12">
              <v-card elevation="5" outlined shaped tile>
                <v-card-title>
                  <span class="idxItem">{{ idx + 1 }}</span>
                  <v-spacer />
                </v-card-title>

                <v-card-text class="pb-1 pt-1">
                  <span class="headerInfo"> Nome: </span>
                  <span class="bodyInfo">
                    {{ item.Contato ? capitalizeLetters(item.Contato) : '-' }}
                  </span>
                </v-card-text>

                <v-card-text class="pb-1 pt-1">
                  <span class="headerInfo"> Setor: </span>
                  <span class="bodyInfo"
                    >{{ item.Setor ? capitalizeLetters(item.Setor) : '-' }}
                  </span>
                </v-card-text>

                <v-card-text class="pb-1 pt-1">
                  <span class="headerInfo"> Grupo: </span>
                  <span class="bodyInfo">
                    {{ item.Cargo ? capitalizeLetters(item.Cargo) : '-' }}
                  </span>
                </v-card-text>

                <v-card-text class="pb-1 pt-1">
                  <span class="headerInfo"> Telefone: </span>
                  <span class="bodyInfo">
                    {{ item.Telefone || '-' }}
                  </span>
                </v-card-text>

                <v-card-text class="pb-1 pt-1">
                  <span class="headerInfo"> Email: </span>
                  <span class="bodyInfo">
                    {{ item.Email.toLowerCase() || '-' }}
                  </span>
                </v-card-text>
                <br />
              </v-card>
            </v-col>
          </v-row>
          <br />
        </div>

        <div v-if="isMobile && $isLoadingContacts">
          <Loading />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { headSoft } from '@/store';
import { capitalizeFirstLetters } from '@/utils/formatters';
import { isMobileDevice } from '~/utils/utils';

export default Vue.extend({
  props: {
    customer: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      isLoading: false,
    };
  },

  computed: {
    $customerContacts() {
      return headSoft.$customerContacts;
    },

    $isLoadingContacts() {
      return headSoft.$isLoadingContacts;
    },

    getHeaders() {
      return [
        { text: 'Nome', value: 'Contato', width: '5rem' },
        { text: 'Setor', value: 'Setor', width: '5rem' },
        { text: 'Cargo', value: 'Cargo', width: '5rem' },
        { text: 'Telefone', value: 'Telefone', width: '8rem', sortable: false },
        { text: 'Email', value: 'Email', width: '8rem' },
      ];
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },
  },

  async mounted() {
    this.$set(this, 'isLoading', true);

    await headSoft.getCustomerContacts(this.customer.IdPessoa);

    this.$set(this, 'isLoading', false);
  },

  methods: {
    capitalizeLetters(value: string): string {
      return capitalizeFirstLetters(value);
    },
  },
});
</script>
