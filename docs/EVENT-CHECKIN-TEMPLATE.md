# Template de Check-in do Evento

## Descrição

Este documento descreve o template de Check-in do Evento (Checkin), que fornece ferramentas para validação de ingressos e controle de acesso no portal administrativo do Meu Ingresso.

## Propósito

O template de Check-in do Evento foi projetado para garantir uma entrada eficiente e segura de participantes no evento, através de validação de ingressos em tempo real, monitoramento de acessos e prevenção de fraudes.

## Funcionalidades Principais

O template de Check-in do Evento inclui:

1. **Validação por QR Code** - Leitura e processamento de códigos de ingresso
2. **Pesquisa Manual** - Busca por nome, e-mail ou número do pedido
3. **Dashboard de Monitoramento** - Estatísticas em tempo real de entradas
4. **Histórico de Check-in** - Registro de todas as validações realizadas
5. **Modo Offline** - Funcionamento sem conexão com internet em caso de falhas
6. **Alertas de Segurança** - Notificações para tentativas de reuso ou ingressos inválidos
7. **Controle por Portão/Entrada** - Gestão separada para diferentes pontos de acesso

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsCheckinTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsCheckinTemplate
├── CheckinDashboard
│   ├── CheckinMetrics
│   └── CheckinRealTimeChart
├── CheckinControls
│   ├── QrCodeReader
│   └── ManualSearchForm
├── CheckinHistory
│   └── CheckinItem
├── CheckinSettings
└── CheckinGatesManagement
```

### Fontes de Dados

O template consome dados de várias stores:

1. **eventTickets** - Informações sobre os ingressos vendidos
2. **eventOrders** - Dados dos pedidos e status de pagamento
3. **eventCheckin** - Registros de check-ins realizados 
4. **eventGuests** - Dados sobre listas de convidados para validação especial

### Modos de Operação

O sistema suporta diferentes modos de check-in:

1. **Modo Padrão** - Validação completa com todas as verificações
2. **Modo Rápido** - Validação simplificada para alta demanda
3. **Modo VIP** - Fluxo especial para convidados e acessos prioritários
4. **Modo Multi-dia** - Para eventos com várias datas e controle de acesso por dia
5. **Modo Reentrada** - Permite saída e retorno de participantes no mesmo dia

## Validações e Verificações

O template implementa diversas verificações para garantir a segurança:

1. **Autenticidade** - Verificação criptográfica do QR Code
2. **Status de Pagamento** - Confirmação de que o pedido foi pago
3. **Utilização Prévia** - Verificação se o ingresso já foi utilizado
4. **Tipo de Ingresso** - Validação de categoria, área ou setor
5. **Data/Horário** - Confirmação de validade temporal do ingresso

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Validação por Sessão** - Garantia de que o ingresso está sendo usado na data correta
2. **Check-in Cruzado** - Configuração para permitir ou bloquear uso de ingressos entre sessões
3. **Estatísticas Consolidadas** - Métricas agregadas de todas as sessões do grupo

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Iniciar Check-in** - Ativar o modo de validação para o evento
2. **Validar Ingresso** - Processar QR Code ou busca manual
3. **Configurar Portões** - Definir diferentes pontos de entrada
4. **Gerenciar Operadores** - Adicionar e controlar acesso de validadores
5. **Reverter Check-in** - Cancelar uma validação em caso de erro
6. **Exportar Relatório** - Gerar relatório completo de entradas e estatísticas

## Permissões

O acesso às funcionalidades é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as funcionalidades |
| Promoter | Acesso total a todas as funcionalidades |
| Collaborator | Acesso baseado em permissões específicas |
| Operador de Check-in | Acesso limitado à validação de ingressos |

## Considerações Futuras

Possíveis melhorias:

1. Implementar reconhecimento facial para validação adicional
2. Adicionar suporte para pulseiras/cartões RFID integrados
3. Desenvolver mapas de calor para visualização de fluxo de pessoas
4. Implementar sistema de contagem automática por câmeras para comparação com dados de check-in 