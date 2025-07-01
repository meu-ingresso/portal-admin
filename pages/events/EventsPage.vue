<template>
  <div>
    <EventsTemplate :groups="groups" :show-sessions-indicator="true" :pagination-meta="paginationMeta"
      @update-search="handleSearchEvents" @update-filter="handleFilterChange" @load-more="handleLoadMore" />

    <RequiredUserDocModal :show-document-dialog="showDocumentDialog" :has-document-info="hasDocumentInfo"
      @saved-user-data="handleSavedUserData" @close-document-dialog="closeDocumentDialog" />
    <Toast />
  </div>
</template>

<script>
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
      return this.$store.state.auth.user?.id;
    },

    isAdmin() {
      return this.$store.state.auth.user?.role?.name === 'Admin';
    },

    groups() {
      const eventGroups = this.$store.getters['event/$eventList'] || [];

      // Processa cada grupo para extrair o evento representative
      const processedEvents = eventGroups.map(group => {
        // Usa o primeiro evento como representative
        const representativeEvent = group.events && group.events.length > 0 ? group.events[0] : null;

        if (!representativeEvent) {
          return null; // Grupo sem eventos válidos
        }

        // Calcula totalizadores consolidados e range de datas
        const consolidatedData = this.calculateConsolidatedData(group.events);

        // Cria um evento processado com informações do grupo
        return {
          ...representativeEvent,
          // Adiciona informações sobre múltiplas sessões
          hasSessions: group.events.length > 1,
          sessionsCount: group.events.length,
          sessionIds: group.events.map(event => event.id),
          // Mantém referência ao grupo original
          groupId: group.id,
          groupName: group.name,
          groupCreatedAt: group.created_at,
          // Sobrescreve os totalizadores com valores consolidados
          totalizers: consolidatedData.totalizers,
          // Adiciona informações de range de datas
          dateRange: consolidatedData.dateRange,
          // Para eventos multi-sessão, usar range de datas
          displayDate: consolidatedData.displayDate
        };
      }).filter(event => event !== null); // Remove grupos sem eventos válidos

      // Ordena os eventos processados
      return processedEvents.sort((a, b) => {
        // Ordena baseado no status do evento representative
        const statusA = a.status?.name;
        const statusB = b.status?.name;

        if (statusA === 'Publicado' && statusB !== 'Publicado') {
          return -1;
        } else if (statusA !== 'Publicado' && statusB === 'Publicado') {
          return 1;
        }

        // Se ambos têm o mesmo status, ordena por data de criação do grupo (mais recente primeiro)
        if (a.groupCreatedAt && b.groupCreatedAt) {
          return new Date(b.groupCreatedAt) - new Date(a.groupCreatedAt);
        }

        // Fallback: ordena por data de criação do evento
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }

        return 0;
      });
    },

    paginationMeta() {
      return this.$store.getters['event/$paginationMeta'] || {
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
      return this.$store.getters['userDocuments/$documentInfo'];
    },

    hasRequiredDocuments() {
      return this.$store.getters['userDocuments/$hasRequiredDocuments'];
    },

    hasPixInfo() {
      return this.$store.getters['userDocuments/$hasPixInfo'];
    },

    hasFiscalInfo() {
      return this.$store.getters['userDocuments/$hasFiscalInfo'];
    },

    hasRejectionReason() {
      return this.$store.getters['userDocuments/$hasRejectionReason'];
    },
  },

  async mounted() {
    await this.getData();

    const promises = [
      this.checkDocumentStatus(),
      this.getStatuses(),
    ];

    await Promise.all(promises);
  },

  methods: {

    calculateConsolidatedData(events) {
      if (!events || events.length === 0) {
        return {
          totalizers: {
            totalSales: 0,
            totalSalesToday: 0,
            totalSalesAmount: 0,
            totalSalesAmountToday: 0,
            totalViews: 0
          },
          dateRange: null,
          displayDate: null
        };
      }

      // Para evento único, retorna os dados originais
      if (events.length === 1) {
        const event = events[0];
        return {
          totalizers: event.totalizers || {
            totalSales: 0,
            totalSalesToday: 0,
            totalSalesAmount: 0,
            totalSalesAmountToday: 0,
            totalViews: 0
          },
          dateRange: {
            startDate: event.start_date,
            endDate: event.end_date
          },
          displayDate: event.start_date
        };
      }

      // Para múltiplos eventos, consolida os dados
      const consolidatedTotalizers = events.reduce((acc, event) => {
        const eventTotalizers = event.totalizers || {};
        return {
          totalSales: acc.totalSales + (eventTotalizers.totalSales || 0),
          totalSalesToday: acc.totalSalesToday + (eventTotalizers.totalSalesToday || 0),
          totalSalesAmount: acc.totalSalesAmount + (eventTotalizers.totalSalesAmount || 0),
          totalSalesAmountToday: acc.totalSalesAmountToday + (eventTotalizers.totalSalesAmountToday || 0),
          totalViews: acc.totalViews + (eventTotalizers.totalViews || 0)
        };
      }, {
        totalSales: 0,
        totalSalesToday: 0,
        totalSalesAmount: 0,
        totalSalesAmountToday: 0,
        totalViews: 0
      });

      // Calcular range de datas de todos os eventos do grupo
      const startDates = events.map(e => new Date(e.start_date));
      const endDates = events.map(e => new Date(e.end_date));

      const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
      const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));

      return {
        totalizers: consolidatedTotalizers,
        dateRange: {
          startDate: earliestStart.toISOString(),
          endDate: latestEnd.toISOString(),
          isMultiSession: true
        },
        displayDate: earliestStart.toISOString() // Data mais próxima para exibição padrão
      };
    },

    async getStatuses() {
      try {
        await this.$store.dispatch('status/fetchStatusByModule', 'event');
      } catch (error) {
        console.error('Erro ao carregar lista de status de eventos', error);
      }
    },

    async getData() {
      try {
        const { meta } = await this.$store.dispatch('event/fetchEvents', {
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
        await this.$store.dispatch('event/fetchEvents', {
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
        await this.$store.dispatch('event/fetchEvents', {
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
        await this.$store.dispatch('event/fetchEvents', {
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

    async checkDocumentStatus() {
      try {
        if (this.userId) {

          // Verifica se o usuário é dono de algum evento
          const hasEvents = await this.$store.dispatch('event/fetchEventsByPromoterId', { promoterId: this.userId, preloads: ['status'] });
          if (hasEvents) {
            await this.$store.dispatch('userDocuments/fetchDocumentStatus', this.userId);
          }

          setTimeout(() => {
            if ((!this.hasRequiredDocuments || !this.hasPixInfo || !this.hasFiscalInfo || this.hasRejectionReason) && !this.isAdmin) {
              this.showDocumentDialog = true;
            }
          }, 1000);

        } else {
          console.warn('Usuário não encontrado para verificar status de documentação');
        }
      } catch (error) {
        console.error('Erro ao verificar status de documentação:', error);
        this.$store.dispatch('toast/setToast', {
          text: 'Não foi possível verificar seu status de documentação',
          type: 'danger',
          time: 5000,
        });
      }
    },

    closeDocumentDialog() {
      this.showDocumentDialog = false;
      this.$store.dispatch('toast/setToast', {
        text: 'Você pode completar seu cadastro a qualquer momento pelo menu de perfil.',
        type: 'info',
        time: 5000,
      });
    },

    handleSavedUserData() {
      // Atualiza os dados dos eventos pois foram alterados os status de "Aguardando" para "Em análise"
      this.getData();
      this.showDocumentDialog = false;
      this.$store.dispatch('toast/setToast', {
        text: 'Informações salvas com sucesso!',
        type: 'success',
        time: 5000,
      });
    },

  },
};
</script>
