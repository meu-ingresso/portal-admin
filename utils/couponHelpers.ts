import { Coupon, CouponApiResponse, CouponPayload, CouponTicket, CouponTicketApiResponse, TicketApiResponse } from "~/models/event";


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
  ticketsFromEvent: TicketApiResponse[],
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
    .filter(ticket => ticket.deleted_at)
    .map(ticket => ticket.id);
  
  const activeTickets = relevantTickets.filter(ticket => !ticket.deleted_at);

  return {
    // Criar apenas para tickets ativos que não existem
    toCreate: activeTickets.filter(ticket => 
      !existingRelations.some(rel => rel.ticket_id === ticket.id && !rel.deleted_at)
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


  export const  prepareCouponPayload = (coupon: Coupon, eventId: string, statusId: string): CouponPayload => {
    const startDateTime = `${coupon.start_date}T${coupon.start_time}:00.000Z`;
    const endDateTime = `${coupon.end_date}T${coupon.end_time}:00.000Z`;

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    return {
      event_id: eventId,
      status_id: statusId,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value.replace(',', '.')),
      max_uses: coupon.max_uses,
      start_date: startDate.toISOString().replace('Z', '-0300'),
      end_date: endDate.toISOString().replace('Z', '-0300'),
    };
  }
