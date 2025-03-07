# Template de Pedidos do Evento

## Descrição

Este documento descreve o template de Pedidos do Evento (Orders), que fornece uma interface para visualização, gerenciamento e análise de pedidos realizados no portal administrativo do Meu Ingresso.

## Propósito

O template de Pedidos do Evento foi projetado para oferecer uma visão abrangente de todas as transações financeiras relacionadas ao evento, permitindo acompanhamento de vendas, resolução de problemas com transações e geração de relatórios financeiros.

## Funcionalidades Principais

O template de Pedidos do Evento inclui:

1. **Listagem de Pedidos** - Visualização completa de todos os pedidos realizados
2. **Detalhamento de Transação** - Informações detalhadas sobre cada pedido
3. **Filtros Avançados** - Busca por status, data, valor e outras propriedades
4. **Gestão de Status** - Atualização de status de pedidos quando necessário
5. **Reembolsos** - Processamento de devoluções e cancelamentos
6. **Comprovantes** - Reenvio de confirmações e comprovantes para clientes
7. **Relatórios Financeiros** - Exportação de dados para análise de vendas

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsOrdersTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsOrdersTemplate
├── OrdersTable
│   └── OrderRow
├── OrderDetailModal
│   ├── OrderInfo
│   ├── CustomerInfo
│   ├── TicketsInfo
│   ├── PaymentInfo
│   └── OrderActions
├── OrderFilters
│   ├── StatusFilter
│   ├── DateRangeFilter
│   └── SearchFilter
└── OrderReports
```

### Fontes de Dados

O template consome dados de várias stores:

1. **eventOrders** - Informações sobre todos os pedidos do evento
2. **eventTickets** - Dados sobre ingressos associados aos pedidos
3. **eventCustomFields** - Campos personalizados preenchidos durante a compra
4. **eventCoupons** - Cupons utilizados nas compras

### Estados de Pedido

O sistema acompanha diversos estados de pedido:

1. **Aguardando Pagamento** - Pedido criado mas pagamento não finalizado
2. **Confirmado** - Pagamento aprovado e ingressos emitidos
3. **Cancelado** - Pedido cancelado pelo cliente ou administrador
4. **Reembolsado** - Valor devolvido ao cliente após cancelamento
5. **Parcialmente Reembolsado** - Apenas parte do pedido foi devolvida
6. **Em Análise** - Transação em processo de análise antifraude

## Filtros e Ordenação

O template implementa diversas opções de filtros para facilitar a gestão:

1. **Por Status** - Filtragem por estado do pedido
2. **Por Data** - Intervalo de datas de criação ou confirmação
3. **Por Valor** - Faixa de valores de compra
4. **Por Cliente** - Busca por nome, e-mail ou CPF
5. **Por Ingresso** - Busca por tipo de ingresso adquirido
6. **Por Método de Pagamento** - Filtro por forma de pagamento utilizada

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Pedidos por Sessão** - Visualização de pedidos específicos de cada sessão
2. **Consolidação de Dados** - Relatórios financeiros agregados de todas as sessões
3. **Transferência entre Sessões** - Possibilidade de mover ingressos entre datas diferentes

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Visualizar Detalhes** - Acessar informações completas do pedido
2. **Alterar Status** - Modificar estado do pedido quando necessário
3. **Reenviar Confirmação** - Enviar novamente e-mail de confirmação ao cliente
4. **Processar Reembolso** - Iniciar devolução de valores
5. **Transferir Ingresso** - Alterar titularidade ou sessão de um ingresso
6. **Exportar Dados** - Gerar relatórios em diversos formatos (CSV, Excel, PDF)

## Permissões

O acesso às funcionalidades é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as funcionalidades, incluindo reembolsos |
| Promoter | Acesso a visualização e relatórios, reembolsos limitados |
| Collaborator | Acesso baseado em permissões específicas, geralmente apenas visualização |

## Considerações Futuras

Possíveis melhorias:

1. Implementar análise preditiva para tendências de venda
2. Adicionar integração com sistemas de contabilidade
3. Criar dashboard financeiro com métricas e KPIs avançados
4. Desenvolver sistema de detecção de fraudes baseado em padrões de compra 