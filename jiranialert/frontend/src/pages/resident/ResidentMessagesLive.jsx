import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Phone, Send, Video, Zap } from 'lucide-react'
import * as messagesApi from '../../lib/messagesApi'

function displayTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ResidentMessagesLive() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastText, setBroadcastText] = useState('')
  const endRef = useRef(null)

  const loadConversations = useCallback(async () => {
    try {
      const result = await messagesApi.listConversations()
      setConversations(result.conversations || [])
      setSelected((current) => (result.conversations || []).find((item) => item.id === current?.id) || result.conversations?.[0] || null)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    try {
      const result = await messagesApi.listMessages(conversationId)
      setMessages(result.messages || [])
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => { void loadConversations() }, [loadConversations])
  useEffect(() => { void loadMessages(selected?.id) }, [selected?.id, loadMessages])
  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadConversations()
      void loadMessages(selected?.id)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [loadConversations, loadMessages, selected?.id])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const run = async (work, success) => {
    setBusy(true); setError(''); setNotice('')
    try { await work(); if (success) setNotice(success); await loadConversations(); await loadMessages(selected?.id) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const submitMessage = () => {
    const content = text.trim()
    if (!content || !selected) return
    void run(async () => { await messagesApi.sendMessage(selected.id, content); setText('') })
  }

  const communication = (type) => {
    if (!selected) return
    void run(() => messagesApi.recordCall(selected.id, type), `${type === 'video' ? 'Video-call' : 'Call'} request saved. The group has been notified.`)
  }

  const submitBroadcast = () => {
    const content = broadcastText.trim()
    if (!content || !selected) return
    void run(async () => { await messagesApi.broadcastEmergency(selected.id, content); setBroadcastText(''); setBroadcastOpen(false) }, 'Emergency broadcast sent and saved.')
  }

  const confirmLeave = () => {
    if (!selected) return
    void run(async () => { await messagesApi.leaveConversation(selected.id); setLeaveOpen(false) }, 'You have left the group.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-900 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-[300px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between p-5"><h1 className="text-2xl font-black">Messages</h1><Bell className="text-[#2563EB]" /></div>
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => <button key={conversation.id} onClick={() => setSelected(conversation)} className={`w-full rounded-2xl p-3 text-left ${selected?.id === conversation.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
              <p className="font-bold">{conversation.name}</p><p className="mt-1 truncate text-xs text-slate-500">{conversation.lastMessage || 'No messages yet'}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{conversation.participants} members {conversation.muted ? '· Muted' : ''}</p>
            </button>)}
            {!conversations.length && <p className="p-3 text-sm text-slate-500">No active conversations.</p>}
          </div>
          <div className="p-4"><button disabled={!selected || busy} onClick={() => setBroadcastOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E53935] to-orange-500 px-4 py-3 font-bold text-white disabled:opacity-50"><Zap className="h-4 w-4" />Emergency Broadcast</button></div>
        </aside>
        <section className="flex min-h-[560px] flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 p-4"><div><h2 className="font-black">{selected?.name || 'Select a conversation'}</h2><p className="text-xs text-slate-500">{selected?.participants || 0} members</p></div><div className="flex gap-2"><button aria-label="Make a call" disabled={!selected || busy} onClick={() => communication('call')} className="rounded-xl p-2 hover:bg-slate-100 disabled:opacity-40"><Phone /></button><button aria-label="Start a video call" disabled={!selected || busy} onClick={() => communication('video')} className="rounded-xl p-2 hover:bg-slate-100 disabled:opacity-40"><Video /></button></div></header>
          {(notice || error) && <div className={`m-4 rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || notice}</div>}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}><div className={`max-w-md rounded-2xl px-4 py-3 text-sm ${message.sent ? 'bg-[#2563EB] text-white' : message.broadcast ? 'bg-red-50 text-red-900' : 'bg-slate-100'}`}><p>{message.content}</p><p className={`mt-1 text-[11px] ${message.sent ? 'text-blue-100' : 'text-slate-500'}`}>{message.senderName} · {displayTime(message.createdAt)}</p></div></div>)}<div ref={endRef} /></div>
          <form onSubmit={(event) => { event.preventDefault(); submitMessage() }} className="flex gap-3 border-t border-slate-200 p-4"><input value={text} onChange={(event) => setText(event.target.value)} disabled={!selected || busy} placeholder="Type your message or emergency update…" className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2563EB]" /><button disabled={!text.trim() || !selected || busy} className="rounded-xl bg-[#2563EB] p-3 text-white disabled:opacity-40" aria-label="Send message"><Send /></button></form>
          {selected && <footer className="flex flex-wrap gap-2 border-t border-slate-100 p-4"><button disabled={busy} onClick={() => run(() => messagesApi.setMuted(selected.id, !selected.muted), selected.muted ? 'Notifications enabled.' : 'Notifications muted.')} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold">{selected.muted ? 'Unmute Notifications' : 'Mute Notifications'}</button><button disabled={busy} onClick={() => setLeaveOpen(true)} className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">Leave Group</button></footer>}
        </section>
      </div>
      {leaveOpen && <Dialog title="Leave this group?" text="You will stop receiving messages from this group. This action will be saved to your account." confirm="Yes, leave group" onCancel={() => setLeaveOpen(false)} onConfirm={confirmLeave} busy={busy} />}
      {broadcastOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6"><h3 className="text-xl font-black">Emergency Broadcast</h3><p className="mt-1 text-sm text-slate-500">This will be saved and sent to the selected group.</p><textarea value={broadcastText} onChange={(event) => setBroadcastText(event.target.value)} className="mt-4 w-full rounded-xl border p-3" rows="4" placeholder="Describe the emergency…" /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setBroadcastOpen(false)} className="rounded-xl px-4 py-2">Cancel</button><button disabled={!broadcastText.trim() || busy} onClick={submitBroadcast} className="rounded-xl bg-[#E53935] px-4 py-2 font-bold text-white disabled:opacity-50">Send Broadcast</button></div></div></div>}
    </div>
  )
}

function Dialog({ title, text, confirm, onCancel, onConfirm, busy }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-sm text-slate-600">{text}</p><div className="mt-5 flex justify-end gap-2"><button onClick={onCancel} className="rounded-xl px-4 py-2">Cancel</button><button disabled={busy} onClick={onConfirm} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50">{confirm}</button></div></div></div>
}
