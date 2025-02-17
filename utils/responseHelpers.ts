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
    data = data.filter((item: any) => !item.deleted_at);
    // Recalcula meta baseado nos itens filtrados
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
