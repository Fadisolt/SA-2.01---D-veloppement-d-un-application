import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';

const domManager = new DOMManager();
const game = new Game();


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
    // Todo Spécifier les paramètres de createGame()
    const data = await ApiService.createGame(configGame.playerName,configGame.total);
    console.log('Success:', data, data.id);
    game.startGame(data.id, configGame);
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Erreur lors de la création de la partie');
  }
});
