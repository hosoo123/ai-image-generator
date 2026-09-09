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

const toolLabels: Record<Tool, string> = {
  analysis: "Image analysis",
  ingredients: "Ingredient recognition",
  creator: "Image creator",
};

const ingredientResult = [
  "Spaghetti",
  "Eggs",
  "Parmesan cheese",
  "Pancetta",
  "Black pepper",
  "Garlic",
  "Salt (a pinch)",
];

const pastaImage =
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85";

export function AiTools() {
  const [activeTool, setActiveTool] = useState<Tool>("analysis");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [creatorPrompt, setCreatorPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "How can I help you today?" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wait = () => new Promise((resolve) => setTimeout(resolve, 900));

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setDescription("");
    setCreatorPrompt("");
    setAnalysisResult("");
    setIngredients([]);
    setGeneratedImage("");
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
    setLoading(true);
    await wait();
    setAnalysisResult(
      "The photo appears to contain a balanced meal with fresh vegetables, a protein source, healthy fats, and a lightly seasoned sauce. The visible ingredients may include leafy greens, tomato, avocado, grains, herbs, and grilled protein.",
    );
    setLoading(false);
  };

  const recognizeIngredients = async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    await wait();
    setIngredients(ingredientResult);
    setLoading(false);
  };

  const createImage = async () => {
    if (!creatorPrompt.trim() || loading) return;
    setLoading(true);
    await wait();
    setGeneratedImage(pastaImage);
    setLoading(false);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: "user", text },
      {
        role: "assistant",
        text: "Spaghetti Carbonara is a comforting Italian classic made with pasta, eggs, cheese, pancetta, and black pepper. Its creamy texture comes from emulsifying eggs and cheese with hot pasta water—no cream is needed.",
      },
    ]);
    setChatInput("");
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
              ) : ingredients.length ? (
                <div className="result-card">
                  <p>Here’s a quick summary of the ingredients in your food:</p>
                  <ul>{ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
                  <p>Simple, classic, and delicious!</p>
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
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              aria-label="Chat message"
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type your message..."
              value={chatInput}
            />
            <button aria-label="Send message" disabled={!chatInput.trim()} type="submit">
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
