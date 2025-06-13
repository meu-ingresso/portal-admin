<template>
  <div class="bg-transparent">

    <v-progress-circular v-if="isLoading" indeterminate color="primary" />

    <template v-else>

      <!-- Seção: Conta de repasse -->
      <v-card flat tile class="mb-8 py-6 px-4">
        <v-card-title class="primary--text font-weight-bold">Conta de repasse</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">Tipo da chave PIX</div>
                <div class="text-subtitle-1">{{ pixKey }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">Chave PIX</div>
                <div class="text-subtitle-1">{{ pixValue }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Seção: Dados fiscais -->
      <v-card flat tile class="py-6 px-4">
        <v-card-title class="primary--text font-weight-bold">Dados Fiscais</v-card-title>
        <v-card-subtitle class="grey--text">
          Estes dados serão utilizados para emissão de nota fiscal dos serviços prestados pela Meu Ingresso.
        </v-card-subtitle>
        <v-card-text class="mt-6">
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">{{ fiscalInfo?.personType === 'PF' ? 'CPF' : 'CNPJ' }}</div>
                <div class="text-subtitle-1">{{ formatDocument(fiscalInfo?.cpf || fiscalInfo?.cnpj) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">{{ fiscalInfo?.personType === 'PF' ? 'Nome Completo' : 'Razão Social' }}</div>
                <div class="text-subtitle-1">{{ displayName }}</div>
              </div>
            </v-col>
          </v-row>

          <template v-if="fiscalInfo?.personType === 'PJ'">
            <v-row>
              <v-col cols="12" md="6" sm="12">
                <div>
                  <div class="text-caption grey--text">Nome Fantasia</div>
                  <div class="text-subtitle-1">{{ fiscalInfo?.tradeName || '-' }}</div>
                </div>
              </v-col>
            </v-row>
          </template>

          <v-row>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">CEP</div>
                <div class="text-subtitle-1">{{ formatCEP(currentAddress?.zipcode) }}</div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="12" sm="12">
              <div>
                <div class="text-caption grey--text">Endereço</div>
                <div class="text-subtitle-1">{{ formatAddress }}</div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">Número</div>
                <div class="text-subtitle-1">{{ currentAddress?.number }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6" sm="12">
              <div>
                <div class="text-caption grey--text">Complemento</div>
                <div class="text-subtitle-1">{{ currentAddress?.complement || '-' }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script>
import { onFormatCNPJ, onFormatCEP, onFormatCPF } from '@/utils/formatters';

export default {
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    fiscalInfo: {
      type: Object,
      default: null
    }
  },

  computed: {
    people() {
      return this.$store.getters['user/$user']?.people || {};
    },

    isLoading() {
      return this.$store.getters['userDocuments/$isLoading'] || this.$store.getters['userAddress/$isLoading'];
    },

    currentAddress() {
      return this.$store.getters['userAddress/$address'] || {};
    },

    pixInfo() {
      return this.$store.getters['userDocuments/$pixInfo'];
    },

    pixKey() {
      return this.pixInfo ? this.pixInfo.type.toUpperCase() : '-';
    },

    pixValue() {
      return this.pixInfo?.value ? this.pixInfo.value : '-';
    },

    displayName() {
      if (!this.fiscalInfo) return '-';

      if (this.fiscalInfo.personType === 'PF') {
        return `${this.fiscalInfo.firstName} ${this.fiscalInfo.lastName}`.trim();
      }
      return this.fiscalInfo.companyName || this.fiscalInfo.tradeName || '-';
    },

    formatAddress() {
      if (!this.currentAddress) return '-';

      const parts = [
        this.currentAddress.street,
        this.currentAddress.neighborhood,
        `${this.currentAddress.city}-${this.currentAddress.state}`
      ].filter(Boolean);

      return parts.join(', ');
    }
  },

  created() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      // Carrega o endereço do usuário se disponível
      const currentUser = this.$store.getters['user/$user'];
      if (currentUser?.people?.id) {
        this.$store.dispatch('userAddress/fetchUserAddress', currentUser.people.id);
      }

      // Carrega os documentos (incluindo PIX)
      // if (currentUser?.id) {
      //   this.$store.dispatch('userDocuments/fetchDocumentStatus', currentUser.id);
      // }
    },

    formatDocument(doc) {
      if (!doc) return '-';
      return this.fiscalInfo?.personType === 'PF' ? onFormatCPF(doc) : onFormatCNPJ(doc);
    },

    formatCEP(cep) {
      if (!cep) return '-';
      return onFormatCEP(cep);
    }
  }
}
</script>

<style scoped>
.text-subtitle-1 {
  font-size: 0.875rem !important;
  font-weight: 500;
}
</style>