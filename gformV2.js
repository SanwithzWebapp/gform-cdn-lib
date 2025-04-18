/*! gform.js v1.2.0 | MIT License */
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
      f.action = `https://docs.google.com/forms/d/e/${fid}/formResponse?usp=pp_url`;
      ps.forEach(([key, lab])=>{
        const id = key.replace(/\./g,'_');
        fld.insertAdjacentHTML('beforeend',`
          <div class=\"mb-3\">\n            <label class=\"form-label\" for=\"${id}\">${lab}</label>\n            <input class=\"form-control\" id=\"${id}\" name=\"${key}\" placeholder=\"กรุณากรอก ${lab}\" required>\n          </div>`);
      });
      // ฟังก์ชันโหลดตารางถ้ามี historyUrl
      const loadHistory = ()=>{
        fetch(historyUrl)
          .then(r=>r.json())
          .then(rows=> this._renderHistory(rows))
          .catch(_=> document.getElementById('historyBody').innerHTML =
            '<tr><td colspan=\"100%\" class=\"text-center py-4 text-danger\">โหลดข้อมูลไม่สำเร็จ</td></tr>');
      };
      // submit & reset
      f.addEventListener('submit', e=>{
        if(!f.checkValidity()){
          e.preventDefault(); f.classList.add('was-validated');
        } else {
          h.onload = ()=>{
            s.style.display='';
            f.reset(); f.classList.remove('was-validated');
            // รีเฟรชตารางถ้ามี
            if(historyUrl) loadHistory();
            setTimeout(()=> s.style.display='none',3000);
          };
        }
      });
      // ถ้ามี historyUrl ให้โหลดเมื่อเปิดแท็บ
      if(historyUrl){
        let loaded=false;
        document.querySelector('[data-bs-target="#tabHistory"]').addEventListener('shown.bs.tab',()=>{
          if(!loaded){ loaded=true; loadHistory(); }
        });
      }
    },
    // ฟังก์ชันช่วยสร้างตารางย้อนหลัง
    _renderHistory(rows){
      const head = document.getElementById('historyHead'),
            body = document.getElementById('historyBody');
      head.innerHTML=''; body.innerHTML='';
      if(!rows.length){
        body.innerHTML='<tr><td colspan="100%" class="text-center py-4">ไม่มีข้อมูล</td></tr>';
        return;
      }
      Object.keys(rows[0]).forEach(k=>{
        const th=document.createElement('th'); th.textContent=k; head.appendChild(th);
      });
      rows.forEach(r=>{
        const tr=document.createElement('tr');
        Object.values(r).forEach(v=>{ const td=document.createElement('td'); td.textContent=v; tr.appendChild(td); });
        body.appendChild(tr);
      });
    }
  };
})();
