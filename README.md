# 🏛️ Sarkari-Sewa: AI Governance Co-Pilot (सरकारी सेवा: सुशासन सह-पाइलट)

> **Eliminating Middleman (Bicholiya) Exploitation & Clerical Bottlenecks in Nepalese Public Administration Through Multimodal Document Pre-Scrutiny, Enforced Citizen Charter SLA Timers, and Dialect Voice Guidance.**

**Public GitHub Repository**: [https://github.com/Decoy-ux/hack](https://github.com/Decoy-ux/hack)  
**Hackathon Challenge Submission**: AI Governance & Civic Technology Track  

---

## 📌 Problem Statement

### Who is Affected?
Over **80% of Nepalese citizens**—specifically daily-wage earners, rural farmers, marginalized communities, prospective migrant workers traveling from remote districts, and elderly citizens applying for:
- 🪪 **Citizenship Certificates (नागरिकता प्रमाणपत्र)**
- 🛂 **e-Passports (राहदानी)**
- 📜 **Land Ownership Deeds (मालपोत / लालपुर्जा)**
- 🚗 **Driving Licenses (सवारी चालक अनुमतिपत्र)**
- 🆔 **National ID Cards (राष्ट्रिय परिचयपत्र / NID)**
- 📄 **Ward Vital Event Records (जन्म, विवाह दर्ता र सिफारिस)**

### What Goes Wrong for Them?
Government application procedures in Nepal are heavily paper-based, opaque, and unmonitored. When citizens travel long distances from rural villages to District Administration Offices (DAO / जि.प्र.का.) or Land Revenue Offices (Malpot), they wait in queues for days, only to face **arbitrary clerical rejections** at counters (e.g., claiming a minor spelling abbreviation between "Bahadur" and "B.", missing a circular stamp that the office itself neglected to place, or miscalculating Bikram Sambat vs Gregorian dates). 

These arbitrary rejections create a predatory vacuum where **unauthorized middlemen (*bicholiya* / बिचौलिया)** stationed outside office gates intercept desperate citizens and demand informal "file clearance fees" (ranging from NPR 3,500 to over NPR 28,000) to grease palms and obtain signatures.

### The Cost if it Stays Unsolved
- **Economic Hemorrhage**: Billions of rupees in hard-earned household savings and remittance money are burned annually on bribes and middleman markups (up to 1,500% over statutory fees).
- **Lost Wages & Travel Debt**: Rural citizens spend up to a month's income traveling to district centers repeatedly.
- **Erosion of Democratic Trust**: Systemic corruption demoralizes citizens and normalizes bribery as the sole method to obtain constitutionally guaranteed public rights.

---

## 💡 The Solution: Sarkari-Sewa Governance Co-Pilot

Sarkari-Sewa is an automated civic ombudsman and governance co-pilot that permanently closes these bureaucratic loopholes through four integrated engines:

1. **Automated Forensic Document Pre-Scrutiny**:
   A computer vision and OCR engine that scans and verifies application files *before* citizens leave their village or submit at the counter. It flags missing stamps, blurred signatures, and paper defects, providing instant step-by-step remediation so corrupt clerks cannot arbitrarily bounce files.

2. **Cross-Document Discrepancy Matching**:
   Cross-analyzes secondary documents against citizenship records to catch Devanagari spelling nuances (e.g. `श्रेष्ठ` vs `श्रेसठ`, initials like `राम बि. थापा` vs `राम बहादुर थापा`) and date calculation errors. It automatically generates a ready-to-print, legally compliant **Ward Sifaris Petition (एकै व्यक्ति भएको सिफारिस)** under Section 12 of the Local Government Operation Act 2074.

3. **Predictive SLA Timers & Anti-Corruption Escalator**:
   Binds every submitted application to the statutory legal deadlines specified in the **Public Citizen Charter (नागरिक बडापत्र)** under the Good Governance Act 2064. If a clerk stalls a file past the legal deadline without documented cause, the system automatically generates and dispatches a formal anti-corruption dossier to the **Chief District Officer (CDO / प्रमुख जिल्ला अधिकारी)** and **Commission for the Investigation of Abuse of Authority (CIAA / अख्तियार दुरुपयोग अनुसन्धान आयोग)**.

4. **Multilingual Dialect Voice Co-Pilot**:
   A voice-guided assistant fluent in local languages and dialects—**Nepali (नेपाली), Maithili (मैथिली), Bhojpuri (भोजपुरी), and English**—powered by Gemini 3.8 Flash and Gemini TTS (`gemini-3.8-flash-lite-tts`). It guides non-literate and rural citizens through complex forms, fee schedules, and counter rights.

5. **Fee Truth Radar & Savings Matrix**:
   Exposes the massive gap between official government bank receipt fees and illegal middleman extortion quotes, showing citizens exactly how many thousands of rupees they are saving.

---

## 🤖 How AI Powers Sarkari-Sewa (The 4 Core Execution Tasks)

Inside the product, Gemini AI performs four specialized execution tasks:

| AI Execution Task | Model & Technique | Specific Job Inside Product | Concrete Output |
| :--- | :--- | :--- | :--- |
| **1. Classifying & Extracting Data** | `gemini-3.8-flash` Multimodal Vision & OCR | Identifies document types (Citizenship, Lalpurja, Passport, Driving License, Sifaris), parses handwritten and printed Devanagari script, and extracts standardized form fields. | Structured digital JSON records (Citizen name, Certificate number, DOB in BS & AD, Ward/District, Plot/Kitta numbers). |
| **2. Judging & Verifying** | Multimodal Vision Inspection & Rule Verification | Evaluates authenticity, checks resolution/blur score, verifies presence of the Government of Nepal circular seal (नेपाल सरकारको गोलो छाप), and inspects authorized officer signatures. | Pre-approval verdict (`PRE_APPROVED_FAST_TRACK`, `ACTION_REQUIRED`, `REJECTED_PRE_SUBMISSION`), pinpointed clerk rejection causes, and free legal remedies. |
| **3. Predicting & Timing** | Predictive SLA Engine | Calculates expected processing durations based on office queue velocity, predicts administrative delay risk scores, and detects corrupt bottleneck desks. | Real-time countdown SLA clock, middleman risk index (0-100%), and stall alerts when statutory deadlines are breached. |
| **4. Deciding & Escalating** | Automated Legal Routing Engine | Evaluates stalled files against statutory governance acts and automatically drafts formal legal petitions to oversight bodies. | Automated RTI petitions, CDO dispatch letters, Hello Sarkar 1111 complaint files, and CIAA vigilance alerts citing Good Governance Act 2064 & RTI Act 2064. |

---

## 🏛️ Legal & Constitutional Grounding (Nepal Law)

Sarkari-Sewa's escalation engine is built directly upon prevailing Nepalese legislation:
1. **Good Governance (Management and Operation) Act, 2064 (सुशासन ऐन, २०६४)**
   - *Section 15*: Mandatory display and strict adherence to the Public Citizen Charter (नागरिक बडापत्र).
   - *Section 16*: Compensation and officer accountability for unlawful delay.
2. **Right to Information Act, 2064 (सूचनाको हक सम्बन्धी ऐन, २०६४)**
   - *Section 3 & 7*: Right of every citizen to inspect and receive written justification for any pending administrative file.
3. **Prevention of Corruption Act, 2059 (भ्रष्टाचार निवारण ऐन, २०५९)**
   - *Section 19*: Penalties for civil servants intentionally delaying official duties with corrupt or extortionary intent.
4. **Local Government Operation Act, 2074 (स्थानीय सरकार सञ्चालन ऐन, २०७४)**
   - *Section 12*: Standardized ward recommendation (सिफारिस) powers for name discrepancies and vital events.

---

## 🏗️ Architecture & Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                   React 19 Frontend (SPA)                    │
│   Tailwind CSS · Lucide Icons · Devanagari Mukta Typography   │
│                                                              │
│  ┌────────────────────┐ ┌──────────────────┐ ┌────────────┐  │
│  │ Document Scrutiny  │ │  Cross-Matcher   │ │  SLA Hub   │  │
│  └────────────────────┘ └──────────────────┘ └────────────┘  │
│  ┌────────────────────┐ ┌──────────────────┐ ┌────────────┐  │
│  │ Voice Co-Pilot     │ │ Fee Truth Radar  │ │ Heatmap    │  │
│  └────────────────────┘ └──────────────────┘ └────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │ JSON / REST / Audio
┌──────────────────────────────▼───────────────────────────────┐
│              Full-Stack Express / Node.js Engine             │
│               (server.ts running on port 3000)               │
│                                                              │
│  • /api/documents/scrutinize   • /api/documents/cross-verify │
│  • /api/sla/applications       • /api/sla/simulate-tick      │
│  • /api/sla/escalate           • /api/voice/chat             │
│  • /api/voice/tts              • /api/offices/metrics        │
└──────────────────────────────┬───────────────────────────────┘
                               │ Telemetry Header: aistudio-build
┌──────────────────────────────▼───────────────────────────────┐
│                     Google GenAI SDK                         │
│                                                              │
│  • gemini-3.8-flash (OCR, Vision Scrutiny, Legal Escalation) │
│  • gemini-3.8-flash-lite-tts (Devanagari Spoken Speech)       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0
- A Google Gemini API key

### 1. Clone & Install
```bash
git clone https://github.com/Decoy-ux/hack.git
cd hack
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or use `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Public Submission & Repository Link

- **Official Submission Repository**: [https://github.com/Decoy-ux/hack](https://github.com/Decoy-ux/hack)
- **Built for**: Nepalese Citizens, District Administration Offices, and Public Anti-Corruption Oversight.
- **License**: Apache-2.0
