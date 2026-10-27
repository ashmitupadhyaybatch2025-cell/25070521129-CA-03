# The Club Hub (25070521129-CA-03)

**The Club Hub** is a collegiate campus club, events, and community management web application featuring a Black & Electric Yellow cyberpunk aesthetic with an authentic Japanese Matrix rain animation.

---

## 🌟 Key Features

### 1. 🏛️ Campus Clubs Directory & Profiles (`/clubs` & `/clubs/:id`)
- Explore all student-led campus clubs:
  - **Binary Beats & Cyber Coding Club** (Technical Division)
  - **SkillForge Technical Guild** (Innovation & Workshops)
  - **Thunderbolts Sports & Esports Council** (Athletics & Gaming)
  - **Rhythm & Resonance Cultural Society** (Performing Arts)
  - **Nexus Student Affairs & Social Cell** (Community & Networking)
  - **Chronicle Media & Photography Society** (Media & Storytelling)
- Discover:
  - **What they do & mission statement**
  - **Leadership team**: Club President & Coordinators (with roles, bios, and contacts)
  - **Member strength**: Total active student members
  - **Conducted activities**: Past events, workshops, hackathons, and attendance
  - **Upcoming roadmaps**: Planned next events and dates
  - **"Request to Join"**: Interactive membership application with persistent status and celebratory confetti.

### 2. 🎟️ Events & Event Details (`/events` & `/events/:id`)
- Browse upcoming and past events with search & category filters.
- Dedicated **Event Details Page** showcasing:
  - Event title, category, date, duration, and venue.
  - Which club is conducting the event with direct club profile links.
  - Interactive **Join** (with confetti) / **Leave** buttons.
  - Real-time seat capacity progress bar.
  - Event highlights and 4-phase agenda timeline.

### 3. 📢 Flexible Announcements & Members
- **Announcements (`/announcements`)**: Club updates, relative timestamps, author avatars, and "New" badges.
- **Members (`/members`)**: Campus directory with instant name search, role badges, and join dates.

### 4. ⚙️ Admin Management (`/admin`)
- Admin dashboard displaying member statistics.
- Role management (`user` $\leftrightarrow$ `admin`) and member removal with confirmation dialogs.

### 5. 🎨 Cyberpunk Design System
- Pitch Black (`#050505`) and Electric Yellow (`#facc15`).
- Half-speed authentic Japanese Matrix rain canvas streaming in the background.
- Shoh2008 gauge speedometer loader (runs max 2.2s on transitions & initial load).

---

## 🚀 How to Run Locally

### 1-Click Launch (Windows)
Double-click [`start-app.bat`](./start-app.bat) in the project root folder.

### Manual Launch
#### Terminal 1 — Backend:
```bash
cd server
npm start
```

#### Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

Visit the local URL shown by Vite (typically **http://localhost:5173**).

### 🔑 Demo Accounts
- **Admin**: `admin@theclubhub.com` / `admin123`
- Or sign up with any custom account on the `/signup` page.
