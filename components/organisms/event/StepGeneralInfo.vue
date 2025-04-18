<template>
  <v-container class="step-general-info py-0 px-0">

    <!-- Sobre o Evento -->
    <v-card flat class="mb-8">
      <v-card-title class="d-flex justify-space-between align-center">
        <p class="subtitle-1 mb-0">1. Sobre o Evento</p>
      </v-card-title>
      <v-card-text>
        <!-- Nome do Evento -->
        <v-row>
          <v-col cols="12" md="12" sm="12" class="pb-0">
            <v-text-field
              ref="name"
              v-model="formData.name"
              label="Nome do Evento*"
              outlined
              counter="60"
              dense
              placeholder="Digite o nome do evento"
              required
              :rules="validationRules.name"
              @input="onEventNameChange" />
          </v-col>
        </v-row>

        <!-- Alias do Evento -->
        <v-row
          v-if="aliasValidation.isValid !== null && formData.alias.length > 0"
          :class="!isMobile ? 'eventAlias' : ''">
          <v-col cols="12" class="pt-0">
            <div class="d-flex align-center">
              <v-progress-circular
                v-if="isValidatingAlias"
                class="mr-1"
                color="primary"
                indeterminate
                :size="18" />

              <template v-if="aliasValidation.isValid">
                <v-icon v-if="!isValidatingAlias" class="mr-1" color="green">
                  mdi-check-circle
                </v-icon>

                <p v-if="!editAlias" class="caption">
                  https://meuingresso.com.br/event/{{ aliasValidation.alias }}
                </p>

                <p v-if="editAlias && !isMobile" class="caption">
                  https://meuingresso.com.br/event/
                </p>

                <v-text-field
                  v-if="editAlias"
                  ref="aliasInput"
                  v-model="formData.alias"
                  :class="!isMobile ? 'alias-input' : 'alias-input-mobile'"
                  dense
                  placeholder="Digite o identificador do evento"
                  hide-details="auto"
                  @input="onAliasChange" />

                <v-icon
                  v-if="editAlias"
                  class="ml-2 cursor-pointer"
                  color="primary"
                  size="22"
                  @click="handleSaveNewAlias">
                  mdi-check
                </v-icon>
              </template>

              <template v-else>
                <v-icon v-if="!isValidatingAlias" class="mr-1" color="orange">
                  mdi-alert-box
                </v-icon>

                <p v-if="!editAlias" class="caption">
                  https://meuingresso.com.br/event/{{ aliasValidation.alias }}
                  <span class="red--text">(em uso)</span>
                </p>

                <p v-if="editAlias && !isMobile" class="caption">
                  https://meuingresso.com.br/event/
                </p>

                <v-text-field
                  v-if="editAlias"
                  ref="aliasInput"
                  v-model="formData.alias"
                  :class="!isMobile ? 'alias-input' : 'alias-input-mobile'"
                  dense
                  placeholder="Digite o identificador do evento"
                  hide-details="auto"
                  @input="onAliasChange" />

                <v-icon
                  v-if="editAlias"
                  class="ml-2 cursor-pointer"
                  color="primary"
                  size="22"
                  @click="handleSaveNewAlias">
                  mdi-check
                </v-icon>
              </template>

              <v-icon
                v-if="!editAlias"
                class="ml-2 cursor-pointer"
                color="primary"
                size="16"
                @click="handleEditAlias">
                mdi-pencil
              </v-icon>
            </div>
          </v-col>
        </v-row>

        <!-- Categorias e Tipos de Evento -->
        <v-row class="mb-4">
          <!-- Categoria -->
          <v-col cols="12" md="4" sm="12">
            <v-autocomplete
              ref="category"
              v-model="formData.category"
              label="Categoria*"
              :items="categories"
              outlined
              dense
              return-object
              hide-details="auto"
              required
              :rules="validationRules.category" />
          </v-col>

          <!-- Tipo do Evento -->
          <v-col cols="12" md="4" sm="12">
            <v-autocomplete
              ref="event_type"
              v-model="formData.event_type"
              label="Tipo do Evento*"
              :items="types"
              outlined
              dense
              hide-details="auto"
              required
              :disabled="nomenclature === 'Doação'"
              :rules="validationRules.event_type" />
          </v-col>

          <!-- Classificação Indicativa -->
          <v-col cols="12" md="4" sm="12">
            <RatingSelect
              ref="rating"
              v-model="formData.rating"
              :value="formData.rating"
              :ratings="ratings" />
          </v-col>

          <v-col v-if="isEventOnlineOrHibrido" cols="12" md="12" sm="12">
            <v-text-field
              ref="link_online"
              v-model="formData.link_online"
              label="Link do Evento*"
              outlined
              dense
              placeholder="Digite o link do evento"
              hide-details="auto"
              :rules="validationRules.link_online" />
          </v-col>

          <!-- Descrição do Evento -->
          <v-col cols="12" md="12" sm="12">
            <RichTextEditor
              v-model="formData.general_information"
              placeholder="Digite uma descrição para o evento"
              :disabled="isImprovingDescription"
              :actions="['bold', 'italic', 'list']"
            />

            <div class="d-flex justify-end ma-0 pa-0">
              <v-btn
                color="primary"
                text
                outlined
                class="mt-4"
                :disabled="isImprovingDescription"
                @click="enhanceDescription">
                <v-icon left> mdi-magic-staff </v-icon>

                Melhorar descrição com IA
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Imagem do Evento -->
    <v-card flat class="mb-8">
      <v-card-title class="d-flex justify-space-between align-center">
        <p class="subtitle-1 mb-0">2. Imagem do Evento</p>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="7" sm="12">
            <!-- Campo de Upload / Prévia da Imagem -->
            <div v-if="imagePreview" class="image-preview-container">
              <img :src="imagePreview" alt="Prévia do Banner" class="image-preview" />
              <div class="image-actions">
                <v-btn icon color="primary" small rounded class="mr-1" @click="triggerFileInput">
                  <v-icon small>mdi-upload</v-icon>
                </v-btn>
                <v-btn icon color="grey" small rounded  @click="onClearBanner">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </div>
              <div v-if="imageDimensions && (imageDimensions.width !== 954 || imageDimensions.height !== 500)" class="image-dimensions-warning">
                <v-icon small color="warning" left>mdi-alert</v-icon>
                <span>{{ imageDimensions.width }}x{{ imageDimensions.height }}px</span>
              </div>
            </div>
            <input
              ref="hiddenFileInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onFileSelected"
            />
            <v-file-input
              v-if="!imagePreview"
              v-model="formData.banner"
              label="Selecionar imagem"
              accept="image/*"
              outlined
              hide-input
              dense
              prepend-icon="mdi-image-plus"
              hide-details="auto"
              show-size
              class="custom-file-input"
              @change="validateImageDimensions" />
          </v-col>
          <v-col cols="12" md="5" sm="12" class="d-flex align-center">
            <div class="image-instructions">
              <h4 class="subtitle-1 mb-2">Dimensões recomendadas:</h4>
              <p class="body-2 mb-2"><v-icon small class="mr-1">mdi-image-size-select-actual</v-icon> <strong>954 x 500 pixels</strong></p>
              <p class="body-2 mb-2"><v-icon small class="mr-1">mdi-file-image</v-icon> Formatos aceitos: JPG, PNG</p>
              <p class="body-2 mb-2"><v-icon small class="mr-1">mdi-information</v-icon> Tamanho máximo: 5MB</p>
              <div class="mt-3 caption grey--text">
                <p>Uma imagem de boa qualidade atrai mais atenção e aumenta as chances de venda de ingressos. Evite imagens com textos pequenos ou muitas informações.</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Datas do Evento -->
    <DateTimeForm ref="dateTimeForm" />

    <!-- Endereço do Evento -->
    <template v-if="canShowAddressForm">
      <AddressForm ref="addressForm" />
    </template>

    <!-- Configurações do Evento/Ingressos -->
    <v-card flat class="mb-8">
      <v-card-title>
        <p class="subtitle-1">{{ canShowAddressForm ? '5. Configurações' : '4. Configurações' }}</p>
      </v-card-title>
      <v-card-text>
        <v-row class="d-flex align-start">
          <v-col cols="12" md="6" sm="12">
            <v-select
              v-model="formData.availability"
              label="Visibilidade"
              :items="availabilityOptions"
              persistent-hint
              :hint="getHintByAvailability"
              outlined
              dense
              hide-details="auto"
              required />
          </v-col>

          <v-col cols="12" md="6" sm="12" class="d-flex align-center">
            <v-select
              v-model="nomenclature"
              label="Nomenclatura"
              :items="nomenclatureOptions"
              outlined
              dense
              hide-details="auto"
              required />
          </v-col>

          <v-col cols="12" md="6" sm="12">
            <div class="d-flex" :class="{ 'justify-space-between mb-4': isMobile }">
              <v-icon
                v-if="formData.absorb_service_fee"
                class="ma-0 pa-0"
                size="50"
                color="primary"
                @click="handleAbsorbServiceFee">
                mdi-toggle-switch
              </v-icon>

              <v-icon
                v-else-if="!formData.absorb_service_fee"
                class="ma-0 pa-0"
                size="50"
                @click="handleAbsorbServiceFee">
                mdi-toggle-switch-off
              </v-icon>

              <span class="mt-3" :class="!isMobile ? 'helpText' : ''">
                Absorver a taxa de serviço
              </span>

              <div class="d-flex" :class="!isMobile ? 'helpText' : ''">
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-icon color="gray" v-bind="attrs" v-on="on">
                      mdi-help-circle
                    </v-icon>
                  </template>
                  <span class="tax-container">
                    Ao selecionar essa opção, a taxa de serviço (10%) será incluída no
                    preço final de venda do ingresso e não será mostrada ao comprador
                  </span>
                </v-tooltip>
              </div>
            </div>
          </v-col>

          <v-col v-if="isAdmin" cols="12" md="6" sm="12">
            <div class="d-flex" :class="{ 'justify-space-between': isMobile }">
              <v-icon
                v-if="formData.is_featured"
                class="ma-0 pa-0"
                size="50"
                color="primary"
                @click="handleToggleFeatured">
                mdi-toggle-switch
              </v-icon>

              <v-icon
                v-else-if="!formData.is_featured"
                class="ma-0 pa-0"
                size="50"
                @click="handleToggleFeatured">
                mdi-toggle-switch-off
              </v-icon>

              <span class="mt-3" :class="!isMobile ? 'helpText' : ''">
                Marcar como destaque
              </span>

              <div class="d-flex" :class="!isMobile ? 'helpText' : ''">
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-icon color="gray" v-bind="attrs" v-on="on">
                      mdi-help-circle
                    </v-icon>
                  </template>
                  <span class="tax-container">
                    Ao selecionar essa opção, o evento será marcado como destaque na
                    plataforma.
                  </span>
                </v-tooltip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  
  </v-container>
