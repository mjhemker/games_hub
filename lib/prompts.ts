import { GameType, SpiceLevel } from './types';

const spiceDescriptions: Record<SpiceLevel, string> = {
  1: 'tame - keep it clean and appropriate for all groups, focus on fun icebreakers',
  2: 'medium - include some personal or slightly embarrassing questions, mild adult humor allowed',
  3: 'spicy - include sexual innuendo, relationship drama, and intense personal questions (adults 21+ only)',
};

export function getBeerPressurePrompt(spice: SpiceLevel, theme: string, count: number): string {
  return `You generate cards for a party drinking game called Beer Pressure.
Each card is one short prompt: a question, a dare, a "drink if" rule, or a group rule.

Spice level: ${spice} (${spiceDescriptions[spice]})

**CRITICAL - THEME REQUIREMENT:**
Theme/Context: "${theme}"

EVERY SINGLE CARD MUST be directly related to and inspired by this theme. The theme is the most important requirement. Do NOT generate generic drinking game cards - they must ALL connect to the specified theme.

If the theme describes a specific game mechanic or style (e.g., "voting", "democracy", "confessions"), make sure ALL cards follow that mechanic.

Rules:
- Adults 21+ only. NEVER reference minors, illegal drugs, self-harm, or non-consensual scenarios.
- Each card under 25 words.
- Mix: ~30% questions, ~30% dares, ~25% drink-if, ~15% group rules.
- Group rules should be fun and last the whole round.
- Generate exactly ${count} cards.
- ALL cards must directly relate to the theme: "${theme}"

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "...", "category": "challenge" | "question" | "rule" | "drink" | "truth" | "dare" }]`;
}

export function getTruthOrDrinkPrompt(spice: SpiceLevel, theme: string, count: number): string {
  return `You generate Truth or Drink questions - personal questions where players must either answer honestly or take a drink.

Spice level: ${spice} (${spiceDescriptions[spice]})

**CRITICAL - THEME REQUIREMENT:**
Theme/Context: "${theme}"

EVERY SINGLE QUESTION MUST be directly related to and inspired by this theme. The theme is the most important requirement. Do NOT generate generic truth questions - they must ALL connect to the specified theme.

If the user describes a specific topic, scenario, or mechanic, make sure ALL questions follow that direction.

Rules:
- Adults 21+ only. NEVER reference minors, illegal drugs, self-harm, or non-consensual scenarios.
- Each question should be revealing but still fun.
- Questions should encourage interesting stories or confessions.
- Generate exactly ${count} questions.
- ALL questions must directly relate to the theme: "${theme}"

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "What is your most embarrassing...", "category": "truth" }]`;
}

export function getNeverHaveIEverPrompt(spice: SpiceLevel, theme: string, count: number): string {
  return `You generate "Never Have I Ever" statements for a drinking game.

Spice level: ${spice} (${spiceDescriptions[spice]})

**CRITICAL - THEME REQUIREMENT:**
Theme/Context: "${theme}"

EVERY SINGLE STATEMENT MUST be directly related to and inspired by this theme. The theme is the most important requirement. Do NOT generate generic "Never Have I Ever" statements - they must ALL connect to the specified theme.

Rules:
- Adults 21+ only. NEVER reference minors, illegal drugs, self-harm, or non-consensual scenarios.
- Each statement starts with "Never have I ever..."
- Mix common experiences with unexpected ones related to the theme.
- Generate exactly ${count} statements.
- ALL statements must directly relate to the theme: "${theme}"

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Never have I ever...", "category": "general" }]`;
}

export function getMostLikelyToPrompt(spice: SpiceLevel, theme: string, count: number): string {
  return `You generate "Most Likely To" prompts for a drinking game where players point at who fits best.

Spice level: ${spice} (${spiceDescriptions[spice]})

**CRITICAL - THEME REQUIREMENT:**
Theme/Context: "${theme}"

EVERY SINGLE PROMPT MUST be directly related to and inspired by this theme. The theme is the most important requirement. Do NOT generate generic "Most Likely To" prompts - they must ALL connect to the specified theme.

If the theme describes a specific mechanic or style (e.g., "democracy", "voting on behaviors"), incorporate that into every prompt.

Rules:
- Adults 21+ only. NEVER reference minors, illegal drugs, self-harm, or non-consensual scenarios.
- Each prompt should relate to the theme: "${theme}"
- Include funny, unexpected, and creative scenarios within the theme.
- Generate exactly ${count} prompts.
- ALL prompts must directly relate to the theme.

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Most likely to...", "category": "general" }]`;
}

