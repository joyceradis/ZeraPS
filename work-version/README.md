# Zera PS · versão Work

Versão criada em 08/09/2026 e publicada em https://zera-ps.joyceradis.chatgpt.site (acesso privado).

## Conteúdo

- `dist/`: aplicação estática completa, sem dependências de produção.
- `dist/engine.js`: formatação de evolução e regras do módulo local de plantões.
- `check.mjs`: verificações de documentação e elegibilidade.
- `.openai/hosting.json`: identificação da publicação Sites, sem credenciais.

## Executar

Com Python 3: `python -m http.server 8000 --directory work-version/dist` na raiz do repositório. Abrir http://localhost:8000.

Com Node.js 22+: `node work-version/check.mjs`.

## Escopo e limites

Documentação manual com QP/HDA/HPP/EXAME/EXAMES/HD/CONDUTA, atualizações EM TEMPO, passagem de caso e backup JSON. Dados persistem no navegador (localStorage), sem sincronização ou criptografia implementada pela aplicação. Não há geração por IA, interpretação de exames ou integração com prontuário. Usar identificação abreviada e revisar os textos.

O módulo Bot plantão verifica ofertas cadastradas manualmente, bloqueia enfermaria de cardiologia e função reavaliador, permite extra inclusive segunda de dia e verifica sobreposição com confirmações locais. Não monitora o portal, não aceita ofertas externamente, não consulta calendário externo e não implementa regras de sono. A integração operacional está pendente de acesso e definição do portal.

Esta pasta preserva a versão entregue no Work sem substituir a aplicação anterior na raiz. Alterações no GitHub não republicam automaticamente o Sites. Não incluir dados de pacientes, backups, senhas ou tokens no repositório.
