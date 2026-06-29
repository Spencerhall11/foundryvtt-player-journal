# Player Journal - Foundry VTT Module

A player-facing journal module built for Metanthropes, styled as an in-universe field tablet interface. Designed to give players a persistent, organized space to take notes, sketch diagrams, and document their experience without leaving the game.

## Features

- **Personal Journal** - private notes visible only to the player and GM
- **Party Journal** - shared journal accessible to all players
- **Group Journals** - player-created sub-groups with custom names and selected members
- **Sketch Tab** - freehand canvas drawing on any entry, editable and copyable
- **Codex** - per-player equipment and bestiary notes linked to in-game items and actors via UUID
- **UUID Linking** - reference items, actors, and other documents directly in notes
- **Draggable Button** - floating launcher button repositionable per player, position saves across sessions
- **GM Visibility** - GM can read all journals but cannot edit player entries

## Design

Built to match the Metanthropes aesthetic. Dark matte interface with muted green accents, utilitarian font, worn field-tablet feel. Functional over flashy, like a ruggedized device that has been through a few sessions.

## Technical Notes

- Per-player data namespaced by game.user.id
- Client-scoped settings for individual UI preferences
- Canvas sketch data stored as editable image data, not flattened screenshots
- UUID resolution via Foundry TextEditor.enrichHTML() for clickable document links
- Multi-scope architecture separating personal, party, and group data cleanly

## Compatibility

- Foundry VTT v12 / v13
- Designed for use with the Metanthropes game system
- Should work system-agnostic for core journal features

## Installation

Drop the foundryvtt-player-journal folder into your Foundry Data/modules/ directory and enable it in Module Management.