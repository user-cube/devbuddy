import React, { useEffect, useRef } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Flag,
  Folder
} from 'lucide-react';

const HomeStats = ({ stats, onQuickAction }) => {
  const totalItems = stats.jira.total + stats.github.total + stats.gitlab.total;
  const totalAssigned = stats.jira.assigned + stats.github.assigned + stats.gitlab.assigned;
  const totalReviewing = stats.github.reviewing + stats.gitlab.reviewing;
  const totalHighPriority = stats.jira.highPriority;
  const totalRepositories = stats.repositories.total;

  // Track previous values for subtle delta indicators
  const prevRef = useRef({
    totalItems,
    totalAssigned,
    totalReviewing,
    totalHighPriority,
    totalRepositories
  });

  // Track dynamic max for repositories progress bar
  const maxReposRef = useRef(Math.max(1, totalRepositories));
  if (totalRepositories > maxReposRef.current) {
    maxReposRef.current = totalRepositories;
  }

  const deltas = {
    totalItems: totalItems - (prevRef.current?.totalItems ?? totalItems),
    totalAssigned: totalAssigned - (prevRef.current?.totalAssigned ?? totalAssigned),
    totalReviewing: totalReviewing - (prevRef.current?.totalReviewing ?? totalReviewing),
    totalHighPriority: totalHighPriority - (prevRef.current?.totalHighPriority ?? totalHighPriority),
    totalRepositories: totalRepositories - (prevRef.current?.totalRepositories ?? totalRepositories)
  };

  // Keep last 10 values for sparkline (Total Items)
  const totalItemsHistoryRef = useRef([totalItems]);
  if (totalItemsHistoryRef.current[totalItemsHistoryRef.current.length - 1] !== totalItems) {
    totalItemsHistoryRef.current = [...totalItemsHistoryRef.current, totalItems].slice(-10);
  }

  // Keep last 10 values for sparkline (Assigned, In Review)
  const assignedHistoryRef = useRef([totalAssigned]);
  if (assignedHistoryRef.current[assignedHistoryRef.current.length - 1] !== totalAssigned) {
    assignedHistoryRef.current = [...assignedHistoryRef.current, totalAssigned].slice(-10);
  }

  const reviewingHistoryRef = useRef([totalReviewing]);
  if (reviewingHistoryRef.current[reviewingHistoryRef.current.length - 1] !== totalReviewing) {
    reviewingHistoryRef.current = [...reviewingHistoryRef.current, totalReviewing].slice(-10);
  }

  useEffect(() => {
    prevRef.current = {
      totalItems,
      totalAssigned,
      totalReviewing,
      totalHighPriority,
      totalRepositories
    };
  }, [totalItems, totalAssigned, totalReviewing, totalHighPriority, totalRepositories]);

  const statCards = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: TrendingUp,
      color: 'var(--accent-primary)',
      highlight: true,
      action: 'overview'
    },
    {
      label: 'Assigned',
      value: totalAssigned,
      icon: Users,
      color: 'var(--success)',
      action: 'assigned'
    },
    {
      label: 'In Review',
      value: totalReviewing,
      icon: Eye,
      color: 'var(--warning)',
      action: 'review'
    },
    {
      label: 'High Priority',
      value: totalHighPriority,
      icon: Flag,
      color: 'var(--error)',
      highlight: true,
      action: 'priority'
    },
    {
      label: 'Repositories',
      value: totalRepositories,
      icon: Folder,
      color: 'var(--accent-primary)',
      action: 'repositories'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const delta = index === 0 ? deltas.totalItems
          : index === 1 ? deltas.totalAssigned
            : index === 2 ? deltas.totalReviewing
              : index === 3 ? deltas.totalHighPriority
                : deltas.totalRepositories;

        const isIncrease = delta > 0;
        const showDelta = delta !== 0;

        // Base style and dynamic tint per metric
        const baseCardStyle = (() => {
          if (stat.highlight && stat.label === 'Total Items') {
            return {
              background: 'linear-gradient(135deg, rgba(59,130,246,0.28), rgba(59,130,246,0.12))',
              border: '1px solid rgba(59,130,246,0.35)'
            };
          }
          if (stat.highlight && stat.label === 'High Priority') {
            return {
              background: 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.10))',
              border: '1px solid rgba(239,68,68,0.35)'
            };
          }
          if (stat.label === 'Assigned') {
            return {
              background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))',
              border: '1px solid rgba(16,185,129,0.30)'
            };
          }
          if (stat.label === 'In Review') {
            return {
              background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))',
              border: '1px solid rgba(245,158,11,0.30)'
            };
          }
          if (stat.label === 'Repositories') {
            return {
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.08))',
              border: '1px solid rgba(139,92,246,0.30)'
            };
          }
          return {
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)'
          };
        })();

        const dynamicShadow = (() => {
          if (stat.label === 'Assigned' && isIncrease) return '0 8px 20px -6px rgba(16,185,129,0.35)';
          if (stat.label === 'In Review' && isIncrease) return '0 8px 20px -6px rgba(245,158,11,0.35)';
          if (stat.label === 'High Priority' && isIncrease) return '0 8px 20px -6px rgba(239,68,68,0.45)';
          return stat.highlight ? '0 6px 18px -6px rgba(59,130,246,0.35)' : '0 4px 6px -1px rgba(0,0,0,0.1)';
        })();

        return (
          <div
            key={index}
            className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-[fadeIn_300ms_ease-out] animate-[slideUp_300ms_ease-out]"
            style={{
              ...baseCardStyle,
              boxShadow: dynamicShadow
            }}
            onClick={() => onQuickAction(stat.action)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  {showDelta && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{
                      backgroundColor: isIncrease ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                      color: isIncrease ? 'var(--success)' : 'var(--error)',
                      border: isIncrease ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.25)'
                    }}>
                      {isIncrease ? '+' : ''}{delta}
                    </span>
                  )}
                </div>

                {stat.label === 'Total Items' && totalItemsHistoryRef.current.length > 1 && (
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2 w-full h-6">
                    {(() => {
                      const values = totalItemsHistoryRef.current;
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const range = Math.max(1, max - min);
                      const stepX = values.length > 1 ? 100 / (values.length - 1) : 100;
                      const points = values.map((v, i) => {
                        const x = i * stepX;
                        const y = 24 - ((v - min) / range) * 24;
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <>
                          <polyline fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="2" points={points} />
                          <polyline fill="rgba(59,130,246,0.12)" stroke="none" points={`0,24 ${points} 100,24`} />
                        </>
                      );
                    })()}
                  </svg>
                )}

                {stat.label === 'Assigned' && assignedHistoryRef.current.length > 1 && (
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2 w-full h-6">
                    {(() => {
                      const values = assignedHistoryRef.current;
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const range = Math.max(1, max - min);
                      const stepX = values.length > 1 ? 100 / (values.length - 1) : 100;
                      const points = values.map((v, i) => {
                        const x = i * stepX;
                        const y = 24 - ((v - min) / range) * 24;
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <>
                          <polyline fill="none" stroke="rgba(16,185,129,0.85)" strokeWidth="2" points={points} />
                          <polyline fill="rgba(16,185,129,0.12)" stroke="none" points={`0,24 ${points} 100,24`} />
                        </>
                      );
                    })()}
                  </svg>
                )}

                {stat.label === 'In Review' && reviewingHistoryRef.current.length > 1 && (
                  <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-2 w-full h-6">
                    {(() => {
                      const values = reviewingHistoryRef.current;
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const range = Math.max(1, max - min);
                      const stepX = values.length > 1 ? 100 / (values.length - 1) : 100;
                      const points = values.map((v, i) => {
                        const x = i * stepX;
                        const y = 24 - ((v - min) / range) * 24;
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <>
                          <polyline fill="none" stroke="rgba(245,158,11,0.9)" strokeWidth="2" points={points} />
                          <polyline fill="rgba(245,158,11,0.12)" stroke="none" points={`0,24 ${points} 100,24`} />
                        </>
                      );
                    })()}
                  </svg>
                )}

                {stat.label === 'Repositories' && (
                  <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(totalRepositories / maxReposRef.current, 1) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(139,92,246,0.9), rgba(59,130,246,0.9))'
                      }}
                    />
                  </div>
                )}
              </div>
              <IconComponent className={`w-8 h-8 ${stat.label === 'High Priority' && stat.value > 0 ? 'animate-pulse' : ''}`} style={{ color: stat.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomeStats;
