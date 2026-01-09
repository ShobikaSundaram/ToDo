// Ocean Tasks Login - Beach-themed Authentication
class OceanLogin {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.addFloatingAnimations();
    }

    bindEvents() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Close message modal
        document.querySelector('.close-message')?.addEventListener('click', () => {
            this.hideMessage();
        });

        // Click outside modal to close
        document.getElementById('messageModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'messageModal') {
                this.hideMessage();
            }
        });

        // Input focus effects
        const inputs = document.querySelectorAll('.input-wrapper input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.createRippleEffect();
            });
        });

        // Forgot password link
        document.querySelector('.forgot-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showMessage('🌊 Like the tide, your password will return to you soon! Check your email for reset instructions.', 'info');
        });

        // Signup link
        document.querySelector('.signup-link')?.addEventListener('click', (e) => {
            // Let the default link behavior work (navigate to /signup)
            // Remove the preventDefault and custom message
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember').checked;

        if (!username || !password) {
            this.showMessage('🐚 Please fill in both your username and password like shells completing a collection!', 'error');
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('.wave-button');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    remember
                })
            });

            const data = await response.json();

            if (response.ok) {
                const currentTime = new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                this.showMessage(
                    `🌊 Welcome back to your ocean of productivity, ${username}! Redirecting... (${currentTime})`, 
                    'success'
                );
                
                // Store session info
                if (data.token) {
                    localStorage.setItem('oceanTasksToken', data.token);
                }
                
                // Redirect after success message
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                this.showMessage(data.message || '🏖️ The waves seem rough today. Please check your credentials and try again!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('🌊 The ocean connection seems choppy. Please try again in a moment!', 'error');
        } finally {
            // Remove loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    showMessage(message, type = 'info') {
        const modal = document.getElementById('messageModal');
        const messageText = document.getElementById('messageText');
        
        messageText.textContent = message;
        messageText.className = `message-${type}`;
        
        // Add type-specific styling
        const messageContent = document.querySelector('.message-content');
        messageContent.className = `message-content message-${type}`;
        
        modal.classList.remove('hidden');
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 3000);
        }
    }

    hideMessage() {
        document.getElementById('messageModal').classList.add('hidden');
    }

    createRippleEffect() {
        // Add subtle wave animation when focusing inputs
        const waves = document.querySelectorAll('.waves');
        waves.forEach(wave => {
            wave.style.animationDuration = '3s';
            setTimeout(() => {
                wave.style.animationDuration = wave.classList.contains('wave2') ? '8s' : 
                                             wave.classList.contains('wave3') ? '10s' : '6s';
            }, 3000);
        });
    }

    addFloatingAnimations() {
        // Add random delays to floating elements for more natural movement
        const floatingElements = document.querySelectorAll('.floating-shell');
        floatingElements.forEach((element, index) => {
            const randomDelay = Math.random() * 5;
            element.style.animationDelay = `-${randomDelay}s`;
            
            // Add random slight position variations
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            element.style.transform = `translate(${randomX}px, ${randomY}px)`;
        });
    }
}

// Initialize the login system
const oceanLogin = new OceanLogin();

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation to login shell
    const loginShell = document.querySelector('.login-shell');
    loginShell.style.opacity = '0';
    loginShell.style.transform = 'translateY(50px) scale(0.9)';
    
    setTimeout(() => {
        loginShell.style.transition = 'all 0.8s ease-out';
        loginShell.style.opacity = '1';
        loginShell.style.transform = 'translateY(0) scale(1)';
    }, 300);

    // Add typing effect to subtitle
    const subtitle = document.querySelector('.login-subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            subtitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    setTimeout(typeWriter, 1000);
});