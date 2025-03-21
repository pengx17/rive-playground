# Rive Playground

A React application for interactive testing and visualization of Rive animations. This playground allows you to upload, view, and interact with Rive animations directly in the browser.

## Features

- Upload and view Rive animation files
- Inspect animation structure, artboards, state machines, and inputs
- Play and control animations
- Test state machine interactions
- Responsive layout with modern UI

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI components
- Rive React Canvas library

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/rive-playground.git
cd rive-playground
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Upload a Rive animation file (.riv)
2. The playground will display the animation
3. Explore artboards, animations, and state machines
4. Test inputs and interactions with the animation

## Building for Production

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is open source under the MIT license.

## Acknowledgements

- [Rive](https://rive.app/) for the animation runtime
- [React](https://reactjs.org/) framework
- [Shadcn UI](https://ui.shadcn.com/) for UI components
