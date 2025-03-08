# Template de Colaboradores do Evento

## Descrição

Este documento descreve o template de Colaboradores do Evento (Collaborators), que permite o gerenciamento de equipe e acessos ao evento no portal administrativo do Meu Ingresso.

## Propósito

O template de Colaboradores do Evento foi projetado para facilitar a gestão de pessoas que têm acesso administrativo ao evento. Permite definir papéis e permissões específicas para cada membro da equipe, garantindo controle e segurança adequados.

## Funcionalidades Principais

O template de Colaboradores do Evento inclui:

1. **Listagem de Colaboradores** - Visualização de todas as pessoas com acesso ao evento
2. **Adição de Colaboradores** - Interface para convidar novos membros para a equipe
3. **Definição de Papéis** - Atribuição de funções específicas para cada colaborador
4. **Gestão de Permissões** - Controle granular de acessos e capacidades
5. **Histórico de Atividades** - Registro de ações realizadas por cada colaborador
6. **Revogação de Acesso** - Remoção de permissões quando necessário
7. **Comunicação Interna** - Notificações e mensagens para a equipe

## Implementação

O componente principal está localizado em:
- `components/templates/EventDetailsCollaboratorsTemplate.vue`

### Estrutura do Componente

O template é construído como uma composição de componentes menores:

```
EventDetailsCollaboratorsTemplate
├── CollaboratorsList
│   └── CollaboratorCard
├── CollaboratorFormDialog
│   ├── UserSearch
│   └── RoleSelector
├── CollaboratorPermissions
│   └── PermissionToggle
├── CollaboratorActivities
└── InviteCollaboratorModal
```

### Fontes de Dados

O template consome dados de várias stores:

1. **eventCollaborators** - Informações sobre colaboradores atribuídos ao evento
2. **user** - Dados de usuários disponíveis para convite
3. **eventGeneralInfo** - Informações gerais sobre o evento
4. **eventActivities** - Registro de ações realizadas no sistema

### Papéis e Permissões

O sistema suporta diversos papéis pré-definidos e personalizáveis:

1. **Administrador** - Acesso completo a todas as funcionalidades
2. **Gerente** - Acesso amplo, mas sem permissões financeiras avançadas
3. **Operador de Check-in** - Acesso restrito ao sistema de validação de ingressos
4. **Vendedor** - Acesso apenas à venda de ingressos em PDV
5. **Analista** - Acesso somente leitura para análise de dados e relatórios

## Gerenciamento de Permissões

O template implementa um sistema granular de permissões:

1. **Por Módulo** - Permissões específicas para cada área (ingressos, pedidos, etc.)
2. **Por Ação** - Controle de operações permitidas (visualizar, editar, excluir)
3. **Herança de Papel** - Permissões básicas herdadas do papel atribuído
4. **Permissões Customizadas** - Ajustes individuais além do papel padrão

## Integração com o Sistema de Sessões

Para eventos com múltiplas sessões (pertencentes a um grupo):

1. **Colaboradores Compartilhados** - Acessos podem ser configurados para todas as sessões
2. **Permissões por Sessão** - Capacidade de definir acessos específicos por sessão
3. **Consolidação de Dados** - Visualização de atividades em todas as sessões relacionadas

## Ações Disponíveis

O template oferece as seguintes ações:

1. **Convidar Colaborador** - Adicionar novo membro à equipe do evento
2. **Definir Papel** - Atribuir ou alterar papel de um colaborador
3. **Personalizar Permissões** - Ajustar permissões específicas além do papel
4. **Remover Colaborador** - Revogar acesso de um membro da equipe
5. **Visualizar Atividades** - Acompanhar ações realizadas por cada colaborador
6. **Notificar Equipe** - Enviar comunicados para toda a equipe ou membros específicos

## Permissões

O acesso às funcionalidades de gerenciamento de colaboradores é restrito:

| Função | Acesso |
|--------|--------|
| Admin | Acesso total para gerenciar todos os colaboradores |
| Promoter | Acesso total para gerenciar colaboradores do próprio evento |
| Gerente | Capacidade de gerenciar colaboradores com níveis inferiores de acesso |
| Demais Colaboradores | Sem acesso para gerenciar outros colaboradores |

## Considerações Futuras

Possíveis melhorias:

1. Implementar sistema de aprovações multi-nível para ações críticas
2. Adicionar suporte para equipes organizadas hierarquicamente
3. Criar sistema de comunicação interna entre colaboradores
4. Desenvolver dashboard de produtividade para acompanhamento de desempenho 