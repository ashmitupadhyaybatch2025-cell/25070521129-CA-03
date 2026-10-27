// ============================================================
// Clubs Data — Self-contained modular data for all campus clubs
// ============================================================

export const CLUBS_DATA = [
  {
    id: 'binary-beats',
    name: 'Binary Beats & Cyber Coding Club',
    tagline: 'Code. Hack. Build the future.',
    badge: '💻 Tech Division',
    category: 'Technical',
    icon: '💻',
    accentColor: '#facc15',
    memberCount: 148,
    meetingVenue: 'Lab 402, Cyber Tower',
    meetingSchedule: 'Wednesdays & Fridays, 5:00 PM',
    email: 'tech@clubhub.internal',
    description:
      'Binary Beats is the premier computer science and algorithmic engineering community on campus. We organize competitive programming bootcamps, full-stack web/mobile hackathons, open-source contribution sprints, and machine learning research workshops.',
    president: {
      name: 'Alex Vance',
      role: 'Club President & Lead Architect',
      email: 'alex.vance@clubhub.internal',
      bio: 'Final year CS major, 3x Hackathon winner, specializing in distributed systems and systems security.',
      avatar: 'AV',
    },
    coordinators: [
      {
        name: 'Priya Sharma',
        role: 'Technical Coordinator',
        email: 'priya.s@clubhub.internal',
        focus: 'Competitive Programming & DSA',
        avatar: 'PS',
      },
      {
        name: 'Rohit Verma',
        role: 'Projects & Dev Coordinator',
        email: 'rohit.v@clubhub.internal',
        focus: 'Full-Stack & Cloud Infrastructure',
        avatar: 'RV',
      },
    ],
    conductedActivities: [
      {
        title: 'Hackathon 24h: CyberSprint 2026',
        date: 'Oct 2026',
        attendees: 120,
        summary: 'Overnight hackathon with 30 teams building AI-powered campus utilities and web apps.',
      },
      {
        title: 'Full-Stack React & Node Masterclass',
        date: 'Sep 2026',
        attendees: 85,
        summary: 'A 2-day hands-on workshop guiding students to build and deploy their first production apps.',
      },
      {
        title: 'Algorithmic Speedrun Clash',
        date: 'Aug 2026',
        attendees: 64,
        summary: 'Fast-paced algorithmic challenge testing dynamic programming and graph theory problem-solving.',
      },
    ],
    nextPlans: [
      {
        title: 'Autonomous AI Agents Hackathon',
        expectedDate: 'Mid November 2026',
        description: 'Building multi-agent autonomous workflows using modern LLM frameworks.',
      },
      {
        title: 'System Design & High-Scalability Workshop',
        expectedDate: 'Early December 2026',
        description: 'Hands-on architectural deep dive into caching, sharding, and message queues.',
      },
      {
        title: 'Open Source Summer Contribution Camp',
        expectedDate: 'January 2027',
        description: 'Mentorship initiative guiding members to land contributions in top global repositories.',
      },
    ],
  },
  {
    id: 'skillforge',
    name: 'SkillForge Technical Guild',
    tagline: 'Forge your skills with hands-on hardware & tools.',
    badge: '🛠️ Innovation & Labs',
    category: 'Workshop',
    icon: '🛠️',
    accentColor: '#38bdf8',
    memberCount: 112,
    meetingVenue: 'Maker Studio, Room 108',
    meetingSchedule: 'Tuesdays, 4:30 PM',
    email: 'workshops@clubhub.internal',
    description:
      'SkillForge provides hands-on practical engineering, product design, and rapid prototyping experiences. We bridge theoretical curriculum and real-world execution with interactive toolkits, 3D printing, and industry certifications.',
    president: {
      name: 'Kevin Miller',
      role: 'Guild President & Maker Lead',
      email: 'kevin.m@clubhub.internal',
      bio: 'Passionate hardware engineer and IoT enthusiast with multiple published IoT robotics patents.',
      avatar: 'KM',
    },
    coordinators: [
      {
        name: 'Tanvi Joshi',
        role: 'Workshop Coordinator',
        email: 'tanvi.j@clubhub.internal',
        focus: 'UI/UX & Design Systems',
        avatar: 'TJ',
      },
      {
        name: 'Aaron Paul',
        role: 'Hardware Lab Incharge',
        email: 'aaron.p@clubhub.internal',
        focus: 'Embedded Systems & Robotics',
        avatar: 'AP',
      },
    ],
    conductedActivities: [
      {
        title: 'Arduino & Microcontroller Robotics Lab',
        date: 'Oct 2026',
        attendees: 70,
        summary: 'Hands-on session building sensor-controlled obstacle-avoidance robots.',
      },
      {
        title: 'Figma to Code: UI/UX Prototyping Workshop',
        date: 'Sep 2026',
        attendees: 90,
        summary: 'Interactive design sprint covering wireframing, color theory, and responsive component auto-layout.',
      },
      {
        title: 'Cloud DevOps & Docker 101',
        date: 'Aug 2026',
        attendees: 60,
        summary: 'Containerization basics, Dockerfiles, and CI/CD pipeline automation.',
      },
    ],
    nextPlans: [
      {
        title: '3D Printing & CAD Prototyping Bootcamp',
        expectedDate: 'Late November 2026',
        description: 'Students learn SolidWorks basics and print their custom mechanical parts.',
      },
      {
        title: 'Edge AI on Raspberry Pi',
        expectedDate: 'December 2026',
        description: 'Running lightweight computer vision models directly on edge microcomputers.',
      },
    ],
  },
  {
    id: 'thunderbolts',
    name: 'Thunderbolts Sports & Esports Council',
    tagline: 'Speed, stamina, and competitive spirit.',
    badge: '⚡ Athletics & Gaming',
    category: 'Sports',
    icon: '⚡',
    accentColor: '#22c55e',
    memberCount: 195,
    meetingVenue: 'Arena Complex & Sports Pavilion',
    meetingSchedule: 'Mondays & Thursdays, 6:00 PM',
    email: 'sports@clubhub.internal',
    description:
      'Thunderbolts spearheads all physical sports leagues, collegiate athletic championships, endurance marathons, and collegiate esports tournaments on campus. We focus on team spirit, wellness, and tactical prowess.',
    president: {
      name: 'Marcus Ray',
      role: 'Council Captain & President',
      email: 'marcus.r@clubhub.internal',
      bio: 'Varsity football team captain and national collegiate 400m track medalist.',
      avatar: 'MR',
    },
    coordinators: [
      {
        name: 'Devansh Mehta',
        role: 'Athletics Coordinator',
        email: 'devansh.m@clubhub.internal',
        focus: 'Cricket, Football & Track Events',
        avatar: 'DM',
      },
      {
        name: 'Sneha Patil',
        role: 'Esports Coordinator',
        email: 'sneha.p@clubhub.internal',
        focus: 'Valorant, BGMI & Rocket League Tournaments',
        avatar: 'SP',
      },
    ],
    conductedActivities: [
      {
        title: 'Inter-College Cricket Championship',
        date: 'Oct 2026',
        attendees: 160,
        summary: '8 collegiate teams competed in an electric 10-over tournament on the main ground.',
      },
      {
        title: 'Night Futsal League 2026',
        date: 'Sep 2026',
        attendees: 110,
        summary: '5v5 high-speed indoor futsal tournament under floodlights.',
      },
      {
        title: 'Valorant Campus Showdown',
        date: 'Aug 2026',
        attendees: 140,
        summary: 'Live LAN gaming tournament streamed across campus lounges.',
      },
    ],
    nextPlans: [
      {
        title: 'Inter-Department Basketball League',
        expectedDate: 'November 2026',
        description: 'Annual round-robin basketball playoffs leading to championship finals.',
      },
      {
        title: 'Campus Marathon for Mental Health',
        expectedDate: 'December 2026',
        description: '5K and 10K campus community endurance run supporting student well-being.',
      },
    ],
  },
  {
    id: 'rhythm-resonance',
    name: 'Rhythm & Resonance Cultural Society',
    tagline: 'Where melody, dance, and expression meet.',
    badge: '🎭 Performing Arts',
    category: 'Cultural',
    icon: '🎭',
    accentColor: '#f43f5e',
    memberCount: 164,
    meetingVenue: 'Amphitheatre & Fine Arts Hall',
    meetingSchedule: 'Wednesdays, 5:30 PM',
    email: 'cultural@clubhub.internal',
    description:
      'The vibrant home for performing arts, orchestral bands, street theatre, contemporary dance, and grand multi-cultural campus festivals. We celebrate diverse artistic expressions and provide a stage for every student performer.',
    president: {
      name: 'Maya Sen',
      role: 'Creative Director & President',
      email: 'maya.sen@clubhub.internal',
      bio: 'Trained classical vocalist and lead performer with 15+ university cultural festival accolades.',
      avatar: 'MS',
    },
    coordinators: [
      {
        name: 'Kabir Khanna',
        role: 'Music & Band Coordinator',
        email: 'kabir.k@clubhub.internal',
        focus: 'Acoustic Bands & Sound Engineering',
        avatar: 'KK',
      },
      {
        name: 'Ananya Roy',
        role: 'Dramatics & Dance Coordinator',
        email: 'ananya.r@clubhub.internal',
        focus: 'Theatrical Plays & Choreography',
        avatar: 'AR',
      },
    ],
    conductedActivities: [
      {
        title: 'Annual Grand Cultural Night',
        date: 'Oct 2026',
        attendees: 280,
        summary: 'Flagship festival with rock bands, classical fusion, and Broadway-inspired theatrical acts.',
      },
      {
        title: 'Acoustic Unplugged Evening',
        date: 'Sep 2026',
        attendees: 95,
        summary: 'Intimate open-air acoustic music session under the campus starlight.',
      },
      {
        title: 'Nukkad Natak (Street Theatre) Showcase',
        date: 'Aug 2026',
        attendees: 150,
        summary: 'Social awareness street plays performed across main campus quads.',
      },
    ],
    nextPlans: [
      {
        title: 'Battle of the Campus Bands 2026',
        expectedDate: 'Late November 2026',
        description: 'Live musical competition featuring student bands across genres.',
      },
      {
        title: 'Inter-College One-Act Play Festival',
        expectedDate: 'January 2027',
        description: 'Dramatic short play competition hosted in the main auditorium.',
      },
    ],
  },
  {
    id: 'nexus',
    name: 'Nexus Student Affairs & Social Cell',
    tagline: 'Connecting minds, building community.',
    badge: '🤝 Community & Social',
    category: 'Social',
    icon: '🤝',
    accentColor: '#eab308',
    memberCount: 130,
    meetingVenue: 'Student Union Lounge, 2nd Floor',
    meetingSchedule: 'Fridays, 4:00 PM',
    email: 'nexus@clubhub.internal',
    description:
      'Nexus is dedicated to campus camaraderie, peer mentorship, community outreach, and student welfare. We host welcoming mixers, alumni roundtables, mental health workshops, and social impact volunteer initiatives.',
    president: {
      name: 'Sarah Jenkins',
      role: 'Student Affairs Head & President',
      email: 'sarah.j@clubhub.internal',
      bio: 'Student Council General Secretary, passionate about community building and peer leadership initiatives.',
      avatar: 'SJ',
    },
    coordinators: [
      {
        name: 'Sameer Khan',
        role: 'Social Events Coordinator',
        email: 'sameer.k@clubhub.internal',
        focus: 'Mixers, Festivals & Campus Engagement',
        avatar: 'SK',
      },
      {
        name: 'Riya Gupta',
        role: 'Outreach & Mentorship Coordinator',
        email: 'riya.g@clubhub.internal',
        focus: 'Alumni Relations & Volunteer Drives',
        avatar: 'RG',
      },
    ],
    conductedActivities: [
      {
        title: 'Freshers Welcome Mixer & Scavenger Hunt',
        date: 'Oct 2026',
        attendees: 180,
        summary: 'Icebreaker games, interactive campus trivia, and club intro kiosks for incoming freshers.',
      },
      {
        title: 'Alumni Leadership Roundtable',
        date: 'Sep 2026',
        attendees: 80,
        summary: 'Interactive career Q&A with alumni working in top tech, finance, and design companies.',
      },
      {
        title: 'Campus Green Volunteer Drive',
        date: 'Aug 2026',
        attendees: 65,
        summary: 'Tree plantation and clean energy awareness campaign around college residences.',
      },
    ],
    nextPlans: [
      {
        title: 'Leadership & Public Speaking Conclave',
        expectedDate: 'Late November 2026',
        description: 'Interactive workshops on effective debate, team negotiation, and storytelling.',
      },
      {
        title: 'Winter Charity & Book Donation Drive',
        expectedDate: 'December 2026',
        description: 'Campus-wide donation initiative for underprivileged community schools.',
      },
    ],
  },
  {
    id: 'chronicle',
    name: 'Chronicle Media & Photography Society',
    tagline: 'Capturing moments, telling stories.',
    badge: '📸 Media & Stories',
    category: 'Media',
    icon: '📸',
    accentColor: '#a855f7',
    memberCount: 88,
    meetingVenue: 'Media Lab & Darkroom, Media Block',
    meetingSchedule: 'Mondays, 4:30 PM',
    email: 'chronicle@clubhub.internal',
    description:
      'The official campus storytelling and visual journalism society. Chronicle documents campus life through professional photography, cinematic videography, event reporting, podcasts, and the annual student magazine.',
    president: {
      name: 'Neil Deshmukh',
      role: 'Editor-in-Chief & President',
      email: 'neil.d@clubhub.internal',
      bio: 'Award-winning photojournalist and published documentary filmmaker leading the campus magazine.',
      avatar: 'ND',
    },
    coordinators: [
      {
        name: 'Ishaan Grover',
        role: 'Head of Photography & Cinematography',
        email: 'ishaan.g@clubhub.internal',
        focus: 'Event Coverage, Drone Cameras & Lighting',
        avatar: 'IG',
      },
      {
        name: 'Kritika Nair',
        role: 'Editorial & Content Coordinator',
        email: 'kritika.n@clubhub.internal',
        focus: 'Journalism, Interviews & Newsletter',
        avatar: 'KN',
      },
    ],
    conductedActivities: [
      {
        title: 'Campus Monsoons Photo Walk',
        date: 'Oct 2026',
        attendees: 45,
        summary: 'Field photography workshop exploring framing, shutter speeds, and rain textures.',
      },
      {
        title: 'Annual Campus Chronicle Magazine Launch',
        date: 'Sep 2026',
        attendees: 130,
        summary: 'Unveiling the 80-page glossy print magazine featuring student art, essays, and stories.',
      },
      {
        title: 'Mobile Filmmaking & Video Editing Sprint',
        date: 'Aug 2026',
        attendees: 55,
        summary: 'Hands-on session using smartphone cameras and Premiere Pro / DaVinci Resolve.',
      },
    ],
    nextPlans: [
      {
        title: 'Drone Cinematography Masterclass',
        expectedDate: 'Mid November 2026',
        description: 'Flight regulations, aerial composition, and dynamic cinematic drone filming.',
      },
      {
        title: 'Campus Humans of SIT Portrait Exhibition',
        expectedDate: 'January 2027',
        description: 'Photo exhibition celebrating the unsung heroes and students of the campus.',
      },
    ],
  },
]

export function getClubById(id) {
  return CLUBS_DATA.find((c) => c.id === id) || null
}

export function getClubLeaders() {
  const leaders = []
  CLUBS_DATA.forEach((club) => {
    if (club.president) {
      leaders.push({
        _id: `leader-pres-${club.id}`,
        name: club.president.name,
        email: club.president.email,
        role: 'President',
        leaderType: 'president',
        clubName: club.name,
        clubId: club.id,
        clubBadge: club.badge,
        clubIcon: club.icon,
        accentColor: club.accentColor,
        roleTitle: club.president.role || 'Club President',
        bio: club.president.bio,
        createdAt: '2026-07-15T10:00:00.000Z',
      })
    }
    ;(club.coordinators || []).forEach((c, idx) => {
      leaders.push({
        _id: `leader-coord-${club.id}-${idx}`,
        name: c.name,
        email: c.email,
        role: 'Coordinator',
        leaderType: 'coordinator',
        clubName: club.name,
        clubId: club.id,
        clubBadge: club.badge,
        clubIcon: club.icon,
        accentColor: club.accentColor,
        roleTitle: c.role || 'Club Coordinator',
        focus: c.focus,
        createdAt: '2026-08-01T10:00:00.000Z',
      })
    })
  })
  return leaders
}
