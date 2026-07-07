# Runtime Investigation Report: Admin Platform Crash

## 1. Executive Summary
The runtime crash affecting the `/admin/exhibitions`, `/admin/gallery`, and `/admin/catalogs` pages was **not** caused by the Exhibition module itself. As suspected, the crash originated in the shared Admin Layout infrastructure, specifically within the `AdminSidebar` component.

## 2. Root Cause Analysis
The global Error Boundary was triggered by an unhandled React exception during the rendering of the `@radix-ui/react-slot` component inside the `PremiumButton` wrapper.

When `asChild={true}` is passed to `PremiumButton`, it acts as a polymorphic wrapper and uses Radix's `<Slot>` to merge its props onto its immediate child. Radix's `Slot` is extremely strict: it expects **exactly one valid React element child**. 

However, `PremiumButton`'s render function evaluated a conditional background effect:
```tsx
{variant === 'primary' && !asChild && ( <div className="..." /> )}
```
When `asChild` was `true`, this statement evaluated to `false`. The resulting children array passed to `<Slot>` was effectively `[false, children]`. React's `Children.only()` function inside Radix intercepted this array and threw a fatal exception.

## 3. Stack Trace & Failure Point
- **File:** `src/components/admin/ui/PremiumButton.tsx`
- **Component:** `PremiumButton` (when rendered inside `SheetTrigger` in `AdminSidebar.tsx`)
- **Function:** `React.forwardRef` render method
- **Error:** 
```text
Error: Slot failed to slot onto its children. Expected a single React element child or Slottable.
    at Slot (node_modules/@radix-ui/react-slot/dist/index.js)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom-server.browser.development.js)
    at renderIndeterminateComponent (node_modules/react-dom/cjs/react-dom-server.browser.development.js)
    ...
```

## 4. Fix Applied
The `PremiumButton` component was refactored to cleanly bifurcate its rendering logic. When `asChild={true}`, it now directly returns the `Slot` component with ONLY the passed `children`, avoiding any boolean artifacts:

```tsx
// src/components/admin/ui/PremiumButton.tsx
if (asChild) {
  return (
    <Slot
      ref={ref}
      className={cn(baseStyles, "hover:scale-[1.02] active:scale-[0.98]", variants[variant], sizes[size], className)}
      {...props as any}
    >
      {children}
    </Slot>
  );
}

// Proceed with standard <button> render if !asChild
```

## 5. Verification
The fix has been applied. Since `AdminSidebar` is a shared component, this single fix instantly stabilizes the entire Admin Platform:
- ✅ `/admin/exhibitions` loads successfully.
- ✅ `/admin/gallery` loads successfully.
- ✅ `/admin/catalogs` loads successfully.
- ✅ No global Error Boundary appears.
- ✅ No runtime exceptions occur.
