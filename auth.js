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

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

console.log("✅ Firebase initialisé!");

// ===== FONCTION: AFFICHER LES MESSAGES =====
function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (msg) {
        msg.textContent = text;
        msg.className = 'message ' + type;
    }
}

// ===== FONCTION: BASCULER ENTRE FORMULAIRES =====
function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const headerText = document.getElementById('headerText');
    
    if (loginForm && signupForm) {
        loginForm.classList.toggle('hidden-form');
        signupForm.classList.toggle('hidden-form');
        
        headerText.textContent = loginForm.classList.contains('hidden-form') 
            ? 'Créer un nouveau compte' 
            : 'Se connecter';
        
        document.getElementById('message').innerHTML = '';
    }
}

// ===== FONCTION: CONNEXION =====
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        showMessage('❌ Veuillez remplir tous les champs', 'error');
        return;
    }
    
    console.log("🔄 Tentative de connexion...");
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log("✅ Connexion réussie!");
            showMessage('✅ Connexion réussie! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        })
        .catch((error) => {
            console.error("❌ Erreur connexion:", error);
            showMessage('❌ Email ou mot de passe incorrect', 'error');
        });
}

// ===== FONCTION: INSCRIPTION =====
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    if (!name || !email || !password) {
        showMessage('❌ Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('❌ Le mot de passe doit faire au moins 6 caractères', 'error');
        return;
    }
    
    console.log("🔄 Création du compte...");
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
            console.log("✅ Compte créé!");
            
            // Sauvegarder les infos dans la base de données
            database.ref('families/' + result.user.uid).set({
                owner: email,
                ownerName: name,
                createdAt: new Date().toISOString(),
                members: [{
                    id: result.user.uid,
                    name: name,
                    email: email
                }]
            })
            .then(() => {
                console.log("✅ Données sauvegardées!");
                showMessage('✅ Compte créé! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            })
            .catch((dbError) => {
                console.error("❌ Erreur base de données:", dbError);
                showMessage('❌ Erreur sauvegarde: ' + dbError.message, 'error');
            });
        })
        .catch((error) => {
            console.error("❌ Erreur création compte:", error);
            
            if (error.code === 'auth/email-already-in-use') {
                showMessage('❌ Cet email est déjà utilisé', 'error');
            } else if (error.code === 'auth/invalid-email') {
                showMessage('❌ Email invalide', 'error');
            } else {
                showMessage('❌ Erreur: ' + error.message, 'error');
            }
        });
}

// ===== FONCTION: VÉRIFIER SI CONNECTÉ =====
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("✅ Utilisateur connecté:", user.email);
            // L'utilisateur est connecté, rediriger vers index.html
            if (window.location.pathname.includes('login.html')) {
                window.location.href = "index.html";
            }
        } else {
            console.log("❌ Utilisateur non connecté");
            // L'utilisateur n'est pas connecté
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = "login.html";
            }
        }
    });
}

// ===== FONCTION: DÉCONNEXION =====
function handleLogout() {
    auth.signOut()
        .then(() => {
            console.log("✅ Déconnecté!");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("❌ Erreur déconnexion:", error);
        });
}
