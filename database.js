import { database } from "./firebase-config.js";
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// 📅 AJOUTER UN ÉVÉNEMENT
export async function addEvent(userEmail, event) {
  const eventRef = ref(database, `events/${userEmail}/${new Date().getTime()}`);
  return push(eventRef, {
    ...event,
    createdAt: new Date().toISOString(),
    createdBy: userEmail
  });
}

// ❌ SUPPRIMER UN ÉVÉNEMENT
export async function deleteEvent(userEmail, eventId) {
  const eventRef = ref(database, `events/${userEmail}/${eventId}`);
  return remove(eventRef);
}

// ✏️ MODIFIER UN ÉVÉNEMENT
export async function updateEvent(userEmail, eventId, updates) {
  const eventRef = ref(database, `events/${userEmail}/${eventId}`);
  return update(eventRef, updates);
}

// 👁️ ÉCOUTER LES ÉVÉNEMENTS DE L'UTILISATEUR (temps réel)
export function listenToUserEvents(userEmail, callback) {
  const eventsRef = ref(database, `events/${userEmail}`);
  return onValue(eventsRef, (snapshot) => {
    const events = [];
    snapshot.forEach((childSnapshot) => {
      events.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(events);
  });
}

// 👁️ ÉCOUTER LES ÉVÉNEMENTS PARTAGÉS (pour Papi/Mamie)
export function listenToSharedEvents(callback) {
  const sharedRef = ref(database, "shared_events");
  return onValue(sharedRef, (snapshot) => {
    const events = [];
    snapshot.forEach((childSnapshot) => {
      events.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(events);
  });
}

// 📤 PARTAGER UN ÉVÉNEMENT (visible à Papi/Mamie)
export async function shareEvent(userEmail, eventId, eventData) {
  const sharedRef = ref(database, `shared_events/${userEmail}-${eventId}`);
  return update(sharedRef, {
    ...eventData,
    sharedBy: userEmail,
    sharedAt: new Date().toISOString()
  });
}

// 🚫 RETIRER UN ÉVÉNEMENT DU PARTAGE
export async function unshareEvent(userEmail, eventId) {
  const sharedRef = ref(database, `shared_events/${userEmail}-${eventId}`);
  return remove(sharedRef);
}

// 📝 AJOUTER UNE TÂCHE
export async function addTask(userEmail, task) {
  const taskRef = ref(database, `tasks/${userEmail}/${new Date().getTime()}`);
  return push(taskRef, {
    ...task,
    completed: false,
    createdAt: new Date().toISOString()
  });
}

// ❌ SUPPRIMER UNE TÂCHE
export async function deleteTask(userEmail, taskId) {
  const taskRef = ref(database, `tasks/${userEmail}/${taskId}`);
  return remove(taskRef);
}

// ✏️ MARQUER TÂCHE COMME COMPLÉTÉE
export async function toggleTask(userEmail, taskId, completed) {
  const taskRef = ref(database, `tasks/${userEmail}/${taskId}`);
  return update(taskRef, { completed: !completed });
}

// 👁️ ÉCOUTER LES TÂCHES DE L'UTILISATEUR
export function listenToUserTasks(userEmail, callback) {
  const tasksRef = ref(database, `tasks/${userEmail}`);
  return onValue(tasksRef, (snapshot) => {
    const tasks = [];
    snapshot.forEach((childSnapshot) => {
      tasks.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(tasks);
  });
}
