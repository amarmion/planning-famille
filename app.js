import { initializeUsers, loginWithPin, logout, getCurrentUser } from "./auth.js";
import { 
  listenToUserEvents, listenToSharedEvents, addEvent, deleteEvent, updateEvent, shareEvent, unshareEvent,
  listenToUserTasks, addTask, deleteTask, toggleTask 
} from "./database.js";

let currentUser = null;
let unsubscribeEvents = null;
let unsubscribeTasks = null;

// 🔄 INITIALISER L'APP
window.addEventListener("load", async () => {
  console.log("🚀 Initialisation de l'app...");
  await initializeUsers();
});

// 👤 SÉLECTIONNER UN UTILISATEUR
window.selectUser = function(username) {
  document.getElementById("pinInput").style.display = "block";
  document.getElementById("pinField").focus();
  document.getElementById("pinField").dataset.username = username;
};

// 🔐 SE CONNECTER
window.login = async function() {
  const username = document.getElementById("pinField").dataset.username;
  const pin = document.getElementById("pinField").value;

  try {
    currentUser = await loginWithPin(username, pin);
    showMainScreen();
    loadUserData();
    setupRealtimeListeners();
  } catch (error) {
    showError(error.message);
  }
};

// ❌ ANNULER LA CONNEXION
window.cancelLogin = function() {
  document.getElementById("pinInput").style.display = "none";
  document.getElementById("pinField").value = "";
};

// 🚪 SE DÉCONNECTER
window.logout = async function() {
  if (unsubscribeEvents) unsubscribeEvents();
  if (unsubscribeTasks) unsubscribeTasks();
  
  await logout();
  currentUser = null;
  document.getElementById("loginScreen").classList.add("active");
  document.getElementById("mainScreen").classList.remove("active");
  document.getElementById("pinField").value = "";
};

// 🎯 AFFICHER L'ÉCRAN PRINCIPAL
function showMainScreen() {
  document.getElementById("loginScreen").classList.remove("active");
  document.getElementById("mainScreen").classList.add("active");
  document.getElementById("userName").textContent = currentUser.nom;
  
  // Afficher les boutons selon le rôle
  const isParent = currentUser.role === "parent";
  document.getElementById("parentOptions").style.display = isParent ? "block" : "none";
  document.getElementById("parentTaskOptions").style.display = isParent ? "block" : "none";
}

// 📡 ÉCOUTER LES CHANGEMENTS EN TEMPS RÉEL
function setupRealtimeListeners() {
  if (currentUser.role === "consultation") {
    // Papi/Mamie voient seulement les événements partagés
    unsubscribeEvents = listenToSharedEvents((events) => {
      displayEvents(events);
    });
  } else {
    // Alban et Elodie voient leurs propres événements
    unsubscribeEvents = listenToUserEvents(currentUser.email, (events) => {
      displayEvents(events);
    });
    
    // Écouter les tâches
    unsubscribeTasks = listenToUserTasks(currentUser.email, (tasks) => {
      displayTasks(tasks);
    });
  }
}

// 📋 CHARGER LES DONNÉES INITIALES
function loadUserData() {
  if (currentUser.role === "consultation") {
    listenToSharedEvents((events) => {
      displayEvents(events);
    });
  } else {
    listenToUserEvents(currentUser.email, (events) => {
      displayEvents(events);
    });
    listenToUserTasks(currentUser.email, (tasks) => {
      displayTasks(tasks);
    });
  }
}

// ========== GESTION DES ÉVÉNEMENTS ==========

window.showAddEventForm = function() {
  document.getElementById("addEventForm").style.display = "block";
};

window.closeEventForm = function() {
  document.getElementById("addEventForm").style.display = "none";
  clearEventForm();
};

function clearEventForm() {
  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("eventTime").value = "";
  document.getElementById("eventDesc").value = "";
  document.getElementById("eventShare").checked = false;
}

