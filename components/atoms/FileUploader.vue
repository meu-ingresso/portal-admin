<template>
  <div class="file-uploader">
    <!-- Área de upload quadriculada -->
    <div 
      v-if="!isComplete || !$slots.completeState"
      class="upload-area" 
      :class="{'is-dragging': isDragging, 'has-error': hasError}" 
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input 
        ref="fileInput" 
        type="file" 
        :accept="acceptedFormats"
        class="hidden-input"
        @change="onFileChange"
      />
      <div class="upload-content">
        <v-icon size="48" color="secondary" class="upload-icon">mdi-cloud-upload-outline</v-icon>
        <div class="text-h6 mt-4">{{ title }}</div>
        <slot name="helperText"></slot>
        <p class="text-caption mt-2 grey--text">{{ helperText }}</p>
      </div>
    </div>

    <!-- Estado de completo quando todos os arquivos foram enviados -->
    <slot 
      v-if="isComplete"
      name="completeState"
    >
    </slot>

    <!-- Lista de arquivos selecionados com slot customizado -->
    <slot 
      name="selectedFiles" 
      :files="selectedFiles"
      :remove-file="removeFile"
      :format-file-size="formatFileSize"
    >
      <!-- Lista padrão de arquivos selecionados -->
      <div v-if="selectedFiles.length > 0" class="selected-files mt-4">
        <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file pa-3 mb-2">
          <div class="d-flex align-center">
            <v-icon color="secondary" class="mr-2">mdi-file-document-outline</v-icon>
            <div class="file-details flex-grow-1">
              <div class="text-truncate">{{ file.name }}</div>
              <div class="text-caption grey--text">{{ formatFileSize(file.size) }}</div>
            </div>
            <v-btn icon small @click="removeFile(index)">
              <v-icon color="grey">mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </slot>

    <!-- Mensagem de erro -->
    <div v-if="errorMessage" class="error-message mt-2 text-caption error--text">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileUploader',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    maxFiles: {
      type: Number,
      default: 2
    },
    acceptedFormats: {
      type: String,
      default: '.pdf,.jpg,.jpeg,.png'
    },
    helperText: {
      type: String,
      default: 'Formatos suportados: PDF, JPG, JPEG, PNG'
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Buscar arquivos para upload'
    },
    isComplete: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedFiles: [],
      isDragging: false
    };
  },
  computed: {
    hasError() {
      return this.error || !!this.errorMessage;
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        if (newValue && Array.isArray(newValue)) {
          this.selectedFiles = newValue;
        }
      }
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    onFileChange(event) {
      const files = event.target.files;
      if (!files.length) return;
      
      this.processFiles(files);
      // Reset input to allow selecting the same file again
      event.target.value = null;
    },
    
    onDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (!files.length) return;
      
      this.processFiles(files);
    },
    
    processFiles(files) {
      // Verificar se não ultrapassou o limite de arquivos
      if (this.selectedFiles.length + files.length > this.maxFiles) {
        this.$emit('error', `Você pode enviar no máximo ${this.maxFiles} arquivos.`);
        return;
      }
      
      // Adicionar os arquivos à lista
      for (let i = 0; i < files.length; i++) {
        // Verificar se o formato é aceito
        const fileName = files[i].name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const acceptedExtensions = this.acceptedFormats
          .split(',')
          .map(format => format.trim().replace('.', ''));
        
        if (!acceptedExtensions.includes(fileExtension)) {
          this.$emit('error', `Formato de arquivo não suportado: ${fileExtension}`);
          continue;
        }
        
        this.selectedFiles.push(files[i]);
      }
      
      this.updateValue();
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.updateValue();
    },
    
    updateValue() {
      this.$emit('input', [...this.selectedFiles]);
      this.$emit('change', [...this.selectedFiles]);
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f5f5f5;
}

.upload-area:hover {
  background-color: rgba(var(--border), 0.1);
}

.upload-area.is-dragging {
  background-color: rgba(var(--border), 0.15);
  border-color: var(--v-secondary-darken1);
}

.upload-area.has-error {
  border-color: var(--error-color);
  background-color: rgba(var(--error-color), 0.05);
}

.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: -1;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selected-file {
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

.selected-file:hover {
  background-color: #eeeeee;
}
</style> 