</template>

<script>
import Debounce from '@/utils/Debounce';
import { event, toast, openAI, eventGeneralInfo } from '@/store';
import { isMobileDevice } from '@/utils/utils';

export default {

  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    ratings: {
      type: Array,
      default: () => [],
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      aliasValidation: {
        isValid: null,
        alias: '',
      },
      editAlias: false,
      isImprovingDescription: false,
      types: ['Presencial', 'Online', 'Híbrido'],
      debouncerAlias: null,
      imagePreview: null,
      availabilityOptions: ['Publico', 'Privado', 'Página'],
      nomenclature: 'Ingresso',
      nomenclatureOptions: ['Ingresso', 'Inscrição', 'Doação'],
      formHasErrors: false,
      validationRules: {
        name: [
          (value) => !!value || 'O nome do evento é obrigatório.',
          (value) =>
            (value && value.length <= 60) ||
            'O nome do evento deve ter no máximo 60 caracteres.',
        ],
        category: [(value) => !!value || 'Selecione uma categoria.'],
        event_type: [(value) => !!value || 'Selecione o tipo do evento.'],
        link_online: [
          (value) => !!value || 'O link do evento é obrigatório.',
          (value) =>
            /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(value) || 'Digite um link válido.',
        ],
      },
      imageDimensions: null,
    };
  },

  computed: {

    canShowAddressForm() {
      return this.isEventPresencialOrHibrito && this.nomenclature !== 'Doação';
    },
    

    formData() {
      return eventGeneralInfo.$info;
    },

    generalInfoForm() {
      return {
        name: this.formData.name,
        category: this.formData.category?.value,
        event_type: this.formData.event_type,
        rating: this.formData.rating?.value,
        link_online: this.formData.link_online,
        address: this.formData.address,
      };
    },

    isValidatingAlias() {
      return event.$isLoadingAlias;
    },

    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    isEventPresencialOrHibrito() {
      return ['Presencial', 'Híbrido'].includes(this.formData.event_type);
    },

    isEventOnline() {
      return this.formData.event_type === 'Online';
    },

    isEventOnlineOrHibrido() {
      return ['Online', 'Híbrido'].includes(this.formData.event_type);
    },

    getHintByAvailability() {
      switch (this.formData.availability) {
        case 'Público':
          return 'O evento será visível para todos os usuários da plataforma.';
        case 'Privado':
          return 'Apenas quem tiver o link poderá acessar a página do evento.';
        default:
          return 'O evento será visível apenas na página do promotor.';
      }
    },

    userRole() {
      return this.$cookies.get('user_role');
    },

    userId() {
      return this.$cookies.get('user_id');
    },

    isAdmin() {
      const role = this.userRole;
      return role && role.name === 'Admin';
    },
  },

  watch: {
    nomenclature(value) {
      // Atualiza o tipo de venda do evento
      this.formData.sale_type = value;

      if (value === 'Ingresso') {
        this.$emit('update:nomenclature', 'Ingressos');
      } else if (value === 'Inscrição') {
        this.$emit('update:nomenclature', 'Inscrições');
      } else if (value === 'Doação') {
        this.formData.event_type = 'Online';
        this.$emit('update:nomenclature', 'Doações');
      }
    },
  },

  created() {
    this.debouncerAlias = new Debounce(this.validateAlias, 300);

    if (!this.isEditing) {
      this.formData.promoter_id = this.userId;
    } else {
      this.imagePreview = this.formData.banner;
    }
  },

  methods: {
    onAliasChange(value) {
      const formattedValue = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

      this.formData.alias = formattedValue;
    },

    async handleSaveNewAlias() {
      this.editAlias = false;
      await this.validateAlias();
    },

    async enhanceDescription() {
      this.isImprovingDescription = true;

      const payload = {
        event_description: this.formData.general_information,
      };

      const result = await openAI.improveDescription(payload);

      if (result?.body?.code === 'IMPROVE_SUCCESS') {
        this.formData.general_information = result.body.result;
      }

      this.isImprovingDescription = false;
    },

    handleToggleFeatured() {
      this.formData.is_featured = !this.formData.is_featured;
    },

    handleAbsorbServiceFee() {
      this.formData.absorb_service_fee = !this.formData.absorb_service_fee;
    },

    canProceed(callback) {
      this.validateForm();
      if (this.formHasErrors) {
        return callback(null, false, 'Existem campos inválidos no formulário.');
      }

      callback(null, true);
    },

    async validateAlias() {
      try {
        const alias = this.formData.alias;

        if (!alias || alias.length === 0) {
          this.setAliasValidation(null, '');
          return;
        }

        const response = await event.validateAlias(alias);
        this.setAliasValidation(response.is_valid, response.alias);
      } catch (error) {
        console.error('Erro ao validar alias:', error);
        this.aliasValidation = {
          isValid: false,
          alias,
        };
      }
    },

    onEventNameChange() {
      this.generateAlias();
      if (this.formData.alias && this.formData.alias.length > 0) {
        this.debouncerAlias.execute();
      } else {
        this.setAliasValidation(null, '');
      }
    },

    generateAlias() {
      const maxLength = 60;
      let eventName = this.formData.name;

      if (eventName.length > maxLength) {
        eventName = this.formData.name.substring(0, maxLength);
      }

      this.formData.alias = eventName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    },
    setAliasValidation(isValid, alias) {
      this.$set(this.aliasValidation, 'isValid', isValid);
      this.$set(this.aliasValidation, 'alias', alias);
      this.formData.alias = alias;
    },
    validateImageDimensions(file) {
      if (!file) {
        this.imagePreview = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      this.imageDimensions = null;

      img.onload = () => {
        // Armazena as dimensões da imagem carregada
        this.imageDimensions = {
          width: img.width,
          height: img.height
        };
        
        // Verifica se as dimensões são exatamente as recomendadas
        if (img.width !== 954 || img.height !== 500) {
          const message = `A imagem tem ${img.width}x${img.height}px. As dimensões recomendadas são 954x500px.`;
          toast.setToast({
            text: message,
            type: 'warning',
            time: 5000,
          });
        }
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;

      // Atualiza a prévia da imagem
      this.imagePreview = objectUrl;
      this.formData.banner = file;
    },
    onClearBanner() {
      this.imagePreview = null;
      this.formData.banner = null;
    },

    validateForm() {
      try {
        this.formHasErrors = false;

        Object.keys(this.generalInfoForm).forEach((f) => {
          if (!this.generalInfoForm[f]) {
            this.formHasErrors = true;
          }

          if (f === 'address' && this.formData.event_type === 'Online') {
            this.formHasErrors = false;
          }

          if (f === 'link_online' && this.formData.event_type === 'Presencial') {
            this.formHasErrors = false;
          }

          if (this.isEventPresencialOrHibrito) {
            if (f === 'address' && this.$refs.addressForm.validate(true)) {
              this.formHasErrors = true;
            }
          }

          if (f === 'rating' && this.$refs.rating.validate(true)) {
            this.formHasErrors = true;
          }

          if (this.$refs.dateTimeForm) {
            const hasDateErrors = this.$refs.dateTimeForm.validate(true);
            if (hasDateErrors) {
              console.log('hasDateErrors', hasDateErrors);
              this.formHasErrors = true;
            }
          }

          if (this.$refs[f] && !this.$refs[f].validate(true) && f !== 'rating') {
            this.formHasErrors = true;
          }
        });

        return this.formHasErrors;
      } catch (error) {
        console.error('Erro ao validar formulário:', error);
      }
    },

    handleEditAlias() {
      this.editAlias = true;
      this.$nextTick(() => {
        if (this.$refs.aliasInput) {
          this.$refs.aliasInput.$el.querySelector('input').focus();
        }
      });
    },

    triggerFileInput() {
      this.$refs.hiddenFileInput.click();
    },

    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        this.validateImageDimensions(file);
      }
    },
  },
};
</script>

<style scoped>
.step-general-info {
  margin: 0 auto;
}
.mt-3 {
  margin-top: 16px;
}

.custom-file-input {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.custom-file-input:hover {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05);
}

.image-preview-container {
  position: relative;
  height: 200px;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
}

.image-instructions {
  width: 100%;
}

.helpText {
  margin-left: 10px;
}

.eventAlias {
  margin-top: -20px;
}

::v-deep .alias-input {
  max-width: 350px !important;
  margin-top: -5px;
}

::v-deep .alias-input.primary--text {
  color: transparent !important;
  caret-color: rgba(0, 0, 0, 0.87) !important;
}

::v-deep .alias-input-mobile {
  max-width: 250px !important;
}

.image-dimensions-warning {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: rgba(255, 236, 179, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #ff8f00;
}
</style>
