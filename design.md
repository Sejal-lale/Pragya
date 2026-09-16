Yes — **Pragya** should feel less like a government portal and more like a **very simple everyday utility**. The citizen shouldn't have to understand categories, departments, forms, or bureaucracy.

I'd make the design **voice-first, one-action-per-screen, multilingual, and highly visual**.

# PRAGYA — Product + Design Frame

> **Pragya**
> *Tell us. We’ll route it. Track it. Fix it.*

---

## 1. Design Philosophy

### The golden rule

**Don't make citizens fill a form. Make them have a conversation.**

Instead of:

`Category → Subcategory → Department → Location → Description → Photo → Submit`

Pragya does:

**🎙️ Tell → 📸 Show → 📍 Confirm → Done**

Everything else happens in the background.

### Design principles

* **Voice is the primary CTA**
* Maximum **one major action per screen**
* Large buttons
* Minimal text
* Hindi/regional-language friendly
* No complicated government terminology
* Always show **what happens next**
* Use icons + text, not icons alone
* Keep important information above the fold
* Designed for people who may not be highly comfortable with technology

---

# 2. Visual Identity

### Brand

**PRAGYA**

Meaning: wisdom/intelligence — which fits the AI + civic intelligence angle nicely.

### Suggested visual direction

**Clean + trustworthy + human**, rather than the typical government blue-heavy interface.

### Color system

| Purpose    | Color              |
| ---------- | ------------------ |
| Primary    | Deep Indigo        |
| Background | Warm Off-white     |
| Success    | Green              |
| Warning    | Amber              |
| Critical   | Red                |
| Text       | Dark Charcoal      |
| Secondary  | Soft Lavender/Gray |

Don't make the interface rainbow-colored. The **content and status should provide the color**, while the base UI stays calm.

### Typography

Use a highly readable sans-serif:

**Inter / Noto Sans / Noto Sans Devanagari**

This becomes especially important once Marathi/Hindi are introduced.

---

# 3. Citizen App Navigation

Keep the bottom navigation to **three items only**.

```text
┌───────────────────────────────┐
│                               │
│          PRAGYA               │
│                               │
│                               │
│       [ Report Problem ]      │
│                               │
│       [ My Complaints ]       │
│                               │
│                               │
│  Home       Complaints       Profile
└───────────────────────────────┘
```

Actually, **Report Problem should not be buried in navigation**.

It should dominate the Home screen.

---

# 4. Home Screen

This is the most important screen.

### Don't do this:

> Select department
> Select category
> Enter complaint
> Upload document
> Enter location...

Nope. 😭

### Do this:

```text
┌───────────────────────────────┐
│  ☀️ Good morning              │
│                               │
│  What happened?               │
│                               │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │        🎙️               │  │
│  │                         │  │
│  │   Tell Pragya           │  │
│  │   what's wrong          │  │
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│        or                     │
│                               │
│  ✍️ Write it instead          │
│                               │
│                               │
│  ───────────────────────────  │
│                               │
│  📍 Your location             │
│  Ward 12, Nagpur              │
│                               │
│  Home    Complaints    Profile│
└───────────────────────────────┘
```

### Primary interaction

Huge microphone button.

When tapped:

```text
┌───────────────────────────────┐
│                               │
│          🎙️                   │
│                               │
│      I'm listening...         │
│                               │
│   "Tell me what happened"     │
│                               │
│        ● ● ● ● ●              │
│                               │
│       Tap to stop             │
│                               │
└───────────────────────────────┘
```

---

# 5. Voice Interface

This is where Pragya can feel special.

Don't show a giant technical transcription screen.

After speaking:

> "Hamare road pe bahut bada pothole hai."

Pragya responds:

```text
┌───────────────────────────────┐
│  I understood                 │
│                               │
│  🛣️ Road problem              │
│                               │
│  "There is a large pothole    │
│   on the road."               │
│                               │
│  Is that correct?             │
│                               │
│  [ Yes, continue ]            │
│                               │
│  [ Edit ]                     │
└───────────────────────────────┘
```

This is important.

**Never silently trust AI.**

Let the citizen confirm what Pragya understood.

---

# 6. Photo Screen

After confirmation:

