'use strict';

(() => {
  const storageKey = 'rafa-demo-site-data-v1';
  const siteRootPrefix = /\/pages\//.test(window.location.pathname) ? '' : 'pages/';

  function resolvePublicHref(href) {
    if (!href || /^(?:#|[a-z][a-z0-9+.-]*:)/i.test(href)) return href;
    return siteRootPrefix + href;
  }

  const initialData = {
    events: [{
      id: 'rafa-event-cop31',
      name: 'COP31',
      headline: 'The questions behind a transformative transition.',
      session: 'Dare to Share 2: From Data to Strategic Intelligence',
      description: 'Join the conversation on what the South needs to know to shape a transformative green transition — and bring the strategic questions your institution is working through.',
      startDate: '2026-11-09',
      endDate: '2026-11-20',
      venue: 'Africa Pavilion',
      location: 'Antalya, Türkiye'
    }],
    contacts: {
      generalEmail: '',
      partnershipEmail: '',
      diplomaticEmail: '',
      mediaEmail: '',
      headquarters: ''
    },
    inquiries: []
  };
  const publicationDatabaseName = 'rafa-demo-publication-files-v1';
  let publicationDatabase;

  function read() {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === null) {
      window.localStorage.setItem(storageKey, JSON.stringify(initialData));
      return JSON.parse(JSON.stringify(initialData));
    }

    const data = JSON.parse(saved);
    if (
      !data ||
      typeof data !== 'object' ||
      (!data.event && !Array.isArray(data.events)) ||
      !data.contacts ||
      !Array.isArray(data.inquiries)
    ) {
      throw new Error('Saved demo site data is invalid. Review or clear the browser storage before continuing.');
    }

    const events = Array.isArray(data.events)
      ? data.events
      : [{ ...data.event, id: data.event.id || 'rafa-event-cop31' }];

    return {
      events: events.map((event, index) => ({
        ...initialData.events[0],
        ...event,
        id: event.id || `rafa-event-${index + 1}`
      })),
      contacts: { ...initialData.contacts, ...data.contacts },
      inquiries: data.inquiries
    };
  }

  function openPublicationDatabase() {
    if (!window.indexedDB) {
      return Promise.reject(new Error('This browser does not support local publication storage.'));
    }
    if (publicationDatabase) {
      return Promise.resolve(publicationDatabase);
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(publicationDatabaseName, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('publications')) {
          database.createObjectStore('publications', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        publicationDatabase = request.result;
        publicationDatabase.onversionchange = () => {
          publicationDatabase.close();
          publicationDatabase = null;
        };
        resolve(publicationDatabase);
      };
      request.onerror = () => reject(request.error || new Error('Could not open the local publication library.'));
      request.onblocked = () => reject(new Error('The publication library is busy in another tab. Close other RAFA tabs and try again.'));
    });
  }

  async function publicationRequest(mode, operation) {
    const database = await openPublicationDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('publications', mode);
      const request = operation(transaction.objectStore('publications'));
      let result;
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => reject(request.error || new Error('Could not access the local publication library.'));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error('Could not save changes to the local publication library.'));
      transaction.onabort = () => reject(transaction.error || new Error('The local publication library update was cancelled.'));
    });
  }

  function createPublicationId() {
    return window.crypto && typeof window.crypto.randomUUID === 'function'
      ? `rafa-pub-${window.crypto.randomUUID()}`
      : `rafa-pub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function addPublication(publication, file) {
    if (!(file instanceof Blob) || !file.size || !/\.pdf$/i.test(file.name || '')) {
      throw new Error('Choose a non-empty PDF article file to upload.');
    }
    const savedPublication = {
      ...publication,
      id: createPublicationId(),
      fileName: file.name,
      fileSize: file.size,
      publishedAt: new Date().toISOString(),
      file
    };
    await publicationRequest('readwrite', store => store.add(savedPublication));
    const { file: savedFile, ...publicDetails } = savedPublication;
    return publicDetails;
  }

  async function listPublications() {
    const publications = await publicationRequest('readonly', store => store.getAll());
    return publications
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .map(({ file, ...publication }) => publication);
  }

  async function getPublicationFile(id) {
    const publication = await publicationRequest('readonly', store => store.get(id));
    if (!publication || !(publication.file instanceof Blob)) {
      throw new Error('The article file could not be found in this browser.');
    }
    return publication.file;
  }

  async function deletePublication(id) {
    const existing = await publicationRequest('readonly', store => store.get(id));
    if (!existing) {
      throw new Error('That article could not be found. Refresh the library and try again.');
    }
    await publicationRequest('readwrite', store => store.delete(id));
  }

  function write(data) {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('rafa-demo-updated', { detail: data }));
    return data;
  }

  function createEventId() {
    return window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `rafa-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addEvent(event) {
    const data = read();
    const createdEvent = { ...event, id: createEventId() };
    data.events.unshift(createdEvent);
    write(data);
    return createdEvent;
  }

  function updateEvent(id, event) {
    const data = read();
    const index = data.events.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('That event could not be found. Refresh the event list and try again.');
    }
    data.events[index] = { ...data.events[index], ...event, id };
    return write(data);
  }

  function deleteEvent(id) {
    const data = read();
    const events = data.events.filter(item => item.id !== id);
    if (events.length === data.events.length) {
      throw new Error('That event could not be found. Refresh the event list and try again.');
    }
    data.events = events;
    return write(data);
  }

  function updateContacts(contacts) {
    const data = read();
    data.contacts = { ...data.contacts, ...contacts };
    return write(data);
  }

  function addInquiry(inquiry) {
    const data = read();
    const savedInquiry = {
      ...inquiry,
      id: window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `rafa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      read: false
    };
    data.inquiries.unshift(savedInquiry);
    write(data);
    return savedInquiry;
  }

  function updateInquiry(id, changes) {
    const data = read();
    const inquiry = data.inquiries.find(item => item.id === id);
    if (!inquiry) {
      throw new Error('That inquiry could not be found. Refresh the inbox and try again.');
    }
    Object.assign(inquiry, changes);
    return write(data);
  }

  function deleteInquiry(id) {
    const data = read();
    const inquiries = data.inquiries.filter(item => item.id !== id);
    if (inquiries.length === data.inquiries.length) {
      throw new Error('That inquiry could not be found. Refresh the inbox and try again.');
    }
    data.inquiries = inquiries;
    return write(data);
  }

  window.RafaDemo = Object.freeze({
    read,
    addEvent,
    updateEvent,
    deleteEvent,
    updateContacts,
    addInquiry,
    updateInquiry,
    deleteInquiry,
    addPublication,
    listPublications,
    getPublicationFile,
    deletePublication
  });

  function formattedDate(value, options) {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('en', { ...options, timeZone: 'UTC' }).format(date);
  }

  function upcomingEvents(events) {
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter(event => event.endDate >= today)
      .sort((left, right) => left.startDate.localeCompare(right.startDate));
  }

  function renderEvent(events) {
    const upcoming = upcomingEvents(events);
    const event = upcoming[0];
    renderEventWidget(upcoming);
    if (!event) {
      return;
    }

    const values = {
      name: event.name,
      headline: event.headline,
      session: event.session,
      description: event.description,
      startDay: formattedDate(event.startDate, { day: '2-digit' }),
      endDay: formattedDate(event.endDate, { day: '2-digit' }),
      month: formattedDate(event.startDate, { month: 'long', year: 'numeric' }),
      venue: event.venue,
      location: event.location
    };

    document.querySelectorAll('[data-rafa-event]').forEach(element => {
      const value = values[element.dataset.rafaEvent];
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll('[data-rafa-event-date]').forEach(element => {
      const value = element.dataset.rafaEventDate === 'start'
        ? event.startDate
        : event.endDate;
      if (value) {
        element.setAttribute('datetime', value);
      }
    });
  }

  function renderEventWidget(events) {
    if (document.querySelector('.admin-sidebar')) {
      return;
    }

    let launcher = document.getElementById('rafa-event-launcher');
    let dialog = document.getElementById('rafa-events-dialog');
    if (!launcher || !dialog) {
      launcher = document.createElement('button');
      launcher.id = 'rafa-event-launcher';
      launcher.className = 'rafa-event-launcher';
      launcher.type = 'button';
      launcher.setAttribute('aria-label', 'View upcoming RAFA events');
      launcher.setAttribute('aria-haspopup', 'dialog');
      launcher.innerHTML = '<i data-lucide="calendar-days" aria-hidden="true"></i><span>Events</span>';

      dialog = document.createElement('dialog');
      dialog.id = 'rafa-events-dialog';
      dialog.className = 'rafa-events-dialog';
      dialog.setAttribute('aria-labelledby', 'rafa-events-title');
      dialog.innerHTML = `
        <div class="rafa-events-dialog__header">
          <div><p class="eyebrow">Meet RAFA</p><h2 id="rafa-events-title">Upcoming events</h2></div>
          <button class="rafa-events-dialog__close" type="button" aria-label="Close events"><i data-lucide="x" aria-hidden="true"></i></button>
        </div>
        <div class="rafa-events-dialog__list"></div>`;
      dialog.querySelector('.rafa-events-dialog__close').addEventListener('click', () => dialog.close());
      launcher.addEventListener('click', () => dialog.showModal());
      dialog.addEventListener('click', event => {
        if (event.target === dialog) {
          dialog.close();
        }
      });
      document.body.append(launcher, dialog);
    }

    launcher.hidden = events.length === 0;
    const list = dialog.querySelector('.rafa-events-dialog__list');
    list.replaceChildren();
    events.forEach(event => {
      const card = document.createElement('article');
      card.className = 'rafa-event-card';
      const title = document.createElement('h3');
      title.textContent = event.name;
      const session = document.createElement('p');
      session.className = 'rafa-event-card__session';
      session.textContent = event.session;
      const date = document.createElement('p');
      date.className = 'rafa-event-card__meta';
      date.textContent = `${formattedDate(event.startDate, { month: 'long', day: 'numeric', year: 'numeric' })} – ${formattedDate(event.endDate, { month: 'long', day: 'numeric', year: 'numeric' })}`;
      const location = document.createElement('p');
      location.className = 'rafa-event-card__meta';
      location.textContent = [event.venue, event.location].filter(Boolean).join(' · ');
      card.append(title, session, date, location);
      if (event.description) {
        const description = document.createElement('p');
        description.textContent = event.description;
        card.append(description);
      }
      list.append(card);
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: launcher });
      window.lucide.createIcons({ root: dialog });
    }
  }

  function renderContacts(contacts) {
    document.querySelectorAll('[data-rafa-contact]').forEach(element => {
      const email = contacts[`${element.dataset.rafaContact}Email`];
      const isLink = element instanceof HTMLAnchorElement;
      const valueElement = element.querySelector('[data-rafa-contact-value]') || element;
      if (email) {
        valueElement.textContent = email;
        if (isLink) {
          element.href = `mailto:${email}`;
        }
      } else if (isLink) {
        valueElement.textContent = element.dataset.rafaFallback || 'Contact RAFA through our inquiry form';
        element.href = resolvePublicHref(element.dataset.rafaFallbackHref || 'engage.html#briefing-section');
      }
      element.closest('[data-rafa-contact-card]')?.classList.toggle('is-unconfigured', !email);
    });

    document.querySelectorAll('[data-rafa-headquarters]').forEach(element => {
      const location = contacts.headquarters;
      element.textContent = location || 'Contact the Secretariat through our inquiry form.';
    });
  }

  function renderSite(data) {
    renderEvent(data.events);
    renderContacts(data.contacts);
  }

  try {
    renderSite(read());
    window.addEventListener('rafa-demo-updated', event => renderSite(event.detail));
    window.addEventListener('storage', event => {
      if (event.key === storageKey) {
        renderSite(read());
      }
    });
  } catch (error) {
    console.error('Unable to load RAFA demo site settings.', error);
    const notice = document.createElement('p');
    notice.className = 'rafa-storage-error';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Site settings could not be loaded. Please try again or contact the site administrator.';
    document.body.prepend(notice);
  }
})();
