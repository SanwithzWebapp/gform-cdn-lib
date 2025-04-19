;(function(){
  const { formUrl, liffId } = window.PREFILL_CONFIG || {};
  if (!formUrl || !liffId) {
    console.error('Missing PREFILL_CONFIG');
    return;
  }

  const url    = new URL(formUrl);
  const match  = url.pathname.match(/\/d\/e\/([^\/]+)\//);
  const formId = match ? match[1] : '';
  const params = [...url.searchParams.entries()].filter(([k]) => k.startsWith('entry.'));

  document.addEventListener('DOMContentLoaded', () => {
    const f   = document.getElementById('f'),
          fld = document.getElementById('fields'),
          s   = document.getElementById('s'),
          h   = document.querySelector('iframe[name=h]'),
          img = document.getElementById('profile-img');

    f.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    params.forEach(([key,label]) => {
      const id     = key.replace(/\./g, '_');
      const isUID  = label.toLowerCase() === 'uid';
      fld.insertAdjacentHTML('beforeend', `
        <div class="mb-3">
          <label class="form-label" for="${id}">${label}</label>
          <input class="form-control"
                 id="${id}"
                 name="${key}"
                 placeholder="กรุณากรอก ${label}"
                 ${isUID ? 'readonly' : ''}
                 required>
        </div>`);
    });

    const uidParam  = params.find(([,lbl]) => lbl.toLowerCase()==='uid')?.[0];
    const nameParam = params.find(([,lbl]) => lbl.toLowerCase()==='name')?.[0];

    liff.init({ liffId })
      .then(() => liff.isLoggedIn() 
        ? liff.getProfile() 
        : liff.login().then(() => liff.getProfile())
      )
      .then(profile => {
        if (uidParam) {
          const inp = document.querySelector(`input[name="${uidParam}"]`);
          if (inp) inp.value = profile.userId;
        }
        if (nameParam) {
          const inp = document.querySelector(`input[name="${nameParam}"]`);
          if (inp) inp.value = profile.displayName;
        }
        img.src = profile.pictureUrl;
        img.style.display = 'block';
      })
      .catch(err => console.error('LIFF error:', err));

    f.addEventListener('submit', e => {
      if (!f.checkValidity()) {
        e.preventDefault();
        f.classList.add('was-validated');
      } else {
        h.onload = () => {
          s.style.display = '';
          f.reset();
          f.classList.remove('was-validated');
          setTimeout(() => s.style.display = 'none', 3000);
        };
      }
    });
  });
})();
