<template>
  <v-text-field ref="textField" :value="displayValue" :label="label" :placeholder="placeholder" :outlined="outlined"
    :dense="dense" :disabled="disabled" :readonly="readonly" :required="required" :rules="computedRules"
    :hide-details="hideDetails" :error-messages="errorMessages" prefix="R$" v-bind="$attrs" v-on="$listeners"
    @input="onInput" @blur="onBlur" @focus="onFocus" @keypress="onKeyPress" />
</template>

<script>
export default {
  name: 'AMoneyInput',

  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: 'Valor'
    },
    placeholder: {
      type: String,
      default: '3,00'
    },
    minValue: {
      type: Number,
      default: 0
    },
    maxValue: {
      type: Number,
      default: null
    },
    outlined: {
      type: Boolean,
      default: true
    },
    dense: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    },
    hideDetails: {
      type: [Boolean, String],
      default: 'auto'
    },
    errorMessages: {
      type: [String, Array],
      default: () => []
    }
  },

  data() {
    return {
      internalValue: '',
      isFocused: false,
      originalValueOnFocus: ''
    };
  },

  computed: {
    displayValue() {
      if (this.isFocused) {
        // Durante a edição, mostra o valor sem formatação para facilitar digitação
        return this.internalValue;
      }

      // Quando não focado, mostra o valor formatado
      // Se o valor interno estiver vazio e o valor numérico for 0, mostra valor formatado
      if (!this.internalValue.trim()) {
        const numericValue = this.numericValue;
        if (numericValue === 0) {
          return this.formatCurrency(0);
        }
        return '';
      }

      return this.formatDisplayValue(this.internalValue);
    },

    numericValue() {
      if (!this.internalValue) return 0;

      // Converte string formatada para número
      const cleanValue = this.internalValue.replace(/[^\d,]/g, '');
      return parseFloat(cleanValue.replace(',', '.')) || 0;
    },

    computedRules() {
      const rules = [...this.rules];

      // Adiciona validações automáticas
      if (this.required) {
        rules.unshift((v) => {
          const numValue = this.parseValue(v);
          return numValue > 0 || 'Este campo é obrigatório.';
        });
      }

      if (this.minValue !== null && this.minValue !== undefined) {
        rules.push((v) => {
          const numValue = this.parseValue(v);
          return numValue >= this.minValue || `O valor deve ser maior ou igual a R$ ${this.formatCurrency(this.minValue)}.`;
        });
      }

      if (this.maxValue !== null && this.maxValue !== undefined) {
        rules.push((v) => {
          const numValue = this.parseValue(v);
          return numValue <= this.maxValue || `O valor deve ser menor ou igual a R$ ${this.formatCurrency(this.maxValue)}.`;
        });
      }

      return rules;
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.internalValue = this.formatInputValue(newValue);
      }
    }
  },

  methods: {
    onInput(value) {
      // Remove caracteres não numéricos exceto vírgula
      let cleanValue = value.replace(/[^\d,]/g, '');

      // Impede múltiplas vírgulas
      const commaIndex = cleanValue.indexOf(',');
      if (commaIndex !== -1) {
        cleanValue = cleanValue.substring(0, commaIndex + 1) + cleanValue.substring(commaIndex + 1).replace(/,/g, '');
      }

      // Limita a 2 casas decimais apenas se houver mais de 2 dígitos após a vírgula
      if (cleanValue.includes(',')) {
        const parts = cleanValue.split(',');
        if (parts[1] && parts[1].length > 2) {
          cleanValue = parts[0] + ',' + parts[1].substring(0, 2);
        }
      }

      // Atualiza valor interno sem formatação automática
      this.internalValue = cleanValue;

      // Emite o valor numérico para o componente pai
      this.emitValue();
    },

    onKeyPress(event) {
      const char = String.fromCharCode(event.charCode || event.keyCode);

      // Permite apenas números e vírgula
      if (!/[0-9,]/.test(char)) {
        event.preventDefault();
        return;
      }

      // Impede múltiplas vírgulas
      if (char === ',' && this.internalValue.includes(',')) {
        event.preventDefault();
      }
    },

    onFocus() {
      this.isFocused = true;

      // Salva o valor original para possível restauração
      this.originalValueOnFocus = this.internalValue;

      // Se o valor atual for 0,00, limpa o campo para facilitar a digitação
      if (this.numericValue === 0) {
        this.internalValue = '';
      }

      this.$emit('focus');
    },

    onBlur() {
      this.isFocused = false;

      // Se o campo estiver vazio e o valor original era 0, restaura para 0
      if (!this.internalValue.trim() && this.parseValue(this.originalValueOnFocus) === 0) {
        this.internalValue = this.formatInputValue(0);
        this.emitValue();
      } else if (this.internalValue.trim()) {
        // Se tem conteúdo, apenas formata para exibição (não força casas decimais)
        const numericValue = this.numericValue;
        if (numericValue > 0) {
          this.internalValue = this.formatInputValue(numericValue);
          this.emitValue();
        }
      } else if (!this.internalValue.trim()) {
        // Se está vazio mas o valor original não era 0, mantém vazio
        this.internalValue = '';
        this.emitValue();
      }

      this.$emit('blur');
    },

    emitValue() {
      // Emite o valor numérico para o componente pai
      const valueToEmit = this.internalValue.trim() ? this.numericValue : 0;
      this.$emit('input', valueToEmit);
      this.$emit('change', valueToEmit);
    },

    formatInputValue(value) {
      if (!value && value !== 0) return '';

      if (typeof value === 'number') {
        // Se é um número inteiro, não força casas decimais
        if (Number.isInteger(value)) {
          return value.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          });
        }

        // Se tem decimais, formata com as casas necessárias
        return value.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      }

      // Se é string, tenta converter para número primeiro
      if (typeof value === 'string') {
        // Remove espaços e verifica se é um número em formato americano (ex: "10.50")
        const cleanValue = value.trim();

        // Se contém apenas números e um ponto, é formato americano
        if (/^\d+(\.\d{1,2})?$/.test(cleanValue)) {
          const numericValue = parseFloat(cleanValue);

          // Se é inteiro, não força casas decimais
          if (Number.isInteger(numericValue)) {
            return numericValue.toLocaleString('pt-BR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            });
          }

          return numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          });
        }

        // Se já está em formato brasileiro, retorna como está
        return cleanValue;
      }

      return value.toString();
    },

    formatDisplayValue(value) {
      if (!value) return '';

      // Se já está formatado, retorna como está
      if (typeof value === 'string' && value.includes(',')) {
        return value;
      }

      // Formata o valor
      const numValue = this.parseValue(value);
      return this.formatCurrency(numValue);
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '';

      // Se é inteiro, não força casas decimais desnecessárias  
      if (Number.isInteger(value)) {
        return value.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      }

      return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    },

    parseValue(value) {
      if (!value && value !== 0) return 0;

      if (typeof value === 'number') return value;

      const stringValue = value.toString().trim();

      // Detecta formato americano (ex: "10.50")
      if (/^\d+(\.\d{1,2})?$/.test(stringValue)) {
        return parseFloat(stringValue) || 0;
      }

      // Detecta formato brasileiro (ex: "10,50" ou "1.234,56")
      if (stringValue.includes(',')) {
        // Remove pontos (separadores de milhares) e converte vírgula para ponto
        const cleanValue = stringValue.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleanValue) || 0;
      }

      // Remove tudo exceto números e vírgula (fallback)
      const cleanValue = stringValue.replace(/[^\d,]/g, '');
      return parseFloat(cleanValue.replace(',', '.')) || 0;
    },

    // Método público para validação
    validate() {
      return this.$refs.textField?.validate() || true;
    },

    // Método público para limpar validação
    resetValidation() {
      this.$refs.textField?.resetValidation();
    }
  }
};
</script>

<style scoped>
/* Estilos específicos podem ser adicionados aqui se necessário */
</style>