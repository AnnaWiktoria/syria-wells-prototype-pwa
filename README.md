# Syria Well Map – Offline-First Prototype

![Status](https://img.shields.io/badge/Status-Prototype-blue)
![Performance](https://img.shields.io/badge/Lighthouse-99%2F100-success)
![Interactive](https://img.shields.io/badge/Time_to_Interactive-0ms-green)
![Size](https://img.shields.io/badge/App_Size-~102KB-yellow)




## Project overview

A lightweight, offline-first web application for mapping and reporting the status of water wells in conflict-affected areas.
Designed for field use with unstable connectivity and low-end mobile devices.

## Context
Syria is facing chronic shortages of drinking water, and water infrastructure has been severely damaged by conflict in many places. 
Lack of access to repaired energy is disrupting the lives of millions of residents. The situation is unstable, and security is at risk.

## Problems

- Intermittent or no internet access in the field
- High risk of misinterpretation of outdated or incomplete data
- Users may not trust their own technical competence.
- Language barriers: The interface must support both Latin (English/Kurdish) and Arabic (Right-to-Left) scripts seamlessly.
- Cognitive load: In high-stress situations, the UI must be clear, high-contrast, and forgiving.
- Extreme environmental conditions (sun, dust, high contrast surroundings)


## Solution

- Offline-first PWA approach
- Local data storage using IndexedDB
- Clear visual status markers for wells
- Explicit communication of data freshness and connectivity state
- The application prioritizes clarity, safety, and reliability over visual complexity.


## Key UX & UX-Security decisions

- No user accounts or authentication (reduced attack surface)
- Explicit online / offline indicator
- Last update timestamp visible for each well
- Visual differentiation between:
- Non-functional wells
- Contaminated water
- Wells modified offline (pending sync)
- One-time legend shown on first launch to reduce cognitive load later
- Emoji-based symbols instead of icon fonts for faster recognition and better performance

## Inclusive & Accessible Design
- RTL Adaptation:The interface automatically mirrors itself (margins, icons, text direction) when switching to Arabic.
- Typography: Arabic fonts are dynamically scaled up and line-height is increased to ensure legibility compared to Latin script.
- Color Blindness Safety: The "Contaminated" pin uses a distinct shape (internal dot) + color (Purple) to ensure safety warnings are visible to everyone.
- High contrast for readability.


## Offline behavior

- Maps are available offline only for areas previously opened while online
- Reports created offline are stored locally and synced when connectivity is restored
- Offline changes are clearly marked in the interface


## Limitations

- Not all map tiles are available offline by default
- Prototype version — data validation and verification workflows are limited
- Not intended for real-time emergency decision-making


## Project status

Prototype
User testing and translation review in progress.


## Tech stack

- Core: HTML5, CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES6+).
- Mapping: Leaflet.js.
- Storage: LocalStorage (simulating database persistence).
- PWA: Service Workers, Manifest.json.


## Disclaimer

This is a prototype created for research, testing, and demonstration purposes.
It should not be used as the sole source of information for critical or emergency decisions.
