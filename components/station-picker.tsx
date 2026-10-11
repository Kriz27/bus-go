'use client';

import { useState, type KeyboardEvent } from 'react';
import { MapPin, Plus, Search, X } from 'lucide-react';
import {
  normalizeCode,
  normalizeName,
  searchStations,
  type Station,
} from '@/lib/stations';

type BaseProps = {
  id: string;
  label: string;
  placeholder: string;
  stations: Station[];
  onAddStation: (station: Station) => void;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value: Station | null;
  onChange: (station: Station | null) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value: Station[];
  onChange: (stations: Station[]) => void;
};

export function StationPicker(props: SingleProps | MultiProps) {
  const { id, label, placeholder, stations, onAddStation } = props;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [adding, setAdding] = useState(false);

  const selected: Station[] = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];
  const results = searchStations(stations, query, selected);
  const listId = `${id}-list`;

  const select = (station: Station) => {
    if (props.multiple) props.onChange([...props.value, station]);
    else props.onChange(station);
    setQuery('');
    setOpen(false);
    setActiveIndex(0);
  };

  const remove = (station: Station) => {
    if (props.multiple)
      props.onChange(props.value.filter((s) => s !== station));
    else props.onChange(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && results[activeIndex]) {
        e.preventDefault();
        select(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (
      e.key === 'Backspace' &&
      !query &&
      props.multiple &&
      props.value.length > 0
    ) {
      remove(props.value[props.value.length - 1]);
    }
  };

  const showInput = props.multiple || !props.value;
  const showList = open && query.trim().length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
        {selected.map((station) => (
          <span
            key={`${station.name}|${station.code}`}
            className={`flex max-w-full items-center gap-1.5 rounded-lg bg-blue-50 py-1 pl-2.5 pr-1 text-sm text-blue-900 ${
              props.multiple ? '' : 'flex-1'
            }`}
          >
            <span className="truncate">
              {station.name}{' '}
              <span className="font-semibold">{station.code}</span>
            </span>
            <button
              type="button"
              onClick={() => remove(station)}
              aria-label={`Remove ${station.name}`}
              className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-blue-700 hover:bg-blue-100"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}

        {showInput && (
          <div className="flex min-w-[8rem] flex-1 items-center gap-2 py-1">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <input
              id={id}
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={handleKeyDown}
              placeholder={selected.length > 0 ? 'Add another...' : placeholder}
              className="w-full min-w-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.map((station, index) => (
            <li
              key={`${station.name}|${station.code}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(station)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${
                index === activeIndex ? 'bg-blue-50' : ''
              }`}
            >
              <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="flex-1 truncate text-slate-800">
                {station.name}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700">
                {station.code}
              </span>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">
              No matching station.
            </li>
          )}
          <li
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setAdding(true);
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Plus className="size-4" aria-hidden />
            Add new station
          </li>
        </ul>
      )}

      {!showList && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 self-start text-xs font-semibold text-blue-700"
        >
          <Plus className="size-3.5" aria-hidden />
          Add new station
        </button>
      )}

      {adding && (
        <AddStationForm
          idPrefix={id}
          initialName={query}
          stations={stations}
          onCancel={() => setAdding(false)}
          onAdd={(station) => {
            onAddStation(station);
            select(station);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function AddStationForm({
  idPrefix,
  initialName,
  stations,
  onCancel,
  onAdd,
}: {
  idPrefix: string;
  initialName: string;
  stations: Station[];
  onCancel: () => void;
  onAdd: (station: Station) => void;
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const station = { name: normalizeName(name), code: normalizeCode(code) };
    if (!station.name) return setError('Enter a station name.');
    if (!station.code) return setError('Enter a station code.');
    if (stations.some((s) => s.code === station.code))
      return setError(`Code ${station.code} already exists.`);
    onAdd(station);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
        New station
      </p>
      <div className="grid grid-cols-[1fr_6rem] gap-2">
        <input
          aria-label="New station name"
          id={`${idPrefix}-new-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Station name"
          className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
        />
        <input
          aria-label="New station code"
          id={`${idPrefix}-new-code`}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Code"
          maxLength={6}
          className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add station
        </button>
      </div>
    </div>
  );
}
