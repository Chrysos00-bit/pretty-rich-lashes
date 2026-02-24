(function() {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var dateEl = document.getElementById('date');
  if (dateEl) {
    var minDate = (function() {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })();
    var maxDate = (function() {
      var d = new Date();
      d.setMonth(d.getMonth() + 2);
      return d.toISOString().slice(0, 10);
    })();
    dateEl.min = minDate;
    dateEl.max = maxDate;
  }

  var PRICE_LIST = [
    { title: 'For lash extensions', items: [
      { name: 'Classic & Hybrid', price: 40 },
      { name: '2-3D Volume', price: 50 },
      { name: '4D Volume', price: 60 },
      { name: '5D Volume', price: 65 },
      { name: 'Mega Volume', price: 70 }
    ]},
    { title: 'Refill / correction', items: [
      { name: 'Classic & Hybrid', price: 30 },
      { name: '2-3D Volume', price: 40 },
      { name: '4D Volume', price: 50 },
      { name: '5D Volume', price: 55 },
      { name: 'Mega Volume', price: 60 }
    ]},
    { title: 'Additional effects', items: [
      { name: 'Wet Effect, Colourful', price: 5 },
      { name: 'Bottom Lashes', price: 15 },
      { name: 'Removal of eyelashes', price: 10 }
    ]}
  ];

  function getDurationHours() {
    return 170 / 60;
  }

  var services = [];
  PRICE_LIST.forEach(function(g) {
    g.items.forEach(function(it) {
      var name = it.name + ' · ' + g.title;
      services.push({
        id: g.title.toLowerCase().replace(/\s+/g, '-').replace(/[\/]/g, '') + '-' + it.name.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, ''),
        name: name,
        price: it.price,
        durationHours: getDurationHours()
      });
    });
  });

  function padHour(h) { return h < 10 ? '0' + h : '' + h; }

  function timeToMinutes(timeStr) {
    var parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function minutesToTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return padHour(h) + ':' + (m < 10 ? '0' : '') + m;
  }

  var BOOKED_SLOTS_KEY = 'pretty-rich-lashes-booked-slots';

  function getBookedSlots() {
    try {
      var raw = localStorage.getItem(BOOKED_SLOTS_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveBookedSlots(slots) {
    try {
      localStorage.setItem(BOOKED_SLOTS_KEY, JSON.stringify(slots));
    } catch (err) {
      // Ignore storage errors to avoid breaking booking flow.
    }
  }

  function slotKey(dateStr, timeStr) {
    return dateStr + '|' + timeStr;
  }

  function isSlotBooked(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;
    return getBookedSlots().indexOf(slotKey(dateStr, timeStr)) !== -1;
  }

  function markSlotBooked(dateStr, timeStr) {
    if (!dateStr || !timeStr) return;
    var key = slotKey(dateStr, timeStr);
    var slots = getBookedSlots();
    if (slots.indexOf(key) === -1) {
      slots.push(key);
      saveBookedSlots(slots);
    }
  }

  function getSlotsForDate(dateStr, durationHours) {
    if (!dateStr) return [];
    var d = new Date(dateStr + 'T12:00:00');
    var day = d.getDay();
    if (day === 0) return null;
    if (durationHours == null || durationHours <= 0) return [];
    var durationMinutes = Math.round(durationHours * 60);
    var startMin, endMin;
    var slots = [];
    if (day >= 1 && day <= 5) {
      startMin = timeToMinutes('16:30');
      endMin = timeToMinutes('20:00');
      if (startMin + durationMinutes <= endMin) slots.push(minutesToTime(startMin));
    } else if (day === 6) {
      slots = ['08:00', '12:00', '16:30'];
    } else {
      return [];
    }
    return slots;
  }

  var timeWrap = document.getElementById('timeSlots');

  function getSelectedServiceDuration() {
    var sel = document.querySelector('.service-btn.selected');
    if (!sel || !sel.dataset.duration) return null;
    return parseFloat(sel.dataset.duration, 10);
  }

  function renderTimeSlots(dateStr, durationHours) {
    if (!timeWrap) return;
    timeWrap.innerHTML = '';
    if (!dateStr) return;
    if (durationHours == null || durationHours <= 0) {
      var msg = document.createElement('p');
      msg.className = 'time-sunday-msg';
      msg.textContent = 'Select a service to see available times.';
      timeWrap.appendChild(msg);
      return;
    }
    var slots = getSlotsForDate(dateStr, durationHours);
    if (slots === null) {
      var p = document.createElement('p');
      p.className = 'time-sunday-msg';
      p.textContent = 'Sunday appointments are available by request for selected clients. Please contact us directly via WhatsApp.';
      timeWrap.appendChild(p);
      return;
    }
    slots.forEach(function(t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-btn';
      btn.textContent = t;
      if (isSlotBooked(dateStr, t)) {
        btn.disabled = true;
        btn.classList.add('booked');
        btn.setAttribute('aria-label', t + ' unavailable');
      }
      btn.onclick = function() {
        if (this.disabled) return;
        document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
      };
      timeWrap.appendChild(btn);
    });
  }

  function updateTimeSlots() {
    var el = document.getElementById('date');
    var duration = getSelectedServiceDuration();
    renderTimeSlots(el ? el.value : '', duration);
  }

  if (dateEl) {
    dateEl.addEventListener('change', function() {
      document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
      updateTimeSlots();
    });
  }

  var grid = document.getElementById('serviceGrid');
  if (grid) services.forEach(function(s) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'service-btn';
    btn.dataset.id = s.id;
    btn.dataset.name = s.name;
    btn.dataset.duration = String(s.durationHours);
    btn.innerHTML = '<span class="name">' + escapeHtml(s.name) + '</span>';
    btn.onclick = function() {
      document.querySelectorAll('.service-btn').forEach(function(b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
      updateTimeSlots();
    };
    grid.appendChild(btn);
  });

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  window.scrollToBook = function() {
    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function toggleNav() {
    document.getElementById('navToggle').classList.toggle('open');
    document.getElementById('navDropdown').classList.toggle('open');
  }

  window.toggleNav = toggleNav;

  function closeNav() {
    document.getElementById('navToggle').classList.remove('open');
    document.getElementById('navDropdown').classList.remove('open');
  }

  window.closeNav = closeNav;

  function formatDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  var WHATSAPP_NUMBER = '35799777800';

  window.handleSubmit = function(e) {
    e.preventDefault();
    var sel = document.querySelector('.service-btn.selected');
    var timeBtn = document.querySelector('.time-btn.selected');
    var dateInput = document.getElementById('date');
    var nameEl = document.getElementById('name');
    var errEl = document.getElementById('formError');
    var submitBtn = document.getElementById('submitBtn');
    if (!dateInput || !nameEl || !errEl || !submitBtn) return false;

    if (!sel || !dateInput.value) {
      errEl.textContent = 'Please select a service and date.';
      errEl.style.display = 'block';
      return false;
    }
    var duration = getSelectedServiceDuration();
    var slots = getSlotsForDate(dateInput.value, duration);
    if (slots === null) {
      errEl.textContent = 'Sunday appointments are available by request for selected clients. Please contact us directly via WhatsApp.';
      errEl.style.display = 'block';
      return false;
    }
    if (!timeBtn) {
      errEl.textContent = 'Please select a service, date, and time.';
      errEl.style.display = 'block';
      return false;
    }
    var name = nameEl.value.trim();
    if (!name) {
      errEl.textContent = 'Please enter your name.';
      errEl.style.display = 'block';
      return false;
    }

    errEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking…';

    var serviceName = sel.dataset.name;
    var date = dateInput.value;
    var time = timeBtn.textContent;
    if (isSlotBooked(date, time)) {
      errEl.textContent = 'This time slot was just booked. Please choose another time.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm booking';
      updateTimeSlots();
      return false;
    }
    markSlotBooked(date, time);
    var message = 'Hello, I would like to confirm my appointment:\nName: ' + name + '\nService: ' + serviceName + '\nDate: ' + formatDate(date) + '\nTime: ' + time;
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.location.href = url;

    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm booking';
    return false;
  };

  window.resetForm = function() {
    document.querySelectorAll('.service-btn').forEach(function(b) { b.classList.remove('selected'); });
    var dateInput = document.getElementById('date');
    var nameInput = document.getElementById('name');
    var phoneInput = document.getElementById('phone');
    var formError = document.getElementById('formError');
    var successBlock = document.getElementById('successBlock');
    var formBlock = document.getElementById('formBlock');
    if (dateInput) dateInput.value = '';
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (formError) formError.style.display = 'none';
    if (successBlock) successBlock.style.display = 'none';
    if (formBlock) formBlock.style.display = 'block';
    renderTimeSlots('', null);
  };

  var logoWrap = document.querySelector('.hero .logo-wrap');
  if (logoWrap && logoWrap.querySelector('.logo-fallback')) {
    var img = logoWrap.querySelector('img');
    var fallback = logoWrap.querySelector('.logo-fallback');
    if (img && img.complete && !img.naturalWidth) {
      img.style.display = 'none';
      fallback.style.display = 'flex';
    }
  }

  (function scrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  })();
})();
