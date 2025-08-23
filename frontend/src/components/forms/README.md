# Reusable Form Components

This directory contains reusable form components extracted from the original SearXNG configuration form, with comprehensive JSDoc documentation inline.

## 📁 Component Structure

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `FormField` | `./FormField.tsx` | Reusable text input with label and validation |
| `FormSelect` | `./FormSelect.tsx` | Dropdown select component with options |
| `FormCheckbox` | `./FormCheckbox.tsx` | Checkbox input with flexible layouts |
| `TabNavigation` | `./TabNavigation.tsx` | Tab switching interface |
| `ConfigSection` | `./ConfigSection.tsx` | Collapsible section wrapper |
| `EngineCard` | `./EngineCard.tsx` | Search engine configuration card |
| `ActionButtons` | `./ActionButtons.tsx` | Standardized action button group |

### Main Forms

| Component | Location | Purpose |
|-----------|----------|---------|
| `SearXngForm` | `./SearXngForm.tsx` | Complete SearXNG configuration form |
| `SearXngModalForm` | `./SearXngModalForm.tsx` | Modal wrapper version (v2) |

### Supporting Files

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces and types |
| `index.ts` | Export barrel for all components |

## 🚀 Usage Examples

### Basic Form Components

```tsx
import { FormField, FormSelect, FormCheckbox } from './components/forms';

// Text input
<FormField
  label="Instance Name"
  value={name}
  onChange={setName}
  placeholder="Enter name"
  helpText="This will be displayed in the search interface"
/>

// Dropdown select
<FormSelect
  label="Language"
  value={language}
  options={[
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' }
  ]}
  onChange={setLanguage}
/>

// Checkbox
<FormCheckbox
  label="Enable feature"
  checked={enabled}
  onChange={setEnabled}
  layout="vertical"
  helpText="This enables the feature"
/>
```

### Complete Configuration Form

```tsx
import { SearXngForm } from './components/forms';

<SearXngForm
  initialSettings={{
    general: { instance_name: "My Search Engine" }
  }}
  onSave={(settings) => {
    console.log('Configuration saved:', settings);
  }}
/>
```

### Modal Version (Version 2)

```tsx
import { SearXngModalForm } from './components/forms';

<SearXngModalForm
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={(settings) => {
    saveConfiguration(settings);
    setShowModal(false);
  }}
  title="Configure Search Engine"
  size="lg"
  closeOnOutsideClick={true}
/>
```

## 🏗️ Architecture

### Component Hierarchy

```
SearXngForm
├── TabNavigation
│   └── Individual tab buttons
├── ConfigSection (per tab)
│   ├── FormField components
│   ├── FormSelect components
│   ├── FormCheckbox components
│   └── EngineCard components (engines tab)
└── ActionButtons
    ├── Primary actions (download)
    └── Secondary actions (reset)

SearXngModalForm
├── Modal backdrop & container
├── Modal header with close button
└── SearXngForm (embedded)
```

### Data Flow

```
State Management: Component State (Class Component)
│
├── Settings Updates: updateSetting() / updateEngineSettings()
├── Tab Navigation: setActiveTab()
├── Actions: downloadConfig() / resetToDefaults()
└── Callbacks: onSave prop for external handling
```

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Dark mode** support with `dark:` prefixes
- **Responsive design** with `md:` and `lg:` breakpoints
- **Consistent focus states** and accessibility
- **Hover effects** and transitions

### Color Scheme

- Primary: Blue (`blue-600`, `blue-700`)
- Secondary: Gray (`gray-500`, `gray-600`)
- Danger: Red (`red-600`, `red-700`)
- Success: Green (`green-600`, `green-700`)

## ♿ Accessibility Features

- **ARIA labels** and descriptions
- **Keyboard navigation** support
- **Focus management** for modals
- **Screen reader** friendly
- **Semantic HTML** structure
- **Role attributes** where appropriate

## 📝 Type Safety

All components are fully typed with TypeScript:

```tsx
// Centralized types in types.ts
interface SearXngSettings {
  general: GeneralSettings;
  search: SearchSettings;
  server: ServerSettings;
  ui: UISettings;
  engines: Record<string, EngineConfig>;
}

// Component props interfaces
interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  // ... other props
}
```

## 🔄 Migration Guide

### From Original SearxngConfig.tsx

The original monolithic component has been split into:

1. **Reusable UI components** - Can be used in other forms
2. **Composed main form** - Maintains same functionality
3. **Modal wrapper** - New version 2 with modal interface

### Breaking Changes

- Class component structure maintained for compatibility
- Props interface expanded for flexibility
- Some internal method signatures changed

### Benefits

- ✅ **Reusability** - Components can be used across the application
- ✅ **Maintainability** - Smaller, focused components
- ✅ **Testing** - Individual components can be tested in isolation
- ✅ **Documentation** - JSDoc comments on all public APIs
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Accessibility** - Built-in a11y features

## 📊 Component Locations

```
frontend/src/components/forms/
├── types.ts                 # Type definitions
├── index.ts                 # Export barrel
├── README.md               # This documentation
├── FormField.tsx           # Text input component
├── FormSelect.tsx          # Select dropdown component
├── FormCheckbox.tsx        # Checkbox component
├── TabNavigation.tsx       # Tab switching component
├── ConfigSection.tsx       # Section wrapper component
├── EngineCard.tsx          # Engine configuration card
├── ActionButtons.tsx       # Action button group
├── SearXngForm.tsx         # Main configuration form
└── SearXngModalForm.tsx    # Modal version (v2)
```

All components include comprehensive JSDoc documentation inline for IDE intellisense and development experience.