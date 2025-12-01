import type { ChatMessage as ChatMessageType } from "../types";

type ChatMessageProps = {
  message: ChatMessageType;
};

// Downloads image by creating a temporary link and triggering click
const handleImageDownload = (imageUrl: string, index: number) => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `icon-${index + 1}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "system") {
    return (
      <div className="message message-system">
        <p>{message.content}</p>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="message message-user">
        <p>{message.content}</p>
      </div>
    );
  }

  return (
    <div className="message message-assistant">
      <p>{message.content}</p>
      {message.images && message.images.length > 0 && (
        <div className="image-row">
          {message.images.map((imageUrl, index) => (
            <div
              key={index}
              className="image-item"
              onClick={() => handleImageDownload(imageUrl, index)}
            >
              <img
                src={imageUrl}
                alt={`Generated icon ${index + 1}`}
                className="generated-icon"
              />
              <div className="download-overlay">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
