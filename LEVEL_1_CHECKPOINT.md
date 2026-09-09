# Level 1 Checkpoint Summary

**Saved Date**: September 9, 2026
**Git Commit**: `3614b70` (or `level-1` tag)
**Git Branch**: `main`

---

## State Overview
- **Landing Page Hero Section**: Refined background positioning (`calc(50% - 110px) 70%`) with high-contrast bold black (`#000000`) supporting text.
- **Backend**: Spring Boot REST API configured for PostgreSQL database (`jdbc:postgresql://localhost:5432/sgcs_db`) on port `5000`.
- **Frontend**: Vite React UI running on port `5173`.

---

## How to Jump Back / Restore to Level 1

If you ever encounter errors later and want to return to this exact state, run the following command in your terminal:

```bash
git checkout level-1
```
Or to hard reset your working branch to this checkpoint:
```bash
git reset --hard level-1
```
