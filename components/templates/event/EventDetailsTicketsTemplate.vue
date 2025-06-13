<template>
  <div class="event-details-wrapper">

    <CategoryTicketsStats ref="categoryStats" />

    <template v-if="getTickets?.length === 0">
      <EmptyState title="Ainda não há ingressos" subtitle="Uma vez criados, seus ingressos aparecerão aqui"
        icon="mdi-ticket">
        <template #action>
          <DefaultButton text="Adicionar ingresso" icon="mdi-plus" class="mt-6" @click="openAddTicketModal" />
        </template>
      </EmptyState>
    </template>

    <template v-else>
      <StatisticList :statistics="getCurrentStatistics" :title="getStatisticsTitle" />
      <div class="d-flex justify-space-between align-center">
        <div class="template-title">Lista de ingressos</div>
        <SplitButton text="Adicionar" :items="[
          { text: 'Nova categoria', action: 'new-category' }
        ]" @click="openAddTicketModal" @item-click="handleSplitButtonActions" />
      </div>

      <div class="mt-6">
        <FilterButtons :filters="getFilterList" :selected="selectedFilter" @filter-selected="handleFilterChange" />
      </div>

      <v-tabs-items v-model="selectedCategoryTab" class="bg-transparent">
        <!-- Tab: Todos os ingressos -->
        <v-tab-item key="all">
          <EventTickets :event-id="getEvent.id" title="Lista de ingressos" :disable-title="true"
            :disable-add-ticket="true" />
        </v-tab-item>

        <!-- Tab: Ingressos sem categoria -->
        <v-tab-item key="uncategorized">
          <EventTickets v-if="getUncategorizedTickets.length > 0" :event-id="getEvent.id"
            :custom-tickets="getUncategorizedTickets" :disable-title="true" :disable-add-ticket="true"
            :disable-hover="true" />
          <EmptyState v-else title="Sem ingressos nesta categoria"
            subtitle="Todos os ingressos possuem categoria atribuída" icon="mdi-ticket" class="mt-4" />
        </v-tab-item>

        <!-- Tabs: Para cada categoria -->
        <v-tab-item v-for="category in getTicketCategories" :key="category.value">
          <EventTickets v-if="getTicketsByCategory(category.value).length > 0" :event-id="getEvent.id"
            :custom-tickets="getTicketsByCategory(category.value)" :disable-title="true" :disable-add-ticket="true"
            :disable-hover="true" />
          <EmptyState v-else title="Sem ingressos nesta categoria"
            subtitle="Adicione ingressos ou atribua existentes a esta categoria" icon="mdi-ticket" class="mt-4" />
        </v-tab-item>
      </v-tabs-items>

      <!-- Modal de nova categoria -->
      <v-dialog v-model="showAddCategoryDialog" max-width="500px" persistent :fullscreen="isMobile">
        <v-card :tile="isMobile">
          <v-card-title class="d-flex justify-space-between align-center">
            <h3>Nova categoria</h3>
            <v-btn icon @click="showAddCategoryDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="categoryForm" v-model="isCategoryFormValid">
              <v-text-field v-model="newCategoryName" label="Nome da categoria" placeholder="Ex: VIP, Pista, Camarote"
                :rules="categoryRules" outlined dense />
            </v-form>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-between py-4 px-4">
            <DefaultButton outlined text="Cancelar" @click="showAddCategoryDialog = false" />
            <DefaultButton text="Adicionar" :disabled="!isCategoryFormValid || !newCategoryName"
              @click="addNewCategory" />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <!-- Modal de adição de ingresso -->
    <v-dialog v-model="showAddDialog" max-width="900px" persistent :fullscreen="isMobile">
      <v-card :tile="isMobile">
        <v-card-title class="d-flex justify-space-between align-center">
          <h3>Adicionar ingresso</h3>
          <v-btn icon :disabled="isAddingTicket" @click="handleCloseAddDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-4">
          <TicketForm v-if="showAddDialog" ref="ticketForm" :nomenclature="'Ingresso'" :event-id="getEvent.id" />
        </v-card-text>

        <v-card-actions class="d-flex align-center justify-space-between py-4 px-4">
          <DefaultButton outlined text="Cancelar" :disabled="isAddingTicket" @click="handleCloseAddDialog" />

          <DefaultButton text="Salvar" :is-loading="isAddingTicket" :disabled="isAddingTicket" @click="submitAdd" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { isMobileDevice } from '@/utils/utils';

