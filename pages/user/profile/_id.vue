<template>
  <v-container class="user-profile-page">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="template-title">Minha Conta</div>
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab" background-color="white" grow class="mb-8">
      <v-tab>
        <v-icon left>mdi-key</v-icon>
        Dados de Acesso
      </v-tab>
      <v-tab v-if="isOrganizer">
        <v-icon left>mdi-account-tie</v-icon>
        Dados de Organizador
      </v-tab>
      <v-tab>
        <v-icon left>mdi-account</v-icon>
        Dados de Comprador
      </v-tab>
      <v-tab v-if="hasTickets">
        <v-icon left>mdi-ticket</v-icon>
        Meus Ingressos
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab" class="mt-4">
      <!-- Aba de Dados de Acesso -->
      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card tile flat class="mb-4">
              <v-card-text>
                <UserProfileForm />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card tile flat class="mb-4">
              <v-card-text>
                <UserSecurityForm />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <!-- Aba de Dados de Organizador -->
      <v-tab-item v-if="isOrganizer">
        <v-card tile flat class="mb-4">
          <v-card-text>
            <UserOrganizerForm />
          </v-card-text>
        </v-card>
      </v-tab-item>

      <!-- Aba de Dados de Comprador -->
      <v-tab-item>
        <v-card tile flat class="mb-4">
          <v-card-text>
            <UserBuyerForm />
          </v-card-text>
        </v-card>
      </v-tab-item>

      <!-- Aba de Meus Ingressos (apenas se tiver ingressos) -->
      <v-tab-item v-if="hasTickets">
        <v-card tile flat class="mb-4">
          <v-card-text>
            <UserTicketsList />
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <!-- Modal para completar o cadastro se necessário -->
    <RequiredUserDocModal
      :show-document-dialog="showDocumentDialog"
      @close-document-dialog="showDocumentDialog = false"
      @saved-user-data="onDocumentsSubmitted"
    />
  </v-container>
</template>

<script>
import { user, userDocuments } from '@/store';

export default {

  async asyncData({ params, error }) {
    try {
      const userId = params.id;
      await user.getById({ user_id: userId, commit: true });
      
      const documentStatus = await userDocuments.fetchDocumentStatus(userId);
      
      return { 
        userId,
        hasSubmittedDocuments: documentStatus?.hasRequiredDocuments && documentStatus?.hasPixInfo
      };
    } catch (e) {
      error({ statusCode: 404, message: 'Usuário não encontrado' });
    }
  },

  data() {
    return {
      activeTab: 0,
      showDocumentDialog: false,
      hasSubmittedDocuments: false,
      userRole: null
    };
  },
  
  head() {
    return {
      title: 'Minha Conta',
    };
  },
  
  computed: {
    isOrganizer() {
      return user.$user?.role?.name === 'Produtor' || user.$user?.role?.name === 'Admin';
    },
    
    hasTickets() {
      return true;
    },
    
    needsToCompleteProfile() {
      return this.isOrganizer && !this.hasSubmittedDocuments;
    }
  },
  
  watch: {
    needsToCompleteProfile(val) {
      if (val) {
        this.showDocumentDialog = true;
      }
    }
  },
  
  mounted() {
    if (this.needsToCompleteProfile) {
      this.showDocumentDialog = true;
    }
  },
  
  methods: {
    onDocumentsSubmitted() {
      this.showDocumentDialog = false;
      this.hasSubmittedDocuments = true;
      this.activeTab = 1;
    }
  }
}
</script>

<style scoped>
.v-tab {
  text-transform: none;
  font-weight: 500;
}

.user-profile-page {
  max-width: 1280px;
}
</style> 