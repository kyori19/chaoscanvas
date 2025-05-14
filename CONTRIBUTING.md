# Contributing to ChaosCanvas

Thank you for your interest in contributing to ChaosCanvas! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies with `npm install`
3. Make your changes
4. Run tests with `npm test`
5. Submit a pull request

## CI/CD Process

ChaosCanvas uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci.yml` and includes:

### Automated Processes

- **Testing & Building**: Runs on every PR and push to the main branch
- **Publishing**: Runs when a version tag (v*) is pushed and tests pass

### Manual Setup Required

For the publishing step to work, you need to set up a secret in your GitHub repository:

1. Generate a Personal Access Token (PAT) from Azure DevOps:
   - Go to https://dev.azure.com/{your-organization}/_usersSettings/tokens
   - Create a new token with the "Marketplace (Manage)" scope
   - Copy the generated token

2. Add it as a secret in your GitHub repository:
   - Go to your repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Create a new repository secret named `VSCE_PAT`
   - Paste your PAT as the value

## Release Process

1. Update the version in `package.json`
2. Update `CHANGELOG.md` with the changes
3. Commit these changes to the main branch
4. Create and push a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

The GitHub Actions workflow will automatically build, test, and publish the new version to the VS Code Marketplace.

## Code Style

- Follow the existing code style
- Use TypeScript for all code
- Include JSDoc comments for public APIs
- Add tests for new features

## Testing

- All changes should have appropriate tests
- Run existing tests with `npm test` before submitting a PR
- Tests should cover both success and failure scenarios

## Submitting a Pull Request

1. Create a branch for your changes
2. Make your changes following the code style
3. Add/update tests as necessary
4. Run tests to ensure they pass
5. Submit a pull request against the main branch
6. In your PR description, explain the changes and their purpose

Thank you for contributing to ChaosCanvas!
