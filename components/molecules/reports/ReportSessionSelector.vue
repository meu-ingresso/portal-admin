<template>
  <div v-if="sessions.length > 1" class="report-session-selector">
    <v-autocomplete
      ref="autocomplete"
      v-model="selectedSession"
      :items="sessions"
      item-text="formattedDate"
      item-value="id"
      :label="label"
      placeholder="Pesquise por data ou horário"
      dense
      outlined
      hide-details
      auto-select-first
      return-object
      background-color="transparent"
      class="session-select"
      :search-input.sync="search"
      :filter="customFilter"
      :menu-props="{ maxHeight: 200, closeOnClick: true, closeOnContentClick: true }"
      @change="handleSessionChange"
      @focus="handleSearchFocus"
      @click:prepend-inner="handleSearchFocus"
      @blur="handleBlur"
      @update:search-input="handleSearchUpdate"
      @keydown.esc="handleEscKey"
    >
      <template #selection="{ item }">
        <div class="d-flex align-center">
          <v-icon small class="mr-2">mdi-calendar</v-icon>
          <span :class="{'font-weight-bold': item.isCurrentSession}">{{ getDisplayDate(item) }}</span>
          <v-chip v-if="item.isCurrentSession" x-small color="primary" class="ml-2" label>Atual</v-chip>
        </div>
      </template>
      <template #item="{ item }">
        <v-list-item-content>
          <v-list-item-title :class="{'primary--text': item.isCurrentSession}">
            <div class="d-flex align-center">
              <v-icon small class="mr-2" :color="item.isCurrentSession ? 'primary' : undefined">mdi-calendar</v-icon>
              <span>{{ getDisplayDate(item) }}</span>
              <v-chip v-if="item.isCurrentSession" x-small color="primary" class="ml-2" label>Atual</v-chip>
            </div>
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.status === 2" class="caption text-caption">
            <v-icon x-small color="warning" class="mr-1">mdi-clock-alert</v-icon>
            Vendas encerradas
          </v-list-item-subtitle>
        </v-list-item-content>
      </template>
      <template #no-data>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              Nenhuma sessão encontrada
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { formatDateToCustomString, formatHourToBr } from '@/utils/formatters';

