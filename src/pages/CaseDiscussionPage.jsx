import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleDot,
  Copy,
  FolderOpen,
  Image,
  Mic,
  MessageSquare,
  LockKeyhole,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Send,
  ShieldAlert,
  Square,
  Sparkles,
  X,
  Reply,
  SmilePlus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentInitialsAvatar } from '../components/students/StudentInitialsAvatar';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import '../css/case-discussion.css';

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?';
const formatMessageTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
const chatReactionChoices = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
const mapThread = (thread, user) => {
  const record = thread.record || {};
  const student = record.student || {};
  const violation = record.violation || {};
  const studentName = `${student.fname || ''} ${student.lname || ''}`.trim() || 'Unknown student';
  return {
    id: String(thread.id),
    recordId: String(record.id),
    student: studentName,
    studentFirstName: student.fname || '',
    studentLastName: student.lname || '',
    studentPhoto: student.image || student.photo || student.avatar || '',
    studentId: student.student_id || '?',
    className: `Grade ${student.grade || '-'} / Section ${student.section || '-'}`,
    issue: violation.title || 'Case discussion',
    status: record.status || 'Pending',
    assigned: record.reported_by_name || 'School staff',
    category: violation.type || '?',
    severity: violation.severity || violation.type || 'Minor',
    created: formatDate(record.created_at || record.date_reported),
    updated: formatMessageTime(thread.updated_at || thread.created_at),
    unread: 0,
    messages: (thread.messages || []).map((message) => {
      const isCurrentUser = String(message.author_id) === String(user?.id) && message.author_role === user?.role;
      return {
        id: String(message.id),
        sender: isCurrentUser ? 'You' : message.author_name,
        authorName: message.author_name || '',
        authorId: String(message.author_id),
        authorRole: message.author_role,
        authorImage: message.authorImage || message.author_image || (isCurrentUser ? user?.avatar : '') || '',
        role: message.author_position || message.author_role,
        time: formatMessageTime(message.created_at),
        text: message.body || '',
        replyTo: message.reply_to ? {
          id: String(message.reply_to.id),
          authorId: String(message.reply_to.author_id),
          authorRole: message.reply_to.author_role,
          authorName: String(message.reply_to.author_id) === String(user?.id) && message.reply_to.author_role === user?.role
            ? 'You'
            : message.reply_to.author_name,
          text: message.reply_to.body || message.reply_to.attachment_name || 'Attachment'
        } : null,
        image: message.attachment_url || null,
        imageName: message.attachment_name || '',
        audio: message.audio_url || null,
        reactions: Array.isArray(message.reactions) ? message.reactions : []
      };
    })
  };
};

// Conference status styling helper
const getStatusTheme = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('1st')) {
    return { className: 'status-1st', dot: '#3b82f6', label: '1st Conference' };
  }
  if (s.includes('2nd')) {
    return { className: 'status-2nd', dot: '#eab308', label: '2nd Conference' };
  }
  if (s.includes('3rd')) {
    return { className: 'status-3rd', dot: '#ef4444', label: '3rd Conference' };
  }
  if (s.includes('pending')) {
    return { className: 'status-pending', dot: '#ef4444', label: 'Pending' };
  }
  if (s.includes('investigation')) {
    return { className: 'status-investigation', dot: '#eab308', label: 'Under Investigation' };
  }
  if (s.includes('resolved')) {
    return { className: 'status-resolved', dot: '#22c55e', label: 'Resolved' };
  }
  if (s.includes('escalated')) {
    return { className: 'status-escalated', dot: '#8b5cf6', label: 'Escalated' };
  }
  return { className: 'status-followup', dot: '#10b981', label: status || 'Follow-up' };
};


