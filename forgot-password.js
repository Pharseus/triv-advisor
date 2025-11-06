// Forgot Password Page JavaScript

// DOM Elements
let emailInput;
let resetBtn;
let alertBox;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Forgot password page loaded');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded!');
        return;
    }
    
    // Initialize DOM elements
    emailInput = document.getElementById('emailInput');
    resetBtn = document.getElementById('resetBtn');
    alertBox = document.getElementById('alertBox');
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', handlePasswordReset);
    }
    
    // Enter key to submit
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handlePasswordReset();
            }
        });
    }
}

// Handle password reset
async function handlePasswordReset() {
    const email = emailInput.value.trim();
    
    console.log('Attempting password reset for:', email);
    
    // Validation
    if (!email) {
        showAlert('Please enter your email address', 'error');
        emailInput.focus();
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Invalid email format', 'error');
        emailInput.focus();
        return;
    }
    
    // Disable button and show loading
    resetBtn.disabled = true;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        const auth = firebase.auth();
        
        // Configure action code settings
        const actionCodeSettings = {
            url: window.location.origin + '/login.html',
            handleCodeInApp: false,
        };
        
        await auth.sendPasswordResetEmail(email, actionCodeSettings);
        
        console.log('Password reset email sent successfully');
        
        showAlert('Password reset link sent! Please check your email.', 'success');
        
        // Clear input and redirect after 3 seconds
        emailInput.value = '';
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset link';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please sign up first.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many requests. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Failed to send reset link: ${error.message}`;
        }
        
        showAlert(errorMessage, 'error');
        
        // Re-enable button
        resetBtn.disabled = false;
        resetBtn.innerHTML = 'Send Reset Link';
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