export default {
  props: {
    /**
     * Label personalizado (opcional)
     */
    label: {
      type: String,
      default: 'Datas'
    },
    
    /**
     * Limite de caracteres para o nome do evento em dispositivos móveis
     */
    mobileCharLimit: {
      type: Number,
      default: 25
    },
    
    /**
     * Evento selecionado atualmente
     */
    selectedEvent: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      selectedSession: null,
      search: null,
      isSearchActive: false,
      originalSession: null,
      hasNewSelection: false,
      previousEventId: null,
    };
  },

  computed: {
    currentEvent() {
      return this.selectedEvent || this.$store.getters['eventGeneralInfo/$info'];
    },

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    currentSession() {
      return this.sessions.find(session => session.id === this.currentEvent.id) || null;
    },

    sessions() {
      if (!this.currentEvent?.groups?.[0]?.id) return [];

      const currentGroupId = this.currentEvent.groups[0].id;
      
      return this.$store.getters['eventGeneralInfo/$eventList']
        .filter(event => 
          event.groups?.length && 
          event.groups[0].id === currentGroupId
        )
        .map(event => {
          const dateStr = formatDateToCustomString(event.start_date);
          const timeStr = formatHourToBr(event.start_date);
          const formattedDate = `${dateStr} - ${timeStr}`;
          
          // Versão truncada para mobile
          let mobileFormattedDate = formattedDate;
          if (formattedDate.length > this.mobileCharLimit) {
            mobileFormattedDate = formattedDate.substring(0, this.mobileCharLimit) + '...';
          }
          
          return {
            id: event.id,
            date: event.start_date,
            formattedDate,
            mobileFormattedDate,
            status: event.status_id,
            isCurrentSession: event.id === this.currentEvent.id,
            searchableText: `${dateStr} ${timeStr}`
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  },

  watch: {
    currentEvent: {
      immediate: true,
      handler(newEvent) {
        if (newEvent?.id) {
          // Verificar se o evento principal mudou
          const eventGroupId = newEvent.groups?.[0]?.id;
          const prevEventGroupId = this.previousEventId && 
                                 this.getEventById(this.previousEventId)?.groups?.[0]?.id;
          
          const groupChanged = eventGroupId !== prevEventGroupId;
          
          if (groupChanged || !this.selectedSession) {
            // Se o grupo mudou ou é a primeira seleção, atualiza a sessão selecionada
            this.selectedSession = this.sessions.find(session => session.id === newEvent.id) || null;
            this.originalSession = this.selectedSession;
            this.search = null;
            this.isSearchActive = false;
            this.hasNewSelection = false;
          }
          
          this.previousEventId = newEvent.id;
        }
      },
    },
  },

  mounted() {
    // Garantir que temos uma seleção inicial
    this.$nextTick(() => {
      if (this.currentSession && !this.selectedSession) {
        this.selectedSession = this.currentSession;
        this.originalSession = this.currentSession;
        this.previousEventId = this.currentEvent?.id;
      }
    });

    // Adicionar listeners globais para detectar cliques fora
    document.addEventListener('click', this.handleDocumentClick);
  },

  beforeDestroy() {
    // Remover listeners globais
    document.removeEventListener('click', this.handleDocumentClick);
  },

  methods: {
    getEventById(id) {
      return this.$store.getters['eventGeneralInfo/$eventList'].find(event => event.id === id);
    },
    
    customFilter(item, queryText, _itemText) {
      if (queryText === null || queryText === '') return true;
      
      const searchText = queryText.toString().toLowerCase();
      const dateText = item.searchableText.toLowerCase();
      
      return dateText.includes(searchText);
    },
    
    handleSearchFocus() {
      // Armazenar a sessão atual antes de começar a pesquisa
      if (!this.isSearchActive) {
        this.originalSession = this.selectedSession;
        
        // Limpar o campo de pesquisa para facilitar a digitação
        this.$nextTick(() => {
          this.search = '';
          this.isSearchActive = true;
        });
      }
    },
    
    handleBlur() {
      // Verificar se o campo perdeu o foco sem seleção
      this.$nextTick(() => {
        // Pequeno timeout para permitir que o clique em um item do menu seja processado primeiro
        setTimeout(() => {
          if (this.isSearchActive && !this.hasNewSelection) {
            this.resetToOriginalSession();
            this.isSearchActive = false;
          }
        }, 200);
      });
    },
    
    handleSessionChange(selectedSession) {
      if (selectedSession && selectedSession.id !== this.currentEvent.id) {
        // Marcar que temos uma nova seleção
        this.hasNewSelection = true;
        
        // Atualizar a sessão original
        this.originalSession = selectedSession;
        this.previousEventId = selectedSession.id;
        
        // Emitir evento de mudança de sessão
        this.$emit('session-change', selectedSession.id);
        
        // Navegar para a nova sessão (apenas se realmente for necessário)
        if (this.$route.name && !this.$route.name.includes('reports')) {
          this.$router.push({
            name: this.$route.name,
            params: { ...this.$route.params, id: selectedSession.id },
          });
        }
        
        // Redefinir o estado de pesquisa
        this.isSearchActive = false;
      }
    },
    
    resetToOriginalSession() {
      // Restaurar a sessão original
      this.selectedSession = this.originalSession || this.currentSession;
      this.search = null;
      this.hasNewSelection = false;
    },
    
    getDisplayDate(item) {
      return this.isMobile ? item.mobileFormattedDate : item.formattedDate;
    },
    
    handleSearchUpdate(searchText) {
      // Quando o usuário digitar algo no campo
      if (searchText !== null && searchText !== '') {
        this.isSearchActive = true;
      }
    },
    
    handleEscKey() {
      // Quando o usuário pressionar ESC
      this.resetToOriginalSession();
      this.isSearchActive = false;
      
      // Importante: focar outro elemento para garantir que o campo perca o foco
      this.$nextTick(() => {
        document.activeElement.blur();
      });
    },

    handleDocumentClick(event) {
      // Verificar se o clique foi fora do componente
      if (this.$el && !this.$el.contains(event.target) && this.isSearchActive) {
        this.$nextTick(() => {
          this.resetToOriginalSession();
          this.isSearchActive = false;
        });
      }
    },
  },
};
</script>

<style scoped>

.session-select {
  max-width: 350px;
}

:deep(.v-input__slot) {
  background-color: transparent !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease;
  min-height: 32px !important;
  padding: 0 10px !important;
}

:deep(.v-input--is-focused .v-input__slot) {
  border-color: var(--v-primary-base) !important;
  box-shadow: 0 0 0 1px rgba(var(--v-primary-base), 0.2);
}

:deep(.v-text-field__slot input) {
  font-size: 12px;
  transition: all 0.2s ease;
  padding: 0 !important; 
}

:deep(.v-select__selection) {
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.v-list-item--active) {
  background-color: rgba(var(--v-primary-base), 0.1) !important;
}

/* Estilo para o item ativo no dropdown */
:deep(.v-list-item--active .v-list-item__content) {
  font-weight: 500;
}

/* Efeito hover mais suave nos itens do dropdown */
:deep(.v-list-item:hover) {
  background-color: rgba(var(--v-primary-base), 0.05) !important;
}

@media (max-width: 600px) {
  .session-select {
    max-width: 100%;
  }
}
</style> 