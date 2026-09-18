# Política de segurança — Zera PS

## Natureza do repositório

O Zera PS é um projeto de portfólio e desenvolvimento em validação. A publicação do código não autoriza uso assistencial, reutilização comercial nem tratamento de dados identificáveis.

## Dados clínicos

Nunca versionar ou publicar:

- nomes, documentos ou identificadores de pacientes;
- prontuários, imagens, laudos ou exames reais;
- exportações de atendimentos;
- credenciais institucionais;
- tokens, cookies ou dados de sessão;
- arquivos de backup contendo conteúdo clínico.

Fixtures e demonstrações devem usar somente dados fictícios ou integralmente desidentificados.

## Segredos

Nunca colocar em código cliente, commits, Actions ou documentação pública:

- chaves de API;
- tokens pessoais;
- segredos OAuth;
- chaves de serviço;
- credenciais de banco;
- segredos de webhooks.

Qualquer integração futura que exija segredo deve operar em camada server-side.

## Gate para produção

Antes de uso com dados reais são necessários, no mínimo: autenticação, autorização, segregação, criptografia, retenção, backup/restauração, logs sem conteúdo sensível, gestão de incidentes, revisão LGPD e validação institucional.
