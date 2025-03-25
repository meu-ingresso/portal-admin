export const handleGetResponse = (response: any, errorMessage: string, eventId?: string, filterDeleted = false) => {
  
  if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {

    if (!eventId) {
      throw new Error(`${errorMessage}`);
    }

    throw new Error(`${errorMessage} para o evento ${eventId}`);
  }

  let data = response.body.result.data;
  let meta = response.body.result.meta;
  
  if (filterDeleted) {
    // Função recursiva para filtrar objetos deletados
    const filterDeletedRecursively = (items: any[]): any[] => {
      if (!Array.isArray(items)) return items;
      
      return items.filter((item: any) => {
        // Primeiro verifica se o próprio item não está deletado
        if (item.deleted_at) return false;
        
        // Para cada propriedade do objeto
        Object.keys(item).forEach(key => {
          const value = item[key];
          
          // Se for um array, filtra recursivamente
          if (Array.isArray(value)) {
            item[key] = filterDeletedRecursively(value);
          }
          // Se for um objeto com deleted_at, verifica se está deletado
          else if (value && typeof value === 'object' && 'deleted_at' in value) {
            if (value.deleted_at) {
              item[key] = null;
            }
          }
        });
        
        return true;
      });
    };

    // Aplica o filtro recursivo nos dados
    data = filterDeletedRecursively(data);

    // Recalcula meta baseado nos itens filtrados no primeiro nível
    meta = {
      ...meta,
      total: data.length,
      lastPage: Math.ceil(data.length / meta.perPage) || 1,
      currentPage: Math.min(meta.currentPage, Math.ceil(data.length / meta.perPage) || 1)
    };
  }

  return { data, meta };
};


export const handleCreateResponse = (response: any, errorMessage: string, eventId?: string) => {
  if (!response.body || response.body.code !== 'CREATE_SUCCESS') {
    throw new Error(`${errorMessage} para o evento ${eventId}`);
  }

  return response.body.result;
};


export const handleDeleteResponse = (response: any, errorMessage: string, eventId?: string) => {
  if (!response.body || response.body.code !== 'DELETE_SUCCESS') {
    throw new Error(`${errorMessage} para o evento ${eventId}`);
  }

  return response.body.result;
};

export const handleUpdateResponse = (response: any, errorMessage: string, eventId?: string) => {
  if (!response.body || response.body.code !== 'UPDATE_SUCCESS') {
    throw new Error(`${errorMessage} para o evento ${eventId}`);
  }

  return response.body.result;
};
