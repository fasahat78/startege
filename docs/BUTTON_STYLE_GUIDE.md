# Button Style Guide

## Design System Colors

- **Primary**: `--brand-midnight` (#0F172A) - Dark blue/black
- **Accent**: `--brand-teal` (#0D9488) - Teal
- **Card**: White (#FFFFFF)
- **Background**: White (#FFFFFF)
- **Muted**: Light gray (#F1F5F9)

## Button Styles

### 1. Primary Button (Main Actions)
**Use for:** Primary CTAs, main actions, form submissions
```tsx
className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
```

### 2. Secondary Button (Secondary Actions)
**Use for:** Secondary actions, alternative options
```tsx
className="px-4 py-2 bg-card text-foreground rounded-lg font-semibold hover:bg-muted transition border-2 border-border"
```

### 3. Outlined Button (Tertiary Actions)
**Use for:** Less prominent actions, OAuth buttons
```tsx
className="px-4 py-2 border-2 border-border rounded-lg font-medium hover:bg-muted transition"
```

### 4. Button on Dark Background
**Use for:** Buttons inside dark/gradient sections
```tsx
className="px-4 py-2 bg-background text-foreground rounded-lg font-semibold hover:bg-muted transition"
```

### 5. Accent Button (Special Actions)
**Use for:** Special promotions, highlights (use sparingly)
```tsx
className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition"
```

## Consistency Rules

1. **Primary actions** → Always use `bg-primary` (dark)
2. **Secondary actions** → Use `bg-card` with border or `bg-muted`
3. **OAuth buttons** → Use outlined style (`border-2 border-border`)
4. **Buttons on dark backgrounds** → Use `bg-background` for contrast
5. **Disabled state** → Always include `disabled:opacity-50 disabled:cursor-not-allowed`

## Current Issues Found

- Landing page CTA section: Uses `bg-background` on dark gradient (acceptable for contrast)
- Some buttons use `bg-card` instead of `bg-primary` for primary actions
- Need to ensure all primary buttons use consistent `bg-primary` styling

