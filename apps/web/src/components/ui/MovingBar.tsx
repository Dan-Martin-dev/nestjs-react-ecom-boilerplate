import '../css/MovingBar.css';

type MessageItem = {
  text: string;
  link?: string;
  className?: string;
}

interface MovingBarProps {
  messages: (string | MessageItem)[] | string;
  className?: string;
  pauseOnHover?: boolean;
  messageRenderer?: (message: string | MessageItem) => React.ReactNode;
}

export default function MovingBar({ 
  messages, 
  className = '',
  pauseOnHover = false,
  messageRenderer
}: MovingBarProps) {
  const items = Array.isArray(messages) ? messages : [messages];
  
  // Convert string to object format for consistent handling
  const normalizedItems = items.map(item => 
    typeof item === 'string' ? { text: item } : item
  );
  
  const renderMessage = (message: MessageItem) => {
    if (messageRenderer) {
      return messageRenderer(message);
    }
    
    if (message.link) {
      return (
        <a 
          href={message.link}
          className={`hover:underline ${message.className || ''}`}
        >
          {message.text}
        </a>
      );
    }
    
    return <span className={message.className}>{message.text}</span>;
  };
  
  return (
    <div className={`moving-bar ${pauseOnHover ? 'moving-bar-pause-hover' : ''} ${className}`}>
      <div className="moving-bar-inner">
        <div className="moving-bar-content">
          {normalizedItems.map((item, i) => (
            <span key={i}>{renderMessage(item)}</span>
          ))}
        </div>
        <div className="moving-bar-content">
          {normalizedItems.map((item, i) => (
            <span key={`dup-${i}`}>{renderMessage(item)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}