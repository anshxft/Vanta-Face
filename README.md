# VantaFace

VantaFace is a premium consumer wellness and personal improvement web product
focused on face care, skincare, hair, grooming, fitness, physique, posture,
sleep, hydration, nutrition, style, routines, and progress tracking.

## Current product shape

- Premium onboarding before the dashboard appears
- App-like dashboard with routine completion, goals, progress indicators, and
  clearly labeled preview data
- Measurements, skin progress, monthly transformation summary, charts, and
  progress photo area
- Explore library for practical self-improvement content
- Profile and settings area with goals, targets, reminders, privacy, data, and
  account sections
- Mobile-first layout with bottom navigation and safe-area spacing

## Data architecture direction

The current interface is structured so authentication and persistent data can be
connected later without redesigning the product. Demo values are intentionally
labeled as preview data. Future storage can map into:

- profiles
- routines
- routine completions
- health logs
- measurements
- skin logs
- progress photos
- user goals and reminders

## Development

```bash
npm run build
npm run dev
```

Keep the product language practical and avoid medical, diagnostic, or
unrealistic transformation claims.
