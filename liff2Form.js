// === prefill-liff.js ===
;(function(){
  const cfg     = window.PREFILL_CONFIG || {};
  const formUrl = cfg.formUrl;
  const liffId  = cfg.liffId;
  if (!formUrl || !liffId) {
    console.error('ต้องกำหนด window.PREFILL_CONFIG.formUrl และ .liffId');
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

    if (!f || !fld || !s || !h || !img) {
      console.error('ไม่พบองค์ประกอบพื้นฐาน (f, fields, s, h, profile-img)');
      return;
    }

    // ตั้ง action ของฟอร์ม
    f.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    // สร้างฟิลด์ตาม entry.* ทั้งหมด
    params.forEach(([key,label]) => {
      const id    = key.replace(/\./g, '_');
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

    // หา entry key สำหรับ uid/name
    const uidParam  = params.find(([,lbl])=>lbl.toLowerCase()==='uid')?.[0];
    const nameParam = params.find(([,lbl])=>lbl.toLowerCase()==='name')?.[0];

    // LIFF init + fill
    liff.init({ liffId })
      .then(() => liff.isLoggedIn()
        ? liff.getProfile()
        : liff.login().then(()=>liff.getProfile())
      )
      .then(profile => {
        // UID
        if (uidParam) {
          const inp = document.querySelector(`input[name="${uidParam}"]`);
          if (inp) inp.value = profile.userId;
        }
        // Name (editable)
        if (nameParam) {
          const inp = document.querySelector(`input[name="${nameParam}"]`);
          if (inp) inp.value = profile.displayName;
        }
        // Profile image
        img.src = profile.pictureUrl;
        img.style.display = 'block';
      })
      .catch(console.error);

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
          setTimeout(()=> s.style.display = 'none',3000);
        };
      }
    });
  });
})();
