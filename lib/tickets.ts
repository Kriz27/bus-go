import type { Station } from './stations';

export type ServiceType = 'MAIL/EXPRESS' | 'ORDINARY';

export type Profile = {
  name: string;
  phone: string;
};

export const defaultProfile: Profile = {
  name: 'Gokul Kumar P',
  phone: '8838749614',
};

export type Ticket = {
  id: string;
  from: Station;
  to: Station;
  via: Station[];
  amount: number;
  distanceKm: number;
  bookedAt: Date;
  adults: number;
  children: number;
  serviceCode: string;
  serviceType: ServiceType;
  active: boolean;
  color: string;
};

export const TICKET_COLORS = [
  { name: 'Pink', hex: '#f9c6dc' },
  { name: 'Orange', hex: '#fbb26a' },
  { name: 'Brown', hex: '#c29a78' },
  { name: 'Green', hex: '#8ee38f' },
  { name: 'Cyan', hex: '#7fe0ee' },
] as const;

export const DEFAULT_TICKET_COLOR = TICKET_COLORS[0].hex;

export const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

export type TicketInput = Omit<Ticket, 'id' | 'serviceCode'> & {
  id?: string;
};

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomLetters = (length: number) =>
  Array.from({ length }, () => LETTERS[randomInt(0, LETTERS.length - 1)]).join(
    '',
  );

const randomDigits = (length: number) =>
  Array.from({ length }, () => randomInt(0, 9)).join('');

export const generateTicketId = () =>
  `XT${randomInt(4, 7)}${randomLetters(4)}${randomDigits(3)}`;

export const generateServiceCode = () =>
  `${Math.random() < 0.5 ? 'R228' : 'R227'}${randomDigits(2)}`;

export const formatVia = (via: Station[]) =>
  via.length === 0 ? '---' : via.map((s) => s.code).join('-');

export function createTicket(input: TicketInput): Ticket {
  return {
    ...input,
    id: input.id?.trim() || generateTicketId(),
    serviceCode: generateServiceCode(),
  };
}

export const sampleTicket: Ticket = {
  id: 'XT5KQMW482',
  from: { name: 'YESVANTPUR JN.', code: 'YPR' },
  to: { name: 'DHARMAPURI', code: 'DPJ' },
  via: [{ name: 'HOSUR', code: 'HSRA' }],
  amount: 75,
  distanceKm: 159,
  bookedAt: new Date('2026-08-29T14:43:00'),
  adults: 1,
  children: 0,
  serviceCode: 'R22772',
  serviceType: 'MAIL/EXPRESS',
  active: false,
  color: DEFAULT_TICKET_COLOR,
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number) => n.toString().padStart(2, '0');

export const formatTime = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const formatLongDateTime = (d: Date) =>
  `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${formatTime(
    d,
  )}`;

export const formatShortDate = (d: Date) =>
  `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d
    .getFullYear()
    .toString()
    .slice(2)}`;

export const formatNumericDateTime = (d: Date) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${formatTime(
    d,
  )}`;

export const toDateTimeLocalValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${formatTime(
    d,
  )}`;
