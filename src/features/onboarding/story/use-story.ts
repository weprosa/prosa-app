import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { StoryQuestionId } from '@/features/onboarding/story/chapters';
import {
  completeStory,
  fetchStory,
  saveStoryAnswers,
  type Story,
  type StoryAnswer,
} from '@/features/onboarding/story/story-service';

export const storyQueryKey = ['profile', 'story'] as const;

function mergeStory(
  previous: Story | undefined,
  story: Story,
  submitted: StoryAnswer[] = [],
): Story {
  const answers = new Map(previous?.answers.map((answer) => [answer.question_id, answer]));

  // A simulação não devolve respostas vazias; remove também do cache o que foi apagado.
  for (const answer of submitted) {
    if (!answer.text.trim()) answers.delete(answer.question_id);
  }
  for (const answer of story.answers) {
    if (answer.text.trim()) answers.set(answer.question_id, answer);
    else answers.delete(answer.question_id);
  }

  return { ...story, answers: Array.from(answers.values()) };
}

export function useStory(): UseQueryResult<Story> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: storyQueryKey,
    queryFn: async ({ signal }) => {
      const story = await fetchStory(signal);
      return mergeStory(queryClient.getQueryData<Story>(storyQueryKey), story);
    },
    staleTime: Infinity,
  });
}

export function useSaveStoryAnswers(): UseMutationResult<Story, Error, StoryAnswer[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStoryAnswers,
    onSuccess: (story, answers) => {
      queryClient.setQueryData<Story>(storyQueryKey, (previous) =>
        mergeStory(previous, story, answers),
      );
    },
  });
}

export function useCompleteStory(): UseMutationResult<Story, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeStory,
    onSuccess: (story) => {
      queryClient.setQueryData<Story>(storyQueryKey, (previous) => mergeStory(previous, story));
    },
  });
}

export function answersByQuestion(
  story: Story | undefined,
): Partial<Record<StoryQuestionId, string>> {
  return Object.fromEntries(
    story?.answers.map(({ question_id, text }) => [question_id, text]) ?? [],
  );
}
