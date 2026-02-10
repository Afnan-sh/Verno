# Verno - AI-Powered Multi-Agent VSCode Extension

Verno is an advanced VSCode extension that brings intelligent multi-agent AI capabilities to your development workflow. With automatic code quality validation, comprehensive feedback systems, and real-time progress tracking, Verno transforms how you build software.

## 🚀 Key Features

### Multi-Agent Orchestration System
- **Planning Agent**: Structured project planning with comprehensive documentation
- **BMAD Agents**: Business Analysis, Architecture, UX Design, Development, Product Management, QA, Technical Writing
- **Orchestrator**: Automatic workflow coordination and task distribution
- **Context-Aware**: Smart detection of new vs existing projects

### Automatic Code Quality Validation ✨
The **DeveloperAgent** now includes a comprehensive 4-step quality pipeline that runs automatically after code generation:

1. **Dependency Installation** - Runs `npm install` automatically
2. **TypeScript Compilation** - Validates with `tsc --noEmit`
3. **Test Execution** - Runs `npm test` to ensure functionality
4. **Code Linting** - Checks code quality with `npm run lint`

All results are captured in detailed feedback reports with severity levels and actionable suggestions.

### Task Management & Progress Tracking
- **Auto-Generated TODOs**: Context-aware task creation based on project analysis
- **Real-Time Progress**: Visual progress tracking in VSCode status bar
- **Dependency Management**: Automatic task dependency chains
- **Priority Levels**: High, medium, low priority task categorization

### Agent Feedback System
- **Issue Tracking**: Critical, high, medium, low severity issue classification
- **Completed Tasks**: Comprehensive task completion logs
- **Suggestions**: Actionable recommendations for improvements
- **Next Steps**: Clear guidance on what to do next

### Conversation Management
- **Persistent History**: All planning and development conversations saved
- **Multiple Modes**: Planning, development, and chat conversation types
- **Export/Import**: Share conversations across team members
- **Agent Attribution**: Track which agent provided which insights

### Project Analysis
- **Language Detection**: Automatic identification of main programming language
- **Framework Detection**: Recognizes React, Vue, Next.js, Express, and more
- **Smart Scaffolding**: Different approaches for new vs existing projects
- **Dependency Tracking**: Analyzes and validates project dependencies

## 📊 UI Components

### Enhanced Sidebar
Browse through three powerful tabs:
- **TODOs**: View all agent tasks with status, priorities, and dependencies
- **Feedback**: See aggregated feedback from all agents with severity indicators
- **Conversations**: Access planning and development conversation history

### Activity Bar Progress
Real-time execution status displayed in your VSCode status bar:
- `$(pulse) Verno Ready` - Idle state
- `$(sync~spin) DeveloperAgent: 45%` - Running with progress
- `$(check) Verno Complete` - Successfully completed
- `$(error) Verno Error` - Error occurred

## 🛠️ Commands

- `Verno: Process User Input` - Start a new agent workflow
- `Verno: Start Recording` - Begin voice recording
- `Verno: Stop Recording` - End voice recording
- `Verno: Manage Agents` - Configure agent settings

## 📁 Project Structure

Verno creates a `.verno/` directory in your workspace:

```
workspace/
└── .verno/
    ├── conversations/          # Conversation history
    ├── todos/                  # TODO lists by agent
    ├── feedback/               # Agent feedback reports
    ├── PROJECT_PLAN.md        # Planning output
    ├── ANALYSIS.md            # Business analysis
    ├── ARCHITECTURE.md        # System architecture
    └── QA_PLAN.md             # Test plans
```

## 🔧 Requirements

- VS Code 1.80.0 or higher
- Node.js 18 or higher
- API key for your chosen LLM provider (Gemini, Groq, OpenAI, or Anthropic)

## 🚦 Getting Started

1. **Install the extension** from the VSCode marketplace
2. **Open the sidebar** and click the Verno icon
3. **Add your API key** for your LLM provider
4. **Start coding!** Use voice or text to interact with agents

### Example Workflow

1. **Planning**: "Create a plan for a task management app"
   - PlanningAgent generates comprehensive project plan
   - Orchestrator creates TODO list with dependencies
   
2. **Development**: Orchestrator executes BMAD pipeline
   - AnalystAgent performs business analysis
   - ArchitectAgent designs system architecture
   - UXDesignerAgent creates UX specifications
   - DeveloperAgent generates code **and validates quality**
   - QAEngineerAgent creates test plans
   - TechWriterAgent generates documentation

3. **Quality Check**: DeveloperAgent automatically:
   - Installs dependencies
   - Compiles TypeScript
   - Runs tests
   - Checks linting
   - **Generates feedback report**

4. **Review**: Check the feedback tab for issues and suggestions

## 📚 Documentation

For comprehensive documentation, see:
- [`docs/FEATURES.md`](./docs/FEATURES.md) - Detailed feature documentation
- API reference for all services
- Best practices and usage examples
- Troubleshooting guide

## 🎯 Quality Features

### Feedback-Enabled Agents
All BMAD agents now provide:
- ✅ Completed task lists
- ⚠️ Issues encountered (with severity)
- 💡 Improvement suggestions
- 📋 Recommended next steps

### Automatic Validation
DeveloperAgent ensures code quality by:
- Running all tests before marking complete
- Validating TypeScript compilation
- Checking code style with linters
- Documenting all issues found

## 🔄 Extension Settings

Configure Verno through VS Code settings:
- **LLM Provider**: Choose between Gemini, Groq, OpenAI, Anthropic
- **API Keys**: Configure your provider API keys
- **Agent Behavior**: Customize agent capabilities
- **Voice Settings**: Configure recording preferences

## 📝 Release Notes

### 0.2.0 (Latest)

**Major Quality Enhancements:**
- ✅ Automatic code quality validation in DeveloperAgent
- ✅ Comprehensive feedback system across all BMAD agents
- ✅ Real-time progress tracking in activity bar
- ✅ Auto-generated TODO lists with smart task assignment
- ✅ Enhanced sidebar with tabs for TODOs, Feedback, Conversations
- ✅ Project analysis for context-aware development
- ✅ Unit test infrastructure created

**New Services:**
- TodoService - Task management
- FeedbackService - Agent feedback collection
- ProgressIndicator - Real-time progress tracking
- ConversationService - Conversation persistence
- ProjectAnalyzer - Project structure analysis

**Enhanced Agents:**
- DeveloperAgent: Now includes 4-step quality pipeline
- AnalystAgent: Feedback-enabled with issue tracking
- ArchitectAgent: Tracks architecture decisions
- QAEngineerAgent: Quality assurance with feedback
- OrchestratorAgent: Auto-generates context-aware TODOs

### 0.0.1

Initial release with core voice recording and agent orchestration capabilities.

---

## 🤝 Contributing

Contributions are welcome! Please see the project repository for guidelines.

## 📄 License

See LICENSE file for details.

---

**Transform your development workflow with Verno - where AI agents work together to build better software, faster.**
