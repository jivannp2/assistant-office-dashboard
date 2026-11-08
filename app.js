// ==========================================================================
// AetherCore Virtual Assistant Office Dashboard - app.js
// ==========================================================================

const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Compile Microservice Dependency Graph v3",
    dept: "tech",
    status: "in-progress",
    priority: "high"
  },
  {
    id: "task-2",
    title: "Process VIP Client Onboarding Batch #14",
    dept: "operations",
    status: "pending",
    priority: "normal"
  },
  {
    id: "task-3",
    title: "Rotate SSL Certificates for Edge Clusters",
    dept: "server",
    status: "completed",
    priority: "urgent"
  },
  {
    id: "task-4",
    title: "Fine-tune Agent Embedding Vector Indices",
    dept: "ai",
    status: "in-progress",
    priority: "high"
  }
];

const INITIAL_AUTOMATIONS = [
  {
    id: "auto-1",
    dept: "tech",
    name: "Auto-PR Refactor Bot",
    desc: "Scans repository for lint issues and submits PR fixes",
    enabled: true,
    lastRun: "2 mins ago"
  },
  {
    id: "auto-2",
    dept: "operations",
    name: "Escalation Router",
    desc: "Auto-assigns incoming client tickets based on SLA urgency",
    enabled: true,
    lastRun: "Just now"
  },
  {
    id: "auto-3",
    dept: "server",
    name: "Cluster Auto-Scaler",
    desc: "Spins up Kubernetes worker pods during traffic spikes",
    enabled: true,
    lastRun: "14 mins ago"
  },
  {
    id: "auto-4",
    dept: "ai",
    name: "Continuous Context Harmonizer",
    desc: "Aligns memory vectors across all autonomous agents",
    enabled: false,
    lastRun: "1 hr ago"
  }
];

// App State
let tasks = [...INITIAL_TASKS];
let automations = [...INITIAL_AUTOMATIONS];
let activeDeptFilter = "all";
let activeTaskChipFilter = "all";

// DOM Elements
const navBtns = document.querySelectorAll(".nav-btn");
const tasksListEl = document.getElementById("tasks-list");
const automationsListEl = document.getElementById("automations-list");
const auditLogStreamEl = document.getElementById("audit-log-stream");
const toastEl = document.getElementById("toast");
const quickTriggerBtn = document.getElementById("quick-trigger-btn");
const addTaskTrigger = document.getElementById("add-task-trigger");
const taskModal = document.getElementById("task-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const newTaskForm = document.getElementById("new-task-form");
const cancelTaskBtn = document.getElementById("cancel-task-btn");
const clearLogsBtn = document.getElementById("clear-logs-btn");
const filterChips = document.querySelectorAll(".chip");
const floorZones = document.querySelectorAll(".floor-zone");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  renderAutomations();
  seedAuditLogs();
  setupEventListeners();
  startMetricsTicker();
});

// Toast notification helper
let toastTimeout = null;
function showToast(message) {
  if (!toastEl) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastTimeout = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 3200);
}

