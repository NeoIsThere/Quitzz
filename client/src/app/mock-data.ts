import { Conversation, Friend, Goal } from './interfaces/interface';

export const MOCK_USERS: Friend[] = [
  {
    username: 'Daniels',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 93,
    NPcount: 99,
  },
  {
    username: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 12354,
    NPcount: 71,
  },
  {
    username: 'Kerry',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 41,
    NPcount: 22,
  },
  {
    username: 'Aguirre',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 91,
    NPcount: 99,
  },
  {
    username: 'Barlow',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 39,
    NPcount: 39,
  },
  {
    username: 'Susanna',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 26,
    NPcount: 20,
  },
  {
    username: 'Gillespie',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 13,
    NPcount: 43,
  },
  {
    username: 'Stein',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 95,
    NPcount: 11,
  },
  {
    username: 'Abbott',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 30,
    NPcount: 24,
  },
  {
    username: 'Joni',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 58,
    NPcount: 86,
  },
  {
    username: 'Shawna',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 90,
    NPcount: 59,
  },
  {
    username: 'Carla',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 16,
    NPcount: 71,
  },
  {
    username: 'Greta',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 30,
    NPcount: 83,
  },
  {
    username: 'Debra',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 56,
    NPcount: 19,
  },
  {
    username: 'Jodi',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 26,
    NPcount: 76,
  },
  {
    username: 'Roth',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 43,
    NPcount: 12,
  },
  {
    username: 'Taylor',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 47,
    NPcount: 3,
  },
  {
    username: 'Schwartz',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 57,
    NPcount: 37,
  },
  {
    username: 'Ruth',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 97,
    NPcount: 30,
  },
  {
    username: 'Henderson',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 58,
    NPcount: 31,
  },
  {
    username: 'Ingrid',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 78,
    NPcount: 29,
  },
  {
    username: 'Chris',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 20,
    NPcount: 18,
  },
  {
    username: 'Cameron',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 99,
    NPcount: 24,
  },
  {
    username: 'Ray',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 64,
    NPcount: 60,
  },
  {
    username: 'Whitfield',
    NFlastCommitDate: '2022-04-22',
    NPlastCommitDate: '2022-02-01',
    NFcount: 61,
    NPcount: 57,
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'xx',
    isUnread: false,
    members: [
      'John',
      'Mikael72832432sdfuigydsgf7346',
      'Fred',
      'John__22',
      'Mikael72832432sdfuigydsgf7346',
      'Fred',
      'John__22',
      'Mikael72832432sdfuigydsgf7346',
      'Fred',
      'John__22',
      'Mikael72832432sdfuigydsgf7346',
      'Fred',
      'John__22',
    ],
    messages: [
      {
        author: 'John',
        id: 'x',
        date: '2022-12-18T22:38:05Z',
        content: 'HI! Id like to go see the new museum',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2021-05-07T22:38:05Z',
        content: '2',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '3',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '4',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '5',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '6',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '7',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '8',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '9',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '10',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '11',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '12',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '13',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '14',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '15',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '16',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '17',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '18',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '19',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '20',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '21',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '22',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '23',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '24',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '25',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '26',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '27',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '28',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '29',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '30',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '31',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '32',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '33',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '34',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '35',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '36',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '37',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '38',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '39',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '40',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '41',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '42',
      },
      {
        author: 'John',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '43',
      },
      {
        author: 'Mikael72832432sdfuigydsgf7346',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '44',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '45',
      },
      {
        author: 'John__22',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '46',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: '47',
      },
      {
        author: 'Fred',
        id: 'x',
        date: '2022-12-12T22:38:05Z',
        content: '48',
      },
    ],
  },

  {
    id: 'x',
    isUnread: false,
    members: ['Mikael', 'Jean', 'Sebastien'],
    messages: [
      {
        author: 'John',
        id: 'x',
        date: '2022-12-10T10:38:05Z',
        content: 'john',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Eric', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Eric',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content:
          'Not sure I get it, you just said it doesnt work well with this algorithm. Assuming we keep using that algorithm, we might end up with',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Paul', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Paul',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'is all we need!',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Michel', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Patrick',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'patrick',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Eric', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Eric',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content:
          'Not sure I get it, you just said it doesnt work well with this algorithm. Assuming we keep using that algorithm, we might end up with',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Paul', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Paul',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'is all we need!',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Michel', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Patrick',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'patrick',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Eric', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Eric',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content:
          'Not sure I get it, you just said it doesnt work well with this algorithm. Assuming we keep using that algorithm, we might end up with',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Paul', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Paul',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'is all we need!',
      },
    ],
  },
  {
    id: 'x',
    isUnread: false,
    members: ['Michel', 'Mikael72832432sdfuigydsgf7346', 'Fred', 'John__22'],
    messages: [
      {
        author: 'Patrick',
        id: 'x',
        date: '2022-05-07T22:38:05Z',
        content: 'patrick',
      },
    ],
  },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'x',
    creator: 'john',
    isMine: false,
    objective: 50,
    category: 'NP',
    endDate: '2021-05-07T22:38:05Z',
    status: 'inprogress',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
  {
    id: 'x',
    objective: 50,
    creator: 'john',
    isMine: false,
    category: 'NP',
    endDate: '2022-06-09T22:38:05Z',
    status: 'validated',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
  {
    id: 'x',
    objective: 50,
    creator: 'john',
    isMine: false,
    category: 'NP',
    endDate: '2023-02-08T22:38:05Z',
    status: 'relapse',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
  {
    id: 'x',
    objective: 50,
    creator: 'john',
    isMine: false,
    category: 'NP',
    endDate: '1995-01-11T22:38:05Z',
    status: 'inprogress',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
  {
    id: 'x',
    objective: 50,
    creator: 'john',
    isMine: false,
    category: 'NP',
    endDate: '2022-11-11T22:38:05Z',
    status: 'validated',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
  {
    id: 'x',
    objective: 50,
    creator: 'john',
    isMine: false,
    category: 'NP',
    endDate: '2022-12-12T22:38:05Z',
    status: 'relapse',
    relapser: 'Mikael',
    progress: [
      { username: 'Neo', count: 55 },
      { username: 'John', count: 15 },
      { username: 'MalcomX', count: 5 },
      { username: 'Alpha', count: 155455 },
      { username: 'Beta', count: 15 },
      { username: 'Charlie', count: 15 },
      { username: 'DeltaKommandoaoisdhfisuofg7843t98ygrwesvuih', count: 15 },
    ],
  },
];