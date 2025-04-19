// === prefill-liff.js ===
;(function(){
  const cfg = window.PREFILL_CONFIG || {};
  const formUrl = cfg.FORM_URL;
  const liffId  = cfg.LIFF_ID;
  if (!formUrl || !liffId) {
    console.error('ต้องกำหนด window.PREFILL_CONFIG.FORM_URL และ .LIFF_ID');
    return;
  }

  const url    = new URL(formUrl);
  const match  = url.pathname.match(/\/d\/e\/([^\/]+)\//);
  const formId = match ? match[1] : '';
  const params = [...url.searchParams.entries()].filter(([k]) => k.startsWith('entry.'));

  document.addEventListener('DOMContentLoaded', () => {
    const f   = document.getElementById('f');
    const fld = document.getElementById('fields');
    const s   = document.getElementById('s');
    const h   = document.querySelector('iframe[name=h]');
    const img = document.getElementById('profile-img');

    if (!f || !fld || !s || !h) {
      console.error('ไม่พบองค์ประกอบพื้นฐาน (f, fields, s, h)');
      return;
    }

    // ตั้ง action ของฟอร์ม
    f.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    // สร้างฟิลด์
    params.forEach(([key,label]) => {
      const id = key.replace(/\./g, '_');
      const isUID = label.toLowerCase() === 'uid';
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

    // หา param ชื่อ uid/name
    const uidParam  = params.find(([,lbl])=>lbl.toLowerCase()==='uid')?.[0];
    const nameParam = params.find(([,lbl])=>lbl.toLowerCase()==='name')?.[0];

    // LIFF init + fill
    liff.init({ liffId })
      .then(() => liff.isLoggedIn() ? liff.getProfile() : liff.login().then(()=>liff.getProfile()))
      .then(profile => {
        if (uidParam) {
          const inp = document.querySelector(`input[name="${uidParam}"]`);
          if (inp) inp.value = profile.userId;
        }
        if (nameParam) {
          const inp = document.querySelector(`input[name="${nameParam}"]`);
          if (inp) inp.value = profile.displayName;
        }
        if (img) {
          img.src = profile.pictureUrl;
          img.style.display = 'block';
        }
      })
      .catch(console.error);

    // submit handler
    f.addEventListener('submit', e => {
      if (!f.checkValidity()) {
        e.preventDefault();
        f.classList.add('was-validated');
      } else {
        h.onload = () => {
          s.style.display = '';
          f.reset();
          f.classList.remove('was-validated');
          setTimeout(()=> s.style.display = 'none',3000);
        };
      }
    });
  });
})();
