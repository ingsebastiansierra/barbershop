# Common Components

This directory contains reusable UI components that follow the design system specifications.

## Components

### Button
A versatile button component with multiple variants and sizes.

**Variants:** `primary`, `secondary`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

```tsx
import { Button } from './components/common';

<Button 
  title="Click Me" 
  onPress={() => {}} 
  variant="primary" 
  size="md" 
/>
```

### Input
A text input component with validation and error states.

```tsx
import { Input } from './components/common';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  error={emailError}
  keyboardType="email-address"
/>
```

### Card
A container component with different visual styles.

**Variants:** `elevated`, `outlined`, `filled`  
**Padding:** `sm`, `md`, `lg`

```tsx
import { Card } from './components/common';

<Card variant="elevated" padding="md" onPress={() => {}}>
  <Text>Card Content</Text>
</Card>
```

### Avatar
Displays user avatars with image or fallback initials.

**Sizes:** `sm`, `md`, `lg`, `xl`

```tsx
import { Avatar } from './components/common';

<Avatar
  uri="https://example.com/avatar.jpg"
  name="John Doe"
  size="lg"
  editable
  onPress={() => {}}
/>
```

### Modal
A modal dialog with customizable actions.

```tsx
import { Modal } from './components/common';

<Modal
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  title="Confirm Action"
  actions={[
    { label: 'Cancel', onPress: () => {}, variant: 'outline' },
    { label: 'Confirm', onPress: () => {}, variant: 'primary' }
  ]}
>
  <Text>Are you sure?</Text>
</Modal>
```

## Theme Integration

All components automatically use the current theme (light/dark) from the theme store:

```tsx
import { useThemeStore } from '../../store/themeStore';

const { theme, colors, toggleTheme } = useThemeStore();
```

## Design System

Components follow the design system defined in:
- `src/styles/colors.ts` - Color palettes
- `src/styles/theme.ts` - Typography, spacing, shadows, etc.