```text
┌───────────────────────────────┐
│                               │
│  Show us the problem 📸       │
│                               │
│  A photo helps us understand  │
│  and verify the issue.        │
│                               │
│                               │
│       ┌───────────────┐       │
│       │               │       │
│       │      📷       │       │
│       │  Take photo   │       │
│       │               │       │
│       └───────────────┘       │
│                               │
│       Upload from gallery     │
│                               │
│       Skip for now            │
└───────────────────────────────┘
```

Don't force five photos.

**One good photo should be enough for MVP.**

Allow more if necessary.

---

# 7. Location Screen

Pragya should automatically detect location.

```text
┌───────────────────────────────┐
│  Where is the problem? 📍     │
│                               │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │       MAP               │  │
│  │          📍             │  │
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│  📍 Near XYZ Road             │
│  Ward 12, Nagpur              │
│                               │
│  Is this correct?             │
│                               │
│  [ Yes, submit ]              │
│                               │
│  Move pin                     │
└───────────────────────────────┘
```

### Important UX detail

Don't say:

> "Latitude: 21.1458, Longitude: 79.0882"

😂 Absolutely not.

Just:

> **📍 Near XYZ Road, Ward 12**

---

# 8. Submission Screen

Before submission, show a **simple summary**.

```text
┌───────────────────────────────┐
│  Almost done ✓                │
│                               │
│  🛣️ Pothole                   │
│                               │
│  📍 XYZ Road                  │
│                               │
│  📸 1 photo attached          │
│                               │
│  We'll send this to the       │
│  right department.             │
│                               │
│     [ Report Problem ]        │
│                               │
│  You can track it anytime.   │
└───────────────────────────────┘
```

Notice:

**The citizen never selected "Road Department."**

Pragya figured that out.

---

# 9. Success Screen

Make this feel reassuring.

```text
┌───────────────────────────────┐
│                               │
│             ✓                 │
│                               │
│     Problem reported!         │
│                               │
│     #PRG-10291                │
│                               │
│     Sent to Roads Department  │
│                               │
│     Expected response         │
│     within 48 hours           │
│                               │
│    [ Track complaint ]        │
│                               │
│    We'll notify you when      │
│    something changes.         │
└───────────────────────────────┘
```

---

# 10. Complaint Tracking

This should **not** look like a boring ticketing system.

Use a visual timeline.

```text
PRG-10291

🟢 Reported
│
│  15 Sep • 10:32 AM
│
🟢 Department assigned
│
│  Roads Department
│
🟢 Employee assigned
│
│  15 Sep • 11:04 AM
│
🔵 Work in progress
│
│  Expected by 17 Sep
│
⚪ Completed
│
⚪ Verified
```

The user immediately understands:

**"Someone has my complaint and something is happening."**

---

# 11. Complaint Card

"My Complaints" should be extremely simple.

```text
My Complaints

┌───────────────────────────────┐
│ 🛣️ Pothole                   │
│ XYZ Road                      │
│                               │
│ 🔵 In progress                │
│ Expected: 17 Sep              │
│                               │
│ #PRG-10291                    │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 🗑️ Garbage                    │
│ ABC Market                    │
│                               │
│ 🟢 Resolved                   │
│                               │
│ #PRG-10187                    │
└───────────────────────────────┘
```

---

# 12. Language Selection

Put language selection **right at onboarding**, but also make it easily accessible later.

```text
┌───────────────────────────────┐
│                               │
│       स्वागत है 🙏            │
│                               │
│       Welcome to Pragya       │
│                               │
│  Choose your language         │
│                               │
│  ┌─────────────────────────┐  │
│  │ हिंदी                    │  │
│  ├─────────────────────────┤  │
│  │ English                  │  │
│  ├─────────────────────────┤  │
│  │ मराठी                    │  │
│  └─────────────────────────┘  │
│                               │
│       You can change this     │
│       anytime.                │
└───────────────────────────────┘
```

For a Nagpur/Maharashtra MVP, I'd specifically demonstrate:

**English + Hindi + Marathi**

Then design the language system so more languages can be plugged in later.

---

# 13. Government Employee UI

This needs to be different.

Citizens need **simplicity**.

Employees need **information density**.

---

## Employee Home

