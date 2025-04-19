;(function(){
  // อ่าน config ที่บอกในหน้า HTML
  const { formUrl, liffId } = window.PREFILL_CONFIG || {};
  if (!formUrl || !liffId) {
    console.error('Missing PREFILL_CONFIG.formUrl or .liffId');
    return;
  }

  // เตรียมค่าจาก formUrl
  const url    = new URL(formUrl);
  const match  = url.pathname.match(/\/d\/e\/([^\/]+)\//);
  const formId = match ? match[1] : '';
  const params = [...url.searchParams.entries()]
                   .filter(([k]) => k.startsWith('entry.'));

  // สร้าง UI เมื่อ DOM พร้อม
  document.addEventListener('DOMContentLoaded', () => {
    const f   = document.getElementById('f');
    const fld = document.getElementById('fields');
    const s   = document.getElementById('s');
    const h   = document.querySelector('iframe[name=h]');

    // ตั้ง action
    f.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    // สร้างฟิลด์
    params.forEach(([key,label]) => {
      const id     = key.replace(/\./g, '_');
      const isAuto = ['uid','name'].includes(label.toLowerCase());
      fld.insertAdjacentHTML('beforeend', `
        <div class="mb-3">
          <label class="form-label" for="${id}">${label}</label>
          <input class="form-control"
                 id="${id}"
                 name="${key}"
                 placeholder="กรุณากรอก ${label}"
                 ${isAuto ? 'readonly' : ''}
                 required>
        </div>`);
    });

    // หา key ของ UID/Name
    const uidParam  = params.find(([,lbl]) => lbl.toLowerCase()==='uid')?.[0];
    const nameParam = params.find(([,lbl]) => lbl.toLowerCase()==='name')?.[0];

    // LIFF init + fill
    liff.init({ liffId })
      .then(() => liff.isLoggedIn() ? liff.getProfile() : liff.login().then(() => liff.getProfile()))
      .then(profile => {
        if (uidParam) {
          const inp = document.querySelector(`input[name="${uidParam}"]`);
          if (inp) inp.value = profile.userId;
        }
        if (nameParam) {
          const inp = document.querySelector(`input[name="${nameParam}"]`);
          if (inp) inp.value = profile.displayName;
        }
      })
      .catch(err => console.error('LIFF error:', err));

    // Submit handler
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
