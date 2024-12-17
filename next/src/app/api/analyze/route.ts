import { NextResponse } from 'next/server';
import { Analyzer } from '../../../../../src/analyzer';
import type { AnalysisResult } from '@/types/analysis';

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || typeof ingredients !== 'string') {
      return NextResponse.json(
        { error: 'Invalid ingredients list' },
        { status: 400 }
      );
    }

    // Create analyzer with default configuration
    const analyzer = new Analyzer();

    // Analyze ingredients
    const analysisResult = analyzer.analyze(ingredients);

    // Convert the analysis result to our frontend format
    const result: AnalysisResult = {
      overallStatus: analysisResult.status === 'error' ? 'caution' : analysisResult.status,
      ingredients: analysisResult.ingredients.map(ingredient => ({
        name: ingredient.name,
        matched: !!ingredient.ingredient,
        status: ingredient.status,
        info: ingredient.ingredient?.description,
        reason: ingredient.reasons[0]?.reason
      }))
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze ingredients' },
      { status: 500 }
    );
  }
}
