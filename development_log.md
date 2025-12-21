# Development Log

## 2024-12-20 HP Redesign & Feature Expansion
- **Status**: Phase 2 Completed
- **Changes**:
  - Redesigned UI to "Soft & Elegant".
  - Created artist pages (`ouki.html`, `miyabi.html`).
  - Implemented CSV-based data management (`data_src/` -> `data/`).
    - *Note: CSV auto-update requires Node.js. Currently manually synced JSON.*
  - Added new sections: `Novels`, `Stamps`.
  - Added features: Streaming links, Social links, MV links.
  - Improved logic:
    - Hero section shows latest item (Music/Novel/Stamp) by date.
    - Simultaneous releases are displayed together in Hero.
    - News items without links are non-interactive.
  - Design adjustments:
    - Centered Novel/Stamp grids.
    - Disabled hover zoom on Music cards to prevent clipping.

## Next Tasks
- Verify Node.js environment or provide alternative update method if needed.
- Monitor user behavior on layout.

## 2024-12-20 Workflow Discussion
- **Topic**: Google Sheets to CSV integration.
- **Topic**: Git vs Commented-out code policy.
- **Plan**: 
  - Create a mechanism to download CSVs from Google Sheets (PowerShell/Node).
  - Clarify rules on dead code in `AG_INSTRUCTIONS.md`.

## 2025-12-21 Data Management Documentation
- **Status**: Documentation Created
- **Changes**:
  - Created `DATA_MANAGEMENT_GUIDE.md` detailing Google Sheets columns, image sizing rules, and update workflow.
  - Confirmed image rendering logic in `styles.css` (Hero: 280px, Music: ~300px, Artists: 200px).
- **Next Steps**:
  - User to create Google Sheets based on the guide.
  - User to provide CSV URLs for `download_data.ps1`.
  - Final verification of the full update cycle.
