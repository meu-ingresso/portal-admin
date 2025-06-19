<template>
  <div class="event-details-wrapper">
    <div class="integrations-header mb-6">
      <div class="template-title">Integrações</div>
    </div>

    <v-card class="integrations-card" elevation="0" outlined>
      <v-card-text class="pa-6">
        <v-form ref="integrationsForm" v-model="valid" @submit.prevent="saveIntegrations">
          <!-- Facebook -->
          <div class="integration-section mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon color="#4267B2" size="24" class="mr-3">mdi-facebook</v-icon>
              <h3 class="section-title">Facebook</h3>
            </div>
            
            <v-text-field
              v-model="integrations.id_pixel"
              label="ID do Pixel do Facebook"
              placeholder="Ex: 646546456858"
              outlined
              dense
              :rules="pixelRules"
              persistent-hint
              hint="Monitore seus anúncios no Facebook adicionando um pixel de conversão"
              class="mb-4"
            />
            
            <v-textarea
              v-model="integrations.api_token_conversions"
              label="Token de Aceso API de Conversões"
              placeholder="Insira o token de acesso"
              outlined
              dense
              rows="3"
              persistent-hint
              hint="No Gerenciador de Eventos do Facebook, em Configurações, encontre a seção API de Conversões e clique no link Gerar token de acesso"
            />
            
            <v-text-field
              v-model="integrations.api_test_event_code"
              label="API de Conversões: test_event_code"
              placeholder="TEST12345"
              outlined
              dense
              persistent-hint
              hint="Use este campo para testar os eventos do servidor. Obs: Remova depois do teste."
              class="mt-4"
            />
          </div>

          <v-divider class="my-6" />

          <!-- Google -->
          <div class="integration-section mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon color="#4285F4" size="24" class="mr-3">mdi-google</v-icon>
              <h3 class="section-title">Google</h3>
            </div>
            
            <v-text-field
              v-model="integrations.id_tag_manager"
              label="ID do Google Tag Manager"
              placeholder="Ex: GTM-XXXXXXX"
              outlined
              dense
              :rules="tagManagerRules"
              persistent-hint
              hint="Sistema que permite atualizar de forma simples e rápida códigos de acompanhamento"
              class="mb-4"
            />
            
            <v-text-field
              v-model="integrations.id_analytics"
              label="ID do Google Analytics"
              placeholder="Ex: G-0000000000"
              outlined
              dense
              :rules="analyticsRules"
              persistent-hint
              hint="Monitore a página do seu evento conectando com o seu perfil no Google Analytics"
              class="mb-4"
            />
            
            <v-text-field
              v-model="integrations.id_google_ads"
              label="ID do Google Ads"
              placeholder="Ex: AW-00000000"
              outlined
              dense
              :rules="googleAdsRules"
              persistent-hint
              hint="Integre o seu evento com a ferramenta de links patrocinados do Google"
              class="mb-4"
            />
            
            <v-text-field
              v-model="integrations.ads_conversion_label"
              label="Label de conversão do Google Ads"
              placeholder="Ex: AW-12345678/ud4kCaiFg8BENHr4iQC"
              outlined
              dense
              persistent-hint
              hint="Essa label deve ser de Conversão de Compra"
            />
          </div>

          <v-divider class="my-6" />

          <!-- Ações -->
          <div class="d-flex justify-end">
            <DefaultButton
              :is-loading="isLoading"
              :disabled="!valid || !hasChanges"
              text="Salvar"
              @click="saveIntegrations"
            >
            </DefaultButton>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
      isLoading: false,
      integrations: {
        id_pixel: '',
        api_token_conversions: '',
        api_test_event_code: '',
        id_tag_manager: '',
        id_analytics: '',
        id_google_ads: '',
        ads_conversion_label: '',
      },
      originalIntegrations: {},
      pixelRules: [
        v => !v || /^\d+$/.test(v) || 'ID do Pixel deve conter apenas números',
      ],
      tagManagerRules: [
        v => !v || /^GTM-[A-Z0-9]+$/.test(v) || 'Formato deve ser GTM-XXXXXXX',
      ],
      analyticsRules: [
        v => !v || /^G-[A-Z0-9]+$/.test(v) || 'Formato deve ser G-0000000000',
      ],
      googleAdsRules: [
        v => !v || /^AW-\d+$/.test(v) || 'Formato deve ser AW-00000000',
      ],
    };
  },

  computed: {
    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    hasChanges() {
      return JSON.stringify(this.integrations) !== JSON.stringify(this.originalIntegrations);
    },
  },

  watch: {
    getEvent: {
      immediate: true,
      handler(event) {
        if (event) {
          this.loadIntegrations();
        }
      },
    },
  },

  methods: {
    loadIntegrations() {
      if (!this.getEvent) return;

      this.integrations = {
        id_pixel: this.getEvent.id_pixel || '',
        api_token_conversions: this.getEvent.api_token_conversions || '',
        api_test_event_code: this.getEvent.api_test_event_code || '',
        id_tag_manager: this.getEvent.id_tag_manager || '',
        id_analytics: this.getEvent.id_analytics || '',
        id_google_ads: this.getEvent.id_google_ads || '',
        ads_conversion_label: this.getEvent.ads_conversion_label || '',
      };

      // Salvar estado original para detectar mudanças
      this.originalIntegrations = { ...this.integrations };
    },

    async saveIntegrations() {
      if (!this.$refs.integrationsForm.validate()) {
        return;
      }

      try {
        this.isLoading = true;

        await this.$store.dispatch('eventGeneralInfo/updateEventIntegrations', {
          eventId: this.getEvent.id,
          integrations: this.integrations,
        });

        this.$store.dispatch('toast/setToast', {
          text: 'Integrações salvas com sucesso!',
          type: 'success',
          time: 3000,
        });

        // Atualizar estado original
        this.originalIntegrations = { ...this.integrations };

      } catch (error) {
        console.error('Erro ao salvar integrações:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Erro ao salvar integrações. Tente novamente.',
          type: 'error',
          time: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}

.subtitle {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.integrations-card {
  border-radius: 12px;
}

.integration-section {
  padding: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* Estilos customizados para os campos */
:deep(.v-text-field--outlined .v-input__control .v-input__slot) {
  border-radius: 8px;
}

:deep(.v-textarea.v-text-field--outlined .v-input__control .v-input__slot) {
  border-radius: 8px;
}

:deep(.v-input--is-focused .v-input__slot) {
  border-color: #1976d2 !important;
  border-width: 2px !important;
}

:deep(.v-messages__message) {
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Botão salvar */
.v-btn--large {
  padding: 0 32px;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}
</style> 