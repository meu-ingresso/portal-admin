import { bob, toast } from '@/store';

export const sleep = async (ms: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

export const updateBob = async (userId: string, whoEdit: string): Promise<void> => {
  if (whoEdit !== 'Comercial') {
    bob.$bob.user_id = userId;
  }
  let target = '';

  if (bob.$bob && bob.$bob.seller_target) {
    target =
      parseFloat(bob.$bob.freight) <= parseFloat(bob.$bob.seller_target) ? 'Sim' : 'Não';
  } else {
    target = 'Sem Target';
  }

  bob.$bob.pricing_target = target;

  const response = await bob.update(bob.$bob);

  if (response.body.code === 'UPDATE_SUCCESS') {
    toast.setToast({
      text: 'BOB atualizado com sucesso!',
      type: 'success',
      time: 2000,
    });
  } else {
    toast.setToast({
      text: 'Ocorreu um erro ao atualizar o BOB',
      type: 'danger',
      time: 3000,
    });
  }
};

export const pricingUserList = (): string[] => {
  return [
    '882671ce-9dac-4b72-b348-aa96ea4b84b8', // Jared
    'c8643383-7296-41e4-822c-4fb3decf30bd', // Kayla
  ];
};

export const isMobileDevice = (vuetify: any): boolean => {
  return vuetify.breakpoint.mobile;
};

export const getNow = (): Date => {
  return new Date();
};

export const getYearList = () => {
  const currentYear = getNow().getFullYear();

  const years = [];

  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    years.push({ value: String(year), text: String(year) });
  }

  return years;
};

export const getCurrentYear = (): string => {
  return String(getNow().getFullYear());
};

export const getNextYearIfLastMonth = (): string => {
  const now = new Date();
  const currentMonthIndex = now.getMonth();

  if (currentMonthIndex === 11) {
    return String(now.getFullYear() + 1);
  }

  return String(now.getFullYear());
};

export const getInitialMonth = (): any => {
  const month = getNow().getMonth() + 1 > 11 ? 0 : getNow().getMonth() + 1;

  return getMonths()[month];
};

export const getMonths = (): any[] => {
  return [
    { value: '1', text: 'Janeiro' },
    { value: '2', text: 'Fevereiro' },
    { value: '3', text: 'Março' },
    { value: '4', text: 'Abril' },
    { value: '5', text: 'Maio' },
    { value: '6', text: 'Junho' },
    { value: '7', text: 'Julho' },
    { value: '8', text: 'Agosto' },
    { value: '9', text: 'Setembro' },
    { value: '10', text: 'Outubro' },
    { value: '11', text: 'Novembro' },
    { value: '12', text: 'Dezembro' },
  ];
};

export const getMonthList = (year: number): any[] => {
  const yearParam = Number(year);

  const now = getNow();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months = getMonths();

  const upcomingMonths = [];

  if (yearParam === currentYear) {
    const startMonth = currentMonth + 1;

    for (let i = startMonth; i < months.length; i++) {
      upcomingMonths.push(months[i]);
    }
  } else {
    return months;
  }

  return upcomingMonths;
};

export const userHasPermissions = (
  permissionList: any[],
  routePrefix: string
): boolean => {
  const allowedPrefixes = permissionList.map((permission) => permission.module_prefix);

  return allowedPrefixes.includes(routePrefix);
};
