'use server'

import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Analyze the question using LLM
    const analysisPrompt = `Analyze this user question and provide a structured analysis in JSON format:

Question: "${question}"

Provide the analysis in this exact JSON format:
{
  "type": "factual|comparative|analytical|aggregative|yes/no",
  "complexity": number (1-10),
  "entities": ["entity1", "entity2", ...],
  "expectedChunks": number (2-15),
  "confidence": number (0-100)
}

Types:
- factual: Simple definition or fact-based question
- comparative: Comparing multiple items or options
- analytical: Why/how questions requiring reasoning
- aggregative: List/summary questions
- yes/no: Simple verification questions

Complexity score:
1-3: Simple (one concept, direct answer)
4-7: Medium (multiple concepts, some reasoning)
8-10: Complex (multiple concepts, deep reasoning, time dimension)

Entities: Key words/concepts mentioned in the question

Expected chunks: How many document chunks are likely needed
- factual: 2-3 chunks
- yes/no: 1-2 chunks
- comparative: 6-10 chunks
- analytical: 5-8 chunks
- aggregative: 10-15 chunks

Confidence: How confident are you in this analysis (0-100)

Return ONLY the JSON, no other text.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert at analyzing questions and determining the optimal information retrieval strategy. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      thinking: { type: 'disabled' }
    })

    const responseText = completion.choices[0]?.message?.content || '{}'

    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : responseText
      analysis = JSON.parse(jsonText)
    } catch (error) {
      console.error('Failed to parse analysis JSON:', error)
      // Fallback to default analysis
      analysis = {
        type: 'factual',
        complexity: 3,
        entities: [],
        expectedChunks: 3,
        confidence: 50
      }
    }

    // Validate and normalize the analysis
    const validTypes = ['factual', 'comparative', 'analytical', 'aggregative', 'yes/no']
    const type = validTypes.includes(analysis.type) ? analysis.type : 'factual'
    const complexity = Math.max(1, Math.min(10, analysis.complexity || 3))
    const entities = Array.isArray(analysis.entities) ? analysis.entities : []
    const chunksNeeded = Math.max(2, Math.min(15, analysis.expectedChunks || 3))
    const confidence = Math.max(0, Math.min(100, analysis.confidence || 70))

    return NextResponse.json({
      type,
      complexity,
      entities,
      chunksNeeded,
      confidence
    })
  } catch (error) {
    console.error('Analysis error:', error)

    // Return fallback analysis
    return NextResponse.json({
      type: 'factual',
      complexity: 3,
      entities: [],
      chunksNeeded: 3,
      confidence: 50
    })
  }
}
