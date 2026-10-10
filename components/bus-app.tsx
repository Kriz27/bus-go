'use client';

import { useEffect, useState } from 'react';
import { HomeScreen } from '@/components/home-screen';
import { BookingsScreen } from '@/components/bookings-screen';
import { TicketScreen } from '@/components/ticket-screen';
import { ProfileDialog } from '@/components/profile-dialog';
import {
  createTicket,
  defaultProfile,
  generateTicketId,
  sampleTicket,
  type Profile,
  type Ticket,
  type TicketInput,
} from '@/lib/tickets';
import { DEFAULT_STATIONS, type Station } from '@/lib/stations';

type Screen = 'home' | 'bookings' | 'ticket';
type StoredTicket = Omit<Ticket, 'bookedAt'> & { bookedAt: string };
type StoredState = {
  tickets: StoredTicket[];
  profile: Profile;
  stations: Station[];
};

const STORAGE_KEY = 'busgo-app-state';

export function BusApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [tickets, setTickets] = useState<Ticket[]>([sampleTicket]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as Partial<StoredState>;
        if (Array.isArray(saved.tickets)) {
          setTickets(
            saved.tickets.map((ticket) => ({
              ...ticket,
              bookedAt: new Date(ticket.bookedAt),
            })),
          );
        }
        if (saved.profile) setProfile(saved.profile);
        if (Array.isArray(saved.stations)) setStations(saved.stations);
      }
    } catch {
      // Keep the in-memory defaults if saved browser data is unavailable or invalid.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    const saved: StoredState = {
      tickets: tickets.map((ticket) => ({
        ...ticket,
        bookedAt: ticket.bookedAt.toISOString(),
      })),
      profile,
      stations,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // The app remains usable if the browser blocks or runs out of storage.
    }
  }, [storageReady, tickets, profile, stations]);

  const handleDelete = (id: string) =>
    setTickets((prev) => prev.filter((t) => t.id !== id));

  const handleUpdateTicket = (id: string, input: TicketInput) =>
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...input,
              id: input.id?.trim() || generateTicketId(),
              serviceCode: ticket.serviceCode,
            }
          : ticket,
      ),
    );

  const handleGenerate = (input: TicketInput) => {
    const ticket = createTicket(input);
    setTickets((prev) => [ticket, ...prev]);
    setActiveTicket(ticket);
    setScreen('ticket');
  };

  const openTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setScreen('ticket');
  };

  return (
    <div className="min-h-dvh w-full bg-white">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white">
        {screen === 'home' && (
          <HomeScreen
            profileName={profile.name}
            upcomingTicket={tickets[0] ?? null}
            onViewTicket={openTicket}
            onNavigateBookings={() => setScreen('bookings')}
            onOpenProfile={() => setProfileOpen(true)}
          />
        )}
        {screen === 'bookings' && (
          <BookingsScreen
            tickets={tickets}
            stations={stations}
            onAddStation={(station) =>
              setStations((prev) => [...prev, station])
            }
            onBack={() => setScreen('home')}
            onGenerate={handleGenerate}
            onUpdateTicket={handleUpdateTicket}
            onViewTicket={openTicket}
            onDeleteTicket={handleDelete}
          />
        )}
        {screen === 'ticket' && activeTicket && (
          <TicketScreen
            key={activeTicket.id}
            ticket={activeTicket}
            profile={profile}
            onBack={() => setScreen('bookings')}
          />
        )}
        {profileOpen && (
          <ProfileDialog
            profile={profile}
            onClose={() => setProfileOpen(false)}
            onSave={(next) => {
              setProfile(next);
              setProfileOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