export const CaseDiscussionPage = () => {
  const { user, loading: authLoading } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [statusUpdateNotices, setStatusUpdateNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unread' | 'conferences'
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedAudio, setAttachedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [messageMenu, setMessageMenu] = useState(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState(null);
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const [pendingCloseThread, setPendingCloseThread] = useState(null);
  const [closingThread, setClosingThread] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState('');
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPreviewRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingThreadRef = useRef(null);
  const typingExpiryTimersRef = useRef(new Map());
  const messageHoldTimerRef = useRef(null);
  const suppressMessageClickRef = useRef(false);
  const summaryTriggerRef = useRef(null);
  const summaryCloseRef = useRef(null);
  const deleteCancelRef = useRef(null);
  const casesSnapshotRef = useRef(cases);
  const selectedIdSnapshotRef = useRef(selectedId);
  casesSnapshotRef.current = cases;
  selectedIdSnapshotRef.current = selectedId;

  useEffect(() => {
    if (!summaryModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    summaryCloseRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSummaryModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      summaryTriggerRef.current?.focus();
    };
  }, [summaryModalOpen]);

  useEffect(() => {
    if (!pendingDeleteMessage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    deleteCancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deletingMessage) setPendingDeleteMessage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingDeleteMessage, deletingMessage]);

  useEffect(() => {
    if (!pendingCloseThread) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !closingThread) setPendingCloseThread(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingCloseThread, closingThread]);

  const clearMessageHoldTimer = () => {
    if (messageHoldTimerRef.current) {
      window.clearTimeout(messageHoldTimerRef.current);
      messageHoldTimerRef.current = null;
    }
  };

  const handleMessageTouchStart = (messageId, event) => {
    clearMessageHoldTimer();
    const messageElement = event.currentTarget;
    messageHoldTimerRef.current = window.setTimeout(() => {
      const bubble = messageElement.querySelector('.case-message-bubble');
      const bounds = (bubble || messageElement).getBoundingClientRect();
      const pickerWidth = Math.min(236, window.innerWidth - 20);
      const pickerHeight = 48;
      const left = Math.max(10, Math.min(window.innerWidth - pickerWidth - 10, bounds.left + bounds.width / 2 - pickerWidth / 2));
      const preferredTop = bounds.top - pickerHeight - 8;
      const top = preferredTop >= 8
        ? preferredTop
        : Math.max(8, Math.min(window.innerHeight - pickerHeight - 104, bounds.bottom + 8));
      setReactionPickerPosition({ messageId, left, top });
      setReactionPickerMessageId(messageId);
      setMessageMenu({ messageId, modal: true });
      suppressMessageClickRef.current = true;
      window.setTimeout(() => { suppressMessageClickRef.current = false; }, 800);
      messageHoldTimerRef.current = null;
    }, 500);
  };

  const toggleDesktopMessageMenu = (event, messageId, ownMessage) => {
    setReactionPickerMessageId(null);
    setReactionPickerPosition(null);
    const trigger = event?.currentTarget;
    if (!trigger) return;
    const messageElement = trigger.matches('.case-message')
      ? trigger.querySelector('.case-message-content')
      : trigger.closest('.case-message')?.querySelector('.case-message-content');
    const bounds = (messageElement || trigger).getBoundingClientRect();
    const menuHeight = ownMessage ? 128 : 92;
    const top = bounds.bottom + menuHeight + 8 <= window.innerHeight
      ? bounds.bottom + 8
      : Math.max(8, bounds.top - menuHeight - 8);
    const preferredLeft = ownMessage ? bounds.right - 140 : bounds.left;
    const left = Math.max(8, Math.min(window.innerWidth - 148, preferredLeft));
    setMessageMenu((current) => {
      if (current?.messageId === messageId && !current.modal) return null;
      return { messageId, modal: false, left, top };
    });
  };

  const refreshThreads = useCallback(async () => {
    if (!user) return { ok: false, status: 401 };
    try {
      const rows = await apiGet('/case-discussions');
      if (!Array.isArray(rows)) return { ok: true };
      const mapped = rows.map((thread) => mapThread(thread, user));
      const activeId = selectedIdSnapshotRef.current;
      const previousThread = casesSnapshotRef.current.find((thread) => thread.id === activeId);
      const updatedThread = mapped.find((thread) => thread.id === activeId);
      if (previousThread && updatedThread) {
        if ((previousThread.status || '') !== (updatedThread.status || '')) {
          setStatusUpdateNotices((current) => [...current, {
            id: `${activeId}-${Date.now()}-${Math.random()}`,
            threadId: activeId,
            previousStatus: previousThread.status,
            nextStatus: updatedThread.status,
          }]);
        }
        const previousMessageIds = new Set(previousThread.messages.map((message) => message.id));
        const incomingMessages = updatedThread.messages.filter((message) =>
          !previousMessageIds.has(message.id) &&
          !(message.authorId === String(user?.id) && message.authorRole === user?.role),
        );
        const feed = messagesContainerRef.current;
        const awayFromLatest = feed && feed.scrollHeight - feed.scrollTop - feed.clientHeight > 48;
        if (incomingMessages.length && awayFromLatest) {
          setNewMessageCount((count) => count + incomingMessages.length);
        }
      }
      casesSnapshotRef.current = mapped;
      setCases(mapped);
      setSelectedId((current) => current && mapped.some((item) => item.id === current) ? current : (mapped[0]?.id || null));
      setLoadError('');
      return { ok: true };
    } catch (error) {
      setLoadError(error.message || 'Unable to load case discussions.');
      return { ok: false, status: error.status };
    }
  }, [user?.id, user?.role]);

  const confirmDeleteMessage = async () => {
    if (!pendingDeleteMessage || deletingMessage) return;
    setDeletingMessage(true);
    try {
      await apiDelete(`/case-discussions/${pendingDeleteMessage.threadId}/messages/${pendingDeleteMessage.id}`);
      setPendingDeleteMessage(null);
      setDeleteNotice(pendingDeleteMessage);
      await refreshThreads();
    } catch (error) {
      setLoadError(error.message || 'Unable to delete this message.');
      setPendingDeleteMessage(null);
    } finally {
      setDeletingMessage(false);
    }
  };

  const closeResolvedThread = async () => {
    if (!pendingCloseThread || closingThread) return;
    setClosingThread(true);
    setLoadError('');
    try {
      await apiPost(`/case-discussions/${pendingCloseThread.id}/close`, {});
      const remainingCases = cases.filter((item) => item.id !== pendingCloseThread.id);
      setCases(remainingCases);
      casesSnapshotRef.current = remainingCases;
      setStatusUpdateNotices((current) => current.filter((notice) => notice.threadId !== pendingCloseThread.id));
      setNewMessageCount(0);
      setSelectedId(remainingCases[0]?.id || null);
      setPendingCloseThread(null);
      setThreadMenuOpen(false);
      setMobileThreadOpen(false);
    } catch (error) {
      setLoadError(error.message || 'Unable to close this case discussion.');
      setPendingCloseThread(null);
    } finally {
      setClosingThread(false);
    }
  };

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setCases([]);
      setSelectedId(null);
      setLoadError('');
      return undefined;
    }

    const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
    const stream = new EventSource(`${apiBase}/api/case-discussions/events`, { withCredentials: true });
    let fallbackPoll = null;
    let authBlocked = false;
    let refreshInFlight = false;
    let active = true;
    const stopFallback = () => {
      if (fallbackPoll) window.clearInterval(fallbackPoll);
      fallbackPoll = null;
    };
    const startFallback = () => {
      if (!active || authBlocked || fallbackPoll) return;
      stream.close();
      fallbackPoll = window.setInterval(refreshAndHandleResult, 5000);
    };
    const refreshAndHandleResult = async () => {
      if (!active || authBlocked || refreshInFlight) return;
      refreshInFlight = true;
      const result = await refreshThreads();
      refreshInFlight = false;
      if (!active) return;
      if (result?.status === 401 || result?.status === 403) {
        authBlocked = true;
        stream.close();
        stopFallback();
        casesSnapshotRef.current = [];
        selectedIdSnapshotRef.current = null;
        setCases([]);
        setSelectedId(null);
      } else if (!result?.ok) {
        startFallback();
      }
    };
    stream.onerror = startFallback;
    stream.addEventListener('discussion', refreshAndHandleResult);
    stream.addEventListener('typing', (event) => {
      try {
        const status = JSON.parse(event.data);
        if (status.threadId !== selectedIdSnapshotRef.current || (String(status.userId) === String(user?.id) && status.role === user?.role)) return;
        const key = `${status.threadId}:${status.role}:${status.userId}`;
        const existingTimer = typingExpiryTimersRef.current.get(key);
        if (existingTimer) window.clearTimeout(existingTimer);
        setTypingUsers((current) => {
          const others = current.filter((item) => `${item.threadId}:${item.role}:${item.userId}` !== key);
          return status.typing ? [...others, status] : others;
        });
        if (status.typing) {
          typingExpiryTimersRef.current.set(key, window.setTimeout(() => {
            setTypingUsers((current) => current.filter((item) => `${item.threadId}:${item.role}:${item.userId}` !== key));
            typingExpiryTimersRef.current.delete(key);
          }, 4000));
        } else {
          typingExpiryTimersRef.current.delete(key);
        }
      } catch {
        // Ignore malformed presence events and keep the live stream connected.
      }
    });
    refreshAndHandleResult();
    return () => {
      active = false;
      stream.close();
      stopFallback();
      typingExpiryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      typingExpiryTimersRef.current.clear();
    };
  }, [authLoading, refreshThreads, user, user?.id, user?.role]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxHeight = 180;
    textarea.style.height = 'auto';
    const contentHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    textarea.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
  }, [draft]);

  const totalUnread = useMemo(() => {
    return cases.reduce((acc, curr) => acc + (curr.unread || 0), 0);
  }, [cases]);

  const visibleCases = useMemo(() => {
    let list = cases.filter((item) =>
      `${item.student} ${item.studentId} ${item.issue} ${item.status} ${item.assigned}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (filterMode === 'unread') {
      list = list.filter((item) => item.unread > 0);
    } else if (filterMode === 'conferences') {
      list = list.filter((item) => (item.status || '').toLowerCase().includes('conference'));
    }

    return sortAlphabetically
      ? [...list].sort((left, right) => left.student.localeCompare(right.student))
      : list;
  }, [cases, search, filterMode, sortAlphabetically]);

  const selectedCase = cases.find((item) => item.id === selectedId) || visibleCases[0] || null;

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        name: file.name,
        url: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      setRecordingError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      setAttachedAudio(null);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (!audioBlob.size) {
          setRecordingError('No audio was captured. Check microphone permission and try again.');
          setIsRecording(false);
          mediaRecorderRef.current = null;
          return;
        }
        const reader = new FileReader();
        reader.onload = () => setAttachedAudio({ url: reader.result });
        reader.readAsDataURL(audioBlob);
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setRecordingError('Microphone access was blocked. Allow microphone access and try again.');
      console.error('Unable to access the microphone.', error);
    }
  };

  const formatAudioTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const toggleAudioPreview = async () => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const seekAudioPreview = (event) => {
    const audio = audioPreviewRef.current;
    if (!audio) return;
    audio.currentTime = Number(event.target.value);
    setAudioCurrentTime(audio.currentTime);
  };

  const selectCase = (id) => {
    stopTyping();
    setNewMessageCount(0);
    setStatusUpdateNotices((current) => current.filter((notice) => notice.threadId !== id));
    setSelectedId(id);
    setReplyTo(null);
    setMobileThreadOpen(true);
    requestAnimationFrame(() => {
      setNewMessageCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
    setThreadMenuOpen(false);
    setCases((previous) => previous.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
  };

  const stopTyping = (threadId = typingThreadRef.current) => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    if (!threadId) return;
    if (typingThreadRef.current === threadId) typingThreadRef.current = null;
    apiPost(`/case-discussions/${threadId}/typing`, { typing: false }).catch(() => {});
  };

  const handleDraftChange = (event) => {
    const value = event.target.value;
    setDraft(value);
    if (!selectedCase) return;
    const threadId = selectedCase.id;
    if (!value.trim()) {
      stopTyping(threadId);
      return;
    }
    if (typingThreadRef.current && typingThreadRef.current !== threadId) {
      stopTyping(typingThreadRef.current);
    }
    if (typingThreadRef.current !== threadId) {
      typingThreadRef.current = threadId;
      apiPost(`/case-discussions/${threadId}/typing`, { typing: true }).catch(() => {});
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => stopTyping(threadId), 1300);
  };

  useEffect(() => () => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    if (typingThreadRef.current) {
      apiPost(`/case-discussions/${typingThreadRef.current}/typing`, { typing: false }).catch(() => {});
    }
  }, []);

  const sendMessage = async (event) => {
    if (event) event.preventDefault();
    const message = draft.trim();
    if ((!message && !attachedImage && !attachedAudio) || !selectedCase || sending) return;
    stopTyping(selectedCase.id);
    setSending(true);
    try {
      await apiPost(`/case-discussions/${selectedCase.id}/messages`, {
        body: message,
        attachmentUrl: attachedImage?.url,
        attachmentName: attachedImage?.name,
        audioUrl: attachedAudio?.url,
        replyToId: replyTo?.id
      });
      setDraft('');
      setReplyTo(null);
      setAttachedImage(null);
      setAttachedAudio(null);
      const rows = await apiGet('/case-discussions');
      setCases(rows.map((thread) => mapThread(thread, user)));
      setLoadError('');
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
    } catch (error) {
      setLoadError(error.message || 'Unable to send this update.');
    } finally {
      setSending(false);
    }
  };

  const toggleReaction = async (threadId, messageId, emoji) => {
    setReactionPickerMessageId(null);
    setReactionPickerPosition(null);
    setMessageMenu(null);
    try {
      const result = await apiPost(`/case-discussions/${threadId}/messages/${messageId}/reactions`, { emoji });
      setCases((current) => current.map((thread) => thread.id !== threadId ? thread : {
        ...thread,
        messages: thread.messages.map((message) => message.id === messageId
          ? { ...message, reactions: result.reactions || [] }
          : message)
      }));
      await refreshThreads();
    } catch (error) {
      setLoadError(error.message || 'Unable to add this reaction.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyThreadValue = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard fallback
    }
    setThreadMenuOpen(false);
  };



  const currentTheme = selectedCase ? getStatusTheme(selectedCase.status) : null;

  return (
    <div className={`case-discussion-page${mobileThreadOpen ? ' mobile-thread-active' : ''}`}>
      {/* 1. Page Banner Header matching Incident Registry */}
      <div className="page-banner-header">
        <div className="page-banner-info">
          <MessageSquare size={26} strokeWidth={2.4} style={{ flexShrink: 0, color: 'var(--brand-blue, #07345f)' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.02em' }}>
              {isTeacher ? 'Active Disciplinary Cases' : 'Case Discussion & Coordination'}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
              {isTeacher
                ? 'Coordinate student interventions and follow-up conferences with the Prefect of Discipline.'
                : 'Direct teacher-to-prefect discussion channels for student case follow-ups and conference scheduling.'}
            </p>
          </div>
        </div>
      </div>
      {loadError && <div className="case-load-error" role="alert">{loadError}</div>}

      {/* 2. Main Two-Column Layout */}
      <div className={`case-discussion-layout${mobileThreadOpen ? ' mobile-thread-open' : ''}`}>
        
        {/* Left Side: Case Inbox */}
        <aside className="case-list-panel">
          <div className="case-list-heading">
            <div className="case-list-heading-title">
              <strong>{isTeacher ? 'My Student Threads' : 'Case Inbox'}</strong>
              <span className="case-thread-count-badge">{visibleCases.length} threads</span>
            </div>

            <div className="case-list-options">
              <button
                type="button"
                className="case-icon-button"
                aria-label="Case list options"
                aria-haspopup="menu"
                aria-expanded={caseMenuOpen}
                onClick={() => setCaseMenuOpen((open) => !open)}
              >
                <MoreHorizontal size={18} />
              </button>
              {caseMenuOpen && (
                <div className="case-options-menu" role="menu" aria-label="Case list options">
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={sortAlphabetically}
                    onClick={() => {
                      setSortAlphabetically((value) => !value);
                      setCaseMenuOpen(false);
                    }}
                  >
                    {sortAlphabetically ? '✓ ' : ''}Sort alphabetically
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCases((previous) => previous.map((item) => ({ ...item, unread: 0 })));
                      setCaseMenuOpen(false);
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="case-search">
            <Search size={15} className="case-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student, ID, or issue..."
              aria-label="Search cases"
              className="case-search-input"
            />
            {search && (
              <button
                type="button"
                className="case-search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="case-filter-tabs">
            <button
              type="button"
              className={`case-filter-tab ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`case-filter-tab ${filterMode === 'unread' ? 'active' : ''}`}
              onClick={() => setFilterMode('unread')}
            >
              Unread {totalUnread > 0 ? `(${totalUnread})` : ''}
            </button>
            <button
              type="button"
              className={`case-filter-tab ${filterMode === 'conferences' ? 'active' : ''}`}
              onClick={() => setFilterMode('conferences')}
            >
              Conferences
            </button>
          </div>

          {/* Case List Items */}
          <div className="case-list-items">
            {visibleCases.map((item) => {
              const isSelected = selectedCase?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`case-list-item${isSelected ? ' selected' : ''}`}
                  onClick={() => selectCase(item.id)}
                >
              <StudentInitialsAvatar
                student={{ fname: item.studentFirstName, lname: item.studentLastName, image: item.studentPhoto }}
                className="case-avatar"
              />

                  <span className="case-list-item-copy">
                    <span className="case-list-item-top">
                      <strong title={item.student}>{item.student}</strong>
                      <time>{item.updated}</time>
                    </span>

                    <span className="case-list-issue" title={item.issue}>
                      {item.issue}
                    </span>

                    <span className="case-list-item-bottom">
                      {item.unread > 0 && <span className="case-unread-pill">{item.unread}</span>}
                    </span>
                  </span>
                </button>
              );
            })}

            {visibleCases.length === 0 && (
              <div className="case-list-empty">
                <Search size={24} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                <strong>{cases.length ? 'No cases found' : 'No approved case discussions yet'}</strong>
                <span>{cases.length ? 'Try a different student name, ID, or search term.' : 'A discussion is created automatically after an admin or POD approves a case.'}</span>
              </div>
            )}
          </div>

          <div className="case-list-footnote">
            <ShieldAlert size={14} />
            <span>Official student case records. Disciplinary updates remain confidential.</span>
          </div>
        </aside>

        {/* Right Side: Active Thread */}
        {selectedCase ? (
          <section className="case-thread-panel" aria-label={`Discussion for ${selectedCase.student}`}>
            {/* Thread Header */}
            <header className="case-thread-header">
              <button
                type="button"
                className="case-back-button"
                onClick={() => setMobileThreadOpen(false)}
                aria-label="Back to active cases"
              >
                <ArrowLeft size={18} />
              </button>

              <StudentInitialsAvatar
                student={{ fname: selectedCase.studentFirstName, lname: selectedCase.studentLastName, image: selectedCase.studentPhoto }}
                className="case-thread-avatar"
              />

              <div className="case-thread-student">
                <div className="case-thread-name-row">
                  <strong>{selectedCase.student}</strong>
                  <span className="case-id-tag">{selectedCase.studentId}</span>
                </div>
                <span className="case-thread-sub">{selectedCase.className}</span>
              </div>

              {/* Status Badge */}
              <span className={`case-status-pill ${currentTheme.className}`}>
                <span className="status-dot" style={{ background: currentTheme.dot }} />
                {currentTheme.label}
              </span>

              {/* Thread Menu */}
              <div className="case-list-options case-thread-menu-wrap">
                <button
                  type="button"
                  className="case-icon-button case-thread-menu"
                  aria-label="Thread options"
                  aria-haspopup="menu"
                  aria-expanded={threadMenuOpen}
                  onClick={() => setThreadMenuOpen((open) => !open)}
                >
                  <MoreHorizontal size={19} />
                </button>
                {threadMenuOpen && (
                  <div className="case-options-menu" role="menu" aria-label="Thread options">
                    {selectedCase.status?.toLowerCase() === 'resolved' && (
                      <button
                        type="button"
                        role="menuitem"
                        className="case-close-thread-option"
                        onClick={() => {
                          setPendingCloseThread({ id: selectedCase.id, student: selectedCase.student });
                          setThreadMenuOpen(false);
                        }}
                      >
                        <LockKeyhole size={13} aria-hidden="true" />
                        Close chat permanently
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setCases((previous) =>
                          previous.map((item) =>
                            item.id === selectedCase.id ? { ...item, unread: Math.max(item.unread, 1) } : item
                          )
                        );
                        setThreadMenuOpen(false);
                      }}
                    >
                      Mark as unread
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => copyThreadValue(selectedCase.id, 'caseId')}
                    >
                      <Copy size={13} style={{ marginRight: '6px' }} />
                      {copiedKey === 'caseId' ? 'Copied Case ID!' : 'Copy Case ID'}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => copyThreadValue(selectedCase.studentId, 'studentId')}
                    >
                      <Copy size={13} style={{ marginRight: '6px' }} />
                      {copiedKey === 'studentId' ? 'Copied Student ID!' : 'Copy Student ID'}
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* Case summary opens in a dialog rather than expanding inline. */}
            <button
              type="button"
              ref={summaryTriggerRef}
              className="case-thread-summary-heading case-summary-toggle"
              aria-haspopup="dialog"
              onClick={() => setSummaryModalOpen(true)}
            >
              <span className="case-thread-summary-title">Quick Summary</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {summaryModalOpen && createPortal(
              <div
                className="case-summary-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSummaryModalOpen(false);
                }}
              >
                <section
                  className="case-summary-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="case-summary-modal-title"
                >
                  <header className="case-summary-modal-header">
                    <h2 id="case-summary-modal-title">Quick Summary</h2>
                    <button
                      type="button"
                      ref={summaryCloseRef}
                      className="case-summary-modal-close"
                      aria-label="Close quick summary"
                      onClick={() => setSummaryModalOpen(false)}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </header>
                  <div className="case-thread-details" aria-label="Case details">
                    <div className="case-detail-cell">
                      <span className="case-detail-label">Assigned to</span>
                      <strong className="case-detail-value case-detail-link">{selectedCase.assigned}</strong>
                    </div>
                    <div className="case-detail-cell">
                      <span className="case-detail-label">Violation type</span>
                      <strong className="case-detail-value">{selectedCase.category}</strong>
                    </div>
                    <div className="case-detail-cell">
                      <span className="case-detail-label">Severity</span>
                      <strong className={`case-detail-value case-severity severity-${selectedCase.severity.toLowerCase()}`}>{selectedCase.severity}</strong>
                    </div>
                    <div className="case-detail-cell">
                      <span className="case-detail-label">Status</span>
                      <span className={`case-detail-status ${currentTheme.className}`}><span className="status-dot" />{currentTheme.label}</span>
                    </div>
                    <div className="case-detail-cell">
                      <span className="case-detail-label">Created</span>
                      <strong className="case-detail-value">{selectedCase.created}</strong>
                    </div>
                  </div>
                </section>
              </div>,
              document.body
            )}

            {/* Messages Feed */}
            <div
              className="case-messages"
              ref={messagesContainerRef}
              aria-live="polite"
              onScroll={(event) => {
                setMessageMenu(null);
                setReactionPickerMessageId(null);
                setReactionPickerPosition(null);
                const feed = event.currentTarget;
                if (feed.scrollHeight - feed.scrollTop - feed.clientHeight <= 48) setNewMessageCount(0);
              }}
              onClick={(event) => {
                if (suppressMessageClickRef.current) {
                  suppressMessageClickRef.current = false;
                  return;
                }
                if (!event.target.closest('.case-message-action-menu, .case-message-action-bar')) {
                  setMessageMenu(null);
                  setReactionPickerMessageId(null);
                  setReactionPickerPosition(null);
                }
              }}
            >
              <div className="case-thread-start-note">
                <span className="start-badge">
                  Case coordination channel initialized
                </span>
                <small>{selectedCase.id.toUpperCase()}</small>
              </div>

              {selectedCase.messages.map((message, messageIndex) => {
                const ownMessage = message.sender === 'You';
                const canDeleteMessage = ownMessage || user?.role === 'admin';
                const reactionGroups = message.reactions.reduce((groups, reaction) => {
                  const group = groups.find((item) => item.emoji === reaction.emoji);
                  const mine = String(reaction.userId) === String(user?.id) && reaction.role === user?.role;
                  if (group) { group.count += 1; group.mine ||= mine; }
                  else groups.push({ emoji: reaction.emoji, count: 1, mine });
                  return groups;
                }, []);
                const senderInitials = (message.authorName || message.sender)
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('');
                const copyMessage = async () => {
                  const textToCopy = message.text || message.imageName || '';
                  if (textToCopy) {
                    try {
                      await navigator.clipboard.writeText(textToCopy);
                    } catch {
                      const ta = document.createElement('textarea');
                      ta.value = textToCopy;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                    }
                  }
                  setMessageMenu(null);
                  setReactionPickerMessageId(null);
                  setReactionPickerPosition(null);
                };
                const messageActionItems = (
                  <>
                    <button type="button" role="menuitem" onClick={() => { setReplyTo({ id: message.id, authorId: message.authorId, authorRole: message.authorRole, authorName: message.sender, text: message.text || message.imageName || 'Attachment' }); setMessageMenu(null); setReactionPickerMessageId(null); setReactionPickerPosition(null); requestAnimationFrame(() => textareaRef.current?.focus()); }}><Reply size={15} />Reply</button>
                    <button type="button" role="menuitem" onClick={copyMessage}><Copy size={15} />Copy</button>
                    {canDeleteMessage && <button type="button" role="menuitem" className="danger" onClick={() => { setPendingDeleteMessage({ id: message.id, threadId: selectedCase.id, index: messageIndex, own: ownMessage }); setMessageMenu(null); setReactionPickerMessageId(null); setReactionPickerPosition(null); }}><Trash2 size={15} />Delete</button>}
                  </>
                );

                return (
                  <React.Fragment key={message.id}>
                  {deleteNotice?.threadId === selectedCase.id && deleteNotice.index === messageIndex && (
                    <div className={`case-delete-notice${deleteNotice.own ? ' own' : ''}`} role="status">You deleted a message</div>
                  )}
                  <article
                    className={`case-message${ownMessage ? ' own' : ''}${message.replyTo ? ' has-reply' : ''}${messageMenu?.messageId === message.id ? ' message-menu-open' : ''}`}
                    onTouchStart={(event) => handleMessageTouchStart(message.id, event)}
                    onTouchEnd={clearMessageHoldTimer}
                    onTouchMove={clearMessageHoldTimer}
                    onTouchCancel={clearMessageHoldTimer}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setMessageMenu({ messageId: message.id, modal: true });
                    }}
                  >
                    <span
                      className="case-message-avatar"
                      style={{ background: '#07345f' }}
                    >
                      {senderInitials}
                      {message.authorImage && (
                        <img
                          src={message.authorImage}
                          alt=""
                          onError={(event) => event.currentTarget.remove()}
                        />
                      )}
                    </span>

                    <div className="case-message-content">
                      <div className="case-message-meta">
                        <strong className="sender-name">{message.sender}</strong>
                        <span className="role-tag">{message.role}</span>
                        <time>{message.time}</time>
                      </div>

                      {message.replyTo && (
                        <div className="case-message-reply-context">
                          <div className="case-reply-header">
                            <Reply size={10} />
                            <span className="case-reply-author">
                              {ownMessage
                                ? `You replied to ${message.replyTo.authorName === 'You' ? 'yourself' : message.replyTo.authorName}`
                                : `${message.sender} replied to ${message.replyTo.authorName === message.sender ? 'themselves' : message.replyTo.authorName}`}
                            </span>
                            {!ownMessage && message.time && <time className="case-reply-time">{message.time}</time>}
                          </div>
                          <p>{message.replyTo.text}</p>
                        </div>
                      )}

                      <div className="case-message-bubble-row">
                        {(message.text || message.audio) && (
                          <div className="case-message-bubble">
                            {message.text && <p className="message-body">{message.text}</p>}
                            {message.audio && (
                              <audio className="case-message-audio" controls src={message.audio} aria-label="Voice message" />
                            )}
                          </div>
                        )}

                        {message.image && (
                          <img
                            className="case-message-image"
                            src={message.image}
                            alt={message.imageName || 'Attached image'}
                          />
                        )}

                      <div className="case-message-action-wrap">
                      <div className="case-message-action-bar" aria-label="Message actions">
                        <button type="button" aria-label="More message actions" title="More actions" onClick={(event) => toggleDesktopMessageMenu(event, message.id, ownMessage)}>
                          <MoreHorizontal size={17} />
                        </button>
                        <button type="button" aria-label="Reply to message" title="Reply" onClick={() => { setReplyTo({ id: message.id, authorId: message.authorId, authorRole: message.authorRole, authorName: message.sender, text: message.text || message.imageName || 'Attachment' }); setMessageMenu(null); textareaRef.current?.focus(); }}>
                          <Reply size={16} />
                        </button>
                        <button type="button" aria-label="React to message" title="React" aria-expanded={reactionPickerMessageId === message.id} onClick={() => { setReactionPickerMessageId((current) => current === message.id ? null : message.id); setMessageMenu(null); }}>
                          <SmilePlus size={16} />
                        </button>
                      </div>

                      {messageMenu?.messageId === message.id && (messageMenu.modal
                        ? typeof document !== 'undefined' && createPortal(
                            <>
                              <button className="case-message-menu-backdrop" type="button" aria-label="Close message actions" onClick={() => { setMessageMenu(null); setReactionPickerMessageId(null); setReactionPickerPosition(null); }} />
                              <div className="case-message-action-menu is-modal" role="dialog" aria-label="Message actions">{messageActionItems}</div>
                            </>,
                            document.body
                          )
                        : typeof document !== 'undefined' && createPortal(
                            <div className="case-message-action-menu" style={{ left: `${messageMenu.left}px`, top: `${messageMenu.top}px` }} role="menu" aria-label="Message actions">{messageActionItems}</div>,
                            document.body
                          )
                      )}
                      </div>
                      </div>
                      {reactionPickerMessageId === message.id && (
                        reactionPickerPosition?.messageId === message.id && typeof document !== 'undefined'
                          ? createPortal(
                              <div className="case-reaction-picker is-contextual" style={{ left: `${reactionPickerPosition.left}px`, top: `${reactionPickerPosition.top}px` }} role="group" aria-label="Choose a reaction" onTouchStart={(event) => event.stopPropagation()}>
                                {chatReactionChoices.map((emoji) => <button key={emoji} type="button" aria-label={`React ${emoji}`} onClick={() => toggleReaction(selectedCase.id, message.id, emoji)}>{emoji}</button>)}
                              </div>,
                              document.body
                            )
                          : <div className="case-reaction-picker" role="group" aria-label="Choose a reaction" onTouchStart={(event) => event.stopPropagation()}>
                              {chatReactionChoices.map((emoji) => <button key={emoji} type="button" aria-label={`React ${emoji}`} onClick={() => toggleReaction(selectedCase.id, message.id, emoji)}>{emoji}</button>)}
                            </div>
                      )}
                      {reactionGroups.length > 0 && <div className="case-message-reactions" aria-label="Message reactions" onTouchStart={(event) => event.stopPropagation()}>
                        {reactionGroups.map((group) => <button key={group.emoji} type="button" className={group.mine ? 'is-mine' : ''} title={`${group.count} reaction${group.count === 1 ? '' : 's'}${group.mine ? ', including yours' : ''}`} onClick={() => toggleReaction(selectedCase.id, message.id, group.emoji)}>
                          <span aria-hidden="true">{group.emoji}</span><span>{group.count}</span>
                        </button>)}
                      </div>}
                    </div>
                  </article>
                  </React.Fragment>
                );
              })}
              {deleteNotice?.threadId === selectedCase.id && deleteNotice.index >= selectedCase.messages.length && (
                <div className={`case-delete-notice${deleteNotice.own ? ' own' : ''}`} role="status">You deleted a message</div>
              )}
              {statusUpdateNotices.filter((notice) => notice.threadId === selectedCase.id).map((notice) => {
                const nextStatusTheme = getStatusTheme(notice.nextStatus);
                return (
                  <div key={notice.id} className="case-status-update-note" role="status" aria-live="polite">
                    <span className="case-status-update-label">Status updated</span>
                    <span className="case-status-update-previous">{notice.previousStatus}</span>
                    <span className="case-status-update-arrow" aria-hidden="true">→</span>
                    <span className={`case-status-update-value ${nextStatusTheme.className}`}>
                      <span className="status-dot" />
                      {nextStatusTheme.label}
                    </span>
                  </div>
                );
              })}
              {typingUsers.filter((item) => item.threadId === selectedCase.id).length > 0 && (
                <div className="case-typing-indicator" aria-live="polite">
                  <span>
                    {typingUsers.filter((item) => item.threadId === selectedCase.id).map((item) => item.name).join(', ')}
                    {typingUsers.filter((item) => item.threadId === selectedCase.id).length === 1 ? ' is typing' : ' are typing'}
                  </span>
                  <span className="case-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer */}
            <div className="case-compose-wrapper">
              {newMessageCount > 0 && (
                <button
                  type="button"
                  className="case-new-message-indicator"
                  onClick={() => {
                    setNewMessageCount(0);
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }}
                >
                  <ChevronDown size={14} aria-hidden="true" />
                  {newMessageCount} New message{newMessageCount === 1 ? '' : 's'}
                </button>
              )}
              {replyTo && (
                <div className="case-reply-composer-preview">
                  <div className="case-reply-preview-copy">
                    <strong>Replying to {replyTo.authorName === 'You' ? 'yourself' : replyTo.authorName}</strong>
                    <span>{replyTo.text}</span>
                  </div>
                  <button type="button" aria-label="Cancel reply" title="Cancel reply" onClick={() => setReplyTo(null)}><X size={15} /></button>
                </div>
              )}
              <form className="case-compose" onSubmit={sendMessage}>
                {attachedImage && (
                  <div className="case-attachment-preview">
                    <img src={attachedImage.url} alt={attachedImage.name || 'Attached image'} />
                    <button
                      type="button"
                      className="case-attachment-remove"
                      aria-label="Remove attached image"
                      title="Remove attached image"
                      onClick={() => setAttachedImage(null)}
                    >
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  </div>
                )}
                {attachedAudio && (
                  <div className="case-audio-preview">
                    <audio
                      ref={audioPreviewRef}
                      src={attachedAudio.url}
                      aria-label="Recorded voice message"
                      onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
                      onTimeUpdate={(event) => setAudioCurrentTime(event.currentTarget.currentTime)}
                      onEnded={() => setIsAudioPlaying(false)}
                    />
                    <button
                      type="button"
                      className="case-audio-play"
                      aria-label={isAudioPlaying ? 'Pause voice message' : 'Play voice message'}
                      title={isAudioPlaying ? 'Pause voice message' : 'Play voice message'}
                      onClick={toggleAudioPreview}
                    >
                      {isAudioPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                    <input
                      className="case-audio-seek"
                      type="range"
                      min="0"
                      max={audioDuration || 0}
                      step="0.01"
                      value={Math.min(audioCurrentTime, audioDuration || 0)}
                      aria-label="Voice message progress"
                      onChange={seekAudioPreview}
                    />
                    <span className="case-audio-time">
                      {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                    </span>
                    <button
                      type="button"
                      className="case-attachment-remove"
                      aria-label="Remove recorded voice message"
                      title="Remove recorded voice message"
                      onClick={() => setAttachedAudio(null)}
                    >
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  aria-label="Write a case update"
                  rows={1}
                />
                {(isRecording || recordingError) && (
                  <span className={`case-recording-status${recordingError ? ' error' : ''}`}>
                    {recordingError || 'Recording voice message... Click the mic to stop.'}
                  </span>
                )}
                <div className="case-compose-footer">
                <span className="compose-hint">
                  <span>Press <kbd>Enter ↵</kbd> to send</span>
                  <span className="compose-hint-separator">•</span>
                  <span><kbd>Shift+Enter</kbd> for new line</span>
                </span>
                  <input
                    ref={imageInputRef}
                    className="case-image-input"
                    type="file"
                    accept="image/*"
                    aria-label="Choose an image to attach"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className={`case-compose-icon-btn${isRecording ? ' recording' : ''}`}
                    aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
                    title={isRecording ? 'Stop recording' : 'Record voice message'}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <Square size={14} fill="currentColor" strokeWidth={2} /> : <Mic size={16} strokeWidth={2} />}
                  </button>
                  <button type="button" className="case-compose-icon-btn" aria-label="Attach image" title="Attach image" onClick={() => imageInputRef.current?.click()}>
                    <Image size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="submit"
                    aria-label="Send update"
                    title="Send update"
                    disabled={sending || (!draft.trim() && !attachedImage && !attachedAudio)}
                    className="case-send-btn"
                  >
                    <Send size={16} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          </section>
        ) : (
          <section className="case-thread-panel case-no-selection">
            <div className="no-selection-card">
              <MessageSquare size={36} className="no-selection-icon" />
              <strong>No Case Selected</strong>
              <span>Choose an open student case from the left inbox to view the thread and collaborate.</span>
            </div>
          </section>
        )}
      </div>
      {pendingDeleteMessage && createPortal(
        <div
          className="case-delete-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingMessage) setPendingDeleteMessage(null);
          }}
        >
          <section className="case-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="case-delete-title">
            <h2 id="case-delete-title">Delete this message?</h2>
            <div className="case-delete-modal-actions">
              <button ref={deleteCancelRef} type="button" className="case-delete-cancel" disabled={deletingMessage} onClick={() => setPendingDeleteMessage(null)}>Cancel</button>
              <button type="button" className="case-delete-confirm" disabled={deletingMessage} onClick={confirmDeleteMessage}>
                {deletingMessage ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
      {pendingCloseThread && createPortal(
        <div
          className="case-delete-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !closingThread) setPendingCloseThread(null);
          }}
        >
          <section className="case-delete-modal case-close-thread-modal" role="alertdialog" aria-modal="true" aria-labelledby="case-close-thread-title" aria-describedby="case-close-thread-description">
            <h2 id="case-close-thread-title">Close this resolved chat permanently?</h2>
            <p id="case-close-thread-description">
              “{pendingCloseThread.student}” will be removed from the chat list and cannot be reopened. The message history will be retained.
            </p>
            <div className="case-delete-modal-actions">
              <button type="button" className="case-delete-cancel" disabled={closingThread} onClick={() => setPendingCloseThread(null)}>Cancel</button>
              <button type="button" className="case-delete-confirm" disabled={closingThread} onClick={closeResolvedThread}>
                {closingThread ? 'Closing…' : 'Close chat'}
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CaseDiscussionPage;
