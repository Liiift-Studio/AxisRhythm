---
name: project-brief
description: Core identity, scope, and constraints for axis-rhythm
type: project
---

# axis-rhythm — Project Brief

## Identity
- **Package name**: `axis-rhythm`
- **Version**: 0.0.1 (pre-release)
- **Author**: Quinn Keaveney / Liiift Studio

## What It Is
Lines in a paragraph alternate between two or more variable font axis states (e.g. wdth: 100 / wdth: 96). Not for readability — a typographic surface treatment. The equivalent of sawtooth rag but in the weight/width dimension rather than line-length.

## What It Is Not
- Not a general animation library
- Not a CSS preprocessor
- Not a font loading utility

## API Surface (target)
Options: axis, values, period, align

## Constraints
- Framework-agnostic core (vanilla JS)
- Optional React bindings (peer deps)
- SSR safe (guard typeof window)
- Zero required dependencies (opentype.js optional)
- TypeScript strict mode

## Status
Bootstrap complete. Algorithm not yet implemented.
See PROCESS.md for the build guide.
