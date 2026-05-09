import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { GameType, SpiceLevel, Card, CardCategory } from '@/lib/types';
import { getPromptForGame } from '@/lib/prompts';

const CardSchema = z.object({
  text: z.string(),
  category: z.enum(['challenge', 'question', 'rule', 'drink', 'truth', 'dare', 'general']).optional(),
  drinkCount: z.number().optional(),
});

const CardsArraySchema = z.array(CardSchema);

// Blocklist for inappropriate content
const BLOCKLIST_PATTERNS = [
  /\bminor\b/i,
  /\bchild\b/i,
  /\bkid\b/i,
  /\bunderage\b/i,
  /\bteen\b/i,
  /\b\d{1,2}\s*year\s*old\b/i,
  /\bsuicid/i,
  /\bself[- ]?harm/i,
  /\brape\b/i,
  /\bincest/i,
  /\bpedoph/i,
];

function filterCards(cards: Card[]): Card[] {
  return cards.filter((card) => {
    const text = card.text.toLowerCase();
    return !BLOCKLIST_PATTERNS.some((pattern) => pattern.test(text));
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: Request) {
  console.log('=== GENERATE DECK API CALLED ===');

  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { game, spice, theme, count, category, movieName, vibe, apiKeyOverride } = body as {
      game: GameType;
      spice?: SpiceLevel;
      theme?: string;
      count?: number;
      category?: string;
      movieName?: string;
      vibe?: string;
      apiKeyOverride?: string;
    };

    // Get API key from environment or override
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('API Key prefix:', apiKey?.substring(0, 10) + '...');

    if (!apiKey) {
      console.log('ERROR: No API key provided');
      return Response.json(
        { error: 'No API key provided. Please add your Gemini API key in Settings.' },
        { status: 400 }
      );
    }

    console.log('Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = 'gemini-2.5-flash';
    console.log('Using model:', modelName);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = getPromptForGame(game, {
      spice,
      theme,
      count: count || 25,
      category,
      movieName,
      vibe,
    });
    console.log('Generated prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 200) + '...');

    let cards: Card[] = [];
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} - Calling Gemini API...`);

      try {
        const result = await model.generateContent(prompt);
        console.log('Gemini API call successful');

        const response = await result.response;
        const text = response.text();
        console.log('Response text length:', text.length);
        console.log('Response preview:', text.substring(0, 300) + '...');

        // Try to extract JSON from the response
        let jsonStr = text;

        // Remove markdown code blocks if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
          console.log('Extracted JSON from markdown code block');
        }

        // Try to find JSON array in the response
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonStr = arrayMatch[0];
          console.log('Extracted JSON array');
        }

        try {
          const parsed = JSON.parse(jsonStr);
          console.log('JSON parsed successfully, items:', parsed.length);

          const validated = CardsArraySchema.parse(parsed);
          console.log('Zod validation passed, items:', validated.length);

          // Add IDs to cards
          cards = validated.map((card) => ({
            id: generateId(),
            text: card.text,
            category: card.category as CardCategory | undefined,
            drinkCount: card.drinkCount,
          }));

          // Filter inappropriate content
          const beforeFilter = cards.length;
          cards = filterCards(cards);
          console.log(`Filtered cards: ${beforeFilter} -> ${cards.length}`);

          if (cards.length > 0) {
            console.log('SUCCESS: Generated', cards.length, 'cards');
            break;
          }
        } catch (parseError) {
          console.error('Parse/validation error on attempt', attempts, ':', parseError);
          if (attempts >= maxAttempts) {
            return Response.json(
              { error: 'Failed to generate valid cards. Please try again.' },
              { status: 500 }
            );
          }
        }
      } catch (apiError) {
        console.error('Gemini API error on attempt', attempts, ':', apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
    }

    if (cards.length === 0) {
      console.log('ERROR: No valid cards generated after all attempts');
      return Response.json(
        { error: 'No valid cards generated. Please try again.' },
        { status: 500 }
      );
    }

    console.log('=== RETURNING SUCCESS ===');
    return Response.json({ cards });
  } catch (error) {
    console.error('=== GENERATE DECK ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);

    // Check for rate limit errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return Response.json(
        { error: 'API rate limit exceeded. The free Gemini API has daily limits. Please try again in a few minutes or tomorrow.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('API key') || errorMessage.includes('401')) {
      return Response.json(
        { error: 'Invalid API key. Please check your Gemini API key configuration.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return Response.json(
        { error: `Model not found. Error: ${errorMessage}` },
        { status: 404 }
      );
    }

    return Response.json(
      { error: `Failed to generate deck: ${errorMessage}` },
      { status: 500 }
    );
  }
}
