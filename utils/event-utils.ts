/**
 * Interfaces para as entidades utilizadas nas funções
 */

/**
 * Representa um grupo ao qual um evento pode pertencer
 */
interface EventGroup {
  id: string | number;
  [key: string]: any;
}

/**
 * Representa um evento no sistema
 */
interface Event {
  id: string | number;
  name: string;
  start_date?: string | Date;
  groups?: EventGroup[];
  [key: string]: any;
}

/**
 * Representa um evento que foi processado e pode conter informações sobre suas sessões
 */
interface ProcessedEvent extends Event {
  hasSessions: boolean;
  sessionsCount?: number;
  sessionIds?: (string | number)[];
}

/**
 * Tipo para o objeto que agrupa eventos por ID de grupo
 */
type EventGroupMap = {
  [groupId: string]: Event[];
};

/**
 * Encontra eventos que pertencem ao mesmo grupo de um evento específico
 * @param event - O evento de referência
 * @param allEvents - Lista completa de eventos
 * @returns Lista de eventos do mesmo grupo
 */
export function getEventsInSameGroup(event: Event | null | undefined, allEvents: Event[] | null | undefined): Event[] {
  if (!event || !event.groups || !event.groups.length || !allEvents) return [];
  
  const groupId = event.groups[0].id;
  return allEvents.filter(e => 
    e.groups && 
    e.groups.length && 
    e.groups[0].id === groupId
  );
}

/**
 * Retorna a contagem de sessões para um evento
 * @param event - O evento
 * @param allEvents - Lista completa de eventos
 * @returns Número de sessões
 */
export function getSessionsCount(event: Event | null | undefined, allEvents: Event[] | null | undefined): number {
  if (!event) return 0;
  
  if ('sessionsCount' in event && typeof event.sessionsCount === 'number') {
    return event.sessionsCount;
  }
  
  if ('sessionIds' in event && Array.isArray(event.sessionIds)) {
    return event.sessionIds.length;
  }
  
  // Se não tiver informações explícitas, calculamos com base nos eventos do mesmo grupo
  return getEventsInSameGroup(event, allEvents).length;
}

/**
 * Agrupa eventos que pertencem ao mesmo grupo (sessões) e retorna apenas o mais próximo de cada grupo
 * 
 * @param events Lista completa de eventos
 * @returns Lista de eventos agrupados, contendo apenas o mais próximo de cada grupo
 */
export function groupEventsBySession(events: Event[] | null | undefined): ProcessedEvent[] {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return [];
  }
  
  // Agrupar eventos pelo ID do grupo (sessão)
  const eventsByGroupId: EventGroupMap = {};
  
  // Mapear eventos para seus respectivos grupos
  events.forEach(event => {
    // Se o evento pertence a um grupo (tem sessões)
    if (event.groups && event.groups.length > 0) {
      // Processar cada grupo ao qual o evento pertence
      event.groups.forEach(group => {
        // Verificar se o grupo tem ID válido
        if (!group.id) {
          console.error('Grupo sem ID encontrado:', group);
          return;
        }
        
        const groupId = String(group.id);
        // Inicializar o array de eventos para este grupo se necessário
        if (!eventsByGroupId[groupId]) {
          eventsByGroupId[groupId] = [];
        }
        
        // Adicionar o evento à sua respectiva sessão
        eventsByGroupId[groupId].push(event);
      });
    } else {
      // Eventos sem grupo/sessão são tratados individualmente usando seu próprio ID
      const eventId = `event_${event.id}`;
      eventsByGroupId[eventId] = [event];
    }
  });
  
  // Filtrar apenas o evento mais próximo (data mais antiga) de cada grupo/sessão
  const filteredEvents: ProcessedEvent[] = [];
  
  Object.entries(eventsByGroupId).forEach(([_groupId, eventsInGroup]) => {
    // Se há apenas um evento no grupo, não precisa ordenar
    if (eventsInGroup.length === 1) {
      const singleEvent: ProcessedEvent = {...eventsInGroup[0], hasSessions: false};
      filteredEvents.push(singleEvent);
      return;
    }
    
    // Para múltiplos eventos, ordenar por data (mais próxima primeiro, não a mais recente)
    const sortedByDate = [...eventsInGroup].sort((a, b) => {
      // Garantir que as datas são válidas
      const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
      const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
      
      // Verificar se as datas são válidas
      const isValidA = !isNaN(dateA.getTime());
      const isValidB = !isNaN(dateB.getTime());
      
      if (!isValidA && !isValidB) return 0;
      if (!isValidA) return 1; // B vem primeiro
      if (!isValidB) return -1; // A vem primeiro
      
      // Ordenar pela data mais próxima (ascendente) em vez da mais recente
      return dateA.getTime() - dateB.getTime();
    });
    
    // Adicionar apenas o evento mais próximo (data mais antiga) do grupo ao resultado final
    if (sortedByDate.length > 0) {
      // Adicionar informações sobre sessões disponíveis ao evento
      const nearestEvent: ProcessedEvent = {
        ...sortedByDate[0],
        hasSessions: true,
        sessionsCount: sortedByDate.length,
        // Armazenar IDs de todas as sessões para referência futura (podem ser usados na tela de detalhes)
        sessionIds: sortedByDate.map(event => event.id)
      };
      
      filteredEvents.push(nearestEvent);
    }
  });
  
  return filteredEvents;
}

