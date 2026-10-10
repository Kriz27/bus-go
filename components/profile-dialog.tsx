'use client'

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Profile } from '@/lib/tickets'

type Props = {
  profile: Profile
  onClose: () => void
  onSave: (profile: Profile) => void
}

export function ProfileDialog({ profile, onClose, onSave }: Props) {
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const cleanPhone = phone.replace(/\s+/g, '')
    if (!name.trim()) return setError('Please enter your name.')
    if (!/^\d{10}$/.test(cleanPhone)) return setError('Enter a valid 10-digit phone number.')
    onSave({ name: name.trim(), phone: cleanPhone })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="w-full rounded-t-3xl bg-white p-6 sm:mx-4 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="profile-title" className="text-lg font-bold text-blue-950">
            Your Profile
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-slate-500">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              maxLength={10}
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
