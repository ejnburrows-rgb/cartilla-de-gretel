# Owner Art Drop Validator

This document explains the workflow for integrating new artwork provided by the owner for "La Cartilla de Gretel."
The validator is designed to check a newly uploaded directory of images against the current repository evidence (from `docs/production-art-classification-audit.json`), specifically resolving missing slots classified as `PENDING NO VERIFIED SOURCE`.

## Workflow

1. **Upload the Drop**:
   The owner provides a new drop of images. Place these images into a directory within the repository or an external accessible path.
2. **Run the Validator**:
   Execute the `verify-owner-art-drop.mjs` script, passing the drop directory as an argument.
3. **Review the Report**:
   The script will output a human-readable console report. It will categorize files into:
   - **Matched slots**: Images that perfectly match a missing slot by filename.
   - **Missing slots**: Slots that are still unresolved after checking the drop.
   - **Unknown files**: Images in the drop that do not match any pending slot.
   - **Invalid files**: Files in the drop that are not readable images.
4. **Machine-Readable Manifest**:
   The script automatically generates a detailed JSON report at `docs/owner-art-drop-manifest.json` for further automation or review.

## Exact Commands

Run the validator with the following command (replace `<drop_directory>` with the path to the images):

```bash
node scripts/verify-owner-art-drop.mjs <drop_directory>
```

For example, to run it on a folder located at `docs/archive/`:

```bash
node scripts/verify-owner-art-drop.mjs docs/archive/
```

If you encounter issues, ensure you are in the project root and all dependencies (like `sharp`) are installed.