// Log stream appender
function appendLog(dept, message) {
  if (!auditLogStreamEl) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-badge log-badge-${dept}">${dept}</span>
    <span class="log-msg">${escapeHtml(message)}</span>
  `;
  auditLogStreamEl.prepend(entry);

  while (auditLogStreamEl.children.length > 35) {
    auditLogStreamEl.removeChild(auditLogStreamEl.lastChild);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function seedAuditLogs() {
  appendLog("tech", "Docker build image v2.14 passed all unit tests (452 passed)");
  appendLog("operations", "14 VIP client queries routed to Dedicated Escalation Pod");
  appendLog("server", "Cluster [us-east] completed disk garbage collection: freed 1.4GB");
  appendLog("ai", "Harmonized vector index across 6 agent pods");
}

// Event Listeners setup
function setupEventListeners() {
  // Navigation Tabs filter
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeDeptFilter = btn.dataset.dept || "all";
      activeTaskChipFilter = activeDeptFilter;
      syncChipState();
      highlightFloorZone(activeDeptFilter);
      renderTasks();
      showToast(`Switched view: ${activeDeptFilter.toUpperCase()}`);
    });
  });

  // Floor zone cabin clicks
  floorZones.forEach(zone => {
    zone.addEventListener("click", () => {
      const targetDept = zone.dataset.target;
      if (!targetDept) return;
      
      navBtns.forEach(b => {
        b.classList.toggle("active", b.dataset.dept === targetDept);
      });
      activeDeptFilter = targetDept;
      activeTaskChipFilter = targetDept;
      syncChipState();
      highlightFloorZone(targetDept);
      renderTasks();
      showToast(`Selected Cabin: ${targetDept.toUpperCase()}`);
    });
  });

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeTaskChipFilter = chip.dataset.filter;
      renderTasks();
    });
  });

  // Quick Run All Automations
  if (quickTriggerBtn) {
    quickTriggerBtn.addEventListener("click", () => {
      showToast("Dispatching all active assistant automations...");
      appendLog("ai", "Global automation cycle initiated by supervisor");
      setTimeout(() => {
        appendLog("tech", "All unit tests green across 4 microservices");
        appendLog("operations", "Queue cleared: 0 pending tickets");
        appendLog("server", "All edge nodes healthy & responding under 15ms");
        showToast("All automation daemons completed successfully!");
      }, 1500);
    });
  }

  // Modal handlers
  if (addTaskTrigger && taskModal) {
    addTaskTrigger.addEventListener("click", () => {
      taskModal.classList.remove("hidden");
    });
  }

  if (closeModalBtn && taskModal) {
    closeModalBtn.addEventListener("click", () => {
      taskModal.classList.add("hidden");
    });
  }

  if (cancelTaskBtn && taskModal) {
    cancelTaskBtn.addEventListener("click", () => {
      taskModal.classList.add("hidden");
    });
  }

  if (newTaskForm) {
    newTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("task-name");
      const deptSelect = document.getElementById("task-dept");
      const prioritySelect = document.getElementById("task-priority");

      if (!titleInput.value.trim()) return;

      const newTask = {
        id: "task-" + Date.now(),
        title: titleInput.value.trim(),
        dept: deptSelect.value,
        status: "in-progress",
        priority: prioritySelect.value
      };

      tasks.unshift(newTask);
      renderTasks();
      taskModal.classList.add("hidden");
      newTaskForm.reset();
      showToast(`Task dispatched to ${newTask.dept.toUpperCase()} pod`);
      appendLog(newTask.dept, `New task dispatched: "${newTask.title}"`);
    });
  }

  if (clearLogsBtn && auditLogStreamEl) {
    clearLogsBtn.addEventListener("click", () => {
      auditLogStreamEl.innerHTML = "";
      showToast("Audit log stream cleared");
    });
  }
}

function syncChipState() {
  filterChips.forEach(c => {
    c.classList.toggle("active", c.dataset.filter === activeTaskChipFilter);
  });
}

function highlightFloorZone(dept) {
  floorZones.forEach(zone => {
    if (dept === "all" || zone.dataset.target === dept) {
      zone.classList.add("active");
    } else {
      zone.classList.remove("active");
    }
  });
}

// Render Tasks
function renderTasks() {
  if (!tasksListEl) return;
  
  const filtered = tasks.filter(t => {
    if (activeTaskChipFilter !== "all" && t.dept !== activeTaskChipFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    tasksListEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 32px 0;">No active tasks found for this department.</div>`;
    return;
  }

  tasksListEl.innerHTML = filtered.map(task => `
    <div class="task-card">
      <div class="task-header">
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="task-dept-badge badge-${task.dept}">${task.dept}</span>
      </div>
      <div class="task-footer">
        <span class="task-priority priority-${task.priority}">Priority: ${task.priority.toUpperCase()}</span>
        <button class="btn-secondary btn-sm" onclick="completeTask('${task.id}')">Complete</button>
      </div>
    </div>
  `).join("");
}

window.completeTask = function(taskId) {
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    const finished = tasks[index];
    tasks.splice(index, 1);
    renderTasks();
    showToast(`Task completed: "${finished.title}"`);
    appendLog(finished.dept, `Completed task: ${finished.title}`);
  }
};

// Render Automations
function renderAutomations() {
  if (!automationsListEl) return;

  automationsListEl.innerHTML = automations.map(auto => `
    <div class="automation-card">
      <div class="automation-info">
        <span class="automation-name">${escapeHtml(auto.name)}</span>
        <span class="automation-desc">${escapeHtml(auto.desc)}</span>
      </div>
      <label class="switch">
        <input type="checkbox" ${auto.enabled ? "checked" : ""} onchange="toggleAutomation('${auto.id}', this.checked)">
        <span class="slider"></span>
      </label>
    </div>
  `).join("");
}

window.toggleAutomation = function(autoId, isEnabled) {
  const auto = automations.find(a => a.id === autoId);
  if (auto) {
    auto.enabled = isEnabled;
    showToast(`${auto.name} is now ${isEnabled ? "Enabled" : "Disabled"}`);
    appendLog(auto.dept, `Automation daemon ${auto.name} ${isEnabled ? "started" : "stopped"}`);
  }
};

// Periodic mock activity ticker
function startMetricsTicker() {
  setInterval(() => {
    const randomDepts = ["tech", "operations", "server", "ai"];
    const randomDept = randomDepts[Math.floor(Math.random() * randomDepts.length)];
    const sampleMsgs = {
      tech: ["Refactored 3 async functions in core API", "Ran static code analysis scan"],
      operations: ["Processed customer onboarding form queue", "Dispatched weekly summary digest"],
      server: ["Heartbeat ping check passed across 12 zones", "Cache memory cleanup completed"],
      ai: ["Updated embedding vector cache", "Optimized inference prompt templates"]
    };
    const msgs = sampleMsgs[randomDept];
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    appendLog(randomDept, randomMsg);
  }, 18000);
}