window.saveEvent = async function() {
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const desc = document.getElementById("eventDesc").value;
  const share = document.getElementById("eventShare").checked;

  if (!title || !date) {
    alert("⚠️ Titre et date requis");
    return;
  }

  const eventData = {
    title,
    date,
    time: time || "00:00",
    description: desc,
    shared: share
  };

  try {
    await addEvent(currentUser.email, eventData);
    
    // Si partagé, ajouter à shared_events
    if (share) {
      await shareEvent(currentUser.email, Date.now(), eventData);
    }
    
    closeEventForm();
    console.log("✅ Événement créé");
  } catch (error) {
    alert("❌ Erreur: " + error.message);
  }
};

function displayEvents(events) {
  const eventsList = document.getElementById("eventsList");
  eventsList.innerHTML = "";

  if (events.length === 0) {
    eventsList.innerHTML = "<p class='empty'>Aucun événement</p>";
    return;
  }

  // Trier par date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach(event => {
    const eventEl = document.createElement("div");
    eventEl.className = "event-card";
    
    const dateStr = new Date(event.date).toLocaleDateString("fr-FR");
    const isShared = event.shared ? "📤" : "";
    
    eventEl.innerHTML = `
      <div class="event-header">
        <h3>${isShared} ${event.title}</h3>
        ${currentUser.role === "parent" ? `
          <button class="delete-btn" onclick="deleteEventHandler('${event.id}')">🗑️</button>
        ` : ""}
      </div>
      <p class="event-date">📅 ${dateStr} ${event.time}</p>
      ${event.description ? `<p class="event-desc">${event.description}</p>` : ""}
    `;
    
    eventsList.appendChild(eventEl);
  });
}

window.deleteEventHandler = async function(eventId) {
  if (confirm("Supprimer cet événement ?")) {
    try {
      await deleteEvent(currentUser.email, eventId);
      // Aussi retirer du partage
      await unshareEvent(currentUser.email, eventId);
      console.log("✅ Événement supprimé");
    } catch (error) {
      alert("❌ Erreur: " + error.message);
    }
  }
};

// ========== GESTION DES TÂCHES ==========

window.showAddTaskForm = function() {
  document.getElementById("addTaskForm").style.display = "block";
};

window.closeTaskForm = function() {
  document.getElementById("addTaskForm").style.display = "none";
  clearTaskForm();
};

function clearTaskForm() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDueDate").value = "";
}

window.saveTask = async function() {
  const title = document.getElementById("taskTitle").value;
  const dueDate = document.getElementById("taskDueDate").value;

  if (!title) {
    alert("⚠️ Description requise");
    return;
  }

  try {
    await addTask(currentUser.email, {
      title,
      dueDate: dueDate || null
    });
    closeTaskForm();
    console.log("✅ Tâche créée");
  } catch (error) {
    alert("❌ Erreur: " + error.message);
  }
};

function displayTasks(tasks) {
  const tasksList = document.getElementById("tasksList");
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.innerHTML = "<p class='empty'>Aucune tâche</p>";
    return;
  }

  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = `task-card ${task.completed ? "completed" : ""}`;
    
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString("fr-FR") : "";
    
    taskEl.innerHTML = `
      <div class="task-content">
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleTaskHandler('${task.id}', ${task.completed})">
        <span class="task-title">${task.title}</span>
      </div>
      ${dueDate ? `<p class="task-date">📅 ${dueDate}</p>` : ""}
      ${currentUser.role === "parent" ? `
        <button class="delete-btn" onclick="deleteTaskHandler('${task.id}')">🗑️</button>
      ` : ""}
    `;
    
    tasksList.appendChild(taskEl);
  });
}

window.toggleTaskHandler = async function(taskId, currentStatus) {
  try {
    await toggleTask(currentUser.email, taskId, currentStatus);
  } catch (error) {
    alert("❌ Erreur: " + error.message);
  }
};

window.deleteTaskHandler = async function(taskId) {
  if (confirm("Supprimer cette tâche ?")) {
    try {
      await deleteTask(currentUser.email, taskId);
      console.log("✅ Tâche supprimée");
    } catch (error) {
      alert("❌ Erreur: " + error.message);
    }
  }
};

// ========== NAVIGATION ==========

window.switchTab = function(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  
  document.getElementById(tab + "Tab").classList.add("active");
  event.target.classList.add("active");
};

// ========== AFFICHAGE DES ERREURS ==========

function showError(message) {
  const errorDiv = document.getElementById("errorMsg");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 4000);
}
