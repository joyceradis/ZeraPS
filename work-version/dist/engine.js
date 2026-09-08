export const headings=['QP','HDA','HPP','EXAME','EXAMES','HD','CONDUTA'];
export function evolution(p){return headings.map(k=>`# ${k}\n${(p[k]?.trim()||'NA').toLocaleUpperCase('pt-BR')}`).join('\n\n')+(p.events.length?'\n\n'+p.events.map(e=>`# EM TEMPO · ${new Date(e.at).toLocaleString('pt-BR')}\n${e.text.toLocaleUpperCase('pt-BR')}`).join('\n\n'):'');}
