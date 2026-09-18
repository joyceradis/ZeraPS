# Zera PS

**Estação clínica de pronto-socorro orientada a workflow, temporalidade e segurança documental.**

[**Abrir aplicação**](https://joyceradis.github.io/ZeraPS/) · [Versão de trabalho](work-version/) · [Roadmap](ROADMAP.md)

O Zera PS nasceu de um problema concreto de emergência: quando o volume assistencial sobe, tempo de escuta é consumido por redigitação, navegação e reconstrução da mesma história em documentos sucessivos.

> **Reduzir documentação é o meio. Devolver tempo clínico ao paciente é o fim.**

O projeto explora como uma interface pode reutilizar informação confirmada ao longo do atendimento sem fabricar fatos, aumentar artificialmente a certeza clínica ou apagar a temporalidade do prontuário.

## Modelo do produto

```text
SÍNDROME / APRESENTAÇÃO
        ↓
HDA EDITÁVEL
        ↓
DADO CONFIRMADO UMA VEZ
        ↓
CONTEXTO + ETAPA DO ATENDIMENTO
        ↓
PENDÊNCIAS / RESULTADOS / FERRAMENTAS
        ↓
REAVALIAÇÃO E DOCUMENTAÇÃO FINAL
```

## Diferencial arquitetural

O Zera PS trata o atendimento como uma sequência temporal, não como um formulário único:

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

A reavaliação pertence ao mesmo atendimento e preserva a admissão. Resultado novo não reescreve retrospectivamente o que era conhecido antes.

## Capacidades atuais

- evolução clínica estruturada;
- HDA integral e editável nos roteiros;
- reavaliação vinculada ao atendimento;
- HPP com negativas apenas por ação explícita;
- exame físico normal dependente de confirmação;
- campos condicionais por cenário, etapa e contexto;
- pendências e resultados no workflow de referência para dor torácica / suspeita de SCA;
- HEART com distinção entre ferramenta disponível, aplicável e calculável;
- CRB-65, CURB-65, qSOFA e Glasgow sem falso resultado inicial;
- autosave e rascunhos locais;
- PWA offline-first;
- testes automatizados e CI;
- documentação técnica de arquitetura, segurança e invariantes.

## Invariantes de segurança

- vazio ≠ `NEGA`;
- não informado ≠ não investigado;
- template ≠ exame realizado;
- sugestão ≠ fato clínico;
- score incompleto ≠ zero;
- disponível ≠ aplicável ≠ calculável;
- síndrome/apresentação ≠ diagnóstico presumido;
- reavaliação não sobrescreve admissão;
- resultado novo não altera retrospectivamente o estado anterior;
- reutilizar dado não remove contexto, proveniência ou temporalidade;
- toda saída clínica permanece revisável pela médica.

## Arquitetura

```text
ZeraPS/
├── index.html
├── app.html
├── app.js
├── manifest.json
├── service-worker.js
├── src/                 # workflow temporal e coordenação
├── protocols/           # configuração clínica declarativa
├── assets/              # fundação documental
├── tests/               # regressão automatizada
├── docs/                # produto, arquitetura, segurança e testes
├── README.md
├── ROADMAP.md
└── CHANGELOG.md
```

A migração arquitetural é incremental: componentes estabilizados permanecem preservados enquanto a camada temporal amadurece.

## Verificação

Requer Node.js 24+.

```bash
npm run verify
```

O comando executa verificações automatizadas da base. Testes manuais em navegador, mobile e PWA permanecem gates independentes.

## Documentação técnica

| Área | Documento |
| --- | --- |
| Índice | [`docs/README.md`](docs/README.md) |
| Escopo | [`PRODUCT_SCOPE.md`](docs/product/PRODUCT_SCOPE.md) |
| Workflows | [`WORKFLOWS.md`](docs/product/WORKFLOWS.md) |
| Arquitetura | [`ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) |
| Contrato de protocolos | [`PROTOCOL_CONTRACT.md`](docs/architecture/PROTOCOL_CONTRACT.md) |
| Workflow temporal | [`TEMPORAL_WORKFLOW.md`](docs/architecture/TEMPORAL_WORKFLOW.md) |
| Segurança clínica | [`CLINICAL_SAFETY.md`](docs/safety/CLINICAL_SAFETY.md) |
| Invariantes | [`INVARIANTS.md`](docs/safety/INVARIANTS.md) |
| Testes | [`TESTING.md`](docs/testing/TESTING.md) |

## Desenvolvimento local

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Dados e privacidade

Nesta fase, os dados permanecem no dispositivo. O projeto não possui backend nem sincronização em nuvem. Dados identificáveis de pacientes não devem ser utilizados em testes, demonstrações ou ambientes não autorizados.

## Status

**MVP em validação.** Testes automatizados e CI não equivalem a homologação assistencial. O projeto não substitui julgamento médico, protocolos institucionais ou validação clínica.

## Autoria

Idealizado e desenvolvido por **Dra. Joyce Radis**, médica de pronto-socorro e médica perita judicial, a partir de problemas reais de documentação e fluxo assistencial.

## Licença

Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
