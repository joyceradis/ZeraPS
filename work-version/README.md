# Zera PS · versão Work

Aplicação clínica publicada em https://zera-ps.joyceradis.chatgpt.site (acesso privado).

Esta pasta contém a versão básica criada em 08/09/2026. A aplicação anterior na raiz de joyceradis/ZeraPS permanece preservada.

## Conteúdo

- `dist/`: aplicação estática completa desta versão, sem dependências de produção.
- `dist/engine.js`: formatação da evolução clínica.
- `dist/storage.js`: armazenamento clínico, com leitura dos pacientes de dados legados sem apagar o original.
- `check.mjs`: verificações de documentação e preservação dos dados.
- `.openai/hosting.json`: identificação da publicação Sites, sem credenciais.

## Executar

Na raiz do repositório GitHub, com Python 3: `python -m http.server 8000 --directory work-version/dist`. Abrir http://localhost:8000.

Com Node.js 22+: `node work-version/check.mjs`.

No checkout Sites, os caminhos são `dist` e `check.mjs`, respectivamente.

## Escopo e limites

Documentação manual com QP/HDA/HPP/EXAME/EXAMES/HD/CONDUTA, atualizações EM TEMPO, passagem de caso e backup JSON. Dados persistem no navegador (localStorage), sem sincronização ou criptografia implementada pela aplicação. Não há geração por IA, interpretação de exames ou integração com prontuário. Usar identificação abreviada e revisar os textos.

## Projetos separados

O Plantão Bot pertence ao repositório privado https://github.com/joyceradis/bot-plant-o. Não é uma aba nem um módulo do Zera PS. A aba de ofertas local incluída inicialmente por engano foi retirada. O bot existente tem regras e fluxo de aceite em simulação; a integração real com o Escala e a operação contínua ainda não estão concluídas.

A aplicação clínica usa a chave `zera-ps-clinical-v1`. Na primeira leitura, pode recuperar pacientes da chave antiga `zera-v2`, que permanece intacta. Exportações novas incluem apenas pacientes (versão 3); backups de versão 2 também são aceitos para importar seus pacientes. Os dados antigos de ofertas não são processados pelo Zera PS.

Alterações no GitHub não republicam automaticamente o Sites. Não incluir dados de pacientes, backups, senhas ou tokens no repositório.
