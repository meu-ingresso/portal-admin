<template>
  <div>
    <p class="text-subtitle-1 grey--text mb-4">
      Envie os documentos necessários para validação da sua conta:
    </p>

    <div v-if="personType === 'PF'" class="mb-6">
      <v-radio-group
        v-model="selectedDocumentType"
        row
        hide-details
        class="mt-0"
      >
        <v-radio 
          value="CNH" 
          label="CNH"
          color="primary"
        ></v-radio>
        <v-radio 
          value="RG" 
          label="RG"
          color="primary"
        ></v-radio>
      </v-radio-group>

      <div v-if="selectedDocumentType === 'CNH'" class="mt-4">
        <FileUploader
          v-model="documents.pf.cnh"
          :max-files="1"
          accepted-formats=".pdf,.jpg,.jpeg,.png"
          title="Anexar CNH"
          helper-text="Upload da CNH (frente e verso em um único arquivo)"
          :error="documentError"
          :error-message="errorMessage"
          :is-complete="documents.pf.cnh.length === 1"
          @error="handleUploadError"
          @change="onDocumentChange('CNH')"
        >
          <template #completeState>
            <div class="complete-state pa-4 text-center">
              <v-icon size="48" color="green">mdi-check-circle</v-icon>
              <div class="text-h6 green--text mt-2">Documento selecionado com sucesso!</div>
              <p class="text-body-2 mt-2 grey--text text--darken-1">
                Você pode gerenciar o documento na lista abaixo
              </p>
            </div>
          </template>
        </FileUploader>
      </div>

      <div v-else class="mt-4">
        <FileUploader
          v-model="rgUploadArray"
          :max-files="2"
          accepted-formats=".pdf,.jpg,.jpeg,.png"
          :title="rgUploadTitle"
          :helper-text="rgUploadHelperText"
          :error="documentError"
          :error-message="errorMessage"
          :is-complete="rgUploadArray.length === 2"
          @error="handleUploadError"
          @change="onRgDocumentChange"
        >
          <template #completeState>
            <div class="complete-state pa-4 text-center">
              <v-icon size="48" color="green">mdi-check-circle</v-icon>
              <div class="text-h6 green--text mt-2">Documentos selecionados com sucesso!</div>
              <p class="text-body-2 mt-2 grey--text text--darken-1">
                Você pode gerenciar os documentos na lista abaixo
              </p>
            </div>
          </template>
          
          <template #selectedFiles="{ files, formatFileSize }">
            <div v-if="files.length > 0" class="selected-files mt-4">
              <!-- RG Frente -->
              <div v-if="files.length >= 1" class="selected-file pa-3 mb-2">
                <div class="d-flex align-center">
                  <v-icon color="secondary" class="mr-2">mdi-file-document-outline</v-icon>
                  <div class="file-details flex-grow-1">
                    <div class="d-flex align-center">
                      <v-chip 
                        size="small" 
                        color="primary" 
                        outlined 
                        class="mr-2"
                      >Frente</v-chip>
                      <div class="text-truncate">{{ files[0].name }}</div>
                    </div>
                    <div class="text-caption grey--text">{{ formatFileSize(files[0].size) }}</div>
                  </div>
                  <v-btn 
                    icon 
                    small 
                    :disabled="files.length === 2"
                    :title="files.length === 2 ? 'Remova primeiro o documento de verso' : ''"
                    @click="removeRgFile(0)"
                  >
                    <v-icon color="grey">mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </div>
              
              <!-- RG Verso -->
              <div v-if="files.length >= 2" class="selected-file pa-3">
                <div class="d-flex align-center">
                  <v-icon color="secondary" class="mr-2">mdi-file-document-outline</v-icon>
                  <div class="file-details flex-grow-1">
                    <div class="d-flex align-center">
                      <v-chip 
                        size="small" 
                        color="primary" 
                        outlined 
                        class="mr-2"
                      >Verso</v-chip>
                      <div class="text-truncate">{{ files[1].name }}</div>
                    </div>
                    <div class="text-caption grey--text">{{ formatFileSize(files[1].size) }}</div>
                  </div>
                  <v-btn 
                    icon 
                    small 
                    @click="removeRgFile(1)"
                  >
                    <v-icon color="grey">mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </template>
        </FileUploader>
      </div>
    </div>

    <!-- Seleção de tipo de documento para Pessoa Jurídica -->
    <div v-else class="mb-6">
      <v-radio-group
        v-model="selectedDocumentType"
        row
        hide-details
        class="mt-0"
      >
        <v-radio 
          value="CNPJ" 
          label="Cartão CNPJ"
          color="primary"
        ></v-radio>
        <v-radio 
          value="ContratoSocial" 
          label="Contrato Social"
          color="primary"
        ></v-radio>
      </v-radio-group>

      <!-- Upload do documento PJ -->
      <div class="mt-4">
        <FileUploader
          v-model="documents.pj.document"
          :max-files="1"
          accepted-formats=".pdf"
          :title="'Anexar ' + (selectedDocumentType === 'CNPJ' ? 'Cartão CNPJ' : 'Contrato Social')"
          :helper-text="selectedDocumentType === 'CNPJ' ? 'Upload do Cartão CNPJ' : 'Upload do Contrato Social'"
          :error="documentError"
          :error-message="errorMessage"
          :is-complete="documents.pj.document.length === 1"
          @error="handleUploadError"
          @change="onDocumentChange(selectedDocumentType)"
        >
          <template #completeState>
            <div class="complete-state pa-4 text-center">
              <v-icon size="48" color="green">mdi-check-circle</v-icon>
              <div class="text-h6 green--text mt-2">Documento selecionado com sucesso!</div>
              <p class="text-body-2 mt-2 grey--text text--darken-1">
                Você pode gerenciar o documento na lista abaixo
              </p>
            </div>
          </template>
        </FileUploader>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentUploadForm',
  props: {
    personType: {
      type: String,
      required: true,
      validator: (value) => ['PF', 'PJ'].includes(value)
    },
    modelValue: {
      type: Object,
      default: () => ({
        pfDocuments: [],
        pjDocument: null,
        documentType: null
      })
    }
  },
  emits: ['update:modelValue', 'error'],
  data() {
    return {
      selectedDocumentType: this.personType === 'PF' ? 'CNH' : 'CNPJ',
      documents: {
        pf: {
          cnh: [],
          rgFront: [],
          rgBack: []
        },
        pj: {
          document: []
        }
      },
      rgUploadArray: [],
      documentError: false,
      errorMessage: '',
    };
  },
  computed: {
    rgUploadTitle() {
      if (this.rgUploadArray.length === 0) {
        return 'Anexar RG - Frente';
      } else if (this.rgUploadArray.length === 1) {
        return 'Anexar RG - Verso';
      }
      return 'RG';
    },
    
    rgUploadHelperText() {
      if (this.rgUploadArray.length === 0) {
        return 'Upload da frente do RG';
      } else if (this.rgUploadArray.length === 1) {
        return 'Upload do verso do RG';
      }
      return 'Ambos os lados do RG enviados';
    }
  },
  watch: {
    personType: {
      handler(newType) {
        // Reset selected document type when person type changes
        this.selectedDocumentType = newType === 'PF' ? 'CNH' : 'CNPJ';
        this.resetDocuments();
      },
      immediate: true
    },
    selectedDocumentType() {
      // Reset documents when document type changes
      this.resetDocumentsForCurrentType();
      this.updateModelValue();
    },
    'documents.pf.cnh'() {
      this.updateModelValue();
    },
    rgUploadArray: {
      handler(_newValue) {
        // Lógica para manter a consistência entre rgUploadArray e os documentos
        this.updateRgDocuments();
        this.updateModelValue();
      },
      deep: true
    },
    'documents.pj.document'() {
      this.updateModelValue();
    },
    modelValue: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          // Initialize from model if available
          if (newValue.documentType) {
            this.selectedDocumentType = newValue.documentType;
          }
          
          if (this.personType === 'PF') {
            if (newValue.pfDocuments) {
              if (this.selectedDocumentType === 'CNH' && newValue.pfDocuments.length > 0) {
                this.documents.pf.cnh = [newValue.pfDocuments[0]];
              } else if (this.selectedDocumentType === 'RG') {
                // Reset arrays
                this.rgUploadArray = [];
                this.documents.pf.rgFront = [];
                this.documents.pf.rgBack = [];
                
                // Initialize with data from model
                if (newValue.pfDocuments.length > 0) {
                  this.rgUploadArray.push(newValue.pfDocuments[0]);
                  this.documents.pf.rgFront = [newValue.pfDocuments[0]];
                }
                
                if (newValue.pfDocuments.length > 1) {
                  this.rgUploadArray.push(newValue.pfDocuments[1]);
                  this.documents.pf.rgBack = [newValue.pfDocuments[1]];
                }
              }
            }
          } else if (this.personType === 'PJ' && newValue.pjDocument) {
            this.documents.pj.document = [newValue.pjDocument];
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleUploadError(message) {
      this.documentError = true;
      this.errorMessage = message;
      this.$emit('error', message);
    },
    
    onDocumentChange(_documentType) {
      this.documentError = false;
      this.errorMessage = '';
      this.updateModelValue();
    },
    
    onRgDocumentChange() {
      this.documentError = false;
      this.errorMessage = '';
      // A lógica de remoção inteligente é tratada em removeRgFile
    },
    
    // Manipulação especializada para remover arquivos do RG mantendo a ordem
    removeRgFile(index) {
      if (index === 0) {
        // Removendo a frente do RG
        // Só permitimos remover a frente se não tiver o verso
        if (this.rgUploadArray.length === 1) {
          this.rgUploadArray = [];
        }
        // Se tiver o verso, não permitimos remover a frente diretamente
      } else if (index === 1) {
        // Removendo o verso do RG
        this.rgUploadArray.splice(1, 1);
      }
      
      // Atualiza os documentos internos
      this.updateRgDocuments();
      this.updateModelValue();
    },
    
    // Atualiza os documentos RG com base no rgUploadArray
    updateRgDocuments() {
      if (this.rgUploadArray.length === 0) {
        // Sem documentos
        this.documents.pf.rgFront = [];
        this.documents.pf.rgBack = [];
      } else if (this.rgUploadArray.length === 1) {
        // O único documento é sempre a frente
        this.documents.pf.rgFront = [this.rgUploadArray[0]];
        this.documents.pf.rgBack = [];
      } else if (this.rgUploadArray.length === 2) {
        // Temos ambos os documentos
        this.documents.pf.rgFront = [this.rgUploadArray[0]];
        this.documents.pf.rgBack = [this.rgUploadArray[1]];
      }
    },
    
    resetDocuments() {
      this.documents = {
        pf: {
          cnh: [],
          rgFront: [],
          rgBack: []
        },
        pj: {
          document: []
        }
      };
      this.rgUploadArray = [];
      this.documentError = false;
      this.errorMessage = '';
      this.updateModelValue();
    },
    
    resetDocumentsForCurrentType() {
      if (this.personType === 'PF') {
        if (this.selectedDocumentType === 'CNH') {
          this.documents.pf.cnh = [];
        } else {
          this.documents.pf.rgFront = [];
          this.documents.pf.rgBack = [];
          this.rgUploadArray = [];
        }
      } else {
        this.documents.pj.document = [];
      }
      this.documentError = false;
      this.errorMessage = '';
    },
    
    updateModelValue() {
      const result = {
        documentType: this.selectedDocumentType
      };
      
      if (this.personType === 'PF') {
        if (this.selectedDocumentType === 'CNH') {
          result.pfDocuments = this.documents.pf.cnh;
        } else {
          result.pfDocuments = [
            ...(this.documents.pf.rgFront.length > 0 ? [this.documents.pf.rgFront[0]] : []),
            ...(this.documents.pf.rgBack.length > 0 ? [this.documents.pf.rgBack[0]] : [])
          ];
        }
        result.isValid = 
          (this.selectedDocumentType === 'CNH' && this.documents.pf.cnh.length > 0) ||
          (this.selectedDocumentType === 'RG' && this.documents.pf.rgFront.length > 0 && this.documents.pf.rgBack.length > 0);
      } else {
        result.pjDocument = this.documents.pj.document.length > 0 ? this.documents.pj.document[0] : null;
        result.isValid = this.documents.pj.document.length > 0;
      }
      
      this.$emit('update:modelValue', result);
    },
    
    validateDocumentType(file, allowedFormats = ['.pdf', '.jpg', '.jpeg', '.png']) {
      if (!file) return true;
      
      const fileName = file.name || '';
      const fileExtension = '.' + fileName.split('.').pop().toLowerCase();
      
      return allowedFormats.includes(fileExtension);
    }
  }
};
</script>

<style scoped>
.v-radio {
  margin-right: 16px;
}

.selected-file {
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

.selected-file:hover {
  background-color: #eeeeee;
}

.complete-state {
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;
  margin-bottom: 16px;
  transition: background-color 0.3s ease;
}
</style> 