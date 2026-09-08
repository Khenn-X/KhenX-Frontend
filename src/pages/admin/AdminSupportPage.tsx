import { FormEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Headphones, Loader2, MessageCircle, RefreshCw, Send, UserRound } from 'lucide-react';
import {
  supportApi,
  type SupportConversation,
  type SupportMessage,
  type SupportQueueConversation,
  type SupportUserIdentity,
} from '../../api/support.api';
import { useSupportSocket } from '../../hooks/useSupportSocket';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';
import SupportAttachmentPicker from '../../components/support/SupportAttachmentPicker';
import SupportMessageContent from '../../components/support/SupportMessageContent';

const statusLabel: Record<SupportConversation['status'], string> = {
  ai_handling: 'AI handling',
  waiting_for_agent: 'Waiting for agent',
  agent_handling: 'Agent handling',
  resolved: 'Resolved',
};

const statusStyle: Record<SupportConversation['status'], string> = {
  ai_handling: 'bg-slate-100 text-slate-600',
  waiting_for_agent: 'bg-amber-100 text-amber-700',
  agent_handling: 'bg-emerald-100 text-emerald-700',
  resolved: 'bg-slate-100 text-slate-500',
};

const messageLabel = (message: SupportMessage): string | null => {
  if (message.senderType === 'ai') return 'KhenX Assistant';
  if (message.senderType === 'agent') {
    if (typeof message.senderId === 'object' && message.senderId.fullName) return message.senderId.fullName;
    return message.senderName || 'KhenX Support';
  }
  return null;
};

const userLabel = (userId: string | SupportUserIdentity | undefined): string => {
  if (!userId) return 'Unknown user';
  if (typeof userId === 'object') return `${userId.fullName} · ${userId.email}`;
  return `User ${userId.slice(-8)}`;
};

const assignedAgentId = (conversation: SupportConversation | SupportQueueConversation | undefined): string | null => {
  if (!conversation?.assignedAgentId) return null;
  return typeof conversation.assignedAgentId === 'string'
    ? conversation.assignedAgentId
    : conversation.assignedAgentId._id;
};

const assignedAgentName = (conversation: SupportConversation | SupportQueueConversation | undefined): string | null => {
  if (conversation && 'assignedAgent' in conversation && conversation.assignedAgent?.fullName) {
    return conversation.assignedAgent.fullName;
  }
  if (typeof conversation?.assignedAgentId === 'object' && conversation.assignedAgentId) {
    return conversation.assignedAgentId.fullName;
  }
  return null;
};

