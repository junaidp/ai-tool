# Risk & Control Management System

A comprehensive enterprise-grade frontend application for Risk Management & Internal Controls, designed to enable boards to make defensible annual statements on the effectiveness of their risk management framework.

## 🎯 Overview

This application provides a complete end-to-end solution for:
- Establishing effectiveness criteria
- Building risk & control frameworks
- Managing material controls
- Continuous monitoring & testing
- Control gap identification
- Governance & approvals
- Board reporting & disclosures

## 🚀 Features

### Module A: Effectiveness Criteria
- Define board-approved effectiveness framework
- AI-powered criteria generation
- Multiple dimensions (design, implementation, operation, decision-use, assurance, outcomes, adaptability)
- Basis of declaration documentation

### Module B: Framework Builder
- Guided framework design wizard
- Governance operating model configuration
- Risk taxonomy and appetite structure
- Control model and Three Lines of Defence
- RACI matrices and workflow generation

### Module C: Material Controls Register
- AI-powered materiality scoring engine
- Complete control documentation
- System dependencies mapping
- Evidence source tracking
- Balance sheet date declaration support

### Module D: Risk-Control Library
- Customized library generation from organizational profile
- Risk library with inherent/residual risk levels
- Control library (preventive/detective/corrective)
- Risk-control linkage matrix
- Quality metrics and gap analysis

### Module E: System Integrations
- Pre-built connectors for enterprise systems (ERP, IAM, Ticketing, etc.)
- Continuous control monitoring (CCM)
- Real-time signal processing
- Exception workflow management
- Evidence auto-capture with audit trail

### Module F: Control Gap Radar
- Internal signal monitoring (incidents, exceptions, audit findings)
- External signal monitoring (regulatory updates, sector trends)
- AI-powered gap classification
- Automated remediation proposals
- Priority-based escalation

### Module G: Testing Coordination
- Auto-generated annual test plans
- Testing orchestration with task management
- Evidence collection and validation
- Test results tracking (design & operating effectiveness)
- Remediation tracking and retest scheduling

### Module H: Governance & Approvals
- Human-in-the-loop approval gates
- Multi-level approval workflows
- Complete audit trail with version control
- Role-based approval routing
- Comments and rationale capture

### Module I: Board Reporting
- Executive effectiveness dashboard
- Material controls health metrics
- Issues and remediation tracking
- Forward-looking risk assessment
- Annual disclosure generation (Provision 29)
- Evidence index with drill-down capability

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📦 Installation

1. Clone or navigate to the project directory:
```bash
cd /Users/jp/CascadeProjects/risk-control-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🏗️ Project Structure

```
risk-control-system/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   └── Layout.tsx       # Main layout with navigation
│   ├── pages/               # Module pages
│   │   ├── Dashboard.tsx
│   │   ├── EffectivenessCriteria.tsx
│   │   ├── FrameworkBuilder.tsx
│   │   ├── MaterialControls.tsx
│   │   ├── RiskControlLibrary.tsx
│   │   ├── Integrations.tsx
│   │   ├── ControlGapRadar.tsx
│   │   ├── TestingCoordination.tsx
│   │   ├── Approvals.tsx
│   │   └── BoardReporting.tsx
│   ├── services/
│   │   └── mockApi.ts       # Mock API service with dummy data
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔌 Backend Integration

The application currently uses mock data from `src/services/mockApi.ts`. To integrate with a real backend:

1. Replace the mock API functions in `mockApi.ts` with actual API calls
2. The data structure is already defined in `src/types/index.ts`
3. Example endpoints to implement:
   - `GET /api/effectiveness-criteria`
   - `GET /api/framework-components`
   - `GET /api/material-controls`
   - `GET /api/risks`
   - `GET /api/controls`
   - `GET /api/test-plans`
   - `GET /api/issues`
   - `GET /api/integrations`
   - `GET /api/control-gaps`
   - `GET /api/approvals`
   - `GET /api/dashboard`

## 🎨 Design Features

- **Modern UI**: Clean, professional design with consistent styling
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: Built with Radix UI primitives for accessibility
- **Dark Mode Ready**: Color system supports dark mode (configurable)
- **Interactive Charts**: Real-time data visualization with Recharts
- **Loading States**: Proper loading and error handling
- **Toast Notifications**: User feedback for actions

## 📊 Data Model

The application manages the following core entities:
- **Effectiveness Criteria**: Board-approved dimensions and thresholds
- **Framework Components**: Governance, risk taxonomy, appetite, controls, 3LoD
- **Material Controls**: Materiality rationale, dependencies, evidence sources
- **Risks**: Inherent/residual levels, objectives, control linkages
- **Controls**: Type, automation, frequency, evidence
- **Test Plans**: Scheduled tests, results, exceptions
- **Issues**: Severity, remediation plans, retest dates
- **Integrations**: System connections, signals, exceptions
- **Control Gaps**: Internal/external sources, proposed actions
- **Approvals**: Workflow status, approvers, audit trail
- **Dashboard Data**: Aggregated metrics and trends

## 🔒 Security Considerations

When implementing backend integration:
- Implement proper authentication and authorization
- Use role-based access control (RBAC)
- Encrypt sensitive data in transit and at rest
- Maintain comprehensive audit logs
- Implement data retention policies
- Follow principle of least privilege

## 🚢 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

The `dist` folder will contain the optimized production build.

## 📝 Key Design Principles

1. **Human-in-the-Loop**: No AI automation without human approval
2. **Audit Trail**: Complete versioning and change history
3. **Defensibility**: Every board statement is traceable to evidence
4. **Bounded AI**: AI assists but doesn't override human judgment
5. **Evidence-Based**: All decisions supported by documented evidence

## 🎯 North Star Goal

Enable the Board to make a defensible annual statement on the effectiveness of the risk management & internal controls framework, including a balance-sheet-date declaration for material controls, supported by:
- End-to-end evidence trail
- Continuous monitoring
- Testing coordination
- Remediation tracking
- High-quality reporting

## 📄 License

This is a demonstration application. Customize and extend as needed for your organization.

## 🤝 Contributing

This application is designed to be easily extensible. Key areas for enhancement:
- Additional integration connectors
- Advanced AI features (with human oversight)
- Mobile-specific optimizations
- Real-time collaboration features
- Advanced analytics and reporting

---

**Note**: This application uses dummy data for demonstration. Replace `mockApi.ts` with real API calls for production use.
