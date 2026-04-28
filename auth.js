import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Comptes utilisateurs (email + PIN)
const USERS = {
  alban: { email: "alban@famille.local", pin: "1234", role: "parent", nom: "Alban 👨" },
  elodie: { email: "elodie@famille.local", pin: "5678", role: "parent", nom: "Elodie 👩" },
  papimamie: { email: "papimamie@famille.local", pin: "0000", role: "consultation", nom: "Papi/Mamie 👴👵" }
};

// Créer les comptes au premier lancement
export async function initializeUsers() {
  for (const [key, user] of Object.entries(USERS)) {
    try {
      await createUserWithEmailAndPassword(auth, user.email, `pin-${user.pin}`);
      console.log(`✅ Compte créé: ${user.nom}`);
    } catch (error) {
      if (error.code !== "auth/email-already-in-use") {
        console.log(`⚠️ ${user.email} existe déjà`);
      }
    }
  }
}

// Connexion par PIN
export async function loginWithPin(username, pin) {
  const user = USERS[username];
  if (!user || user.pin !== pin) {
    throw new Error("❌ Utilisateur ou PIN incorrect");
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, user.email, `pin-${pin}`);
    console.log(`✅ Connecté: ${user.nom}`);
    return {
      uid: credential.user.uid,
      username: username,
      nom: user.nom,
      role: user.role,
      email: user.email
    };
  } catch (error) {
    throw new Error("❌ Erreur de connexion");
  }
}

// Déconnexion
export async function logout() {
  await signOut(auth);
  console.log("✅ Déconnecté");
}

// Récupérer infos utilisateur
export function getCurrentUser() {
  return auth.currentUser;
}
