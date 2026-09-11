# AI Image Generator — кодын бүрэн тайлбар

Энэ баримт нь `ai-image-generator` төслийн бүтэц, frontend, API route, AI model, environment variable болон хэрэглэгчийн үйлдэл сервер хүртэл хэрхэн дамждагийг Монгол хэлээр тайлбарлана.

## 1. Төслийн зорилго

Энэ бол Next.js дээр хийсэн хүнсний чиглэлийн AI хэрэгслүүдийн веб апп юм. Сайт дараах үндсэн боломжуудтай.

1. **Image analysis** — хоолны зураг оруулахад зураг дээрх хоол, харагдаж буй орц, харшил болон шим тэжээлийн ерөнхий мэдээллийг гаргана.
2. **Ingredient recognition** — хэрэглэгч хоолоо бичгээр тайлбарлахад хоолны нэр болон орцуудыг ялгаж жагсаана.
3. **Image creator** — хэрэглэгчийн бичсэн prompt-оор шинэ хоолны зураг үүсгэнэ.
4. **Chat assistant** — энгийн харилцан яриа хийх, хоол, орц, жор болон бусад асуултад хариулна.

## 2. Ашигласан технологи

| Технологи | Үүрэг |
|---|---|
| Next.js 16 | Frontend болон server API-г нэг төсөлд ажиллуулна |
| React 19 | Component, state болон хэрэглэгчийн үйлдлийг удирдана |
| TypeScript | Өгөгдлийн төрлийг шалгаж, кодын алдааг эрт илрүүлнэ |
| CSS | Сайтын дизайн, responsive харагдац болон animation |
| Lucide React | Upload, Send, Refresh зэрэг icon харуулна |
| Hugging Face Inference | Зураг шинжлэх, орц таних, зураг үүсгэх AI хүсэлтүүд |
| Gemini API | Chat Assistant-ийн харилцан яриа |
| Vercel | Next.js сайтыг интернетэд deploy хийж ажиллуулна |

## 3. Төслийн үндсэн бүтэц

```text
ai-image-generator/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── chat/route.ts
│   │   ├── generate/route.ts
│   │   └── ingredients/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ai-tools.tsx
├── lib/
│   ├── gemini.ts
│   └── huggingface.ts
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 4. Апп хэрхэн ажилладаг вэ?

```mermaid
flowchart TD
    A[Хэрэглэгчийн үйлдэл] --> B[ai-tools.tsx]
    B --> C{Сонгосон хэрэгсэл}
    C -->|Зураг шинжлэх| D[/api/analyze]
    C -->|Орц таних| E[/api/ingredients]
    C -->|Зураг үүсгэх| F[/api/generate]
    C -->|Chat| G[/api/chat]
    D --> H[Hugging Face]
    E --> H
    F --> H
    G --> I[Gemini]
    H --> J[JSON хариу]
    I --> J
    J --> B
    B --> K[Үр дүнг дэлгэцэд харуулах]
```

Frontend AI provider руу шууд хүсэлт явуулдаггүй. Эхлээд өөрийн `/api/...` route руу хүсэлт явуулна. API route нь нууц token-ийг сервер талаас уншаад Hugging Face эсвэл Gemini рүү дамжуулдаг. Ингэснээр API key browser дээр ил гарахгүй.

---

# 5. Frontend файлууд

## `app/page.tsx`

```tsx
import { AiTools } from "@/components/ai-tools";

export default function Home() {
  return <AiTools />;
}
```

Энэ бол сайтын нүүр хуудас. `AiTools` component-ийг import хийгээд дэлгэцэд гаргаж байна.

- `@/` нь төслийн root folder-ийг заана.
- `Home` нь `/` хаягаар ороход ажиллах page component.
- Үндсэн логик нь `AiTools` дотор байгаа учраас энэ файл маш цэвэрхэн үлдсэн.

## `app/layout.tsx`

`RootLayout` нь бүх хуудсыг бүрхдэг хамгийн дээд layout юм.

```tsx
<html lang="en">
  <body>{children}</body>
