# Pacote Standalone: Módulo de Escala de Serviço (PMMG - Salinas)

Este diretório contém todos os arquivos de código-fonte completos e desacoplados do **Módulo de Escala de Serviço**, prontos para serem transportados para um novo projeto ou utilizados em uma nova conversa.

---

## Arquivos Incluídos:
1. **page.tsx** (~143 KB) - Componente React da página de Escala (/dashboard/escala).
2. **pdf-service.ts** (~5.2 KB) - Serviço de exportação oficial em PDF da PMMG via jspdf e jspdf-autotable.
3. **types.ts** - Interfaces TypeScript (MonthlySchedule, ScheduleLegend, ScheduleItem, EscalaMilitar).
4. **mock-data.ts** - Equipes padrão (DEFAULT_TEAMS) e Legendas padrão com badges (DEFAULT_LEGENDS).
5. **storage.ts** - Métodos de persistência para escalas, efetivo, equipes e legendas.

---

## Dependências Necessárias no Novo Projeto:
npm install lucide-react jspdf jspdf-autotable
