from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime, timedelta
import json
import os
import uuid
import hashlib
import re

app = Flask(__name__)
app.secret_key = 'ocean_waves_secret_key_2024'  # Change this in production

# Simple JSON storage for tasks and users
TASKS_FILE = 'data/tasks.json'
USERS_FILE = 'data/users.json'
os.makedirs('data', exist_ok=True)

def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def create_user(username, email, password, favorite_beach):
    """Create a new user"""
    users = load_users()
    
    if username in users:
        return False, "Username already exists"
    
    # Check if email already exists
    for user_data in users.values():
        if user_data.get('email') == email:
            return False, "Email already registered"
    
    users[username] = {
        'email': email,
        'password': hash_password(password),
        'favorite_beach': favorite_beach,
        'created_at': datetime.now().isoformat(),
        'last_login': None
    }
    
    save_users(users)
    return True, "User created successfully"

def migrate_old_tasks():
    """Migrate old tasks without user_id to have a default user_id"""
    if not os.path.exists(TASKS_FILE):
        return
        
    # Read tasks directly without calling load_tasks() to avoid recursion
    with open(TASKS_FILE, 'r') as f:
        tasks = json.load(f)
    
    updated = False
    
    for task in tasks:
        if 'user_id' not in task:
            # Assign old tasks to a default user or the first available user
            users = load_users()
            if users:
                task['user_id'] = list(users.keys())[0]  # Assign to first user
            else:
                task['user_id'] = 'admin'  # Default fallback
            updated = True
    
    if updated:
        save_tasks(tasks)
        print(f"Migrated {len([t for t in tasks if 'user_id' in t])} tasks")

def load_tasks():
    """Load tasks from JSON file"""
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r') as f:
            tasks = json.load(f)
        
        # Auto-migrate old tasks on first load (check only, don't call load_tasks again)
        needs_migration = any('user_id' not in task for task in tasks)
        if needs_migration:
            migrate_old_tasks()
            # Reload after migration
            with open(TASKS_FILE, 'r') as f:
                tasks = json.load(f)
        
        return tasks
    return []

