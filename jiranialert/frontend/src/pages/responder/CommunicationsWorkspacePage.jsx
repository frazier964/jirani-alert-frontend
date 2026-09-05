import { useCallback, useEffect, useState } from 'react'
import { Bell, Phone, Radio, Send, Video } from 'lucide-react'
import { listConversationMessages, listConversations, recordCommunicationAction, sendConversationMessage } from '../../lib/responderWorkspaceApi'
import { ResponderShell } from './ResponderComponents'

function messageTime(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function CommunicationsWorkspacePage() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    try {
      const response = await listConversations()
      const next = response.conversations || []
      setConversations(next)
      setSelected((current) => next.find((conversation) => conversation.id === current?.id) || next[0] || null)
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load channels')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId = selected?.id) => {
    if (!conversationId) return
    try {
      const response = await listConversationMessages(conversationId)
      setMessages(response.messages || [])
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load messages')
    }
  }, [selected?.id])

  useEffect(() => {
    const initialLoad = window.setTimeout(loadConversations, 0)
    const timer = window.setInterval(loadConversations, 5000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(timer)
    }
  }, [loadConversations])

  useEffect(() => {
    const initialLoad = window.setTimeout(loadMessages, 0)
    if (!selected?.id) return () => window.clearTimeout(initialLoad)
    const timer = window.setInterval(() => loadMessages(selected.id), 3000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(timer)
    }
  }, [loadMessages, selected?.id])

  const send = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !selected?.id || sending) return
    setSending(true)
    try {
      const response = await sendConversationMessage(selected.id, draft.trim())
      setMessages((current) => [...current, response.message])
      setDraft('')
      await loadConversations()
    } catch (requestError) {
      setError(requestError?.message || 'Unable to send message')
    } finally {
      setSending(false)
    }
  }

  const logAction = async (type) => {
    if (!selected?.id) return
    try {
      await recordCommunicationAction(selected.id, type)
      setError(`${type === 'call' ? 'Call' : 'Video call'} action logged for this channel.`)
    } catch (requestError) {
      setError(requestError?.message || 'Unable to log communication action')
    }
  }

  return <ResponderShell><div className="grid gap-5">
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Communications</h1><p className="mt-2 text-slate-600">Persistent responder channels with backend-saved messages.</p></div><Radio className="h-10 w-10 text-red-500" /></div></header>
    {error ? <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div> : null}
    <section className="grid min-h-[620px] overflow-hidden border border-slate-200 bg-white shadow-sm lg:grid-cols-[280px_1fr]"><aside className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between px-2"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Channels</p><Bell className="h-4 w-4 text-slate-400" /></div><div className="mt-3 grid gap-2">{loading ? <p className="p-3 text-sm text-slate-500">Loading channels...</p> : conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => setSelected(conversation)} className={`rounded-xl p-3 text-left transition ${selected?.id === conversation.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-white'}`}><p className="font-bold">{conversation.name}</p><p className={`mt-1 truncate text-xs ${selected?.id === conversation.id ? 'text-slate-300' : 'text-slate-500'}`}>{conversation.lastMessage || 'No messages yet'}</p><p className={`mt-2 text-xs ${selected?.id === conversation.id ? 'text-slate-300' : 'text-slate-400'}`}>{conversation.participants} members</p></button>)}</div></aside><div className="flex min-h-[620px] flex-col"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h2 className="text-lg font-black text-slate-900">{selected?.name || 'Select a channel'}</h2><p className="mt-1 text-xs text-slate-500">{selected?.participants || 0} responders in this channel</p></div><div className="flex gap-2"><button type="button" disabled={!selected} onClick={() => logAction('call')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Phone className="h-4 w-4" />Call</button><button type="button" disabled={!selected} onClick={() => logAction('video')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Video className="h-4 w-4" />Video</button></div></header><div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-5">{messages.length ? messages.map((message) => <article key={message.id} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-slate-900">{message.senderName || 'Responder'}</strong><time className="text-xs text-slate-400">{messageTime(message.createdAt)}</time></div><p className="mt-2 text-sm leading-6 text-slate-700">{message.content}</p></article>) : <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-slate-500">No messages in this channel yet.</div>}</div><form onSubmit={send} className="flex gap-3 border-t border-slate-200 bg-white p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!selected || sending} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400" placeholder={selected ? 'Write an operational message...' : 'Select a channel first'} /><button type="submit" disabled={!selected || !draft.trim() || sending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Sending...' : 'Send'}</button></form></div></section>
  </div></ResponderShell>
}
