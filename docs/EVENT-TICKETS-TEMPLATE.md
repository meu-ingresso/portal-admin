# Template de Ingressos do Evento

## Descrição

Este documento descreve o template de Ingressos do Evento (Tickets), que permite o gerenciamento completo dos ingressos e categorias disponíveis para venda no portal administrativo do Meu Ingresso.

## Propósito

O template de Ingressos do Evento foi projetado para oferecer uma interface intuitiva para criação, edição e monitoramento de ingressos. Permite que organizadores definam diferentes tipos de ingressos, preços, quantidades e períodos de venda.

## Funcionalidades Principais

O template de Ingressos do Evento inclui:

1. **Listagem de Ingressos** - Exibe todos os ingressos criados para o evento
2. **Criação de Ingressos** - Interface para adicionar novos tipos de ingressos
3. **Edição de Ingressos** - Modificação de ingressos existentes
4. **Gerenciamento de Estoque** - Controle de quantidades disponíveis e vendidas
5. **Programação de Vendas** - Definição de períodos de início e fim de vendas
6. **Precificação** - Configuração de preços base e taxas adicionais
7. **Agrupamento por Categorias** - Organização de ingressos em categorias lógicas

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsTicketsTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsTicketsTemplate
├── TicketCategoriesList
│   └── TicketCategoryCard
│       └── TicketItem
├── TicketFormDialog
│   ├── TicketBasicInfo
│   ├── TicketPricing
│   ├── TicketAvailability
│   └── TicketAdvancedSettings
└── TicketActionsMenu
```

### Fontes de Dados

O template consome dados principalmente da store de ingressos:

1. **eventTickets** - Dados sobre todos os ingressos do evento
2. **eventGeneralInfo** - Informações gerais sobre o evento (necessário para algumas validações)
3. **eventCustomFields** - Campos personalizados que podem ser associados aos ingressos

### Tipos de Ingressos Suportados

O sistema suporta diferentes tipos de ingressos:

1. **Padrão** - Ingresso regular com preço fixo
2. **Gratuito** - Ingresso sem custo
3. **VIP** - Ingresso premium com benefícios adicionais
4. **Combo** - Conjunto de múltiplos ingressos vendidos como um pacote
5. **Promocional** - Ingresso com desconto para períodos específicos

## Validações e Restrições

O template implementa diversas validações para garantir consistência dos dados:

1. **Quantidade** - Não permite valores negativos ou zero
2. **Preços** - Validação de valores mínimos baseados nas taxas do sistema
3. **Datas** - Validação para garantir que período de vendas esteja dentro das datas do evento
4. **Conflitos** - Verificação de sobreposição entre categorias e tipos de ingressos

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Sincronização de Ingressos** - Opção para replicar configurações entre sessões
2. **Visualização Consolidada** - Possibilidade de ver ingressos de todas as sessões em uma única tela
3. **Edição em Massa** - Edição simultânea de ingressos em múltiplas sessões

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Criar Ingresso** - Adicionar novo tipo de ingresso
2. **Editar Ingresso** - Modificar configurações de um ingresso existente
3. **Pausar Vendas** - Interromper temporariamente a venda de um tipo específico
4. **Excluir Ingresso** - Remover um tipo de ingresso (apenas se não houver vendas)
5. **Duplicar Ingresso** - Criar cópia de um ingresso existente para facilitar configurações similares
6. **Relatório de Vendas** - Visualizar estatísticas detalhadas por tipo de ingresso

## Permissões

O acesso às funcionalidades é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as funcionalidades |
| Promoter | Acesso total a todas as funcionalidades |
| Collaborator | Acesso baseado em permissões específicas, potencialmente limitado a visualização |

## Considerações Futuras

Possíveis melhorias:

1. Implementar sistema de preços dinâmicos baseados em demanda
2. Adicionar suporte para assentos numerados para eventos com mapa de assentos
3. Criar sistema de controle de lotes automático baseado em quantidade vendida
4. Implementar função de "Early Bird" com descontos programados para primeiros compradores 