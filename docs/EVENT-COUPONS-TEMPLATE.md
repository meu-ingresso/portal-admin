# Template de Cupons do Evento

## Descrição

Este documento descreve o template de Cupons do Evento (Coupons), que gerencia a criação e administração de cupons de desconto para venda de ingressos no portal administrativo do Meu Ingresso.

## Propósito

O template de Cupons do Evento permite que organizadores criem, monitorem e gerenciem códigos promocionais que oferecem descontos aos compradores. Esta funcionalidade é essencial para estratégias de marketing, parcerias e promoções especiais.

## Funcionalidades Principais

O template de Cupons do Evento inclui:

1. **Listagem de Cupons** - Visualização de todos os cupons criados para o evento
2. **Criação de Cupons** - Interface para adicionar novos cupons de desconto
3. **Edição de Cupons** - Modificação de cupons existentes
4. **Monitoramento de Uso** - Acompanhamento da utilização de cada cupom
5. **Validação de Cupons** - Verificação da validade e aplicabilidade dos cupons
6. **Tipos de Desconto** - Suporte para descontos percentuais ou em valor fixo
7. **Restrições de Aplicação** - Limitação de uso por usuário ou tipos de ingressos

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsCouponsTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsCouponsTemplate
├── CouponsList
│   └── CouponCard
├── CouponFormDialog
│   ├── CouponBasicInfo
│   ├── CouponDiscountInfo
│   ├── CouponUsageLimits
│   └── CouponTicketRestrictions
└── CouponUsageStats
```

### Fontes de Dados

O template consome dados principalmente da store de cupons:

1. **eventCoupons** - Dados sobre todos os cupons do evento
2. **eventTickets** - Dados sobre ingressos para associação com cupons
3. **eventOrders** - Informações sobre pedidos que utilizaram cupons

### Tipos de Cupons Suportados

O sistema suporta diferentes tipos de cupons:

1. **Percentual** - Desconto baseado em porcentagem do valor total
2. **Valor Fixo** - Desconto de um valor monetário específico
3. **Frete Grátis** - Eliminação de taxas de serviço 
4. **Específico para Ingresso** - Aplicável apenas a determinados tipos de ingresso

## Validações e Restrições

O template implementa diversas validações para garantir a integridade e eficácia dos cupons:

1. **Código** - Garantia de unicidade do código promocional
2. **Período de Validade** - Datas de início e término da promoção
3. **Limite de Uso** - Quantidade máxima de utilizações permitidas
4. **Uso por Usuário** - Restrição de quantas vezes o mesmo usuário pode usar o cupom
5. **Valor Mínimo** - Valor mínimo de compra para aplicação do desconto
6. **Valor Máximo** - Teto para o valor de desconto aplicado

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Aplicação entre Sessões** - Configuração para cupom ser válido em uma ou todas as sessões
2. **Visibilidade por Sessão** - Opção para mostrar cupons específicos apenas em sessões selecionadas
3. **Estatísticas Consolidadas** - Visualização do uso de cupons em todas as sessões do grupo

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Criar Cupom** - Adicionar novo código promocional
2. **Editar Cupom** - Modificar configurações de um cupom existente
3. **Desativar Cupom** - Interromper temporariamente a utilização do cupom
4. **Excluir Cupom** - Remover um cupom (com verificações de segurança para cupons já utilizados)
5. **Estender Validade** - Prolongar o período de validade de um cupom
6. **Exportar Relatório** - Gerar relatório detalhado sobre utilização dos cupons

## Permissões

O acesso às funcionalidades é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as funcionalidades |
| Promoter | Acesso total a todas as funcionalidades |
| Collaborator | Acesso baseado em permissões específicas, geralmente limitado a visualização |

## Considerações Futuras

Possíveis melhorias:

1. Implementar cupons dinâmicos gerados automaticamente para campanhas específicas
2. Adicionar suporte para cupons baseados em regras (ex: "compre um, leve outro")
3. Criar sistema de recomendação para sugerir estratégias eficazes de cupons
4. Implementar integrações com plataformas de marketing para distribuição de cupons 