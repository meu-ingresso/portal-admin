import { Coupon, CouponApiResponse, CouponTicket, CouponTicketApiResponse } from "~/models/event";


interface CouponRelationChanges {
  toCreate: CouponTicket[];
  toDelete: string[];
}


export const shouldUpdateCoupon = (existing: CouponApiResponse, current: Coupon): boolean => {
  return (
    existing.code !== current.code ||
    existing.discount_type !== current.discount_type ||
    existing.discount_value !== current.discount_value ||
    existing.max_uses !== current.max_uses ||
    existing.start_date !== `${current.start_date}T${current.start_time}:00.000-0300` ||
    existing.end_date !== `${current.end_date}T${current.end_time}:00.000-0300`
  );
};

export const getCouponTicketRelationChanges = (
  existingRelations: CouponTicketApiResponse[],
  ticketsFromEvent: CouponTicket[],
  ticketsFromCoupon: CouponTicket[]
): CouponRelationChanges => {
  // Filtra apenas os tickets que pertencem ao cupom
  const relevantTickets = ticketsFromEvent.filter(eventTicket =>
    ticketsFromCoupon.some(couponTicket => 
      (couponTicket.id && couponTicket.id === eventTicket.id) || 
      (!couponTicket.id && couponTicket.name === eventTicket.name)
    )
  );
  
  // Separa tickets deletados e ativos
  const deletedTicketIds = relevantTickets
    .filter(ticket => ticket._deleted)
    .map(ticket => ticket.id);
  
  const activeTickets = relevantTickets.filter(ticket => !ticket._deleted);

  console.log('Tickets do cupom:', ticketsFromCoupon);
  console.log('Tickets relevantes do evento:', relevantTickets);
  console.log('IDs de tickets deletados:', deletedTicketIds);
  console.log('Tickets ativos:', activeTickets);

  return {
    // Criar apenas para tickets ativos que não existem
    toCreate: activeTickets.filter(ticket => 
      !existingRelations.some(rel => rel.ticket_id === ticket.id)
    ),
    
    // Deletar relações se:
    // 1. O ticket foi marcado como deletado OU
    // 2. A relação não existe mais nos tickets ativos
    toDelete: existingRelations
      .filter(rel => 
        deletedTicketIds.includes(rel.ticket_id) || 
        !activeTickets.some(ticket => ticket.id === rel.ticket_id)
      )
      .map(rel => rel.id)
  };
};
