---
name: workshop-publishing
description: Upload mods to Steam Workshop and manage the release lifecycle. Activate when publishing or updating a mod on Steam Workshop, preparing a release, or setting up Workshop publishing for the first time.
---

# Skill: Workshop Publishing

Upload mods to Steam Workshop and manage the release lifecycle.

## When to activate

- When the user wants to publish or update their mod on Steam Workshop
- When preparing a release
- When setting up Workshop publishing for the first time

## Prerequisites

- The sibling `../ModUploader-AFNM` repo must exist. Run `scripts/setup.sh` if missing.
- Steam must be running locally.
- `package.json` must have valid `afnmWorkshop` fields.

## First-Time Setup

1. Update `package.json` with your Workshop metadata:
   ```json
   "afnmWorkshop": {
     "workshopId": "",
     "title": "My Mod Name",
     "description": "What your mod does...",
     "tags": ["Gameplay"],
     "visibility": "private",
     "previewImagePath": "path/to/preview.png"
   }
   ```
2. First upload with `--allow-create`:
   ```bash
   bun run workshop:upload -- --change-note "v0.1.0 - Initial release" --allow-create
   ```
3. Save the returned Workshop ID back to `afnmWorkshop.workshopId` in `package.json`.

## Release Order

1. Finish code and docs
2. Run `bun run release:validate`
3. Upload to Workshop: `bun run workshop:upload -- --change-note "vX.Y.Z - What changed"`
4. Commit and push to `main`
5. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z` (triggers GitHub Release)

## Rules

- Always upload to Workshop BEFORE pushing the git tag. The GitHub Release workflow only handles the GitHub artifact — it does not upload to Workshop.
- Always include a descriptive `--change-note` with the version number.
- Start with `"visibility": "private"` for testing. Change to `"public"` when ready.
- The preview image should be under 1MB. The uploader auto-compresses larger images.
