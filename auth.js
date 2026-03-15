// Show/Hide Forms
function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = 'block';
    }
});

// Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            username: username,
            email: email,
            photoURL: '',
            bio: '',
            followersCount: 0,
            followingCount: 0,
            likesCount: 0,
            videoCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.location.href = 'index.html';
    } catch (error) {
        errorDiv.innerText = error.message;
        errorDiv.style.display = 'block';
    }
});

// Check if already logged in
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});

// Logout Function
async function logout() {
    await auth.signOut();
    window.location.href = 'login.html';
}