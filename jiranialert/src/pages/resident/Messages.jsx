import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  Mic,
  MapPin,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Bell,
  Shield,
  Users,
  AlertCircle,
  CheckCheck,
  Check,
  Clock,
  FileText,
  Image as ImageIcon,
  X,
  Zap,
} from 'lucide-react'

const conversationsSeed = [
  {
    id: 'conv-1',
    name: 'Community Safety Group',
    avatar: '👥',
    lastMessage: 'Patrol team confirmed all-clear at 22:30',
    time: '2 mins ago',
    unread: 3,
    online: true,
    priority: 'COMMUNITY',
    participants: 8,
  },
  {
    id: 'conv-2',
    name: 'Area Chief - James M.',
    avatar: '👨‍💼',
    lastMessage: 'Thanks for the alert. Responding now.',
    time: '15 mins ago',
    unread: 0,
    online: true,
    priority: 'SAFE',
    participants: 1,
  },
  {
    id: 'conv-3',
    name: 'Nearby Resident - Sarah',
    avatar: '👩',
    lastMessage: 'Did you see the fire alert earlier?',
    time: '1 hour ago',
    unread: 1,
    online: false,
    priority: 'URGENT',
    participants: 1,
  },
  {
    id: 'conv-4',
    name: 'Emergency Response Team',
    avatar: '🚨',
    lastMessage: 'Emergency dispatch: Medical assistance en route',
    time: '3 hours ago',
    unread: 0,
    online: true,
    priority: 'MEDICAL',
    participants: 5,
  },
  {
    id: 'conv-5',
    name: 'Police Liaison - Officer K.',
    avatar: '👮',
    lastMessage: 'Case reference: POL-2025-05-12345',
    time: 'Yesterday',
    unread: 0,
    online: false,
    priority: 'POLICE',
    participants: 1,
  },
]

const messagesSeed = [
  {
    id: 'msg-1',
    sender: 'Community Safety Group',
    avatar: '👥',
    content: 'Fire alert reported at South B Estate.',
    timestamp: '14:32',
    sent: false,
    read: true,
    priority: 'URGENT',
  },
  {
    id: 'msg-2',
    sender: 'You',
    avatar: '👤',
    content: 'Confirmed. I can see smoke from my balcony.',
    timestamp: '14:33',
    sent: true,
    read: true,
    priority: null,
  },
  {
    id: 'msg-3',
    sender: 'Community Safety Group',
    avatar: '👥',
    content: 'Authorities notified. All residents stay clear of the area.',
    timestamp: '14:35',
    sent: false,
    read: true,
    priority: 'SAFE',
  },
  {
    id: 'msg-4',
    sender: 'You',
    avatar: '👤',
    content: 'Emergency vehicles arriving now. Thank you for coordination.',
    timestamp: '14:37',
    sent: true,
    read: true,
    priority: null,
  },
  {
    id: 'msg-5',
    sender: 'Community Safety Group',
    avatar: '👥',
    content: 'Patrol team confirmed all-clear at 22:30',
    timestamp: '22:32',
    sent: false,
    read: true,
    priority: 'COMMUNITY',
  },
]

function getPriorityColor(priority) {
  if (priority === 'URGENT') return 'from-red-500 to-orange-500'
  if (priority === 'MEDICAL') return 'from-emerald-500 to-green-500'
  if (priority === 'POLICE') return 'from-slate-700 to-slate-900'
  if (priority === 'SAFE') return 'from-blue-500 to-cyan-500'
  return 'from-slate-400 to-slate-500'
}

