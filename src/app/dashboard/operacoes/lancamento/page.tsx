'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { DEFAULT_TEAMS } from '@/lib/mock-data';
import { OperationType, UserProfile, OperationExecutionLog } from '@/lib/types';
import { validateOperationLaunch } from '@/lib/validation';
import { useAuth } from '@/lib/auth-context';
import { 
  PlusCircle, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Shield, 
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

export default function LancamentoOperacoesPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<OperationType[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<OperationExecutionLog[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form State
  const [selectedOpId, setSelectedOpId] = useState<string>('');
  const [dataExecucao, setDataExecucao] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipe, setEquipe] = useState<string>('ALFA 1');
  const [militarId, setMilitarId] = useState<string>('');
  const [redsNumero, setRedsNumero] = useState<string>('');
  const [redsOrigem, setRedsOrigem] = useState<string>('');
  const [localFato, setLocalFato] = useState<string>('');
  const [bairro, setBairro] = useState<string>('Centro');
  const [areaRural, setAreaRural] = useState<boolean>(false);
  const [quantidadeEnvolvidos, setQuantidadeEnvolvidos] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');

  // Detalhes Específicos para Interações Comunitárias
  const [entidadeComunidade, setEntidadeComunidade] = useState<string>('');
  const [pauta, setPauta] = useState<string>('');
  const [encaminhamentos, setEncaminhamentos] = useState<string>('');
  const [orientacoes, setOrientacoes] = useState<string>('');
  const [demandaIdentificada, setDemandaIdentificada] = useState<string>('');
  const [redeAtendida, setRedeAtendida] = useState<string>('');
  const [providencias, setProvidencias] = useState<string>('');
  const [pessoaAtendida, setPessoaAtendida] = useState<string>('');
  const [vitimaAtendida, setVitimaAtendida] = useState<string>('');

  useEffect(() => {
    const ops = storage.getOperations();
    const uList = storage.getUsers();
    setOperations(ops);
    setUsers(uList);
    setLogs(storage.getLogs());

    if (ops.length > 0) setSelectedOpId(ops[0].id);
    if (user) {
      setMilitarId(user.id);
      setEquipe(user.equipe_padrao || 'ALFA 1');
    }
  }, [user]);

  const selectedOp = operations.find(o => o.id === selectedOpId);

  // Atualiza automaticamente os requisitos ao trocar a operação selecionada
  useEffect(() => {
    if (selectedOp) {
      if (selectedOp.area_rural_obrigatoria) setAreaRural(true);
      if (selectedOp.min_envolvidos) setQuantidadeEnvolvidos(prev => Math.max(prev, selectedOp.min_envolvidos ?? 0));
    }
  }, [selectedOpId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOp) return;

    // Executa Validação Completa de Regras de Negócio
    const validation = validateOperationLaunch(selectedOp, {
      reds_numero: redsNumero,
      reds_origem: redsOrigem,
      quantidade_envolvidos: quantidadeEnvolvidos,
      area_rural: areaRural,
      detalhes_interacao: {
        entidade_comunidade: entidadeComunidade,
        pauta,
        encaminhamentos,
        orientacoes,
        demanda_identificada: demandaIdentificada,
        rede_atendida: redeAtendida,
        providencias,
        pessoa_atendida: pessoaAtendida,
        vitima_atendida: vitimaAtendida
      }
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);

    const respMilitar = users.find(u => u.id === militarId);

    storage.addLog({
      tipo_operacao_id: selectedOp.id,
      data_execucao: dataExecucao,
      equipe,
      militar_responsavel_id: militarId,
      militar_responsavel_nome: respMilitar ? `${respMilitar.graduacao} ${respMilitar.nome_guerra}` : 'SOF',
      reds_numero: redsNumero || undefined,
      reds_origem: redsOrigem || undefined,
      local_fato: localFato,
      bairro: bairro,
      area_rural: areaRural,
      quantidade_envolvidos: quantidadeEnvolvidos,
      detalhes_interacao: {
        entidade_comunidade: entidadeComunidade || undefined,
        pauta: pauta || undefined,
        encaminhamentos: encaminhamentos || undefined,
        orientacoes: orientacoes || undefined,
        demanda_identificada: demandaIdentificada || undefined,
        rede_atendida: redeAtendida || undefined,
        providencias: providencias || undefined,
        pessoa_atendida: pessoaAtendida || undefined,
        vitima_atendida: vitimaAtendida || undefined
      },
      observacoes: observacoes || undefined,
      created_by: user?.id
    });

    setLogs(storage.getLogs());
    setSuccessMsg(`Operação "${selectedOp.titulo}" registrada com sucesso para a equipe ${equipe}!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // Limpa campos variáveis
    setRedsNumero('');
    setRedsOrigem('');
    setObservacoes('');
    setPessoaAtendida('');
    setVitimaAtendida('');
    setOrientacoes('');
    setDemandaIdentificada('');
    setPauta('');
    setEncaminhamentos('');
    setProvidencias('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            S.O.F. / LANÇAMENTOS
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">2º Pelotão Salinas</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
          <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Lançamento de Operações Realizadas</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Registro oficial das operações executadas pelas equipes na rua, com validação de requisitos essenciais.
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {successMsg && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl border border-emerald-600 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Erros de Validação de Regra de Negócio */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-950/80 border-2 border-red-700 rounded-2xl text-red-200 text-xs space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Requisitos Obrigatórios não atendidos:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Lançamento */}
        <div className="lg:col-span-2 tactical-card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Seleção da Operação */}
            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Operação / Natureza *
              </label>
              <select
                value={selectedOpId}
                onChange={(e) => setSelectedOpId(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500"
                required
              >
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>
                    [{op.codigo_natureza}] {op.titulo} — ({op.grupo})
                  </option>
                ))}
              </select>
            </div>

            {/* Requisitos da Operação Selecionada (Info Box) */}
            {selectedOp && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{selectedOp.titulo}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{selectedOp.descricao}</p>
                {selectedOp.requer_reds_origem && (
                  <p className="text-amber-700 dark:text-amber-400 font-bold mt-1">
                    ⚠️ Atenção: Esta natureza exige o fornecimento obrigatório do REDS de origem do crime.
                  </p>
                )}
              </div>
            )}

            {/* Linha 1: Data, Equipe e Militar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Data de Execução *
                </label>
                <input
                  type="date"
                  value={dataExecucao}
                  onChange={(e) => setDataExecucao(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Equipe Executora *
                </label>
                <select
                  value={equipe}
                  onChange={(e) => setEquipe(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  required
                >
                  {DEFAULT_TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Militar Responsável
                </label>
                <select
                  value={militarId}
                  onChange={(e) => setMilitarId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">Selecione o militar...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.graduacao} {u.nome_guerra} ({u.numero_pm})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linha 2: REDS e Local */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nº REDS Gerado
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2026-004512345-001"
                  value={redsNumero}
                  onChange={(e) => setRedsNumero(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Centro, São Geraldo, etc."
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Local / Endereço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Praça Coronel Ramos, nº 100"
                  value={localFato}
                  onChange={(e) => setLocalFato(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Flags Especiais: Área Rural e Envolvidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-200 dark:border-gray-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={areaRural}
                  onChange={(e) => setAreaRural(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Operação realizada em Área Rural
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Pessoas Envolvidas/Atendidas:</span>
                <input
                  type="number"
                  min={0}
                  value={quantidadeEnvolvidos}
                  onChange={(e) => setQuantidadeEnvolvidos(Number(e.target.value))}
                  className="w-16 p-1 text-center bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* SEÇÃO DINÂMICA: CAMPOS CONDICIONAIS DE INTERAÇÕES COMUNITÁRIAS */}
            {selectedOp?.codigo_natureza === 'A21.007' && ( // VCP
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 uppercase">
                  Requisitos da VCP (Visita Comunitária Preventiva):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Orientações Repassadas *</label>
                    <textarea
                      rows={2}
                      placeholder="Orientações de autoproteção, iluminação, telefones de emergência..."
                      value={orientacoes}
                      onChange={(e) => setOrientacoes(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Demanda Identificada *</label>
                    <textarea
                      rows={2}
                      placeholder="Problemas de segurança, iluminação, poda, pedidos da comunidade..."
                      value={demandaIdentificada}
                      onChange={(e) => setDemandaIdentificada(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza.startsWith('A19.000') || selectedOp?.codigo_natureza === 'A19.001') && ( // RC / RCR
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 uppercase">
                  Requisitos da Reunião Comunitária (RC/RCR):
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Entidade / Comunidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: Associação de Moradores do Bairro São Geraldo"
                      value={entidadeComunidade}
                      onChange={(e) => setEntidadeComunidade(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pauta da Reunião *</label>
                      <textarea
                        rows={2}
                        placeholder="Assuntos discutidos na reunião..."
                        value={pauta}
                        onChange={(e) => setPauta(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Encaminhamentos / Decisões *</label>
                      <textarea
                        rows={2}
                        placeholder="Compromissos e encaminhamentos acordados..."
                        value={encaminhamentos}
                        onChange={(e) => setEncaminhamentos(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedOp?.codigo_natureza.startsWith('A19.006') && ( // MRPP
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 uppercase">
                  Requisitos da MRPP (Manutenção de Rede Protegida):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rede Atendida *</label>
                    <input
                      type="text"
                      placeholder="Ex: Rede de Vizinhos Protegidos - Centro"
                      value={redeAtendida}
                      onChange={(e) => setRedeAtendida(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Providências Adotadas *</label>
                    <input
                      type="text"
                      placeholder="Atualização de cadastros, placas, alinhamentos..."
                      value={providencias}
                      onChange={(e) => setProvidencias(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza === 'A20.028' || selectedOp?.codigo_natureza === 'A20.001') && ( // VT Furto / VTCV
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase">
                  Requisitos da Visita Tranquilizadora (VT / VTCV):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {selectedOp.codigo_natureza === 'A20.028' ? 'Pessoa Atendida (Vítima de Furto) *' : 'Vítima Atendida (Crime Violento) *'}
                    </label>
                    <input
                      type="text"
                      placeholder="Nome completo da pessoa atendida"
                      value={selectedOp.codigo_natureza === 'A20.028' ? pessoaAtendida : vitimaAtendida}
                      onChange={(e) => selectedOp.codigo_natureza === 'A20.028' ? setPessoaAtendida(e.target.value) : setVitimaAtendida(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1">
                      REDS de Origem do Delito * (OBRIGATÓRIO)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2026-004500123-001"
                      value={redsOrigem}
                      onChange={(e) => setRedsOrigem(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-900 border border-amber-400 dark:border-amber-600 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Observações Gerais */}
            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Resultados Obtidos / Observações
              </label>
              <textarea
                rows={2}
                placeholder="Pessoas abordadas, veículos fiscalizados, apreensões ou desfecho..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Salvar e Contabilizar Operação</span>
              </button>
            </div>

          </form>
        </div>

        {/* Histórico Recente de Lançamentos */}
        <div className="tactical-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Histórico Recente de Lançamentos
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {logs.map((log) => {
              const op = operations.find(o => o.id === log.tipo_operacao_id);
              return (
                <div 
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-200 dark:border-gray-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {op?.codigo_natureza} — {op?.titulo}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 font-mono text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                      {log.equipe}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400">
                    📍 {log.bairro || 'Salinas'} {log.local_fato ? `— ${log.local_fato}` : ''}
                  </p>

                  {log.reds_origem && (
                    <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                      REDS Origem: {log.reds_origem}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-gray-800">
                    <span>Data: {log.data_execucao}</span>
                    <span>Resp: {log.militar_responsavel_nome}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
