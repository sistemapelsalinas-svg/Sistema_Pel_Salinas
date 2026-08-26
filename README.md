# SGP Salinas — Sistema de Gestão Operacional (PMMG)
### 2º Pelotão / 2ª Companhia PM Independente / 11ª Região da Polícia Militar — Salinas/MG

Sistema web tático e responsivo para gestão integrada de operações policiais, metas operacionais mensais, despacho tático do policiamento ("Minha Missão do Dia"), monitoramento de alertas de homicídio, escalas mensais de serviço e geração de relatórios de produtividade.

---

## 🚀 Tecnologias Utilizadas

- **Frontend & Backend:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Design & UI:** [Tailwind CSS](https://tailwindcss.com/), Lucide Icons, `next-themes` (Modo Tático Escuro e Modo Clean)
- **Persistência & Auth:** [Supabase](https://supabase.com/) (PostgreSQL Relacional com RLS) + Camada LocalStorage para funcionamento offline/demo
- **Exportação de Documentos:** `jspdf` e `jspdf-autotable` para geração de escalas em PDF oficial PMMG
- **Hospedagem & CI/CD:** [Vercel](https://vercel.com/) + [GitHub](https://github.com/)

---

## 👥 Perfis de Acesso (RBAC)

1. **ADMIN (Administrador / Comando):** Acesso irrestrito a todos os módulos, gerenciamento de usuários, distribuição de metas mensais e edição de escalas.
2. **SOF (Sala de Operações da Fração):** Lançamento de operações realizadas, registros de visitas preventivas e consulta da escala.
3. **ALERTA_HOMICIDIO (Analista / Prevenção Criminal):** Triagem, classificação de risco e edição no módulo de Alerta de Homicídios + visão de equipe.
4. **EQUIPE (Policial Militar na Rua):** Acesso visualizador e painel prioritário **"Minha Missão do Dia"**.

---

## 📦 Como Rodar Localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em ambiente de desenvolvimento
```bash
npm run dev
```
Abra no navegador em: `http://localhost:3000`

### 3. Build de Produção
```bash
npm run build
npm run start
```

---

## 🗄️ Configuração do Banco de Dados no Supabase

Para conectar o sistema ao seu banco de dados Supabase na nuvem:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Acesse a aba **SQL Editor** do Supabase.
3. Execute o script `supabase/schema.sql` (Criação de tipos, tabelas e RLS).
4. Execute o script `supabase/seed.sql` (Carga inicial com as naturezas de operações de Salinas, Ordens de Serviço oficiais, legendas de escala e usuários de teste).
5. Copie a `URL` do projeto e a chave `anon` em **Project Settings > API**.
6. Preencha no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

---

## 🌐 Deploy na Vercel & GitHub

1. Inicialize o repositório git e suba para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: SGP Salinas 2º Pelotão PMMG v1.0.0"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/sistema-pm-salinas.git
   git push -u origin main
   ```
2. Na [Vercel](https://vercel.com), clique em **"Import Project"** e selecione o repositório.
3. Configure as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e clique em **Deploy**.

---

## 👮‍♂️ Credenciais de Demonstração

| Perfil | Nº PM (Login) | Senha Padrão | Nome de Guerra |
|---|---|---|---|
| **ADMIN** | `100001-1` | `pmmg1234` | Ten Leonardo |
| **SOF** | `100002-2` | `pmmg1234` | Sgt Moreira |
| **ALERTA HOMICÍDIO** | `100003-3` | `pmmg1234` | Cb Juliana |
| **EQUIPE** | `100004-4` | `pmmg1234` | Sd Marcos |
| **NOVO (1º Acesso)** | `100005-5` | `pmmg1234` | Cb Rodrigo |

*Obs: A tela de login possui botões de 1 clique para testar instantaneamente qualquer um dos 4 perfis.*
