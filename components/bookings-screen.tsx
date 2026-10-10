'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowDownWideNarrow,
  RefreshCw,
  Plus,
  Pencil,
  Ticket as TicketIcon,
  Trash2,
} from 'lucide-react';
import { GenerateTicketDialog } from '@/components/generate-ticket-dialog';
import { formatShortDate, type Ticket, type TicketInput } from '@/lib/tickets';
import type { Station } from '@/lib/stations';

type Props = {
  tickets: Ticket[];
  stations: Station[];
  onAddStation: (station: Station) => void;
  onBack: () => void;
  onGenerate: (input: TicketInput) => void;
  onUpdateTicket: (id: string, input: TicketInput) => void;
  onViewTicket: (ticket: Ticket) => void;
  onDeleteTicket: (id: string) => void;
};

const TABS = ['Upcoming', 'Completed', 'Cancelled', 'All'] as const;
type Tab = (typeof TABS)[number];

export function BookingsScreen({
  tickets,
  stations,
  onAddStation,
  onBack,
  onGenerate,
  onUpdateTicket,
  onViewTicket,
  onDeleteTicket,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [tab, setTab] = useState<Tab>('Upcoming');

  const visible = tab === 'Upcoming' || tab === 'All' ? tickets : [];
  const canDelete = tab === 'All';

  return (
    <div className="flex h-full flex-col font-display">
      <header className="flex items-center gap-4 bg-blue-600 px-5 py-4 text-white">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-full border-2 border-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-xl font-bold">My Bookings</h1>
        <ArrowDownWideNarrow className="size-6" aria-hidden />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        {canDelete && (
          <button
            type="button"
            onClick={() => {
              setEditingTicket(null);
              setOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            <Plus className="size-5" />
            Generate Custom Ticket
          </button>
        )}

        <div className="relative mt-4 flex items-center justify-center">
          <p className="text-slate-400">
            {tab} ({visible.length})
          </p>
          <RefreshCw
            className="absolute right-1 size-4 text-slate-400"
            aria-hidden
          />
        </div>

        {canDelete && visible.length > 0 && (
          <p className="mt-1 text-center font-sans text-xs text-slate-400">
            Tap the bin icon to delete a ticket
          </p>
        )}

        {visible.length === 0 ? (
          <p className="mt-16 text-center text-sm text-slate-400">
            No tickets here yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {visible.map((t) => (
              <li key={t.id}>
                <BookingCard
                  ticket={t}
                  onView={() => onViewTicket(t)}
                  onEdit={
                    canDelete
                      ? () => {
                          setEditingTicket(t);
                          setOpen(true);
                        }
                      : undefined
                  }
                  onDelete={canDelete ? () => onDeleteTicket(t.id) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <nav
        className="grid grid-cols-4 rounded-t-2xl border-t border-slate-200 bg-slate-50 pb-4 pt-3"
        aria-label="Booking filters"
      >
        {TABS.map((label) => {
          const active = tab === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              aria-pressed={active}
              className="flex flex-col items-center gap-1"
            >
              <TicketIcon
                className={`size-5 ${active ? 'fill-amber-300 text-slate-800' : 'text-slate-600'}`}
              />
              <span
                className={`text-sm ${active ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <GenerateTicketDialog
        key={editingTicket?.id ?? 'new-ticket'}
        open={open}
        initialTicket={editingTicket ?? undefined}
        stations={stations}
        onAddStation={onAddStation}
        onOpenChange={setOpen}
        onSubmit={(input) => {
          setOpen(false);
          if (editingTicket) {
            onUpdateTicket(editingTicket.id, input);
          } else {
            onGenerate(input);
          }
          setEditingTicket(null);
        }}
      />
    </div>
  );
}

function BookingCard({
  ticket,
  onView,
  onEdit,
  onDelete,
}: {
  ticket: Ticket;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="relative rounded-2xl border border-slate-300 bg-white">
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-purple-50 px-2.5 py-1 text-sm text-purple-500">
            Unreserved
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              ID: {ticket.id}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ticket ${ticket.id}`}
                title="Edit ticket"
                className="flex size-8 items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-50"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete ticket ${ticket.id}`}
                className="flex size-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-between">
          <div>
            <p className="font-sans text-sm text-slate-400">Ticket Type</p>
            <p className="text-sm font-medium text-slate-800">JOURNEY</p>
          </div>
          <div className="text-right">
            <p className="font-sans text-sm text-slate-400">Booking Date</p>
            <p className="text-sm font-medium text-slate-800">
              {formatShortDate(ticket.bookedAt)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm text-slate-800">
          <span className="truncate">{ticket.from.name}</span>
          <span className="shrink-0 font-sans text-xs text-slate-400">{`— ${ticket.distanceKm} km —`}</span>
          <span className="truncate text-right">{ticket.to.name}</span>
        </div>
      </div>

      <div className="relative border-t border-dashed border-slate-300">
        <span
          className="absolute -left-3 -top-3 size-6 rounded-full border border-slate-300 bg-white [clip-path:inset(0_0_0_50%)]"
          aria-hidden
        />
        <span
          className="absolute -right-3 -top-3 size-6 rounded-full border border-slate-300 bg-white [clip-path:inset(0_50%_0_0)]"
          aria-hidden
        />
      </div>

      <div className="flex items-center py-3">
        <span className="flex-1 text-center font-semibold text-blue-700">
          Book Again
        </span>
        <span className="h-5 w-px bg-slate-400" aria-hidden />
        <button
          type="button"
          onClick={onView}
          className="flex-1 text-center font-semibold text-blue-700"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
