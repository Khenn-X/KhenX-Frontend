import { FormEvent, useEffect, useRef, useState } from 'react';
import { Headphones, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { supportApi, type SupportConversationStatus, type SupportMessage } from '../../api/support.api';
import { useSupportSocket } from '../../hooks/useSupportSocket';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';
import SupportAttachmentPicker from './SupportAttachmentPicker';
import SupportMessageContent from './SupportMessageContent';

interface SupportConversationStatusPayload {
  _id: string;
  status: SupportConversationStatus;
}

const SupportChatWidget = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<SupportConversationStatus | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSupportSocket();
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
  }, [attachmentPreviewUrl]);

  const appendMessages = (incomingMessages: SupportMessage[]) => {
    setMessages((current) => {
      const knownIds = new Set(current.map((message) => message._id));
      return [...current, ...incomingMessages.filter((message) => !knownIds.has(message._id))];
    });
  };

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return undefined;

    const joinActiveConversation = () => {
      if (conversationIdRef.current) socket.emit('join_conversation', conversationIdRef.current);
    };
    const handleMessage = (message: SupportMessage) => {
      if (message.conversationId === conversationIdRef.current && message.visibility !== 'internal') {
        appendMessages([message]);
      }
    };
    const handleConversationUpdate = (conversation: SupportConversationStatusPayload) => {
      if (conversation._id === conversationIdRef.current) setConversationStatus(conversation.status);
    };

    socket.on('connect', joinActiveConversation);
    socket.on('new_message', handleMessage);
    socket.on('conversation_updated', handleConversationUpdate);
    joinActiveConversation();

    return () => {
      socket.off('connect', joinActiveConversation);
      socket.off('new_message', handleMessage);
      socket.off('conversation_updated', handleConversationUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (conversationId) {
      socket?.emit('join_conversation', conversationId);
    }
  }, [conversationId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isAuthenticated) return null;

  const openWidget = async () => {
    setIsOpen(true);
    setError(null);

    if (conversationId || isStarting) return;

    setIsStarting(true);
    try {
      const response = await supportApi.createConversation();
      setConversationId(response.data.conversation._id);
      setConversationStatus(response.data.conversation.status);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start support chat.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !attachment) || !conversationId || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      if (attachment) {
        const response = await supportApi.uploadAttachment(conversationId, attachment, text);
        appendMessages([response.data.message]);
        setConversationStatus(response.data.conversation.status);
      } else {
        const response = await supportApi.sendMessage(conversationId, text);
        appendMessages(response.data.messages);
        setConversationStatus(response.data.conversation.status);
      }
      setDraft('');
      setAttachment(null);
      setAttachmentPreviewUrl(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send your message.');
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

  const getSenderLabel = (message: SupportMessage) => {
    if (message.senderType === 'ai') return 'KhenX Assistant';
    if (message.senderType === 'agent') {
      if (typeof message.senderId === 'object' && message.senderId.fullName) return message.senderId.fullName;
      return message.senderName || 'KhenX Support';
    }
    return null;
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          className="mb-3 flex h-[min(38rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          aria-label="KhenX support chat"
        >
          <header className="flex items-center justify-between bg-[#0F172A] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C9A7] text-[#0F172A]">
                <Headphones className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">KhenX Support</p>
                <p className="text-[11px] text-slate-300">Here to help with your KhenX journey</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close support chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {conversationStatus === 'agent_handling' && (
            <div className="border-b border-[#00C9A7]/20 bg-[#00C9A7]/10 px-4 py-2.5 text-xs font-medium text-[#006A61]">
              You're now connected with KhenX support
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4">
            {isStarting ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting your support chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00C9A7]/10 text-[#008F7A]">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">How can we help?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Ask about listings, verification, accounts, enquiries, or payments.</p>
              </div>
            ) : (
              messages.map((message) => {
                if (message.senderType === 'system') {
                  return (
                    <div key={message._id} className="flex justify-center px-4">
                      <p className="max-w-[90%] rounded-full bg-slate-200/70 px-3 py-1.5 text-center text-xs text-slate-500">
                        <SupportMessageContent message={message} />
                      </p>
                    </div>
                  );
                }

                const isUser = message.senderType === 'user';
                const senderLabel = getSenderLabel(message);
                return (
                  <div key={message._id} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[84%]', isUser ? 'items-end' : 'items-start')}>
                      {senderLabel && <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{senderLabel}</p>}
                      <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm leading-5', isUser ? 'rounded-br-md bg-[#006A61] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700')}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
            <SupportAttachmentPicker
              file={attachment}
              previewUrl={attachmentPreviewUrl}
              disabled={isStarting || isSending || !conversationId}
              onChange={handleAttachmentChange}
            />
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message..."
              rows={1}
              maxLength={5000}
              disabled={isStarting || isSending || !conversationId}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 disabled:bg-slate-50"
              aria-label="Support message"
            />
            <button
              type="submit"
              disabled={(!draft.trim() && !attachment) || isStarting || isSending || !conversationId}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006A61] text-white transition hover:bg-[#00574F] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send support message"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : void openWidget())}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#006A61] text-white shadow-lg shadow-[#006A61]/25 transition hover:-translate-y-0.5 hover:bg-[#00574F]"
        aria-label={isOpen ? 'Close support chat' : 'Open KhenX support chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default SupportChatWidget;
