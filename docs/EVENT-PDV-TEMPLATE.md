# Template de PDV do Evento

## Descrição

Este documento descreve o template de PDV do Evento (Ponto de Venda), que proporciona ferramentas para gerenciamento de vendas presenciais de ingressos no portal administrativo do Meu Ingresso.

## Propósito

O template de PDV do Evento foi projetado para oferecer uma solução completa para vendas de ingressos em pontos físicos, estabelecimentos parceiros ou na bilheteria do evento. Possibilita uma experiência de compra assistida para clientes que preferem ou necessitam adquirir ingressos pessoalmente.

## Funcionalidades Principais

O template de PDV do Evento inclui:

1. **Gerenciamento de Pontos de Venda** - Cadastro e controle de locais físicos
2. **Interface de Venda** - Terminal simplificado para operadores
3. **Controle de Operadores** - Gestão de vendedores autorizados
4. **Relatórios de Vendas** - Estatísticas detalhadas por PDV e operador
5. **Gestão de Estoque** - Alocação de ingressos específicos para venda presencial
6. **Comissionamento** - Cálculo de comissões para vendedores e estabelecimentos parceiros
7. **Integração com Hardware** - Suporte para impressoras e periféricos de pagamento

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsPdvTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsPdvTemplate
├── PdvLocationsList
│   └── PdvLocationCard
├── PdvFormDialog
│   ├── PdvBasicInfo
│   ├── PdvOperatorsSection
│   └── PdvTicketAllocation
├── PdvSalesReport
│   ├── PdvSalesChart
│   └── PdvSalesTable
└── PdvSettingsPanel
```

### Fontes de Dados

O template consome dados de várias stores:

1. **eventPdv** - Informações sobre pontos de venda e configurações
2. **eventTickets** - Dados sobre ingressos disponíveis para alocação
3. **eventOrders** - Pedidos realizados em cada PDV
4. **user** - Dados de usuários disponíveis como operadores
5. **eventCollaborators** - Colaboradores com permissão para venda

### Tipos de Pontos de Venda

O sistema suporta diferentes tipos de PDVs:

1. **Bilheteria** - Venda no local do evento
2. **Estabelecimento Parceiro** - Lojas e comércios que vendem ingressos
3. **Quiosque Temporário** - Ponto de venda por tempo limitado
4. **Vendedor Autônomo** - Pessoa autorizada a vender remotamente
5. **Terminal de Autoatendimento** - PDV sem operador humano

## Gestão de Estoque e Alocação

O template implementa um sistema de alocação de ingressos para controle de vendas:

1. **Quota por PDV** - Definição de quantidade específica para cada ponto
2. **Reserva Exclusiva** - Ingressos que só podem ser vendidos em determinados PDVs
3. **Liberação Automática** - Configuração para retorno ao estoque principal após prazo
4. **Reposição** - Mecanismos para adicionar ingressos a um PDV quando necessário

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **PDVs Compartilhados** - Pontos de venda que atendem a todas as sessões
2. **Alocação por Sessão** - Definição de estoque específico para cada data
3. **Relatórios Consolidados** - Visualização de vendas em todas as sessões relacionadas

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Criar PDV** - Adicionar novo ponto de venda
2. **Alocar Ingressos** - Definir quantidade disponível para cada PDV
3. **Vincular Operadores** - Atribuir vendedores a pontos específicos
4. **Gerar Link de Venda** - Criar URL para interface de PDV
5. **Definir Comissões** - Configurar valores ou percentuais para vendedores
6. **Extrair Relatórios** - Analisar desempenho de vendas por local e operador

## Permissões

O acesso às funcionalidades de PDV é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as configurações de PDV |
| Promoter | Acesso total para gerenciar PDVs do próprio evento |
| Gerente | Capacidade de gerenciar PDVs conforme permissões |
| Vendedor | Acesso apenas à interface de venda, sem configurações |

## Interface de Venda

O sistema inclui uma interface simplificada para operadores com as seguintes características:

1. **Seleção de Ingressos** - Escolha fácil de categorias e quantidades
2. **Dados do Comprador** - Coleta de informações do cliente
3. **Aplicação de Descontos** - Opção para adicionar cupons ou descontos autorizados
4. **Formas de Pagamento** - Suporte para dinheiro, cartões e outros métodos
5. **Emissão de Comprovante** - Geração de recibo digital ou impresso

## Considerações Futuras

Possíveis melhorias:

1. Implementar sistema de fila virtual para gerenciamento de picos de demanda
2. Adicionar suporte para venda em dispositivos móveis com aplicativo dedicado
3. Criar integração com sistemas de gerenciamento de caixa (ERP)
4. Desenvolver recursos de geolocalização para clientes encontrarem PDVs próximos 