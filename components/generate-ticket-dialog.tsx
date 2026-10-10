'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import {
  DEFAULT_TICKET_COLOR,
  TICKET_COLORS,
  isHexColor,
  toDateTimeLocalValue,
  type ServiceType,
  type Ticket,
  type TicketInput,
} from '@/lib/tickets';
import type { Station } from '@/lib/stations';
import { ColorWheel } from '@/components/color-wheel';
import { StationPicker } from '@/components/station-picker';

type Props = {
  open: boolean;
  initialTicket?: Ticket;
  stations: Station[];
  onAddStation: (station: Station) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: TicketInput) => void;
};

const SERVICE_TYPES: ServiceType[] = ['MAIL/EXPRESS', 'ORDINARY'];
const LAST_PICKED_COLOR_KEY = 'busgo-last-picked-ticket-color';

export function GenerateTicketDialog({
  open,
  initialTicket,
  stations,
  onAddStation,
  onOpenChange,
  onSubmit,
}: Props) {
  const [from, setFrom] = useState<Station | null>(initialTicket?.from ?? null);
  const [to, setTo] = useState<Station | null>(initialTicket?.to ?? null);
  const [amount, setAmount] = useState(
    initialTicket ? String(initialTicket.amount) : '',
  );
  const [distance, setDistance] = useState(
    initialTicket ? String(initialTicket.distanceKm) : '',
  );
  const [ticketId, setTicketId] = useState(initialTicket?.id ?? '');
  const [bookedAt, setBookedAt] = useState(
    initialTicket ? toDateTimeLocalValue(initialTicket.bookedAt) : '',
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    initialTicket?.serviceType ?? 'MAIL/EXPRESS',
  );
  const [via, setVia] = useState<Station[]>(initialTicket?.via ?? []);
  const [adults, setAdults] = useState(initialTicket?.adults ?? 1);
  const [children, setChildren] = useState(initialTicket?.children ?? 0);
  const [active, setActive] = useState(initialTicket?.active ?? true);
  const [color, setColor] = useState<string>(
    initialTicket?.color ?? DEFAULT_TICKET_COLOR,
  );
  const [lastPickedColor, setLastPickedColor] =
    useState<string>(DEFAULT_TICKET_COLOR);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedColor = localStorage.getItem(LAST_PICKED_COLOR_KEY);
      if (savedColor && isHexColor(savedColor)) setLastPickedColor(savedColor);
    } catch {
      // Keep the default custom swatch when browser storage is unavailable.
    }
  }, []);

  if (!open) return null;

  const selectColor = (hex: string) => {
    setColor(hex);
    setLastPickedColor(hex);
    try {
      localStorage.setItem(LAST_PICKED_COLOR_KEY, hex);
    } catch {
      // The color remains selected for this ticket if browser storage is unavailable.
    }
  };

  const dateValue = bookedAt || toDateTimeLocalValue(new Date());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountValue = Number(amount);
    const distanceValue = Number(distance);
    const date = new Date(dateValue);
    if (!from || !to)
      return setError('Please select both From and To stations.');
    if (from.code === to.code)
      return setError('From and To stations must be different.');
    if (!Number.isFinite(distanceValue) || distanceValue <= 0)
      return setError('Enter a valid distance.');
    if (!Number.isFinite(amountValue) || amountValue <= 0)
      return setError('Enter a valid amount.');
    if (Number.isNaN(date.getTime()))
      return setError('Enter a valid booking date & time.');
    if (adults + children < 1) return setError('Add at least one passenger.');
    setError('');
    onSubmit({
      id: ticketId.trim() || undefined,
      from,
      to,
      via,
      adults,
      children,
      amount: Math.round(amountValue * 100) / 100,
      distanceKm: Math.round(distanceValue),
      bookedAt: date,
      serviceType,
      active,
      color,
    });
    setFrom(null);
    setTo(null);
    setAmount('');
    setDistance('');
    setTicketId('');
    setBookedAt('');
    setServiceType('MAIL/EXPRESS');
    setVia([]);
    setAdults(1);
    setChildren(0);
    setActive(true);
    setColor(DEFAULT_TICKET_COLOR);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-title"
        className="max-h-full w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:mx-4 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="generate-title" className="text-lg font-bold text-blue-950">
            {initialTicket ? 'Edit Custom Ticket' : 'Generate Custom Ticket'}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="text-slate-500"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <StationPicker
            id="from"
            label="From Station"
            placeholder="Search name or code, e.g. YPR"
            stations={stations}
            onAddStation={onAddStation}
            value={from}
            onChange={setFrom}
          />
          <StationPicker
            id="to"
            label="To Station"
            placeholder="Search name or code, e.g. DPJ"
            stations={stations}
            onAddStation={onAddStation}
            value={to}
            onChange={setTo}
          />
          <StationPicker
            multiple
            id="via"
            label="Via (optional, multiple allowed)"
            placeholder="Leave empty to show ---"
            stations={stations}
            onAddStation={onAddStation}
            value={via}
            onChange={setVia}
          />
          <Field
            id="ticketId"
            label="Ticket ID (optional)"
            value={ticketId}
            onChange={setTicketId}
            placeholder="Leave empty to generate automatically"
            required={false}
          />
          <div className="grid grid-cols-2 gap-3">
            <Counter
              label="Adults"
              value={adults}
              onChange={setAdults}
              min={0}
            />
            <Counter
              label="Children"
              value={children}
              onChange={setChildren}
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="distance"
              label="Distance (km)"
              value={distance}
              onChange={setDistance}
              placeholder="e.g. 159"
              type="number"
              inputMode="numeric"
            />
            <Field
              id="amount"
              label="Amount (₹)"
              value={amount}
              onChange={setAmount}
              placeholder="e.g. 75"
              type="number"
              inputMode="decimal"
            />
          </div>
          <Field
            id="bookedAt"
            label="Booking Date & Time"
            value={dateValue}
            onChange={setBookedAt}
            placeholder=""
            type="datetime-local"
          />

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Service Type
            </legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {SERVICE_TYPES.map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${
                    serviceType === type
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={type}
                    checked={serviceType === type}
                    onChange={() => setServiceType(type)}
                    className="sr-only"
                  />
                  {type === 'MAIL/EXPRESS' ? 'Express' : 'Ordinary'}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Ticket Version
            </legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {[
                { value: true, label: 'Active' },
                { value: false, label: 'Non-Active' },
              ].map((option) => (
                <label
                  key={option.label}
                  className={`cursor-pointer rounded-lg py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${
                    active === option.value
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="ticketVersion"
                    checked={active === option.value}
                    onChange={() => setActive(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Ticket Color
            </legend>
            <ColorWheel value={color} onChange={selectColor} />
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                Last picked
              </span>
              <button
                type="button"
                aria-label={`Use last picked color ${lastPickedColor}`}
                title={`Last picked ${lastPickedColor}`}
                onClick={() => selectColor(lastPickedColor)}
                className={`size-10 rounded-full border-2 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  color === lastPickedColor
                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                    : 'border-white shadow'
                }`}
                style={{ backgroundColor: lastPickedColor }}
              />
              <span className="font-mono text-xs uppercase text-slate-600">
                {lastPickedColor}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {TICKET_COLORS.map((option) => (
                <label
                  key={option.hex}
                  title={option.name}
                  className={`size-10 cursor-pointer rounded-full border-2 transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${
                    color === option.hex
                      ? 'border-blue-600 ring-2 ring-blue-600/30'
                      : 'border-white shadow'
                  }`}
                  style={{ backgroundColor: option.hex }}
                >
                  <input
                    type="radio"
                    name="ticketColor"
                    aria-label={option.name}
                    checked={color === option.hex}
                    onChange={() => selectColor(option.hex)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {initialTicket ? 'Save Changes' : 'Generate Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
}) {
  const max = 9;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center justify-between rounded-xl border border-slate-300 p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span
          className="font-semibold tabular-nums text-slate-900"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: 'decimal' | 'numeric';
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        min={type === 'number' ? '1' : undefined}
        step={type === 'number' ? 'any' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
      />
    </div>
  );
}