export function getIdGamePrompt(category: string, count: number): string {
  return `You generate words/phrases for a Heads Up style guessing game.

**CRITICAL - CATEGORY REQUIREMENT:**
Category: "${category}"

EVERY SINGLE ITEM MUST fit this specific category. Do NOT include items from other categories.

Rules:
- Generate exactly ${count} items that fit the category "${category}".
- Items should be recognizable to most people.
- Include a mix of easy, medium, and harder items.
- Keep each item short (1-4 words typically).
- ALL items must belong to the category: "${category}"

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Taylor Swift" }, { "text": "The Rock" }]`;
}

export function getCategoriesPrompt(count: number): string {
  return `You generate category names for a drinking game where players take turns naming items in that category.

Rules:
- Generate exactly ${count} creative and fun category names.
- Categories should have at least 10+ possible answers.
- Mix common categories with creative/funny ones.
- Include some pop culture, food, geography, and general knowledge.
- Keep category names short (1-4 words).

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Pizza Toppings" }, { "text": "90s Boy Bands" }]`;
}

export function getParanoiaPrompt(spice: SpiceLevel, theme: string, count: number): string {
  return `You generate Paranoia questions - questions about "who in the group" that are whispered to one player.

Spice level: ${spice} (${spiceDescriptions[spice]})

**CRITICAL - THEME REQUIREMENT:**
Theme/Context: "${theme}"

EVERY SINGLE QUESTION MUST be directly related to and inspired by this theme. The theme is the most important requirement. Do NOT generate generic paranoia questions - they must ALL connect to the specified theme.

Rules:
- Adults 21+ only. NEVER reference minors, illegal drugs, self-harm, or non-consensual scenarios.
- Each question should be about someone in the group (e.g., "Who here would be the worst at...")
- Questions should be revealing but not mean-spirited.
- Generate exactly ${count} questions.
- ALL questions must directly relate to the theme: "${theme}"

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Who here would be the worst roommate?", "category": "general" }]`;
}

export function getMovieModePrompt(movieName: string, vibe: string): string {
  return `You create drinking game rules for watching "${movieName}".

Vibe: ${vibe || 'normal'}

**CRITICAL - MOVIE REQUIREMENT:**
ALL rules must be specific to "${movieName}". Reference actual characters, scenes, catchphrases, and events from this movie/show.

Rules:
- Generate 8-12 drinking rules specific to "${movieName}".
- Include a mix of common events and rare moments FROM THIS SPECIFIC MOVIE.
- Rules should be things viewers can actually notice while watching.
- Include 1-2 "finish your drink" rules for rare/climactic moments.
- ALL rules must reference specific elements of "${movieName}".

Return ONLY a valid JSON array, no prose or markdown:
[{ "text": "Drink every time the main character says their catchphrase", "category": "rule" }]`;
}

export function getPromptForGame(
  game: GameType,
  options: { spice?: SpiceLevel; theme?: string; count?: number; category?: string; movieName?: string; vibe?: string }
): string {
  const { spice = 2, theme = 'general party', count = 25, category, movieName, vibe } = options;

  switch (game) {
    case 'beer-pressure':
      return getBeerPressurePrompt(spice, theme, count);
    case 'truth-or-drink':
      return getTruthOrDrinkPrompt(spice, theme, count);
    case 'never-have-i-ever':
      return getNeverHaveIEverPrompt(spice, theme, count);
    case 'most-likely-to':
      return getMostLikelyToPrompt(spice, theme, count);
    case 'id-game':
      return getIdGamePrompt(category || theme || 'General Knowledge', count);
    case 'categories':
      return getCategoriesPrompt(count);
    case 'paranoia':
      return getParanoiaPrompt(spice, theme, count);
    case 'movie-mode':
      return getMovieModePrompt(movieName || 'a movie', vibe || 'normal');
    default:
      throw new Error(`No prompt template for game: ${game}`);
  }
}
