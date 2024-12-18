'use client';

import { AnalysisResult } from '../../types/analysis';
import Link from 'next/link';

interface Props {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: Props) {
  if (!result) return null;

  const statusColors = {
    ok: '#4ade80',      // green
    warning: '#fbbf24', // yellow
    caution: '#ef4444'  // red
  };

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Overall Assessment</h2>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[result.overallStatus] }}
            />
            <span className="capitalize">{result.overallStatus}</span>
          </div>
        </div>
      </div>

      {/* Ingredient Status */}
      {result.ingredients && result.ingredients.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title mb-4">Ingredients</h2>
            <div className="space-y-4">
              {result.ingredients.map((ingredient, index) => (
                <div key={index} className="border-l-4 pl-4" style={{
                  borderColor: statusColors[ingredient.status]
                }}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ingredient.name}</span>
                    {ingredient.matched ? (
                      <>
                        <span className="opacity-70">→</span>
                        <Link
                          href={`/ingredients/${encodeURIComponent(ingredient.ingredient?.id || '')}`}
                          className="font-medium text-primary hover:text-primary-focus transition-colors"
                        >
                          {ingredient.ingredient?.name}
                        </Link>
                      </>
                    ) : (
                      <span className="badge badge-sm badge-warning">Not Found</span>
                    )}
                  </div>
                  {ingredient.reason && (
                    <p className="text-sm mt-1 opacity-70">{ingredient.reason}</p>
                  )}
                  {ingredient.info && (
                    <p className="text-sm mt-1 text-info">{ingredient.info}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
