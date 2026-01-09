#!/usr/bin/env python3
"""
Ocean Tasks MCP Server
Provides motivational messages and task insights for the beach-themed task manager
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List
import random

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel
)

# Motivational message templates organized by context
MOTIVATIONAL_MESSAGES = {
    "overdue_gentle": [
        "The tide hasn't turned yet 🌊 — you've still got this!",
        "Every wave begins somewhere. Take one small step today.",
        "Like shells on the shore, your tasks are waiting to be discovered 🐚",
        "The ocean is patient, and so are your goals. Keep flowing forward!",
        "Even the mightiest waves start as gentle ripples. You can do this! 🌊"
    ],
    "overdue_encouraging": [
        "Your productivity is like the tide - it ebbs and flows. This is your time to flow!",
        "The beach is calling, but first, let's catch up on these tasks 🏖️",
        "Like a lighthouse guides ships, let your determination guide you back on track ⚓",
        "The sea never rushes, yet it always reaches its destination. You will too! 🌊",
        "Every seashell was once rough - smooth progress comes with gentle persistence 🐚"
    ],
    "completion_celebration": [
        "Fantastic! You're riding the wave of productivity! 🌊⭐",
        "Like a perfect seashell, your completed task is a treasure! 🐚✨",
        "You're making waves with your progress! Keep it flowing! 🌊",
        "Another task washed ashore - beautifully completed! 🏖️⭐",
        "Your focus is as steady as the tide - amazing work! 🌊✨"
    ],
    "daily_motivation": [
        "Start your day like the sunrise over the ocean - bright and full of possibility! 🌅",
        "Let your tasks flow like gentle waves - steady and purposeful 🌊",
        "Today's productivity forecast: Clear skies and smooth sailing ahead! ⛵",
        "Like the ocean shapes the shore, let today shape your success 🏖️",
        "Dive into your day with the energy of ocean waves! 🌊💪"
    ]
}

TASK_INSIGHTS = {
    "productivity_tips": [
        "🌊 Flow Tip: Break large tasks into smaller waves - easier to ride!",
        "🐚 Shell Strategy: Collect small wins throughout the day like seashells on the beach",
        "🏖️ Beach Break: Take regular breaks to maintain your natural rhythm",
        "⭐ Starfish Method: Spread your focus across different task types for balance",
        "🌅 Tide Timing: Tackle your hardest tasks when your energy is at high tide"
    ],
    "focus_techniques": [
        "🌊 Ocean Breathing: Take deep breaths like ocean waves to center yourself",
        "🐚 Shell Focus: Hold one task in your mind like a precious shell",
        "🏖️ Beach Visualization: Imagine completing tasks as collecting treasures on the beach",
        "⚓ Anchor Technique: Set a clear intention before starting each task",
        "🌊 Wave Momentum: Use the completion of one task to flow into the next"
    ]
}

server = Server("ocean-tasks-mcp")

@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available MCP tools for Ocean Tasks"""
    return [
        Tool(
            name="get_motivational_message",
            description="Get a beach-themed motivational message based on task context",
            inputSchema={
                "type": "object",
                "properties": {
                    "context": {
                        "type": "string",
                        "enum": ["overdue_gentle", "overdue_encouraging", "completion_celebration", "daily_motivation"],
                        "description": "The context for the motivational message"
                    },
                    "days_overdue": {
                        "type": "integer",
                        "description": "Number of days a task is overdue (optional)",
                        "minimum": 0
                    },
                    "task_count": {
                        "type": "integer", 
                        "description": "Number of tasks in the context (optional)",
                        "minimum": 1
                    }
                },
                "required": ["context"]
            }
        ),
        Tool(
            name="get_productivity_insight",
            description="Get productivity tips and insights with ocean/beach theme",
            inputSchema={
                "type": "object",
                "properties": {
                    "insight_type": {
                        "type": "string",
                        "enum": ["productivity_tips", "focus_techniques"],
                        "description": "Type of insight to provide"
                    },
                    "user_context": {
                        "type": "string",
                        "description": "Optional context about user's current situation"
                    }
                },
                "required": ["insight_type"]
            }
        ),
        Tool(
            name="analyze_task_patterns",
            description="Analyze task completion patterns and provide insights",
            inputSchema={
                "type": "object",
                "properties": {
                    "tasks": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string"},
                                "title": {"type": "string"},
                                "completed": {"type": "boolean"},
                                "due_date": {"type": "string"},
                                "created_at": {"type": "string"},
                                "completed_at": {"type": "string"}
                            }
                        },
                        "description": "Array of task objects to analyze"
                    }
                },
                "required": ["tasks"]
            }
        ),
        Tool(
            name="generate_custom_message",
            description="Generate a custom motivational message with specific parameters",
            inputSchema={
                "type": "object",
                "properties": {
                    "tone": {
                        "type": "string",
                        "enum": ["gentle", "encouraging", "celebratory", "calming"],
                        "description": "Tone of the message"
                    },
                    "task_title": {
                        "type": "string",
                        "description": "Specific task title to reference"
                    },
                    "time_context": {
                        "type": "string",
                        "enum": ["morning", "afternoon", "evening", "late_night"],
                        "description": "Time of day context"
                    }
                },
                "required": ["tone"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool calls for Ocean Tasks MCP server"""
    
    if name == "get_motivational_message":
        context = arguments["context"]
        days_overdue = arguments.get("days_overdue", 0)
        task_count = arguments.get("task_count", 1)
        
        # Select appropriate message based on context
        if context in MOTIVATIONAL_MESSAGES:
            messages = MOTIVATIONAL_MESSAGES[context]
            message = random.choice(messages)
            
            # Customize message based on parameters
            if context.startswith("overdue") and days_overdue > 0:
                if days_overdue == 1:
                    message += f"\n\n💙 Just one day behind - like a gentle wave, you can catch up easily!"
                elif days_overdue <= 3:
                    message += f"\n\n🌊 {days_overdue} days behind, but the ocean teaches us patience. You've got this!"
                else:
                    message += f"\n\n🏖️ Take it one task at a time, like collecting shells on an endless beach."
            
            if task_count > 1:
                message += f"\n\n🐚 {task_count} tasks waiting - like treasures scattered on the shore, each one valuable!"
                
            return [TextContent(type="text", text=message)]
        else:
            return [TextContent(type="text", text="🌊 The ocean whispers: 'Keep flowing forward, one wave at a time!'")]
    
    elif name == "get_productivity_insight":
        insight_type = arguments["insight_type"]
        user_context = arguments.get("user_context", "")
        
        if insight_type in TASK_INSIGHTS:
            insights = TASK_INSIGHTS[insight_type]
            insight = random.choice(insights)
            
            if user_context:
                insight += f"\n\n💡 Considering your situation: {user_context}"
                insight += "\n🌊 Remember, like the tide, productivity has natural rhythms. Work with yours!"
            
            return [TextContent(type="text", text=insight)]
        else:
            return [TextContent(type="text", text="🌊 Like the endless ocean, there are infinite ways to improve productivity!")]
    
    elif name == "analyze_task_patterns":
        tasks = arguments["tasks"]
        
        # Analyze completion patterns
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.get("completed", False)])
        overdue_tasks = []
        
        now = datetime.now()
        for task in tasks:
            if task.get("due_date") and not task.get("completed", False):
                due_date = datetime.fromisoformat(task["due_date"].replace('Z', '+00:00'))
                if due_date < now:
                    overdue_tasks.append(task)
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Generate insights
        analysis = f"🌊 **Ocean Tasks Analysis** 🌊\n\n"
        analysis += f"📊 **Task Overview:**\n"
        analysis += f"• Total tasks: {total_tasks} 🐚\n"
        analysis += f"• Completed: {completed_tasks} ⭐\n"
        analysis += f"• Completion rate: {completion_rate:.1f}% 🌊\n"
        analysis += f"• Overdue tasks: {len(overdue_tasks)} 🏖️\n\n"
        
        # Provide personalized insights
        if completion_rate >= 80:
            analysis += "🌟 **Excellent Flow!** You're riding the productivity wave like a pro surfer! Keep up this amazing momentum!"
        elif completion_rate >= 60:
            analysis += "🌊 **Steady Progress!** Like consistent ocean waves, you're making good progress. A few more completed tasks and you'll be in the flow zone!"
        elif completion_rate >= 40:
            analysis += "🐚 **Building Momentum!** Every shell starts rough before becoming smooth. You're on the right path - keep collecting those completed tasks!"
        else:
            analysis += "🏖️ **Fresh Start Opportunity!** Like a clean beach at dawn, you have a beautiful opportunity to create new patterns. Start with one small task - your first seashell!"
        
        if overdue_tasks:
            analysis += f"\n\n🌅 **Gentle Reminder:** {len(overdue_tasks)} tasks are waiting like shells on the shore. Consider tackling the smallest one first to build momentum!"
        
        return [TextContent(type="text", text=analysis)]
    
    elif name == "generate_custom_message":
        tone = arguments["tone"]
        task_title = arguments.get("task_title", "")
        time_context = arguments.get("time_context", "")
        
        # Base messages by tone
        tone_messages = {
            "gentle": [
                "Like gentle waves lapping the shore, take your time and flow naturally 🌊",
                "The ocean never rushes, yet it shapes the entire coastline. You have time 🏖️",
                "Soft as sea foam, steady as the tide - that's your natural rhythm 🌊"
            ],
            "encouraging": [
                "You've got the power of the ocean within you - unleash those waves! 🌊💪",
                "Like a lighthouse guides ships safely home, your determination will guide you through! ⚓",
                "Surf's up! Ride this wave of motivation all the way to completion! 🏄‍♀️"
            ],
            "celebratory": [
                "Fantastic! You're making waves of success! 🌊⭐",
                "Like finding a perfect seashell, this achievement is truly special! 🐚✨",
                "You're absolutely crushing it - the ocean itself is cheering you on! 🌊🎉"
            ],
            "calming": [
                "Breathe like the ocean waves - in and out, steady and peaceful 🌊😌",
                "Let the rhythm of the sea calm your mind and center your focus 🏖️",
                "Like a quiet lagoon, find your inner peace and clarity 🌊💙"
            ]
        }
        
        message = random.choice(tone_messages.get(tone, tone_messages["gentle"]))
        
        # Add task-specific context
        if task_title:
            message += f"\n\n🎯 Focus on: '{task_title}' - like a pearl in an oyster, this task holds value!"
        
        # Add time context
        time_additions = {
            "morning": "\n\n🌅 Morning energy is like the rising tide - use it to lift your productivity!",
            "afternoon": "\n\n☀️ Afternoon focus flows like steady ocean currents - consistent and strong!",
            "evening": "\n\n🌅 Evening reflection time - like watching sunset over calm waters, review your progress!",
            "late_night": "\n\n🌙 Night owl productivity - like bioluminescent waves, you shine in the darkness!"
        }
        
        if time_context in time_additions:
            message += time_additions[time_context]
        
        return [TextContent(type="text", text=message)]
    
    else:
        return [TextContent(type="text", text=f"🌊 Unknown tool: {name}. Like the vast ocean, there's always more to explore!")]

async def main():
    """Main entry point for the MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="ocean-tasks-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())