# IDE Setup for Containerized Development

## The Challenge
- Your app runs in a Docker container with all dependencies
- Your IDE runs on the host without Node.js installed
- This is BY DESIGN - we don't want Node on the Raspberry Pi host

## Solution Options

### Option 1: VS Code Dev Containers (Recommended)
This is the professional solution for containerized development.

1. Install the Dev Containers extension:
   - Extension ID: `ms-vscode-remote.remote-containers`
   - Or search "Dev Containers" in VS Code extensions

2. Open your project, then:
   - Press F1 or Ctrl+Shift+P
   - Type "Dev Containers: Reopen in Container"
   - VS Code will restart and connect to your container

3. Now VS Code runs INSIDE the container where all dependencies exist!
   - Full IntelliSense
   - No errors
   - Debugging works
   - Terminal opens inside container

### Option 2: Work with Limited IDE Support
If you can't use Dev Containers, the current setup provides:

- Basic syntax highlighting
- File navigation
- Code formatting
- Some IntelliSense from TypeScript's built-in types

What won't work without Dev Containers:
- Import resolution for packages
- Full type checking
- Package-specific IntelliSense

**This is fine because:**
- Your actual build happens in the container
- The container has all the dependencies
- Type checking happens during `npm run build` in container
- Hot reload works through the container

## Current Configuration

We've set up:
1. `tsconfig.json` - Configured for the container environment
2. `jsconfig.json` - Basic JavaScript/JSX support for the IDE
3. `.vscode/settings.json` - VS Code workspace settings
4. `types.d.ts` - Basic type declarations

## Running the App

Everything still works perfectly:
```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs frontend

# The app runs at https://localhost/dashboard
```

## Philosophy
This setup respects the containerized architecture. We don't pollute the host with Node.js or npm packages. The container is the source of truth for the build environment.
