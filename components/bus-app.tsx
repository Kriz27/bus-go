'use client';

import { useEffect, useRef, useState } from 'react';
import { HomeScreen } from '@/components/home-screen';
import { BookingsScreen } from '@/components/bookings-screen';
import { TicketScreen } from '@/components/ticket-screen';
import { ProfileDialog } from '@/components/profile-dialog';
import { StationsDialog } from '@/components/stations-dialog';
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
type Overlay = 'profile' | 'stations' | 'generator' | null;
type AppView = { screen: Screen; overlay: Overlay };
type StoredTicket = Omit<Ticket, 'bookedAt'> & { bookedAt: string };
type StoredState = {
  tickets: StoredTicket[];
  profile: Profile;
  stations: Station[];
};

const STORAGE_KEY = 'busgo-app-state';
const HOME_VIEW: AppView = { screen: 'home', overlay: null };

export function BusApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [tickets, setTickets] = useState<Ticket[]>([sampleTicket]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stationManagerOpen, setStationManagerOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [storageReady, setStorageReady] = useState(false);
  const [splashDelayElapsed, setSplashDelayElapsed] = useState(false);
  const viewHistory = useRef<AppView[]>([HOME_VIEW]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSplashDelayElapsed(true), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  const applyView = (view: AppView) => {
    setScreen(view.screen);
    setProfileOpen(view.overlay === 'profile');
    setStationManagerOpen(view.overlay === 'stations');
    setGeneratorOpen(view.overlay === 'generator');
  };

  const pushView = (view: AppView) => {
    window.history.pushState({ busGoView: true }, '');
    viewHistory.current.push(view);
    applyView(view);
  };

  const replaceView = (view: AppView) => {
    window.history.replaceState({ busGoView: true }, '');
    viewHistory.current[viewHistory.current.length - 1] = view;
    applyView(view);
  };

  const goBack = () => {
    if (viewHistory.current.length > 1) window.history.back();
  };

  const navigateToScreen = (nextScreen: Screen) =>
    pushView({ screen: nextScreen, overlay: null });

  const openOverlay = (overlay: Exclude<Overlay, null>) =>
    pushView({ screen, overlay });

  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, busGoView: true },
      '',
    );

    const handlePopState = () => {
      if (viewHistory.current.length > 1) viewHistory.current.pop();
      applyView(
        viewHistory.current[viewHistory.current.length - 1] ?? HOME_VIEW,
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const handleUpdateStation = (previousCode: string, station: Station) => {
    const updateStation = (current: Station) =>
      current.code === previousCode ? station : current;

    setStations((prev) => prev.map(updateStation));
    setTickets((prev) =>
      prev.map((ticket) => ({
        ...ticket,
        from: updateStation(ticket.from),
        to: updateStation(ticket.to),
        via: ticket.via.map(updateStation),
      })),
    );
  };

  const handleGenerate = (input: TicketInput) => {
    const ticket = createTicket(input);
    setTickets((prev) => [ticket, ...prev]);
    setActiveTicket(ticket);
    replaceView({ screen: 'ticket', overlay: null });
  };

  const openTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
    navigateToScreen('ticket');
  };

  return (
    <div className="min-h-dvh w-full bg-white">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white">
        {screen === 'home' && (
          <HomeScreen
            profileName={profile.name}
            upcomingTicket={tickets[0] ?? null}
            onViewTicket={openTicket}
            onNavigateBookings={() => navigateToScreen('bookings')}
            onOpenProfile={() => openOverlay('profile')}
            onManageStations={() => openOverlay('stations')}
          />
        )}
        {screen === 'bookings' && (
          <BookingsScreen
            tickets={tickets}
            stations={stations}
            onAddStation={(station) =>
              setStations((prev) => [...prev, station])
            }
            onBack={goBack}
            onGenerate={handleGenerate}
            generateOpen={generatorOpen}
            onOpenGenerator={() => openOverlay('generator')}
            onCloseGenerator={goBack}
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
            onBack={goBack}
          />
        )}
        {profileOpen && (
          <ProfileDialog
            profile={profile}
            onClose={goBack}
            onSave={(next) => {
              setProfile(next);
              goBack();
            }}
          />
        )}
        {stationManagerOpen && (
          <StationsDialog
            stations={stations}
            onAdd={(station) => setStations((prev) => [...prev, station])}
            onUpdate={handleUpdateStation}
            onClose={goBack}
          />
        )}
      </div>
      {(!storageReady || !splashDelayElapsed) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0068ff]"
          role="status"
          aria-label="Loading RailOne"
        >
          <img
            src="/bus-go/my_rail_login.png"
            alt=""
            className="w-72 max-w-[80vw] object-contain brightness-0 invert"
          />
        </div>
      )}
    </div>
  );
}
