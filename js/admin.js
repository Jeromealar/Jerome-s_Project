'use strict';

(() => {
  const sections = ['overview', 'event', 'publications', 'contacts', 'inbox'];
  const titles = {
    overview: 'Overview',
    event: 'Events',
    publications: 'Insights library',
    contacts: 'Contacts & emails',
    inbox: 'Inquiry inbox'
  };
  const sidebar = document.querySelector('.admin-sidebar');
  const status = document.getElementById('admin-status');
  let selectedInquiryId = null;
  let editingEventId = null;
  let statusTimer;

  if (!window.RafaDemo) {
    setStatus('Admin preview could not load site settings. Reload the page and try again.', true);
    return;
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
    status.classList.add('is-visible');
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => status.classList.remove('is-visible'), 4500);
  }

  function showPanel(name) {
    if (!sections.includes(name)) {
      return;
    }

    document.querySelectorAll('[data-panel-content]').forEach(panel => {
      const active = panel.dataset.panelContent === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    document.querySelectorAll('.admin-nav__item').forEach(button => {
      const active = button.dataset.panel === name;
      button.classList.toggle('is-active', active);
      if (active) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });
    document.getElementById('page-title').textContent = titles[name];
    sidebar.classList.remove('is-open');
  }

  function displayDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Date to be confirmed';
    }
    return new Intl.DateTimeFormat('en', { ...options, timeZone: 'UTC' }).format(date);
  }

  function fillForms(data) {
    const contactsForm = document.getElementById('contacts-form');
    Object.entries(data.contacts).forEach(([name, value]) => {
      if (contactsForm.elements[name]) {
        contactsForm.elements[name].value = value;
      }
    });
  }

  function renderOverview(data, publications) {
    const unreadCount = data.inquiries.filter(inquiry => !inquiry.read).length;
    const contactsCount = Object.values(data.contacts).filter(value => value.trim()).length;
    const nextEvent = data.events
      .filter(event => event.startDate >= new Date().toISOString().slice(0, 10))
      .sort((left, right) => left.startDate.localeCompare(right.startDate))[0];
    document.getElementById('overview-event-name').textContent = nextEvent?.name || 'No upcoming events';
    document.getElementById('overview-event-date').textContent = nextEvent
      ? `${displayDate(nextEvent.startDate, { month: 'long', day: 'numeric' })} – ${displayDate(nextEvent.endDate, { month: 'long', day: 'numeric', year: 'numeric' })}`
      : `${data.events.length} event${data.events.length === 1 ? '' : 's'} in the calendar`;
    document.getElementById('overview-inquiry-count').textContent = String(data.inquiries.length);
    document.getElementById('overview-unread-count').textContent =
      unreadCount === 1 ? '1 new message' : `${unreadCount} new messages`;
    document.getElementById('overview-contact-count').textContent = String(contactsCount);
    document.getElementById('overview-publication-count').textContent = String(publications.length);
    document.getElementById('nav-inbox-count').textContent = String(unreadCount);
    document.getElementById('inbox-total').textContent =
      data.inquiries.length === 1 ? '1 message' : `${data.inquiries.length} messages`;
  }

  function renderEventList(events) {
    const list = document.getElementById('event-list');
    list.replaceChildren();
    const sortedEvents = [...events].sort((left, right) => left.startDate.localeCompare(right.startDate));
    if (sortedEvents.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'event-list__empty';
      const heading = document.createElement('h3');
      heading.textContent = 'No events yet';
      const message = document.createElement('p');
      message.textContent = 'Create an event to share it on the public website.';
      empty.append(heading, message);
      list.append(empty);
      return;
    }

    sortedEvents.forEach(event => {
      const item = document.createElement('article');
      item.className = 'event-list__item';
      const details = document.createElement('div');
      details.className = 'event-list__details';
      const name = document.createElement('h3');
      name.textContent = event.name;
      const session = document.createElement('p');
      session.textContent = event.session;
      const meta = document.createElement('small');
      meta.textContent = `${displayDate(event.startDate)} – ${displayDate(event.endDate)} · ${[event.venue, event.location].filter(Boolean).join(', ')}`;
      details.append(name, session, meta);

      const actions = document.createElement('div');
      actions.className = 'event-list__actions';
      const edit = document.createElement('button');
      edit.className = 'btn btn-admin btn-admin--outline';
      edit.type = 'button';
      edit.dataset.editEvent = event.id;
      edit.textContent = 'Edit';
      const remove = document.createElement('button');
      remove.className = 'btn btn-admin btn-admin--danger';
      remove.type = 'button';
      remove.dataset.deleteEvent = event.id;
      remove.textContent = 'Delete';
      actions.append(edit, remove);
      item.append(details, actions);
      list.append(item);
    });
  }

  function renderPublicationList(publications) {
    const list = document.getElementById('publication-list');
    list.replaceChildren();
    if (publications.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'event-list__empty';
      const heading = document.createElement('h3');
      heading.textContent = 'Your library is ready';
      const message = document.createElement('p');
      message.textContent = 'Add a PDF article to feature it in the public Insights Library preview.';
      empty.append(heading, message);
      list.append(empty);
      return;
    }

    publications.forEach(publication => {
      const item = document.createElement('article');
      item.className = 'publication-item';
      const details = document.createElement('div');
      details.className = 'event-list__details';
      const title = document.createElement('h3');
      title.textContent = publication.title;
      const meta = document.createElement('p');
      meta.textContent = `${publication.type} · ${publication.pillar} · ${displayDate(publication.date)}`;
      const summary = document.createElement('small');
      summary.textContent = `${publication.author} · ${publication.fileName} · ${formatFileSize(publication.fileSize)}`;
      details.append(title, meta, summary);

      const actions = document.createElement('div');
      actions.className = 'event-list__actions';
      const remove = document.createElement('button');
      remove.className = 'btn btn-admin btn-admin--danger';
      remove.type = 'button';
      remove.dataset.deletePublication = publication.id;
      remove.textContent = 'Remove';
      actions.append(remove);
      item.append(details, actions);
      list.append(item);
    });
  }

  function formatFileSize(size) {
    if (!Number.isFinite(size) || size < 0) {
      return 'File size unavailable';
    }
    return size < 1024 * 1024
      ? `${Math.max(1, Math.round(size / 1024))} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function openEventForm(eventData = null) {
    const form = document.getElementById('event-form');
    form.reset();
    editingEventId = eventData?.id || null;
    form.elements.eventId.value = editingEventId || '';
    if (eventData) {
      Object.entries(eventData).forEach(([name, value]) => {
        if (form.elements[name]) {
          form.elements[name].value = value;
        }
      });
    }
    document.getElementById('save-event-button').lastChild.textContent = eventData ? ' Save changes' : ' Save event';
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.name.focus();
  }

  function createEmptyState(title, message) {
    const state = document.createElement('div');
    state.className = 'inbox-empty';
    const icon = document.createElement('i');
    icon.dataset.lucide = 'mail-open';
    icon.setAttribute('aria-hidden', 'true');
    const heading = document.createElement('h3');
    heading.textContent = title;
    const description = document.createElement('p');
    description.textContent = message;
    state.append(icon, heading, description);
    return state;
  }

  function renderInquiryDetail(inquiry) {
    const detail = document.getElementById('inbox-detail');
    detail.replaceChildren();

    if (!inquiry) {
      detail.append(createEmptyState('Select a message', 'Choose an inquiry from your inbox to read it.'));
      return;
    }

    const header = document.createElement('div');
    header.className = 'inbox-detail__header';
    const headingGroup = document.createElement('div');
    const type = document.createElement('p');
    type.className = 'inbox-detail__type';
    type.textContent = inquiry.type === 'briefing' ? 'Briefing request' : 'General inquiry';
    const subject = document.createElement('h3');
    subject.textContent = inquiry.subject || 'New inquiry';
    headingGroup.append(type, subject);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'inbox-delete';
    deleteButton.type = 'button';
    deleteButton.dataset.deleteInquiry = inquiry.id;
    const deleteIcon = document.createElement('i');
    deleteIcon.dataset.lucide = 'trash-2';
    deleteIcon.setAttribute('aria-hidden', 'true');
    deleteButton.append(deleteIcon, document.createTextNode('Delete'));
    header.append(headingGroup, deleteButton);

    const meta = document.createElement('div');
    meta.className = 'inbox-detail__meta';
    const sender = document.createElement('span');
    sender.textContent = `${inquiry.name || 'Website visitor'}${inquiry.organisation ? ` · ${inquiry.organisation}` : ''}`;
    const email = document.createElement('a');
    email.href = `mailto:${inquiry.email}`;
    email.textContent = inquiry.email;
    const received = document.createElement('span');
    received.textContent = displayDate(inquiry.receivedAt, {
      month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
    meta.append(sender, email, received);

    const message = document.createElement('p');
    message.className = 'inbox-detail__message';
    message.textContent = inquiry.message || 'No message provided.';

    const reply = document.createElement('a');
    reply.className = 'inbox-reply';
    reply.href = `mailto:${inquiry.email}`;
    const replyIcon = document.createElement('i');
    replyIcon.dataset.lucide = 'reply';
    replyIcon.setAttribute('aria-hidden', 'true');
    reply.append(replyIcon, document.createTextNode('Reply by email'));

    detail.append(header, meta);
    if (inquiry.role || inquiry.country || inquiry.topic) {
      const context = document.createElement('div');
      context.className = 'inbox-detail__meta';
      context.textContent = [inquiry.role, inquiry.country, inquiry.topic].filter(Boolean).join(' · ');
      detail.append(context);
    }
    detail.append(message, reply);
    if (window.lucide) {
      window.lucide.createIcons({ root: detail });
    }
  }

  function renderInbox(inquiries) {
    const list = document.getElementById('inbox-list');
    list.replaceChildren();
    if (inquiries.length === 0) {
      list.append(createEmptyState('Your inbox is clear', 'New questions and briefing requests will appear here.'));
      renderInquiryDetail(null);
      return;
    }

    inquiries.forEach(inquiry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `inbox-message${inquiry.read ? '' : ' is-unread'}${inquiry.id === selectedInquiryId ? ' is-selected' : ''}`;
      button.dataset.inquiryId = inquiry.id;
      const name = document.createElement('span');
      name.className = 'inbox-message__sender';
      name.textContent = inquiry.name || 'Website visitor';
      const date = document.createElement('span');
      date.className = 'inbox-message__date';
      date.textContent = displayDate(inquiry.receivedAt, { month: 'short', day: 'numeric' });
      const subject = document.createElement('span');
      subject.className = 'inbox-message__subject';
      subject.textContent = inquiry.subject || inquiry.email || 'New inquiry';
      button.append(name, date, subject);
      list.append(button);
    });

    renderInquiryDetail(inquiries.find(inquiry => inquiry.id === selectedInquiryId));
  }

  async function refresh() {
    const data = window.RafaDemo.read();
    fillForms(data);
    renderEventList(data.events);
    renderInbox(data.inquiries);
    let publications = [];
    try {
      publications = await window.RafaDemo.listPublications();
    } catch (error) {
      console.error('Unable to load the article library.', error);
      setStatus(`Could not load the article library: ${error.message}`, true);
    }
    renderOverview(data, publications);
    renderPublicationList(publications);
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  document.querySelectorAll('.admin-nav__item, [data-open-panel]').forEach(button => {
    button.addEventListener('click', () => showPanel(button.dataset.panel || button.dataset.openPanel));
  });

  document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
  });

  document.getElementById('new-event-button').addEventListener('click', () => openEventForm());
  document.getElementById('new-publication-button').addEventListener('click', () => {
    const form = document.getElementById('publication-form');
    form.reset();
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.title.focus();
  });
  document.getElementById('cancel-publication-button').addEventListener('click', () => {
    const form = document.getElementById('publication-form');
    form.reset();
    form.hidden = true;
  });
  document.getElementById('publication-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const file = form.elements.file.files[0];
    if (!file || !/\.pdf$/i.test(file.name)) {
      setStatus('Choose an article in PDF format.', true);
      form.elements.file.focus();
      return;
    }
    const publication = {
      title: form.elements.title.value.trim(),
      author: form.elements.author.value.trim(),
      date: form.elements.date.value,
      pillar: form.elements.pillar.value,
      type: form.elements.type.value,
      abstract: form.elements.abstract.value.trim()
    };
    try {
      await window.RafaDemo.addPublication(publication, file);
      form.reset();
      form.hidden = true;
      await refresh();
      setStatus('Article added to the Insights Library in this browser.');
    } catch (error) {
      console.error('Unable to add article to the library.', error);
      setStatus(`Could not add the article: ${error.message}`, true);
    }
  });
  document.getElementById('publication-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-delete-publication]');
    if (!button || !window.confirm('Remove this article from the Insights Library in this browser?')) {
      return;
    }
    try {
      await window.RafaDemo.deletePublication(button.dataset.deletePublication);
      await refresh();
      setStatus('Article removed from the Insights Library in this browser.');
    } catch (error) {
      console.error('Unable to remove article from the library.', error);
      setStatus(`Could not remove the article: ${error.message}`, true);
    }
  });
  document.getElementById('cancel-event-button').addEventListener('click', () => {
    editingEventId = null;
    document.getElementById('event-form').hidden = true;
  });
  document.getElementById('event-list').addEventListener('click', event => {
    const editButton = event.target.closest('[data-edit-event]');
    const deleteButton = event.target.closest('[data-delete-event]');
    if (editButton) {
      const selectedEvent = window.RafaDemo.read().events.find(item => item.id === editButton.dataset.editEvent);
      if (selectedEvent) {
        openEventForm(selectedEvent);
      }
      return;
    }
    if (!deleteButton || !window.confirm('Delete this event from the public website?')) {
      return;
    }
    try {
      window.RafaDemo.deleteEvent(deleteButton.dataset.deleteEvent);
      if (editingEventId === deleteButton.dataset.deleteEvent) {
        editingEventId = null;
        document.getElementById('event-form').hidden = true;
      }
      setStatus('Event deleted from the public website.');
    } catch (error) {
      console.error('Unable to delete event.', error);
      setStatus(`Could not delete the event: ${error.message}`, true);
    }
  });

  document.getElementById('event-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    delete data.eventId;
    if (data.endDate < data.startDate) {
      setStatus('The event end date must be on or after the start date.', true);
      form.elements.endDate.focus();
      return;
    }
    try {
      if (editingEventId) {
        window.RafaDemo.updateEvent(editingEventId, data);
        setStatus('Event details updated on the public site in this browser.');
      } else {
        window.RafaDemo.addEvent(data);
        setStatus('Event added to the public site in this browser.');
      }
      editingEventId = null;
      form.hidden = true;
    } catch (error) {
      console.error('Unable to save event details.', error);
      setStatus(`Could not save event details: ${error.message}`, true);
    }
  });

  document.getElementById('contacts-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      window.RafaDemo.updateContacts(data);
      setStatus('Contact details saved and updated on the public site in this browser.');
    } catch (error) {
      console.error('Unable to save contact details.', error);
      setStatus(`Could not save contact details: ${error.message}`, true);
    }
  });

  document.getElementById('inbox-list').addEventListener('click', event => {
    const button = event.target.closest('[data-inquiry-id]');
    if (!button) {
      return;
    }
    selectedInquiryId = button.dataset.inquiryId;
    try {
      window.RafaDemo.updateInquiry(selectedInquiryId, { read: true });
      refresh();
    } catch (error) {
      console.error('Unable to open inquiry.', error);
      setStatus(`Could not open inquiry: ${error.message}`, true);
    }
  });

  document.getElementById('inbox-detail').addEventListener('click', event => {
    const button = event.target.closest('[data-delete-inquiry]');
    if (!button || !window.confirm('Delete this inquiry from the preview inbox?')) {
      return;
    }
    try {
      window.RafaDemo.deleteInquiry(button.dataset.deleteInquiry);
      selectedInquiryId = null;
      refresh();
      setStatus('Inquiry removed from the preview inbox.');
    } catch (error) {
      console.error('Unable to delete inquiry.', error);
      setStatus(`Could not delete inquiry: ${error.message}`, true);
    }
  });

  window.addEventListener('rafa-demo-updated', () => {
    refresh();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'rafa-demo-site-data-v1') {
      refresh();
    }
  });
  refresh();
})();
