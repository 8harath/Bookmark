'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button, Card, Input, Loading } from '@/components/ui'
import { getUser } from '@/utils/auth'
import type { Database } from '@/types/database'

type UserSettings = Database['public']['Tables']['user_settings']['Row']

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadUser = async () => {
    const currentUser = await getUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
  }

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setError('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)
    setError('')

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await res.json()

      if (data.success) {
        setSettings(data.settings)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header user={user} />
        <Loading />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-white">
        <Header user={user} />
        <div className="container mx-auto px-4 py-8">
          <p className="font-mono">Failed to load settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-4">SETTINGS</h1>
          <p className="font-mono mb-8">Configure your reminder preferences</p>

          {success && (
            <div className="mb-6 p-4 border-3 border-black bg-white">
              <p className="font-mono text-sm">✓ Settings saved successfully!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 border-3 border-error bg-white">
              <p className="font-mono text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Reminder Configuration */}
            <Card>
              <h2 className="mb-6">REMINDER CONFIGURATION</h2>

              <div className="space-y-6">
                {/* Enable Reminders */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminder_enabled}
                    onChange={(e) => updateSetting('reminder_enabled', e.target.checked)}
                    className="w-6 h-6 border-3 border-black"
                  />
                  <span className="font-bold uppercase text-sm">Enable Email Reminders</span>
                </label>

                {/* Frequency */}
                <div>
                  <label className="block mb-2 font-bold uppercase text-sm">Frequency</label>
                  <select
                    value={settings.reminder_frequency}
                    onChange={(e) => updateSetting('reminder_frequency', e.target.value)}
                    className="input w-full"
                    disabled={!settings.reminder_enabled}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Day of Week (for weekly/biweekly) */}
                {(settings.reminder_frequency === 'weekly' || settings.reminder_frequency === 'biweekly') && (
                  <div>
                    <label className="block mb-2 font-bold uppercase text-sm">Day of Week</label>
                    <select
                      value={settings.reminder_day_of_week || 1}
                      onChange={(e) => updateSetting('reminder_day_of_week', parseInt(e.target.value))}
                      className="input w-full"
                      disabled={!settings.reminder_enabled}
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Day of Month (for monthly) */}
                {settings.reminder_frequency === 'monthly' && (
                  <div>
                    <label className="block mb-2 font-bold uppercase text-sm">Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.reminder_day_of_month || 1}
                      onChange={(e) => updateSetting('reminder_day_of_month', parseInt(e.target.value))}
                      className="input w-full"
                      disabled={!settings.reminder_enabled}
                    />
                    <p className="mt-2 text-xs font-mono">
                      For months with fewer days, reminders will be sent on the last day of the month
                    </p>
                  </div>
                )}

                {/* Time */}
                <div>
                  <label className="block mb-2 font-bold uppercase text-sm">Time</label>
                  <input
                    type="time"
                    value={settings.reminder_time}
                    onChange={(e) => updateSetting('reminder_time', e.target.value)}
                    className="input w-full"
                    disabled={!settings.reminder_enabled}
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block mb-2 font-bold uppercase text-sm">Timezone</label>
                  <input
                    type="text"
                    value={settings.reminder_timezone}
                    onChange={(e) => updateSetting('reminder_timezone', e.target.value)}
                    className="input w-full"
                    placeholder="UTC"
                    disabled={!settings.reminder_enabled}
                  />
                  <p className="mt-2 text-xs font-mono">
                    Examples: America/New_York, Europe/London, Asia/Tokyo
                  </p>
                </div>
              </div>
            </Card>

            {/* Email Preferences */}
            <Card>
              <h2 className="mb-6">EMAIL PREFERENCES</h2>

              <div className="space-y-6">
                {/* Email Enabled */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_enabled}
                    onChange={(e) => updateSetting('email_enabled', e.target.checked)}
                    className="w-6 h-6 border-3 border-black"
                  />
                  <span className="font-bold uppercase text-sm">Enable Email Notifications</span>
                </label>

                {/* Batch Size */}
                <div>
                  <label className="block mb-2 font-bold uppercase text-sm">
                    Bookmarks per Email (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.email_batch_size}
                    onChange={(e) => updateSetting('email_batch_size', parseInt(e.target.value))}
                    className="input w-full"
                    disabled={!settings.email_enabled}
                  />
                </div>

                {/* Include Images */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_images}
                    onChange={(e) => updateSetting('include_images', e.target.checked)}
                    className="w-6 h-6 border-3 border-black"
                    disabled={!settings.email_enabled}
                  />
                  <span className="font-bold uppercase text-sm">Include Images in Emails</span>
                </label>

                {/* Include Excerpts */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.include_excerpts}
                    onChange={(e) => updateSetting('include_excerpts', e.target.checked)}
                    className="w-6 h-6 border-3 border-black"
                    disabled={!settings.email_enabled}
                  />
                  <span className="font-bold uppercase text-sm">Include Excerpts in Emails</span>
                </label>
              </div>
            </Card>

            {/* Save Button */}
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
