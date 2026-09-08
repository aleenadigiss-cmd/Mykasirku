# AI Skill: UI & UX Landing Page Design and Architecture

This document defines the persistent instructions and guidelines for building high-converting, modern, accessible, and aesthetically refined Landing Pages.

---

## 1. Landing Page Architecture & Conversion Flow (AIDA / PAS Framework)

Every high-performance landing page must follow a deliberate conversion hierarchy:

1. **Sticky Navigation Bar**:
   - Clean brand logo and title.
   - 3–4 anchor navigation links (Features, Solutions, Pricing, FAQ).
   - High-contrast Call-to-Action (CTA) button (e.g. "Coba Gratis" or "Mulai Sekarang").
   - Responsive mobile sheet/drawer menu with minimum 44px touch targets.

2. **Hero Section (The Above-the-Fold Anchor)**:
   - **Value Proposition Headline**: Clear, benefit-driven H1 (not vague corporate jargon).
   - **Supportive Subheadline**: 1–2 sentences explaining how it works and who it is for (max 65–75ch).
   - **Primary Action Group**: Primary high-contrast button + secondary low-friction link/button (e.g. "Lihat Demo Interaktif").
   - **Social Proof / Trust Badge**: Immediate reassurance (e.g. "Dipercaya oleh 10,000+ toko", rating stars, security badges).
   - **Interactive Visual Hero Asset**: Realistic UI preview, interactive app screenshot/mockup, or live animated demo cards.

3. **Social Proof & Client/Partner Trust Bar**:
   - Monochrome or subtle brand logos of reputable partners/clients.
   - Key milestone metrics (e.g. "99.9% Uptime", "Rp 50M+ Transaksi Diproses", "< 2 Detik Checkout").

4. **Problem vs. Solution & Core Value Propositions**:
   - Highlight customer pain points contrasted with effortless solutions.
   - Asymmetric Bento Grid layout showcasing core capabilities with micro-visuals.

5. **Deep-Dive Features & Interactive Demonstration**:
   - Tabbed or interactive showcase (e.g., live calculator, POS register preview, product tour).
   - Visual-first storytelling: feature title, benefit description, and concrete UI demo snippet.

6. **Customer Testimonials & Wall of Love**:
   - Authentic user quotes, author photo/avatar, full name, role, and business/store name.
   - Star rating (5/5) and verified buyer/user badge.

7. **Transparent Pricing Matrix**:
   - Monthly / Annual billing toggle (with discount highlight badge, e.g. "Hemat 20%").
   - 3-tier clear structure: Starter / Free, Pro / Bisnis (Highlighted as "Paling Populer"), and Enterprise.
   - Explicit feature checklist with clear checkmark icons (`lucide-react`).

8. **Interactive FAQ Accordion**:
   - Address top 5–6 customer hesitations and technical/operational questions.
   - Smooth accordion expand/collapse transitions.

9. **High-Impact Final CTA & Retention Footer**:
   - Urgent, focused closing CTA banner.
   - Comprehensive footer: brand mission, product links, legal/privacy policies, contact details, and copyright.

---

## 2. Visual Design & Anti-Slop Principles

- **No Cliché Gradients**: Ban generic cyan-to-purple gradients, generic glowing borders, and illegible text.
- **Color Harmony (60-30-10 Rule)**:
  - 60% dominant neutral background (clean light canvas `#fbf8ff` / `#ffffff` or deliberate dark slate).
  - 30% structural contrast (deep dark text `#1e1b4b`, `#30323e`, card borders `#e2e1f2`).
  - 10% purposeful accent color (e.g. rich brand purple `#684cb6`, vibrant emerald `#059669`, or crimson `#b91c1c`).
- **Mathematical Spacing & Corner Radii**:
  - Inner Corner Radius = Outer Corner Radius - Distance (Padding).
  - Button horizontal padding must be exactly 2x vertical padding (e.g., `px-6 py-3`).
- **Typographic Scale & Legibility**:
  - Minimum body font size: 16px (1rem).
  - Line height: 1.5–1.7 for optimal body readability.
  - Distinctive heading font with balanced tracking and letter-spacing.
  - Buttons and badge chips must never wrap onto multiple lines (`whitespace-nowrap`).

---

## 3. Interaction & Animation Guidelines (Motion)

- Use `motion` (from `motion/react`) for subtle entrance fade-ins (`opacity: 0 -> 1, y: 20 -> 0`).
- Micro-interactions: Hover scale (`hover:scale-[1.02]`), active press states (`active:scale-[0.98]`).
- Smooth scrolling enabled (`scroll-behavior: smooth`).
- Non-blocking layout transitions and fast hydration.

---

## 4. Accessibility & Performance (WCAG AA)

- All text contrast ratio ≥ 4.5:1 against its background.
- Semantic HTML tags: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`.
- Unique and meaningful `id` attributes on key interactive cards and buttons.
- Fully responsive across Mobile (375px+), Tablet (768px+), and Desktop (1200px+).
