import {
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  History,
  Search,
  Shield,
  Trash2,
  User
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { db } from '../../db/storage';
import { AuditLog } from '../../types';
import { formatIndianDate } from '../../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return logs
      .filter((log) => {
        const matchesSearch =
          !q ||
          log.action.toLowerCase().includes(q) ||
          log.entityType.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.performedBy.toLowerCase().includes(q) ||
          (log.reason && log.reason.toLowerCase().includes(q));

        const matchesAction =
          actionFilter === 'All' || log.entityType.toLowerCase() === actionFilter.toLowerCase();

        return matchesSearch && matchesAction;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchQuery, actionFilter]);

  const handleExportLogs = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;
    const headers = 'ID,Timestamp,Action,EntityType,EntityId,PerformedBy,Reason\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.action}","${l.entityType}","${l.entityId}","${l.performedBy}","${l.reason || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeZone_AuditLogs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            System Audit Trail & Compliance Logs
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of all financial creations, payments, reversals, and customer operations.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user, entity ID, or reason..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['All', 'Customer', 'Payment', 'Investment', 'MonthlyProfit'] as const).map((ent) => (
            <button
              key={ent}
              onClick={() => setActionFilter(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                actionFilter === ent
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No audit records found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                      {log.entityType} • {log.entityId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>By: <strong className="text-slate-700 dark:text-slate-300">{log.performedBy}</strong></span>
                    <span>•</span>
                    <span>Timestamp: {formatIndianDate(log.timestamp.split('T')[0])} {log.timestamp.split('T')[1]?.substring(0, 5) || ''}</span>
                  </div>
                  {log.reason && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold italic">
                      Reason: {log.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
