import { buildClinicalDocument } from '../document/document-engine';
import { startAttendance, updateAdmission, type Attendance, type ClinicalSection } from '../domain/attendance/attendance';

const labels: Record<ClinicalSection, string> = { qp: 'QP', hda: 'HDA', hpp: 'HPP', exam: 'EXAME', exams: 'EXAMES', hd: 'HD', conduct: 'CONDUTA' };

export function mountApp(root: HTMLElement): void {
  let attendance: Attendance = startAttendance(crypto.randomUUID(), new Date().toISOString()).attendance;
  root.innerHTML = `<div class="shell"><header><div><span class="eyebrow">PRONTO-SOCORRO · OFFLINE-FIRST</span><h1>Zera PS <b>2.0</b></h1><p>Documentação clínica sem redigitação.</p></div><span id="save-state">RASCUNHO LOCAL</span></header><div class="grid"><section class="editor"><nav><button class="active">ADMISSÃO</button><button disabled>REAVALIAÇÃO</button></nav><div id="fields"></div></section><aside><div class="aside-head"><strong>DOCUMENTO CLÍNICO</strong><button id="copy">COPIAR</button></div><pre id="preview">Comece pela queixa principal.</pre></aside></div></div>`;
  const fields = root.querySelector('#fields') as HTMLElement;
  const preview = root.querySelector('#preview') as HTMLElement;
  const saveState = root.querySelector('#save-state') as HTMLElement;

  (Object.keys(labels) as ClinicalSection[]).forEach(key => {
    const wrap = document.createElement('label');
    wrap.innerHTML = `<span>${labels[key]}</span>${key === 'qp' ? '<input autocomplete="off" />' : '<textarea rows="4"></textarea>'}`;
    const input = wrap.querySelector('input,textarea') as HTMLInputElement | HTMLTextAreaElement;
    input.addEventListener('input', () => {
      attendance = updateAdmission(attendance, { [key]: input.value }, new Date().toISOString()).attendance;
      preview.textContent = buildClinicalDocument(attendance) || 'Comece pela queixa principal.';
      localStorage.setItem('zeraps-v2-draft', JSON.stringify(attendance));
      saveState.textContent = 'SALVO NESTE DISPOSITIVO';
    });
    fields.appendChild(wrap);
  });
  root.querySelector('#copy')?.addEventListener('click', async () => navigator.clipboard.writeText(buildClinicalDocument(attendance)));
}
