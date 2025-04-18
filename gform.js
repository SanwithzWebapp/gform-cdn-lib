/*! gform.js v1.0.0 | MIT License */
(function(){
  window.GFormLib = {
    init(formSelector, statusSelector, iframeName, formUrl){
      const f = document.querySelector(formSelector),
            fld = f.querySelector('#fields'),
            s = document.querySelector(statusSelector),
            h = document.querySelector(`iframe[name=${iframeName}]`),
            url = new URL(formUrl),
            match = url.pathname.match(/\/d\/e\/([^\/]+)\//),
            formId = match ? match[1] : '',
            params = [...url.searchParams.entries()].filter(([k])=>k.startsWith('entry.'));
      f.action = `https://docs.google.com/forms/d/e/${formId}/formResponse?usp=pp_url`;
      params.forEach(([key,label])=>{
        const id = key.replace(/\./g,'_');
        fld.insertAdjacentHTML('beforeend', `
          <div class="mb-3">
            <label class="form-label" for="${id}">${label}</label>
            <input class="form-control" id="${id}" name="${key}"
                   placeholder="กรุณากรอก ${label}" required>
          </div>`);
      });
      f.addEventListener('submit', e=>{
        if(!f.checkValidity()){
          e.preventDefault();
          f.classList.add('was-validated');
        } else {
          h.onload = ()=>{
            s.style.display='';
            f.reset();
            f.classList.remove('was-validated');
            setTimeout(()=>s.style.display='none',3000);
          };
        }
      });
    }
  };
})();
