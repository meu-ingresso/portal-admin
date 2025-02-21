import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { formatDateTimeWithTimezone } from '@/utils/formatters';

export class TicketPdfGenerator {
  constructor(payment, event, tickets) {
    this.payment = payment;
    this.event = event;
    this.tickets = tickets;
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.margin = 20;
    this.contentWidth = this.pageWidth - (2 * this.margin);
  }

  async generate() {
    try {
      for (const ticket of this.tickets) {
        await this.generateTicketPage(ticket);
        
        if (this.tickets.indexOf(ticket) < this.tickets.length - 1) {
          this.doc.addPage();
        }
      }

      this.doc.save(`ingressos-${this.payment.id}.pdf`);
    } catch (error) {
      throw new Error('Erro ao gerar PDF dos ingressos');
    }
  }

  async generateTicketPage(ticket) {
    const yPos = 20;
    
    this.drawTicketBorder(yPos);
    this.addEventHeader(yPos);
    this.addEventDetails(yPos);
    this.addTicketInfo(ticket, yPos);
    this.addBuyerName(yPos);
    await this.addQRCode(ticket, yPos);
    this.addTicketIdentifier(ticket, yPos);
    this.addAdditionalInfo(yPos);
    // this.addPlatformInfo(yPos);
  }

  drawTicketBorder(yPos) {
    this.doc.setLineDashPattern([1, 1], 0);
    this.doc.rect(this.margin, yPos, this.contentWidth, 180, 'S');
  }

  addEventHeader(yPos) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.text(this.event?.name || 'Nome do Evento', this.pageWidth / 2, yPos + 15, {
      align: 'center',
    });
  }

  addEventDetails(yPos) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    const dateText = formatDateTimeWithTimezone(this.event?.start_date);
    this.doc.text(`${dateText}`, this.margin + 5, yPos + 35);
    this.doc.text(`${this.event?.location || 'Local do Evento'}`, this.margin + 5, yPos + 45);
  }

  addTicketInfo(ticket, yPos) {
    this.doc.text(`Ingresso: ${ticket.ticket?.name}`, this.margin + 5, yPos + 65);
    this.doc.text(`Valor: R$ ${ticket.ticket?.price || '0,00'}`, this.margin + 5, yPos + 75);
  }

  addPlatformInfo(yPos) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.text('Meu Ingresso', this.pageWidth / 2, yPos + 85, { align: 'center' });
    this.doc.text('Plataforma de Venda de Ingressos e Inscrições', this.pageWidth / 2, yPos + 90, { align: 'center' });
    this.doc.text('meuingresso.com.br', this.pageWidth / 2, yPos + 95, { align: 'center' });
  }

  addBuyerName(yPos) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    const buyerName = `${this.payment.user?.people?.first_name} ${this.payment.user?.people?.last_name}`;
    this.doc.text(buyerName, this.pageWidth / 2, yPos + 110, { align: 'center' });
  }

  async addQRCode(ticket, yPos) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(ticket.ticket_identifier);
      const qrSize = 50;
      const qrX = (this.pageWidth - qrSize) / 2;
      this.doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPos + 120, qrSize, qrSize);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  }

  addTicketIdentifier(ticket, yPos) {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.text(ticket.ticket_identifier, this.pageWidth / 2, yPos + 180, { align: 'center' });
  }

  addAdditionalInfo(yPos) {
    yPos += 190;
    this.doc.setLineDashPattern([1, 1], 0);
    this.doc.rect(this.margin, yPos, this.contentWidth, 60, 'S');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text('Informações adicionais', this.margin + 5, yPos + 15);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.text('Mensagem da organização do evento:', this.margin + 5, yPos + 35);
    this.doc.text('Essa é uma descrição teste emitida junto com o ingresso do participante', this.margin + 5, yPos + 45);
  }
} 