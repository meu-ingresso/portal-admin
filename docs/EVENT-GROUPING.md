# Agrupamento de Eventos por Sessões

## Descrição

Este documento descreve a funcionalidade de agrupamento de eventos implementada no portal administrativo do Meu Ingresso.

## Regra de Negócio

Eventos que pertencem ao mesmo grupo (compartilham o mesmo group.id) são considerados "sessões" de um mesmo evento. Para melhorar a experiência do usuário, implementamos as seguintes regras:

1. Na listagem principal (Home e Eventos), apenas o evento com a data mais próxima (mais antiga) de cada grupo é exibido
2. Informações sobre a quantidade de sessões disponíveis são adicionadas ao evento exibido
3. As demais sessões poderão ser exibidas na página de detalhes do evento quando clicado pelo usuário

## Implementação

A lógica foi implementada em:

- `utils/event-utils.ts` - Funções utilitárias para agrupamento e diagnóstico
- `pages/home.vue` - Implementação na página inicial
- `pages/events/EventsPage.vue` - Implementação na página de eventos

### Funções Disponíveis

#### groupEventsBySession(events)

Agrupa eventos por grupos e retorna apenas o mais próximo (data mais antiga) de cada grupo:

```javascript
import { groupEventsBySession } from '@/utils/event-utils';

// No componente
computed: {
  groupedEvents() {
    return groupEventsBySession(this.events);
  }
}
```

#### logEventGroupingDiagnostics(originalEvents, groupedEvents, contextName)

Exibe informações de diagnóstico sobre o agrupamento:

```javascript
import { logEventGroupingDiagnostics } from '@/utils/event-utils';

// Em um método
logGroupedEvents() {
  logEventGroupingDiagnostics(this.events, this.groupedEvents, 'Nome do Contexto');
}
```

## Metadados Adicionados

Aos eventos que têm sessões adicionais, são adicionados os seguintes metadados:

- `hasSessions` (boolean): Indica se o evento tem outras sessões
- `sessionsCount` (number): Número total de sessões, incluindo a atual
- `sessionIds` (array): IDs de todas as sessões relacionadas, útil para buscar detalhes adicionais

## Interface do Usuário

No componente `EventBanner.vue`, um chip é exibido quando o evento possui múltiplas sessões:

```html
<v-chip
  v-if="hasMultipleSessions"
  color="primary"
  small
  class="ma-2"
  dark>
  {{ sessionsCount }} datas disponíveis
</v-chip>
```

## Testes

Testes unitários para a função de agrupamento estão disponíveis em:
- `utils/__tests__/event-utils.test.js`

## Considerações Futuras

Possíveis melhorias:

1. Implementar uma visualização de calendário para todas as sessões na página de detalhes do evento
2. Adicionar opção de filtragem por data nas sessões
3. Permitir que o usuário escolha qual critério de ordenação usar (data mais próxima, mais recente, etc.) 