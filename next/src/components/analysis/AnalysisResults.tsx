'use client';

import { AnalysisResult } from '../../types/analysis';
import Link from 'next/link';

interface Props {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: Props) {
  if (!result) return null;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-success text-success-content';
      case 'warning':
        return 'bg-warning text-warning-content';
      case 'caution':
        return 'bg-error text-error-content';
      default:
        return 'bg-base-200 text-base-content';
    }
  };

  const getIngredientClasses = (status: string) => {
    switch (status) {
      case 'ok':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      case 'caution':
        return 'alert-error';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <div className={`card shadow-lg ${getStatusClasses(result.overallStatus)}`}>
        <div className="card-body">
          <h2 className="card-title">Overall Assessment</h2>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-current"
            />
            <span className="capitalize font-medium">{result.overallStatus}</span>
          </div>
        </div>
      </div>

      {/* Ingredient Status */}
      {result.ingredients && result.ingredients.length > 0 && (
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-base-content mb-4">Ingredients</h2>
            <div className="space-y-4">
              {result.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className={`alert shadow-lg ${getIngredientClasses(ingredient.status)}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ingredient.name}</span>
                      {ingredient.matched ? (
                        <>
                          <span className="opacity-70">→</span>
                          <Link
                            href={`/ingredients/${encodeURIComponent(ingredient.ingredient?.id || '')}`}
                            className="font-medium hover:underline"
                          >
                            {ingredient.ingredient?.name}
                          </Link>
                        </>
                      ) : (
                        <span className="badge badge-sm">Not Found</span>
                      )}
                    </div>
                    {(ingredient.reason || ingredient.info) && (
                      <div className="mt-2 space-y-1">
                        {ingredient.reason && (
                          <p className="text-sm opacity-90">{ingredient.reason}</p>
                        )}
                        {ingredient.info && (
                          <p className="text-sm opacity-80">{ingredient.info}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
