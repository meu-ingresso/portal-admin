<template>
  <div class="split-button-wrapper">
    <div ref="buttonContainer" class="button-container">
      <!-- Botão principal -->
      <v-btn
        :color="color"
        :dark="dark"
        :outlined="outlined"
        :disabled="disabled"
        :loading="isLoading"
        class="split-button-main"
        height="36"
        @click="$emit('click')"
      >
        <v-icon v-if="icon" left small>{{ icon }}</v-icon>
        {{ text }}
      </v-btn>

      <!-- Divisor -->
      <div class="split-button-divider" :class="{ 'outlined': outlined }"></div>

      <!-- Botão dropdown -->
      <v-btn
        :color="color"
        :dark="dark" 
        :outlined="outlined"
        :disabled="disabled"
        class="split-button-dropdown"
        height="36"
        min-width="36"
        @click="toggleMenu"
      >
        <v-icon small>mdi-chevron-down</v-icon>
      </v-btn>
    </div>

    <!-- Menu de opções (separado para melhor controle de posicionamento) -->
    <v-menu
      v-model="showMenu"
      :close-on-content-click="true"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      transition="slide-y-transition"
      :min-width="menuWidth"
      :z-index="100"
      content-class="split-button-menu"
      @input="onMenuChange"
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="handleItemClick(item)"
        >
          <v-list-item-icon v-if="item.icon">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'SplitButton',
  
  props: {
    /**
     * Texto do botão principal
     */
    text: {
      type: String,
      required: true
    },
    
    /**
     * Ícone do botão principal (opcional)
     */
    icon: {
      type: String,
      default: null
    },
    
    /**
     * Cor do botão (padrões do Vuetify)
     */
    color: {
      type: String,
      default: 'primary'
    },
    
    /**
     * Define se o botão é dark
     */
    dark: {
      type: Boolean,
      default: false
    },
    
    /**
     * Define se o botão é outlined
     */
    outlined: {
      type: Boolean, 
      default: false
    },
    
    /**
     * Define se o botão está desabilitado
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Define se o botão está em estado de carregamento
     */
    isLoading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Lista de itens do dropdown
     * Formato: [{ text: 'Item 1', icon: 'mdi-plus', action: 'add' }]
     */
    items: {
      type: Array,
      default: () => []
    },
    
    /**
     * Define se o menu deve ser alinhado à esquerda ou direita do botão
     */
    alignMenu: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    }
  },
  
  data() {
    return {
      showMenu: false,
      menuX: 0,
      menuY: 0,
      menuWidth: 175,
      resizeHandler: null
    };
  },

  mounted() {
    // Adiciona listener de redimensionamento da janela
    this.resizeHandler = () => {
      if (this.showMenu) {
        this.calculateMenuPosition();
      }
    };
    window.addEventListener('resize', this.resizeHandler);
  },

  beforeDestroy() {
    // Remove listener para evitar memory leak
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  },
  
  methods: {
    toggleMenu() {
      // Calcula a posição do menu antes de abri-lo
      if (!this.showMenu) {
        this.calculateMenuPosition();
      }
      this.showMenu = !this.showMenu;
    },

    calculateMenuPosition() {
      this.$nextTick(() => {
        const buttonContainer = this.$refs.buttonContainer;
        if (buttonContainer) {
          const rect = buttonContainer.getBoundingClientRect();
          
          // Ajusta posição X com base na preferência de alinhamento
          if (this.alignMenu === 'right') {
            // Alinha o menu à direita do botão dropdown
            this.menuX = rect.right - 36;
          } else {
            // Alinha o menu à esquerda do botão completo (padrão)
            this.menuX = rect.left;
          }
          
          this.menuY = rect.bottom;
          this.menuWidth = Math.max(rect.width, 175);
        }
      });
    },
    
    onMenuChange(isOpen) {
      // Se o menu foi fechado externamente (clicando fora, por exemplo)
      // Atualizamos nosso estado local
      this.showMenu = isOpen;
      
      // Se o menu foi aberto, recalculamos a posição
      if (isOpen) {
        this.calculateMenuPosition();
      }
    },
    
    handleItemClick(item) {
      this.showMenu = false;
      this.$emit('item-click', item.action);
    }
  }
};
</script>

<style scoped>
.split-button-wrapper {
  display: inline-block;
  position: relative;
}

.button-container {
  display: inline-flex;
  border-radius: 4px;
  overflow: hidden;
}

.split-button-main {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  margin-right: 0 !important;
  font-family: var(--font-family-inter-bold) !important;
  text-transform: uppercase;
  font-weight: 800;
  color: white;
}

.split-button-dropdown {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: 0 !important;
  min-width: 36px !important;
  padding: 0 !important;
}

.split-button-divider {
  width: 1px;
  background-color: rgba(255, 255, 255, 0.3);
}

.split-button-divider.outlined {
  background-color: currentColor;
  opacity: 0.3;
}

/* Remove estilo global que possa influenciar no posicionamento do menu */
:deep(.split-button-menu) {
  margin-top: 0 !important;
}
</style> 