---
name: frontend-mod-ui
description: Design guidance for building mod UIs that integrate with AFNM's visual style using GameDialog, GameButton, BackgroundImage, and other game-provided components. Activate when creating mod settings panels, custom screens, injected UI, or persistent overlays.
---

# Skill: Frontend Mod UI Design

Design guidance for building mod UIs that integrate well with AFNM's visual style.

## When to activate

- When creating a mod settings panel with `registerOptionsUI`
- When building a custom screen with `addScreen`
- When injecting UI with `injectUI`
- When creating a persistent overlay

## Design Principles

### Match the game's visual language

AFNM provides styled components through the screen API. Use them:

- `GameDialog` for content containers (supports `sm`, `md`, `lg` widths)
- `GameButton` for actions (supports `keybinding` and `fancyBorder` props)
- `GameIconButton` for icon-only actions
- `BackgroundImage` for screen backgrounds with particle effects
- `PlayerComponent` to show the player character

### Use the game's React and MUI runtime

React, ReactDOM, MUI, and Emotion are provided by the game. They are externalized in webpack — do not bundle them.

```typescript
// Use window.React for createElement calls in options panels
const createElement = window.React.createElement.bind(window.React);

// Use MUI components in screen contexts where imports work
import { Box, Typography } from '@mui/material';
```

### Settings panel patterns

For `registerOptionsUI` components:

- Use `window.React.createElement` directly (JSX may not be available in the options context)
- Use `api.components.GameButton` for buttons
- Store state in numeric global flags via `api.actions.setGlobalFlag`
- Keep the panel focused: title, description, controls, footer

### Screen layout structure

```typescript
<Box position="relative" flexGrow={1} display="flex" flexDirection="column">
  <BackgroundImage image="..." screenEffect="dust" />
  <GameDialog title="..." onClose={() => actions.setScreen('location')}>
    {/* Content */}
  </GameDialog>
  <Box position="absolute" width="100%" height="100%" display="flex" flexDirection="column">
    <Box flexGrow={1} />
    <Box display="flex"><PlayerComponent /></Box>
  </Box>
</Box>
```

### Persistent overlay positioning

- Use `position: fixed` with high `z-index`
- Set `pointer-events: auto` on the overlay container
- Keep overlays small and non-intrusive
- Provide a way to minimize or dismiss

## Rules

- Use GameDialog/GameButton instead of raw HTML elements in screen contexts.
- Use `window.React.createElement` in options panels where JSX is unavailable.
- Always include `PlayerComponent` in full screens unless custom-rendering the player.
- Always provide a close/back action in dialogs (`onClose={() => actions.setScreen('location')}`).
- Test overlays across screen transitions (location, combat, crafting, events).
