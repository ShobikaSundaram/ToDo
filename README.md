# 🌊 Ocean Tasks - Beach-Themed Task Manager

A beautiful, calming task management web application with a beach/ocean theme, built with Python Flask and MCP (Model Context Protocol) integration.

## ✨ Features

### 🏖️ Beach-Themed UI
- **Ocean Wave Background**: Animated waves with soft blue gradients
- **Floating Task Bubbles**: Tasks appear as floating shells/bubbles on water
- **Starfish Completion Animation**: Cute starfish appears when tasks are completed
- **Calming Color Palette**: Soft blues, aquas, sand beige, and coral colors

### 📋 Task Management
- ✅ Add, edit, delete, and mark tasks as complete
- 📅 Calendar integration with monthly/weekly views
- 🗓️ Due date assignment and tracking
- 🌊 Visual task representation as floating objects on water

### 🤖 MCP-Powered Motivational Messages
- 💬 Context-aware motivational messages for overdue tasks
- 🌊 Beach-themed encouragement ("The tide hasn't turned yet...")
- 📊 Task pattern analysis and productivity insights
- 🎯 Personalized messages based on completion history

### 🎨 Interactive Elements
- 💫 Ripple effects when adding tasks
- ⭐ Starfish celebration animation on completion
- 🌊 Smooth wave animations throughout the UI
- 📱 Responsive design for mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 🛠️ MCP Server Setup

The application includes an MCP server for enhanced motivational messaging and task insights.

### Running the MCP Server

1. **Start the MCP server** (in a separate terminal):
   ```bash
   python mcp_server.py
   ```

2. **Configure MCP integration** (optional):
   - The Flask app includes fallback motivational messages
   - For full MCP integration, configure your MCP client to connect to the server

### MCP Tools Available

- **get_motivational_message**: Context-aware beach-themed motivation
- **get_productivity_insight**: Ocean-themed productivity tips
- **analyze_task_patterns**: Task completion pattern analysis
- **generate_custom_message**: Personalized motivational content

## 📁 Project Structure

```
ocean-tasks/
├── app.py                 # Main Flask application
├── mcp_server.py          # MCP server for motivational messages
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── styles.css    # Beach-themed CSS styles
│   └── js/
│       └── app.js        # Frontend JavaScript logic
├── data/
│   └── tasks.json        # Task storage (auto-created)
└── README.md             # This file
```

## 🎯 API Endpoints

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### Calendar & Insights
- `GET /api/calendar/<year>/<month>` - Get tasks for specific month
- `POST /api/motivational-message` - Get motivational message
- `POST /api/task-analysis` - Get task pattern analysis

## 🌊 Theme Elements

### Visual Metaphors
- **Tasks as Shells/Bubbles**: Floating on the ocean surface
- **Completion as Starfish**: Happy starfish animation on task completion
- **Progress as Tide**: Rising tide level represents overall progress
- **Motivation as Lighthouse**: Guiding messages to keep you on track

### Color Scheme
- **Ocean Blue** (`#4A90E2`): Primary action color
- **Aqua** (`#7FDBFF`): Accent and highlight color
- **Sand Beige** (`#F4E4BC`): Warm background elements
- **Coral** (`#FF6B6B`): Attention and warning color
- **Seafoam** (`#98E4D6`): Success and completion color

## 🔮 Future Enhancements

### Planned Features
- 🎵 **Ocean Sounds**: Optional ambient beach/ocean audio
- 📈 **Habit Tracking**: Track recurring tasks like daily waves
- 🌙 **Mood Integration**: Adjust messages based on user mood
- 🏆 **Achievement System**: Unlock beach-themed badges
- 📱 **Mobile App**: Native mobile version with offline support
- 🌐 **Multi-user**: Shared beaches for team collaboration

### MCP Extensions
- **Weather Integration**: Real beach weather in your task manager
- **Tide Predictions**: Use actual tide data for productivity insights
- **Marine Life Facts**: Educational content with task completion
- **Beach Meditation**: Guided relaxation between tasks

## 🤝 Contributing

This is a demonstration project showcasing Flask + MCP integration with creative UI design. Feel free to:

1. **Fork the project** and add your own beach-themed features
2. **Improve the MCP integration** with additional tools
3. **Enhance the animations** and visual effects
4. **Add new motivational message categories**

## 📝 Technical Notes

### Data Storage
- Uses simple JSON file storage (`data/tasks.json`)
- Easy to migrate to SQLite or PostgreSQL for production
- All task data persists between application restarts

### MCP Integration
- Demonstrates Model Context Protocol usage
- Provides fallback functionality when MCP server is unavailable
- Extensible architecture for additional AI-powered features

### Performance
- Lightweight Flask application
- Efficient CSS animations using transforms
- Minimal JavaScript for smooth user experience

## 🌊 Inspiration

This project combines productivity with tranquility, using the calming nature of ocean themes to create a stress-free task management experience. The beach metaphor helps users think of tasks as treasures to collect rather than burdens to carry.

*"Let your productivity flow like the tide - steady, natural, and unstoppable."* 🌊

---

**Built with 💙 using Flask, MCP, and lots of ocean-inspired creativity!**