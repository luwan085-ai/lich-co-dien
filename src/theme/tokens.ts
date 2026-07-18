/** Traditional Vietnamese lịch bóc palette — son đỏ + vàng kim + giấy dó. */
export const colors = {
  paper: '#FBF6EC',
  paperDeep: '#EFE6D6',
  paperFiber: '#C4B59A',
  ink: '#1F1A17',
  inkMuted: '#5C534A',
  inkFaint: '#8A7F72',
  /** Son đỏ — lacquer vermillion of Tết / lịch bloc */
  crimson: '#C41E3A',
  crimsonDeep: '#9B1830',
  crimsonSoft: '#E85A6B',
  /** Vàng kim */
  gold: '#C9A84C',
  goldSoft: '#F0D78C',
  goldDeep: '#8F7328',
  white: '#FFFaf3',
  /** Ấn triện — son ink, never purple */
  sealInk: '#B71C1C',
  sealField: '#8B1520',
  border: '#D9CBB3',
  borderStrong: '#C41E3A',
  navInactive: '#8A7F72',
  lacquer: '#A0182E',
} as const;

export const spacing = {
  page: 12,
  paperPad: 14,
} as const;
