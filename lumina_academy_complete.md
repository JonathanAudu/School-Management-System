
# Lumina Academy — Complete Website Design Document

> Nigerian secondary school website. Minimalist dark-mode aesthetic. 9 pages.
> Design system: **Heritage & Horizon** (light + dark). Stack: Nuxt 3 / Laravel 11 / MySQL.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System — Heritage & Horizon (Light)](#2-design-system--heritage--horizon-light)
3. [Design System — Heritage & Horizon (Dark)](#3-design-system--heritage--horizon-dark)
4. [Page Inventory](#4-page-inventory)
5. [Page 1 — Homepage](#5-page-1--homepage)
6. [Page 2 — About Us](#6-page-2--about-us)
7. [Page 3 — Admissions](#7-page-3--admissions)
8. [Page 4 — Faculty & Staff](#8-page-4--faculty--staff)
9. [Page 5 — Student Life](#9-page-5--student-life)
10. [Page 6 — Gallery](#10-page-6--gallery)
11. [Page 7 — News & Events](#11-page-7--news--events)
12. [Page 8 — Contact Us](#12-page-8--contact-us)
13. [Global Navigation & Footer](#13-global-navigation--footer)
14. [Component Reference](#14-component-reference)


---

## 1. Project Overview

**School name:** Lumina Academy (also styled as "Nigerian Heritage School")
**Tagline:** Excellence in Education. Nurturing the leaders of tomorrow with character and wisdom.
**Location:** Lagos, Nigeria
**Founded:** 1998
**Contact:** admissions@lumina.edu.ng · +234 (0) 800 LUMINA ACAD

### Site goals

- Public-facing marketing website for prospective students and parents
- Online admissions inquiry and application form
- News, events, gallery, and faculty directory
- Entry point to the authenticated student/parent portal

### Pages built

| # | Page | File |
|---|---|---|
| 1 | Homepage | `lumina_academy_homepage_dark_mode/code.html` |
| 2 | About Us | `about_us_dark_mode/code.html` |
| 3 | Admissions | `admissions_dark_mode/code.html` |
| 4 | Faculty & Staff | `faculty_staff_dark_mode/code.html` |
| 5 | Student Life | `student_life_dark_mode/code.html` |
| 6 | Gallery | `gallery_dark_mode/code.html` |
| 7 | News & Events | `news_events_dark_mode/code.html` |
| 8 | Contact Us | `contact_us_dark_mode/code.html` |
| — | Final homepage screenshot | `lumina_academy_final_homepage/screen.png` |

---

## 2. Design System — Heritage & Horizon (Light)

> File: `heritage_horizon/DESIGN.md`

### Brand personality

Modern Academic. Grounded, nurturing, sophisticated. Balances traditional Nigerian educational values with a forward-thinking digital experience. The interface feels like a premium physical campus: open, structured, and intentional. Minimalism meets Tactile Warmth.

### Color palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#006a3e` | CTAs, active states — Emerald Green growth & authority |
| `primary-container` | `#008650` | Elevated primary surfaces |
| `on-primary` | `#ffffff` | Text on primary |
| `secondary` | `#40674d` | Supporting highlights — Sage Leaf |
| `secondary-container` | `#beeaca` | Secondary surface fills |
| `tertiary` | `#9d3b42` | Accent warnings — Dusty Rose |
| `tertiary-container` | `#bc5359` | Accent fills |
| `surface` | `#f5fbf2` | Base background |
| `surface-container-lowest` | `#ffffff` | Cards (purest white) |
| `surface-container-low` | `#eff5ed` | Slightly elevated surfaces |
| `surface-container` | `#e9f0e7` | Standard containers |
| `surface-container-high` | `#e3eae1` | Higher containers |
| `surface-container-highest` | `#dee4dc` | Highest elevation |
| `on-surface` | `#171d18` | Primary text (deep charcoal-brown, not pure black) |
| `on-surface-variant` | `#3e4a41` | Secondary text |
| `outline` | `#6e7a70` | Borders |
| `outline-variant` | `#bdcabe` | Subtle borders |
| `background` | `#f5fbf2` | Page background |
| `error` | `#ba1a1a` | Error states |
| `inverse-primary` | `#6ddc9b` | Highlighted inverse elements |

### Typography

| Token | Font | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| `headline-xl` | Literata | 48px | 700 | 1.2 | -0.02em |
| `headline-lg` | Literata | 32px | 600 | 1.3 | — |
| `headline-lg-mobile` | Literata | 28px | 600 | 1.3 | — |
| `headline-md` | Literata | 24px | 500 | 1.4 | — |
| `body-lg` | Work Sans | 18px | 400 | 1.6 | — |
| `body-md` | Work Sans | 16px | 400 | 1.6 | — |
| `label-md` | Work Sans | 14px | 600 | 1 | 0.05em |
| `caption` | Work Sans | 12px | 400 | 1.4 | — |

- **Literata** — scholarly editorial serif for all headings. Bold/ExtraBold reserved for largest headlines.
- **Work Sans** — functional sans-serif for body, labels, dense data (schedules, grades).
- Use generous vertical rhythm. Headings have more space above than below.
- All text is strictly **left-aligned**.

### Spacing

| Token | Value |
|---|---|
| `unit` | 8px |
| `container-max` | 1280px |
| `gutter` | 24px |
| `margin-desktop` | 64px |
| `margin-mobile` | 20px |
| `stack-sm` | 16px |
| `stack-md` | 32px |
| `stack-lg` | 64px (major section separators) |

### Border radius

| Token | Value |
|---|---|
| `sm` | 0.5rem |
| `DEFAULT` | 1rem |
| `md` | 1.5rem |
| `lg` | 2rem |
| `xl` | 3rem |
| `full` | 9999px |

Pill-shaped (Level 3) language. Buttons and inputs use `1rem`. Cards and image containers use `2rem`.

### Elevation & depth

No heavy shadows. Depth via **tonal layers**:

- Surface levels: base `#f5fbf2` → cards use pure white or light Sage Leaf tint.
- Borders: 1px, `outline-variant` at 15–20% opacity.
- Where elevation is needed (modals, FABs): `0px 12px 32px rgba(2, 140, 84, 0.08)` — subtle green-tinted ambient shadow.

### Layout

- 12-column grid, 1280px max-width, desktop.
- Components span 4, 6, or 8 columns.
- Mobile: single column, 20px side margins.
- Whitespace is generous — `stack-lg` (64px) between major sections.

### Component rules

| Component | Rules |
|---|---|
| **Primary button** | Emerald Green fill, white text, `rounded-full`. Hover: shift saturation not brightness. |
| **Secondary button** | Sage Leaf text, 1px border, `rounded-full`. |
| **Cards** | White background, 1px neutral border, `rounded-lg`. Literata headers inside. |
| **Input fields** | High roundedness. Work Sans bold labels. Neutral background at low opacity. |
| **Chips / tags** | Tertiary Rose or Sage Leaf at 10% opacity fill, full-strength text. Fully rounded. |
| **Progress bars** | Emerald Green fill, light Stone Grey track. |
| **Navigation** | Clean top-bar, generous horizontal padding. Serif for school name, sans-serif for links. |

---

## 3. Design System — Heritage & Horizon (Dark)

> File: `heritage_horizon_dark/DESIGN.md`

### Brand personality

Dark Corporate Modern. Quiet Luxury. Deep, moody palette for focused immersion. Balances academic prestige with sustainability. Authoritative yet accessible — "rooted in the past, optimised for the future."

### Color palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0e1510` | Page background (Obsidian Green — near-black with emerald undertones) |
| `surface` | `#0e1510` | Base surface |
| `surface-container-lowest` | `#09100b` | Deepest containers |
| `surface-container-low` | `#161d18` | Cards / Level 1 surfaces |
| `surface-container` | `#1a211c` | Standard containers / Level 2 |
| `surface-container-high` | `#252c26` | Higher containers |
| `surface-container-highest` | `#303631` | Highest elevation |
| `surface-bright` | `#343b35` | Bright surfaces |
| `primary` | `#6ddc9b` | CTAs, key brand — vibrant Forest Green (inverted for dark) |
| `primary-container` | `#30a469` | Elevated primary fills |
| `on-primary` | `#00391f` | Text on primary |
| `secondary` | `#b6ccbe` | Supporting — muted charcoal-green |
| `secondary-container` | `#384b41` | Secondary fills |
| `tertiary` | `#c3c8c3` | Neutral accent |
| `on-surface` | `#dde4dc` | Body text (Cream — reduces eye strain) |
| `on-surface-variant` | `#bdcabe` | Secondary text |
| `outline` | `#879489` | Borders |
| `outline-variant` | `#3e4a41` | Subtle dividers |
| `error` | `#ffb4ab` | Error states |
| `inverse-primary` | `#006d40` | Inverse highlights |

### Typography

| Token | Font | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| `headline-xl` | Literata | 48px | 700 | 56px | -0.02em |
| `headline-lg` | Literata | 32px | 600 | 40px | -0.01em |
| `headline-lg-mobile` | Literata | 28px | 600 | 36px | — |
| `headline-md` | Literata | 24px | 500 | 32px | — |
| `body-lg` | Hanken Grotesk | 18px | 400 | 28px | — |
| `body-md` | Hanken Grotesk | 16px | 400 | 24px | — |
| `label-md` | Hanken Grotesk | 14px | 600 | 20px | 0.05em |

- **Literata** — scholarly editorial serif for all headlines. High weight preserved on mobile.
- **Hanken Grotesk** — replaces Work Sans in dark mode. Clean, contemporary body copy.
- Headings: pure white for maximum authority. Body: Cream `#dde4dc` to reduce eye strain.

### Spacing

| Token | Value |
|---|---|
| `base` | 8px |
| `xs` | 4px |
| `sm` | 12px |
| `md` | 24px |
| `lg` | 48px |
| `xl` | 80px |
| `gutter` | 24px |
| `margin-mobile` | 16px |
| `margin-desktop` | 64px |

Section padding: 80px+ between strips. Pacing is deliberate and unhurried.

### Border radius

Same tokens as light mode: `sm` 0.5rem → `full` 9999px.

### Elevation & depth (tonal layers)

| Level | Background | Notes |
|---|---|---|
| Level 0 | `#0a120e` | Page background |
| Level 1 | `#141d18` | Cards and surfaces |
| Level 2 | `#1c2620` | Modals / popovers. Add 1px `#ffffff` border at 10% opacity. |

No drop shadows. Use thin inner glows or borders to define edges.

### Layout

- 12-column fixed grid, 1200px max-width, desktop.
- Mobile: fluid 4-column layout.
- 8px base grid throughout.

### Component rules

| Component | Rules |
|---|---|
| **Primary button** | Forest Green fill, white text, `rounded-full`. |
| **Secondary button** | Outlined in primary or cream stroke, `rounded-full`. |
| **Input fields** | Dark surface, `#ffffff` at 5% opacity fill. Focus: 1px Forest Green border + soft green outer glow. |
| **Cards** | `#141d18` background. No borders — rely on tonal contrast against background. |
| **Chips** | Small, `rounded-full`. Hanken Grotesk labels. For category tags. |
| **Dividers / lists** | Cream at 10% opacity. Low visual noise. |

---

## 4. Page Inventory

| Route | Page title | Hero headline | Layout notes |
|---|---|---|---|
| `/` | Homepage | "Nurturing Excellence, Inspiring Heritage." | Full-bleed hero, stats bar, philosophy bento, news cards, events sidebar |
| `/about` | About Us | "A Legacy of Excellence, A Future of Leadership." | Hero, mission/vision bento, history timeline, leadership grid |
| `/admissions` | Admissions | "Shape Your Future with Excellence." | Hero, 4-step process, requirements list, fees table, application form |
| `/faculty` | Faculty & Staff | "Our Faculty & Staff" | Hero, filter controls, staff card grid |
| `/student-life` | Student Life | (beyond the classroom) | Hero, clubs bento grid, athletics carousel, achievements strip |
| `/gallery` | Campus Life Gallery | "Campus Life in Focus" | Hero, category filters, masonry grid, lightbox |
| `/news` | News & Events | "News, Insights & Academic Life" | Header, featured story, news grid, events sidebar, newsletter signup |
| `/contact` | Contact Us | "Connect with the Lumina Community" | Hero, bento contact layout (form + sidebar), Google Maps embed |

---

## 5. Page 1 — Homepage

**Title:** Nigerian Heritage School - Excellence & Tradition
**File:** `lumina_academy_homepage_dark_mode/code.html`

### Hero section

- **H1:** Nurturing Excellence, Inspiring Heritage.
- **Body:** Empowering the next generation of Nigerian leaders through a unique blend of global academic rigor and deep cultural immersion.
- **CTA buttons:** "Explore Our Programs" · "Virtual Tour"

### Stats bar (4 metrics)

| Metric | Label |
|---|---|
| — | WASSCE Pass Rate |
| — | Student/Teacher Ratio |
| — | Extracurricular Clubs |
| — | Years of Excellence |

### Our Philosophy section

- **H2:** Our Philosophy
- **H3:** Rooted in Tradition, Aiming for the Stars.
- **Body:** At Nigerian Heritage School, we believe that education should be as diverse and vibrant as our culture. Our curriculum seamlessly integrates rigorous international academic standards with the rich tapestry of Nigerian history, languages, and ethics. We foster an environment of intellectual curiosity, character development, and mutual respect. Our goal is to graduate students who are not just globally competitive but also deeply grounded in their heritage.
- **Feature list:**
  - Character-based leadership training
  - Technological integration in every classroom
  - Rich cultural immersion programs

### Latest News section

- **H2:** Stay Informed · **H3:** Latest News

| Date | Headline | Excerpt |
|---|---|---|
| October 12, 2023 | Science Fair Winners: Innovative Solutions for Local Challenges | Our Grade 11 students showcased incredible engineering feats during this year's Science and Innovation Fair… |
| October 05, 2023 | Celebrating Nigeria Day: A Tapestry of Languages and Art | The annual Heritage Festival brought together parents, alumni and staff in a vibrant display of traditional attire… |
| September 28, 2023 | Heritage Falcons Dominate Regional Basketball Finals | Our senior varsity team secured their third consecutive championship trophy this weekend after a thrilling final… |

### Upcoming Events section

- **H2:** Mark Your Calendar
- **H3:** Upcoming Events
- **Body:** Join us for these key dates. We believe community involvement is critical to student success.

**Events listed:**

1. **Annual General Meeting & PTA Summit** — An evening dedicated to discussing school progress, strategic planning for next year, and voting on the new PTA committee members.
2. **Careers & Tertiary Education Fair** — Representatives from top local and international universities will be present to guide Year 10–12 students on their next steps.

**Portal CTA card:** "Login to Portal" — Access your student's schedule, grades, and personalized event reminders.

### CTA footer strip

- **H3:** Ready to join our community?
- **Body:** Admissions for the upcoming academic session are now open. Secure your child's future at Nigeria's premier heritage school.

---

## 6. Page 2 — About Us

**Title:** About Us | Lumina Academy
**File:** `about_us_dark_mode/code.html`

### Hero section

- **H1:** A Legacy of Excellence, A Future of Leadership.
- **Body:** Discover the heritage and heartbeat of Lumina Academy, where we nurture the next generation of global pioneers.

### Mission & Vision (Bento-style layout)

**Mission:**
- **Label:** Our Mission
- **H2:** To nurture leaders grounded in character
- **Body:** At Lumina, education transcends textbooks. We are dedicated to providing a holistic environment where ethical leadership, intellectual curiosity, and cultural pride converge to form the foundation of every student's journey.

**Vision:**
- **Label:** Our Vision
- **H2:** A global beacon of African excellence.
- **Body:** To be recognized internationally as a transformative educational institution that celebrates African identity while setting world-class standards in innovation and scholarship.

### Our History section

- **Label:** Our History
- **H2:** Principles of Excellence and Heritage
- **Body:**
  - Founded in 1998, Lumina Academy began as a visionary project to bridge the gap between traditional values and modern global demands.
  - Our journey is marked by a steadfast refusal to compromise on quality. From our early days, we have integrated Nigerian cultural wisdom with the rigor of international curricula, ensuring our students are as comfortable in Lagos as they are in London or New York.
  - Every brick on our campus represents a story of success, resilience, and the unwavering belief that Africa's greatest resource is the brilliant minds of its youth.

### Leadership & Governance section

- **Label:** The Guardians
- **H2:** Leadership & Governance
- **Body:** Our leadership team brings decades of experience from top global institutions, united by a singular focus: the success of our students.

| Name | Role | Notes |
|---|---|---|
| Dr. Amara Okoro | School Principal | "We don't just teach students; we empower future icons." |
| Chief Olumide Adeyemi | Chairman, Board of Governors | Over 40 years of experience in educational policy and international law. |
| Mrs. Fatima Yusuf | Governor, Strategic Development | Specialist in technology integration and global academic partnerships. |

### CTA strip

- **H2:** Be Part of Our Story
- **Body:** Whether you are a prospective student, parent, or faculty member, your journey to excellence begins here.
- **Buttons:** "Download Prospectus" · "Visit Our Campus"

---

## 7. Page 3 — Admissions

**Title:** Admissions | Lumina Academy
**File:** `admissions_dark_mode/code.html`

### Hero section

- **H1:** Shape Your Future with Excellence.
- **Body:** Welcome to the Lumina Academy Admissions Portal. We seek curious minds and ambitious hearts ready to join our distinguished academic community in Nigeria.
- **Links:** "View Fees Structure"

### The Admission Journey (4-step process)

| # | Icon | Step | Description |
|---|---|---|---|
| 1 | edit_note | Online Inquiry | Complete the initial inquiry form to receive our digital prospectus and application link. |
| 2 | upload_file | Documentation | Upload transcripts from previous schools, birth certificates, and passport photographs. |
| 3 | school | Entrance Exam | Sit for our comprehensive entrance examination covering English, Mathematics, and Logic. |
| 4 | verified | Final Interview | A meeting with the Admissions Board to discuss goals, values, and academic placement. |

### Admission Requirements

| Category | Detail |
|---|---|
| Academic History | Certified copies of previous school transcripts (last 3 sessions). |
| Identification | State-recognized birth certificate and 4 passport-sized photographs. |
| Medical Fitness | A comprehensive medical report from a recognized hospital. |
| *Note* | *International students may require additional visa documentation.* |

### Fees Structure (2024/25)

- Note: Flexible payment plans are available. Please contact the Bursary for more information.
- (Specific fee amounts to be populated from database)

### Online Application Form

**Contact info:**
- Admissions Hotline: +234 (0) 800 LUMINA
- Email: admissions@lumina.edu.ng

**Student fields:**
- Student's Full Name
- Date of Birth
- Applying for Class
- Last School Attended

**Parent/Guardian fields:**
- Primary Contact Name
- Phone Number
- Email Address

**Submit button:** "Submit Application"
**Link:** Privacy Policy

---

## 8. Page 4 — Faculty & Staff

**Title:** Faculty & Staff Directory | Lumina Academy
**File:** `faculty_staff_dark_mode/code.html`

### Hero section

- **H1:** Our Faculty & Staff
- **Body:** Lumina Academy is home to dedicated educators and professionals who inspire our students to reach their full potential through personalized mentorship and academic rigor.

### Filter controls

Buttons: All Members · Science · Arts · Administration

### Staff directory

| Name | Title | Bio |
|---|---|---|
| Dr. Amara Okoro | Principal & Head of School | With over 20 years of experience in international education, Dr. Okoro leads Lumina Academy with a focus on holistic student development and global competitiveness. |
| Mr. Chidi Eze | Head of Science Department | A passionate physicist dedicated to making complex concepts accessible. Mr. Eze pioneers our robotics and renewable energy student projects. |
| Ms. Sarah Bello | Fine Arts & Design | Ms. Bello encourages creative expression and critical thinking through visual arts. She curates the annual Lumina Academy Student Exhibition. |
| Dr. Samuel Adenuga | Advanced Mathematics | Specializing in Calculus and Statistics, Dr. Adenuga coaches our national award-winning Mathematics Olympiad team with dedication and rigor. |
| Mrs. Janet Williams | English Literature | Mrs. Williams brings stories to life through dramatic readings and debate. She manages the Literary & Debating Society. |
| Mr. David Cole | Student Counselor | Providing emotional support and career guidance, Mr. Cole ensures every Lumina student has the tools to navigate their adolescent years successfully. |

Each card has: mail icon · external link icon · "View Profile" button

---

## 9. Page 5 — Student Life

**Title:** Student Life | Lumina Academy
**File:** `student_life_dark_mode/code.html`

### Hero section

- **Label:** VIBRANT COMMUNITY
- **Tagline:** Beyond the Classroom.
- **Body:** At Lumina, education is an adventure. From the high-stakes of the debating podium to the precision of the robotics lab, we nurture every passion.
- **Buttons:** "Explore Clubs" · "Athletics Calendar"
- **Stat:** 98% Participation — Lumina students are actively engaged in at least two extracurricular societies.

### Societies & Guilds (Bento grid)

- **H2:** Societies & Guilds — Where intellect meets creativity.

| Club | Label | Description |
|---|---|---|
| Lumina Robotics Club | STEM EXCELLENCE | Designing the future through engineering and AI. Our team competes globally in FIRST Robotics and VEX competitions. |
| Grandmaster Chess | — | Strategic thinking and mental fortitude. Hosting bi-weekly tournaments for all levels. |
| Oratory & Debating Guild | — | Developing the voices of tomorrow's leaders. Our guild is ranked #1 in the National Schools Inter-Collegiate circuit. |

### Lumina Athletics (carousel)

- **H2:** Lumina Athletics — Forging character through physical excellence.

| Sport | Description |
|---|---|
| Football | The Titans: 3-time regional champions. |
| Basketball | Precision and pace on the court. |
| Track & Field | Defining the limits of speed and agility. |

### Legacy of Excellence — Stats strip

| Stat label | Value |
|---|---|
| National Trophies | — |
| Club Engagement | — |
| Olympic Hopefuls | — |
| Service Hours | — |

### Spotlight Achievement

- **Label:** SPOTLIGHT ACHIEVEMENT
- **H3:** National Science Olympiad Winners
- **Body:** Congratulations to our Grade 11 STEM team for securing 1st place in the prestigious 2024 National Science Olympiad. Their innovative desalination project was praised for its sustainability and scalability.
- **CTA:** "Read the Full Story"

---

## 10. Page 6 — Gallery

**Title:** Campus Life Gallery | Lumina Academy
**File:** `gallery_dark_mode/code.html`

### Hero section

- **Label:** Capturing Excellence
- **H1:** Campus Life in Focus
- **Body:** Explore the vibrant environment of Lumina Academy through our curated visual journal. From cutting-edge laboratory discoveries to the spirited energy of the sports field, witness the moments that define our legacy.

### Category filters

Buttons: All Moments · Sports · Campus Arts · Events

### Masonry gallery — items

| Location / Title | Tag |
|---|---|
| Centennial Library | — |
| Main Plaza | — |
| Innovation Hub | Collaboration |
| STEM Laboratory | Discovery |
| Studio Arts | Creative |
| Sports Complex | Athletics |

**Lightbox:** previous/next chevron navigation, close button.

---

## 11. Page 7 — News & Events

**Title:** News & Events | Lumina Academy
**File:** `news_events_dark_mode/code.html`

### Header section

- **Label:** The Lumina Chronicle
- **H1:** News, Insights & Academic Life
- **Body:** Explore the latest updates, achievements, and upcoming cultural and sporting events within our vibrant campus community.

### Category filters

Buttons: Academic · Social · Sports

### Featured story

- **Date:** October 24, 2024
- **H2:** Innovating the Future: Lumina Unveils New STEM Research Hub
- **Body:** The academy has officially launched its state-of-the-art research facility, designed to foster interdisciplinary collaboration between physics, engineering, and digital arts students.

### News grid

| Timestamp | Headline |
|---|---|
| 2 days ago | Lumina Lions Secure Regional Championship Victory |
| Oct 18 | Annual Gala: Celebrating 25 Years of Academic Excellence |

### Events sidebar

**H4:** Upcoming Events

| Event | Time | Venue |
|---|---|---|
| Open House & Campus Tour | 9:00 AM | Main Auditorium |
| Inter-School Science Fair | 11:00 AM | Exhibition Hall |
| Lumina Winter Concert | 6:30 PM | Center for Arts |

**CTA:** "View Full Calendar"

### Archive categories

- Academic Achievement
- Athletics News
- Campus Expansion
- Faculty Spotlights

### Newsletter signup

- **H4:** Lumina Weekly
- **Body:** Get the best stories and campus alerts delivered to your inbox every Monday.
- **CTA:** "Subscribe Now"

---

## 12. Page 8 — Contact Us

**Title:** Contact Us | Lumina Academy
**File:** `contact_us_dark_mode/code.html`

### Hero section

- **H1:** Connect with the Lumina Community
- **Body:** Whether you are a prospective parent, a community partner, or an alumnus, we are here to assist with your inquiries and welcome you to our Lagos campus.

### Bento contact layout

**Left — Contact form (H2: Send a Message):**
- Body: Complete the form below and our admissions team will contact you within 24 hours.
- Fields: Full Name · Email Address · Subject · Message
- Submit button with `send` icon

**Right sidebar:**

*Quick Contacts card:*
- Main Office: +234 (0) 800 LUMINA ACAD
- Email: admissions@lumina.edu.ng

*Visit Our Campus card:*
- Mon–Fri: 8:00 AM – 4:00 PM
- Saturday: 9:00 AM – 1:00 PM

### Lagos Campus Location

- **H2:** Lagos Campus Location
- **Body:** Located in the heart of the educational district.
- Google Maps embed with "open in new" link

### Additional CTA cards

| Card | Description | CTA |
|---|---|---|
| Admissions Office | Our dedicated enrollment officers are available to walk you through the registration process and campus tours. | → |
| Media Inquiries | For press releases, photography permissions, and official school news, please contact our communications department. | file_download |

---

## 13. Global Navigation & Footer

### Top navigation bar

**Left:** School logo / name (Serif — Literata)
**Centre nav links:**
- Home · About · Admissions · Academics · Student Life · News · Contact

**Right:**
- Search icon
- **Primary CTA:** "Apply Now" (Emerald Green pill button)
- Hamburger menu (mobile)

### Footer

**Tagline:** Excellence in Education. Nurturing the leaders of tomorrow with character and wisdom. / Empowering the next generation of leaders through holistic education, character development, and academic excellence.

**Columns:**

*Quick Links:*
- Contact Us · Faculty Portal · Newsletter Signup · Privacy Policy

*Stay Connected (social icons):*
- face_nod (Facebook) · camera (Instagram) · share (Twitter/X) · public (web) · alternate_email (email)

**Copyright:** © 2024 Lumina Academy. All rights reserved.

---

## 14. Component Reference

### Shared across all pages

| Component | Description |
|---|---|
| `TopNavBar` | School name (serif) + nav links + search + "Apply Now" CTA + mobile hamburger |
| `HeroSection` | Full-width hero with label, H1, body copy, and CTA buttons |
| `StatCard` | Icon + number + label. Used for homepage stats bar and achievement strips |
| `NewsCard` | Date chip + H4 headline + excerpt + chevron link |
| `EventCard` | Date + H4 title + body + icon metadata (schedule, location) + RSVP/Details button |
| `StaffCard` | Avatar + name + title + bio + mail icon + link icon + "View Profile" button |
| `FilterBar` | Row of pill-shaped filter buttons. Active state: primary fill. |
| `BentoGrid` | CSS grid container for mixed-size cards (mission/vision, clubs, contact) |
| `GalleryItem` | Image with overlay label + category chip. Opens lightbox on click. |
| `NewsletterSignup` | H4 + body + email input + subscribe button |
| `Footer` | Tagline + social icons + quick links + copyright |

### Forms

| Form | Fields | Action |
|---|---|---|
| Application (Admissions) | Student name, DOB, class, last school, parent name, phone, email | POST to `/api/v1/admissions` |
| Contact | Full name, email, subject, message | POST to `/api/v1/contact` |
| Newsletter | Email address | POST to `/api/v1/newsletter/subscribe` |
| Parent portal login | Email, password | POST to `/api/v1/auth/login` |

### Icon library

All icons use **Google Material Symbols** (`material-symbols-outlined`):
`check_circle` · `arrow_forward` · `arrow_outward` · `chevron_right` · `chevron_left` · `format_quote` · `schedule` · `location_on` · `mail` · `call` · `send` · `search` · `menu` · `close` · `stars` · `celebration` · `palette` · `chess` · `edit_note` · `upload_file` · `school` · `verified` · `info` · `open_in_new` · `file_download` · `calendar_month` · `public` · `share` · `alternate_email` · `face_nod` · `camera` · `link`

---

*Document generated from: `stitch_minimalist_nigerian_academy_homepage.zip`*
*Pages: 8 · Design systems: 2 (light + dark) · HTML files: 8 · Design docs: 2*
