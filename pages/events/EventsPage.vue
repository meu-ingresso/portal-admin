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

      <RequiredUserDocModal
        :show-document-dialog="showDocumentDialog"
        :has-document-info="hasDocumentInfo"
        @saved-user-data="handleSavedUserData"
        @close-document-dialog="closeDocumentDialog"
      />
      <Toast />
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

    userId() {
      return this.$cookies.get('user_id');
    },

    userRole() {
      return this.$cookies.get('user_role');
    },

    events() {
      return event.$eventList.sort((a, b) => {
        if (a.status.name === 'Publicado' && b.status.name !== 'Publicado') {
          return -1;
        } else if (a.status.name !== 'Publicado' && b.status.name === 'Publicado') {
          return 1;
        }
        return 0;
      }) || [];
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

    hasDocumentInfo() {
      return userDocuments.$documentInfo;
    },
    
    hasRequiredIdentityDocs() {
      return userDocuments.$hasRequiredDocuments;
    },

    hasBankInfo() {
      return userDocuments.$hasBankInfo;
    },

    hasRequiredDocsAndBankInfo() {
      return this.hasRequiredIdentityDocs && this.hasBankInfo;
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
          sortBy: ['start_date'],
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
          sortBy: ['start_date'],
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
          sortBy: ['start_date'],
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
          sortBy: ['start_date'],
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
      try {
        if (this.userId) {

          // Verifica se o usuário é dono de algum evento
          const events = await event.fetchEventsByPromoterId({ promoterId: this.userId, preloads: ['status'] });
          if (events) {

            // Verifica se possui eventos com status Aguardando
            // const hasWaitingEvents = events.some(event => event?.status?.name === 'Aguardando');

            const { hasRequiredDocuments, hasPixInfo } = await userDocuments.fetchDocumentStatus(this.userId);

            if (!hasRequiredDocuments || !hasPixInfo) {
              this.showDocumentDialog = true;
            }
            
          }

        } else {
          console.warn('Usuário não encontrado para verificar status de documentação');
        }
      } catch (error) {
        console.error('Erro ao verificar status de documentação:', error);
        toast.setToast({
          text: 'Não foi possível verificar seu status de documentação',
          type: 'danger',
          time: 5000,
        });
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

    handleSavedUserData() {
      // Atualiza os dados dos eventos pois foram alterados os status de "Aguardando" para "Em análise"
      this.getData();
      this.showDocumentDialog = false;
      toast.setToast({
        text: 'Informações salvas com sucesso!',
        type: 'success',
        time: 5000,
      });
    },

  },
};
</script>