def save_tasks(tasks):
    """Save tasks to JSON file"""
    with open(TASKS_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

def hash_password(password):
    """Simple password hashing (use proper hashing in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

def get_time_greeting(username):
    """Get time-based greeting with username"""
    from datetime import datetime
    now = datetime.now()
    hour = now.hour
    time_str = now.strftime("%I:%M %p")
    
    if hour < 6:
        greeting = f"🌙 Late night productivity, {username}"
    elif hour < 12:
        greeting = f"🌅 Good morning, {username}"
    elif hour < 17:
        greeting = f"☀️ Good afternoon, {username}"
    elif hour < 21:
        greeting = f"🌅 Good evening, {username}"
    else:
        greeting = f"🌙 Good night, {username}"
    
    return f"{greeting}! ({time_str})"

def get_time_greeting(username):
    """Get time-based greeting with username"""
    from datetime import datetime
    now = datetime.now()
    hour = now.hour
    time_str = now.strftime("%I:%M %p")
    
    if hour < 6:
        greeting = f"🌙 Late night productivity, {username}"
    elif hour < 12:
        greeting = f"🌅 Good morning, {username}"
    elif hour < 17:
        greeting = f"☀️ Good afternoon, {username}"
    elif hour < 21:
        greeting = f"🌅 Good evening, {username}"
    else:
        greeting = f"🌙 Good night, {username}"
    
    return f"{greeting}! ({time_str})"

def require_login(f):
    """Decorator to require login for routes"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/signup')
def signup():
    """Signup page"""
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/api/signup', methods=['POST'])
def api_signup():
    """Handle signup API request"""
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    confirm_password = data.get('confirmPassword', '').strip()
    favorite_beach = data.get('favoriteBeach', '').strip()
    terms = data.get('terms', False)
    
    # Validation
    if not all([username, email, password, confirm_password, favorite_beach]):
        return jsonify({'message': '🐚 Please fill in all fields like completing a seashell collection!'}), 400
    
    if len(username) < 3 or len(username) > 20:
        return jsonify({'message': '🏄‍♀️ Your beach name should be 3-20 characters long!'}), 400
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return jsonify({'message': '🐚 Beach names can only contain letters, numbers, and underscores!'}), 400
    
    if len(password) < 6:
        return jsonify({'message': '🔒 Your password should be at least 6 characters long!'}), 400
    
    if password != confirm_password:
        return jsonify({'message': '🔐 Your passwords don\'t match like synchronized waves!'}), 400
    
    if not terms:
        return jsonify({'message': '🏖️ Please agree to ride the waves responsibly!'}), 400
    
    # Create user
    success, message = create_user(username, email, password, favorite_beach)
    
    if success:
        return jsonify({
            'message': f'🌊 Welcome to the ocean, {username}! Your beach paradise awaits!',
            'user': username
        })
    else:
        if "Username already exists" in message:
            return jsonify({'message': f'🏄‍♀️ The beach name "{username}" is already taken! Try another wave-rider name.'}), 409
        elif "Email already registered" in message:
            return jsonify({'message': '📧 This email is already riding the waves with us! Try logging in instead.'}), 409
        else:
            return jsonify({'message': f'🏖️ {message}'}), 400

@app.route('/api/check-username', methods=['POST'])
def check_username():
    """Check if username is available"""
    data = request.json
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({'available': False})
    
    users = load_users()
    available = username not in users
    
    return jsonify({'available': available})

@app.route('/login')
def login():
    """Login page"""
    if 'user_id' in session:
        return redirect(url_for('index'))
    
    # Get username from query parameter if redirected from signup
    username = request.args.get('username', '')
    return render_template('login.html', prefill_username=username)

@app.route('/api/login', methods=['POST'])
def api_login():
    """Handle login API request"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    remember = data.get('remember', False)
    
    if not username or not password:
        return jsonify({'message': '🐚 Please provide both username and password!'}), 400
    
    # Check registered users
    users = load_users()
    if username in users:
        user_data = users[username]
        if verify_password(password, user_data['password']):
            session['user_id'] = username
            session['username'] = username
            
            # Update last login
            users[username]['last_login'] = datetime.now().isoformat()
            save_users(users)
            
            if remember:
                session.permanent = True
                app.permanent_session_lifetime = timedelta(days=30)
            
            time_greeting = get_time_greeting(username)
            
            return jsonify({
                'message': f'🌊 Welcome back to your ocean of productivity, {username}! {time_greeting}',
                'token': f'ocean_token_{username}_{uuid.uuid4().hex[:8]}',
                'user': username,
                'time_greeting': time_greeting,
                'favorite_beach': user_data.get('favorite_beach', 'sandy')
            })
    
    # Fallback to demo users for backward compatibility
    demo_users = {
        'ocean': 'waves',
        'beach': 'sunset',
        'admin': 'starfish'
    }
    
    if username in demo_users and demo_users[username] == password:
        session['user_id'] = username
        session['username'] = username
        
        if remember:
            session.permanent = True
            app.permanent_session_lifetime = timedelta(days=30)
        
        time_greeting = get_time_greeting(username)
        
        return jsonify({
            'message': f'🌊 Welcome back to your ocean of productivity, {username}! {time_greeting}',
            'token': f'ocean_token_{username}_{uuid.uuid4().hex[:8]}',
            'user': username,
            'time_greeting': time_greeting,
            'favorite_beach': 'sandy'
        })
    
    return jsonify({'message': '🏖️ Invalid credentials. New to our ocean? Create an account to start your beach journey!'}), 401

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/profile')
@require_login
def profile():
    """User profile page"""
    users = load_users()
    user_data = users.get(session['user_id'], {})
    
    # Get user's task statistics
    tasks = load_tasks()
    user_tasks = [task for task in tasks if task.get('user_id') == session['user_id']]
    
    stats = {
        'total_tasks': len(user_tasks),
        'completed_tasks': len([t for t in user_tasks if t.get('completed', False)]),
        'pending_tasks': len([t for t in user_tasks if not t.get('completed', False)]),
        'completion_rate': 0
    }
    
    if stats['total_tasks'] > 0:
        stats['completion_rate'] = round((stats['completed_tasks'] / stats['total_tasks']) * 100, 1)
    
    return render_template('profile.html', 
                         user_data=user_data, 
                         username=session['username'],
                         stats=stats)

@app.route('/')
@require_login
def index():
    """Main page - requires login"""
    return render_template('index.html', username=session.get('username', 'Ocean Explorer'))

@app.route('/api/tasks', methods=['GET'])
@require_login
def get_tasks():
    """Get all tasks for logged-in user"""
    tasks = load_tasks()
    current_user = session['user_id']
    user_tasks = [task for task in tasks if task.get('user_id') == current_user]
    return jsonify(user_tasks)

@app.route('/api/tasks', methods=['POST'])
@require_login
def create_task():
    """Create a new task for logged-in user"""
    data = request.json
    tasks = load_tasks()
    
    new_task = {
        'id': str(uuid.uuid4()),
        'user_id': session['user_id'],
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'due_date': data.get('due_date'),
        'completed': False,
        'created_at': datetime.now().isoformat(),
        'completed_at': None
    }
    
    tasks.append(new_task)
    save_tasks(tasks)
    
    return jsonify(new_task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@require_login
def update_task(task_id):
    """Update a task for logged-in user"""
    data = request.json
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id and task.get('user_id') == session['user_id']:
            task.update(data)
            if data.get('completed') and not task.get('completed_at'):
                task['completed_at'] = datetime.now().isoformat()
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found or access denied'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@require_login
def delete_task(task_id):
    """Delete a task for logged-in user"""
    tasks = load_tasks()
    original_length = len(tasks)
    tasks = [task for task in tasks if not (task['id'] == task_id and task.get('user_id') == session['user_id'])]
    
    if len(tasks) < original_length:
        save_tasks(tasks)
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Task not found or access denied'}), 404

@app.route('/api/calendar/<year>/<month>')
@require_login
def get_calendar_tasks(year, month):
    """Get tasks for a specific month for logged-in user"""
    tasks = load_tasks()
    user_tasks = [task for task in tasks if task.get('user_id') == session['user_id']]
    month_tasks = []
    
    for task in user_tasks:
        if task.get('due_date'):
            task_date = datetime.fromisoformat(task['due_date'].replace('Z', '+00:00'))
            if task_date.year == int(year) and task_date.month == int(month):
                month_tasks.append(task)
    
    return jsonify(month_tasks)

@app.route('/api/motivational-message', methods=['POST'])
@require_login
def get_motivational_message():
    """Get a motivational message from MCP server for logged-in user"""
    try:
        data = request.json
        context = data.get('context', 'daily_motivation')
        days_overdue = data.get('days_overdue', 0)
        task_count = data.get('task_count', 1)
        
        # Personalized messages with username
        username = session.get('username', 'Ocean Explorer')
        
        # For now, return a static message since MCP integration requires setup
        # In production, this would call the MCP server
        messages = {
            'overdue_gentle': [
                f"The tide hasn't turned yet, {username} 🌊 — you've still got this!",
                f"Every wave begins somewhere, {username}. Take one small step today.",
                f"Like shells on the shore, your tasks are waiting to be discovered, {username} 🐚"
            ],
            'overdue_encouraging': [
                f"Your productivity is like the tide, {username} - it ebbs and flows. This is your time to flow!",
                f"The beach is calling, {username}, but first, let's catch up on these tasks 🏖️",
                f"Like a lighthouse guides ships, let your determination guide you back on track, {username} ⚓"
            ],
            'completion_celebration': [
                f"Fantastic, {username}! You're riding the wave of productivity! 🌊⭐",
                f"Like a perfect seashell, your completed task is a treasure, {username}! 🐚✨",
                f"You're making waves with your progress, {username}! Keep it flowing! 🌊"
            ],
            'daily_motivation': [
                f"Start your day like the sunrise over the ocean, {username} - bright and full of possibility! 🌅",
                f"Let your tasks flow like gentle waves, {username} - steady and purposeful 🌊",
                f"Today's productivity forecast for {username}: Clear skies and smooth sailing ahead! ⛵"
            ]
        }
        
        import random
        message = random.choice(messages.get(context, messages['daily_motivation']))
        
        if context.startswith('overdue') and days_overdue > 0:
            if days_overdue == 1:
                message += f"\n\n💙 Just one day behind - like a gentle wave, you can catch up easily!"
            elif days_overdue <= 3:
                message += f"\n\n🌊 {days_overdue} days behind, but the ocean teaches us patience. You've got this!"
            else:
                message += f"\n\n🏖️ Take it one task at a time, like collecting shells on an endless beach."
        
        return jsonify({'message': message})
        
    except Exception as e:
        username = session.get('username', 'Ocean Explorer')
        return jsonify({'message': f'🌊 The ocean whispers to {username}: Keep flowing forward, one wave at a time!'}), 200

@app.route('/api/task-analysis', methods=['POST'])
@require_login
def analyze_tasks():
    """Analyze task patterns and provide insights for logged-in user"""
    try:
        tasks = load_tasks()
        user_tasks = [task for task in tasks if task.get('user_id') == session['user_id']]
        username = session.get('username', 'Ocean Explorer')
        
        total_tasks = len(user_tasks)
        completed_tasks = len([t for t in user_tasks if t.get('completed', False)])
        overdue_tasks = []
        
        now = datetime.now()
        for task in user_tasks:
            if task.get('due_date') and not task.get('completed', False):
                try:
                    due_date = datetime.fromisoformat(task['due_date'].replace('Z', '+00:00'))
                    if due_date < now:
                        overdue_tasks.append(task)
                except:
                    continue
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        analysis = {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'overdue_tasks': len(overdue_tasks),
            'completion_rate': round(completion_rate, 1),
            'insights': []
        }
        
        # Generate personalized insights
        if completion_rate >= 80:
            analysis['insights'].append(f"🌟 Excellent Flow, {username}! You're riding the productivity wave like a pro surfer!")
        elif completion_rate >= 60:
            analysis['insights'].append(f"🌊 Steady Progress, {username}! Like consistent ocean waves, you're making good progress.")
        elif completion_rate >= 40:
            analysis['insights'].append(f"🐚 Building Momentum, {username}! Every shell starts rough before becoming smooth.")
        else:
            analysis['insights'].append(f"🏖️ Fresh Start Opportunity, {username}! Like a clean beach at dawn, you have beautiful potential!")
        
        if overdue_tasks:
            analysis['insights'].append(f"🌅 Gentle Reminder for {username}: {len(overdue_tasks)} tasks are waiting like shells on the shore.")
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': 'Unable to analyze tasks'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)