</html>
```

- `children` дээр тухайн нээгдсэн page орж ирнэ.
- `globals.css` энд import хийгдсэн тул бүх component-д үйлчилнэ.
- `metadata` нь browser tab болон хайлтын системд ашиглагдах title, description-ийг тодорхойлно.

## `components/ai-tools.tsx`

Энэ бол төслийн хамгийн том frontend component. Дараах бүх зүйл энд удирдагдана:

- гурван үндсэн tab;
- зураг сонгох болон preview;
- API руу хүсэлт явуулах;
- loading болон error төлөв;
- AI-ийн үр дүн;
- Chat Assistant.

Файлын эхэнд байгаа:

```tsx
"use client";
```

нь энэ component browser дээр ажиллана гэсэн үг. Учир нь `useState`, `useRef`, товчны `onClick`, input-ийн `onChange` зэрэг client үйлдлүүд ашиглаж байгаа.

### Type-үүд

```tsx
type Tool = "analysis" | "ingredients" | "creator";
```

`activeTool` зөвхөн дээрх гурван утгын аль нэгийг авахыг TypeScript-д заана.

```tsx
type Message = {
  role: "assistant" | "user";
  text: string;
};
```

Chat зурвас бүр хэн бичсэн болон ямар тексттэйг хадгална.

```tsx
type IngredientResult = {
  dishName: string;
  summary: string;
  ingredients: string[];
  note: string;
};
```

Ingredient Recognition API-аас ирэх өгөгдлийн хэлбэр.

### State-үүд

| State | Юу хадгалдаг вэ? |
|---|---|
| `activeTool` | Одоо нээгдсэн tab |
| `selectedFile` | Хэрэглэгчийн сонгосон бодит `File` object |
| `previewUrl` | Сонгосон зургийг browser дээр түр харуулах URL |
| `description` | Ingredient Recognition хэсэгт бичсэн текст |
| `creatorPrompt` | Image Creator хэсэгт бичсэн prompt |
| `analysisResult` | Зураг шинжилсэн текстэн үр дүн |
| `ingredientResult` | Танигдсан хоол болон орцын object |
| `generatedImage` | AI-аар үүсгэсэн зургийн URL эсвэл data URL |
| `loading` | Үндсэн AI хүсэлт явж байгаа эсэх |
| `error` | Хэрэглэгчид харуулах алдааны текст |
| `chatOpen` | Chat цонх нээлттэй эсэх |
| `chatInput` | Chat input-д бичиж байгаа текст |
| `chatLoading` | Chat хариу хүлээж байгаа эсэх |
| `messages` | Одоогийн chat-ийн зурвасууд |

### `reset()`

```tsx
const reset = () => {
  // state-үүдийг анхны утга руу нь буцаана
};
```

Refresh товч дарах эсвэл өөр tab руу ороход input, зураг, үр дүн, loading болон error-ийг цэвэрлэнэ.

```tsx
URL.revokeObjectURL(previewUrl);
```

нь өмнө үүсгэсэн түр зургийн URL-ийг browser memory-оос чөлөөлнө.

### `changeTool(tool)`

```tsx
const changeTool = (tool: Tool) => {
  reset();
  setActiveTool(tool);
};
```

Tab солихдоо өмнөх tab-ийн өгөгдлийг цэвэрлээд шинэ tab-ийг идэвхжүүлнэ.

### `handleFile(event)`

```tsx
const file = event.target.files?.[0];
setSelectedFile(file);
setPreviewUrl(URL.createObjectURL(file));
```

1. File input-оос эхний зургийг авна.
2. Бодит файлыг `selectedFile`-д хадгална.
3. `URL.createObjectURL()` ашиглан зөвхөн browser дотор ажиллах preview URL үүсгэнэ.
4. Зургийг upload хийхээс өмнө дэлгэцэд харуулна.

### `analyzeImage()`

```tsx
const formData = new FormData();
formData.append("image", selectedFile);

