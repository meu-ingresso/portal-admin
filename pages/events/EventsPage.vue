<template>
    <div>
      <EventsTemplate
        :events="events"
        :grouped-events="groupedEvents"
        :show-sessions-indicator="true"
        :pagination-meta="paginationMeta"
        @update-search="handleSearchEvents"
        @update-filter="handleFilterChange"
        @load-more="handleLoadMore" />

      <!-- Document completion dialog -->
      <v-dialog v-model="showDocumentDialog" persistent max-width="600">
        <v-card>
          <v-card-title class="headline primary white--text">
            Quase lá! Só falta +1 passo para começar a vender!
          </v-card-title>
          <v-card-text class="pt-4">
            <p>Para que possamos processar seu pagamento e transferir os valores das vendas, precisamos das seguintes informações:</p>
            
            <div v-if="userDocuments.personType === 'PJ'" class="mt-4">
              <p><strong>Documento necessário:</strong> Cartão CNPJ ou Contrato Social</p>
            </div>
            <div v-else class="mt-4">
              <p><strong>Documento necessário:</strong> CNH, Passaporte ou RG</p>
            </div>

            <div class="mt-4">
              <p><strong>Dados bancários:</strong></p>
              <ul>
                <li>Banco</li>
                <li>Agência</li>
                <li>Conta</li>
                <li>CPF/CNPJ do titular</li>
                <li>Chave PIX</li>
              </ul>
            </div>
          </v-card-text>
          <v-card-actions class="pb-4 px-4">
            <v-spacer></v-spacer>
            <DefaultButton 
              text="Completar depois" 
              outlined
              @click="closeDocumentDialog" 
            />
            <DefaultButton 
              text="Completar agora" 
              @click="goToCompleteCadastro" 
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
</template>

<script>
import { event, toast, userDocuments } from '@/store';
import { groupEventsBySession, logEventGroupingDiagnostics } from '~/utils/event-utils';

export default {
  data() {
    return {
      diagnosticRun: false,
      currentFilter: 'Todos',
      currentSearch: '',
      currentPage: 1,
      showDocumentDialog: false,
    };
  },

  computed: {
    events() {
      return event.$eventList || [];
    },
    groupedEvents() {
      return groupEventsBySession(this.events);
    },

    paginationMeta() {
      return event.$paginationMeta || {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      };
    },
    hasMorePages() {
      return this.paginationMeta.current_page < this.paginationMeta.last_page;
    },
    
    userDocuments() {
      return userDocuments.$documentInfo;
    },
  },

  async mounted() {
    await this.getData();
    
    if (process.env.NODE_ENV === 'development' && !this.diagnosticRun) {
      this.logGroupedEvents();
      this.diagnosticRun = true;
    }

    // Check if we should show the document dialog
    await this.checkDocumentStatus();
  },

  methods: {
    async getData() {
      try {
        const { meta } = await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
        this.currentPage = meta.current_page;
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    async handleSearchEvents(search) {
      try {
        this.currentSearch = search;
        this.currentPage = 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    async handleFilterChange(filter) {
      try {
        this.currentFilter = filter.name;
        this.currentPage = 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search: this.currentSearch,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
        });
      } catch (error) {
        console.error('Erro ao filtrar eventos:', error);
      }
    },

    async handleLoadMore() {
      if (!this.hasMorePages) return;
      
      try {
        this.currentPage += 1;
        await event.fetchEvents({
          page: this.currentPage,
          sortBy: ['name'],
          sortDesc: [false],
          search: this.currentSearch,
          status: this.currentFilter !== 'Todos' ? this.currentFilter : undefined,
          append: true,
        });
      } catch (error) {
        console.error('Erro ao carregar mais eventos:', error);
        this.currentPage -= 1;
      }
    },

    /**
     * Método para depuração que mostra no console informações sobre
     * o agrupamento de eventos/sessões
     */
    logGroupedEvents() {
      logEventGroupingDiagnostics(this.events, this.groupedEvents, 'Página de Eventos');
    },

    async checkDocumentStatus() {
      // Check if the flag was set in localStorage from EventStepper.vue
      const showDocumentDialog = localStorage.getItem('showDocumentDialog') === 'true';
      
      if (showDocumentDialog) {
        try {
          // Get user document status
          await userDocuments.fetchDocumentStatus();
          
          // Only show dialog if documents haven't been submitted
          if (!this.userDocuments.hasSubmittedDocuments) {
            this.showDocumentDialog = true;
          }
        } catch (error) {
          console.error('Error checking document status:', error);
        } finally {
          // Clear the flag regardless of the result
          localStorage.removeItem('showDocumentDialog');
        }
      }
    },

    closeDocumentDialog() {
      this.showDocumentDialog = false;
      toast.setToast({
        text: 'Você pode completar seu cadastro a qualquer momento pelo menu de perfil.',
        type: 'info',
        time: 5000,
      });
    },

    goToCompleteCadastro() {
      this.showDocumentDialog = false;
      this.$router.push({ name: 'CompletarCadastro' });
    },
  },
};
</script>
