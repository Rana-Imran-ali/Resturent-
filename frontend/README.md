# 🥘 Dastarkhwan AI — Pakistani Restaurant AI Voice & Chat Ordering Prototype

> **University Final Year Project (FYP) Demo Prototype**  
> An intelligent 24/7 Voice & Chat Ordering Agent tailored for Pakistani restaurants, supporting **Urdu script**, **Roman Urdu**, and **English mix** (*"bhai 2 zinger de do aur thanda sa Pepsi"*). Features a real-time kitchen Kanban operations dashboard, automated Cash-on-Delivery (COD) fraud risk scoring, and seamless human manager takeover.

---

## 🚀 Key Features

1. **🗣️ Multilingual Voice & Chat Agent:**
   - **Speech-to-Text (STT):** Browser Web Speech API supporting `ur-PK` (اردو) and `en-US` (Roman Urdu & English).
   - **Text-to-Speech (TTS):** Spoken order read-backs with barge-in interruption (stops speaking immediately when customer speaks).
   - **Fuzzy Roman Urdu Matching:** Recognizes phonetic variations (*"zingar"*, *"jinger"*, *"fajita"*, *"pipsi"*, *"thanda"*).
   - **Quantity in Words & Numbers:** Understands *"ek"*, *"aik"*, *"do"*, *"teen"*, *"chaar"*, *"paanch"*, `1`, `2`, `3`, `4`.
   - **Mid-Dialog Corrections:** Corrects cart on the fly (*"nahi nahi, 3 nahi, 2 zinger kardo"*).
   - **Menu Boundary Protection:** Gracefully refuses out-of-menu dishes (*biryani, haleem, nihari*) without guessing or hallucinating.
   - **Intelligent Upselling:** Naturally suggests chilled drinks or loaded fries once per order.

2. **📋 Live Restaurant Kanban Operations Board:**
   - 4-Stage visual pipeline: **New Orders ➔ Kitchen Preparing ➔ Ready for Dispatch ➔ Delivered**.
   - **Real-Time Sound Alerts:** Synthesized two-tone bell chime via Web Audio API when orders arrive.
   - **Glowing Card Animation:** New orders pulse with an animated emerald highlight and `NEW!` badge.
   - **Full Transcript Inspector:** View the complete chronological conversation recorded between the AI and the customer.

3. **🛡️ Fake-Order & COD Fraud Risk Scorer:**
   - Heuristic risk scoring engine (`Low` / `Medium` / `High`) calculating risk based on past delivery cancellations, high COD order value, new customer status, and bulk quantities.
   - **Simulated Verification Phone Call:** Click *"Verify Call"* to simulate dialing the customer to confirm their delivery address before cooking.

4. **⚠️ Intelligent Human Takeover (Handoff):**
   - Automatically marks conversations as **"Needs Attention"** when:
     - The customer clicks **"Human Handoff"**
     - Negative sentiment or angry keywords are detected (*"bakwas"*, *"ghussa"*, *"fuzool"*, *"complaint"*)
     - The AI agent fails to understand twice consecutively.
   - Restaurant managers can take over the chat live from the dashboard desk and hand back control to the AI with one click.

5. **⚡ One-Click Demo Mode (Supervisor Backup):**
   - Built-in scripted auto-player that executes an end-to-end 5-step conversation demonstrating ordering, quantity correction, out-of-menu refusal, address checkout, and live Kanban dispatch.

6. **📦 Item 86 & Stock Availability Control:**
   - Manager can toggle any dish or deal out of stock on the dashboard. The AI agent immediately detects this in chat, refuses to add the item, and suggests alternatives.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** React 19 + Vite (Fast build & HMR)
- **Styling:** Tailwind CSS (Modern dark mode with responsive split layout)
- **Audio APIs:** Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), `window.speechSynthesis`, Web Audio API oscillator
- **State Management:** React Context Store (`AppContext.jsx`) with live cross-panel synchronization
- **Architecture Pattern:** Zero backend / zero external database / zero API keys required for this prototype. Structured with tool-calling separation so a real LLM (Gemini 2.5 / OpenAI) or backend API can replace `agentEngine.js` in production.

---

## 💻 Quick Start & Run Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Browser:** **Google Chrome** or **Microsoft Edge** (Chromium browsers have native support for Web Speech API)

### Steps
1. Navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your browser:
   ```
   http://localhost:5173
   ```
   *(If port 5173 was occupied, Vite will print `http://localhost:5174` or `5175`).*

---

## 🎓 5-Minute Project Demo Script (For Supervisor Presentation)

Follow this exact walkthrough during your presentation:

### Minute 1: The Problem & Idea Setup
- *"Sir, Pakistani restaurants lose over 35% of late-night and peak-hour delivery orders because phone lines are busy or staff cannot understand Roman Urdu accents on WhatsApp."*
- *"We built Dastarkhwan AI: a 24/7 conversational Voice & Chat ordering agent designed specifically for Pakistani food habits, paired with a live kitchen dispatch board."*

### Minute 2: Multilingual Voice & Roman Urdu Understanding
- Click the **Mic button** on the customer phone panel (or use the text box):
  ```text
  Bhai 2 zinger burger aur 1 thanda pepsi de do
  ```
- **Show the supervisor:**
  1. The agent mirrors Roman Urdu (*"Zabardast! 2x Crispy Zinger Burger aur 1x Pepsi Can cart mein add kar diya..."*).
  2. The cart summary card in the phone automatically updates in real-time.
  3. The agent triggers a natural upsell for loaded fries.

### Minute 3: Conversational Intelligence (Corrections & Menu Boundaries)
- **Test Mid-Dialog Correction:**
  ```text
  Nahi nahi, 2 nahi, 3 zinger kardo
  ```
  *(Point out how the AI updates the quantity without restarting the order).*
- **Test Menu Boundary (Out-of-Menu Dish):**
  ```text
  Sath 1 chicken biryani bhi pack kardo
  ```
  *(Point out that the AI politely refuses biryani because it is a fast-food/pizza restaurant, and never hallucinates).*

### Minute 4: Order Confirmation & Live Kanban Dispatch
- Type:
  ```text
  Order kardo please, COD pe
  ```
- The agent reads back the complete bill, delivery charge, and address.
- Reply:
  ```text
  Ji haan bilkul confirm kardo
  ```
- **Show the supervisor:**
  1. The pleasant notification bell chime rings immediately.
  2. The order lands instantly in the **`New Orders`** Kanban column with a green pulse animation and `NEW!` badge.
  3. Click **"Start Cooking"** ➔ moves to **Kitchen Preparing** ➔ click **"Mark Ready"** ➔ moves to **Ready for Dispatch**.
  4. Click the **"Transcript"** button to show the full conversation log.

### Minute 5: Fraud Detection, Stock Control & Human Takeover
1. **COD Fraud Risk Scoring:** Show the `Risk Score` badge on the order card. Click **"Verify Call"** to show the simulated automated phone verification modal.
2. **Menu 86 Stock Control:** Switch to the *"Menu Stock"* tab, toggle Zinger Burger to *"86'd (Off)"*, and ask for a Zinger in the chat — the agent instantly refuses it!
3. **Human Handoff:** Type *"Bhai manager se baat karni hai"* or click the **Human Handoff** button to show the highlighted manager takeover desk.
4. **Roadmap:** Click **"Future Roadmap"** in the top bar to show planned production integrations (Twilio phone line ingestion, WhatsApp Cloud API, JazzCash/Easypaisa payments, and POS sync).
