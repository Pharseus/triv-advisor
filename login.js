// Login Page JavaScript

// DOM Elements
let emailInput;
let passwordInput;
let loginBtn;
let googleSignInBtn;
let togglePassword;
let alertBox;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded!');
        return;
    }
    
    // Initialize DOM elements
    emailInput = document.getElementById('emailInput');
    passwordInput = document.getElementById('passwordInput');
    loginBtn = document.getElementById('loginBtn');
    googleSignInBtn = document.getElementById('googleSignInBtn');
    togglePassword = document.getElementById('togglePassword');
    alertBox = document.getElementById('alertBox');
    
    // Check if user is already logged in
    checkAuthState();
    
    // Setup event listeners
    setupEventListeners();
});

// Check authentication state
function checkAuthState() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User already logged in:', user.email);
            // Redirect to main page
            window.location.href = '/index.html';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Google Sign-In button
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', signInWithGoogle);
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
                handleLogin();
            }
        });
    }
}

// Handle login
async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Attempting login for:', email);
    
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
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const auth = firebase.auth();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log('Login successful!');
        console.log('User:', userCredential.user.email);
        
        // Create or update user document
        await createUserDocument(userCredential.user);
        
        console.log('User document saved, redirecting to index.html...');
        
        showAlert('Login successful! Redirecting...', 'success');
        
        // Explicit redirect after successful login
        setTimeout(() => {
            window.location.replace('/index.html');
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Failed to login';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Email not registered. Please sign up first.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Wrong password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        showAlert(errorMessage, 'error');
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Log In';
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
        
        console.log('Google sign-in successful!');
        console.log('User:', result.user.email);
        
        // Create or update user document
        await createUserDocument(result.user);
        
        console.log('User document saved, redirecting to index.html...');
        
        showAlert('Login successful! Redirecting...', 'success');
        
        // Explicit redirect after successful login
        setTimeout(() => {
            window.location.replace('/index.html');
        }, 1000);
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
