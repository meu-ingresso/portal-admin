# Template de Listas de Convidados do Evento

## Descrição

Este documento descreve o template de Listas de Convidados do Evento (Guestlists), que permite o gerenciamento de convidados VIP, cortesias e outras listas de acesso especial no portal administrativo do Meu Ingresso.

## Propósito

O template de Listas de Convidados foi projetado para facilitar a gestão de acesso de pessoas que não adquirem ingressos pelo processo regular de vendas. Importante para relacionamento com imprensa, parceiros, patrocinadores e convidados especiais do organizador.

## Funcionalidades Principais

O template de Listas de Convidados inclui:

1. **Múltiplas Listas** - Criação e gestão de várias listas com propósitos diferentes
2. **Adição de Convidados** - Interface para adicionar pessoas às listas
3. **Confirmação de Presença** - Controle de confirmação por parte dos convidados
4. **Importação em Massa** - Funcionalidade para importar convidados via CSV
5. **Comunicação** - Envio de convites e lembretes por e-mail
6. **Check-in Dedicado** - Sistema de validação específico para convidados
7. **Relatórios** - Estatísticas e listagens para controle interno

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsGuestlistsTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsGuestlistsTemplate
├── GuestlistsTabs
│   └── GuestlistCard
├── GuestlistFormDialog
│   ├── GuestlistBasicInfo
│   └── GuestlistSettings
├── GuestMembersList
│   └── GuestMemberItem
├── GuestMemberFormDialog
│   ├── GuestMemberInfo
│   └── GuestMemberTicketAssociation
└── ImportGuestsDialog
```

### Fontes de Dados

O template consome dados principalmente da store de listas de convidados:

1. **eventGuests** - Dados sobre todas as listas e membros
2. **eventTickets** - Associação com tipos de ingressos para cortesias
3. **eventGeneralInfo** - Informações gerais sobre o evento

### Tipos de Listas Suportadas

O sistema suporta diferentes tipos de listas de convidados:

1. **VIP** - Convidados especiais com acesso prioritário
2. **Imprensa** - Jornalistas e mídia com credenciamento específico
3. **Staff** - Equipe de trabalho e produção do evento
4. **Patrocinadores** - Representantes de empresas patrocinadoras
5. **Cortesias** - Entradas gratuitas para fins promocionais

## Validações e Restrições

O template implementa diversas validações para garantir a integridade das listas:

1. **Quota** - Limite máximo de convidados por lista
2. **Duplicação** - Verificação de convidados duplicados na mesma lista
3. **Dados Obrigatórios** - Validação de informações essenciais como nome e contato
4. **Perfil do Convidado** - Categorização do convidado para fins estatísticos

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Listas por Sessão** - Configuração de listas específicas para cada sessão
2. **Convidados Recorrentes** - Funcionalidade para convidar as mesmas pessoas para múltiplas sessões
3. **Consolidação de Dados** - Visualização agregada de confirmações em todas as sessões

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Criar Lista** - Adicionar nova lista de convidados
2. **Adicionar Convidado** - Incluir pessoa em uma lista existente
3. **Importar Convidados** - Carregar múltiplos convidados via arquivo
4. **Enviar Convites** - Disparar e-mails para os convidados ainda não notificados
5. **Reenviar Convite** - Enviar lembrete para convidados ainda não confirmados
6. **Exportar Lista** - Gerar arquivo para controle ou impressão

## Permissões

O acesso às funcionalidades é controlado por permissões:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total a todas as funcionalidades |
| Promoter | Acesso total a todas as funcionalidades |
| Collaborator | Acesso baseado em permissões específicas, potencialmente limitado a listas específicas |

## Considerações Futuras

Possíveis melhorias:

1. Implementar geração de QR Codes personalizados para cada convidado
2. Adicionar sistema de pesquisa e filtros avançados para gerenciar grandes listas
3. Criar integração com redes sociais para facilitar o compartilhamento de convites
4. Implementar funcionalidade de "plus one" controlado para convidados poderem trazer acompanhantes 