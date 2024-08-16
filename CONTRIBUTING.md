# Contributing to Token.js

Thanks for your interest in improving Token.js!

We appreciate support in the following areas:
- Reporting issues. If you notice any bugs or have suggestions for new features, please [open an issue](https://github.com/token-js/token.js/issues/new).
- Fixing and responding to existing issues. You can start off with those tagged ["good first issue"](https://github.com/token-js/token.js/labels/good%20first%20issue), which are meant as introductory issues for external contributors.
- Supporting new providers. We recommend first opening an issue and contacting the maintainers to get guidance on this as we have not yet documented the complete process of supporting new providers.

## Development Quickstart

### Clone the repo

```bash
git clone https://github.com/token-js/token-js.git
```

### Open the project and install the dependencies

```bash
cd token-js && pnpm install
```

### Test your changes

```bash
pnpm test
```

### Run the linter, fix and commit any suggestions

```bash
pnpm lint:fix
```

```bash
git add .
git commit -m "fix: linter suggestions"
```

> Sometimes the linter may suggest changes that it is not able to fix itself, you should make sure to review and fix them manually before opening a pull request or the linter will block your PR during review.

### Make sure the docs are updated
```bash
pnpm docs:update
```

> You'll generally only need to update to docs if you [modify the models object](https://github.com/token-js/token.js/blob/main/src/models.ts).

### Add a changeset

```bash
pnpm changeset
```

> Adding a changeset ensures that a new release will be triggered with your changes once they are reviewed and merged. Please make sure to select an appropriate change level (major, minor, patch) and provide a concise description of the change. Your description will be included in the public facing changelog.