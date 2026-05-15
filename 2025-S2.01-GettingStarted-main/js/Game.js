import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';


export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   * @type {} tableau de cartes
   */
  #id;
  #deck = [];
  #mode;
  #vies = 0;
  #timerValue = 0;
  #timerInterval;

  #prepareDeck(collectionName, nbGroups, nbHomonymes = 2) {

    const source = [...imageCollections[collectionName]];
    const selected = source
        .sort(() => Math.random() - 0.5)
        .slice(0, nbGroups);

    let tempDeck = [];
    selected.forEach(img => {
      for (let i = 0; i < nbHomonymes; i++) {
        tempDeck.push({
          ...img,
          instanceId: `${img.id}-${i}`
        });
      }
    });

    for (let i = tempDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
    }

    return tempDeck;
  }


  async endGame(pairsRemaining) {
    try {
      const result = await ApiService.updateGameResult(this.#id, pairsRemaining);
      console.log('Fin de partie enregistrée:', result);
      alert(`Partie terminée ! Paires non trouvées : ${pairsRemaining}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Erreur lors de l envoi du score de fin de partie');
    }
  }

  /**
   * Start a new game.
   * @param {number} id - The game ID.
   * @param configGame
   */
  startGame(id, configGame) {

    this.#id = id;
    this.#mode = configGame.mode;

    document.querySelector('.setup-form').classList.add('hidden');
    document.querySelector('.game-area').classList.remove('hidden');

    const nbGroupsNeeded = configGame.total / configGame.homonymes;
    this.#deck = this.#prepareDeck(configGame.collection, nbGroupsNeeded, configGame.homonymes);

    console.log("Le paquet est prêt :", this.#deck);

    if (this.#mode === 'survie') {
      this.#vies = 10;
      console.log("Mode survie : 10 erreurs max");
    }
    else if (this.#mode === 'speedrun') {
      this.#timerValue = 60;
      console.log("Mode speedrun");
    }

    this.#displayCards(); //A Completer

  }

}
