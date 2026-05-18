import React, { useMemo, useState, useEffect } from 'react'
import {
  Phone,
  Shield,
  AlertTriangle,
  Heart,
  MapPin,
  MessageSquare,
  User,
  Plus,
  Search,
  Star,
  Clock,
  Trash2,
  Pencil,
  X,
} from 'lucide-react'
import { deleteContact, listContacts, upsertContact } from '../../lib/contactsApi'

const CATEGORY_OPTIONS = ['Family', 'Medical', 'Security', 'Emergency', 'Neighbors', 'Friends', 'Other']
const EMERGENCY_LEVEL_OPTIONS = ['Critical', 'High', 'Normal', 'Low']

function normalizeString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function formatLastContacted(ts) {
  if (!ts) return 'Never'
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  if (Number.isNaN(date.getTime())) return 'Never'
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

function getEmergencyColor(level) {
  switch (level) {
    case 'Critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'High':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'Normal':
      return 'bg-slate-100 text-slate-800 border-slate-200'
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

function emptyForm() {
  return {
    id: null,
    fullName: '',
    phoneNumber: '',
    email: '',
    category: 'Family',
    location: '',
    emergencyLevel: 'Normal',
    notes: '',
    favorite: false,
  }
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await listContacts()
      setContacts(Array.isArray(data?.contacts) ? data.contacts : [])
    } catch (e) {
      setError(e?.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(contacts.map((c) => c.category).filter(Boolean))]
    uniqueCategories.sort((a, b) => a.localeCompare(b))
    return ['All', ...uniqueCategories]
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const items = contacts.filter((contact) => {
      const matchesSearch =
        !query ||
        normalizeString(contact.fullName).toLowerCase().includes(query) ||
        normalizeString(contact.phoneNumber).toLowerCase().includes(query) ||
        normalizeString(contact.email).toLowerCase().includes(query)
      const matchesCategory = selectedCategory === 'All' || contact.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    const priorityOrder = { Critical: 4, High: 3, Normal: 2, Low: 1 }
    items.sort((a, b) => {
      if (sortBy === 'name') return normalizeString(a.fullName).localeCompare(normalizeString(b.fullName))
      if (sortBy === 'emergency') return (priorityOrder[b.emergencyLevel] || 0) - (priorityOrder[a.emergencyLevel] || 0)
      if (sortBy === 'favorites') return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0)
      return 0
    })

    return items
  }, [contacts, searchQuery, selectedCategory, sortBy])

  const stats = useMemo(() => {
    const total = contacts.length
    const favorites = contacts.filter((c) => c.favorite).length
    const critical = contacts.filter((c) => c.emergencyLevel === 'Critical').length
    const high = contacts.filter((c) => c.emergencyLevel === 'High').length
    return { total, favorites, critical, high }
  }, [contacts])

  function openAdd() {
    setForm(emptyForm())
    setShowModal(true)
  }

  function openEdit(contact) {
    setForm({
      id: contact.id,
      fullName: contact.fullName || '',
      phoneNumber: contact.phoneNumber || '',
      email: contact.email || '',
      category: contact.category || 'Family',
      location: contact.location || '',
      emergencyLevel: contact.emergencyLevel || 'Normal',
      notes: contact.notes || '',
      favorite: !!contact.favorite,
    })
    setShowModal(true)
  }

  async function onSave() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        contactId: form.id || undefined,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        category: form.category,
        location: form.location,
        emergencyLevel: form.emergencyLevel,
        notes: form.notes,
        favorite: form.favorite,
      }
      await upsertContact(payload)
      setShowModal(false)
      setForm(emptyForm())
      await refresh()
    } catch (e) {
      setError(e?.message || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(contact) {
    const ok = window.confirm(`Delete ${contact.fullName || 'this contact'}?`)
    if (!ok) return
    setError('')
    try {
      await deleteContact(contact.id)
      await refresh()
    } catch (e) {
      setError(e?.message || 'Failed to delete contact')
    }
  }

  async function toggleFavorite(contact) {
    setError('')
    try {
      await upsertContact({
        contactId: contact.id,
        fullName: contact.fullName,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        category: contact.category,
        location: contact.location,
        emergencyLevel: contact.emergencyLevel,
        notes: contact.notes,
        favorite: !contact.favorite,
      })
      await refresh()
    } catch (e) {
      setError(e?.message || 'Failed to update contact')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Contacts</h1>
            <p className="text-slate-600">Add, edit, and organize your emergency contacts.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Share List
            </button>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Contact
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Contacts</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <User className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Favorites</p>
                <p className="text-3xl font-bold text-slate-900">{stats.favorites}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Critical</p>
                <p className="text-3xl font-bold text-slate-900">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">High Priority</p>
                <p className="text-3xl font-bold text-slate-900">{stats.high}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, or email"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="name">Sort: Name</option>
                  <option value="emergency">Sort: Emergency Level</option>
                  <option value="favorites">Sort: Favorites</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600">Loading contacts…</div>
              ) : null}

              {!loading && filteredContacts.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600">
                  No contacts yet. Click “Add New Contact” to create one.
                </div>
              ) : null}

              {!loading
                ? filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-slate-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-900 truncate">{contact.fullName}</h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full border ${getEmergencyColor(
                                  contact.emergencyLevel,
                                )}`}
                              >
                                {contact.emergencyLevel || 'Normal'}
                              </span>
                              {contact.category ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                  {contact.category}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-slate-600">
                              {contact.phoneNumber ? (
                                <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${contact.phoneNumber}`}>
                                  <Phone className="w-4 h-4" />
                                  {contact.phoneNumber}
                                </a>
                              ) : null}
                              {contact.location ? (
                                <div className="inline-flex items-center gap-1 text-slate-500">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{contact.location}</span>
                                </div>
                              ) : null}
                              {contact.email ? (
                                <a className="inline-flex items-center gap-1 hover:underline" href={`mailto:${contact.email}`}>
                                  <MessageSquare className="w-4 h-4" />
                                  {contact.email}
                                </a>
                              ) : null}
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                              Last contacted: {formatLastContacted(contact.lastContactedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleFavorite(contact)}
                            className={`p-2 rounded-lg transition-colors ${
                              contact.favorite
                                ? 'text-yellow-600 bg-yellow-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title="Favorite"
                          >
                            <Star className={`w-5 h-5 ${contact.favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => openEdit(contact)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onDelete(contact)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <a
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            href={`tel:${contact.phoneNumber || ''}`}
                            title="Call"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                      {contact.notes ? <div className="mt-3 text-sm text-slate-600">{contact.notes}</div> : null}
                    </div>
                  ))
                : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 p-5 rounded-xl border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Emergency Quick Access</h3>
              <div className="space-y-3">
                <a
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  href="tel:999"
                >
                  <Phone className="w-5 h-5" />
                  Call Emergency (999)
                </a>
                <button className="w-full px-4 py-3 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alert Estate Security
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Emergency Protocol</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <p>
                    For urgent danger: call emergency services first, then contact estate security and your critical contacts.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Heart className="w-4 h-4 text-red-600 mt-0.5" />
                  <p>Keep medical details handy (allergies, conditions, medications) for faster response.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{form.id ? 'Edit Contact' : 'Add New Contact'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-700">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="text-sm text-slate-700">Phone Number</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., +254 700 123 456"
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Email (optional)</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., john@email.com"
                />
              </div>

              <div>
                <label className="text-sm text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700">Emergency Level</label>
                <select
                  value={form.emergencyLevel}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyLevel: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {EMERGENCY_LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-slate-700">Location (optional)</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Main Gate Office"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-slate-700">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[90px]"
                  placeholder="Any special instructions (gate code, meds, etc.)"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.favorite}
                    onChange={(e) => setForm((f) => ({ ...f, favorite: e.target.checked }))}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  Mark as Favorite
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
