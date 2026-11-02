
    const INITIAL_USERS = [
      { name: 'Admin Manager', email: 'admin@eventhub.com', password: 'admin123', role: 'admin' },
      { name: 'Rahul Sharma', email: 'client@eventhub.com', password: 'client123', role: 'client' }
    ];

    const INITIAL_EVENTS = [
      {
        id: 'evt-101',
        title: 'Fullstack Developers Conclave',
        date: '2026-11-20',
        category: 'Technology',
        location: 'Tech Park, Bangalore',
        capacity: 100,
        registeredUsers: [
          { id: 'reg-1', name: 'Amit Verma', email: 'amit@gmail.com', phone: '9876543210', registeredAt: '2026-11-01 10:30 AM', status: 'approved' },
          { id: 'reg-2', name: 'Rahul Sharma', email: 'client@eventhub.com', phone: '9123456780', registeredAt: '2026-11-02 09:15 AM', status: 'pending' }
        ],
        status: 'Upcoming',
        description: 'Modern web architectures and cloud microservices.'
      },
      {
        id: 'evt-102',
        title: 'UI/UX Interactive Workshop',
        date: '2026-11-12',
        category: 'Design',
        location: 'Design Studio, Mumbai',
        capacity: 30,
        registeredUsers: [],
        status: 'Upcoming',
        description: 'Accessible tokens and real user journey prototyping.'
      }
    ];

    let users = JSON.parse(localStorage.getItem('EVENT_HUB_APP_USERS')) || INITIAL_USERS;
    let events = JSON.parse(localStorage.getItem('EVENT_HUB_APP_EVENTS')) || INITIAL_EVENTS;
    let currentUser = JSON.parse(localStorage.getItem('EVENT_HUB_APP_SESSION')) || null;

    function saveState() {
      localStorage.setItem('EVENT_HUB_APP_EVENTS', JSON.stringify(events));
      localStorage.setItem('EVENT_HUB_APP_USERS', JSON.stringify(users));
      renderViews();
    }

    // ================= AUTH CONTROLLERS =================
    function switchAuthTab(tab) {
      const loginTab = document.getElementById('authTabLogin');
      const regTab = document.getElementById('authTabRegister');
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');

      document.getElementById('loginError').classList.add('hidden');
      document.getElementById('regError').classList.add('hidden');

      if (tab === 'login') {
        loginTab.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-sm transition";
        regTab.className = "flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition";
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      } else {
        regTab.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-sm transition";
        loginTab.className = "flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition";
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      }
    }

    function autoFill(email, pass) {
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = pass;
    }

    function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass = document.getElementById('loginPassword').value;
      const errorBox = document.getElementById('loginError');

      const user = users.find(u => u.email.toLowerCase() === email && u.password === pass);

      if (!user) {
        errorBox.textContent = 'Invalid credentials. Please verify email and password.';
        errorBox.classList.remove('hidden');
        return;
      }

      errorBox.classList.add('hidden');
      currentUser = user;
      localStorage.setItem('EVENT_HUB_APP_SESSION', JSON.stringify(currentUser));
      bootSession();
    }

    function handleSignup(e) {
      e.preventDefault();
      const role = document.getElementById('regRole').value;
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const pass = document.getElementById('regPass').value;
      const errorBox = document.getElementById('regError');

      if (users.some(u => u.email.toLowerCase() === email)) {
        errorBox.textContent = 'Account already exists with this email address.';
        errorBox.classList.remove('hidden');
        return;
      }

      const newUser = { name, email, password: pass, role };
      users.push(newUser);
      currentUser = newUser;
      localStorage.setItem('EVENT_HUB_APP_SESSION', JSON.stringify(currentUser));
      saveState();
      bootSession();
    }

    function handleLogout() {
      currentUser = null;
      localStorage.removeItem('EVENT_HUB_APP_SESSION');
      document.getElementById('authScreen').classList.remove('hidden');
      document.getElementById('mainApp').classList.add('hidden');
    }

    function bootSession() {
      if (!currentUser) {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        return;
      }

      document.getElementById('authScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');

      document.getElementById('userDisplayName').textContent = currentUser.name;
      const badge = document.getElementById('userRoleBadge');
      badge.textContent = currentUser.role.toUpperCase();

      if (currentUser.role === 'admin') {
        badge.className = "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 inline-block bg-amber-400 text-slate-950 font-bold";
        document.getElementById('adminPortal').classList.remove('hidden');
        document.getElementById('clientPortal').classList.add('hidden');
      } else {
        badge.className = "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 inline-block bg-indigo-900 text-indigo-100 border border-indigo-400/30";
        document.getElementById('clientPortal').classList.remove('hidden');
        document.getElementById('adminPortal').classList.add('hidden');
      }

      renderViews();
    }

    function renderViews() {
      if (!currentUser) return;
      if (currentUser.role === 'admin') {
        renderAdmin();
      } else {
        renderClient();
      }
    }

    // ================= CLIENT RENDER =================
    function renderClient() {
      renderClientBookings();

      const query = (document.getElementById('clientSearch').value || '').toLowerCase();
      const cat = document.getElementById('clientCategory').value;
      const grid = document.getElementById('clientGrid');

      const filtered = events.filter(evt => {
        const matchesQuery = evt.title.toLowerCase().includes(query) || evt.location.toLowerCase().includes(query);
        const matchesCat = cat === 'ALL' || evt.category === cat;
        return matchesQuery && matchesCat && evt.status !== 'Cancelled';
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <p class="text-sm font-semibold text-slate-600">No events found matching your criteria.</p>
        </div>`;
        return;
      }

      grid.innerHTML = filtered.map(evt => {
        // Seat count only increases for APPROVED attendees
        const confirmedAttendees = (evt.registeredUsers || []).filter(u => u.status === 'approved').length;
        const isFull = confirmedAttendees >= evt.capacity;
        const pct = Math.min(Math.round((confirmedAttendees / evt.capacity) * 100), 100);
        const badgeColor = `badge-${evt.status.toLowerCase()}`;

        // Check if current user has already applied
        const userApp = (evt.registeredUsers || []).find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

        let btnHtml = '';
        if (userApp) {
          if (userApp.status === 'approved') {
            btnHtml = `<button onclick="viewConfirmedTicket('${evt.id}')" class="w-full mt-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center justify-center space-x-1.5">
              <i class="fa-solid fa-check"></i> <span>Seat Confirmed • View Pass</span>
            </button>`;
          } else if (userApp.status === 'rejected') {
            btnHtml = `<button disabled class="w-full mt-4 py-2 text-xs font-semibold rounded-lg bg-rose-100 text-rose-600 cursor-not-allowed">Application Rejected</button>`;
          } else {
            btnHtml = `<button disabled class="w-full mt-4 py-2 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 cursor-not-allowed flex items-center justify-center space-x-1">
              <i class="fa-solid fa-clock"></i> <span>Pending Admin Approval</span>
            </button>`;
          }
        } else {
          btnHtml = `<button onclick="openRegisterModal('${evt.id}')" ${isFull || evt.status !== 'Upcoming' ? 'disabled' : ''} 
            class="w-full mt-4 py-2 text-xs font-bold rounded-lg transition ${
              isFull ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }">
            ${isFull ? 'Full (Sold Out)' : 'Apply to Attend'}
          </button>`;
        }

        return `
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded ${badgeColor}">${evt.status}</span>
                <span class="text-[11px] font-semibold text-slate-500">${evt.category}</span>
              </div>
              <h3 class="font-bold text-base text-slate-800 leading-snug">${evt.title}</h3>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${evt.description || 'No description added.'}</p>
              
              <div class="mt-3 space-y-1 text-xs text-slate-600">
                <div><i class="fa-regular fa-calendar w-4 text-slate-400"></i> ${evt.date}</div>
                <div><i class="fa-solid fa-location-dot w-4 text-slate-400"></i> ${evt.location}</div>
              </div>

              <div class="mt-4">
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-slate-500">Confirmed Seats</span>
                  <span class="text-slate-700">${confirmedAttendees} / ${evt.capacity}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${pct}%"></div>
                </div>
              </div>
            </div>

            ${btnHtml}
          </div>
        `;
      }).join('');
    }

    function renderClientBookings() {
      const container = document.getElementById('clientBookingsList');
      const userBookings = [];

      events.forEach(evt => {
        (evt.registeredUsers || []).forEach(u => {
          if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
            userBookings.push({ event: evt, registration: u });
          }
        });
      });

      if (userBookings.length === 0) {
        container.innerHTML = `<p class="py-3 text-slate-400 text-xs italic">You have not registered for any events yet.</p>`;
        return;
      }

      container.innerHTML = userBookings.map(item => {
        let statusBadge = '';
        let action = '';

        if (item.registration.status === 'approved') {
          statusBadge = `<span class="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]"><i class="fa-solid fa-circle-check mr-1"></i>Approved</span>`;
          action = `<button onclick="viewConfirmedTicket('${item.event.id}')" class="text-xs text-indigo-600 hover:underline font-semibold">View Pass</button>`;
        } else if (item.registration.status === 'rejected') {
          statusBadge = `<span class="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]"><i class="fa-solid fa-circle-xmark mr-1"></i>Rejected</span>`;
          action = `<span class="text-xs text-slate-400">Unavailable</span>`;
        } else {
          statusBadge = `<span class="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[11px]"><i class="fa-solid fa-hourglass-half mr-1"></i>Pending Review</span>`;
          action = `<span class="text-xs text-slate-400">Waiting for Admin</span>`;
        }

        return `
          <div class="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="font-bold text-slate-800">${item.event.title}</div>
              <div class="text-xs text-slate-500">${item.event.date} • ${item.event.location}</div>
            </div>
            <div class="flex items-center space-x-3">
              ${statusBadge}
              ${action}
            </div>
          </div>
        `;
      }).join('');
    }

    // ================= ADMIN RENDER =================
    function renderAdmin() {
      document.getElementById('metricTotal').textContent = events.length;

      let totalPending = 0;
      let totalConfirmed = 0;

      events.forEach(e => {
        (e.registeredUsers || []).forEach(u => {
          if (u.status === 'pending') totalPending++;
          if (u.status === 'approved') totalConfirmed++;
        });
      });

      document.getElementById('metricPending').textContent = totalPending;
      document.getElementById('metricConfirmed').textContent = totalConfirmed;
      document.getElementById('metricUpcoming').textContent = events.filter(e => e.status === 'Upcoming').length;

      const tbody = document.getElementById('adminTableBody');
      if (events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No events found.</td></tr>`;
        return;
      }

      tbody.innerHTML = events.map(evt => {
        const approvedCount = (evt.registeredUsers || []).filter(u => u.status === 'approved').length;
        const pendingCount = (evt.registeredUsers || []).filter(u => u.status === 'pending').length;
        const pct = Math.min(Math.round((approvedCount / evt.capacity) * 100), 100);

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="p-3 sm:p-4">
              <div class="font-semibold text-slate-800">${evt.title}</div>
              <span class="text-[10px] text-slate-500 uppercase">${evt.category}</span>
            </td>
            <td class="p-3 sm:p-4 text-xs">
              <div>${evt.date}</div>
              <div class="text-slate-400">${evt.location}</div>
            </td>
            <td class="p-3 sm:p-4">
              <div class="text-xs font-semibold mb-1">${approvedCount} / ${evt.capacity} confirmed</div>
              <div class="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${pct}%"></div>
              </div>
            </td>
            <td class="p-3 sm:p-4">
              <button onclick="openApprovalModal('${evt.id}')" class="px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center space-x-1.5 ${
                pendingCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200'
              }">
                <i class="fa-solid fa-user-check"></i>
                <span>Queue (${pendingCount} Pending)</span>
              </button>
            </td>
            <td class="p-3 sm:p-4 text-right space-x-2">
              <button onclick="editModal('${evt.id}')" class="text-slate-400 hover:text-indigo-600" title="Edit Event"><i class="fa-solid fa-pen"></i></button>
              <button onclick="deleteEvent('${evt.id}')" class="text-slate-400 hover:text-rose-600" title="Delete Event"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // ================= CLIENT REGISTRATION =================
    function openRegisterModal(eventId) {
      const evt = events.find(e => e.id === eventId);
      if (!evt) return;

      document.getElementById('regEventId').value = evt.id;
      document.getElementById('regEventTitle').textContent = evt.title + ' • ' + evt.date;
      document.getElementById('registerForm').reset();

      if (currentUser) {
        document.getElementById('attendeeName').value = currentUser.name || '';
        document.getElementById('attendeeEmail').value = currentUser.email || '';
      }

      const modal = document.getElementById('registerModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeRegisterModal() {
      const modal = document.getElementById('registerModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function handleRegistrationSubmit(e) {
      e.preventDefault();
      const eventId = document.getElementById('regEventId').value;
      const name = document.getElementById('attendeeName').value.trim();
      const email = document.getElementById('attendeeEmail').value.trim();
      const phone = document.getElementById('attendeePhone').value.trim();

      const evt = events.find(item => item.id === eventId);
      if (!evt) return;

      if (!evt.registeredUsers) evt.registeredUsers = [];

      // Check if already applied
      if (evt.registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('You have already applied for this event!');
        closeRegisterModal();
        return;
      }

      const now = new Date();
      const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Save application with PENDING status
      evt.registeredUsers.push({
        id: 'reg-' + Date.now(),
        name,
        email,
        phone,
        registeredAt: timestamp,
        status: 'pending'
      });

      saveState();
      closeRegisterModal();
      alert('Application submitted! Your seat is pending approval from the organizer.');
    }

    // ================= ADMIN APPROVAL SYSTEM =================
    let activeApprovalEventId = null;

    function openApprovalModal(eventId) {
      activeApprovalEventId = eventId;
      const evt = events.find(e => e.id === eventId);
      if (!evt) return;

      document.getElementById('attendeeModalSubtitle').textContent = `${evt.title} (Capacity: ${evt.capacity})`;
      renderApprovalTable(evt);

      const modal = document.getElementById('attendeesModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function renderApprovalTable(evt) {
      const tbody = document.getElementById('attendeeTableBody');
      const list = evt.registeredUsers || [];

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">No applicants yet for this event.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(u => {
        let badge = '';
        let actionButtons = '';

        if (u.status === 'approved') {
          badge = `<span class="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">APPROVED</span>`;
          actionButtons = `
            <button onclick="updateStatus('${u.id}', 'rejected')" class="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-xs">
              Revoke / Reject
            </button>
          `;
        } else if (u.status === 'rejected') {
          badge = `<span class="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">REJECTED</span>`;
          actionButtons = `
            <button onclick="updateStatus('${u.id}', 'approved')" class="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-semibold">
              Approve Now
            </button>
          `;
        } else {
          badge = `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">PENDING</span>`;
          actionButtons = `
            <button onclick="updateStatus('${u.id}', 'approved')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold mr-1">
              <i class="fa-solid fa-check"></i> Approve
            </button>
            <button onclick="updateStatus('${u.id}', 'rejected')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded text-xs font-bold">
              <i class="fa-solid fa-xmark"></i> Reject
            </button>
          `;
        }

        return `
          <tr class="hover:bg-slate-50 border-b">
            <td class="p-2.5">
              <div class="font-semibold text-slate-800">${u.name}</div>
              <div class="text-[11px] text-slate-500">${u.email}</div>
            </td>
            <td class="p-2.5 font-mono text-slate-600">${u.phone}</td>
            <td class="p-2.5 text-slate-400 text-[11px]">${u.registeredAt}</td>
            <td class="p-2.5">${badge}</td>
            <td class="p-2.5 text-right">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    }

    function updateStatus(regId, newStatus) {
      const evt = events.find(e => e.id === activeApprovalEventId);
      if (!evt) return;

      // Check capacity before approving
      if (newStatus === 'approved') {
        const approvedCount = (evt.registeredUsers || []).filter(u => u.status === 'approved').length;
        if (approvedCount >= evt.capacity) {
          alert('Cannot approve: Event capacity limit has already been reached!');
          return;
        }
      }

      evt.registeredUsers = evt.registeredUsers.map(u => {
        if (u.id === regId) {
          return { ...u, status: newStatus };
        }
        return u;
      });

      saveState();
      renderApprovalTable(evt);
    }

    function closeAttendeesModal() {
      const modal = document.getElementById('attendeesModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // ================= PASS / TICKET DISPLAY =================
    function viewConfirmedTicket(eventId) {
      const evt = events.find(e => e.id === eventId);
      if (!evt) return;

      const userApp = (evt.registeredUsers || []).find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (!userApp || userApp.status !== 'approved') return;

      document.getElementById('ticketName').textContent = userApp.name;
      document.getElementById('ticketEvent').textContent = evt.title;
      document.getElementById('ticketId').textContent = 'PASS-' + userApp.id.toUpperCase();

      const modal = document.getElementById('ticketModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeTicketModal() {
      const modal = document.getElementById('ticketModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // ================= EVENT CRUD (ADMIN) =================
    function deleteEvent(id) {
      if (confirm('Delete this event permanently?')) {
        events = events.filter(e => e.id !== id);
        saveState();
      }
    }

    function openModal() {
      document.getElementById('modalHeading').textContent = 'Add New Event';
      document.getElementById('formId').value = '';
      document.getElementById('modalForm').reset();
      const modal = document.getElementById('eventModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeModal() {
      const modal = document.getElementById('eventModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function editModal(id) {
      const evt = events.find(e => e.id === id);
      if (!evt) return;

      document.getElementById('modalHeading').textContent = 'Edit Event Details';
      document.getElementById('formId').value = evt.id;
      document.getElementById('formTitle').value = evt.title;
      document.getElementById('formDate').value = evt.date;
      document.getElementById('formCategory').value = evt.category;
      document.getElementById('formLocation').value = evt.location;
      document.getElementById('formCapacity').value = evt.capacity;
      document.getElementById('formDesc').value = evt.description || '';

      const modal = document.getElementById('eventModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('formId').value;
      const title = document.getElementById('formTitle').value.trim();
      const date = document.getElementById('formDate').value;
      const category = document.getElementById('formCategory').value;
      const location = document.getElementById('formLocation').value.trim();
      const capacity = parseInt(document.getElementById('formCapacity').value, 10);
      const description = document.getElementById('formDesc').value.trim();

      const today = new Date().toISOString().split('T')[0];
      const status = date < today ? 'Completed' : 'Upcoming';

      if (id) {
        events = events.map(item => item.id === id ? { ...item, title, date, category, location, capacity, description, status } : item);
      } else {
        events.unshift({
          id: 'evt-' + Date.now(),
          title,
          date,
          category,
          location,
          capacity,
          registeredUsers: [],
          status,
          description
        });
      }

      saveState();
      closeModal();
    }

    // Launch App
    bootSession();