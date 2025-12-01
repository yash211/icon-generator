import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "../types";

type ChatMessageProps = {
  message: ChatMessageType;
  onImagesLoaded?: () => void;
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

export default function ChatMessage({ message, onImagesLoaded }: ChatMessageProps) {
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const loadedCountRef = useRef(0);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    // Reset when message changes
    hasNotifiedRef.current = false;
    loadedCountRef.current = 0;
    
    if (message.role === "assistant" && message.images && message.images.length > 0) {
      // Initialize array with correct length
      imageRefs.current = new Array(message.images.length).fill(null);
    } else {
      imageRefs.current = [];
    }

    if (message.role === "assistant" && message.images && message.images.length > 0 && onImagesLoaded) {
      // Wait for next frame to ensure refs are set, then check again after a short delay
      const checkImages = () => {
        const images = imageRefs.current.filter(Boolean);
        const totalImages = images.length;
        
        if (totalImages === 0) {
          // Re-check after a short delay if refs aren't set yet
          setTimeout(checkImages, 50);
          return;
        }

        const checkAllLoaded = () => {
          loadedCountRef.current++;
          if (loadedCountRef.current === totalImages && !hasNotifiedRef.current) {
            hasNotifiedRef.current = true;
            // Wait a bit more for layout to settle
            setTimeout(() => {
              onImagesLoaded();
            }, 200);
          }
        };

        images.forEach((img) => {
          if (img && img.complete) {
            checkAllLoaded();
          } else if (img) {
            img.addEventListener("load", checkAllLoaded, { once: true });
            img.addEventListener("error", checkAllLoaded, { once: true });
          }
        });
      };

      requestAnimationFrame(() => {
        setTimeout(checkImages, 50);
      });
    }
  }, [
    message.id, 
    message.role === "assistant" ? (message.images?.length ?? 0) : 0,
    onImagesLoaded
  ]);

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
      {message.role === "assistant" && message.images && message.images.length > 0 && (
        <div className="image-row">
          {message.images.map((imageUrl, index) => (
            <div
              key={index}
              className="image-item"
              onClick={() => handleImageDownload(imageUrl, index)}
            >
              <img
                ref={(el) => {
                  if (el) {
                    imageRefs.current[index] = el;
                  }
                }}
                src={imageUrl}
                alt={`Generated icon ${index + 1}`}
                className="generated-icon"
                loading="eager"
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
