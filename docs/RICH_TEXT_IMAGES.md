# 📝 Sistema de Upload de Imagens - Rich Text Editor

## Visão Geral

Sistema profissional de upload de imagens para o `RichTextEditorV2.vue` que gerencia imagens temporárias e permanentes usando convenções de naming, sem necessidade de modificações no schema da base de dados.

## 🏗️ Arquitetura

### Estrutura da Base de Dados
```sql
-- Tabela existente (sem modificações)
user_attachments:
  - id (primary key)
  - name (string) ← Usado para controle de estado
  - type (string) ← 'image'
  - value (string) ← URL da imagem
  - user_id (foreign key)
```

### Convenções de Naming

#### Imagens Temporárias
```
temp_{timestamp}_biography_{filename}
temp_{timestamp}_event_description_{filename}
```
**Exemplos:** 
- `temp_1640995200000_biography_foto-perfil.jpg`
- `temp_1640995200000_event_description_banner-evento.jpg`

#### Imagens Permanentes
```
biography_image_{timestamp}_{filename}
event_description_image_{timestamp}_{filename}
```
**Exemplos:** 
- `biography_image_1640995500000_foto-perfil.jpg`
- `event_description_image_1640995500000_banner-evento.jpg`

## 🔄 Fluxo de Funcionamento

### 1. Upload Inicial
```javascript
// Gera nome temporário
const timestamp = Date.now();
const tempName = `temp_${timestamp}_biography_${file.name}`;

// Cria documento temporário
const imageDoc = await userDocuments.createUserDocument({
  name: tempName,
  type: 'image',
  userId: this.userId
});
```

### 2. Tracking Local
```javascript
// Adiciona ao array de controle local
this.tempUploadedImages.push({
  id: imageDoc.id,
  name: tempName,
  url: imageUrl,
  fileName: file.name,
  uploadedAt: timestamp
});
```

### 3. Salvamento (Confirmação)
```javascript
// Renomeia para nome permanente
const permanentName = `biography_image_${Date.now()}_${image.fileName}`;
await userDocuments.updateUserAttachment({
  id: image.id,
  name: permanentName
});
```

### 4. Cancelamento (Limpeza)
```javascript
// Remove imagens temporárias
await userDocuments.deleteUserAttachment(image.id);
```

## 🛠️ Scripts de Manutenção

### Limpeza Automática
```bash
# Remover imagens temporárias órfãs (>24h)
node scripts/cleanup-temp-images.js

# Apenas listar imagens temporárias (sem deletar)
node scripts/cleanup-temp-images.js --list
```

### Saída do Script
```bash
$ node scripts/cleanup-temp-images.js --list
Listando imagens temporárias...
📋 2 imagens temporárias encontradas:
  - foto-perfil.jpg (3h atrás) - ID: 123
  - banner.png (12h atrás) - ID: 124
```

## 🔍 Identificação de Imagens

### Como Identificar Imagens Temporárias
```javascript
function isTemporaryImage(attachmentName) {
  return attachmentName && attachmentName.startsWith('temp_');
}

function extractTimestamp(tempName) {
  const parts = tempName.split('_');
  return parts.length >= 3 ? parseInt(parts[1]) : null;
}

function extractOriginalFileName(tempName) {
  const parts = tempName.split('_');
  return parts.length >= 4 ? parts.slice(3).join('_') : 'unknown';
}
```

### Queries Úteis para Debug
```sql
-- Listar todas as imagens temporárias
SELECT * FROM user_attachments 
WHERE type = 'image' AND name LIKE 'temp_%';

-- Listar imagens temporárias por contexto
SELECT * FROM user_attachments 
WHERE type = 'image' 
  AND name LIKE 'temp_%_biography_%';

SELECT * FROM user_attachments 
WHERE type = 'image' 
  AND name LIKE 'temp_%_event_description_%';

-- Listar imagens temporárias antigas (>24h)
SELECT * FROM user_attachments 
WHERE type = 'image' 
  AND name LIKE 'temp_%'
  AND created_at < NOW() - INTERVAL 24 HOUR;

-- Contar imagens por tipo e contexto
SELECT 
  CASE 
    WHEN name LIKE 'temp_%_biography_%' THEN 'temporárias_biografia'
    WHEN name LIKE 'temp_%_event_description_%' THEN 'temporárias_evento'
    WHEN name LIKE 'biography_image_%' THEN 'biografia_confirmadas'
    WHEN name LIKE 'event_description_image_%' THEN 'evento_confirmadas'
    ELSE 'outros'
  END as tipo,
  COUNT(*) as quantidade
FROM user_attachments 
WHERE type = 'image'
GROUP BY tipo;
```

