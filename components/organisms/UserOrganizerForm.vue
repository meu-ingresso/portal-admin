<template>
  <div class="bg-transparent">
    <!-- Seção: Conta de repasse -->
    <v-card flat tile class="mb-8 py-6 px-4">
      <v-card-title class="primary--text font-weight-bold">Conta de repasse</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">Tipo da chave PIX</div>
              <div class="text-subtitle-1">{{ pixKey  }}</div>
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
      <v-card-title class="primary--text font-weight-bold">Dados fiscais</v-card-title>
      <v-card-subtitle class="grey--text">
        Estes dados serão utilizados para emissão de nota fiscal dos serviços prestados pela Meu Ingresso.
      </v-card-subtitle>
      <v-card-text class="mt-6">
        <v-row>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">CNPJ</div>
              <div class="text-subtitle-1">{{ formatCNPJ(people?.tax) }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">Razão Social</div>
              <div class="text-subtitle-1">{{ people?.social_name }}</div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6" sm="12">
            <div>
              <div class="text-caption grey--text">Nome Fantasia</div>
              <div class="text-subtitle-1">{{ people?.fantasy_name }}</div>
            </div>
          </v-col>
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
  </div>
</template>

<script>
import { user, userAddress, userDocuments } from '@/store';
import { onFormatCNPJ, onFormatCEP } from '@/utils/formatters';

export default {
  computed: {
    people() {
      return user?.$user?.people || {};
    },
    
    currentAddress() {
      return userAddress.$address || {};
    },
    
    pixInfo() {
      return userDocuments.$userAttachments.find(doc => doc.name === 'Pix Key') || {};
    },

    pixKey() {
      return this.pixInfo ? this.pixInfo.type.toUpperCase() : '-';
    },

    pixValue() {
      return this.pixInfo?.value ? this.pixInfo.value : '-';
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
      if (user?.$user?.people?.id) {
        userAddress.fetchUserAddress(user.$user.people.id);
      }
      
      // Carrega os documentos (incluindo PIX)
      if (user?.$user?.id) {
        userDocuments.fetchDocumentStatus(user.$user.id);
      }
    },

    formatCNPJ(doc) {
      if (!doc) return '-';
      return onFormatCNPJ(doc);
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