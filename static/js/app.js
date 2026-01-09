// Ocean Tasks - Beach-themed Task Manager
class OceanTasks {
    constructor() {
        this.tasks = [];
        this.currentDate = new Date();
        this.username = this.getUsername();
        this.init();
    }

    getUsername() {
        // Extract username from the welcome message or use default
        const welcomeElement = document.querySelector('.welcome-message');
        if (welcomeElement) {
            const text = welcomeElement.textContent;
            const match = text.match(/Welcome back, (.+?)!/);
            return match ? match[1] : 'Ocean Explorer';
        }
        return 'Ocean Explorer';
    }

    getCurrentTimeGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        let greeting;
        if (hour < 6) {
            greeting = "🌙 Late night productivity";
        } else if (hour < 12) {
            greeting = "🌅 Good morning";
        } else if (hour < 17) {
            greeting = "☀️ Good afternoon";
        } else if (hour < 21) {
            greeting = "🌅 Good evening";
        } else {
            greeting = "🌙 Good night";
        }
        
        return `${greeting}, ${this.username}! (${timeStr})`;
    }

    init() {
        this.bindEvents();
        this.loadTasks();
        this.renderCalendar();
        this.checkOverdueTasks();
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        // Show welcome message when page loads
        setTimeout(() => {
            this.showNotification(
                `🌊 Welcome to your ocean of productivity, ${this.username}! ${this.getCurrentTimeGreeting()}\n\nReady to make some waves today? 🏄‍♀️`,
                'success'
            );
        }, 1000);
    }

    bindEvents() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        // Click outside modal to close
        document.getElementById('motivationalModal').addEventListener('click', (e) => {
            if (e.target.id === 'motivationalModal') {
                this.hideModal();
            }
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
            } else {
                console.error('Failed to load tasks:', response.status);
                this.showNotification(`🌊 Couldn't load your tasks, ${this.username}. The ocean seems choppy!`, 'error');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification(`🌊 Connection troubles, ${this.username}. Please refresh when the tide returns!`, 'error');
        }
    }

    async addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            this.showNotification(`🐚 ${this.username}, please add a task title like naming a precious shell!`, 'warning');
            return;
        }

        const taskData = {
            title,
            description,
            due_date: dueDate || null
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.renderTasks();
                this.renderCalendar();
                this.clearForm();
                this.createRippleEffect();
                
                // Show success notification with username and time
                this.showNotification(
                    `🌊 Task "${title}" has been cast into your ocean, ${this.username}! ${this.getCurrentTimeGreeting()}`, 
                    'success'
                );
            } else {
                console.error('Failed to add task:', response.status);
                this.showNotification(`🏖️ Couldn't add your task, ${this.username}. The waves seem rough right now!`, 'error');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            this.showNotification(`🌊 Connection troubles, ${this.username}. Please try again when the tide returns!`, 'error');
        }
    }

    async updateTask(taskId, updates) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                    this.renderTasks();
                    this.renderCalendar();

                    // Show completion notification with username and time
                    if (updates.completed) {
                        this.showStarfishAnimation();
                        this.showNotification(
                            `⭐ Fantastic, ${this.username}! "${updatedTask.title}" completed like a perfect seashell! ${this.getCurrentTimeGreeting()}`,
                            'success'
                        );
                    } else if (updates.completed === false) {
                        this.showNotification(
                            `🌊 Task "${updatedTask.title}" is back in your ocean, ${this.username}! ${this.getCurrentTimeGreeting()}`,
                            'info'
                        );
                    } else {
                        this.showNotification(
                            `🐚 Task "${updatedTask.title}" updated successfully, ${this.username}! ${this.getCurrentTimeGreeting()}`,
                            'success'
                        );
                    }
                }
            } else {
                this.showNotification(`🏖️ Couldn't update your task, ${this.username}. The tide seems to be against us!`, 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showNotification(`🌊 Update failed, ${this.username}. Please try again when the waves calm down!`, 'error');
        }
    }

    async deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        const taskTitle = task ? task.title : 'Unknown task';
        
        // Show confirmation with personalized message
        if (!confirm(`🌊 ${this.username}, are you sure you want to let "${taskTitle}" drift away into the deep ocean? This cannot be undone!`)) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.renderCalendar();
                
                // Show deletion notification with username and time
                this.showNotification(
                    `🗑️ Task "${taskTitle}" has drifted away, ${this.username}. ${this.getCurrentTimeGreeting()}`,
                    'info'
                );
            } else {
                this.showNotification(`🏖️ Couldn't delete the task, ${this.username}. It seems to be anchored too deep!`, 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showNotification(`🌊 Deletion failed, ${this.username}. The ocean currents are too strong right now!`, 'error');
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        container.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-bubble ${task.completed ? 'completed' : ''}`;
        
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
        
        taskDiv.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <div class="task-actions">
                    <button class="task-btn complete-btn" onclick="oceanTasks.toggleComplete('${task.id}')" 
                            title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                        ${task.completed ? '🌟' : '🐚'}
                    </button>
                    <button class="task-btn edit-btn" onclick="oceanTasks.editTask('${task.id}')" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-btn delete-btn" onclick="oceanTasks.deleteTask('${task.id}')" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            ${task.due_date ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                📅 Due: ${this.formatDate(task.due_date)}
                ${isOverdue ? ' (Overdue)' : ''}
            </div>` : ''}
        `;

        return taskDiv;
    }

    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.updateTask(taskId, { completed: !task.completed });
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDueDate').value = task.due_date ? task.due_date.split('T')[0] : '';
            
            // Show edit notification with username and time
            this.showNotification(
                `✏️ Editing "${task.title}", ${this.username}! Make your changes and cast it back into the ocean. ${this.getCurrentTimeGreeting()}`,
                'info'
            );
            
            // Delete the old task and let user create updated version
            this.deleteTaskSilently(taskId);
        }
    }

    async deleteTaskSilently(taskId) {
        // Delete without confirmation or notification (used for editing)
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthHeader = document.getElementById('currentMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthHeader.textContent = this.currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        // Clear calendar
        calendar.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.color = 'var(--ocean-blue)';
            calendar.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Check if this day has tasks
            const dayDate = new Date(year, month, day);
            const hasTasks = this.tasks.some(task => {
                if (!task.due_date) return false;
                const taskDate = new Date(task.due_date);
                return taskDate.toDateString() === dayDate.toDateString();
            });

            if (hasTasks) {
                dayElement.classList.add('has-tasks');
            }

            dayElement.addEventListener('click', () => {
                this.showTasksForDate(dayDate);
            });

            calendar.appendChild(dayElement);
        }
    }

    showTasksForDate(date) {
        const tasksForDate = this.tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate.toDateString() === date.toDateString();
        });

        const timeGreeting = this.getCurrentTimeGreeting();
        
        if (tasksForDate.length > 0) {
            const taskTitles = tasksForDate.map(task => `• ${task.title}`).join('\n');
            this.showNotification(
                `📅 ${this.username}, here are your tasks for ${date.toLocaleDateString()}:\n\n${taskTitles}\n\n${timeGreeting}`,
                'info'
            );
        } else {
            this.showNotification(
                `🏖️ No tasks scheduled for ${date.toLocaleDateString()}, ${this.username}! Perfect day for beach relaxation. ${timeGreeting}`,
                'info'
            );
        }
    }

    checkOverdueTasks() {
        const now = new Date();
        const overdueTasks = this.tasks.filter(task => 
            task.due_date && 
            new Date(task.due_date) < now && 
            !task.completed
        );

        if (overdueTasks.length > 0) {
            // Show motivational message for overdue tasks
            setTimeout(() => {
                this.showMotivationalMessage(overdueTasks);
            }, 2000);
        }
    }

    async showMotivationalMessage(overdueTasks) {
        try {
            const response = await fetch('/api/motivational-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context: overdueTasks.length > 3 ? 'overdue_encouraging' : 'overdue_gentle',
                    days_overdue: this.calculateMaxOverdueDays(overdueTasks),
                    task_count: overdueTasks.length
                })
            });

            const data = await response.json();
            const timeGreeting = this.getCurrentTimeGreeting();
            const fullMessage = `${data.message}\n\n${timeGreeting}`;
            
            this.showNotification(fullMessage, 'warning');
        } catch (error) {
            // Fallback message if API fails
            const fallbackMessages = [
                "The tide hasn't turned yet 🌊 — you've still got this!",
                "Every wave begins somewhere. Take one small step today.",
                "Like shells on the shore, your tasks are waiting to be discovered 🐚"
            ];
            const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
            const timeGreeting = this.getCurrentTimeGreeting();
            
            this.showNotification(`${randomMessage}\n\n${timeGreeting}`, 'warning');
        }
    }

    calculateMaxOverdueDays(overdueTasks) {
        if (overdueTasks.length === 0) return 0;
        
        const now = new Date();
        let maxDays = 0;
        
        overdueTasks.forEach(task => {
            const dueDate = new Date(task.due_date);
            const daysDiff = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            maxDays = Math.max(maxDays, daysDiff);
        });
        
        return maxDays;
    }

    hideModal() {
        document.getElementById('motivationalModal').classList.add('hidden');
    }

    showStarfishAnimation() {
        const starfish = document.getElementById('starfishAnimation');
        starfish.classList.remove('hidden');
        starfish.classList.add('show');

        setTimeout(() => {
            starfish.classList.add('hidden');
            starfish.classList.remove('show');
        }, 2000);
    }

    createRippleEffect() {
        // Add a subtle ripple effect when adding tasks
        const waves = document.querySelectorAll('.waves');
        waves.forEach(wave => {
            wave.style.animationDuration = '2s';
            setTimeout(() => {
                wave.style.animationDuration = wave.classList.contains('wave2') ? '8s' : 
                                             wave.classList.contains('wave3') ? '10s' : '6s';
            }, 2000);
        });
    }

    clearForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskDueDate').value = '';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `ocean-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Position and animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remove after delay
        const autoRemoveDelay = type === 'error' ? 8000 : type === 'success' ? 5000 : 6000;
        const autoRemoveTimer = setTimeout(() => {
            this.removeNotification(notification);
        }, autoRemoveDelay);

        // Manual close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemoveTimer);
            this.removeNotification(notification);
        });

        // Click to dismiss
        notification.addEventListener('click', (e) => {
            if (e.target === notification || e.target.classList.contains('notification-content')) {
                clearTimeout(autoRemoveTimer);
                this.removeNotification(notification);
            }
        });
    }

    removeNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const oceanTasks = new OceanTasks();

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add floating animation to shells/bubbles
    const addFloatingAnimation = () => {
        const bubbles = document.querySelectorAll('.task-bubble');
        bubbles.forEach((bubble, index) => {
            bubble.style.animationDelay = `${index * 0.2}s`;
        });
    };

    // Refresh animations when tasks change
    const observer = new MutationObserver(addFloatingAnimation);
    observer.observe(document.getElementById('tasksList'), { childList: true });
});