import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';


export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   * @type {} tableau de cartes
   */
  #id;
  #deck = [];
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


  async endGame() {
    // Todo À compléter


    const idARemplacer = 1234;
    const nombreDePairesRestanteARemplacer = 5678;

    try {
      const result = await ApiService.updateGameResult(idARemplacer, nombreDePairesRestanteARemplacer);
      console.log('Fin de partie:', result);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Erreur lors de la fin de la partie');
    }

  }

  /**
   * Start a new game.
   * @param {number} id - The game ID.
   */
  startGame(id, configGame) {
    this.#id = id;
    const nbGroupsNeeded = configGame.total / configGame.homonymes;

    this.#deck = this.#prepareDeck(configGame.collection, nbGroupsNeeded, configGame.homonymes);
  }

  // Todo À compléter

}