export default {
  data() {
    return {
      showAddDialog: false,
      isAddingTicket: false,
      selectedCategoryTab: 0,
      showAddCategoryDialog: false,
      isCategoryFormValid: true,
      newCategoryName: '',
      categoryRules: [
        v => !!v || 'O nome da categoria é obrigatório',
        v => v.length <= 50 || 'O nome da categoria deve ter no máximo 50 caracteres',
        v => {
          if (!v) return true;
          const categoryExists = this.getTicketCategories?.some(
            category => category.text.toLowerCase() === v.toLowerCase()
          );
          return !categoryExists || 'Esta categoria já existe';
        }
      ],
      selectedFilter: { name: 'Todos os ingressos' },
    };
  },

  computed: {
    isMobile() {
      return isMobileDevice(this.$vuetify);
    },

    getEvent() {
      return this.$store.getters['eventGeneralInfo/$info'];
    },

    getTickets() {
      return this.$store.getters['eventTickets/$tickets'];
    },

    getFilterList() {
      return [
        { name: 'Todos os ingressos', value: 'all' },
        { name: 'Ingressos sem categoria', value: 'uncategorized' },
        ...this.getTicketCategories.map(category => ({ name: category.text, value: category.value }))
      ];
    },

    getTicketCategories() {
      return this.$store.getters['eventTickets/$ticketCategories'] || [];
    },

    // Ingressos sem categoria
    getUncategorizedTickets() {
      return this.getTickets.filter(ticket => !ticket.category || !ticket.category.value);
    },

    getStatisticsTitle() {
      if (this.selectedCategoryTab === 0) {
        return 'Ingressos';
      } else if (this.selectedCategoryTab === 1) {
        return 'Ingressos sem categoria';
      } else {
        const index = this.selectedCategoryTab - 2;
        if (index >= 0 && index < this.getTicketCategories.length) {
          return `Ingressos - ${this.getTicketCategories[index].text}`;
        }
        return 'Ingressos';
      }
    },

    getCurrentStatistics() {
      if (!this.getEvent || !this.getTickets) return [];

      // Estatísticas gerais para a aba "Todos os ingressos"
      if (this.selectedCategoryTab === 0) {
        return this.getGeneralStatistics();
      }

      // Estatísticas para ingressos sem categoria
      else if (this.selectedCategoryTab === 1) {
        return this.getUncategorizedStatistics();
      }

      // Estatísticas para categoria específica
      else {
        const index = this.selectedCategoryTab - 2;
        if (index >= 0 && index < this.getTicketCategories.length) {
          const category = this.getTicketCategories[index];
          return this.getCategoryStatistics(category.value);
        }
        return this.getGeneralStatistics();
      }
    }
  },

  methods: {
    getGeneralStatistics() {
      if (!this.getEvent || !this.getTickets) return [];

      const totalSales = this.getTickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_sold),
        0
      );

      const totalQuantity = this.getTickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_quantity),
        0
      );

      const totalHasSales = this.getTickets.filter(
        (ticket) => Number(ticket.total_sold) > 0
      ).length;

      const categoryCount = this.getTicketCategories.length;
      const uncategorizedCount = this.getUncategorizedTickets.length;

      return [
        {
          title: 'Vendas / Limite',
          value: `${totalSales} / ${totalQuantity}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${this.getTickets.length}`,
        },
        {
          title: 'Categorias / Sem categoria',
          value: `${categoryCount} / ${uncategorizedCount}`,
        }
      ];
    },

    handleFilterChange(filter) {
      this.selectedFilter = filter;
      this.selectedCategoryTab = this.getFilterList.findIndex(f => f.name === filter.name);
    },

    getUncategorizedStatistics() {
      return this.$refs.categoryStats.calculateUncategorizedStats(this.getUncategorizedTickets);
    },

    // Estatísticas para uma categoria específica
    getCategoryStatistics(categoryValue) {
      return this.$refs.categoryStats.calculateCategoryStats(
        this.getTicketsByCategory(categoryValue)
      );
    },

    handleCloseAddDialog() {
      this.showAddDialog = false;
    },

    openAddTicketModal() {
      this.showAddDialog = true;
    },

    openAddCategoryDialog() {
      this.showAddCategoryDialog = true;
    },

    // Verifica se uma categoria tem ingressos
    categoryHasTickets(categoryValue) {
      return this.getTickets.some(ticket =>
        ticket.category && ticket.category.value === categoryValue
      );
    },

    // Obtém ingressos por categoria
    getTicketsByCategory(categoryValue) {
      return this.getTickets.filter(ticket =>
        ticket.category && ticket.category.value === categoryValue
      );
    },

    async submitAdd() {
      try {
        this.isAddingTicket = true;
        const ticketForm = this.$refs.ticketForm;
        const { success, error } = await ticketForm.handleSubmit(true);
        if (success) {
          this.showAddDialog = false;
          this.$store.dispatch('toast/setToast', {
            text: `Ingresso adicionado com sucesso!`,
            type: 'success',
            time: 5000,
          });
        } else {
          console.log('[INSERÇÃO - TicketForm] Erro de validação', error);
          this.$store.dispatch('toast/setToast', {
            text: `Erro ao adicionar ingresso`,
            type: 'error',
            time: 5000,
          });
        }
      } catch (error) {
        console.log('[INSERÇÃO - TicketForm] Erro de validação');
      } finally {
        this.isAddingTicket = false;
      }
    },

    async addNewCategory() {
      if (!this.isCategoryFormValid || !this.newCategoryName) return;

      try {
        // Verificar se a categoria já existe
        const categoryExists = this.getTicketCategories.some(
          category => category.text.toLowerCase() === this.newCategoryName.toLowerCase()
        );

        if (categoryExists) {
          this.$store.dispatch('toast/setToast', {
            text: `A categoria "${this.newCategoryName}" já existe`,
            type: 'error',
            time: 5000,
          });
          return;
        }

        // Criar nova categoria e adicionar ao store
        await this.$store.dispatch('eventTickets/createTicketCategory', {
          eventId: this.getEvent.id,
          category: this.newCategoryName
        });

        this.$store.dispatch('toast/setToast', {
          text: `Categoria "${this.newCategoryName}" adicionada com sucesso!`,
          type: 'success',
          time: 5000,
        });

        // Limpar o formulário e fechar o modal
        this.newCategoryName = '';
        this.showAddCategoryDialog = false;

      } catch (error) {
        console.error('[INSERÇÃO - Categoria] Erro:', error);
        this.$store.dispatch('toast/setToast', {
          text: `Erro ao adicionar categoria`,
          type: 'error',
          time: 5000,
        });
      }
    },

    handleSplitButtonActions(action) {
      if (action === 'new-category') {
        this.openAddCategoryDialog();
      }
    },
  },
};
</script>

<style scoped>
.event-details-wrapper {
  max-width: 1480px;
}
</style>
