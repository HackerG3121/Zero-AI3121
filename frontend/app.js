// app.js - Main Frontend Controller for Zero AI College Assistant

// App Configuration & Global State
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
  ? 'http://localhost:8000' 
  : 'https://zero-ai-nzqw.onrender.com';

let appState = {
  student: null,
  attendance: null,
  timetable: null,
  exams: null,
  assignments: [],            
  placements: null,
  faculty: [],
  navigation: [],
  chatHistory: [], // Current session messages
  savedSessions: [], // Saved history list
  activeSessionId: null,
  settings: {
    theme: 'dark',
    ttsEnabled: false,
    apiKey: ''
  },
  notifications: [
    { id: 1, type: 'assignment', text: 'Applied Physics Assignment: Fiber Optics due in 2 days.', time: '10 mins ago', unread: true },
    { id: 2, type: 'exam', text: 'Internal Assessment 2 hall ticket is available for download.', time: '2 hours ago', unread: true },
    { id: 3, type: 'placement', text: 'Google Software Intern Drive date announced: Aug 1.', time: '1 day ago', unread: false }
  ]
};

// --- DOM ELEMENTS ---
const viewPanes = document.querySelectorAll('.view-pane');
const menuItems = document.querySelectorAll('.menu-item, .nav-item');
const viewTitle = document.getElementById('viewTitle');
const themeToggle = document.getElementById('themeToggle');
const greetingText = document.getElementById('greetingText');
const notiCountBadge = document.getElementById('notiCount');

// Chat DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const btnSendMessage = document.getElementById('btnSendMessage');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const btnTtsToggle = document.getElementById('btnTtsToggle');
const chatSuggestions = document.getElementById('chatSuggestions');
const chatTypingIndicator = document.getElementById('chatTypingIndicator');
const btnClearChat = document.getElementById('btnClearChat');
const btnExportPdf = document.getElementById('btnExportPdf');
const btnDownloadMd = document.getElementById('btnDownloadMd');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  loadLocalSettings();
  initPwaInstaller();
  setupNavigation();
  setupEventListeners();
  loadData();
  runCountdownClocks();
});

// --- PWA CONFIGURATION & INSTALL PROMPT ---
let deferredPrompt;
function initPwaInstaller() {
  const installBanner = document.getElementById('installBanner');
  const btnInstall = document.getElementById('btnInstall');
  const btnDismissInstall = document.getElementById('btnDismissInstall');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
  });

  btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installBanner.classList.add('hidden');
    }
  });

  btnDismissInstall.addEventListener('click', () => {
    installBanner.classList.add('hidden');
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    });
  }
}

// --- CONFIG & THEME SWITCHING ---
function loadLocalSettings() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const savedTts = localStorage.getItem('ttsEnabled') === 'true';
  const savedApiKey = localStorage.getItem('geminiApiKey') || '';
  
  appState.settings.theme = savedTheme;
  appState.settings.ttsEnabled = savedTts;
  appState.settings.apiKey = savedApiKey;
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  // Update checkbox states in UI settings pane
  const themeCheckbox = document.getElementById('settingsThemeCheckbox');
  if (themeCheckbox) themeCheckbox.checked = savedTheme === 'light';
  
  const ttsCheckbox = document.getElementById('settingsTtsCheckbox');
  if (ttsCheckbox) ttsCheckbox.checked = savedTts;
  
  const apiKeyInput = document.getElementById('settingsApiKey');
  if (apiKeyInput) apiKeyInput.value = savedApiKey;
  
  updateTtsButtonState();

  // Load chat history sessions list from localStorage
  const savedHistory = localStorage.getItem('zeroAiHistory');
  if (savedHistory) {
    appState.savedSessions = JSON.parse(savedHistory);
  }
  
  // Set current session ID
  appState.activeSessionId = 'session_' + Date.now();
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'light') {
    icon.className = 'bi bi-sun-fill';
  } else {
    icon.className = 'bi bi-moon-fill';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  appState.settings.theme = newTheme;
  updateThemeIcon(newTheme);
  
  const themeCheckbox = document.getElementById('settingsThemeCheckbox');
  if (themeCheckbox) themeCheckbox.checked = newTheme === 'light';
}

function updateTtsButtonState() {
  if (appState.settings.ttsEnabled) {
    btnTtsToggle.innerHTML = '<i class="bi bi-volume-up-fill text-blue"></i>';
    btnTtsToggle.title = 'Mute Text-to-Speech';
  } else {
    btnTtsToggle.innerHTML = '<i class="bi bi-volume-mute"></i>';
    btnTtsToggle.title = 'Unmute Text-to-Speech';
  }
}

// --- DATA ACCESS & OFFLINE CACHING ---
async function fetchWithFallback(url, cacheKey) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn(`Fetch failed for ${url}, trying local cache.`, error);
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    throw error;
  }
}

async function loadData() {
  showLoadingState();
  try {
    // 1. Fetch dashboard overview and student profile
    const dashboard = await fetchWithFallback(`${API_BASE_URL}/api/dashboard`, 'zero_dashboard');
    appState.student = dashboard.student;
    
    // 2. Fetch other academic resources
    appState.attendance = await fetchWithFallback(`${API_BASE_URL}/api/attendance`, 'zero_attendance');
    appState.timetable = await fetchWithFallback(`${API_BASE_URL}/api/timetable`, 'zero_timetable');
    appState.exams = await fetchWithFallback(`${API_BASE_URL}/api/exams`, 'zero_exams');
    
    const rawAssignments = await fetchWithFallback(`${API_BASE_URL}/api/assignments`, 'zero_assignments');
    // If local state already has assignment modifications, use those. Otherwise load from fetched.
    const localAsg = localStorage.getItem('zero_assignments_state');
    if (localAsg) {
      appState.assignments = JSON.parse(localAsg);
    } else {
      appState.assignments = rawAssignments;
      localStorage.setItem('zero_assignments_state', JSON.stringify(rawAssignments));
    }
    
    appState.placements = await fetchWithFallback(`${API_BASE_URL}/api/placements`, 'zero_placements');
    appState.faculty = await fetchWithFallback(`${API_BASE_URL}/api/faculty`, 'zero_faculty');
    appState.navigation = await fetchWithFallback(`${API_BASE_URL}/api/navigation`, 'zero_navigation');
    
    // Render templates
    populateDashboard(dashboard);
    populateAttendance();
    populateTimetable();
    populateExams();
    populateAssignments();
    populatePlacements();
    populateFaculty();
    populateCampusNavigation();
    populateNotifications();
    populateProfile();
    populateHistory();
    
    console.log("All data successfully loaded.");
  } catch (err) {
    console.error("Critical error loading application data:", err);
    alert("Could not load latest campus records. Zero AI will run in offline mode using pre-cached mock information.");
  }
  hideLoadingState();
}

function showLoadingState() {
  // Can add a global blur or spinner over dashboard cards
}
function hideLoadingState() {
  // Hide spinner
}

