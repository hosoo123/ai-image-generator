"use client";

import {
  FileText,
  ImageIcon,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

type Tool = "analysis" | "ingredients" | "creator";
type Message = { role: "assistant" | "user"; text: string };
type IngredientResult = {
  dishName: string;
  summary: string;
  ingredients: string[];
  note: string;
};

const toolLabels: Record<Tool, string> = {
  analysis: "Image analysis",
  ingredients: "Ingredient recognition",
  creator: "Image creator",
};

export function AiTools() {
  const [activeTool, setActiveTool] = useState<Tool>("analysis");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [creatorPrompt, setCreatorPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [ingredientResult, setIngredientResult] =
    useState<IngredientResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "How can I help you today?" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setDescription("");
    setCreatorPrompt("");
    setAnalysisResult("");
    setIngredientResult(null);
    setGeneratedImage("");
    setError("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const changeTool = (tool: Tool) => {
    reset();
    setActiveTool(tool);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult("");
  };

  const analyzeImage = async () => {
    if (!selectedFile || loading) return;
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image analysis failed.");
      setAnalysisResult(String(data.result));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Image analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const recognizeIngredients = async () => {
    if (!description.trim() || loading) return;
    try {
      setLoading(true);
      setError("");
      setIngredientResult(null);
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ingredient recognition failed.");
      setIngredientResult({
        dishName: String(data.dishName || "Your dish"),
        summary: String(data.summary || "Identified ingredients:"),
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients.map(String)
          : [],
        note: String(data.note || ""),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ingredient recognition failed.");
    } finally {
      setLoading(false);
    }
  };

  const createImage = async () => {
    if (!creatorPrompt.trim() || loading) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: creatorPrompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation failed.");
      setGeneratedImage(String(data.image));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Image generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setChatInput("");
    try {
      setChatLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed.");
      setMessages((current) => [...current, { role: "assistant", text: String(data.reply) }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: error instanceof Error ? error.message : "Chat request failed.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="site-header">AI tools</header>

      <section className="workspace">
        <nav className="tabs" aria-label="AI tools">
          {(Object.keys(toolLabels) as Tool[]).map((tool) => (
            <button
              className={`tab ${activeTool === tool ? "tab-active" : ""}`}
              key={tool}
              onClick={() => changeTool(tool)}
              type="button"
            >
              {toolLabels[tool]}
            </button>
          ))}
        </nav>

        {error && <p className="error-banner">{error}</p>}

        {activeTool === "analysis" && (
          <ToolSection
            icon={<Sparkles />}
            title="Image analysis"
            description="Upload a food photo, and AI will detect the ingredients."
            onReset={reset}
          >
            <input
              accept="image/jpeg,image/png,image/webp"
              className="file-input"
              onChange={handleFile}
              ref={fileInputRef}
              type="file"
            />

            {previewUrl && (
              <div className="preview-card">
                <img alt="Selected food preview" src={previewUrl} />
                <span>{selectedFile?.name}</span>
              </div>
            )}

            <div className="actions">
              <button
                className="primary-button"
                disabled={!selectedFile || loading}
                onClick={analyzeImage}
                type="button"
              >
                {loading ? <LoaderCircle className="spin" /> : <Upload />}
                {loading ? "Analyzing..." : "Generate"}
              </button>
            </div>

            <ResultSection icon={<FileText />} title="Here is the summary">
              {loading ? (
                <LoadingState text="Working on your image, just a moment..." />
              ) : analysisResult ? (
                <p className="result-text">{analysisResult}</p>
              ) : (
                <p className="muted">First, enter your image to recognize ingredients.</p>
              )}
            </ResultSection>
          </ToolSection>
        )}

        {activeTool === "ingredients" && (
          <ToolSection
            icon={<Sparkles />}
            title="Ingredient recognition"
            description="Describe the food, and AI will detect the ingredients."
            onReset={reset}
          >
            <textarea
              className="text-area"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your food..."
              value={description}
            />
            <div className="actions">
              <button
                className="primary-button"
                disabled={!description.trim() || loading}
                onClick={recognizeIngredients}
                type="button"
              >
                {loading && <LoaderCircle className="spin" />}
                {loading ? "Recognizing..." : "Generate"}
              </button>
            </div>

            <ResultSection icon={<FileText />} title="Identified Ingredients">
              {loading ? (
                <LoadingState text="Finding ingredients, just a moment..." />
              ) : ingredientResult?.ingredients.length ? (
                <div className="result-card">
                  <p>{ingredientResult.summary}</p>
                  <p><strong>{ingredientResult.dishName}</strong></p>
                  <ul>
                    {ingredientResult.ingredients.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {ingredientResult.note && <p>{ingredientResult.note}</p>}
                </div>
              ) : (
                <p className="muted">First, enter your text to recognize ingredients.</p>
              )}
            </ResultSection>
          </ToolSection>
        )}

        {activeTool === "creator" && (
          <ToolSection
            icon={<Sparkles />}
            title="Food image creator"
            description="What food image do you want? Describe it briefly."
            onReset={reset}
          >
            <textarea
              className="text-area"
              onChange={(event) => setCreatorPrompt(event.target.value)}
              placeholder="A delicious plate of pasta carbonara..."
              value={creatorPrompt}
            />
            <div className="actions">
              <button
                className="primary-button"
                disabled={!creatorPrompt.trim() || loading}
                onClick={createImage}
                type="button"
              >
                {loading && <LoaderCircle className="spin" />}
                {loading ? "Creating..." : "Generate"}
              </button>
            </div>

            <ResultSection icon={<ImageIcon />} title="Result">
              {loading ? (
                <LoadingState text="Creating your food image..." />
              ) : generatedImage ? (
                <div className="result-card image-result">
                  <strong>{creatorPrompt || "Pasta carbonara"}</strong>
                  <img alt={creatorPrompt || "Generated food"} src={generatedImage} />
                </div>
              ) : (
                <p className="muted">Describe an image and select Generate to see the result.</p>
              )}
            </ResultSection>
          </ToolSection>
        )}
      </section>

      <button
        aria-label="Open chat assistant"
        className="chat-toggle"
        onClick={() => setChatOpen((current) => !current)}
        type="button"
      >
        {chatOpen ? <X /> : <MessageCircle />}
      </button>

      {chatOpen && (
        <aside className="chat-panel">
          <div className="chat-header">
            <strong>Chat assistant</strong>
            <button aria-label="Close chat" onClick={() => setChatOpen(false)} type="button">
              <X />
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <p className={`message message-${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </p>
            ))}
            {chatLoading && <p className="message message-assistant">Thinking...</p>}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              aria-label="Chat message"
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type your message..."
              value={chatInput}
            />
            <button aria-label="Send message" disabled={!chatInput.trim() || chatLoading} type="submit">
              <Send />
            </button>
          </form>
        </aside>
      )}
    </main>
  );
}

function ToolSection({
  children,
  description,
  icon,
  onReset,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  onReset: () => void;
  title: string;
}) {
  return (
    <div className="tool-content">
      <div className="title-row">
        <div className="section-title">{icon}<h1>{title}</h1></div>
        <button aria-label="Reset" className="icon-button" onClick={onReset} type="button">
          <RefreshCw />
        </button>
      </div>
      <p className="muted">{description}</p>
      {children}
    </div>
  );
}

function ResultSection({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <section className="result-section">
      <div className="section-title">{icon}<h2>{title}</h2></div>
      {children}
    </section>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="loading-state">
      <p className="muted">{text}</p>
      <LoaderCircle className="spin" />
    </div>
  );
}
