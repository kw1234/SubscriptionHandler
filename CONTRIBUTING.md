# Contributing to Subscription Management Dashboard

Thank you for considering contributing to this project! This guide will help you get started with contributing to the Subscription Management Dashboard.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## 🤝 Code of Conduct

This project adheres to a code of conduct that ensures a welcoming environment for all contributors. Please read and follow these guidelines:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professionalism in all interactions

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- PostgreSQL database access
- Git for version control
- Basic knowledge of React, TypeScript, and Node.js

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/subscription-management-dashboard.git
   cd subscription-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Making Changes

### Branch Naming Convention

Use descriptive branch names that indicate the type of change:

- `feature/add-user-notifications` - New features
- `bugfix/fix-payment-processing` - Bug fixes
- `hotfix/critical-security-patch` - Critical fixes
- `docs/update-readme` - Documentation updates
- `refactor/optimize-database-queries` - Code refactoring

### Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add appropriate comments
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run check      # TypeScript type checking
   npm run build      # Ensure build works
   npm run dev        # Test in development
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your descriptive commit message"
   ```

## 📤 Submitting Changes

### Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Include screenshots for UI changes

3. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of the changes made.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] I have tested these changes locally
   - [ ] I have added appropriate tests
   - [ ] All existing tests pass

   ## Checklist
   - [ ] Code follows the project style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code where necessary
   - [ ] I have updated the documentation
   ```

## 📏 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### React Components

```typescript
// Good: Descriptive component with proper typing
interface UserSubscriptionProps {
  userId: number;
  onStatusChange: (status: string) => void;
}

export const UserSubscription: React.FC<UserSubscriptionProps> = ({
  userId,
  onStatusChange
}) => {
  // Component implementation
};
```

### Database Operations

- Use Drizzle ORM for all database operations
- Follow the established patterns in `server/storage.ts`
- Add proper error handling
- Use transactions for multi-step operations

### API Routes

```typescript
// Good: Proper error handling and validation
app.post('/api/subscriptions', async (req, res) => {
  try {
    const validatedData = insertSubscriptionSchema.parse(req.body);
    const subscription = await storage.createSubscription(validatedData);
    res.json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use Shadcn/UI components when possible
- Maintain responsive design principles

## 🧪 Testing

### Manual Testing

Before submitting, test these key areas:

1. **Subscription Lifecycle**
   - Create new subscription
   - Toggle subscription on/off
   - Verify status changes

2. **Dashboard Functionality**
   - Real-time updates
   - Metrics accuracy
   - Activity log updates

3. **Payment Processing**
   - Mock payment flow
   - Error handling
   - History tracking

### Automated Testing

We encourage adding tests for new features:

```typescript
// Example test structure
describe('Subscription Service', () => {
  it('should create a new subscription', async () => {
    const subscription = await subscriptionService.create({
      userId: 1,
      status: 'active'
    });
    
    expect(subscription.status).toBe('active');
  });
});
```

## 📂 Project Structure

Understanding the project structure helps with contributions:

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── dashboard/  # Dashboard-specific components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts               # Database connection
│   └── seed.ts             # Database seeding
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle database schema
```

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Environment Information**
   - Node.js version
   - Operating system
   - Browser (for frontend issues)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Additional Context**
   - Error messages
   - Console logs
   - Related code snippets

## 💡 Feature Requests

For new feature requests:

1. **Search existing issues** to avoid duplicates
2. **Provide clear use case** and business justification  
3. **Include mockups** or examples when helpful
4. **Consider implementation complexity**

## 🎯 Good First Issues

New contributors should look for issues labeled:

- `good-first-issue` - Simple, well-defined tasks
- `documentation` - Improve or add documentation
- `help-wanted` - Community input needed

## 📞 Getting Help

If you need help:

1. Check existing issues and documentation
2. Ask questions in issue comments
3. Join project discussions
4. Contact maintainers for guidance

## 🏆 Recognition

Contributors are recognized in several ways:

- Mentioned in release notes
- Added to contributors list
- GitHub contributor badges
- Community recognition

Thank you for contributing to the Subscription Management Dashboard! Your efforts help make this project better for everyone.

---

Happy coding! 🚀