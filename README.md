# TodoList - Modern React State Management Demo

A comprehensive example project demonstrating modern React state management patterns using **SWR + Ky** for network requests, **Zod** for data validation, **Zustand** for state management, and **optimistic updates** for enhanced user experience.

## 🎯 Project Overview

This TodoList application showcases best practices for building modern React applications with:
- **Efficient Data Fetching**: SWR + Ky for smart caching and network requests
- **Type Safety**: Zod runtime validation with TypeScript
- **State Management**: Zustand for predictable state updates
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **Real-time Statistics**: Computed values and live data synchronization

## 🏗️ Architecture

### Core Technologies

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[SWR 2.3](https://swr.vercel.app/)** - Data fetching with caching and revalidation
- **[Ky](https://github.com/sindresorhus/ky)** - Modern HTTP client replacing fetch
- **[Zod 4](https://zod.dev/)** - TypeScript-first schema validation
- **[Zustand 5](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static type checking

### State Management Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SWR Cache     │    │  Zustand Store  │    │ Component State │
│                 │    │                 │    │                 │
│ • API responses │    │ • Todo data     │    │ • UI state      │
│ • Cache keys    │    │ • Computed vals │    │ • Form data     │
│ • Revalidation  │    │ • Optimistic    │    │ • Filters       │
│                 │    │   updates       │    │ • Pagination    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   React UI      │
                    │                 │
                    │ • TodoList      │
                    │ • TodoItem      │
                    │ • TodoForm      │
                    │ • Statistics    │
                    └─────────────────┘
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main TodoList application
│   ├── components/                 # React components
│   │   ├── TodoStats.tsx          # Statistics display
│   │   ├── TodoFilters.tsx        # Filtering controls
│   │   ├── TodoForm.tsx           # Create/edit form
│   │   ├── TodoList.tsx           # Todo list container
│   │   └── TodoItem.tsx           # Individual todo item
│   └── api/                       # Next.js API routes
│       └── todos/                 # Todo CRUD endpoints
├── lib/
│   ├── stores/
│   │   └── todo-store.ts          # Zustand store definition
│   ├── hooks/
│   │   ├── use-api.ts             # SWR integration hooks
│   │   ├── use-todos-store.ts     # Todo-specific hooks
│   │   └── use-optimistic.ts      # Optimistic update utilities
│   ├── services/
│   │   └── todo.ts                # API service layer
│   ├── schemas/
│   │   └── todo.ts                # Zod validation schemas
│   └── api.ts                     # Ky HTTP client configuration
```
