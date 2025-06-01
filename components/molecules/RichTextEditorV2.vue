<template>
  <div class="rich-text-editor-v2">
    <quill-editor ref="quillEditor" v-model="content" :options="editorOption" :disabled="disabled" @blur="onEditorBlur"
      @focus="onEditorFocus" @ready="onEditorReady" @change="onEditorChange" />
    <div v-if="maxLength > 0" class="character-counter pa-2" :class="{ 'grey lighten-4': !dark }">
      <span :class="{ 'error--text': isOverLimit }">
        {{ currentLength }}/{{ maxLength }} caracteres
      </span>
    </div>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css' // Estilo "Snow" do Quill (barra de ferramentas padrão)
// import 'quill/dist/quill.bubble.css' // Alternativamente, o estilo "Bubble" (toolbar flutuante)

import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'RichTextEditorV2',
  components: {
    quillEditor
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Escreva aqui...'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    dark: { // Mantendo para consistência, embora Quill tenha seu próprio theming
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: 0 // 0 para desabilitar
    },
    options: {
      type: Object,
      default: () => ({})
    },
    // Novas props para upload de imagem
    enableImageUpload: {
      type: Boolean,
      default: false
    },
    imageUploadHandler: {
      type: Function,
      default: null
    },
    maxImageSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB por padrão
    },
    acceptedImageTypes: {
      type: Array,
      default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    }
  },
  data() {
    return {
      content: this.value,
      currentLength: 0,
      defaultEditorOptions: {
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['blockquote'],
            ['link', ...(this.enableImageUpload ? ['image'] : [])], // Adiciona 'image' condicionalmente
            ['clean']
          ]
        },
        placeholder: this.placeholder,
        theme: 'snow', // ou 'bubble'
        readOnly: this.disabled,
      }
    }
  },
  computed: {
    editorOption() {
      return { ...this.defaultEditorOptions, ...this.options, placeholder: this.placeholder, readOnly: this.disabled }
    },
    isOverLimit() {
      return this.maxLength > 0 && this.currentLength > this.maxLength;
    },
    editorInstance() {
      return this.$refs.quillEditor?.quill;
    }
  },
  watch: {
    value(newValue) {
      if (newValue !== this.content) {
        this.content = newValue;
      }
      this.updateCharacterCount();
    },
    disabled(newVal) {
      if (this.editorInstance) {
        this.editorInstance.enable(!newVal);
      }
    },
    placeholder(newVal) {
      if (this.editorInstance) {
        this.editorInstance.root.dataset.placeholder = newVal;
      }
    }
  },
  mounted() {
    this.updateCharacterCount();
    if (this.editorInstance) {
      this.editorInstance.root.dataset.placeholder = this.placeholder;
    }
  },
  methods: {
    updateCharacterCount() {
      if (this.editorInstance) {
        // Quill retorna o comprimento do texto puro, incluindo nova linha como 1 caractere.
        // Se precisar de uma contagem exata de "caracteres visíveis", pode ser necessário um tratamento mais complexo.
        this.currentLength = this.editorInstance.getText().trimEnd().length;
      } else {
        // Fallback se o editor não estiver pronto, calcula do HTML (menos preciso)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.content || '';
        this.currentLength = tempDiv.textContent?.length || 0;
      }
    },
    onEditorChange({ quill: _quill, html, text }) {
      if (this.maxLength > 0 && text.trimEnd().length > this.maxLength) {
        // Reverte para o conteúdo anterior se exceder o limite
        // O Quill pode lidar com isso internamente com alguns módulos, mas uma verificação manual é mais segura.
        this.editorInstance.clipboard.dangerouslyPasteHTML(this.content);
      } else {
        this.content = html; // Atualiza o conteúdo interno
      }
      this.$emit('input', this.content);
      this.$emit('change', this.content); // Para consistência com o editor antigo
      this.updateCharacterCount();
    },
    onEditorBlur(_quillInstance) {
      this.$emit('blur', _quillInstance);
    },
    onEditorFocus(_quillInstance) {
      this.$emit('focus', _quillInstance);
    },
    onEditorReady(_quillInstance) {
      this.$emit('ready', _quillInstance);
      this.updateCharacterCount();
      if (this.editorInstance) {
        this.editorInstance.root.dataset.placeholder = this.placeholder;
      }
      // Configura o handler customizado de imagem se habilitado
      if (this.enableImageUpload) {
        this.setupImageHandler();
      }
    },
    getPlainText() {
      return this.editorInstance?.getText() || '';
    },
    clear() {
      this.content = '';
      this.$emit('input', '');
      this.$emit('change', '');
      this.updateCharacterCount();
    },
    focus() {
      this.editorInstance?.focus();
    },
    setupImageHandler() {
      if (!this.editorInstance) return;

      // Substitui o handler padrão de imagem
      const toolbar = this.editorInstance.getModule('toolbar');
      toolbar.addHandler('image', this.handleImageSelection);
    },
    handleImageSelection() {
      // Cria um input file temporário
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', this.acceptedImageTypes.join(','));
      input.click();

      input.onchange = () => {
        const file = input.files[0];
        if (file) {
          this.handleImageFile(file);
        }
      };
    },
    async handleImageFile(file) {
      try {
        // Validações
        if (!this.validateImageFile(file)) {
          return;
        }

        // Emite evento de início do upload
        this.$emit('image-upload-start', file);

        let imageUrl;

        if (this.imageUploadHandler && typeof this.imageUploadHandler === 'function') {
          // Usa o handler customizado fornecido pelo pai
          imageUrl = await this.imageUploadHandler(file);
        } else {
          // Fallback: converte para base64 (não recomendado para produção)
          imageUrl = await this.fileToBase64(file);
          console.warn('RichTextEditorV2: Usando base64 como fallback. Considere implementar um imageUploadHandler customizado.');
        }

        if (imageUrl) {
          this.insertImage(imageUrl);
          this.$emit('image-uploaded', { file, url: imageUrl });
        }
      } catch (error) {
        console.error('Erro no upload da imagem:', error);
        this.$emit('image-upload-error', { file, error });
      }
    },
    validateImageFile(file) {
      // Verifica tipo de arquivo
      if (!this.acceptedImageTypes.includes(file.type)) {
        this.$emit('image-upload-error', {
          file,
          error: `Tipo de arquivo não suportado. Aceitos: ${this.acceptedImageTypes.join(', ')}`
        });
        return false;
      }

      // Verifica tamanho do arquivo
      if (file.size > this.maxImageSize) {
        const maxSizeMB = (this.maxImageSize / (1024 * 1024)).toFixed(1);
        this.$emit('image-upload-error', {
          file,
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
        });
        return false;
      }

      return true;
    },
    insertImage(url) {
      const range = this.editorInstance.getSelection();
      this.editorInstance.insertEmbed(range?.index || 0, 'image', url);
    },
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }
  }
}
</script>

