# Página de Detalhes do Evento

## Descrição

Este documento descreve a estrutura e funcionamento da página de detalhes de eventos implementada no portal administrativo do Meu Ingresso.

## Visão Geral

A página de detalhes do evento é uma interface central que exibe diferentes templates (painéis de funcionalidades) baseados na rota atual. Esta abordagem modular permite que diferentes aspectos da gestão de eventos sejam organizados e acessados através de uma navegação consistente.

## Estrutura da Página

A página de detalhes do evento é composta por:

1. **Cabeçalho** - Exibe informações gerais e título do evento
2. **Seletor de Sessões** - Permite alternar entre diferentes sessões do mesmo evento (quando agrupados)
3. **Área de conteúdo principal** - Exibe diferentes templates baseados na rota selecionada

## Templates Disponíveis

A página carrega condicionalmente os seguintes templates baseados no valor de `$route.meta.template`:

| Template | Rota | Descrição |
|----------|------|-----------|
| Panel | panel | Visão geral do evento com métricas e informações principais |
| Tickets | tickets | Gerenciamento de ingressos e categorias |
| Coupons | coupons | Gerenciamento de cupons de desconto |
| Guestlists | guestlists | Gerenciamento de listas de convidados |
| Checkin | checkin | Sistema de check-in e validação de ingressos |
| Orders | orders | Visualização e gerenciamento de pedidos |
| Collaborators | collaborators | Gerenciamento de colaboradores do evento |
| PDV | pdv | Gerenciamento de pontos de venda |

## Controle de Acesso

A página implementa verificações de permissão baseadas em:

1. **Função do usuário** - Administradores têm acesso total
2. **Proprietário do evento** - O criador do evento (promoter_id) tem acesso total
3. **Colaboradores** - Usuários vinculados como colaboradores têm acesso baseado em suas permissões

Se um usuário não tiver permissão, uma mensagem "Você não possui acesso à esse evento" é exibida.

## Carregamento de Dados

Quando a página é carregada ou o ID do evento muda:

1. Busca informações gerais do evento (eventGeneralInfo)
2. Se o evento pertence a um grupo, busca todos os eventos relacionados (sessões)
3. Carrega dados adicionais em paralelo:
   - Ingressos (eventTickets)
   - Campos personalizados (eventCustomFields)
   - Cupons (eventCoupons)
   - Listas de convidados (eventGuests)
   - Pontos de venda (eventPdv)
   - Usuários (user.getAllUsers)
   - Funções/papéis (user.getRoles)
   - Colaboradores (eventCollaborators)

## Implementação

O componente principal está localizado em:
- `pages/events/EventDetailsPage.vue`

### Componentes Relacionados

- `EventDetailsHeader.vue` - Exibe o cabeçalho e informações gerais do evento
- `EventSessionSelector.vue` - Permite alternar entre diferentes sessões do mesmo evento
- Templates específicos (EventDetailsTemplate, EventDetailsTicketsTemplate, etc.)

### Estados Condicionais

O componente gerencia diferentes estados:
- **Carregamento** - Exibe uma animação de carregamento
- **Evento inválido** - Exibe uma mensagem de "Evento não encontrado"
- **Sem permissão** - Exibe uma mensagem de acesso negado
- **Conteúdo normal** - Exibe o template apropriado baseado na rota

## Integração com o Sistema de Agrupamento

A página de detalhes do evento se integra com o sistema de agrupamento de eventos:

1. Busca todos os eventos relacionados quando o evento pertence a um grupo
2. Permite alternar entre diferentes sessões do mesmo evento através do EventSessionSelector

## Considerações Futuras

Possíveis melhorias:

1. Implementar um sistema de abas personalizado para navegação entre templates
2. Adicionar um histórico de alterações para auditoria
3. Melhorar o desempenho através de carregamento sob demanda para templates específicos 