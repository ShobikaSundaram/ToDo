// Ocean Tasks Signup - Beach-themed Registration
class OceanSignup {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.addFloatingAnimations();
    }

    bindEvents() {
        // Signup form submission
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
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
        const inputs = document.querySelectorAll('.input-wrapper input, .input-wrapper select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.createRippleEffect();
            });

            // Real-time validation
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });

        // Password confirmation validation
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Username availability check
        document.getElementById('username').addEventListener('blur', () => {
            this.checkUsernameAvailability();
        });
    }

    async handleSignup() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('.wave-button');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const currentTime = new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                this.showMessage(
                    `🌊 Welcome to the ocean, ${formData.username}! Your beach paradise awaits! Redirecting to login... (${currentTime})`, 
                    'success'
                );
                
                // Redirect to login after success
                setTimeout(() => {
                    window.location.href = '/login?username=' + encodeURIComponent(formData.username);
                }, 3000);
            } else {
                this.showMessage(data.message || '🏖️ The waves seem rough today. Please try again!', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('🌊 The ocean connection seems choppy. Please try again in a moment!', 'error');
        } finally {
            // Remove loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    getFormData() {
        return {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            favoriteBeach: document.getElementById('favoriteBeach').value,
            terms: document.getElementById('terms').checked
        };
    }

    validateForm(data) {
        // Username validation
        if (!data.username || data.username.length < 3 || data.username.length > 20) {
            this.showMessage('🏄‍♀️ Your beach name should be 3-20 characters long!', 'error');
            this.scrollToField('username');
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
            this.showMessage('🐚 Beach names can only contain letters, numbers, and underscores!', 'error');
            this.scrollToField('username');
            return false;
        }

        // Email validation
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showMessage('📧 Please provide a valid email address for your beach mail!', 'error');
            this.scrollToField('email');
            return false;
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            this.showMessage('🔒 Your password should be at least 6 characters long!', 'error');
            this.scrollToField('password');
            return false;
        }

        // Password confirmation
        if (data.password !== data.confirmPassword) {
            this.showMessage('🔐 Your passwords don\'t match like synchronized waves!', 'error');
            this.scrollToField('confirmPassword');
            return false;
        }

        // Beach vibe selection
        if (!data.favoriteBeach) {
            this.showMessage('🌊 Please choose your beach vibe to personalize your experience!', 'error');
            this.scrollToField('favoriteBeach');
            return false;
        }

        // Terms agreement
        if (!data.terms) {
            this.showMessage('🏖️ Please agree to ride the waves responsibly!', 'error');
            this.scrollToField('terms');
            return false;
        }

        return true;
    }

    scrollToField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
            field.focus();
        }
    }

    validateField(input) {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.remove('error', 'success');

        switch (input.id) {
            case 'username':
                if (input.value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(input.value)) {
                    wrapper.classList.add('success');
                } else if (input.value.length > 0) {
                    wrapper.classList.add('error');
                }
                break;
            case 'email':
                if (this.isValidEmail(input.value)) {
                    wrapper.classList.add('success');
                } else if (input.value.length > 0) {
                    wrapper.classList.add('error');
                }
                break;
            case 'password':
                if (input.value.length >= 6) {
                    wrapper.classList.add('success');
                } else if (input.value.length > 0) {
                    wrapper.classList.add('error');
                }
                break;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const wrapper = document.getElementById('confirmPassword').closest('.input-wrapper');
        
        wrapper.classList.remove('error', 'success');
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                wrapper.classList.add('success');
            } else {
                wrapper.classList.add('error');
            }
        }
    }

    async checkUsernameAvailability() {
        const username = document.getElementById('username').value.trim();
        if (username.length < 3) return;

        try {
            const response = await fetch('/api/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();
            const wrapper = document.getElementById('username').closest('.input-wrapper');
            
            if (data.available) {
                wrapper.classList.remove('error');
                wrapper.classList.add('success');
            } else {
                wrapper.classList.remove('success');
                wrapper.classList.add('error');
                this.showMessage(`🏄‍♀️ The beach name "${username}" is already taken! Try another wave-rider name.`, 'warning');
            }
        } catch (error) {
            console.error('Username check error:', error);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
            }, 4000);
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

// Initialize the signup system
const oceanSignup = new OceanSignup();

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation to signup shell
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