<style scoped>
.rich-text-editor-v2 {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

/* Ajustes para que o Vuetify não entre em conflito com os estilos do Quill */
.rich-text-editor-v2 ::v-deep .ql-toolbar.ql-snow {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px;
  font-family: inherit;
  /* Herda a fonte do Vuetify */
}

.rich-text-editor-v2 ::v-deep .ql-container.ql-snow {
  border: none;
  min-height: 120px;
  font-family: inherit;
  /* Herda a fonte do Vuetify */
  font-size: inherit;
  /* Herda o tamanho da fonte do Vuetify */
}

.rich-text-editor-v2 ::v-deep .ql-editor {
  min-height: 120px;
  padding: 12px;
}

.rich-text-editor-v2 ::v-deep .ql-editor.ql-blank::before {
  color: rgba(0, 0, 0, 0.38);
  font-style: normal;
  /* Para não ficar itálico por padrão */
  left: 12px;
  /* Ajuste do padding */
}

.character-counter {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.rich-text-editor-v2 ::v-deep .ql-disabled {
  background-color: #f5f5f5;
  /* Cor de fundo para estado desabilitado */
}

/* Dark theme (básico, Quill pode precisar de theming mais específico se for usado em modo dark) */
.rich-text-editor-v2.theme--dark ::v-deep .ql-toolbar.ql-snow,
.rich-text-editor-v2.theme--dark ::v-deep .ql-container.ql-snow {
  border-color: rgba(255, 255, 255, 0.12);
}

.rich-text-editor-v2.theme--dark ::v-deep .ql-editor.ql-blank::before {
  color: rgba(255, 255, 255, 0.38);
}

.rich-text-editor-v2.theme--dark .character-counter {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
}
</style>