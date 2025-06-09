<template>
  <v-container class="user-profile-page">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="template-title">Minha Conta</div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Card de Dados de Acesso -->
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

      <!-- Conteúdo das tabs -->
      <v-col cols="12" md="8">

        <v-progress-circular v-if="isLoading" indeterminate color="primary" />

        <template v-else>

          <v-tabs v-model="activeTab" background-color="white" grow class="mb-8">
            <v-tab>Organizador</v-tab>
            <v-tab>Configurações</v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab" :class="{ 'bg-transparent': activeTab === 0 }">
            <!-- Aba de Dados de Organizador -->
            <v-tab-item class="bg-transparent">
              <v-card tile flat class="mb-4 bg-transparent">
                <v-card-text class="bg-transparent px-0 py-0">
                  <div v-if="(hasSubmittedDocuments && isOrganizer) || isAdmin">
                    <UserOrganizerForm :readonly="true" :fiscal-info="fiscalInfo" />
                  </div>
                  <div v-else class="rounded-lg pa-6" style="background-color: #FFCDD2;">
                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
                      <div>
                        <p class="text-body-1 font-weight-bold mb-2">
                          Para ativar sua conta de organizador e receber seus lucros, complete seu cadastro.
                        </p>
                        <p class="mb-0">Após o cadastro completo, seus eventos podem ser publicados.</p>
                      </div>
                      <DefaultButton color="error" class="mt-4 mt-sm-0" text="Completar cadastro"
                        @click="showDocumentDialog = true" />
                    </div>
                  </div>
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
        </template>
      </v-col>
    </v-row>

    <!-- Modais -->
    <RequiredUserDocModal :show-document-dialog="showDocumentDialog" :has-document-info="hasDocumentInfo"
      @close-document-dialog="showDocumentDialog = false" @saved-user-data="onDocumentsSubmitted" />

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
          <UserSecurityForm @saved="onSecurityFormSaved" @cancel="showSecurityDialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { PRODUCER_ROLE, ADMIN_ROLE } from '@/utils/permissions-config';

const PERSON_TYPES = {
  PF: 'PF',
  PJ: 'PJ'
};


export default {

  data() {
    return {
      activeTab: 0,
      showDocumentDialog: false,
      showSecurityDialog: false,
      localUserId: null,
    };
  },

  head() {
    return {
      title: 'Minha Conta'
    };
  },

  computed: {
    userEmail() {
      return this.$auth.user?.auth?.email || '••••••••';
    },

    isOrganizer() {
      const roleName = this.$auth.user?.auth?.role?.name;
      return roleName === PRODUCER_ROLE;
    },

    isAdmin() {
      const roleName = this.$auth.user?.auth?.role?.name;
      return roleName === ADMIN_ROLE;
    },

    displayName() {
      if (!this.fiscalInfo) return '';

      if (this.fiscalInfo.personType === PERSON_TYPES.PF) {
        return `${this.fiscalInfo.firstName} ${this.fiscalInfo.lastName}`.trim();
      }
      return this.fiscalInfo.companyName || this.fiscalInfo.tradeName || '';
    },

    hasRequiredDocuments() {
      return this.$store.getters['userDocuments/$hasRequiredDocuments'];
    },

    hasPixInfo() {
      return this.$store.getters['userDocuments/$hasPixInfo'];
    },

    hasFiscalInfo() {
      return this.$store.getters['userDocuments/$hasFiscalInfo'];
    },

    fiscalInfo() {
      return this.$store.getters['userDocuments/$fiscalInfo'];
    },

    hasDocumentInfo() {
      return this.$store.getters['userDocuments/$documentInfo'];
    },

    hasSubmittedDocuments() {
      return this.hasRequiredDocuments && this.hasPixInfo && this.hasFiscalInfo;
    },

    userId() {
      return this.$auth.user?.auth?.id;
    },

    isLoading() {
      return this.$store.getters['userDocuments/$isLoading'];
    },
  },

  watch: {
    userId: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue !== this.localUserId) {
          this.localUserId = newValue;
          this.$store.dispatch('userDocuments/fetchDocumentStatus', newValue);
        }
      }
    }
  },

  methods: {
    async onDocumentsSubmitted() {
      try {
        await this.$store.dispatch('userDocuments/fetchDocumentStatus', this.userId);
        this.showDocumentDialog = false;
        this.activeTab = 0;
      } catch (error) {
        console.error('Erro ao atualizar informações:', error);
      }
    },


    onSecurityFormSaved() {
      this.showSecurityDialog = false;
    }
  }
};

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