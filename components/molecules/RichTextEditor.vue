<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar pa-2" :class="{ 'grey lighten-4': !dark }">
      <v-btn
        v-for="(action, index) in enabledActions"
        :key="index"
        small
        icon
        :color="isActive(action.command) ? 'primary' : ''"
        :disabled="disabled"
        @click="executeAction(action)"
      >
        <v-icon small>{{ action.icon }}</v-icon>
      </v-btn>
    </div>

    <!-- Editor Content -->
    <div
      ref="editor"
      class="editor-content pa-4"
      :class="{ 'grey lighten-5': !dark, 'is-disabled': disabled }"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @keydown="handleKeydown"
      @paste="handlePaste"
    ></div>
  </div>
</template>

<script>
const DEFAULT_ACTIONS = [
  { icon: 'mdi-format-bold', command: 'bold', title: 'Negrito' },
  { icon: 'mdi-format-italic', command: 'italic', title: 'Itálico' },
  { icon: 'mdi-format-list-bulleted', command: 'insertUnorderedList', title: 'Lista', alias: 'list' },
]

export default {
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
    dark: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: 0
    },
    actions: {
      type: Array,
      default: () => ['bold', 'italic', 'list']
    }
  },

  data() {
    return {
      content: '',
      availableActions: DEFAULT_ACTIONS,
    }
  },

  computed: {
    enabledActions() {
      return this.availableActions.filter(action => {
        const commandName = action.command.toLowerCase()
        const alias = action.alias?.toLowerCase()
        return this.actions.some(enabled => {
          const enabledAction = enabled.toLowerCase()
          return enabledAction === commandName || enabledAction === alias
        })
      })
    }
  },

  watch: {
    value: {
      handler(newValue) {
        if (this.$refs.editor && this.$refs.editor.innerHTML !== newValue) {
          this.$refs.editor.innerHTML = newValue
        }
      },
      immediate: true
    }
  },

  mounted() {
    this.$refs.editor.innerHTML = this.value
    this.setupEditor()
  },

  methods: {
    setupEditor() {
      this.$refs.editor.addEventListener('dragover', e => e.preventDefault())
      this.$refs.editor.addEventListener('drop', e => e.preventDefault())
    },

    handleInput(event) {
      const html = event.target.innerHTML
      
      if (html === '<br>') {
        event.target.innerHTML = ''
      }

      if (this.maxLength > 0) {
        const text = event.target.textContent
        if (text.length > this.maxLength) {
          event.target.innerHTML = this.content
          return
        }
      }

      this.content = html
      this.$emit('input', html)
      this.$emit('change', html)
    },

    handleKeydown(event) {
      if (event.key === 'Tab') {
        event.preventDefault()
      }
    },

    handlePaste(event) {
      event.preventDefault()
      
      const text = event.clipboardData.getData('text/plain')
      
      document.execCommand('insertText', false, text)
    },

    executeAction(action) {
      document.execCommand(action.command, false, null)
      this.$refs.editor.focus()
    },

    isActive(command) {
      return document.queryCommandState(command)
    },

    getPlainText() {
      return this.$refs.editor?.textContent || ''
    },

    clear() {
      if (this.$refs.editor) {
        this.$refs.editor.innerHTML = ''
        this.$emit('input', '')
        this.$emit('change', '')
      }
    },

    focus() {
      this.$refs.editor?.focus()
    }
  }
}
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.editor-content {
  min-height: 120px;
  outline: none;
  white-space: pre-wrap;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: rgba(0, 0, 0, 0.38);
  pointer-events: none;
}

.editor-content.is-disabled {
  background-color: rgba(0, 0, 0, 0.06);
  pointer-events: none;
}

/* Style for lists inside editor */
.editor-content ul {
  padding-left: 24px;
  margin: 8px 0;
}

.editor-content li {
  margin: 4px 0;
}

/* Dark theme adjustments */
.rich-text-editor.theme--dark {
  border-color: rgba(255, 255, 255, 0.12);
}

.rich-text-editor.theme--dark .editor-toolbar {
  border-color: rgba(255, 255, 255, 0.12);
}

.rich-text-editor.theme--dark .editor-content:empty:before {
  color: rgba(255, 255, 255, 0.38);
}
</style> 