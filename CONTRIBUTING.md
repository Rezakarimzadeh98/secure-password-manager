# Contributing Guidelines

Thank you for your interest in contributing to the Secure Password Generator project. This document outlines the process and standards for contributing.

## Development Process

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

### Code Standards

#### TypeScript

- Use strict mode
- Provide explicit type annotations for function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes

#### React

- Use functional components with hooks
- Implement proper memoization for expensive computations
- Follow React best practices for performance
- Use semantic HTML elements

#### Styling

- Follow Tailwind CSS utility-first approach
- Maintain consistent spacing and sizing
- Ensure dark mode compatibility
- Test responsive design on multiple screen sizes

### Testing

Before submitting a pull request:

1. Test all functionality manually
2. Verify password generation produces expected results
3. Check entropy calculations are accurate
4. Ensure UI is responsive and accessible
5. Test in multiple browsers

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- perf: Performance improvements
- test: Test additions or modifications
- chore: Build process or auxiliary tool changes

Example:
```
feat(crypto): implement advanced entropy calculation

Add Shannon entropy calculation with character frequency analysis.
Improves password strength estimation accuracy.

Closes #123
```

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update README.md with any new features
4. Submit pull request with clear description
5. Reference related issues
6. Wait for review and address feedback

### Code Review

All submissions require review. Reviewers will check:

- Code quality and adherence to standards
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case explanation
- Expected behavior
- Potential implementation approach

## Security

For security vulnerabilities, please see [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
