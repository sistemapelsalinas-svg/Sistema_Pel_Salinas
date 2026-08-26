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
  CheckCircle, 
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

  useEffect(() => {
    if (selectedOp) {
      if (selectedOp.area_rural_obrigatoria) setAreaRural(true);
      if (selectedOp.min_envolvidos) setQuantidadeEnvolvidos(prev => Math.max(prev, selectedOp.min_envolvidos ?? 0));
    }
  }, [selectedOpId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOp) return;

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
    setSuccessMsg(`Operação "${selectedOp.titulo}" lançada com sucesso para a equipe ${equipe}!`);
    setTimeout(() => setSuccessMsg(''), 4000);

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
      <div className="pb-1 border-b border-gray-200 dark:border-[#1F242F]">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Lançamento de Operações Executadas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Registro oficial das atividades cumpridas pelas equipes em serviço com validação de requisitos.
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {successMsg && (
        <div className="p-4 bg-brand-50 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 rounded-xl border border-brand-200 dark:border-brand-800 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Erros de Validação */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-error-50 dark:bg-error-950/50 border border-error-200 dark:border-error-800 rounded-xl text-error-800 dark:text-error-300 text-xs space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-semibold text-error-700 dark:text-error-300">
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
        
        {/* Form Container */}
        <div className="lg:col-span-2 untitled-card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Seleção da Operação */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tipo de Operação / Natureza *
              </label>
              <select
                value={selectedOpId}
                onChange={(e) => setSelectedOpId(e.target.value)}
                className="untitled-input font-medium"
                required
              >
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>
                    [{op.codigo_natureza}] {op.titulo} — ({op.grupo})
                  </option>
                ))}
              </select>
            </div>

            {/* Info Box da Operação */}
            {selectedOp && (
              <div className="p-3.5 bg-gray-50 dark:bg-[#0C111D]/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>{selectedOp.titulo}</span>
                </div>
                <p className="text-gray-500 leading-relaxed">{selectedOp.descricao}</p>
                {selectedOp.requer_reds_origem && (
                  <p className="text-warning-700 dark:text-warning-400 font-semibold mt-1">
                    ⚠️ Atenção: Esta natureza exige o fornecimento obrigatório do REDS de origem do delito.
                  </p>
                )}
              </div>
            )}

            {/* Linha 1: Data, Equipe e Militar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Execução *
                </label>
                <input
                  type="date"
                  value={dataExecucao}
                  onChange={(e) => setDataExecucao(e.target.value)}
                  className="untitled-input"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipe Executora *
                </label>
                <select
                  value={equipe}
                  onChange={(e) => setEquipe(e.target.value)}
                  className="untitled-input font-medium"
                  required
                >
                  {DEFAULT_TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Militar Responsável
                </label>
                <select
                  value={militarId}
                  onChange={(e) => setMilitarId(e.target.value)}
                  className="untitled-input"
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

            {/* Linha 2: REDS, Bairro e Local */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nº REDS Gerado
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2026-004512345-001"
                  value={redsNumero}
                  onChange={(e) => setRedsNumero(e.target.value)}
                  className="untitled-input font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Centro, São Geraldo"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="untitled-input"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local / Endereço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Praça Coronel Ramos"
                  value={localFato}
                  onChange={(e) => setLocalFato(e.target.value)}
                  className="untitled-input"
                />
              </div>
            </div>

            {/* Flags: Área Rural e Envolvidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-[#0C111D]/40 rounded-xl border border-gray-200 dark:border-gray-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={areaRural}
                  onChange={(e) => setAreaRural(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Operação em Área Rural
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Pessoas Envolvidas:</span>
                <input
                  type="number"
                  min={0}
                  value={quantidadeEnvolvidos}
                  onChange={(e) => setQuantidadeEnvolvidos(Number(e.target.value))}
                  className="w-16 p-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-bold"
                />
              </div>
            </div>

            {/* CAMPOS CONDICIONAIS DE INTERAÇÕES COMUNITÁRIAS */}
            {selectedOp?.codigo_natureza === 'A21.007' && ( // VCP
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da VCP (Visita Comunitária Preventiva):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Orientações Repassadas *</label>
                    <textarea
                      rows={2}
                      placeholder="Orientações de autoproteção e prevenção..."
                      value={orientacoes}
                      onChange={(e) => setOrientacoes(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Demanda Identificada *</label>
                    <textarea
                      rows={2}
                      placeholder="Demandas trazidas pelo morador..."
                      value={demandaIdentificada}
                      onChange={(e) => setDemandaIdentificada(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza.startsWith('A19.000') || selectedOp?.codigo_natureza === 'A19.001') && ( // RC
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da Reunião Comunitária (RC):
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Entidade / Comunidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: Associação de Moradores"
                      value={entidadeComunidade}
                      onChange={(e) => setEntidadeComunidade(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Pauta *</label>
                      <textarea
                        rows={2}
                        placeholder="Pauta da reunião..."
                        value={pauta}
                        onChange={(e) => setPauta(e.target.value)}
                        className="untitled-input"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Encaminhamentos *</label>
                      <textarea
                        rows={2}
                        placeholder="Encaminhamentos acertados..."
                        value={encaminhamentos}
                        onChange={(e) => setEncaminhamentos(e.target.value)}
                        className="untitled-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedOp?.codigo_natureza.startsWith('A19.006') && ( // MRPP
              <div className="p-4 bg-gray-50 dark:bg-[#0C111D]/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Requisitos da MRPP (Manutenção de Rede):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Rede Atendida *</label>
                    <input
                      type="text"
                      placeholder="Ex: Rede de Vizinhos Protegidos"
                      value={redeAtendida}
                      onChange={(e) => setRedeAtendida(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Providências *</label>
                    <input
                      type="text"
                      placeholder="Ações adotadas..."
                      value={providencias}
                      onChange={(e) => setProvidencias(e.target.value)}
                      className="untitled-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedOp?.codigo_natureza === 'A20.028' || selectedOp?.codigo_natureza === 'A20.001') && ( // VT
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-3">
                <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                  Requisitos da Visita Tranquilizadora:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {selectedOp.codigo_natureza === 'A20.028' ? 'Pessoa Atendida (Vítima de Furto) *' : 'Vítima Atendida *'}
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da pessoa atendida"
                      value={selectedOp.codigo_natureza === 'A20.028' ? pessoaAtendida : vitimaAtendida}
                      onChange={(e) => selectedOp.codigo_natureza === 'A20.028' ? setPessoaAtendida(e.target.value) : setVitimaAtendida(e.target.value)}
                      className="untitled-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 dark:text-amber-300 mb-1">
                      REDS de Origem do Delito * (OBRIGATÓRIO)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2026-004500123-001"
                      value={redsOrigem}
                      onChange={(e) => setRedsOrigem(e.target.value)}
                      className="untitled-input font-mono font-bold border-amber-300 dark:border-amber-700"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resultados / Observações
              </label>
              <textarea
                rows={2}
                placeholder="Pessoas abordadas, veículos fiscalizados, apreensões..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="untitled-input"
              />
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                className="btn-primary py-2.5 px-5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar e Contabilizar Operação</span>
              </button>
            </div>

          </form>
        </div>

        {/* Histórico Recente */}
        <div className="untitled-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Histórico Recente
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto pr-1">
            {logs.map((log) => {
              const op = operations.find(o => o.id === log.tipo_operacao_id);
              return (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {op?.titulo}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono text-[10px] font-semibold border border-brand-200 dark:border-brand-800 flex-shrink-0">
                      {log.equipe}
                    </span>
                  </div>

                  <p className="text-gray-500 truncate">
                    📍 {log.bairro || 'Salinas'} {log.local_fato ? `— ${log.local_fato}` : ''}
                  </p>

                  {log.reds_origem && (
                    <p className="text-[11px] font-mono text-warning-700 dark:text-warning-400">
                      REDS Origem: {log.reds_origem}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                    <span>{log.data_execucao}</span>
                    <span>{log.militar_responsavel_nome}</span>
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
