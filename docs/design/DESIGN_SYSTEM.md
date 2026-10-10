# Design system

## Tokens
Background `#030610`; raised background `#080e1b`; surface `#101a2b`; border `#283449`; text `#f2f5fa`; secondary `#becadb`; muted `#91a1b8`; cyan `#75e4f6`; violet `#b3a1f4`; controlled magenta `#d790c6`. Green status is used only for a meaningful state, never to imply measured correctness.

Typography: self-hosted Space Grotesk headings, Inter body, JetBrains Mono for small technical labels. Body 16–18px with 1.6 line height. Hero heading uses a responsive 52–108px range and compact tracking. Monospace labels never carry paragraphs. Text columns cap at ~65 characters.

Space scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Content maximum 1440px; 5vw gutters on desktop, 20px on phone. Main grid 12 columns; use 5/7 hero and 4/8 case-study splits.

## Primitives
SiteHeader, Footer, Button, Eyebrow, ProjectCard, TechTag, SectionHeading, PageIntro, CaseStudy, and SceneIsland. A card is a real link, never a click-only div. The whole row/card receives focus. Buttons have 44px minimum targets; mobile navigation uses native disclosure semantics.

## States
Default hairline border; hover cyan border and ≤2px lift; keyboard focus a clear 2px cyan outline with offset; pressed small compression; disabled controls communicate their condition in adjacent text. Motion uses the family durations in MOTION_SYSTEM. No custom cursor.

## Contrast
Muted labels must remain readable on the near-black surface. Never put small body copy on shader highlights. Inspect contrast through automated accessibility checks and visual QA; repair real violations rather than changing the audit threshold.