function getPriorityBgColor(priority) {
  if (priority === 'URGENT') return 'bg-red-100 text-red-700'
  if (priority === 'MEDICAL') return 'bg-emerald-100 text-emerald-700'
  if (priority === 'POLICE') return 'bg-slate-100 text-slate-700'
  if (priority === 'SAFE') return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(conversationsSeed[0])
  const [messages, setMessages] = useState(messagesSeed)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredConversations = conversationsSeed.filter((conv) =>
    `${conv.name} ${conv.lastMessage}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage = {
      id: `msg-${messages.length + 1}`,
      sender: 'You',
      avatar: '👤',
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      read: false,
      priority: null,
    }

    setMessages([...messages, newMessage])
    setMessageInput('')
    inputRef.current?.focus()

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      const response = {
        id: `msg-${messages.length + 2}`,
        sender: selectedConversation.name,
        avatar: selectedConversation.avatar,
        content: 'Thanks for the update. Stay safe.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: false,
        read: true,
        priority: null,
      }
      setMessages((prev) => [...prev, response])
      setIsTyping(false)
    }, 2000)
  }

  const totalUnread = conversationsSeed.reduce((sum, conv) => sum + conv.unread, 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      <div className="mx-auto h-screen max-w-full grid grid-cols-1 md:grid-cols-[300px_1fr_340px]">
        {/* Conversations Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black text-slate-900">Messages</h1>
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-[#2563EB] transition-colors" />
                {totalUnread > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E53935] text-xs font-bold text-white">
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conv, index) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full rounded-2xl p-3 text-left transition-all ${
                    selectedConversation.id === conv.id
                      ? 'bg-blue-50 shadow-md'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar with online status */}
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 text-xl">
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>

                    {/* Message preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="truncate font-semibold text-slate-900 text-sm">{conv.name}</h3>
                        <span className="shrink-0 text-xs text-slate-500">{conv.time}</span>
                      </div>
                      <p className="truncate text-xs text-slate-600 mb-2">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getPriorityBgColor(conv.priority)}`}>
                          {conv.priority}
                        </span>
                        {conv.unread > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-xs font-bold text-white">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Emergency Broadcast Button */}
          <div className="border-t border-slate-200 p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl bg-gradient-to-r from-[#E53935] to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Emergency Broadcast
            </motion.button>
          </div>
        </motion.aside>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col bg-white overflow-hidden"
        >
          {/* Chat Header */}
          <div className="border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-lg">
                  {selectedConversation.avatar}
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-900">{selectedConversation.name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedConversation.online ? '🟢 Online' : '⚪ Offline'} • {selectedConversation.participants} members
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Video className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex gap-3 ${msg.sent ? 'flex-row-reverse' : ''}`}
              >
                <div className="text-lg">{msg.avatar}</div>
                <div className={`flex flex-col ${msg.sent ? 'items-end' : 'items-start'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl px-4 py-3 max-w-xs ${
                      msg.sent
                        ? 'bg-[#2563EB] text-white'
                        : msg.priority
                          ? `bg-gradient-to-r ${getPriorityColor(msg.priority)} text-white`
                          : 'bg-slate-100 text-slate-900'
                    } shadow-sm`}
                  >
                    <p className="text-sm leading-5">{msg.content}</p>
                  </motion.div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.sent && (
                      msg.read ? (
                        <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <div className="text-lg">{selectedConversation.avatar}</div>
                  <div className="rounded-2xl bg-slate-200 px-4 py-3 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        className="h-2.5 w-2.5 rounded-full bg-slate-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 bg-white/90 backdrop-blur p-4">
            <div className="flex items-end gap-3">
              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="flex-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message or emergency update…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="p-3 rounded-lg bg-gradient-to-r from-[#2563EB] to-blue-600 text-white hover:shadow-lg transition-all"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Info */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:flex flex-col border-l border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
        >
          {/* Panel Header */}
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-black text-slate-900">Group Info</h3>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {/* Group members */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Members ({selectedConversation.participants})</p>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300">
                        👤
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Member {i}</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Hotlines */}
            <div className="space-y-2 rounded-2xl bg-red-50 p-3 border border-red-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2">Emergency Contacts</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">🚨 Police: 999</p>
                <p className="text-sm font-semibold text-slate-900">🚑 Ambulance: 911</p>
                <p className="text-sm font-semibold text-slate-900">🔥 Fire: 998</p>
              </div>
            </div>

            {/* Shared Media */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Shared Media</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
                  >
                    <ImageIcon className="h-6 w-6 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Actions */}
          <div className="border-t border-slate-200 p-4 space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Mute Notifications
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition-colors"
            >
              Leave Group
            </motion.button>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