await fetch("/api/analyze", {
  method: "POST",
  body: formData,
});
```

Зураг binary файл учраас JSON биш `FormData` ашиглана. `image` гэдэг нэрээр `/api/analyze` route руу илгээнэ.

Амжилттай бол:

```tsx
setAnalysisResult(String(data.result));
```

Алдаа гарвал `catch`, хүсэлт дуусахад `finally` ажиллана.

### `recognizeIngredients()`

```tsx
await fetch("/api/ingredients", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ description }),
});
```

Энэ удаа файл биш текст явуулж байгаа тул JSON ашиглана. Серверээс ирсэн утгуудыг `IngredientResult` хэлбэрт оруулаад дэлгэцэд хоолны нэр, тайлбар, орцын жагсаалт, төгсгөлийн тэмдэглэл болгон харуулна.

### `createImage()`

`creatorPrompt`-ийг `/api/generate` руу JSON хэлбэрээр явуулна. Серверээс буцаж ирсэн зургийг:

```tsx
setGeneratedImage(String(data.image));
```

гэж state-д хадгалаад `<img>`-ийн `src` болгон ашиглана.

### `sendMessage(event)`

Энэ function Chat Assistant-ийн зурвасыг удирдана.

```tsx
event.preventDefault();
```

Form submit хийхэд page refresh болохоос хамгаална.

```tsx
const nextMessages = [...messages, { role: "user", text }];
```

Өмнөх зурвасууд дээр хэрэглэгчийн шинэ зурвасыг нэмнэ.

```tsx
body: JSON.stringify({ messages: nextMessages })
```

Бүх одоогийн яриаг `/api/chat` руу явуулна. Gemini-ийн хариуг:

```tsx
setMessages((current) => [
  ...current,
  { role: "assistant", text: String(data.reply) },
]);
```

гэж ярианы төгсгөлд нэмдэг.

Анхаарах зүйл: `messages` нь зөвхөн React state-д хадгалагддаг. Page refresh хийвэл chat-ийн түүх арилна. Байнгын түүх хэрэгтэй бол database эсвэл browser-ийн `localStorage` нэмэх шаардлагатай.

### JSX UI-ийн нөхцөлүүд

```tsx
{activeTool === "analysis" && (...)}
{activeTool === "ingredients" && (...)}
{activeTool === "creator" && (...)}
```

`activeTool`-оос хамаарч гурван хэрэгслийн зөвхөн нэгийг харуулна.

```tsx
disabled={!selectedFile || loading}
```

Зураг сонгоогүй эсвэл хүсэлт аль хэдийн явж байвал товч ажиллахгүй.

```tsx
{loading ? "Analyzing..." : "Generate"}
```

Loading үед товчны текст болон icon өөрчлөгдөнө.

### Дахин ашиглагддаг жижиг component-үүд

- `ToolSection` — title, icon, тайлбар, reset товч болон үндсэн content-ийн ерөнхий загвар.
- `ResultSection` — үр дүнгийн хэсгийн title болон content.
- `LoadingState` — хүлээлгийн текст болон эргэлддэг loader.

Эдгээрийг тусад нь component болгосноор ижил JSX-ийг гурван удаа хуулж бичихээс хамгаалсан.

---

# 6. API route-ууд

Next.js-ийн `app/api/.../route.ts` файл бүр server endpoint үүсгэнэ. Эдгээр файлууд browser биш сервер дээр ажилладаг тул нууц key ашиглаж болно.

## `app/api/analyze/route.ts`

Endpoint:

```text
POST /api/analyze
```

### Ажиллах дараалал

1. `request.formData()` ашиглан upload хийсэн файлыг авна.
2. `image instanceof File` мөн эсэхийг шалгана.
3. MIME type эсвэл өргөтгөлөөр зураг мөн эсэхийг шалгана.
4. Файл 5 MB-аас бага эсэхийг шалгана.
5. Зургийг Base64 болгон хувиргана.
6. Data URL үүсгэн Hugging Face model руу тексттэй хамт явуулна.
7. Model-ийн хариуг JSON болгон frontend рүү буцаана.

```ts
const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
const dataUrl = `data:${mimeType};base64,${base64}`;
```

AI provider файл хүлээн авах URL хэлбэр шаарддаг учраас зургийг `data:image/...;base64,...` хэлбэрт оруулж байна.

Ашиглаж буй үндсэн model:

```ts
process.env.HF_VISION_MODEL || "zai-org/GLM-5.3-Flash"
```

- `.env.local` дээр `HF_VISION_MODEL` өгвөл тэр model ашиглана.
- Өгөөгүй бол `zai-org/GLM-5.3-Flash` default болно.
- Provider нь `baseten` гэж тодорхой заагдсан.

Prompt нь model-оос:

- хоолыг таних;
- харагдаж буй орцыг нэрлэх;
- шим тэжээл, харшлын хэрэгтэй тэмдэглэл өгөх;
- тодорхой бус зүйл дээр баттай гэж зохиохгүй байхыг хүсдэг.

## `app/api/ingredients/route.ts`

Endpoint:

```text
POST /api/ingredients
```

Frontend-оос дараах JSON ирнэ:

```json
{
  "description": "Би өндөг, төмс, сонгинотой хоол хийсэн"
}
```

Ашиглаж буй үндсэн model:

```ts
process.env.HF_CHAT_MODEL || "Qwen/Qwen3-32B"
```

System prompt нь AI-аас зөвхөн дараах бүтэцтэй JSON буцаахыг шаарддаг:

```json
{
  "dishName": "Хоолны нэр",
  "summary": "Товч тайлбар",
  "ingredients": ["Орц 1", "Орц 2"],
  "note": "Төгсгөлийн богино өгүүлбэр"
}
```

Дараа нь:

```ts
const json = content.match(/\{[\s\S]*\}/)?.[0] || "{}";
const parsed = JSON.parse(json);
```

гэж AI-ийн текст дотроос JSON object-ийг салгаж parse хийнэ. `ingredients` үнэхээр array мөн эсэхийг шалгаад хамгийн ихдээ 30 орц авна.

## `app/api/generate/route.ts`

Endpoint:

```text
POST /api/generate
```

Оролт:

```json
{
  "prompt": "A cinematic photo of Mongolian khuushuur"
}
```

Ашиглаж буй model:

```ts
process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell"
```

```ts
client.textToImage(..., { outputType: "dataUrl" })
```

нь prompt-оос зураг үүсгээд frontend-ийн `<img src>` дээр шууд ашиглаж болох data URL буцаана.

Prompt хоосон бол AI хүсэлт явуулахгүй, `400 Bad Request` буцаана.

## `app/api/chat/route.ts`

Endpoint:

```text
POST /api/chat
```

Оролт:

```json
{
  "messages": [
    { "role": "user", "text": "Сайн уу?" }
  ]
}
```

1. `messages` хоосон эсэхийг шалгана.
2. `generateGeminiReply(messages)` function руу дамжуулна.
3. Gemini-ийн хариуг `{ "reply": "..." }` хэлбэрээр буцаана.
4. Алдаа гарвал `502` status болон алдааны мэдээлэл буцаана.

---

# 7. AI helper файлууд

## `lib/huggingface.ts`

### `getHuggingFaceClient()`

```ts
const token = process.env.HF_TOKEN;
return new InferenceClient(token);
```

Серверийн environment variable-аас Hugging Face token авч client үүсгэнэ. Token байхгүй бол ойлгомжтой алдаа шиднэ.

### `apiError(error)`

Бүх Hugging Face route ижил аргаар алдаагаа боловсруулахын тулд энэ function-ийг ашигладаг.

Provider-ийн алдаа бол:

```json
{
  "error": "Ерөнхий алдаа",
  "details": "Provider-ийн дэлгэрэнгүй хариу",
  "providerStatus": 400
}
```

гэсэн мэдээлэлтэй `502` response үүсгэнэ. Бусад алдаа бол `500` response буцаана.

## `lib/gemini.ts`

Chat Assistant-ийн Gemini API холболт энд байна.

### API key болон model

```ts
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";
```

`GEMINI_CHAT_MODEL` байхгүй бол `gemini-3.6-flash` ашиглана.

### System instruction

`systemInstruction` нь Chat Assistant ямар зан төлөвтэй, ямар хэлээр, хэрхэн хариулах дүрэм юм. Одоогийн prompt:

- кирилл монголд байгалийн монгол хэлээр хариулна;
- латин үсгээр бичсэн монголыг ойлгоод кириллээр хариулна;
- энгийн болон үргэлжилсэн яриа хийж чадна;
- хоол, жор, орц, шим тэжээлээр тусална;
- бүтээгчийг асуувал Hosoo гэж танилцуулна;
- Hosoo хүнсний чиглэлийн AI хэрэгслүүд хөгжүүлж байгааг тайлбарлана;
- мэдэхгүй хувийн мэдээллийг зохиохгүй;
- өөрийн хийж чадахгүй бодит үйлдлийг хийсэн гэж худал хэлэхгүй.

### Сүүлийн ярианы context

```ts
messages.slice(-10)
```

Сүүлийн 10 зурвасыг Gemini рүү явуулдаг. Тиймээс хэрэглэгчийн дараагийн асуулт өмнөх яриатай холбоотой байвал ойлгож чадна.

### Хариултын хэмжээ

```ts
maxOutputTokens: 800
```

AI хамгийн ихдээ 800 output token ашиглаж болно. Энэ нь яг 800 үг гэсэн үг биш. Token бол AI текстийг боловсруулах жижиг хэсэг юм.

### Retry логик

```ts
for (let attempt = 0; attempt < 3; attempt += 1)
```

Gemini `429` буюу хүсэлтийн хязгаар, эсвэл `503` буюу түр ачаалалтай алдаа өгвөл нийт гурван удаа дахин оролдоно.

```ts
setTimeout(resolve, 700 * 2 ** attempt)
```

Оролдлого бүрийн өмнө хүлээх хугацааг нэмэгдүүлнэ. Ингэснээр түр зуурын ачааллын үед хүсэлт шууд бүтэлгүйтэх магадлал багасна.

---

# 8. CSS дизайн

## `app/globals.css`

Энэ файл бүх сайтын дизайныг удирдана.

### CSS variable

```css
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --primary: #18181b;
  --muted: #f4f4f5;
}
```

Өнгө болон radius-ийг variable болгосноор нэг газраас өөрчлөхөд бүх сайт дагаж өөрчлөгдөнө.

### Үндсэн layout

- `.app-shell` — дэлгэцийн хамгийн бага өндөр 100vh.
- `.site-header` — дээд header.
- `.workspace` — үндсэн content-ийг 620px хүртэл өргөн, голлуулж байрлуулна.
- `.tabs`, `.tab`, `.tab-active` — хэрэгслүүдийн tab дизайн.

### Form болон result

- `.file-input` — зураг сонгох input.
- `.text-area` — prompt болон description бичих хэсэг.
- `.primary-button` — Generate товч.
- `.preview-card` — сонгосон зургийн preview.
- `.result-card`, `.result-text` — AI үр дүнгийн хүрээ.
- `.error-banner` — алдааг улаан хүрээтэй харуулна.

### Loading animation

```css
.spin { animation: spin 900ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

Loader icon-ийг 900 миллисекунд тутам бүтэн эргүүлнэ.

### Chat UI

- `.chat-toggle` — баруун доод буланд байрлах дугуй Chat товч.
- `.chat-panel` — нээгдсэн Chat Assistant цонх.
- `.message-assistant` — AI-ийн хар зурвас.
- `.message-user` — хэрэглэгчийн цайвар зурвас.
- `.chat-form` — input болон Send товч.

### Mobile responsive

```css
@media (max-width: 640px) { ... }
```

Дэлгэц 640px-аас нарийн үед padding багасаж, tab-ууд дэлгэцийн өргөнд таарч, chat panel хоёр талаасаа 16px зайтай болно.

---

# 9. Тохиргооны файлууд

## `.env.example`

Энэ файл шаардлагатай environment variable-ийн нэрийг жишээ болгон харуулна. Жинхэнэ token энд бичихгүй.

```env
HF_TOKEN=
HF_CHAT_MODEL=
HF_VISION_MODEL=
HF_IMAGE_MODEL=
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=
```

Local орчинд `.env.local` файл үүсгээд жинхэнэ утгуудыг бичнэ:

```env
HF_TOKEN=hf_your_real_token
GEMINI_API_KEY=your_real_gemini_key
```

`HF_CHAT_MODEL`, `HF_VISION_MODEL`, `HF_IMAGE_MODEL`, `GEMINI_CHAT_MODEL` нь optional. Хоосон байвал кодонд бичсэн default model ашиглагдана.

> **Аюулгүй байдал:** Нууц key-ийн нэрийн өмнө `NEXT_PUBLIC_` бичиж болохгүй. `NEXT_PUBLIC_`-тай variable browser-ийн кодонд орж, хэрэглэгч харах боломжтой болдог.

Vercel дээр эдгээрийг Project → Settings → Environment Variables хэсэгт оруулна.

## `package.json`

### Script-үүд

| Command | Үүрэг |
|---|---|
| `npm run dev` | Local development server асаана |
| `npm run build` | Production build шалгана |
| `npm run start` | Build хийсэн production server асаана |
| `npm run typecheck` | TypeScript алдаа шалгана |

### Dependency

- `next`, `react`, `react-dom` — веб аппын үндэс.
- `@huggingface/inference` — Hugging Face API client.
- `lucide-react` — icon library.
- `typescript`, `@types/...` — TypeScript хөгжүүлэлтийн хэрэгслүүд.

## `tsconfig.json`

TypeScript-ийн дүрмүүдийг тохируулна.

- `strict: true` — type шалгалтыг чанга ажиллуулна.
- `noEmit: true` — TypeScript тусдаа JavaScript файл гаргахгүй, зөвхөн шалгана.
- `moduleResolution: "bundler"` — Next.js-ийн import шийдвэрлэлт.
- `@/*: ["./*"]` — `@/components/...` хэлбэрийн богино import ашиглах боломж.
- `exclude: ["node_modules"]` — dependency folder-ийг шалгахгүй.

## `next.config.ts`

Одоогоор нэмэлт Next.js тохиргоогүй:

```ts
const nextConfig: NextConfig = {};
```

Цаашид image domain, redirect, header зэрэг тохиргоо шаардлагатай бол энд нэмнэ.

---

# 10. Алдаа боловсруулах үндсэн загвар

Frontend-ийн async function-үүд ерөнхийдөө ижил бүтэцтэй:

```ts
try {
  setLoading(true);
  setError("");

  const response = await fetch(...);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  // Амжилттай үр дүнг state-д хадгална
} catch (error) {
  // Алдааг хэрэглэгчид харуулна
} finally {
  setLoading(false);
}
```

- `try` — алдаа гарч болох үндсэн үйлдэл.
- `throw new Error()` — API амжилтгүй бол зориуд `catch` руу шилжүүлнэ.
- `catch` — алдааны мэдээллийг барьж авна.
- `finally` — амжилттай эсвэл алдаатай байхаас үл хамааран хамгийн сүүлд ажиллана.

---

# 11. Ашиглаж буй AI model-ууд

| Үйлдэл | Provider | Default model | Кодын байрлал |
|---|---|---|---|
| Food image analysis | Hugging Face / Baseten | `zai-org/GLM-5.3-Flash` | `app/api/analyze/route.ts` |
| Ingredient recognition | Hugging Face | `Qwen/Qwen3-32B` | `app/api/ingredients/route.ts` |
| Food image creation | Hugging Face | `black-forest-labs/FLUX.1-schnell` | `app/api/generate/route.ts` |
| Chat Assistant | Google Gemini | `gemini-3.6-flash` | `lib/gemini.ts` |

Environment variable ашиглан model-ийг код өөрчлөхгүйгээр сольж болно.

---

# 12. Local дээр ажиллуулах

```bash
git clone https://github.com/hosoo123/ai-image-generator.git
cd ai-image-generator
npm install
```

Root folder дотор `.env.local` үүсгээд key-үүдээ оруулна:

```env
HF_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
```

Дараа нь:

```bash
npm run dev
```

Browser дээр:

```text
http://localhost:3000
```

## Код шалгах

```bash
npm run typecheck
npm run build
```

Эдгээр хоёр command амжилттай дуусвал TypeScript болон production build-ийн үндсэн алдаа байхгүй гэсэн үг.

---

# 13. Vercel deploy урсгал

1. Код GitHub-ийн `main` branch руу push хийгдэнэ.
2. Vercel repository-ийн өөрчлөлтийг илрүүлнэ.
3. `npm run build` ажиллуулна.
4. Environment Variables-ийг server route-уудад өгнө.
5. Амжилттай бол шинэ deployment production URL дээр гарна.

GitHub руу шинэ commit оруулах бүрд Vercel автоматаар дахин deploy хийнэ.

---

# 14. Одоогийн хязгаарлалт ба цаашдын сайжруулалт

1. **Chat history байнгын биш** — refresh хийхэд арилна. `localStorage` эсвэл database ашиглаж болно.
2. **Authentication байхгүй** — хэрэглэгч бүр API endpoint дуудаж чадна. Rate limit болон login нэмэх боломжтой.
3. **AI хэрэглээний хязгаар** — Hugging Face, Gemini-ийн quota дуусвал хүсэлт алдаа өгнө.
4. **Upload хамгаалалт** — хэмжээ, төрөл шалгаж байгаа ч production орчинд rate limiting нэмэх хэрэгтэй.
5. **Markdown rendering байхгүй** — Image Analysis болон Chat-ийн Markdown хариуг одоогоор энгийн текстээр харуулдаг.
6. **Database байхгүй** — хэрэглэгчийн зураг, үр дүн, chat хадгалагдахгүй.
7. **UI хэл холилдсон** — Chat Монгол хэлтэй боловч үндсэн интерфэйс Англи хэлтэй. Хэл солих боломж нэмэж болно.

## Дүгнэлт

Энэ төсөл нэг Next.js app дотор frontend болон backend API-г хамтад нь шийдсэн. Хэрэглэгчийн browser нууц AI key-г мэдэхгүй; бүх нууц хүсэлт server route-аар дамжина. Hugging Face нь зураг шинжилгээ, орц танилт, зураг үүсгэлтийг, Gemini нь Chat Assistant-ийг ажиллуулдаг. React state нь UI-ийн бүх түр төлөвийг удирдаж, CSS нь desktop болон mobile дизайныг хариуцдаг.