// --- VIEW ROUTER ---
function setupNavigation() {
  const navigateToTab = (tabName) => {
    viewPanes.forEach(pane => {
      pane.classList.remove('active');
      if (pane.id === `view-${tabName}`) {
        pane.classList.add('active');
      }
    });

    menuItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      }
    });

    // Capitalize Title
    const titleText = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    viewTitle.innerText = tabName === 'home' ? 'Dashboard' : tabName === 'navigation' ? 'Campus Map' : titleText;
    
    // Auto-focus chat input if transitioning to chat
    if (tabName === 'chat') {
      setTimeout(() => chatInput.focus(), 100);
    }
  };

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1) || 'home';
    if (['home', 'chat', 'timetable', 'attendance', 'exams', 'assignments', 'placements', 'faculty', 'navigation', 'history', 'notifications', 'profile', 'settings'].includes(hash)) {
      navigateToTab(hash);
    }
  });

  // Handle direct link with hash on load
  const initialHash = window.location.hash.substring(1) || 'home';
  navigateToTab(initialHash);

  // Link click handlers for tab navigation
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-tab-trigger]');
    if (trigger) {
      const tabTarget = trigger.getAttribute('data-tab-trigger');
      window.location.hash = `#${tabTarget}`;
    }
  });
}

// --- DYNAMIC RENDERING ENGINES ---

// 1. Dashboard View
function populateDashboard(dbData) {
  // Greeting based on time of day
  const hours = new Date().getHours();
  let greet = "Good evening";
  if (hours < 12) greet = "Good morning";
  else if (hours < 17) greet = "Good afternoon";
  
  greetingText.innerHTML = `${greet}, <span class="logo-gradient">${dbData.student.name}</span>!`;
  
  // Set navbar identities
  const userPillImg = document.getElementById('userPillImg');
  const userPillName = document.getElementById('userPillName');
  const headerAvatar = document.getElementById('headerAvatar');
  
  if (userPillImg) userPillImg.src = dbData.student.profile_image;
  if (userPillName) userPillName.innerText = dbData.student.name;
  if (headerAvatar) headerAvatar.src = dbData.student.profile_image;
  
  // Card metrics
  document.getElementById('dashOverallAttendance').innerText = Math.round(dbData.overall_attendance);
  document.getElementById('dashAttendanceProgress').style.width = `${dbData.overall_attendance}%`;
  
  const alertText = document.getElementById('dashAttendanceAlert');
  if (dbData.overall_attendance < 75) {
    alertText.innerHTML = '<span class="text-danger">⚠️ Attendance below 75%! critical risk</span>';
  } else {
    alertText.innerText = 'Requirement is 75%';
  }
  
  document.getElementById('dashNextClass').innerText = dbData.next_class.split(' at ')[0];
  document.getElementById('dashNextClassRoom').innerText = dbData.next_class.split(' at ')[1] || 'Room A-302';
  
  // Recalculate pending assignments dynamically from local assignments array
  const pendingCount = appState.assignments.filter(a => a.status === 'Pending').length;
  document.getElementById('dashPendingAssignments').innerText = pendingCount;
  
  const asgAlert = document.getElementById('dashAssignmentAlert');
  if (pendingCount > 0) {
    asgAlert.className = 'stat-desc text-warning';
    asgAlert.innerText = `${pendingCount} urgent submissions pending`;
  } else {
    asgAlert.className = 'stat-desc text-success';
    asgAlert.innerText = 'All assignments completed!';
  }

  // Countdowns
  document.getElementById('dashExamCountdown').innerText = dbData.days_to_exams;
}

// 2. Attendance View
function populateAttendance() {
  if (!appState.attendance) return;
  const overall = appState.attendance.overall;
  
  // Dial values
  document.getElementById('attendanceDialText').textContent = `${overall}%`;
  
  // Calculate stroke-dashoffset: Circumference = 264. Offset = 264 * (1 - overall/100)
  const offset = 264 * (1 - overall / 100);
  document.getElementById('attendanceDialFill').style.strokeDashoffset = offset;
  
  // Status Badge
  const statusBadge = document.getElementById('attendanceSummaryStatus');
  if (overall >= 75) {
    statusBadge.className = 'badge badge-success';
    statusBadge.textContent = 'Safe';
  } else {
    statusBadge.className = 'badge badge-danger';
    statusBadge.textContent = 'Critical Condonation';
  }
  
  // Warning Banner
  const condonationAlert = document.getElementById('attendanceCondonationAlert');
  const criticalSubjectsCount = appState.attendance.subjects.filter(s => s.percentage < 75.0).length;
  
  if (overall < 75 || criticalSubjectsCount > 0) {
    condonationAlert.classList.remove('hidden');
    if (overall < 75) {
      condonationAlert.className = 'condonation-card border-danger';
      condonationAlert.innerHTML = `<h4>⚠️ Condonation Action Required</h4><p>Your overall attendance is <strong>${overall}%</strong>. This is below the required 75% threshold. You must submit proctor-signed medical logs to condone eligibility for semester exams.</p>`;
    } else {
      condonationAlert.className = 'condonation-card border-warning';
      condonationAlert.innerHTML = `<h4>⚠️ Low Attendance warning</h4><p>Your overall percentage is fine, but you have <strong>${criticalSubjectsCount} subject(s)</strong> falling below 75%. Improve attendance immediately in those sections.</p>`;
    }
  } else {
    condonationAlert.classList.add('hidden');
  }

  // Guidelines details
  document.getElementById('attendanceRequirementsText').innerText = appState.attendance.explanation;

  // Subjects lists
  const listContainer = document.getElementById('attendanceSubjectsList');
  listContainer.innerHTML = '';
  
  // Track total lectures and attended
  let totalAttended = 0;
  let totalLectures = 0;

  appState.attendance.subjects.forEach(subject => {
    totalAttended += subject.attended;
    totalLectures += subject.total;

    const isCritical = subject.percentage < 75.0;
    const badgeClass = isCritical ? 'badge-danger' : 'badge-success';
    const borderGlow = isCritical ? 'style="border-color: rgba(239, 68, 68, 0.25)"' : '';
    
    const card = document.createElement('div');
    card.className = 'subject-attendance-card glass-panel';
    if (isCritical) card.style.borderColor = 'rgba(239, 68, 68, 0.25)';
    
    card.innerHTML = `
      <div class="subject-attendance-header">
        <div>
          <h4>${subject.name}</h4>
          <span>${subject.code}</span>
        </div>
        <span class="badge ${badgeClass}">${subject.status}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${subject.percentage}%; background: ${isCritical ? '#ef4444' : 'var(--accent-grad)'}"></div>
      </div>
      <div class="attendance-percentage-row">
        <span class="value">${subject.percentage}%</span>
        <span class="lectures-count">${subject.attended}/${subject.total} lectures</span>
      </div>
    `;
    listContainer.appendChild(card);
  });
  
  document.getElementById('totalAttendedClasses').innerText = totalAttended;
  document.getElementById('totalClasses').innerText = totalLectures;
}

