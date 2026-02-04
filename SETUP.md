# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

1. **Navigate to the project directory**
   ```bash
   cd /Users/jp/CascadeProjects/risk-control-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to: `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Default User

The application shows a default user "John Doe" (Chief Risk Officer) in the sidebar.

## Module Navigation

The sidebar provides access to all 10 modules:

1. **Dashboard** - Executive overview with key metrics and charts
2. **Effectiveness Criteria** - Define and manage board-approved criteria
3. **Framework Builder** - Design your risk & control framework
4. **Material Controls** - Manage material controls register with AI scoring
5. **Risk-Control Library** - Generate customized risk and control libraries
6. **System Integrations** - Connect to enterprise systems for CCM
7. **Control Gap Radar** - Identify gaps from internal/external signals
8. **Testing Coordination** - Orchestrate testing with evidence collection
9. **Approvals** - Human-in-the-loop governance workflows
10. **Board Reporting** - Generate board packs and annual disclosures

## Mock Data

All modules currently use mock data from `src/services/mockApi.ts`. This data is structured to demonstrate the full application flow and can be easily replaced with real backend API calls.

## Responsive Design

The application is fully responsive:
- **Desktop**: Full sidebar navigation with expansive layouts
- **Tablet**: Collapsible sidebar with optimized spacing
- **Mobile**: Hamburger menu with mobile-optimized views

## Key Features to Explore

### AI-Powered Features (Bounded)
- **Effectiveness Criteria Generator** - Generate criteria from org profile
- **Materiality Scoring Engine** - Score controls for materiality
- **Risk-Control Library Generator** - Generate customized libraries
- **Control Gap Radar** - Classify gaps and propose actions
- **Test Plan Generator** - Auto-generate annual test plans

### Governance Features
- **Approval Workflows** - Multi-level approval gates
- **Audit Trail** - Complete version history and approvals
- **Evidence Management** - Immutable evidence with timestamps

### Reporting Features
- **Interactive Dashboards** - Charts and metrics with drill-down
- **Board Pack Generation** - Annual statement support
- **Provision 29 Disclosure** - Draft disclosure templates

## Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will automatically try the next available port.

### Missing Dependencies
Run `npm install` to ensure all dependencies are installed.

### Build Errors
Check that Node.js version is 18 or higher: `node --version`

## Next Steps

1. Explore each module through the sidebar navigation
2. Review the mock data structure in `src/services/mockApi.ts`
3. Review type definitions in `src/types/index.ts`
4. Replace mock API calls with real backend endpoints
5. Customize the design theme in `tailwind.config.js`

## Support

For questions or issues, refer to:
- README.md for detailed documentation
- Component source code in `src/pages/` and `src/components/`
- Type definitions in `src/types/index.ts`