```text
┌──────────────────────────────────────────────┐
│ PRAGYA                         Rahul • Roads  │
├──────────────────────────────────────────────┤
│                                              │
│ Good morning, Rahul                         │
│                                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │   12    │ │    3    │ │    2    │         │
│ │ Active  │ │ Due     │ │ Overdue │         │
│ └─────────┘ └─────────┘ └─────────┘         │
│                                              │
│ Today's Tasks                                │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔴 HIGH                                  │ │
│ │                                          │ │
│ │ Large pothole                            │ │
│ │ XYZ Road • Ward 12                       │ │
│ │                                          │ │
│ │ ⏱ 8h 32m remaining                       │ │
│ │                                          │ │
│ │ [ Open Task ]                            │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 🟡 MEDIUM                                │ │
│ │ Broken streetlight                       │ │
│ │ ABC Road • Ward 12                       │ │
│ │                                          │ │
│ │ ⏱ 1d 8h remaining                        │ │
│ └──────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 14. Employee Task Page

The employee should immediately see **what, where, when**.

```text
┌──────────────────────────────────────────────┐
│ ← Task #PRG-10291                            │
├──────────────────────────────────────────────┤
│                                              │
│ 🛣️ LARGE POTHOLE                             │
│                                              │
│ 🔴 HIGH PRIORITY                             │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │             CITIZEN PHOTO               │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ DESCRIPTION                                  │
│ "Large pothole near bus stop..."            │
│                                              │
│ 📍 LOCATION                                  │
│ XYZ Road, Ward 12                           │
│                                              │
│ [ Open in Map ]                              │
│                                              │
│ DEADLINE                                     │
│ 17 Sep • 10:32 AM                           │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ [ Start Work ]                               │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 15. Employee Status Update

Don't give them 15 status options.

Use a simple flow:

```text
Assigned
   ↓
Accept
   ↓
Start Work
   ↓
Work Completed
   ↓
Upload Proof
```

When they tap **Start Work**:

> "Work started at 11:42 AM."

Automatically record timestamp.

When finished:

> **Upload a photo showing the completed work.**

Then:

**Mark as completed**

---

# 16. Supervisor Dashboard

This is where Pragya becomes much more powerful.

Instead of just:

> 1,234 complaints

show the supervisor **where attention is needed**.

```text
┌────────────────────────────────────────────────┐
│ PRAGYA — Supervisor Dashboard                 │
├────────────────────────────────────────────────┤
│                                                │
│ TODAY                                          │
│                                                │
│ 1,284 Total     312 Active     42 Overdue      │
│                                                │
│ ────────────────────────────────────────────── │
│                                                │
│ ⚠ NEEDS ATTENTION                              │
│                                                │
│ 42 complaints overdue                          │
│ 7 high-priority complaints approaching SLA     │
│                                                │
│ [ View ]                                       │
│                                                │
│ ────────────────────────────────────────────── │
│                                                │
│ COMPLAINTS BY AREA                             │
│                                                │
│          🗺️ MAP                                │
│                                                │
│       ● ●                                      │
│     ● ● ● ●                                    │
│         ●                                      │
│                                                │
│ ────────────────────────────────────────────── │
│                                                │
│ DEPARTMENT                                     │
│ Roads             184 active                   │
│ Sanitation        91 active                    │
│ Water             27 active                    │
│ Lighting          10 active                    │
│                                                │
└────────────────────────────────────────────────┘
```

---

# 17. Don't Make Government Dashboard "AI Dashboard™"

A common hackathon mistake is putting:

> AI-powered intelligent predictive analytics neural engine

everywhere. 😭

Don't.

AI should be **invisible infrastructure**.

The supervisor should see useful things:

> **42 overdue**

> **7 high-priority complaints due today**

> **23 complaints around Ward 12**

That's much more valuable.

---

# 18. Map View

This is one of the strongest visual features.

```text
                 MAP

        🔴 🔴
             🟠
     🔴 🔴 🔴

             🟢

        🟠
                     🔴

Filters:

[ All ] [ Roads ] [ Waste ]
[ Water ] [ Lighting ]

--------------------------------

Selected area:

Ward 12

34 active complaints
7 overdue
12 resolved today
```

Clicking a cluster opens the complaints in that area.

---

# 19. Supervisor Complaint Detail

The supervisor sees the **entire story**.

