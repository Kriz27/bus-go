'use client';

import { useState, type FormEvent } from 'react';
import { MapPin, Pencil, Plus, X } from 'lucide-react';
import {
  normalizeCode,
  normalizeName,
  searchStations,
  type Station,
} from '@/lib/stations';

type Props = {
  stations: Station[];
  onAdd: (station: Station) => void;
  onUpdate: (previousCode: string, station: Station) => void;
  onClose: () => void;
};

export function StationsDialog({ stations, onAdd, onUpdate, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Station | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const results = query.trim()
    ? searchStations(stations, query, [], 20)
    : stations.slice(0, 20);

  const startAdd = () => {
    setEditing(null);
    setName('');
    setCode('');
    setError('');
    setAdding(true);
  };

  const startEdit = (station: Station) => {
    setEditing(station);
    setName(station.name);
    setCode(station.code);
    setError('');
    setAdding(false);
  };

  const saveStation = (event: FormEvent) => {
    event.preventDefault();
    const next = { name: normalizeName(name), code: normalizeCode(code) };
    if (!next.name) return setError('Enter a station name.');
    if (!next.code) return setError('Enter a station code.');
    if (
      stations.some(
        (station) =>
          station.code === next.code && station.code !== editing?.code,
      )
    ) {
      return setError(`Code ${next.code} already exists.`);
    }

    if (editing) onUpdate(editing.code, next);
    else onAdd(next);
    setEditing(null);
    setAdding(false);
    setError('');
  };

  const formOpen = adding || editing !== null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stations-title"
        className="flex min-h-0 w-full flex-col overflow-hidden rounded-t-3xl bg-white p-5 sm:mx-4 sm:max-w-md sm:rounded-2xl"
        style={{ height: '92dvh', maxHeight: '92dvh' }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="stations-title" className="text-lg font-bold text-blue-950">
              Manage Stations
            </h2>
            <p className="text-sm text-slate-500">{stations.length} saved</p>
          </div>
          <button
            type="button"
            onClick={startAdd}
            className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Add station"
            title="Add station"
          >
            <Plus className="size-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        {formOpen ? (
          <form onSubmit={saveStation} className="mt-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              {editing ? 'Edit station' : 'New station'}
            </h3>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <input
                aria-label="Station name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Station name"
                className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
              />
              <input
                aria-label="Station code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="Code"
                maxLength={6}
                className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setAdding(false);
                  setError('');
                }}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editing ? 'Save station' : 'Add station'}
              </button>
            </div>
          </form>
        ) : (
          <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-blue-600">
            <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
            <span className="sr-only">Search stations</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or code"
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        )}

        {!formOpen && (
          <ul className="mt-3 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
            {results.map((station) => (
              <li
                key={`${station.name}|${station.code}`}
                className="flex items-center gap-3 py-2.5"
              >
                <MapPin
                  className="size-4 shrink-0 text-slate-400"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                  {station.name}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {station.code}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(station)}
                  aria-label={`Edit ${station.name}`}
                  title="Edit station"
                  className="flex size-9 items-center justify-center rounded-lg text-blue-700 hover:bg-blue-50"
                >
                  <Pencil className="size-4" />
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="py-4 text-center text-sm text-slate-500">
                No matching stations.
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
