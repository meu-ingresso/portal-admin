# Template de Painel de Evento

## Descrição

Este documento descreve o template de Painel de Evento (Panel), que é o principal template exibido na página de detalhes do evento no portal administrativo do Meu Ingresso.

## Propósito

O template de Painel de Evento serve como um dashboard centralizado que apresenta informações gerais, métricas e funcionalidades principais do evento. É projetado para fornecer aos organizadores uma visão geral rápida do status e desempenho do evento.

## Funcionalidades Principais

O template de Painel de Evento inclui:

1. **Resumo de Vendas** - Exibe métricas como total de vendas, ingressos vendidos e receita gerada
2. **Gráfico de Desempenho** - Visualização gráfica das vendas ao longo do tempo
3. **Acesso Rápido** - Atalhos para as principais funções de gerenciamento
4. **Status do Evento** - Indicadores visuais do estado atual do evento
5. **Visitantes Recentes** - Lista dos últimos acessos/visualizações à página do evento

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsTemplate
├── EventMetricsSection
│   ├── MetricCard (Total de Vendas)
│   ├── MetricCard (Ingressos Vendidos)
│   └── MetricCard (Receita)
├── EventSalesChart
├── EventQuickActions
└── EventStatusIndicators
```

### Fontes de Dados

O template consome dados de várias stores:

1. **eventGeneralInfo** - Informações gerais sobre o evento
2. **eventTickets** - Dados sobre ingressos disponíveis e vendidos
3. **eventOrders** - Pedidos e transações relacionadas ao evento
4. **eventViews** - Estatísticas de visualização da página do evento

### Cálculo de Métricas

As métricas exibidas são calculadas em tempo real com base nos dados disponíveis:

```javascript
// Exemplo de cálculo de métricas
computed: {
  totalSales() {
    return this.eventOrders.filter(order => order.status === 'confirmed').length;
  },
  
  ticketsSold() {
    return this.eventOrders.reduce((total, order) => {
      if (order.status === 'confirmed') {
        return total + order.tickets.length;
      }
      return total;
    }, 0);
  },
  
  totalRevenue() {
    return this.eventOrders
      .filter(order => order.status === 'confirmed')
      .reduce((total, order) => total + order.total_amount, 0);
  }
}
```

## Adaptação Responsiva

O template se adapta a diferentes tamanhos de tela:

1. **Desktop** - Layout em grade com múltiplas colunas
2. **Tablet** - Layout com menos colunas e elementos reorganizados
3. **Mobile** - Layout de coluna única com elementos empilhados

## Integração com o Sistema de Sessões

Quando um evento tem múltiplas sessões (pertence a um grupo):

1. As métricas são calculadas especificamente para a sessão atual
2. Uma opção para visualizar métricas agregadas de todas as sessões está disponível
3. O seletor de sessões permite alternar facilmente entre diferentes datas

## Ações Disponíveis

O painel oferece acesso rápido a ações comuns:

1. **Editar Evento** - Modificar informações gerais do evento
2. **Gerenciar Ingressos** - Acessar template de tickets
3. **Ver Pedidos** - Acessar template de pedidos
4. **Exportar Relatórios** - Gerar e baixar relatórios do evento

## Permissões

O acesso a determinadas métricas e ações é controlado pelas permissões do usuário:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as métricas e ações |
| Promoter | Acesso total a todas as métricas e ações |
| Collaborator | Acesso baseado em permissões específicas |

## Considerações Futuras

Possíveis melhorias:

1. Adicionar métricas personalizáveis que podem ser selecionadas pelo usuário
2. Implementar previsões baseadas em IA para vendas futuras
3. Adicionar comparações com eventos anteriores do mesmo organizador
4. Incluir métricas de engajamento em redes sociais 