/**
 * Gera informações de diagnóstico sobre o agrupamento de eventos
 * 
 * @param originalEvents Lista original de eventos
 * @param groupedEvents Lista de eventos após agrupamento
 * @param contextName Nome do contexto para identificação (ex: "Home" ou "Eventos")
 */
export function logEventGroupingDiagnostics(
  originalEvents: Event[] | null | undefined,
  groupedEvents: ProcessedEvent[] | null | undefined,
  contextName: string = "Default"
): void {
  // Verificar se há dados para analisar
  if (!originalEvents || !groupedEvents) {
    console.log(`Diagnóstico não realizado: dados incompletos (${contextName})`);
    return;
  }
  
  console.log(`===== DIAGNÓSTICO DO AGRUPAMENTO DE EVENTOS (${contextName}) =====`);
  console.log('Total de eventos originais:', originalEvents.length);
  
  // Verificar o resultado do agrupamento
  console.log('Total após agrupamento:', groupedEvents.length);
  
  // Listar eventos com múltiplas sessões
  const eventsWithSessions = groupedEvents.filter(e => e.hasSessions);
  console.log('Eventos com múltiplas sessões:', eventsWithSessions.length);
  
  eventsWithSessions.forEach(event => {
    console.log(`Evento: ${event.name} (ID: ${event.id})`);
    console.log(`  Data selecionada: ${event.start_date ? new Date(event.start_date).toLocaleString() : 'N/A'} (evento mais próximo do grupo)`);
    console.log(`  Total de sessões: ${event.sessionsCount ?? 0}`);
    if (event.sessionIds && event.sessionIds.length) {
      console.log(`  IDs das sessões: ${event.sessionIds.join(', ')}`);
    }
    console.log('--------------------------');
  });
  
  console.log('===== FIM DO DIAGNÓSTICO =====');
}

/**
 * Interface para eventos formatados para exibição no calendário
 */
interface CalendarEvent {
  name: string;
  start: Date;
  end: Date;
  color?: string;
  time?: string;
  originalEvent: Event;
  timed: boolean;
  groupId?: string | number;
  status?: string;
}

/**
 * Formata eventos para exibição no calendário, mantendo eventos do mesmo grupo
 * 
 * @param events Lista de eventos para formatar
 * @returns Lista de eventos formatados para o calendário
 */
export function formatEventsForCalendar(events: Event[] | null | undefined): CalendarEvent[] {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return [];
  }

  const calendarEvents: CalendarEvent[] = [];
  
  // Mapear eventos diretamente para o calendário
  events.forEach(event => {
    if (event.start_date) {
      calendarEvents.push({
        name: event.name,
        start: new Date(event.start_date),
        end: new Date(event.end_date || event.start_date),
        color: event.status?.color || 'primary',
        time: formatEventTime(event.start_date),
        originalEvent: event,
        timed: false,
        groupId: event.groups?.[0]?.id,
        status: event.status?.name
      });
    }
  });

  return calendarEvents;
}

/**
 * Formata a hora do evento para exibição
 * 
 * @param date Data do evento
 * @returns Hora formatada ou string vazia
 */
function formatEventTime(date: string | Date | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
} 