import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';

const domManager = new DOMManager();
const game = new Game();
const difficultySelect = document.querySelector('#difficulty');
const homonymesSelect = document.querySelector('#homonymes');

function updateHomonymesOptions() {
  const total = parseInt(difficultySelect.value);
  const options = homonymesSelect.querySelectorAll('option');

  options.forEach(option => {
    const val = parseInt(option.value);

    if (total % val === 0 && val < total) {
      option.style.display = "block";
      option.disabled = false;
    }
    else {
      option.style.display = "none";
      option.disabled = true;
    }
  });
  const currentVal = parseInt(homonymesSelect.value);
  if (total % currentVal !== 0 || currentVal >= total) {
    homonymesSelect.value = "2";
  }
}

difficultySelect.addEventListener('change', updateHomonymesOptions);

document.querySelector('.game-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const configGame = {
    playerName: document.querySelector('#playerName').value,
    total: parseInt(document.querySelector('#difficulty').value),
    collection: document.querySelector('#collection').value,
    homonymes: parseInt(document.querySelector('#homonymes').value),
    mode: document.querySelector('#mode').value
  };

  try {
    const data = await ApiService.createGame(configGame.playerName,configGame.total);

    console.log("ID reconnu :", data.id);
    console.log('Success:', data);
    game.startGame(data.id, configGame);
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});


document.querySelector('#abandon').addEventListener('click', async function() {
  if (confirm("Êtes-vous sûr de vouloir abandonner la partie ?")) {
    document.querySelector('.game-area').classList.add('hidden');
    document.querySelector('.setup-form').classList.remove('hidden');
  }
});

updateHomonymesOptions();