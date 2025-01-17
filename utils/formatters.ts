import moment from 'moment';

export const formatDateTimeToBr = (date: string): String => {
  if (!date) return '';
  return moment(date, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY - HH:mm:ss');
};
export const formatDateToBr = (date: string): String => {
  if (!date) return '';
  return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
};

export const formatDateToCustomString = (date: string): String => {
  if (!date) return '';
  return moment(date).format('DD MMM YYYY').toUpperCase();
}

export const formatHourToBr = (hour: string): String => {
  if (!hour) return '';
  return moment(hour, 'HH:mm:ss').format('HH:mm');
};

export const formatDateToUs = (date: string): String => {
  if (!date) return '';
  return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
};

export const formatEuroValue = (value: number): string => {
  if (value === null || value === undefined) return '';
  return `€ ${value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDollarValue = (value: number): string => {
  if (value === null || value === undefined) return '';
  return `$ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatRealValue = (value: number): string => {
  if (value === null || value === undefined) return '';
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPrice = (value: any, locale: string = 'pt-BR') => {

  if (value === null || value === undefined) return '';

  let returnValue: string = '';

  returnValue = value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  return returnValue;
};

export const onFormatCellphone = (event) => {
  let value = event;

  if (!value) return event;

  value = value.replace(/^\+55/, '');

  value = value.replace(/\D/g, '');

  value = value.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');

  return value;
};

export const onFormatCPF = (event) => {
  let value = event;

  if (!value) return event;

  value = value.replace(/\D/g, '');

  value = value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2');

  return value;
};

export const onFormatCNPJ = (event) => {
  let value = event;

  if (!value) return event;

  value = value.replace(/\D/g, '');

  value = value
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')

    .replace(/\.(\d{3})(\d)/, '.$1/$2')

    .replace(/(\d{4})(\d)/, '$1-$2');

  return value;
};

export const capitalizeFirstLetters = (str: string): string => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/(^|\s|\p{P})\p{L}/gu, (char) => char.toUpperCase());
};

export const trimPayloadStrings = (payload) => {
  const trimmedPayload = { ...payload };

  Object.keys(trimmedPayload).forEach((key) => {
    if (typeof trimmedPayload[key] === 'string') {
      trimmedPayload[key] = trimmedPayload[key].trim();
    }
  });

  return trimmedPayload;
};

export const onFormatCEP = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}