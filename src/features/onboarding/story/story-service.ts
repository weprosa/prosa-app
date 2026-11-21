import { api } from '@/lib/api/client';

import {
  STORY_ANSWER_MAX_LENGTH,
  type StoryQuestionId,
} from '@/features/onboarding/story/chapters';

export type StoryAnswer = { question_id: StoryQuestionId; text: string };
export type Story = { answers: StoryAnswer[]; completed_at: string | null };

type StoryResponse = { story: Story };

/** Desligado até o back-end publicar as rotas (docs/adr/0011). Com false, nada vai à rede. */
export const STORY_API_ENABLED = false;

// Contrato proposto, ainda sem rotas no back-end. Ver docs/adr/0011.
export async function fetchStory(signal?: AbortSignal): Promise<Story> {
  if (!STORY_API_ENABLED) return { answers: [], completed_at: null };

  const { story } = await api<StoryResponse>('/v1/profile/story', { signal });
  return story;
}

export async function saveStoryAnswers(answers: StoryAnswer[]): Promise<Story> {
  const normalizedAnswers = answers.map(({ question_id, text }) => ({
    question_id,
    text: text.trim().slice(0, STORY_ANSWER_MAX_LENGTH),
  }));

  if (!STORY_API_ENABLED) {
    return { answers: normalizedAnswers.filter(({ text }) => text.length > 0), completed_at: null };
  }

  const { story } = await api<StoryResponse>('/v1/profile/story/answers', {
    method: 'PUT',
    body: { answers: normalizedAnswers },
  });
  return story;
}

export async function completeStory(): Promise<Story> {
  if (!STORY_API_ENABLED) return { answers: [], completed_at: new Date().toISOString() };

  const { story } = await api<StoryResponse>('/v1/profile/story/complete', { method: 'POST' });
  return story;
}
