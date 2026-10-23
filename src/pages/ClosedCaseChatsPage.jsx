import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, Clock3, MessageSquareText, Search, ShieldCheck } from 'lucide-react';
import { apiGet } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { getStudentPhoto } from '../utils/studentPhoto';
import '../css/closed-case-chats.css';

const formatDateTime = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getClosedDate = (thread) => thread.closed_at ?? thread.closedAt ?? thread.updated_at ?? thread.updatedAt ?? thread.created_at ?? thread.createdAt;
const getClosedDateLabel = (thread) => thread.closed_at || thread.closedAt ? 'Closed' : 'Last activity';

const getStudentName = (record) => {
  const student = record?.student || {};
  return `${student.fname || ''} ${student.lname || ''}`.trim() || 'Unknown student';
};

const getInitials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';

export const ClosedCaseChatsPage = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClosedChats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await apiGet('/case-discussions/closed');
      const closedThreads = Array.isArray(rows) ? rows : [];
      setThreads(closedThreads);
      setSelectedId((current) => closedThreads.some((thread) => String(thread.id) === current)
        ? current
        : (closedThreads[0] ? String(closedThreads[0].id) : null));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load closed chats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClosedChats(); }, [loadClosedChats]);

  const visibleThreads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => {
      const record = thread.record || {};
      const student = record.student || {};
      const issue = record.violation?.title || 'Case discussion';
      return `${getStudentName(record)} ${student.studentId || student.student_id || ''} ${issue} ${record.status || ''}`
        .toLowerCase().includes(query);
    });
  }, [threads, searchTerm]);

  const selectedThread = visibleThreads.find((thread) => String(thread.id) === selectedId) || visibleThreads[0] || null;
  const selectedRecord = selectedThread?.record || {};
  const studentName = selectedThread ? getStudentName(selectedRecord) : '';
  const studentPhoto = getStudentPhoto(selectedRecord.student?.image || selectedRecord.student?.photo || selectedRecord.student?.avatar);
  const violationTitle = selectedRecord.violation?.title || 'Case discussion';

  return (
    <main className="closed-case-chats-page">
      <header className="closed-case-chats-header page-banner-header">
        <div className="page-banner-info">
          <Archive size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>Closed Chats</h2>
            <p>Review conversation history for resolved chats that were permanently closed.</p>
          </div>
        </div>
        <span className="closed-case-chats-count"><Archive size={14} />{threads.length} archived</span>
      </header>

      {error && (
        <div className="closed-case-chats-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadClosedChats}>Try again</button>
        </div>
      )}

      <section className="closed-case-chats-workspace" aria-label="Closed case chat archive">
        <aside className="closed-case-chats-sidebar">
          <label className="closed-case-chats-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search archived chats"
              aria-label="Search archived chats"
            />
          </label>
          <div className="closed-case-chats-list" aria-label="Archived chats">
            {loading && <p className="closed-case-chats-state">Loading closed chats…</p>}
            {!loading && !error && visibleThreads.length === 0 && (
              <p className="closed-case-chats-state">{threads.length ? 'No chats match your search.' : 'No closed chats yet.'}</p>
            )}
            {visibleThreads.map((thread) => {
              const record = thread.record || {};
              const name = getStudentName(record);
              const messageCount = thread.messages?.length || 0;
              return (
                <button
                  type="button"
                  key={String(thread.id)}
                  className={`closed-case-chat-item${selectedThread && String(selectedThread.id) === String(thread.id) ? ' selected' : ''}`}
                  onClick={() => setSelectedId(String(thread.id))}
                >
                  <span className="closed-case-chat-avatar">
                    {getInitials(name)}
                    {getStudentPhoto(record.student?.image || record.student?.photo || record.student?.avatar) && (
                      <img src={getStudentPhoto(record.student?.image || record.student?.photo || record.student?.avatar)} alt="" onError={(event) => event.currentTarget.remove()} />
                    )}
                  </span>
                  <span className="closed-case-chat-item-copy">
                    <span className="closed-case-chat-item-top"><strong>{name}</strong><time>{formatDateTime(getClosedDate(thread))}</time></span>
                    <span className="closed-case-chat-item-issue">{record.violation?.title || 'Case discussion'}</span>
                    <span className="closed-case-chat-item-bottom"><span>Resolved</span><span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="closed-case-chat-view" aria-label="Archived conversation">
          {!selectedThread ? (
            <div className="closed-case-chat-empty">
              <MessageSquareText size={30} />
              <strong>Select a closed chat</strong>
              <span>Archived conversation history will appear here.</span>
            </div>
          ) : (
            <>
              <header className="closed-case-chat-view-header">
                <div className="closed-case-chat-view-avatar">
                  {getInitials(studentName)}
                  {studentPhoto && <img src={studentPhoto} alt="" onError={(event) => event.currentTarget.remove()} />}
                </div>
                <div className="closed-case-chat-view-copy">
                  <h2>{studentName}</h2>
                  <p>{selectedRecord.student?.grade ? `Grade ${selectedRecord.student.grade}` : 'Student'}{selectedRecord.student?.section ? ` / Section ${selectedRecord.student.section}` : ''} · {violationTitle}</p>
                </div>
                <span className="closed-case-chat-closed-badge"><ShieldCheck size={14} />Closed</span>
              </header>
              <div className="closed-case-chat-meta">
                <span><Clock3 size={14} />{getClosedDateLabel(selectedThread)} {formatDateTime(getClosedDate(selectedThread))}</span>
                <span>Case #{selectedRecord.id ?? selectedThread.recordId}</span>
              </div>
              <div className="closed-case-chat-messages" role="log" aria-label="Read-only conversation history">
                {(!selectedThread.messages || selectedThread.messages.length === 0) && (
                  <p className="closed-case-chats-state">This chat has no messages.</p>
                )}
                {selectedThread.messages?.map((message) => {
                  const author = message.author_name || 'Unknown user';
                  const isOwn = String(message.author_id) === String(user?.id) && message.author_role === user?.role;
                  return (
                    <article className={`closed-case-chat-message${isOwn ? ' own' : ''}`} key={String(message.id)}>
                      <span className="closed-case-message-avatar">
                        {message.author_image
                          ? <img src={message.author_image} alt="" />
                          : getInitials(author)}
                      </span>
                      <div className="closed-case-message-stack">
                        <div className="closed-case-message-content">
                          <div className="closed-case-message-meta"><strong>{isOwn ? 'You' : author}</strong><span>{message.author_position || message.author_role || 'Staff'}</span><time>{formatDateTime(message.created_at)}</time></div>
                          {message.replyTo && <div className="closed-case-message-reply">Replying to {message.replyTo.authorName || message.replyTo.author_name || 'a previous message'}: {message.replyTo.body || 'Attachment'}</div>}
                          <div className="closed-case-message-bubble">
                            {message.body && <p>{message.body}</p>}
                            {message.attachment_url && (
                              message.attachment_url.startsWith('data:image/') || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(message.attachment_url)
                                ? <img className="closed-case-message-image" src={message.attachment_url} alt={message.attachment_name || 'Chat attachment'} />
                                : <a href={message.attachment_url} target="_blank" rel="noreferrer">{message.attachment_name || 'Open attachment'}</a>
                            )}
                            {message.audio_url && <audio controls src={message.audio_url} aria-label="Archived voice message" />}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
};

export default ClosedCaseChatsPage;
