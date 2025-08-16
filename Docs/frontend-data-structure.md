# Project frontend File Structure Guidelines

**CRITICAL RULE: Never put everything in a single file. Always separate concerns into multiple files and directories.**

## Core Philosophy
- Each logical responsibility gets its own file
- Complex features get their own directory structure
- Prefer many small, focused files over few large files
- File and directory names should be self-explanatory
- Maximum ~100-150 lines per file preferred
- If you need to scroll extensively, split the file asap if possible

## Directory Structure

### API Layer
Each API domain gets its own directory with organized sub-structure:

```
src/api/
  user/
    fetchUser.ts          // API methods
    updateUser.ts       // API methods
    types.ts            // User API request/response types
    index.ts            // Re-exports for clean imports
  auth/
    authApi.ts          // Authentication API methods
    types.ts            // Auth-related types
    index.ts
  products/
    fetchProducts.ts
    postProducts.ts
    types.ts
    index.ts
```

### State Management (Redux + Redux-Saga)
Each slice gets its own directory with complete separation:

```
src/store/
  user/
    userSlice.ts        // Redux slice definition
    userSaga.ts         // Saga logic for user operations
    types.ts            // State types and action types
    selectors/          // Directory for selectors (if multiple)
      userSelectors.ts  // User-specific selectors
      profileSelectors.ts // Profile-specific selectors
    index.ts            // Re-exports
  auth/
    authSlice.ts
    authSaga.ts
    types.ts
    selectors/
      authSelectors.ts
    index.ts
  products/
    productsSlice.ts
    productsSaga.ts
    types.ts
    selectors/
      productsSelectors.ts
      filtersSelectors.ts
    index.ts
  index.ts              // Root store configuration
  rootSaga.ts           // Root saga combining all sagas
```

### Components
Two approaches for component organization:

#### Approach 1: Component with local types
```
src/components/
  UserProfile/
    UserProfile.tsx        // Main component
    types.ts               // Component-specific types
    UserProfile.module.css // Styles if needed
    index.ts               // Re-export
  ProductCard/
    ProductCard.tsx
    types.ts
    index.ts
```

#### Approach 2: Global types reference
```
src/components/
  UserProfile/
    UserProfile.tsx     // References types from src/types/
    UserProfile.module.css
    index.ts
  ProductCard/
    ProductCard.tsx     // References types from src/types/
    index.ts

src/types/
  userProfile.ts      // Types for UserProfile component
  productCard.ts      // Types for ProductCard component
```

### Business Logic Services
```
src/services/
  userService.ts        // User business logic
  validationService.ts  // Validation utilities
  authService.ts        // Authentication business logic
  dataTransforms.ts     // Data transformation utilities
```

### Types Organization
Choose one approach consistently:

#### Approach 1: Domain-based types
```
src/types/
  user.ts               // All user-related types
  product.ts            // All product-related types
  api.ts                // Generic API types
  common.ts             // Shared/common types
```

#### Approach 2: Feature-based types (mirrors directory structure)
```
src/types/
  api/
    user.ts             // User API types
    auth.ts             // Auth API types
  store/
    user.ts             // User state types
    auth.ts             // Auth state types
  components/
    userProfile.ts      // UserProfile component types
```

### Utilities and Helpers
```
src/utils/
  dateUtils.ts          // Date manipulation utilities
  stringUtils.ts        // String manipulation utilities
  apiUtils.ts           // API helper functions
  constants.ts          // Application constants
```

## File Naming Conventions
- Use camelCase for files: `userService.ts`, `authApi.ts`
- Use PascalCase for components: `UserProfile.tsx`
- Use descriptive names: `userSelectors.ts` not `selectors.ts`
- Include purpose in name: `userApi.ts`, `userTypes.ts`, `userSaga.ts`

## What NOT to Do ❌
- Don't put API calls, business logic, and state management in the same file
- Don't create files longer than ~150 lines
- Don't mix concerns (API calls with UI logic, etc.)
- Don't put all types in one giant file
- Don't put all selectors in one file
- Don't put multiple sagas in one file
- Don't put all API methods in one file

## What TO Do ✅
- Create focused, single-responsibility files
- Use clear, descriptive file and directory names
- Group related files in directories
- Keep imports clean and explicit
- Prefer many small files over few large files
- Use index.ts files for clean re-exports
- Separate selectors when they serve different purposes
- Give each saga its own file
- Organize API methods by domain/feature

## Import Guidelines
```typescript
// Good: Clean imports from index files
import { userApi } from '@/api/user';
import { selectUserProfile } from '@/store/user/selectors';
import { UserProfile } from '@/components/UserProfile';

// Avoid: Deep imports that bypass organization
import { getUserProfile } from '@/api/user/userApi';
```

## Redux-Saga Specific Guidelines
- Each domain gets its own saga file
- Complex sagas can be split into multiple files within the domain directory
- Use descriptive names: `watchUserActions`, `handleUserLogin`
- Keep saga files focused on their specific domain

## File Size Guidelines
- **Maximum 150 lines per file** - if longer, split it
- **API files**: One file per resource/domain
- **Saga files**: One file per slice/domain
- **Selector files**: Split by logical grouping, not by arbitrary size
- **Component files**: One component per file, complex components get directories

## Example Project Structure
```
src/
├── api/
│   ├── user/
│   │   ├── userApi.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── auth/
│       ├── authApi.ts
│       ├── types.ts
│       └── index.ts
├── store/
│   ├── user/
│   │   ├── userSlice.ts
│   │   ├── userSaga.ts
│   │   ├── types.ts
│   │   ├── selectors/
│   │   │   ├── userSelectors.ts
│   │   │   └── profileSelectors.ts
│   │   └── index.ts
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authSaga.ts
│   │   ├── types.ts
│   │   ├── selectors/
│   │   │   └── authSelectors.ts
│   │   └── index.ts
│   ├── index.ts
│   └── rootSaga.ts
├── components/
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── ProductCard/
│       ├── ProductCard.tsx
│       ├── types.ts
│       └── index.ts
├── services/
│   ├── userService.ts
│   ├── authService.ts
│   └── validationService.ts
├── types/
│   ├── user.ts
│   ├── product.ts
│   └── common.ts
└── utils/
    ├── dateUtils.ts
    ├── apiUtils.ts
    └── constants.ts
```

---

**Remember: This structure prioritizes maintainability, scalability, and developer experience. Each file should have a single, clear purpose. If you're unsure where something belongs, create a new focused file rather than adding to an existing one.**