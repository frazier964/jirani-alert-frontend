import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, MessageSquare, Share2, Loader2, AlertCircle, X, Copy, Check } from 'lucide-react'
import { toggleLikePost, commentOnPost, sharePost, getCommunityFeed } from '../../lib/communityApi'
import { auth, ensureAnonymous, firestore } from '../../lib/firebase'
import { onSnapshot, collection as collRef } from 'firebase/firestore'

export default function CommunityFeedComponent() {
  const [posts, setPosts] = useState(demoFeed)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentingPostId, setCommentingPostId] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [submittingCommentId, setSubmittingCommentId] = useState(null)
  const [shareOpen, setShareOpen] = useState(null)
  const [copyFeedback, setCopyFeedback] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [likingIds, setLikingIds] = useState([])

  // Load initial feed
  useEffect(() => {
    // Ensure we have an auth user (anonymous if necessary) so backend calls can succeed
    ;(async () => {
      try {
        await ensureAnonymous()
      } catch (e) {
        // ignore
      }
      await loadFeed()
    })()
  }, [])

  // Poll feed periodically to keep counts stable across users (reduced interval)
  const pollingRef = useRef(null)
  useEffect(() => {
    // Start polling only after initial load
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        getCommunityFeed(50)
          .then((data) => {
            if (data && data.posts) {
              setPosts((localPosts) => {
                const map = new Map(data.posts.map((p) => [p.id, p]))
                return localPosts.map((lp) => {
                  const server = map.get(lp.id)
                  if (!server) return lp
                  return {
                    ...lp,
                    likeCount: server.likeCount ?? lp.likeCount,
                    shareCount: server.shareCount ?? lp.shareCount,
                    commentCount: server.commentCount ?? lp.commentCount,
                    userLiked: server.userLiked ?? lp.userLiked,
                  }
                })
              })
            }
          })
          .catch(() => {
            // ignore polling errors
          })
      }, 8000)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  // Real-time Firestore listener (if Firestore configured)
  useEffect(() => {
    if (!firestore) return
    // Listen to likes subcollection for each post to get real-time like counts
    const listeners = new Map()
    try {
      posts.forEach((p) => {
        const postLikesRef = collRef(firestore, `communityPosts/${p.id}/likes`)
        const unsub = onSnapshot(postLikesRef, (snap) => {
          const likeCount = snap.size
          const userUid = auth?.currentUser?.uid
          const userLiked = !!snap.docs.find((d) => d.id === userUid)
          setPosts((prev) => prev.map((lp) => (lp.id === p.id ? { ...lp, likeCount, userLiked } : lp)))
        })
        listeners.set(p.id, unsub)
      })
    } catch (e) {
      // ignore
    }

    return () => {
      listeners.forEach((unsub) => unsub())
      listeners.clear()
    }
  }, [posts])

  // When user signs in, attempt to sync any unsynced likes saved while unauthenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const raw = localStorage.getItem('unsyncedLikes')
          const unsynced = raw ? JSON.parse(raw) : []
          if (Array.isArray(unsynced) && unsynced.length > 0) {
            for (const postId of unsynced) {
              try {
                const res = await toggleLikePost(postId)
                // Update local posts with authoritative server count
                if (res && res.postId) {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === res.postId
                        ? {
                            ...p,
                            userLiked: res.liked === true || p.userLiked,
                            likeCount: typeof res.likeCount === 'number' ? res.likeCount : p.likeCount,
                          }
                        : p,
                    ),
                  )
                }
              } catch (e) {
                // ignore individual failures
              }
            }
            // Clear the local queue after attempting sync
            localStorage.removeItem('unsyncedLikes')
            setToastMessage('Queued likes synced')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
          }
        } catch (e) {
          // ignore JSON parse errors
        }
      }
    })

    return () => unsubscribe()
  }, [])

  async function loadFeed() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCommunityFeed(50)
      if (data && data.posts && data.posts.length > 0) {
        // Success - cache the feed
        try {
          localStorage.setItem('cachedCommunityFeed', JSON.stringify(data.posts))
        } catch (e) {
          // ignore cache write errors
        }
        setPosts(data.posts)
      } else {
        // Empty response - try cache
        try {
          const cached = localStorage.getItem('cachedCommunityFeed')
          const parsedCache = cached ? JSON.parse(cached) : null
          if (parsedCache && parsedCache.length > 0) {
            setPosts(parsedCache)
            setError('Showing cached feed (backend temporarily unavailable)')
          } else {
            setPosts(demoFeed)
            setError('Backend unavailable - showing demo data. Like and comment features require backend.')
          }
        } catch (e) {
          setPosts(demoFeed)
          setError('Backend unavailable - showing demo data. Like and comment features require backend.')
        }
      }
    } catch (err) {
      console.error('Error loading feed:', err)
      // Try to load from cache if backend fails
      try {
        const cached = localStorage.getItem('cachedCommunityFeed')
        const parsedCache = cached ? JSON.parse(cached) : null
        if (parsedCache && parsedCache.length > 0) {
          setPosts(parsedCache)
          setError('Showing cached feed (backend error). Like and comment features may not work.')
        } else {
          setPosts(demoFeed)
          setError('Backend unavailable - showing demo data. Like and comment features require backend.')
        }
      } catch (e) {
        setPosts(demoFeed)
        setError('Backend unavailable - showing demo data. Like and comment features require backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(postId, currentlyLiked, currentLikeCount) {
    // prevent duplicate requests
    if (likingIds.includes(postId)) return
    setLikingIds((s) => [...s, postId])
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                userLiked: !currentlyLiked,
                likeCount: currentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1,
              }
            : p,
        ),
      )
      // Call backend
      const res = await toggleLikePost(postId)
      // If backend returns authoritative likeCount, update local state to match
      if (res && res.postId) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === res.postId
              ? {
                  ...p,
                  userLiked: res.liked === true,
                  likeCount: typeof res.likeCount === 'number' ? res.likeCount : p.likeCount,
                }
              : p,
          ),
        )
      }
    } catch (err) {
      console.error('Error liking post:', err)
      // On any error, keep the optimistic update and queue the action for sync
      console.warn('Like saved locally (queued) due to error:', err?.message || err)
      try {
        const unsynced = JSON.parse(localStorage.getItem('unsyncedLikes') || '[]')
        if (!unsynced.includes(postId)) {
          unsynced.push(postId)
          localStorage.setItem('unsyncedLikes', JSON.stringify(unsynced))
          setToastMessage('Likes queued. Sign in or retry to sync.')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }
    // clear in-flight flag
    setLikingIds((s) => s.filter((id) => id !== postId))
  }

  async function handleComment(postId, currentCommentCount) {
    if (!commentText.trim()) return

    try {
      setSubmittingCommentId(postId)
      const userComment = commentText // Save before clearing
      
      // Call backend to save comment
      const result = await commentOnPost(postId, userComment)

      // Clear input and close comment section immediately for better UX
      setCommentText('')
      setCommentingPostId(null)

      // Immediately refetch the feed to show real comments from backend
      const updatedFeed = await getCommunityFeed(50)
      if (updatedFeed && updatedFeed.posts) {
        setPosts(updatedFeed.posts)
        try {
          localStorage.setItem('cachedCommunityFeed', JSON.stringify(updatedFeed.posts))
        } catch (e) {
          // ignore cache write errors
        }
      }

      setToastMessage('Comment posted successfully!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      console.error('Error commenting:', err)
      setError('Failed to post comment - backend may be unavailable')
      // Still clear the input on error to avoid confusion
      setCommentText('')
    } finally {
      setSubmittingCommentId(null)
    }
  }

  async function handleShare(postId, postTitle) {
    try {
      const shareUrl = `${window.location.origin}?shared_post=${postId}`
      
      // Try native share if available
      if (navigator.share) {
        await navigator.share({
          title: 'Jirani Alert - Community Update',
          text: postTitle,
          url: shareUrl,
        })
      } else {
        // Show copy-to-clipboard fallback
        setShareOpen(postId)
      }

      // Track share
      await sharePost(postId)
      
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                shareCount: (p.shareCount || 0) + 1,
              }
            : p,
        ),
      )
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  function copyShareLink(postId) {
    const shareUrl = `${window.location.origin}?shared_post=${postId}`
    navigator.clipboard.writeText(shareUrl)
    setCopyFeedback(postId)
    setTimeout(() => setCopyFeedback(null), 2000)
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
        </div>
        {showToast && toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="rounded-lg bg-slate-900 text-white px-4 py-2 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-sm">{toastMessage}</div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-slate-200 hover:text-white text-xs px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Feed Status</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-amber-800">To enable likes and comments, ensure Firebase backend is running:
              <br />cd backend && npm run serve</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">{error}</p>
              {error.includes('Backend unavailable') && (
                <p className="text-xs mt-1 text-amber-800">Run: cd backend && npm run serve</p>
              )}
            </div>
          </div>
        </div>
      )}
      {posts.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Post Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] text-xs sm:text-sm font-black text-white">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="font-bold sm:font-black text-slate-900 text-sm sm:text-base">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 w-fit">
                  Verified
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.post}</p>
            </div>
          </div>

          {/* Action Buttons - Responsive Grid */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 border-t border-slate-100 pt-4">
            {/* Like Button with Animation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleLike(item.id, item.userLiked, item.likeCount)}
              disabled={likingIds.includes(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all relative overflow-hidden ${
                item.userLiked
                  ? 'bg-gradient-to-r from-blue-400 to-[#2563EB] text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.4)]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {likingIds.includes(item.id) ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : null}
              <motion.span
                animate={item.userLiked ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : {}}
                transition={{ duration: 0.6 }}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all ${
                    item.userLiked ? 'fill-current' : ''
                  }`}
                />
              </motion.span>
              <span className="hidden sm:inline">{item.likeCount > 0 ? item.likeCount : 'Like'}</span>
              <span className="sm:hidden">{item.likeCount}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCommentingPostId(item.id === commentingPostId ? null : item.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all ${
                commentingPostId === item.id
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{item.commentCount > 0 ? item.commentCount : 'Comment'}</span>
              <span className="sm:hidden">{item.commentCount}</span>
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare(item.id, item.post)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all ${
                shareOpen === item.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{item.shareCount > 0 ? item.shareCount : 'Share'}</span>
              <span className="sm:hidden">{item.shareCount || 0}</span>
            </motion.button>
          </div>

          {/* Share Link Popup */}
          <AnimatePresence>
            {shareOpen === item.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Share this update</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}?shared_post=${item.id}`}
                        className="flex-1 min-w-0 text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-700"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyShareLink(item.id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors"
                      >
                        {copyFeedback === item.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareOpen(null)}
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments Chat Section */}
          <AnimatePresence>
            {commentingPostId === item.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 pt-4 border-t border-slate-100"
              >
                {/* Existing Comments */}
                {item.comments && item.comments.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl">
                    {item.comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="flex-1 rounded-xl bg-white p-3 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-900 mb-1">{comment.name || 'Resident'}</p>
                          <p className="text-sm text-slate-700 leading-5">{comment.text}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'just now'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="space-y-3">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                    Join the discussion
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleComment(item.id, item.commentCount)
                        }
                      }}
                      placeholder="Share your thoughts..."
                      maxLength={280}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleComment(item.id, item.commentCount)}
                      disabled={!commentText.trim() || submittingCommentId === item.id}
                      className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                    >
                      {submittingCommentId === item.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        'Send'
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-slate-500">{commentText.length}/280</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.article>
      ))}
    </div>
  )
}

// Demo data - fallback if backend is not available
const demoFeed = [
  {
    id: '1',
    name: 'Amina W.',
    initials: 'AW',
    time: '5m ago',
    post: 'Community watch patrol started at 7 PM. Please keep gates locked and report unusual activity.',
    likeCount: 24,
    commentCount: 0,
    shareCount: 8,
    userLiked: false,
    comments: [],
  },
  {
    id: '2',
    name: 'Brian K.',
    initials: 'BK',
    time: '19m ago',
    post: 'Roadside lamp near the estate entrance is now fixed. Safer visibility for the evening commute.',
    likeCount: 18,
    commentCount: 0,
    shareCount: 6,
    userLiked: false,
    comments: [],
  },
  {
    id: '3',
    name: 'Fatuma N.',
    initials: 'FN',
    time: '1h ago',
    post: 'First aid kit restocked at the community center. Thanks to everyone who contributed.',
    likeCount: 42,
    commentCount: 0,
    shareCount: 15,
    userLiked: false,
    comments: [],
  },
]

