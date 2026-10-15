const form = document.querySelector('#practice-form');
const summary = document.querySelector('#error-summary');
const list = document.querySelector('#error-list');
const result = document.querySelector('#result');
const fields = [
  {
    input: document.querySelector('#practice-name'),
    help: 'name-help',
    error: document.querySelector('#name-error'),
    message: 'Enter a practice name containing 2 to 40 characters.',
    valid: value => value.trim().length >= 2 && value.trim().length <= 40,
  },
  {
    input: document.querySelector('#session'),
    help: 'session-help',
    error: document.querySelector('#session-error'),
    message: 'Choose HTML structure or CSS layout.',
    valid: value => ['html', 'css'].includes(value),
  },
];

// Native required/minlength constraints remain available if this script cannot run.
form.noValidate = true;
form.addEventListener('submit', event => {
  event.preventDefault();
  result.textContent = '';
  list.replaceChildren();
  for (const field of fields) {
    field.input.removeAttribute('aria-invalid');
    field.input.setAttribute('aria-describedby', field.help);
    field.error.hidden = true;
    field.error.textContent = '';
  }
  const invalid = fields.filter(field => !field.valid(field.input.value));
  summary.hidden = invalid.length === 0;
  for (const field of invalid) {
    field.input.setAttribute('aria-invalid', 'true');
    field.input.setAttribute('aria-describedby', `${field.help} ${field.error.id}`);
    field.error.textContent = field.message;
    field.error.hidden = false;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${field.input.id}`;
    link.textContent = field.message;
    link.addEventListener('click', event => {
      event.preventDefault();
      field.input.focus();
    });
    item.append(link);
    list.append(item);
  }
  if (invalid.length) {
    summary.focus();
  } else {
    result.textContent = 'Practice details checked. Nothing was sent or saved.';
  }
});
