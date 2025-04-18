/*! gform.js v1.1.0 | MIT License */
(function(){
  window.GFormLib = {
    init(formSel, statusSel, iframeName, formUrl, historyUrl){
      const f   = document.querySelector(formSel),
            fld = f.querySelector('#fields'),
            s   = document.querySelector(statusSel),
            h   = document.querySelector(`iframe[name=${iframeName}]`),
            url = new URL(formUrl),
            idm = url.pathname.match(/\/d\/e\/([^\/]+)\//),
            fid = idm ? idm[1] : '',
            ps  = [...url.searchParams.entries()].filter(([k])=>k.startsWith('entry.'));
      // ตั้ง action
      f.action = `https://docs.google.com/forms/d/e/${fid}/formResponse?usp=pp_url`;
      // สร้าง inputs
      ps.forEach(([key,lab])=>{
        const id = key.replace(/\./g,'_');
        fld.insertAdjacentHTML('beforeend',`
          <div class="mb-3">
            <label class="form-label" for="${id}">${lab}</label>
            <input class="form-control" id="${id}" name="${key}"
                   placeholder="กรุณากรอก ${lab}" required>
          </div>`);
      });
      // submit & reset
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
      // ถ้ามี historyUrl ให้เซ็ต listener โหลดข้อมูล
      if(historyUrl){
        let loaded=false;
        document.querySelector('[data-bs-target="#tabHistory"]')
          .addEventListener('shown.bs.tab',()=>{
            if(loaded) return;
            loaded = true;
            fetch(historyUrl)
              .then(r=>r.json())
              .then(rows=> this._renderHistory(rows))
              .catch(_=>{
                document.getElementById('historyBody').innerHTML =
                  '<tr><td colspan="3" class="text-center py-4 text-danger">โหลดข้อมูลไม่สำเร็จ</td></tr>';
              });
          });
      }
    },
    // ฟังก์ชันช่วยสร้างตารางย้อนหลัง
    _renderHistory(rows){
      const head = document.getElementById('historyHead'),
            body = document.getElementById('historyBody');
      head.innerHTML = '';
      body.innerHTML = '';
      if(!rows.length){
        body.innerHTML = '<tr><td colspan="3" class="text-center py-4">ไม่มีข้อมูล</td></tr>';
        return;
      }
      // header
      Object.keys(rows[0]).forEach(k=>{
        const th = document.createElement('th');
        th.textContent = k;
        head.appendChild(th);
      });
      // body
      rows.forEach(r=>{
        const tr = document.createElement('tr');
        Object.values(r).forEach(v=>{
          const td = document.createElement('td');
          td.textContent = v;
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }
  };
})();