// 3. Timetable View
function populateTimetable() {
  if (!appState.timetable) return;

  const timetableDayList = document.getElementById('timetableDayList');
  const timetableWeekGridBody = document.getElementById('timetableWeekGridBody');
  const dayPills = document.querySelectorAll('.day-pill');
  const timetableSearch = document.getElementById('timetableSearch');
  
  let activeDay = "Monday";

  // Helper to render Day list
  const renderDaySchedule = (day, query = '') => {
    timetableDayList.innerHTML = '';
    const classes = appState.timetable.weekly[day] || [];
    
    // Filter classes if query search term exists
    const filtered = classes.filter(c => 
      c.subject.toLowerCase().includes(query.toLowerCase()) || 
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.room.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      timetableDayList.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-calendar-x"></i>
          <p class="mt-2">No lectures found matching "${query}" on ${day}.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(c => {
      const isBreak = c.code === "BREAK" || c.code === "LIB" || c.code === "APT";
      const itemClass = isBreak ? 'timeline-item break-item glass-panel' : 'timeline-item glass-panel';
      
      const itemDiv = document.createElement('div');
      itemDiv.className = itemClass;
      itemDiv.innerHTML = `
        <div class="timeline-time">${c.time}</div>
        <div class="timeline-details">
          <h4>${c.subject} (${c.code})</h4>
          <p><i class="bi bi-geo-alt-fill text-xs"></i> ${c.room}, ${c.block}</p>
        </div>
      `;
      timetableDayList.appendChild(itemDiv);
    });
  };

  // Day Selector Pill clicks
  dayPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dayPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDay = pill.getAttribute('data-day');
      renderDaySchedule(activeDay, timetableSearch.value);
    });
  });

  // Search input listeners
  timetableSearch.addEventListener('input', (e) => {
    renderDaySchedule(activeDay, e.target.value);
  });

  // Render weekly grid matrix
  timetableWeekGridBody.innerHTML = '';
  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // We need to match rows by time-slot index (we assume 6 periods per day, matching our data.py structures)
  const slotsCount = 6;
  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 01:30 PM",
    "01:30 PM - 02:30 PM",
    "02:30 PM - 04:30 PM"
  ];

  for (let i = 0; i < slotsCount; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${timeSlots[i]}</strong></td>`;
    
    daysList.forEach(day => {
      const dayClasses = appState.timetable.weekly[day] || [];
      const match = dayClasses[i]; // align by index slot
      
      if (match) {
        tr.innerHTML += `
          <td>
            <div class="table-cell-class">${match.subject}</div>
            <div class="table-cell-room">${match.room}</div>
          </td>
        `;
      } else {
        tr.innerHTML += `<td>-</td>`;
      }
    });
    timetableWeekGridBody.appendChild(tr);
  }

  // Toggle buttons between Today and Week view
  const btnDayView = document.getElementById('btnDayView');
  const btnWeekView = document.getElementById('btnWeekView');
  const timetableDayContainer = document.getElementById('timetableDayContainer');
  const timetableWeekContainer = document.getElementById('timetableWeekContainer');

  btnDayView.addEventListener('click', () => {
    btnDayView.classList.add('active');
    btnWeekView.classList.remove('active');
    timetableDayContainer.classList.remove('hidden');
    timetableWeekContainer.classList.add('hidden');
  });

  btnWeekView.addEventListener('click', () => {
    btnWeekView.classList.add('active');
    btnDayView.classList.remove('active');
    timetableDayContainer.classList.add('hidden');
    timetableWeekContainer.classList.remove('hidden');
  });

  // Default initial day load
  // Detect current day
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentWeekday = weekdayNames[new Date().getDay()];
  const defaultDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(currentWeekday) ? currentWeekday : "Monday";
  
  dayPills.forEach(p => {
    p.classList.remove('active');
    if (p.getAttribute('data-day') === defaultDay) {
      p.classList.add('active');
    }
  });
  activeDay = defaultDay;
  renderDaySchedule(defaultDay);
}

// 4. Exams View
function populateExams() {
  if (!appState.exams) return;

  const examsData = appState.exams;

  // Hall Ticket details
  document.getElementById('hallTicketStatus').textContent = examsData.hall_ticket.status;
  document.getElementById('hallTicketRegister').textContent = examsData.hall_ticket.roll_number;
  document.getElementById('hallTicketCenter').textContent = examsData.hall_ticket.center_code;
  document.getElementById('hallTicketInstructions').innerHTML = examsData.hall_ticket.instructions.replace(/\n/g, '<br>');
  
  // Guidelines details
  const guidelinesList = document.getElementById('examGuidelinesList');
  guidelinesList.innerHTML = '';
  examsData.guidelines.forEach(g => {
    const li = document.createElement('li');
    li.textContent = g;
    guidelinesList.appendChild(li);
  });

  // Schedule Tables
  const examScheduleBody = document.getElementById('examScheduleBody');
  
  const renderSchedule = (type) => {
    examScheduleBody.innerHTML = '';
    const scheduleMatch = examsData.schedules.find(s => s.type === type);
    if (!scheduleMatch) return;

    scheduleMatch.subjects.forEach(sub => {
      // format date nicely
      const formattedDate = new Date(sub.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formattedDate}</strong></td>
        <td>${sub.time}</td>
        <td><code>${sub.code}</code></td>
        <td>${sub.subject}</td>
        <td>${sub.room}</td>
      `;
      examScheduleBody.appendChild(tr);
    });
  };

  // Schedule buttons
  const tabIa2 = document.getElementById('tabIa2');
  const tabSem = document.getElementById('tabSem');

  tabIa2.addEventListener('click', () => {
    tabIa2.classList.add('active');
    tabSem.classList.remove('active');
    renderSchedule('Internal Assessment 2');
  });

  tabSem.addEventListener('click', () => {
    tabSem.classList.add('active');
    tabIa2.classList.remove('active');
    renderSchedule('Semester End Examination');
  });

  // Initial load default schedule
  renderSchedule('Internal Assessment 2');

  // Print Hall Ticket
  document.getElementById('btnDownloadHallTicket').addEventListener('click', () => {
    const student = appState.student || { name: 'Alex Mercer', roll_number: 'CSE-2026-089', department: 'Computer Science' };
    const printContent = `
      <html>
        <head>
          <title>EXAM HALL TICKET</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1e293b; }
            .ticket { border: 2px solid #000; border-radius: 12px; padding: 30px; }
            .header { text-align: center; border-bottom: 2px double #000; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0 0; font-size: 14px; color: #475569; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .col { flex: 1; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .value { font-size: 16px; font-weight: bold; margin-top: 4px; }
            .instructions { margin-top: 25px; font-size: 12px; border-top: 1px dashed #000; padding-top: 15px; }
            .footer-signature { display: flex; justify-content: space-between; margin-top: 60px; font-size: 14px; }
            .sig-box { width: 180px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>CAMPUS UNIVERSITY COLLEGE</h1>
              <p>EXAMINATIONS BRANCH - SEMESTER HALL TICKET</p>
            </div>
            <div class="row">
              <div class="col">
                <div class="label">Candidate Name</div>
                <div class="value">${student.name}</div>
              </div>
              <div class="col">
                <div class="label">Exam Roll Number</div>
                <div class="value">${examsData.hall_ticket.roll_number}</div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="label">Department / Stream</div>
                <div class="value">${student.department}</div>
              </div>
              <div class="col">
                <div class="label">Exam Center Code</div>
                <div class="value">${examsData.hall_ticket.center_code}</div>
              </div>
            </div>
            <div class="instructions">
              <h3>Important Instructions to Candidate:</h3>
              <p>${examsData.hall_ticket.instructions.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="footer-signature">
              <div class="sig-box">Proctor Signature<br>(Prof. Arvind Kumar)</div>
              <div class="sig-box">Controller of Examinations</div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    const printFrame = document.getElementById('printFrame');
    const doc = printFrame.contentDocument || printFrame.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();
  });
}

// Countdown Clock Engine
function runCountdownClocks() {
  const updateTimer = (targetDateStr, elements) => {
    const target = new Date(targetDateStr + 'T09:30:00').getTime();
    
    // For demo purposes, if target date is in the past, mock the date forward relative to current time 2026-07-13
    const now = new Date('2026-07-13T09:30:00').getTime();
    
    // We update every second based on real browser interval, but offset to show static dates
    const clockInterval = setInterval(() => {
      const currentRealTime = Date.now();
      // compute mock elapsed time
      const diff = target - (now + (currentRealTime % 100000)); // simple mock countdown drift
      
      if (diff <= 0) {
        clearInterval(clockInterval);
        elements.days.textContent = '00';
        elements.hours.textContent = '00';
        elements.mins.textContent = '00';
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      elements.days.textContent = String(d).padStart(2, '0');
      elements.hours.textContent = String(h).padStart(2, '0');
      elements.mins.textContent = String(m).padStart(2, '0');
    }, 1000);
  };
  
  // Run both
  updateTimer('2026-07-20', {
    days: document.getElementById('ia2Days'),
    hours: document.getElementById('ia2Hours'),
    mins: document.getElementById('ia2Mins')
  });

  updateTimer('2026-08-24', {
    days: document.getElementById('semDays'),
    hours: document.getElementById('semHours'),
    mins: document.getElementById('semMins')
  });
}

// 5. Assignments View
function populateAssignments() {
  const container = document.getElementById('assignmentsList');
  const filters = document.querySelectorAll('[data-asg-filter]');
  const pendingBadge = document.getElementById('pendingAsgBadge');
  
  let currentFilter = 'all';

  const renderList = (filterVal) => {
    container.innerHTML = '';
    
    const filtered = appState.assignments.filter(a => {
      if (filterVal === 'all') return true;
      return a.status === filterVal;
    });

    // Update notification indicators
    const pendingCount = appState.assignments.filter(a => a.status === 'Pending').length;
    pendingBadge.textContent = pendingCount;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-journal-check text-slate-500"></i>
          <p class="mt-2">No assignments matching "${filterVal}" status.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(asg => {
      const isPending = asg.status === 'Pending';
      const statusBadgeClass = isPending ? 'badge-warning' : 'badge-success';
      const card = document.createElement('div');
      card.className = 'assignment-card glass-panel';
      
      card.innerHTML = `
        <div class="assignment-main">
          <div class="assignment-title-row">
            <h4>${asg.title}</h4>
            <span class="badge ${statusBadgeClass}">${asg.status}</span>
          </div>
          <p class="desc">${asg.instructions}</p>
          <div class="assignment-meta-row">
            <span><i class="bi bi-book"></i> ${asg.subject} (${asg.code})</span>
            <span><i class="bi bi-calendar-check"></i> Due: <strong>${asg.due_date}</strong></span>
            <span><i class="bi bi-patch-check"></i> Weight: <strong>${asg.weightage}</strong></span>
          </div>
        </div>
        <div class="assignment-actions">
          ${isPending 
            ? `<button class="btn btn-primary btn-sm" onclick="markAssignmentAsSubmitted('${asg.id}')"><i class="bi bi-check2-circle"></i> Mark Submitted</button>`
            : `<button class="btn btn-outline btn-sm" disabled><i class="bi bi-check-all"></i> Submitted</button>`
          }
        </div>
      `;
      container.appendChild(card);
    });
  };

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-asg-filter');
      renderList(currentFilter);
    });
  });

  renderList('all');
}

// Global scope helper to mark assignment as submitted (needed for onclick inside template literal)
window.markAssignmentAsSubmitted = (id) => {
  const item = appState.assignments.find(a => a.id === id);
  if (item) {
    item.status = 'Submitted';
    localStorage.setItem('zero_assignments_state', JSON.stringify(appState.assignments));
    
    // Reload dashboard & assignment metrics
    populateAssignments();
    
    // Re-load stats for home dashboard
    const cachedDashboard = JSON.parse(localStorage.getItem('zero_dashboard'));
    if (cachedDashboard) {
      const pendingCount = appState.assignments.filter(a => a.status === 'Pending').length;
      cachedDashboard.pending_assignments_count = pendingCount;
      populateDashboard(cachedDashboard);
    }
  }
};

// 6. Placements View
function populatePlacements() {
  if (!appState.placements) return;

  const drivesList = document.getElementById('placementDrivesList');
  const internshipsList = document.getElementById('placementInternshipsList');
  const prepTips = document.getElementById('placementPrepTips');
  const aptitudeRes = document.getElementById('placementAptitudeResources');

  // Render Placement Drives
  drivesList.innerHTML = '';
  appState.placements.drives.forEach(drv => {
    const card = document.createElement('div');
    card.className = 'placement-drive-card glass-panel';
    card.innerHTML = `
      <div class="drive-header">
        <div>
          <h4>${drv.company}</h4>
          <p class="text-sm text-slate-400">${drv.role}</p>
        </div>
        <span class="ctc">${drv.ctc}</span>
      </div>
      <div class="drive-details">
        <p><i class="bi bi-check-circle-fill text-blue text-xs mr-2"></i> <strong>Eligibility:</strong> ${drv.eligibility}</p>
        <p><i class="bi bi-calendar-event text-xs mr-2"></i> <strong>Drive Date:</strong> ${drv.date}</p>
        <p><i class="bi bi-clock-history text-xs mr-2"></i> <strong>Process:</strong> ${drv.process}</p>
      </div>
    `;
    drivesList.appendChild(card);
  });

  // Render Internships
  internshipsList.innerHTML = '';
  appState.placements.internships.forEach(intern => {
    const div = document.createElement('div');
    div.className = 'internship-item glass-panel';
    div.innerHTML = `
      <h5>${intern.company}</h5>
      <p class="font-semibold text-xs text-blue">${intern.role}</p>
      <p class="text-slate-400 text-xs">Duration: ${intern.duration} | Stipend: ${intern.stipend}</p>
    `;
    internshipsList.appendChild(div);
  });

  // Render Prep Tips
  prepTips.innerHTML = '';
  appState.placements.preparation_tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = tip;
    prepTips.appendChild(li);
  });

  // Render Aptitude Resources
  aptitudeRes.innerHTML = '';
  appState.placements.aptitude_resources.forEach(res => {
    const parts = res.split(':');
    const title = parts[0];
    const desc = parts[1] || '';
    const div = document.createElement('div');
    div.className = 'aptitude-res-item';
    div.innerHTML = `
      <div>
        <strong>${title}</strong>
        <p class="text-xs text-slate-400">${desc}</p>
      </div>
      <i class="bi bi-box-arrow-up-right text-blue cursor-pointer"></i>
    `;
    aptitudeRes.appendChild(div);
  });
}

// 7. Faculty Directory
function populateFaculty() {
  const grid = document.getElementById('facultyGrid');
  const searchInput = document.getElementById('facultySearch');

  const renderGrid = (query = '') => {
    grid.innerHTML = '';
    
    const filtered = appState.faculty.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.department.toLowerCase().includes(query.toLowerCase()) ||
      f.subjects.some(sub => sub.toLowerCase().includes(query.toLowerCase()))
    );

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state w-full col-span-3">
          <i class="bi bi-people"></i>
          <p class="mt-2">No faculty members found matching "${query}".</p>
        </div>
      `;
      return;
    }

    filtered.forEach(fac => {
      // Get initials
      const initials = fac.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
      
      const card = document.createElement('div');
      card.className = 'faculty-card glass-panel';
      card.innerHTML = `
        <div class="faculty-avatar-row">
          <div class="faculty-avatar-circle">${initials}</div>
          <div class="faculty-meta-info">
            <h4>${fac.name}</h4>
            <p>${fac.designation}</p>
          </div>
        </div>
        <div class="faculty-card-details">
          <div><i class="bi bi-building text-blue"></i> Department: <strong>${fac.department}</strong></div>
          <div><i class="bi bi-door-closed text-blue"></i> Cabin Number: <strong>${fac.cabin}</strong></div>
          <div><i class="bi bi-envelope-at text-blue"></i> Email ID: <a href="mailto:${fac.email}" class="text-blue text-decoration-none">${fac.email}</a></div>
          <div><i class="bi bi-clock text-blue"></i> Office Timings: <strong>${fac.timings}</strong></div>
          <div><i class="bi bi-book text-blue"></i> Subjects: <strong>${fac.subjects.join(', ')}</strong></div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  searchInput.addEventListener('input', (e) => {
    renderGrid(e.target.value);
  });

  renderGrid();
}

// 8. Campus Navigation / Map
function populateCampusNavigation() {
  if (!appState.navigation) return;

  const locationsList = document.getElementById('mapLocationsList');
  const previewTitle = document.getElementById('mapPreviewTitle');
  const directionsBox = document.getElementById('mapDirectionsDetails');
  const directionsText = document.getElementById('directionsText');
  const directionsFac = document.getElementById('directionsFacilities');
  const mapNodes = document.querySelectorAll('.map-node');

  // Render list of locations
  locationsList.innerHTML = '';
  appState.navigation.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'location-item-btn';
    btn.innerHTML = `
      <h4>${loc.name}</h4>
      <p><i class="bi bi-geo-alt-fill text-xs text-blue"></i> ${loc.location}</p>
    `;
    
    btn.addEventListener('click', () => {
      // Highlight button
      document.querySelectorAll('.location-item-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update directions visual panels
      previewTitle.innerHTML = `
        <h3>${loc.name}</h3>
        <p>Operational Hours: <strong>${loc.hours}</strong></p>
        <p class="mt-2 text-sm text-slate-300">${loc.description}</p>
      `;
      
      directionsBox.classList.remove('hidden');
      directionsText.innerHTML = `<i class="bi bi-geo-alt-fill text-blue"></i> ${loc.directions}`;
      directionsFac.innerHTML = `<strong>Available Facilities:</strong> ${loc.facilities}`;
      
      // Highlight SVG Node
      mapNodes.forEach(node => node.classList.remove('selected'));
      // Find matching SVG ID
      const svgId = getSvgNodeIdForLocation(loc.name);
      const svgNode = document.getElementById(svgId);
      if (svgNode) {
        svgNode.classList.add('selected');
      }
    });

    locationsList.appendChild(btn);
  });

  // Handle direct SVG node click
  mapNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeName = node.getAttribute('data-node');
      const locMatch = findLocationByNodeName(nodeName);
      if (locMatch) {
        // Find button in menu and trigger click
        const buttons = locationsList.querySelectorAll('.location-item-btn');
        buttons.forEach(btn => {
          if (btn.querySelector('h4').textContent === locMatch.name) {
            btn.click();
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }
    });
  });

  // Helper mappings
  function getSvgNodeIdForLocation(locName) {
    const maps = {
      'Central Library': 'map-node-canteen', // center node circle
      'Computer Labs': 'map-node-cse',
      'Main Canteen': 'map-node-canteen',
      'Administrative Office': 'map-node-admin',
      'Placement Cell': 'map-node-admin',
      'Central Auditorium': 'map-node-auditorium',
      'Student Hostels': 'campusInteractiveMap',
      'Parking Yards': 'campusInteractiveMap',
      'Medical Room': 'map-node-blocka',
      'Sports Complex': 'map-node-science'
    };
    return maps[locName] || '';
  }

  function findLocationByNodeName(nodeName) {
    const names = {
      'admin': 'Administrative Office',
      'canteen': 'Main Canteen',
      'blocka': 'Medical Room',
      'cse': 'Computer Labs',
      'auditorium': 'Central Auditorium'
    };
    const targetName = names[nodeName];
    return appState.navigation.find(l => l.name === targetName);
  }
}

// 9. Notifications View
function populateNotifications() {
  const container = document.getElementById('notificationsList');
  const notiCount = document.getElementById('notiCount');
  
  const unreadCount = appState.notifications.filter(n => n.unread).length;
  notiCount.textContent = unreadCount;
  if (unreadCount === 0) {
    notiCount.classList.add('hidden');
  } else {
    notiCount.classList.remove('hidden');
  }

  container.innerHTML = '';
  if (appState.notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-bell-slash"></i>
        <p class="mt-2">No alerts or notifications.</p>
      </div>
    `;
    return;
  }

  appState.notifications.forEach(n => {
    const item = document.createElement('div');
    item.className = `notification-item glass-panel ${n.unread ? 'unread' : ''}`;
    
    // Choose icon
    let iconClass = 'bi bi-info-circle-fill bg-blue-grad';
    if (n.type === 'assignment') iconClass = 'bi bi-file-earmark-text bg-yellow-grad text-warning';
    if (n.type === 'exam') iconClass = 'bi bi-pencil-square bg-red-grad text-danger';
    if (n.type === 'placement') iconClass = 'bi bi-briefcase-fill bg-teal-grad text-success';
    
    item.innerHTML = `
      <div class="noti-icon">
        <i class="${iconClass.split(' ')[0]}"></i>
      </div>
      <div class="noti-info">
        <p>${n.text}</p>
        <span class="noti-time">${n.time}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// 10. Profile View
function populateProfile() {
  if (!appState.student) return;
  const s = appState.student;

  document.getElementById('profileLargeAvatar').src = s.profile_image;
  document.getElementById('profileLargeName').textContent = s.name;
  document.getElementById('profileLargeSemester').textContent = s.current_semester;
  document.getElementById('profileLargeDept').textContent = s.department;
  document.getElementById('profileRollNum').textContent = s.roll_number;
  document.getElementById('profileBatch').textContent = s.batch;
  document.getElementById('profileCgpa').textContent = s.cgpa;
  document.getElementById('profileProctor').textContent = s.proctor;
}

// 11. History View
function populateHistory() {
  const container = document.getElementById('historySessionsList');
  container.innerHTML = '';
  
  if (appState.savedSessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-chat-left-quote text-slate-500"></i>
        <p class="mt-2">No saved conversation history found.</p>
        <button class="btn btn-outline btn-sm mt-3" data-tab-trigger="chat">Start New Chat</button>
      </div>
    `;
    return;
  }

  appState.savedSessions.forEach(sess => {
    const card = document.createElement('div');
    card.className = 'history-card glass-panel';
    card.innerHTML = `
      <div class="history-card-meta">
        <h4>${sess.title}</h4>
        <p><i class="bi bi-calendar3"></i> ${sess.date} | Messages: ${sess.messages.length}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary btn-sm" onclick="loadChatSession('${sess.id}')">Restore</button>
        <button class="btn btn-ghost btn-sm text-danger" onclick="deleteChatSession('${sess.id}', event)"><i class="bi bi-trash"></i></button>
      </div>
    `;
    container.appendChild(card);
  });
}

// History actions
window.loadChatSession = (id) => {
  const sess = appState.savedSessions.find(s => s.id === id);
  if (sess) {
    appState.activeSessionId = sess.id;
    appState.chatHistory = [...sess.messages];
    
    // Render restored chats
    chatMessages.innerHTML = '';
    appState.chatHistory.forEach(msg => {
      appendMessageToUI(msg.role, msg.content, false); // don't auto-speak loaded history
    });
    
    // Route to chat view
    window.location.hash = '#chat';
  }
};

window.deleteChatSession = (id, event) => {
  event.stopPropagation();
  appState.savedSessions = appState.savedSessions.filter(s => s.id !== id);
  localStorage.setItem('zeroAiHistory', JSON.stringify(appState.savedSessions));
  populateHistory();
  
  // If active session was deleted, clear active state
  if (appState.activeSessionId === id) {
    appState.activeSessionId = 'session_' + Date.now();
    appState.chatHistory = [];
    chatMessages.innerHTML = `
      <div class="message system-msg">
        <div class="msg-bubble glass-panel">
          Conversation cleared. Ask me anything about your academic records!
        </div>
      </div>
    `;
  }
};

// --- CHAT MODULE (GEMINI + MOCK INTEGRATIONS) ---

// Setup event listeners for chat input
function setupEventListeners() {
  // Theme check switch
  const themeCheckbox = document.getElementById('settingsThemeCheckbox');
  if (themeCheckbox) {
    themeCheckbox.addEventListener('change', () => {
      toggleTheme();
    });
  }
  
  themeToggle.addEventListener('click', toggleTheme);

  // Settings TTS Check
  const ttsCheckbox = document.getElementById('settingsTtsCheckbox');
  if (ttsCheckbox) {
    ttsCheckbox.addEventListener('change', (e) => {
      appState.settings.ttsEnabled = e.target.checked;
      localStorage.setItem('ttsEnabled', e.target.checked);
      updateTtsButtonState();
    });
  }

  // Tts button inline toggle
  btnTtsToggle.addEventListener('click', () => {
    appState.settings.ttsEnabled = !appState.settings.ttsEnabled;
    localStorage.setItem('ttsEnabled', appState.settings.ttsEnabled);
    updateTtsButtonState();
    
    const ttsCheckbox = document.getElementById('settingsTtsCheckbox');
    if (ttsCheckbox) ttsCheckbox.checked = appState.settings.ttsEnabled;
  });

  // Settings API Key save
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  if (btnSaveApiKey) {
    btnSaveApiKey.addEventListener('click', () => {
      const keyVal = document.getElementById('settingsApiKey').value.trim();
      localStorage.setItem('geminiApiKey', keyVal);
      appState.settings.apiKey = keyVal;
      alert("Custom Gemini API Key saved successfully. The app will now communicate directly with Google's API services.");
    });
  }

  // Clear caches button
  const btnClearCacheBtn = document.getElementById('btnClearCacheBtn');
  if (btnClearCacheBtn) {
    btnClearCacheBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all local chat histories? This cannot be undone.")) {
        localStorage.removeItem('zeroAiHistory');
        appState.savedSessions = [];
        appState.chatHistory = [];
        populateHistory();
        chatMessages.innerHTML = `
          <div class="message system-msg">
            <div class="msg-bubble glass-panel">
              Local database wiped. Conversational logs have been cleared.
            </div>
          </div>
        `;
        alert("Chat logs deleted successfully.");
      }
    });
  }

  // Force sw cache reload
  const btnForceReloadSw = document.getElementById('btnForceReloadSw');
  if (btnForceReloadSw) {
    btnForceReloadSw.addEventListener('click', () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
          alert("Offline cache un-registered. App will re-sync and update files on next refresh.");
          window.location.reload();
        });
      }
    });
  }

  // Suggestions chips list - default chips
  const defaultChips = [
    "Check my attendance",
    "Show today's timetable",
    "When is the next exam?",
    "Show pending assignments"
  ];
  renderSuggestions(defaultChips);

  // Send message clicks
  btnSendMessage.addEventListener('click', handleUserSendMessage);
  
  // Enter key press in chat textarea
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!btnSendMessage.disabled) {
        handleUserSendMessage();
      }
    }
  });

  // Grow chat input height dynamically
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight - 4) + 'px';
    
    // Enable/disable send button
    btnSendMessage.disabled = chatInput.value.trim().length === 0;
  });

  // Speech Recognition (Voice Input)
  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      btnVoiceInput.innerHTML = '<i class="bi bi-mic-fill text-danger"></i>';
      btnVoiceInput.title = 'Listening...';
    };
    
    recognition.onend = () => {
      btnVoiceInput.innerHTML = '<i class="bi bi-mic"></i>';
      btnVoiceInput.title = 'Voice Input';
    };
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      chatInput.value = text;
      chatInput.style.height = 'auto';
      chatInput.style.height = (chatInput.scrollHeight - 4) + 'px';
      btnSendMessage.disabled = false;
    };
    
    recognition.onerror = (e) => {
      console.error("Speech Recognition error:", e);
      btnVoiceInput.innerHTML = '<i class="bi bi-mic"></i>';
    };
  }

  btnVoiceInput.addEventListener('click', () => {
    if (!recognition) {
      alert("Web Speech API is not supported in this browser. Please use Chrome/Edge.");
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      recognition.stop();
    }
  });

  // Clear chat logs in UI
  btnClearChat.addEventListener('click', () => {
    if (confirm("Clear current conversation thread?")) {
      appState.chatHistory = [];
      chatMessages.innerHTML = `
        <div class="message system-msg">
          <div class="msg-bubble glass-panel">
            Conversation cleared. Ask me anything about your academic records!
          </div>
        </div>
      `;
      renderSuggestions(defaultChips);
    }
  });

  // Export PDF
  btnExportPdf.addEventListener('click', () => {
    const printContent = `
      <html>
        <head>
          <title>Zero AI - Chat Conversation Export</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; }
            h1 { font-family: 'Outfit', sans-serif; border-bottom: 2px solid #38bdf8; padding-bottom: 10px; margin-bottom: 20px; }
            .msg { margin-bottom: 20px; padding: 14px 20px; border-radius: 12px; max-width: 90%; }
            .user { background: #f1f5f9; border-left: 5px solid #6366f1; margin-left: auto; }
            .ai { background: #eff6ff; border-left: 5px solid #38bdf8; }
            .meta { font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: bold; }
            pre { background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Zero AI Conversation Log</h1>
          <p>Student Name: <strong>Alex Mercer</strong> | Roll Number: <strong>CSE-2026-089</strong></p>
          <p>Export Date: ${new Date().toLocaleDateString()}</p>
          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 20px 0;">
          
          ${appState.chatHistory.map(m => `
            <div class="msg ${m.role === 'user' ? 'user' : 'ai'}">
              <div class="meta">${m.role === 'user' ? 'Alex Mercer' : 'Zero AI Assistant'}</div>
              <div>${parseMarkdown(m.content)}</div>
            </div>
          `).join('')}
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    const printFrame = document.getElementById('printFrame');
    const doc = printFrame.contentDocument || printFrame.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();
  });

  // Export Markdown
  btnDownloadMd.addEventListener('click', () => {
    let mdContent = `# Zero AI Conversation Export\n\n`;
    mdContent += `**Date:** ${new Date().toLocaleString()}\n`;
    mdContent += `**Student:** Alex Mercer (CSE-2026-089)\n\n`;
    mdContent += `--- \n\n`;

    appState.chatHistory.forEach(msg => {
      const sender = msg.role === 'user' ? '**Alex Mercer**' : '**Zero AI Assistant**';
      mdContent += `${sender}:\n${msg.content}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zero-ai-chat-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Mark all notifications read
  const btnClearNotifications = document.getElementById('btnClearNotifications');
  if (btnClearNotifications) {
    btnClearNotifications.addEventListener('click', () => {
      appState.notifications.forEach(n => n.unread = false);
      populateNotifications();
    });
  }

  // Keyboard shortcut listener (Alt codes)
  window.addEventListener('keydown', (e) => {
    if (e.altKey) {
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        window.location.hash = '#chat';
      }
      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        window.location.hash = '#home';
      }
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        window.location.hash = '#settings';
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.location.hash = '#profile';
      }
    }
    // Esc stops TTS voice speaking
    if (e.key === 'Escape') {
      window.speechSynthesis.cancel();
      document.querySelectorAll('.ai-msg .msg-bubble').forEach(b => b.classList.remove('tts-speaking'));
    }
  });
}

function renderSuggestions(chips) {
  chatSuggestions.innerHTML = '';
  chips.forEach(text => {
    const btn = document.createElement('div');
    btn.className = 'suggestion-pill';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      chatInput.value = text;
      chatInput.style.height = 'auto';
      btnSendMessage.disabled = false;
      handleUserSendMessage();
    });
    chatSuggestions.appendChild(btn);
  });
}

// Markdown Regex Parser
function parseMarkdown(mdText) {
  let html = mdText;
  
  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```js ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italics: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Markdown headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Lists items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>');
  
  // Wrap li lists
  // Simple regex replacements for clean ul structuring
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Markdown Tables formatting
  // Matches line sets starting and ending with |
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Check if divider line
      if (line.includes('---')) {
        continue;
      }
      
      const cols = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cols);
      lines[idx] = ''; // clear line in output
    } else {
      if (inTable) {
        inTable = false;
        // Build table html
        let tableHtml = '<table><thead><tr>';
        // Header columns
        tableRows[0].forEach(h => {
          tableHtml += `<th>${h}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        // Content rows
        for (let r = 1; r < tableRows.length; r++) {
          tableHtml += '<tr>';
          tableRows[r].forEach(d => {
            tableHtml += `<td>${d}</td>`;
          });
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        
        // Insert table HTML before current index line
        lines[idx - 1] = tableHtml;
      }
    }
  }
  
  html = lines.join('\n');

  // Paragraph line breaks
  html = html.replace(/\n\n/g, '<br><br>');

  return html;
}

// Append bubble to UI
function appendMessageToUI(role, content, autoSpeak = false) {
  const isUser = role === 'user';
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isUser ? 'user-msg' : 'ai-msg'}`;
  
  // Build bubble
  const formattedContent = parseMarkdown(content);
  
  msgDiv.innerHTML = `
    <div class="msg-bubble glass-panel">
      ${formattedContent}
      ${!isUser ? `
        <div class="ai-bubble-actions">
          <button class="bubble-action-btn btn-copy" title="Copy response"><i class="bi bi-copy"></i> Copy</button>
          <button class="bubble-action-btn btn-speak" title="Speak response"><i class="bi bi-volume-up"></i> Speak</button>
        </div>
      ` : ''}
    </div>
  `;
  
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add event listeners inside bubble
  if (!isUser) {
    const bubble = msgDiv.querySelector('.msg-bubble');
    const btnCopy = msgDiv.querySelector('.btn-copy');
    const btnSpeak = msgDiv.querySelector('.btn-speak');

    btnCopy.addEventListener('click', () => {
      // Clean html code from text
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formattedContent;
      const cleanText = tempElement.textContent || tempElement.innerText || '';
      
      navigator.clipboard.writeText(cleanText).then(() => {
        btnCopy.innerHTML = '<i class="bi bi-check-lg text-success"></i> Copied!';
        setTimeout(() => {
          btnCopy.innerHTML = '<i class="bi bi-copy"></i> Copy';
        }, 2000);
      });
    });

    btnSpeak.addEventListener('click', () => {
      speakMessageBubble(bubble, content);
    });

    // Auto speak if enabled and requested
    if (autoSpeak && appState.settings.ttsEnabled) {
      speakMessageBubble(bubble, content);
    }
  }
}

// Speak message using speech synthesis
function speakMessageBubble(bubbleElement, text) {
  // Cancel active speaking
  window.speechSynthesis.cancel();
  document.querySelectorAll('.ai-msg .msg-bubble').forEach(b => b.classList.remove('tts-speaking'));

  // Extract clean text from markdown code structures
  const cleanSpeechText = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/\[Suggestions:[\s\S]*?\]/g, '') // remove suggestions
    .replace(/[*#`|_-]/g, ' '); // replace markdown symbols

  const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
  utterance.lang = 'en-US';
  
  utterance.onstart = () => {
    bubbleElement.classList.add('tts-speaking');
  };
  
  utterance.onend = () => {
    bubbleElement.classList.remove('tts-speaking');
  };

  utterance.onerror = () => {
    bubbleElement.classList.remove('tts-speaking');
  };

  window.speechSynthesis.speak(utterance);
}

// User send trigger
async function handleUserSendMessage() {
  const query = chatInput.value.trim();
  if (query.length === 0) return;

  // 1. Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';
  btnSendMessage.disabled = true;

  // 2. Append User message to UI and history
  appendMessageToUI('user', query);
  
  // Format history messages list
  const historyPayload = appState.chatHistory.map(m => ({
    role: m.role,
    content: m.content
  }));

  appState.chatHistory.push({ role: 'user', content: query });

  // 3. Show Typing indicator
  chatTypingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // 4. Send API query
  try {
    let responseText = "";
    let chips = [];
    
    // Check if custom key is configured inside Settings
    if (appState.settings.apiKey && appState.settings.apiKey.trim() !== "") {
      const result = await callGeminiClientDirect(query, historyPayload, appState.settings.apiKey);
      responseText = result.response;
      chips = result.suggestions;
    } else {
      // Backend FastAPI server call
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!response.ok) throw new Error("Backend server error");
      const data = await response.json();
      responseText = data.response;
      chips = data.suggestions;
    }

    // 5. Hide Typing indicator
    chatTypingIndicator.classList.add('hidden');

    // 6. Render AI message
    appendMessageToUI('assistant', responseText, true);
    appState.chatHistory.push({ role: 'assistant', content: responseText });
    
    // Render suggestion chips
    renderSuggestions(chips);

    // 7. Save Session state to localStorage history lists
    saveCurrentSessionState();

  } catch (error) {
    console.error("Chat error:", error);
    chatTypingIndicator.classList.add('hidden');
    
    const errorText = "⚠️ Zero AI is having trouble connecting to the backend services. Please check if your FastAPI server is running or configure your custom Gemini API key in Settings.";
    appendMessageToUI('assistant', errorText, false);
  }
}

// Save chat log to localStorage
function saveCurrentSessionState() {
  if (appState.chatHistory.length < 2) return;

  const sessionIdx = appState.savedSessions.findIndex(s => s.id === appState.activeSessionId);
  const title = appState.chatHistory[0].content.substring(0, 30) + "...";
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const sessionObject = {
    id: appState.activeSessionId,
    title: title,
    date: dateStr,
    messages: [...appState.chatHistory]
  };

  if (sessionIdx !== -1) {
    appState.savedSessions[sessionIdx] = sessionObject;
  } else {
    appState.savedSessions.unshift(sessionObject);
  }

  localStorage.setItem('zeroAiHistory', JSON.stringify(appState.savedSessions));
  populateHistory();
}

// Directly query Google Gemini endpoint client side if user provides a key
async function callGeminiClientDirect(query, historyPayload, apiKey) {
  // Prep structured academic instructions
  const profileStr = JSON.stringify(appState.student || {});
  const attendanceStr = JSON.stringify(appState.attendance || {});
  const timetableStr = JSON.stringify(appState.timetable || {});
  const examsStr = JSON.stringify(appState.exams || {});
  const assignmentsStr = JSON.stringify(appState.assignments || []);
  const placementsStr = JSON.stringify(appState.placements || {});
  const facultyStr = JSON.stringify(appState.faculty || []);
  const navStr = JSON.stringify(appState.navigation || []);

  const systemInstruction = `You are "Zero AI", a friendly, highly intelligent, and helpful AI College Student Assistant for first-year college students.
Your primary student is Alex Mercer from the Computer Science & Engineering department, Roll Number CSE-2026-089.
You are polite, student-friendly, and concise.

You have access to the official college database for the student. Answer questions accurately using this data:

### STUDENT PROFILE:
${profileStr}

### ATTENDANCE DATA:
${attendanceStr}
(CRITICAL: If attendance is below 75% in a subject, warn the student. For example, Applied Physics is 67.5% and Basic Electronics is 72.5%.)

### TIMETABLE:
${timetableStr}

### EXAMS AND HALL TICKETS:
${examsStr}
(Note: Today is Monday, July 13, 2026. Internal Assessment 2 starts on July 20, 2026. Semester End exams start on August 24, 2026. Calculate countdowns based on this).

### ASSIGNMENTS:
${assignmentsStr}
(Note: Today is Monday, July 13, 2026. Display due dates relative to this and point out pending assignments).

### PLACEMENTS & INTERNSHIPS:
${placementsStr}

### FACULTY DIRECTORY:
${facultyStr}

### CAMPUS NAVIGATION DIRECTIONS:
${navStr}

### INSTRUCTIONS:
1. Support the student, be encouraging and positive.
2. If they ask general questions (e.g. coding help, writing advice, general knowledge), answer them but keep it concise and helpful.
3. If they ask about attendance, exams, assignments, or campus maps, pull data from the tables above and explain clearly.
4. Format output using Markdown, including bolding, lists, and tables when presenting complex metrics.
5. In addition to answering the student's query, always suggest exactly 3 short, relevant questions they might ask next. Append them at the very end of your response inside a structured block like:
[Suggestions: "suggested query 1", "suggested query 2", "suggested query 3"]
Do not put suggestions inside code blocks or HTML. Put it on a new line at the very end.
`;

  // Map history to Gemini payload
  const contents = [];
  historyPayload.forEach(h => {
    const role = h.role === 'user' ? 'user' : 'model';
    contents.push({
      role: role,
      parts: [{ text: h.content }]
    });
  });
  
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Gemini direct API call failed");
  const data = await response.json();
  
  let ai_text = data.candidates[0].content.parts[0].text;
  let suggestions = [];
  
  // Parse suggestions
  const suggMatch = ai_text.match(/\[Suggestions:\s*(.*?)\]/);
  if (suggMatch) {
    const suggStr = suggMatch[1];
    const items = suggStr.match(/"([^"]*)"/g);
    if (items) {
      suggestions = items.map(i => i.replace(/"/g, '')).slice(0, 3);
    } else {
      suggestions = suggStr.split(',').map(s => s.trim().replace(/'/g, '')).slice(0, 3);
    }
    ai_text = ai_text.replace(suggMatch[0], "").trim();
  }

  if (suggestions.length === 0) {
    suggestions = ["Show today's timetable", "Check my attendance", "Where is the library?"];
  }

  return { response: ai_text, suggestions: suggestions };
}
