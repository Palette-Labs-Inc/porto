# Contributing Guide

This guide explains how to contribute to this project and manage upstream synchronization.

## Setting Up Your Development Environment

1. Fork this repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/Palette-Labs-Inc/porto.git
```

3. Add the upstream remote:
```bash
git remote add upstream https://github.com/ithacaxyz/porto.git
```

## Syncing with Upstream

Keep your fork up to date with upstream changes:

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your local main branch
git checkout main
git merge upstream/main

# Push changes to your fork
git push origin main
```

## Making Contributions
1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Commit your changes:
```bash
git add .
git commit -m "feat: describe your changes"
```

3. Push to your fork:
```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request on GitHub