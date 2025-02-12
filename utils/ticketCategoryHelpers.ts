import { Ticket, CategoryApiResponse } from '~/models/event';

interface CategoryChanges {
  toUpdate: {
    id: string;
    name: string;
  }[];
  toDelete: string[];
  ticketsToUpdateCategory: {
    ticketId: string;
    categoryId: string | null;
  }[];
}

export const getCategoryChanges = (
  existingCategories: CategoryApiResponse[],
  tickets: Ticket[],
): CategoryChanges => {
  const toUpdate: { id: string; name: string }[] = [];
  const toDelete: string[] = [];
  const ticketsToUpdateCategory: { ticketId: string; categoryId: string | null }[] = [];

  // Mapeia categorias em uso
  const categoriesInUse = new Map<string, number>();
  tickets.forEach(ticket => {
    if (ticket.category?.id && !ticket._deleted) {
      const count = categoriesInUse.get(ticket.category.id) || 0;
      categoriesInUse.set(ticket.category.id, count + 1);
    }
  });

  console.log('categoriesInUse: ', categoriesInUse);

  // Verifica categorias que precisam ser atualizadas ou deletadas
  existingCategories.forEach(existingCat => {
    const matchingTicket = tickets.find(
      ticket => ticket.category?.id === existingCat.id && !ticket._deleted
    );

    if (matchingTicket) {
      // Se o nome da categoria mudou, adiciona para atualização
      if (matchingTicket.category.text !== existingCat.name) {
        toUpdate.push({
          id: existingCat.id,
          name: matchingTicket.category.text
        });
      }
    } else {
      // Se a categoria não está sendo usada por nenhum ticket, marca para deleção
      const usageCount = categoriesInUse.get(existingCat.id) || 0;
      if (usageCount === 0) {
        toDelete.push(existingCat.id);
      }
    }
  });

  // Identifica tickets que precisam ter sua categoria atualizada
  tickets.forEach(ticket => {
    if (ticket.id === '-1' || ticket._deleted) return; // Ignora tickets novos ou deletados

    const hadCategory = existingCategories.some(cat => cat.id === ticket.category?.id);
    const hasCategory = ticket.category?.id != null;

    // Se tinha categoria e agora não tem, ou vice-versa
    if (hadCategory !== hasCategory) {
      ticketsToUpdateCategory.push({
        ticketId: ticket.id,
        categoryId: ticket.category?.id || null
      });
    }
  });

  return { toUpdate, toDelete, ticketsToUpdateCategory };
};

export const getNextDisplayOrder = (tickets: Ticket[]): number[] => {
  // Ordena todos os tickets (incluindo deletados) por display_order
  const sortedTickets = [...tickets].sort((a, b) =>
    (a.display_order || 0) - (b.display_order || 0)
  );

  // Cria um Set com todas as ordens em uso (incluindo de tickets deletados)
  const usedOrders = new Set(
    sortedTickets
      .filter(ticket => ticket.display_order && !ticket._deleted)
      .map(ticket => ticket.display_order)
  );

  // Gera array de display_orders válidos
  const displayOrders = tickets.map((ticket) => {

    // Se o ticket já tem uma ordem válida e não conflitante, mantém
    if (ticket.display_order &&
        !usedOrders.has(ticket.display_order) &&
        ticket.display_order > 0) {
      usedOrders.add(ticket.display_order);
      return ticket.display_order;
    }

    // Encontra próxima ordem disponível
    let order = 1;
    while (usedOrders.has(order)) {
      order++;
    }
    usedOrders.add(order);
    return order;
  });

  return displayOrders;
};
