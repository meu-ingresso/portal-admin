<template>
  <div class="user-alias-form">
    <!-- Nome de Exibição -->
    <v-row class="my-2">
      <v-col cols="12">
        <v-text-field
          v-model="displayName"
          label="Nome de exibição"
          outlined
          dense
          counter="30"
          hide-details="auto"
          placeholder="Digite o nome que será exibido"
          :rules="displayNameRules"
          @input="handleDisplayNameChange"
        />
      </v-col>
    </v-row>

    <!-- Alias (URL personalizada) -->
    <v-row>
      <v-col cols="12">
         <v-text-field
           v-model="currentAlias"
           label="URL personalizada"
           prefix="https://vitrine.meuingresso.com.br/produtores/"
           outlined
           hide-details="auto"
           dense
           counter="30"
           placeholder="Digite o identificador da sua página"
           :rules="aliasRules"
           @input="handleAliasChange"
         />
        
        <!-- Preview da URL -->
        <div v-if="currentAlias" class="mt-2">
           <div class="d-flex align-center">
             <v-progress-circular 
               v-if="isValidatingAlias" 
               class="mr-2" 
               color="primary" 
               indeterminate 
               :size="18" 
             />
             
             <template v-if="aliasValidation.isValid">
               <v-icon v-if="!isValidatingAlias" class="mr-2" color="green">
                 mdi-check-circle
               </v-icon>
               <div class="text-caption">
                 <strong>https://vitrine.meuingresso.com.br/produtores/{{ currentAlias }}</strong>
                 <span class="green--text ml-2">(disponível)</span>
               </div>
             </template>
             
             <template v-else-if="aliasValidation.isValid === false">
               <v-icon v-if="!isValidatingAlias" class="mr-2" color="orange">
                 mdi-alert-box
               </v-icon>
               <div class="text-caption">
                 <strong>https://vitrine.meuingresso.com.br/produtores/{{ currentAlias }}</strong>  
                 <span class="orange--text ml-2">(já está em uso)</span>
               </div>
             </template>
           </div>
         </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Debounce from '@/utils/Debounce';

export default {
  props: {
    userAlias: {
      type: String,
      required: true
    },
    customAlias: {
      type: String,
      default: null
    },
    customDisplayName: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      displayName: '',
      currentAlias: '',
      originalDisplayName: '',
      originalAlias: '',
      aliasValidation: {
        isValid: null,
        alias: ''
      },
      debouncerAlias: null,
      displayNameRules: [
        (value) => !!value || 'O nome de exibição é obrigatório.',
        (value) =>
          (value && value.length <= 30) ||
          'O nome deve ter no máximo 30 caracteres.'
      ],
      aliasRules: [
        (value) => !!value || 'O identificador da URL é obrigatório.',
        (value) =>
          (value && value.length <= 30) ||
          'O identificador deve ter no máximo 30 caracteres.',
        (value) => {
          if (!value) return true;
          return /^[a-z0-9-]+$/.test(value) || 'Use apenas letras minúsculas, números e hífens';
        }
      ]
    };
  },

  computed: {
    isValidatingAlias() {
      return this.$store.getters['userDocuments/$isLoadingAlias'];
    },

    formData() {
      return {
        displayName: this.displayName,
        alias: this.currentAlias
      };
    }
  },

  watch: {
     customAlias: {
       immediate: true,
       handler(newVal) {
         // Se não há alias customizado, usa o userAlias original
         this.currentAlias = newVal || this.userAlias;
         this.originalAlias = this.currentAlias;
       }
     },

     customDisplayName: {
       immediate: true,
       handler(newVal) {
         // Se não há nome de exibição customizado, usa o userAlias original
         this.displayName = newVal || this.userAlias;
         this.originalDisplayName = this.displayName;
       }
     },

     userAlias: {
       immediate: true,
       handler(newVal) {
         // Quando o userAlias muda, atualiza os valores se não há customização
         if (!this.customAlias) {
           this.currentAlias = newVal;
           this.originalAlias = newVal;
         }
         if (!this.customDisplayName) {
           this.displayName = newVal;
           this.originalDisplayName = newVal;
         }
       }
     }
   },

  created() {
    this.debouncerAlias = new Debounce(this.validateAlias, 500);
  },

  methods: {
    handleDisplayNameChange() {
      this.$emit('change', this.formData);
    },

    handleAliasChange(value) {
      // Formatar o valor para URL amigável
      const formattedValue = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

      this.currentAlias = formattedValue;
      
      // Validar o alias se não estiver vazio
      if (this.currentAlias && this.currentAlias.length > 0) {
        this.debouncerAlias.execute();
      } else {
        this.setAliasValidation(null, '');
      }

      this.$emit('change', this.formData);
    },

    async validateAlias() {
       try {
         const alias = this.currentAlias;

         if (!alias || alias.length === 0) {
           this.setAliasValidation(null, '');
           return;
         }

         const response = await this.$store.dispatch('userDocuments/validateUserAlias', {
           alias,
           currentUserId: this.currentUserId
         });
         this.setAliasValidation(response.is_valid, response.alias);
       } catch (error) {
         console.error('Erro ao validar alias:', error);
         this.setAliasValidation(false, this.currentAlias);
       }
     },

    setAliasValidation(isValid, alias) {
      this.$set(this.aliasValidation, 'isValid', isValid);
      this.$set(this.aliasValidation, 'alias', alias);

      this.$emit('alias-validation', this.aliasValidation);
    },

    // Método para validar o formulário
    validate() {
      const errors = [];

      // Validar nome de exibição
      if (!this.displayName || this.displayName.trim().length === 0) {
        errors.push('Nome de exibição é obrigatório');
      } else if (this.displayName.length > 60) {
        errors.push('Nome de exibição deve ter no máximo 60 caracteres');
      }

      // Validar alias
      if (!this.currentAlias || this.currentAlias.trim().length === 0) {
        errors.push('Identificador da URL é obrigatório');
      } else if (this.currentAlias.length > 60) {
        errors.push('Identificador da URL deve ter no máximo 60 caracteres');
      } else if (!/^[a-z0-9-]+$/.test(this.currentAlias)) {
        errors.push('Identificador da URL deve conter apenas letras minúsculas, números e hífens');
      } else if (this.aliasValidation.isValid === false) {
        errors.push('Este identificador de URL já está em uso');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Método para verificar se houve mudanças
    hasChanges() {
      return this.displayName !== this.originalDisplayName || 
             this.currentAlias !== this.originalAlias;
    },

    // Método para resetar os valores originais
    reset() {
      this.displayName = this.originalDisplayName;
      this.currentAlias = this.originalAlias;
      this.setAliasValidation(null, '');
      this.$emit('change', this.formData);
    }
  }
};
</script>

<style scoped>
.user-alias-form {
  width: 100%;
}
</style> 