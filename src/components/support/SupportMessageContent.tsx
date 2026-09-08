import type { SupportMessage } from '../../api/support.api';

interface SupportMessageContentProps {
  message: SupportMessage;
}

const SupportMessageContent = ({ message }: SupportMessageContentProps) => {
  const attachment = message.attachment;
  const hasText = Boolean(message.text?.trim());

  return (
    <div className="space-y-2">
      {attachment?.url && (
        <a href={attachment.url} target="_blank" rel="noreferrer" aria-label="Open attached image">
          <img
            src={attachment.url}
            alt={attachment.filename || 'Support attachment'}
            className="block max-h-[200px] max-w-[200px] rounded-lg object-cover"
          />
        </a>
      )}
      {hasText && <p className="whitespace-pre-wrap">{message.text}</p>}
    </div>
  );
};

export default SupportMessageContent;