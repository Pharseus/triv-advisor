// Register Page JavaScript

// DOM Elements
let emailInput;
let passwordInput;
let registerBtn;
let googleSignInBtn;
let togglePassword;
let alertBox;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Register page loaded');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded!');
        return;
    }
    
    // Initialize DOM elements
    emailInput = document.getElementById('emailInput');
    passwordInput = document.getElementById('passwordInput');
    registerBtn = document.getElementById('registerBtn');
    googleSignInBtn = document.getElementById('googleSignInBtn');
    togglePassword = document.getElementById('togglePassword');
    alertBox = document.getElementById('alertBox');
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Register page ready');
});

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    console.log('DOM Elements:', {
        registerBtn: !!registerBtn,
        googleSignInBtn: !!googleSignInBtn,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        togglePassword: !!togglePassword
    });
    
    // Register button
    if (registerBtn) {
        console.log('Adding click listener to registerBtn');
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Register button clicked!');
            handleRegister();
        });
    } else {
        console.error('registerBtn not found!');
    }
    
    // Google Sign-In button
    if (googleSignInBtn) {
        console.log('Adding click listener to googleSignInBtn');
        googleSignInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google sign-in button clicked!');
            signInWithGoogle();
        });
    } else {
        console.error('googleSignInBtn not found!');
    }
    
    // Password toggle
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Enter key to submit
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRegister();
            }
        });
    }
    
    console.log('Event listeners setup complete');
}

// Handle registration
async function handleRegister() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Attempting registration for:', email);
    
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
    
    if (!password) {
        showAlert('Please enter your password', 'error');
        passwordInput.focus();
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        passwordInput.focus();
        return;
    }
    
    // Disable button and show loading
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    try {
        const auth = firebase.auth();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        console.log('Registration successful!');
        console.log('User:', userCredential.user.email);
        
        // Create user document in Firestore
        await createUserDocument(userCredential.user);
        
        console.log('User document created, now signing out...');
        
        // Sign out the user so they must login manually
        await auth.signOut();
        
        console.log('User signed out successfully');
        
        showAlert('Account created successfully! Redirecting to login...', 'success');
        
        // Wait a bit to ensure sign out is complete, then redirect
        setTimeout(() => {
            console.log('Redirecting to login page...');
            window.location.replace('/login.html'); // Use replace instead of href to prevent back button issues
        }, 2000);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Failed to create account';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email already registered. Please login instead.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Use at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password registration is not enabled.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Failed to create account: ${error.message}`;
        }
        
        showAlert(errorMessage, 'error');
        
        // Re-enable button
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Create account';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    console.log('Starting Google sign-in...');
    googleSignInBtn.disabled = true;
    const originalHTML = googleSignInBtn.innerHTML;
    googleSignInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    
    try {
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add scopes
        provider.addScope('email');
        provider.addScope('profile');
        
        // Set custom parameters
        provider.setCustomParameters({
            'prompt': 'select_account'
        });
        
        console.log('Opening Google sign-in popup...');
        const result = await auth.signInWithPopup(provider);
        
        console.log('Google sign-in successful on REGISTER page!');
        console.log('User:', result.user.email);
        
        // Create or update user document
        await createUserDocument(result.user);
        
        console.log('User document created, now signing out...');
        
        // Sign out the user so they must login manually (consistent with email/password registration)
        await auth.signOut();
        
        console.log('User signed out successfully');
        
        showAlert('Account created successfully! Please login with your Google account.', 'success');
        
        // Redirect to login page so user can login again
        setTimeout(() => {
            console.log('Redirecting to login page...');
            window.location.replace('/login.html');
        }, 2000);
        
    } catch (error) {
        console.error('=== Google Sign-In Error ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Failed to login with Google';
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Login cancelled';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = `Domain not authorized. Add "${window.location.hostname}" in Firebase Console → Authentication → Settings → Authorized domains`;
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Request cancelled. Another popup is already open.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Google Sign-In not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Failed to login with Google: ${error.message}`;
        }
        
        showAlert(errorMessage, 'error');
        
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = originalHTML;
    }
}

// Create user document in Firestore
async function createUserDocument(user) {
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Create new user document
            await userRef.set({
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            console.log('User document created');
        } else {
            // Update last login time
            await userRef.update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            console.log('User document updated');
        }
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const icon = togglePassword.querySelector('i');
    if (type === 'password') {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
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
