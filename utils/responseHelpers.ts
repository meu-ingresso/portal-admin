export const handleGetResponse = (response: any, errorMessage: string, eventId?: string, filterDeleted = false) => {
  
  if (!response.body || response.body.code !== 'SEARCH_SUCCESS') {
    throw new Error(`${errorMessage} para o evento ${eventId}`);
  }

  const data = response.body.result.data;

  if (filterDeleted) {
    return data.filter((item: any) => !item.deleted_at);
  }

  return data;
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
