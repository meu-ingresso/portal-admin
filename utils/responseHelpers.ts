

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
