/**
 * Script de limpeza de imagens temporárias órfãs
 * Execute periodicamente para remover imagens temporárias antigas
 * 
 * Identifica imagens temporárias pelos padrões:
 * - temp_{timestamp}_biography_{filename} (userDocuments)
 * - temp_{timestamp}_event_description_{filename} (eventAttachments)
 * 
 * Usage: node scripts/cleanup-temp-images.js
 */

const { userDocuments, event } = require('../utils/store-util');

async function cleanupOrphanedTempImages() {
  try {
    console.log('Iniciando limpeza de imagens temporárias órfãs...');
    
    let cleanedCount = 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 1. Limpeza de userDocuments (biografia)
    const allImageAttachments = await userDocuments.getAllUserAttachments({
      type: 'image'
    });
    
    for (const attachment of allImageAttachments) {
      try {
        if (attachment.name && attachment.name.startsWith('temp_')) {
          const nameParts = attachment.name.split('_');
          if (nameParts.length >= 4) {
            const timestamp = parseInt(nameParts[1]);
            const context = nameParts[2];
            
            if (!isNaN(timestamp)) {
              const uploadedAt = new Date(timestamp);
              
              if (uploadedAt < oneDayAgo) {
                await userDocuments.deleteUserAttachment(attachment.id);
                
                const originalFileName = nameParts.slice(3).join('_');
                console.log(`Imagem temporária órfã removida [userDoc-${context}]: ${originalFileName} (ID: ${attachment.id})`);
                cleanedCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao processar userAttachment ${attachment.id}:`, error);
      }
    }
    
    // 2. Limpeza de eventAttachments (descrição de eventos)
    try {
      // Buscar todos os attachments de evento do tipo imagem com nome temporário
      const eventAttachments = await event.getEventAttachments({
        type: 'image',
        namePattern: 'temp_%'
      });
      
      for (const attachment of eventAttachments || []) {
        try {
          if (attachment.name && attachment.name.startsWith('temp_')) {
            const nameParts = attachment.name.split('_');
            if (nameParts.length >= 4) {
              const timestamp = parseInt(nameParts[1]);
              const context = nameParts[2];
              
              if (!isNaN(timestamp)) {
                const uploadedAt = new Date(timestamp);
                
                if (uploadedAt < oneDayAgo) {
                  await event.deleteEventAttachment(attachment.id);
                  
                  const originalFileName = nameParts.slice(3).join('_');
                  console.log(`Attachment temporário órfão removido [event-${context}]: ${originalFileName} (ID: ${attachment.id})`);
                  cleanedCount++;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar eventAttachment ${attachment.id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar eventAttachments (método pode não existir):', error.message);
    }
    
    console.log(`Limpeza concluída. ${cleanedCount} imagens temporárias órfãs removidas.`);
    
    if (cleanedCount === 0) {
      console.log('✅ Nenhuma imagem temporária órfã encontrada. Sistema limpo!');
    }
    
  } catch (error) {
    console.error('Erro na limpeza de imagens temporárias:', error);
    throw error;
  }
}

// Função adicional para listar imagens temporárias sem deletar
async function listTempImages() {
  try {
    console.log('Listando imagens temporárias...');
    
    const tempImages = [];
    
    // 1. Buscar em userDocuments
    const allImageAttachments = await userDocuments.getAllUserAttachments({
      type: 'image'
    });
    
    for (const attachment of allImageAttachments) {
      if (attachment.name && attachment.name.startsWith('temp_')) {
        const nameParts = attachment.name.split('_');
        if (nameParts.length >= 4) {
          const timestamp = parseInt(nameParts[1]);
          const context = nameParts[2];
          if (!isNaN(timestamp)) {
            const uploadedAt = new Date(timestamp);
            const hoursOld = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
            const originalFileName = nameParts.slice(3).join('_');
            
            tempImages.push({
              id: attachment.id,
              name: attachment.name,
              context: `userDoc-${context}`,
              originalFileName,
              uploadedAt,
              hoursOld,
              source: 'userDocuments'
            });
          }
        }
      }
    }
    
    // 2. Buscar em eventAttachments
    try {
      const eventAttachments = await event.getEventAttachments({
        type: 'image',
        namePattern: 'temp_%'
      });
      
      for (const attachment of eventAttachments || []) {
        if (attachment.name && attachment.name.startsWith('temp_')) {
          const nameParts = attachment.name.split('_');
          if (nameParts.length >= 4) {
            const timestamp = parseInt(nameParts[1]);
            const context = nameParts[2];
            if (!isNaN(timestamp)) {
              const uploadedAt = new Date(timestamp);
              const hoursOld = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
              const originalFileName = nameParts.slice(3).join('_');
              
              tempImages.push({
                id: attachment.id,
                name: attachment.name,
                context: `event-${context}`,
                originalFileName,
                uploadedAt,
                hoursOld,
                source: 'eventAttachments'
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar eventAttachments:', error.message);
    }
    
    if (tempImages.length === 0) {
      console.log('✅ Nenhuma imagem temporária encontrada.');
    } else {
      console.log(`📋 ${tempImages.length} imagens temporárias encontradas:`);
      
      // Agrupar por contexto
      const groupedByContext = tempImages.reduce((acc, img) => {
        if (!acc[img.context]) acc[img.context] = [];
        acc[img.context].push(img);
        return acc;
      }, {});
      
      Object.keys(groupedByContext).forEach(context => {
        console.log(`\n📁 Contexto: ${context}`);
        groupedByContext[context].forEach(img => {
          console.log(`  - ${img.originalFileName} (${img.hoursOld}h atrás) - ID: ${img.id} [${img.source}]`);
        });
      });
    }
    
    return tempImages;
  } catch (error) {
    console.error('Erro ao listar imagens temporárias:', error);
    throw error;
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    // Apenas listar sem deletar
    listTempImages()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Falha na execução do script:', error);
        process.exit(1);
      });
  } else {
    // Executar limpeza
    cleanupOrphanedTempImages()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Falha na execução do script:', error);
        process.exit(1);
      });
  }
}

module.exports = { cleanupOrphanedTempImages, listTempImages }; 