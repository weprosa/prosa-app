export type StoryQuestion = { id: string; prompt: string };
export type StoryChapter = { id: string; title: string; questions: readonly StoryQuestion[] };

export const STORY_CHAPTERS = [
  {
    id: 'who_you_are',
    title: 'Quem você é',
    questions: [
      {
        id: 'ordinary_day',
        prompt: 'Conta sobre um dia comum seu que você não trocaria por nada.',
      },
      {
        id: 'how_others_see_you',
        prompt: 'O que as pessoas que te conhecem bem dizem sobre você? E o que elas não sabem?',
      },
      {
        id: 'turning_point',
        prompt: 'Qual decisão mudou o rumo da sua vida? Como você chegou nela?',
      },
      {
        id: 'lose_track_of_time',
        prompt: 'Com o que você perde a noção do tempo?',
      },
    ],
  },
  {
    id: 'how_you_love',
    title: 'Como você ama',
    questions: [
      {
        id: 'showing_affection',
        prompt: 'Como você mostra que gosta de alguém? E como gosta que mostrem pra você?',
      },
      {
        id: 'handling_conflict',
        prompt: 'Como você costuma agir numa briga com alguém próximo?',
      },
      {
        id: 'relationship_lessons',
        prompt: 'O que você aprendeu com seus relacionamentos até aqui?',
      },
      {
        id: 'personal_space',
        prompt: 'Quanto espaço só seu você precisa numa relação?',
      },
    ],
  },
  {
    id: 'what_you_seek',
    title: 'O que você busca',
    questions: [
      {
        id: 'five_years',
        prompt: 'Como você imagina sua vida daqui a 5 anos, se tudo der certo?',
      },
      {
        id: 'non_negotiables',
        prompt:
          'O que é inegociável numa pessoa pra você? E o que muita gente acha importante, mas pra você não é?',
      },
      {
        id: 'work_money_family',
        prompt: 'Qual o lugar do trabalho, do dinheiro e da família na sua vida hoje?',
      },
      {
        id: 'message_to_reader',
        prompt: 'Escreve uma mensagem pra pessoa que vai ler seu perfil.',
      },
    ],
  },
] as const satisfies readonly StoryChapter[];

export type StoryChapterId = (typeof STORY_CHAPTERS)[number]['id'];
export type StoryQuestionId = (typeof STORY_CHAPTERS)[number]['questions'][number]['id'];
export const STORY_ANSWER_MAX_LENGTH = 2000;
