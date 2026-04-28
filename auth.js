// ===== CONFIGURATION FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyBYKeXpqIHzxvB8byZ-ujozhcrKRTpSibE",
    authDomain: "planning-famille-cda1a.firebaseapp.com",
    databaseURL: "https://planning-famille-cda1a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "planning-famille-cda1a",
    storageBucket: "planning-famille-cda1a.firebasestorage.app",
    messagingSenderId: "720570302220",
    appId: "1:720570302220:web:d8e830783665b1ed2cd329",
    measurementId: "G-ZK8WGQW19G"
};

// ===== INITIALISATION =====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

console.log("✅ Firebase initialisé!");

// ===== FONCTIONS UTILITAIRES =====
function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (msg) {
        msg.textContent = text;
        msg.className = 'message ' + type;
    }
}

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const headerText = document.getElementById('headerText');
    
    loginForm.classList.toggle('hidden-form');
    signupForm.classList.toggle('hidden-form');
    
    headerText.textContent = loginForm.classList.contains('hidden-form') 
        ? 'Créer un nouveau compte' 
        : 'Se connecter';
    
    document.getElementById('message').innerHTML = '';
}

// ===== CONNEXION =====
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log("🔐 Tentative de connexion:", email);
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Connexion réussie:", userCredential.user.email);
            showMessage('✅ Connexion réussie! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch((error) => {
            console.error("❌ Erreur connexion:", error.code, error.message);
            
            if (error.code === 'auth/user-not-found') {
                showMessage('❌ Aucun compte avec cet email', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showMessage('❌ Mot de passe incorrect', 'error');
            } else if (error.code === 'auth/invalid-email') {
                showMessage('❌ Email invalide', 'error');
            } else if (error.code === 'auth/invalid-credential') {
                showMessage('❌ Email ou mot de passe incorrect', 'error');
            } else {
                showMessage('❌ ' + error.message, 'error');
            }
        });
}

// ===== INSCRIPTION =====
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    if (password.length < 6) {
        showMessage('❌ Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    console.log("📝 Tentative de création de compte:", email);
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Compte créé:", userCredential.user.email);
            
            // Créer la famille dans la base de données
            return database.ref('families/' + userCredential.user.uid).set({
                owner: email,
                ownerName: name,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            console.log("✅ Famille créée dans la base de données");
            showMessage('✅ Compte créé avec succès! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch((error) => {
            console.error("❌ Erreur inscription:", error.code, error.message);
            
            if (error.code === 'auth/email-already-in-use') {
                showMessage('❌ Cet email est déjà utilisé', 'error');
            } else if (error.code === 'auth/invalid-email') {
                showMessage('❌ Email invalide', 'error');
            } else if (error.code === 'auth/weak-password') {
                showMessage('❌ Mot de passe trop faible (6 caractères min)', 'error');
            } else {
                showMessage('❌ ' + error.message, 'error');
            }
        });
}
