const API_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1e51134355673';
const LEADERBOARD_ID = 'ljHb2cGVsxBGPX7TCeS5d';

const setStatus = (message) => {
  document.querySelector('.status-message').textContent = message;
};

const checkResponse = (response) => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }
};

const getScores = async () => {
  const response = await fetch(API_URL);
  checkResponse(response);

  const record = await response.json();
  if (!record.data || record.data.leaderboardId !== LEADERBOARD_ID
    || !Array.isArray(record.data.scores)) {
    throw new Error('The score service returned an invalid response.');
  }

  const { scores } = record.data;
  if (!scores.every((score) => score
    && typeof score.user === 'string' && Number.isFinite(score.score))) {
    throw new Error('The score service returned invalid score entries.');
  }

  return scores;
};

export const refresh = async () => {
  const scoreContainer = document.querySelector('.score-container');
  scoreContainer.textContent = '';
  setStatus('Loading scores...');

  try {
    const scores = await getScores();
    scores.sort((a, b) => b.score - a.score);

    scores.forEach((score) => {
      const item = document.createElement('li');
      item.textContent = `${score.user}: ${score.score}`;
      scoreContainer.appendChild(item);
    });

    setStatus(scores.length === 0 ? 'No scores yet.' : '');
  } catch (error) {
    setStatus(`Unable to load scores: ${error.message}`);
  }
};

export const addYourData = async () => {
  const inputName = document.querySelector('.inputName');
  const inputScore = document.querySelector('.inputScore');
  const name = inputName.value.trim();
  const scoreText = inputScore.value;
  const score = Number(scoreText);

  if (!name || scoreText === '' || !Number.isInteger(score)) {
    setStatus('Enter a name and a whole-number score.');
    return;
  }

  setStatus('Adding score...');

  try {
    const scores = await getScores();
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Leaderboard Project Scores',
        data: {
          leaderboardId: LEADERBOARD_ID,
          scores: [...scores, { user: name, score }],
        },
      }),
    });
    checkResponse(response);

    inputName.value = '';
    inputScore.value = '';
    setStatus('Score added. Press Refresh to load scores.');
  } catch (error) {
    setStatus(`Unable to add score: ${error.message}`);
  }
};