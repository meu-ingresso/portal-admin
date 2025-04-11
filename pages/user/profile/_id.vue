<template>
  <v-container class="user-profile-page">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="template-title">Minha Conta</div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Card fixo de Dados de Acesso à esquerda -->
      <v-col cols="12" md="4">
        <v-card tile flat class="mb-4 py-4">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4 px-4">
              <h3 class="text-h6 mb-0 primary--text font-weight-bold">Dados de acesso</h3>
              <v-btn icon class="ml-2" @click="showSecurityDialog = true">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>

            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption">Login</v-list-item-subtitle>
                  <v-list-item-title>{{ userEmail }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption">Senha</v-list-item-subtitle>
                  <v-list-item-title>
                    <div class="d-flex align-center">
                      <span>{{ '••••••••' }}</span>
                    </div>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Conteúdo das tabs à direita -->
      <v-col cols="12" md="8">
        <v-tabs v-model="activeTab" background-color="white" grow class="mb-8">
          <v-tab>
            Organizador
          </v-tab>
          <v-tab>
            Comprador
          </v-tab>
          <v-tab>
            Configurações
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab" :class="{ 'bg-transparent': activeTab === 0 }">
          <!-- Aba de Dados de Organizador -->
          <v-tab-item class="bg-transparent">
            <v-card tile flat class="mb-4 bg-transparent" >
              <v-card-text class="bg-transparent px-0 py-0">
                <div v-if="hasSubmittedDocuments && isOrganizer">
                  <UserOrganizerForm :readonly="true" />
                </div>
                <div v-else class="rounded-lg pa-6" style="background-color: #FFCDD2;">
                  <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
                    <div>
                      <p class="text-body-1 font-weight-bold mb-2">Para ativar sua conta de organizador e receber seus lucros, complete seu cadastro.</p>
                      <p class="mb-0">Após o cadastro completo, seus eventos podem ser publicados.</p>
                    </div>
                    <DefaultButton 
                      color="error" 
                      class="mt-4 mt-sm-0"
                      text="Completar cadastro"
                      @click="showDocumentDialog = true"
                    />
                  </div>
                </div>
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

          <!-- Aba de Configurações -->
          <v-tab-item>
            <v-card tile flat class="mb-4">
              <v-card-text>
                <p class="text-center grey--text">Nenhuma configuração disponível no momento.</p>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>

    <!-- Modal para completar o cadastro se necessário -->
    <RequiredUserDocModal
      :show-document-dialog="showDocumentDialog"
      @close-document-dialog="showDocumentDialog = false"
      @saved-user-data="onDocumentsSubmitted"
    />

    <!-- Modal para editar dados de acesso -->
    <v-dialog v-model="showSecurityDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Editar dados de acesso
          <v-spacer></v-spacer>
          <v-btn icon @click="showSecurityDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <UserSecurityForm
            @saved="showSecurityDialog = false"
            @cancel="showSecurityDialog = false" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>
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
      showSecurityDialog: false,
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

    userEmail() {
      return user?.$user?.email || '••••••••';
    },

    isOrganizer() {
      return user?.$user?.role?.name === 'Produtor' || user?.$user?.role?.name === 'Admin';
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
      this.activeTab = 0;
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