import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { generateIcons as apiGenerateIcons, ApiError } from "../services/api";
import { validateRequest } from "../utils/validation";
import type {
  ChatMessage as ChatMessageType,
  IconStyleId,
} from "../types";
import { ICON_STYLE_OPTIONS } from "../types";

type ChatStep = "welcome" | "prompt-style" | "generating" | "complete";

const initialMessages: ChatMessageType[] = [
  {
    id: "system-welcome",
    role: "system",
    content: "Hi! I'll help you generate a set of 4 consistent icons. Let's start!",
    createdAt: new Date(),
  },
  {
    id: "system-ask-prompt",
    role: "system",
    content: "Enter a theme, select a style, and optionally choose a color.",
    createdAt: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState<ChatStep>("prompt-style");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMainRef = useRef<HTMLDivElement>(null);
  const imagesLoadedRef = useRef(false);

  // Scrolls chat container to bottom
  const scrollToBottom = (forceInstant = false) => {
    if (chatMainRef.current) {
      const container = chatMainRef.current;
      // Use requestAnimationFrame for better mobile support
      requestAnimationFrame(() => {
        if (chatMainRef.current) {
          const scrollHeight = chatMainRef.current.scrollHeight;
          const clientHeight = chatMainRef.current.clientHeight;
          chatMainRef.current.scrollTop = scrollHeight - clientHeight;
        }
        // Also use scrollIntoView as fallback for mobile
        requestAnimationFrame(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
              behavior: forceInstant ? "auto" : "smooth",
              block: "end",
              inline: "nearest"
            });
          }
        });
      });
    }
  };

  // Handle images loaded callback
  const handleImagesLoaded = () => {
    imagesLoadedRef.current = true;
    // Scroll after images are loaded with a small delay for layout
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  };

  useEffect(() => {
    imagesLoadedRef.current = false;
    // Initial scroll for new messages
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Handles user input for prompt-style step with optional colors
  const handleUserInput = (input: string, styleId?: IconStyleId, colors?: string[]) => {
    if (isLoading) return;

    setError(null);

    if (currentStep === "prompt-style") {
      const validation = validateRequest(input, styleId, colors || []);
      
      if (!validation.valid) {
        setError(validation.errors.join(". "));
        return;
      }

      const { prompt, styleId: validStyleId, colors: validColors } = validation.validated!;

      const styleLabel = ICON_STYLE_OPTIONS.find((s) => s.id === validStyleId)?.label || validStyleId;
      const colorsText = validColors.length > 0 ? `, Colors: ${validColors.join(", ")}` : "";

      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content: `${prompt}, ${styleLabel}${colorsText}`,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      generateIcons(prompt, validStyleId, validColors);
    }
  };

  // Generates icons by calling the API with collected data
  const generateIcons = async (prompt: string, styleId: IconStyleId, colors: string[] = []) => {
    setError(null);
    setIsLoading(true);
    setCurrentStep("generating");

    try {
      const data = await apiGenerateIcons({ prompt, styleId, colors });

      const styleLabel =
        ICON_STYLE_OPTIONS.find((s) => s.id === styleId)?.label || styleId;

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Here are ${data.images.length} icons for "${prompt}" in ${styleLabel}!`,
        images: data.images,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentStep("complete");

      setTimeout(() => {
        setCurrentStep("prompt-style");
        const newPromptMessage: ChatMessageType = {
          id: `system-ask-prompt-new-${Date.now()}`,
          role: "system",
          content: "Want to generate more icons? Enter a theme, select a style, and optionally add colors.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, newPromptMessage]);
      }, 2000);
    } catch (err) {
      let errorMessage = "Failed to generate icons";
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.statusCode === 408) {
          errorMessage = "Request timed out. Please try again.";
        } else if (err.statusCode >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      const systemErrorMessage: ChatMessageType = {
        id: `system-error-${Date.now()}`,
        role: "system",
        content: `Sorry, ${errorMessage.toLowerCase()}. Let's try again!`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, systemErrorMessage]);
      setCurrentStep("prompt-style");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1>Icon Set Generator</h1>
        
      </header>

      <main className="chat-main" ref={chatMainRef}>
        <div className="chat-messages">
          {messages.map((m) => (
            <ChatMessage 
              key={m.id} 
              message={m} 
              onImagesLoaded={m.images && m.images.length > 0 ? handleImagesLoaded : undefined}
            />
          ))}
          {isLoading && (
            <div className="message message-assistant loading">
              <p>Generating your icons...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-footer">
        {error && <div className="error-text">{error}</div>}
        <ChatInput
          currentStep={currentStep}
          isLoading={isLoading}
          onInput={handleUserInput}
        />
      </footer>
    </div>
  );
}