const AdminSupportPage = () => {
  const socket = useSupportSocket();
  const currentUser = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<SupportQueueConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedQueueConversation = conversations.find((conversation) => conversation._id === selectedId);
  const currentUserIsSuperadmin = currentUser?.role === 'superadmin';
  const selectedAgentId = assignedAgentId(selectedConversation ?? selectedQueueConversation);
  const selectedAgentName = assignedAgentName(selectedConversation ?? selectedQueueConversation);
  const canReply = currentUserIsSuperadmin || selectedAgentId === currentUser?._id;

  useEffect(() => () => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
  }, [attachmentPreviewUrl]);

  const appendMessage = (message: SupportMessage) => {
    setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
  };

  const loadQueue = async () => {
    setError(null);
    try {
      const response = await supportApi.getQueue();
      setConversations(response.data.conversations);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load support conversations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQueue();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const joinAdminRoom = () => socket.emit('join_admin_support');
    const handleConversationUpdate = () => void loadQueue();
    const handleJoinError = (message: string) => setJoinError(message || 'Unable to join the support room.');

    socket.on('connect', joinAdminRoom);
    socket.on('conversation_updated', handleConversationUpdate);
    socket.on('join_error', handleJoinError);
    joinAdminRoom();

    return () => {
      socket.off('connect', joinAdminRoom);
      socket.off('conversation_updated', handleConversationUpdate);
      socket.off('join_error', handleJoinError);
    };
  }, [socket]);

  useEffect(() => {
    if (!selectedId || !socket) return undefined;

    const handleMessage = (message: SupportMessage) => {
      if (message.conversationId === selectedId) {
        appendMessage(message);
        setConversations((current) => current.map((conversation) => (
          conversation._id === selectedId ? { ...conversation, lastMessage: message } : conversation
        )));
      }
    };
    const handleConversationUpdate = (conversation: SupportConversation) => {
      if (conversation._id === selectedId) setSelectedConversation(conversation);
    };
    const handleJoinError = (message: string) => setJoinError(message || 'Unable to join this conversation.');

    socket.emit('join_conversation', selectedId);
    socket.on('new_message', handleMessage);
    socket.on('conversation_updated', handleConversationUpdate);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('new_message', handleMessage);
      socket.off('conversation_updated', handleConversationUpdate);
      socket.off('join_error', handleJoinError);
    };
  }, [selectedId, socket]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    setIsDetailLoading(true);
    setJoinError(null);
    void supportApi.getConversation(selectedId)
      .then((response) => {
        setSelectedConversation(response.data.conversation);
        setMessages(response.data.messages);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load this conversation.'))
      .finally(() => setIsDetailLoading(false));
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !attachment) || !selectedId || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const response = attachment
        ? await supportApi.uploadAttachment(selectedId, attachment, text)
        : await supportApi.sendAgentMessage(selectedId, text);
      appendMessage(response.data.message);
      setDraft('');
      setAttachment(null);
      setAttachmentPreviewUrl(null);
      setSelectedConversation((current) => current ? { ...current, status: 'agent_handling' } : current);
      setConversations((current) => current.map((conversation) => (
        conversation._id === selectedId
          ? { ...conversation, status: 'agent_handling', lastMessage: response.data.message }
          : conversation
      )));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the agent message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentChange = (file: File | null, attachmentError: string | null) => {
    setError(attachmentError);
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    setAttachment(file);
    setAttachmentPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleClaim = async () => {
    if (!selectedId || isClaiming) return;
    setIsClaiming(true);
    setError(null);
    try {
      const response = await supportApi.claimConversation(selectedId);
      setSelectedConversation(response.data.conversation);
      setConversations((current) => current.map((conversation) => conversation._id === selectedId
        ? { ...conversation, status: 'agent_handling', assignedAgentId: currentUser?._id, assignedAgent: currentUser ? { _id: currentUser._id, fullName: currentUser.fullName, email: currentUser.email } : null }
        : conversation));
    } catch (requestError) {
      await loadQueue();
      setJoinError('This conversation was claimed by another admin. The inbox has been refreshed.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedId || isTakingOver) return;
    setIsTakingOver(true);
    setError(null);
    try {
      const response = await supportApi.takeoverConversation(selectedId);
      setSelectedConversation(response.data.conversation);
      await loadQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to take over this conversation.');
    } finally {
      setIsTakingOver(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedId || isResolving) return;
    setIsResolving(true);
    setError(null);
    try {
      const response = await supportApi.resolveConversation(selectedId);
      setSelectedConversation(response.data.conversation);
      setSelectedId(null);
      await loadQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to resolve this conversation.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B45309]">Operations</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-[#0F172A]"><Headphones className="h-6 w-6 text-[#B45309]" /> Support inbox</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor conversations waiting for human support.</p>
        </div>
        <button type="button" onClick={() => void loadQueue()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {joinError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Realtime support connection error: {joinError}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[22rem_1fr]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 px-4 py-4"><p className="text-sm font-semibold text-[#0F172A]">Active conversations</p><p className="mt-1 text-xs text-slate-400">{conversations.length} needing attention</p></div>
          <div className="max-h-[520px] overflow-y-auto">
            {isLoading ? <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div> : conversations.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">No active support conversations.</div> : conversations.map((conversation) => (
              <div key={conversation._id} role="button" tabIndex={0} onClick={() => setSelectedId(conversation._id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(conversation._id); }} className={cn('block w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50', selectedId === conversation._id && 'bg-[#F59E0B]/10')}>
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><UserRound className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate text-sm font-semibold text-[#0F172A]">{userLabel(conversation.userId)}</span></div><span className={cn('shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold', statusStyle[conversation.status])}>{statusLabel[conversation.status]}</span></div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{conversation.lastMessage?.text || 'No messages yet.'}</p>
                <div className="mt-2 flex items-center justify-between gap-2"><p className="truncate text-[11px] text-slate-400">{assignedAgentName(conversation) ? `Assigned to ${assignedAgentName(conversation)}` : 'Unclaimed'}</p>{conversation.status === 'waiting_for_agent' && !conversation.assignedAgentId && <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedId(conversation._id); }} className="rounded-md bg-[#006A61] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#00574F]">Claim</button>}</div>
                <p className="mt-2 text-[11px] text-slate-400">{new Date(conversation.updatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[600px] flex-col">
          {!selectedId ? <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-slate-500"><MessageCircle className="mb-3 h-10 w-10 text-slate-300" /><p className="text-sm font-medium">Select a conversation</p><p className="mt-1 text-xs">Choose a support conversation to view its messages.</p></div> : <>
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-sm font-semibold text-[#0F172A]">{userLabel(selectedConversation?.userId ?? selectedQueueConversation?.userId)}</p><p className="mt-1 text-xs text-slate-400">{selectedConversation ? statusLabel[selectedConversation.status] : 'Loading conversation...'}</p>{selectedAgentName && <p className="mt-1 text-xs font-medium text-[#006A61]">Assigned to {selectedAgentName}</p>}</div><div className="flex items-center gap-2">{selectedConversation?.status === 'waiting_for_agent' && !selectedAgentId && <button type="button" onClick={() => void handleClaim()} disabled={isClaiming} className="rounded-lg bg-[#006A61] px-3 py-2 text-xs font-semibold text-white hover:bg-[#00574F] disabled:opacity-50">{isClaiming ? 'Claiming...' : 'Claim'}</button>}{selectedAgentId && selectedAgentId !== currentUser?._id && <button type="button" onClick={() => void handleTakeover()} disabled={isTakingOver} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50">{isTakingOver ? 'Taking over...' : 'Take over'}</button>}<button type="button" onClick={() => void handleResolve()} disabled={isResolving || selectedConversation?.status === 'resolved'} className="inline-flex items-center gap-2 rounded-lg bg-[#006A61] px-3 py-2 text-xs font-semibold text-white hover:bg-[#00574F] disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> {isResolving ? 'Resolving...' : 'Mark resolved'}</button></div></header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-5">{isDetailLoading ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading conversation...</div> : messages.map((message) => { if (message.senderType === 'system') return <div key={message._id} className="flex justify-center px-4"><p className="max-w-[90%] rounded-full bg-slate-200/70 px-3 py-1.5 text-center text-xs text-slate-500">{message.text}</p></div>; const isUser = message.senderType === 'user'; const label = messageLabel(message); return <div key={message._id} className={cn('flex', isUser ? 'justify-start' : 'justify-end')}><div className="max-w-[75%]">{label && <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>}<div className={cn('rounded-2xl px-4 py-3 text-sm leading-5', isUser ? 'rounded-bl-md border border-slate-200 bg-white text-slate-700' : 'rounded-br-md bg-[#006A61] text-white')}><SupportMessageContent message={message} /></div></div></div>; })}<div ref={messagesEndRef} /></div>
            {canReply ? <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-200 p-4"><SupportAttachmentPicker file={attachment} previewUrl={attachmentPreviewUrl} disabled={isSending || isDetailLoading} onChange={handleAttachmentChange} /><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={5000} rows={1} placeholder="Reply as KhenX Support..." className="min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20" /><button type="submit" disabled={(!draft.trim() && !attachment) || isSending || isDetailLoading} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006A61] text-white hover:bg-[#00574F] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send agent message">{isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></form> : <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs text-slate-500">{selectedAgentName ? `This conversation is assigned to ${selectedAgentName}. Take over to reply.` : 'Claim this conversation to reply.'}</div>}
          </>}
        </section>
      </div>
    </div>
  );
};

export default AdminSupportPage;
