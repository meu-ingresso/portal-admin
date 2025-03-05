<template>
  <!-- Componente utilitário sem renderização visual -->
  <div style="display: none;"></div>
</template>

<script>
export default {
  name: 'CategoryTicketsStats',
  
  methods: {
    /**
     * Calcula estatísticas para ingressos sem categoria
     * @param {Array} tickets - Lista de ingressos sem categoria
     * @returns {Array} Lista de estatísticas formatadas
     */
    calculateUncategorizedStats(tickets) {
      if (!tickets || tickets.length === 0) {
        return [
          { title: 'Vendas / Limite', value: '0 / 0' },
          { title: 'Ingressos à venda', value: '0 / 0' },
          { title: 'Porcentagem de vendas', value: '0%' }
        ];
      }
      
      const totalSales = tickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_sold || 0),
        0
      );

      const totalQuantity = tickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_quantity || 0),
        0
      );

      const totalHasSales = tickets.filter(
        (ticket) => Number(ticket.total_sold || 0) > 0
      ).length;
      
      const salesPercentage = totalQuantity > 0 
        ? ((totalSales / totalQuantity) * 100).toFixed(1) 
        : '0';

      return [
        {
          title: 'Vendas / Limite',
          value: `${totalSales} / ${totalQuantity}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${tickets.length}`,
        },
        {
          title: 'Porcentagem de vendas',
          value: `${salesPercentage}%`,
        }
      ];
    },

    /**
     * Calcula estatísticas para ingressos de uma categoria específica
     * @param {Array} tickets - Lista de ingressos da categoria
     * @returns {Array} Lista de estatísticas formatadas
     */
    calculateCategoryStats(tickets) {
      if (!tickets || tickets.length === 0) {
        return [
          { title: 'Vendas / Limite', value: '0 / 0' },
          { title: 'Ingressos à venda', value: '0 / 0' },
          { title: 'Porcentagem de vendas', value: '0%' },
          { title: 'Faixa de preço', value: 'R$ 0.00 - R$ 0.00' }
        ];
      }
      
      const totalSales = tickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_sold || 0),
        0
      );

      const totalQuantity = tickets.reduce(
        (acc, ticket) => acc + Number(ticket.total_quantity || 0),
        0
      );

      const totalHasSales = tickets.filter(
        (ticket) => Number(ticket.total_sold || 0) > 0
      ).length;
      
      const salesPercentage = totalQuantity > 0 
        ? ((totalSales / totalQuantity) * 100).toFixed(1) 
        : '0';

      // Encontra a maior e menor preço
      const prices = tickets.map(ticket => parseFloat(ticket.price) || 0);
      const highestPrice = Math.max(...prices).toFixed(2);
      const lowestPrice = Math.min(...prices).toFixed(2);
      
      // Formatação para mostrar como moeda brasileira
      const priceRange = highestPrice === lowestPrice
        ? `R$ ${lowestPrice}`
        : `R$ ${lowestPrice} - R$ ${highestPrice}`;

      return [
        {
          title: 'Vendas / Limite',
          value: `${totalSales} / ${totalQuantity}`,
        },
        {
          title: 'Ingressos à venda',
          value: `${totalHasSales} / ${tickets.length}`,
        },
        {
          title: 'Porcentagem de vendas',
          value: `${salesPercentage}%`,
        },
        {
          title: 'Faixa de preço',
          value: priceRange,
        }
      ];
    },
    
    /**
     * Formata valor para formato de moeda brasileira
     * @param {Number} value - Valor a ser formatado
     * @returns {String} Valor formatado como moeda
     */
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
  }
};
</script> 