## 🔒 Vantagens da Solução

### ✅ Benefícios
- **Zero Invasividade**: Não requer mudanças no schema
- **Compatibilidade**: Funciona com estrutura existente
- **Rastreabilidade**: Timestamp embutido no nome
- **Cleanup Automático**: Scripts de manutenção inclusos
- **Debugging**: Fácil identificação visual
- **Performance**: Operações rápidas baseadas em string matching

### ✅ Proteções Implementadas
- **Cleanup no Cancel**: Remove imagens não utilizadas
- **Cleanup na Saída**: Proteção contra navegação acidental
- **Cleanup Periódico**: Script para manutenção do sistema
- **Validação de Formato**: Apenas tipos de imagem aceitos
- **Limite de Tamanho**: Configurable (padrão: 2MB)

## 🚀 Opções de Evolução

### Opção A: Manter Sistema Atual
- ✅ Funciona perfeitamente
- ✅ Sem impacto na base de dados
- ✅ Fácil manutenção

### Opção B: Adicionar Campo `metadata` (Recomendado para Longo Prazo)
```sql
ALTER TABLE user_attachments 
ADD COLUMN metadata JSON DEFAULT NULL;
```

**Vantagens:**
- Mais flexível para futuros metadados
- Estrutura mais profissional
- Facilita queries complexas

**Migração:**
```javascript
// Migrar dados existentes
UPDATE user_attachments 
SET metadata = JSON_OBJECT(
  'isTemporary', name LIKE 'temp_%',
  'uploadedAt', FROM_UNIXTIME(SUBSTRING(name, 6, 13)/1000),
  'context', 'biography'
)
WHERE type = 'image' AND name LIKE 'temp_%';
```

### Opção C: Tabela Separada para Tracking
```sql
CREATE TABLE image_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attachment_id INT,
  is_temporary BOOLEAN DEFAULT TRUE,
  context VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attachment_id) REFERENCES user_attachments(id)
);
```

## 📊 Monitoramento

### Métricas Recomendadas
- Número de imagens temporárias por usuário
- Tempo médio entre upload e confirmação
- Taxa de cancelamento vs. confirmação
- Frequência de limpeza de órfãs

### Logs Importantes
```javascript
// Logs de produção úteis
console.log(`Imagem temporária criada: ${tempName}`);
console.log(`Imagem confirmada: ${fileName} -> ${permanentName}`);
console.log(`Limpeza executada: ${cleanedCount} imagens removidas`);
```

## 🎯 Recomendação Final

A solução atual com convenções de naming é **robusta e pronta para produção**. Para projetos de longo prazo, recomendo evoluir para a **Opção B** (campo metadata) quando houver uma janela de manutenção adequada.

O sistema está otimizado para:
- ⚡ **Performance**: Operações rápidas
- 🛡️ **Confiabilidade**: Múltiplas camadas de proteção
- 🔧 **Manutenibilidade**: Scripts e logs abrangentes
- 👥 **UX**: Experiência fluida para o usuário 

## 🎯 Integração com Formulários

### Biografia de Usuário (my-page.vue)
- **Contexto**: `biography`
- **Salvamento**: Integrado com botões Salvar/Cancelar
- **Cleanup**: Automático em cancelamento e navegação

### Descrição de Evento (StepGeneralInfo.vue)
- **Contexto**: `event_description`
- **Salvamento**: Integrado com processo de criação/edição de eventos
- **Cleanup**: Automático em caso de erro ou cancelamento
- **Métodos Públicos**:
  - `confirmDescriptionImages()`: Confirma imagens ao salvar evento
  - `cancelDescriptionImages()`: Limpa imagens em caso de erro
  - `hasTemporaryImages()`: Verifica se há imagens pendentes 