```text
PRG-10291

POTHOLE — XYZ ROAD

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Citizen Report
15 Sep • 10:32 AM

🎙️ Original complaint
"Yaha road mein bahut bada pothole..."

📸 Citizen photo

📍 Location

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI Classification

Category       Pothole
Department     Roads
Priority       High

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Employee

Rahul Sharma

Accepted      11:04 AM
Started       12:20 PM
Deadline      17 Sep

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Work Evidence

📸 After photo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ✓ Verify Resolution ]

[ ↻ Reopen ]
```

---

# 20. Design the AI as a "Layer"

The AI shouldn't become the interface.

Think:

```text
              PRAGYA
                 │
       ┌─────────┴─────────┐
       │                   │
    CITIZEN            GOVERNMENT
       │                   │
       └─────────┬─────────┘
                 │
            AI ENGINE
                 │
      ┌──────────┼──────────┐
      ↓          ↓          ↓
   Speech    Classify    Route
   → Text                 Dept.
```

The user experiences:

**"Pragya understood me."**

Not:

**"I interacted with an LLM."**

---

# 21. Design System Components

For your Figma file, I'd create these components first.

### Buttons

* Primary
* Secondary
* Destructive
* Icon button

### Complaint components

* Complaint card
* Status badge
* Priority badge
* Timeline
* Evidence card
* Location card
* Department card

### Citizen

* Voice recorder
* Language selector
* Photo capture
* Location confirmation
* Complaint summary

### Government

* KPI card
* Task card
* Employee card
* SLA countdown
* Map marker
* Filter chips
* Verification panel

---

# 22. Figma Frame Structure

If you're actually building this in Figma, I would organize the file like this:

```text
PRAGYA
│
├── 00 — Design Principles
│
├── 01 — Design System
│   ├── Colors
│   ├── Typography
│   ├── Buttons
│   ├── Icons
│   ├── Cards
│   └── Status
│
├── 02 — Citizen
│   ├── Language
│   ├── Home
│   ├── Voice
│   ├── Confirmation
│   ├── Photo
│   ├── Location
│   ├── Submit
│   ├── Success
│   ├── Complaints
│   └── Tracking
│
├── 03 — Employee
│   ├── Login
│   ├── Dashboard
│   ├── Task
│   ├── Start Work
│   ├── Upload Proof
│   └── Completion
│
├── 04 — Supervisor
│   ├── Dashboard
│   ├── Map
│   ├── Complaints
│   ├── Employee Performance
│   └── Verification
│
└── 05 — Prototype Flow
    ├── Citizen Flow
    ├── Employee Flow
    └── Supervisor Flow
```

---

# 23. The Main Prototype Flow

For a demo, **don't prototype 50 screens**.

Build this exact flow:

### Citizen

**Home**

↓
🎙️ **Speak**

↓
**AI understood**

↓
📸 **Take photo**

↓
📍 **Confirm location**

↓
**Submit**

↓
✓ **Complaint created**

↓
**Track complaint**

↓
**Resolved**

### Government

**Dashboard**

↓
**New complaint**

↓
**Task details**

↓
**Start work**

↓
**Upload after-photo**

↓
**Completed**

### Supervisor

**Dashboard**

↓
**Pending verification**

↓
**Compare before/after**

↓
✓ **Verify**

That is your **golden path**.

---

# 24. The "Pragya Moment"

I'd make one interaction the centerpiece of the entire product:

A citizen speaks in **Hindi/Marathi**, without knowing the government department.

For example:

> 🎙️ *"Mere area mein nali puri bhar gayi hai aur baarish mein paani road pe aa raha hai."*

Pragya understands it and displays:

> **Drainage blockage**
> 📍 Ward 12
> 📸 Add a photo

Then automatically routes it to the appropriate department.

**That is the demo moment.**

It communicates the product much better than showing a fancy analytics dashboard.

---

## 25. Final Design Direction

If I were turning this into a Figma/hackathon product, I'd keep the personality:

**Pragya = Google Maps simplicity + WhatsApp familiarity + government workflow underneath.**

Not:

**Pragya = complicated municipal ERP with an AI chatbot pasted on top.**

The citizen side should feel almost **frictionless**:

> **🎙️ Tell us.**
> **📸 Show us.**
> **📍 We'll find you.**
> **✓ We'll keep you updated.**

And the government side handles all the complexity that the citizen shouldn't have to see.
