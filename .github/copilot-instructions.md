
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Architecture Rules:

- Use feature-based structure.
- Each feature must contain: domain, application, infrastructure and ui layers.
- Components must NEVER call HttpClient directly.
- All API communication must be isolated inside infrastructure layer.
- Use a facade per feature to orchestrate state and API calls.
- Use signals for state management.
- Use computed() for derived state.
- No business logic inside components.
- No usage of any.
- Always define DTO types separate from domain entities.
- Map DTOs to domain models inside infrastructure layer.
- Use ChangeDetectionStrategy.OnPush.
- Use native control flow (@if, @for).
- Use Reactive Forms only.
- Always implement proper error handling and loading state.
- Keep files small and single-responsibility.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Todolist API v1 Documentation

Base URL: `{{base_url}}/api/v1` (configured in environment)

### Auth Endpoints

| Method | Endpoint    | Auth Required | Body                                                                 | Response                                      |
|--------|-------------|---------------|----------------------------------------------------------------------|-----------------------------------------------|
| POST   | `/register` | No            | `{ name, email, password, password_confirmation }`                   | `{ token, expires_at }`                       |
| POST   | `/login`    | No            | `{ email, password }`                                                | `{ token, expires_at }`                       |
| POST   | `/refresh`  | Yes (Bearer)  | -                                                                    | `{ token, expires_at }`                       |
| POST   | `/logout`   | Yes (Bearer)  | -                                                                    | -                                             |
| GET    | `/me`       | Yes (Bearer)  | -                                                                    | `{ id, name, email, created_at, updated_at }` |

### Tasks Endpoints

| Method | Endpoint                  | Auth Required | Query Params                          | Body                                      | Response                                                  |
|--------|---------------------------|---------------|---------------------------------------|-------------------------------------------|-----------------------------------------------------------|
| GET    | `/tasks`                  | Yes (Bearer)  | `status`, `page`                      | -                                         | Paginated list of tasks                                   |
| POST   | `/tasks`                  | Yes (Bearer)  | -                                     | `{ title, description?, status }`         | Created task                                              |
| GET    | `/tasks/:id`              | Yes (Bearer)  | -                                     | -                                         | Task details                                              |
| PUT    | `/tasks/:id`              | Yes (Bearer)  | -                                     | `{ title?, description?, status? }`       | Updated task                                              |
| DELETE | `/tasks/:id`              | Yes (Bearer)  | -                                     | -                                         | -                                                         |
| GET    | `/tasks/:id/activity-log` | Yes (Bearer)  | `start_date`, `end_date`, `cursor`    | -                                         | Cursor-paginated activity log                             |

### Task Model

```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
```

### Activity Log Model

```typescript
interface ActivityLog {
  id: string;
  task_id: number;
  user_id: number;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string; // ISO date
  metadata: {
    ip: string;
    user_agent: string;
  };
}

interface PaginatedActivityLog {
  data: ActivityLog[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    path: string;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}
```

### Headers

All requests must include:
- `Accept: application/json`
- `Content-Type: application/json` (for POST/PUT)
- `Authorization: Bearer {{token}}` (for protected routes)
