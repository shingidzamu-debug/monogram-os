# Visual direction — October 2026

Reference: Calendly's 2026 rebrand (au point). Open `linked-label.html`
in a browser to see the translation.

## What the reference actually is

Three typefaces, not one:

| Role | Face | Note |
|---|---|---|
| Display | TT Neoris | geometric grotesque, headlines and large UI |
| Editorial | Wulkan Text | newspaper serif, second lines and states |
| Interface | Geist | free, carries tables, labels, figures |

The headline move is a **mixed-face line break** — line one sans, line two
serif. Not an italicised word, not a coloured word. The face carries the
shift.

Deep navy ink, never black. Warm off-white for the brand layer, cool
white for the product. Gradients are atmospheric, like defocused
landscape photography: real value range from near-white highlight to
deep saturated shadow, not flat pastel.

Two structural assets do the heavy lifting:

1. **Flex Bubbles** — icon, subject and state as separate rounded
   containers joined by a waist, read as one object. The waist geometry
   is the hourglass pinch from Calendly's own mark.
2. **Patternly** — an in-house pattern engine generating stripe and grid
   fields (Soft Lines, Quick Dash, Stacks, Offset Grid, Layered Grid,
   Arc) that overlay the gradients.

## What we take, and what we must not

The bubble waist is *derived from their logo*. Copying the pinch borrows
geometry whose logic belongs to Calendly. The Monogram Club's equivalent
has to come from the monogram: letterforms that interlock and share a
stroke. Same system logic, our own root.

Take: the modular linked label; atmospheric gradients; the pattern
engine (it belongs in Brand Lab, which already generates gradients and
icons); the sans-plus-serif pairing; icon suite with shared geometry.

Leave: the hourglass waist, their palette, their icon set.

## Two registers of the linked label

- **Bridge** — parts kiss at a waist. For large moments: covers, hero,
  Brand Hub.
- **Shared field** — one container, divided by a hairline. For rows,
  tables and anything under ~32px, where a waist disappears.

`linked-label.html` shows both, plus the gradient and pattern treatment
and the device doing real work in a Projects list.

## Open questions

- **Canvas temperature.** The reference is warm off-white, close to
  cream. Shingi's standing note is white, not beige, because beige reads
  as AI. Proposal: warm for brand and marketing surfaces, cool white for
  the product. Not yet confirmed.
- **Category chips above headlines.** The reference puts a small
  icon-and-label chip above every section headline. V0.12 deliberately
  stripped that pattern out. Theirs are functional category markers with
  an icon rather than decorative eyebrows, so this may be fine — undecided.
- Scope: marketing site, product UI, or both.

---

## Surface Studio — the pattern engine

`surface-studio.html`. Calendly's Patternly makes Calendly patterns.
Ours sits in Brand Lab, which already holds each client's approved
palette, so it makes **that client's** patterns. Single-brand tool versus
multi-brand tool. That difference is structural, not cosmetic, and it is
what keeps this from reading as a copy.

### Motifs come from a brand studio's own vocabulary

No vertical bars — bars are theirs.

| Motif | Root |
|---|---|
| Interlock | letterforms sharing a stroke, knitted into a lattice |
| Counter | the bowl of a letterform |
| Register | registration and trim marks |
| Screen | halftone dot field |
| Baseline | type rules at leading intervals |
| Nest | concentric forms |

### The pattern modulates the gradient, it does not sit on it

Four blends, and presence defaults low so the result is a texture rather
than wallpaper:

- **Veil** — white, screen. Lifts the gradient where the motif falls.
- **Etch** — brand dark, multiply. Technical, print-like.
- **Emboss** — white, soft-light. The quietest; barely there.
- **Mark** — brand accent, normal. The only bold register.

Gradient moods (Drift, Bloom, Horizon, Veil) build from the palette with
a deep anchor and a white highlight, which is what gives the real value
range. Flat pastel is what makes a gradient look synthetic.

Exports SVG, PNG at 2400px, and a CSS `background-image` string. Seeded,
so a recipe is reproducible: brand, mood, motif, blend, seed.

### Next

Merge into Brand Lab as a third tab beside Gradients and Icons, reading
the live project palette instead of the hardcoded `BRANDS` map.
