// JournalApp Frontend Application Logic
document.addEventListener('DOMContentLoaded', () => {

  // State
  let activeUser = localStorage.getItem('journal_active_user') || '';
  let usersList = [];
  let currentEntries = [];

  // DOM Elements
  const navUserName = document.getElementById('navUserName');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const userPillBtn = document.getElementById('userPillBtn');
  const newUserBtn = document.getElementById('newUserBtn');
  const welcomeTitle = document.getElementById('welcomeTitle');
  const welcomeSub = document.getElementById('welcomeSub');

  const searchInput = document.getElementById('searchInput');
  const createEntryBtn = document.getElementById('createEntryBtn');
  const refreshBtn = document.getElementById('refreshBtn');

  const statTotalEntries = document.getElementById('statTotalEntries');
  const statActiveUser = document.getElementById('statActiveUser');
  const statLastUpdated = document.getElementById('statLastUpdated');

  const journalGrid = document.getElementById('journalGrid');

  // Modals
  const entryModal = document.getElementById('entryModal');
  const entryModalTitle = document.getElementById('entryModalTitle');
  const entryForm = document.getElementById('entryForm');
  const entryIdInput = document.getElementById('entryId');
  const entryTitleInput = document.getElementById('entryTitle');
  const entryContentInput = document.getElementById('entryContent');
  const closeEntryModal = document.getElementById('closeEntryModal');
  const cancelEntryModal = document.getElementById('cancelEntryModal');

  const viewModal = document.getElementById('viewModal');
  const viewModalTitle = document.getElementById('viewModalTitle');
  const viewModalDate = document.getElementById('viewModalDate');
  const viewModalContent = document.getElementById('viewModalContent');
  const closeViewModal = document.getElementById('closeViewModal');
  const closeViewModalBtn = document.getElementById('closeViewModalBtn');

  const userModal = document.getElementById('userModal');
  const userSelectDropdown = document.getElementById('userSelectDropdown');
  const createUserForm = document.getElementById('createUserForm');
  const newUserNameInput = document.getElementById('newUserName');
  const newUserPasswordInput = document.getElementById('newUserPassword');
  const closeUserModal = document.getElementById('closeUserModal');

  const toastContainer = document.getElementById('toastContainer');

  // --- Initial Load ---
  init();

  async function init() {
    setupEventListeners();
    await fetchUsers();

    if (!activeUser && usersList.length > 0) {
      activeUser = usersList[0].userName;
      localStorage.setItem('journal_active_user', activeUser);
    }

    updateUserUI();
    if (activeUser) {
      await fetchJournalEntries();
    } else {
      openModal(userModal);
      showToast('Please select or create a user to get started.', 'info');
    }
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    userPillBtn.addEventListener('click', () => openModal(userModal));
    newUserBtn.addEventListener('click', () => openModal(userModal));
    closeUserModal.addEventListener('click', () => closeModal(userModal));

    createEntryBtn.addEventListener('click', () => {
      if (!activeUser) {
        showToast('Please select or create a user first.', 'error');
        openModal(userModal);
        return;
      }
      openCreateEntryModal();
    });

    closeEntryModal.addEventListener('click', () => closeModal(entryModal));
    cancelEntryModal.addEventListener('click', () => closeModal(entryModal));

    closeViewModal.addEventListener('click', () => closeModal(viewModal));
    closeViewModalBtn.addEventListener('click', () => closeModal(viewModal));

    refreshBtn.addEventListener('click', () => {
      fetchUsers();
      if (activeUser) fetchJournalEntries();
      showToast('Data refreshed', 'success');
    });

    searchInput.addEventListener('input', (e) => {
      renderEntries(e.target.value.trim().toLowerCase());
    });

    // Form Submissions
    entryForm.addEventListener('submit', handleSaveEntry);
    createUserForm.addEventListener('submit', handleCreateUser);
    userSelectDropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        activeUser = e.target.value;
        localStorage.setItem('journal_active_user', activeUser);
        updateUserUI();
        fetchJournalEntries();
        closeModal(userModal);
        showToast(`Switched user to ${activeUser}`, 'success');
      }
    });
  }

  // --- API Calls ---

  // 1. Fetch Users
  async function fetchUsers() {
    try {
      const res = await fetch('/user');
      if (res.ok) {
        usersList = await res.json();
        populateUserDropdown();
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  // 2. Fetch Journal Entries for Active User
  async function fetchJournalEntries() {
    if (!activeUser) return;
    renderLoading();
    try {
      const res = await fetch(`/journal/${encodeURIComponent(activeUser)}`);
      if (res.ok) {
        currentEntries = await res.json();
        renderEntries();
        updateStats();
      } else if (res.status === 404) {
        currentEntries = [];
        renderEntries();
        updateStats();
      } else {
        showToast('Failed to load journal entries', 'error');
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      showToast('Error connecting to backend API', 'error');
    }
  }

  // 3. Create or Edit Entry
  async function handleSaveEntry(e) {
    e.preventDefault();
    const id = entryIdInput.value;
    const title = entryTitleInput.value.trim();
    const content = entryContentInput.value.trim();

    if (!title) {
      showToast('Title is required', 'error');
      return;
    }

    const payload = { title, content };

    try {
      let res;
      if (id) {
        // Edit / Update existing entry
        res = await fetch(`/journal/id/${encodeURIComponent(activeUser)}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new entry
        res = await fetch(`/journal/${encodeURIComponent(activeUser)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok || res.status === 201) {
        showToast(id ? 'Entry updated successfully!' : 'New entry created!', 'success');
        closeModal(entryModal);
        fetchJournalEntries();
      } else {
        showToast('Failed to save journal entry', 'error');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      showToast('Network error while saving entry', 'error');
    }
  }

  // 4. Create New User
  async function handleCreateUser(e) {
    e.preventDefault();
    const userName = newUserNameInput.value.trim();
    const password = newUserPasswordInput.value.trim();

    if (!userName || !password) {
      showToast('Username and password are required', 'error');
      return;
    }

    try {
      const res = await fetch('/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password })
      });

      if (res.status === 201 || res.ok) {
        showToast(`User '${userName}' created!`, 'success');
        newUserNameInput.value = '';
        newUserPasswordInput.value = '';
        activeUser = userName;
        localStorage.setItem('journal_active_user', activeUser);
        await fetchUsers();
        updateUserUI();
        fetchJournalEntries();
        closeModal(userModal);
      } else {
        showToast('Failed to create user (username may already exist)', 'error');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      showToast('Network error creating user', 'error');
    }
  }

  // 5. Delete Entry
  async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const res = await fetch(`/journal/id/${encodeURIComponent(activeUser)}/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      if (res.status === 204 || res.ok) {
        showToast('Entry deleted successfully', 'success');
        fetchJournalEntries();
      } else {
        showToast('Failed to delete entry', 'error');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      showToast('Error deleting entry', 'error');
    }
  }

  // --- Render Helpers ---

  function renderEntries(filterText = '') {
    journalGrid.innerHTML = '';

    let filtered = currentEntries;
    if (filterText) {
      filtered = currentEntries.filter(e => 
        (e.title && e.title.toLowerCase().includes(filterText)) ||
        (e.content && e.content.toLowerCase().includes(filterText))
      );
    }

    if (!filtered || filtered.length === 0) {
      journalGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-regular fa-folder-open"></i>
          </div>
          <h3>No Journal Entries Found</h3>
          <p>${filterText ? 'No entries match your search query.' : 'Start capturing your thoughts by creating your first journal entry!'}</p>
          ${!filterText ? `<button class="btn btn-primary" onclick="document.getElementById('createEntryBtn').click()"><i class="fa-solid fa-plus"></i> Create Entry</button>` : ''}
        </div>
      `;
      return;
    }

    filtered.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'journal-card';
      const entryId = parseObjectId(entry.id);

      const formattedDate = formatDate(entry.date);

      card.innerHTML = `
        <div>
          <div class="card-header">
            <h3 class="card-title">${escapeHtml(entry.title || 'Untitled')}</h3>
            <span class="card-date">${formattedDate}</span>
          </div>
          <div class="card-content-teaser">
            <i class="fa-solid fa-lock"></i>
            <span>Content hidden &bull; Click View to read</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary btn-sm btn-view" title="Read full entry">
            <i class="fa-regular fa-eye"></i> View
          </button>
          <button class="btn btn-secondary btn-sm btn-edit" title="Edit entry">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-delete" title="Delete entry">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      // Card click opens entry modal unless edit/delete buttons clicked
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit') || e.target.closest('.btn-delete')) return;
        openViewModal(entry);
      });

      // Event handlers for action buttons
      card.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditEntryModal(entry);
      });
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEntry(entryId);
      });

      journalGrid.appendChild(card);
    });
  }

  function renderLoading() {
    journalGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-purple); margin-bottom: 1rem;"></i>
        <p style="color: var(--text-muted);">Loading entries from database...</p>
      </div>
    `;
  }

  function updateUserUI() {
    if (activeUser) {
      navUserName.textContent = activeUser;
      navUserAvatar.textContent = activeUser.charAt(0).toUpperCase();
      welcomeTitle.textContent = `${activeUser}'s Journal`;
      welcomeSub.textContent = `Welcome back, ${activeUser}! Here are your journal entries.`;
      statActiveUser.textContent = activeUser;
    } else {
      navUserName.textContent = 'Select User';
      navUserAvatar.textContent = '?';
      welcomeTitle.textContent = 'My Journal Entries';
      welcomeSub.textContent = 'Please select or create a user to view entries.';
      statActiveUser.textContent = 'None';
    }
  }

  function updateStats() {
    statTotalEntries.textContent = currentEntries.length;

    if (currentEntries.length > 0) {
      const dates = currentEntries
        .map(e => e.date ? new Date(e.date) : null)
        .filter(Boolean)
        .sort((a, b) => b - a);

      if (dates.length > 0) {
        statLastUpdated.textContent = relativeTime(dates[0]);
      } else {
        statLastUpdated.textContent = 'Recently';
      }
    } else {
      statLastUpdated.textContent = 'No Entries';
    }
  }

  function populateUserDropdown() {
    userSelectDropdown.innerHTML = '<option value="">-- Choose User --</option>';
    usersList.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.userName;
      opt.textContent = u.userName;
      if (u.userName === activeUser) opt.selected = true;
      userSelectDropdown.appendChild(opt);
    });
  }

  // --- Modal Helpers ---

  function openCreateEntryModal() {
    entryIdInput.value = '';
    entryTitleInput.value = '';
    entryContentInput.value = '';
    entryModalTitle.textContent = 'Create Journal Entry';
    openModal(entryModal);
  }

  function openEditEntryModal(entry) {
    entryIdInput.value = parseObjectId(entry.id);
    entryTitleInput.value = entry.title || '';
    entryContentInput.value = entry.content || '';
    entryModalTitle.textContent = 'Edit Journal Entry';
    openModal(entryModal);
  }

  function openViewModal(entry) {
    viewModalTitle.textContent = entry.title || 'Untitled Entry';
    viewModalDate.textContent = formatDate(entry.date);
    viewModalContent.textContent = entry.content || '(No content)';
    openModal(viewModal);
  }

  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  // --- Utility Functions ---

  function parseObjectId(id) {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.timestamp) {
      // In case Jackson returns raw object
      return id.toString();
    }
    return String(id);
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  function relativeTime(date) {
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

});
