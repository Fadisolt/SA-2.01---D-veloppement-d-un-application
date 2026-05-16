import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';

export class Game {
  #id;
  #deck = [];
  #mode;
  #vies = 0;
  #timerValue = 0;
  #timerInterval;

  #domManager;
  #config;
  #flippedCards = [];  
  #matchedGroups = 0;  
  #isLocked = false;   

  #prepareDeck(collectionName, nbGroups, nbHomonymes = 2) {
    const source = [...imageCollections[collectionName]];
    const selected = source.sort(() => Math.random() - 0.5).slice(0, nbGroups);
    let tempDeck = [];
    selected.forEach(img => {
      for (let i = 0; i < nbHomonymes; i++) tempDeck.push({ ...img, instanceId: `${img.id}-${i}` });
    });
    for (let i = tempDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
    }
    return tempDeck;
  }

  startGame(id, configGame, domManager) {
    this.#id = id;
    this.#mode = configGame.mode;
    this.#config = configGame;
    this.#domManager = domManager;

    this.#flippedCards = [];
    this.#matchedGroups = 0;
    this.#isLocked = false;
    
    if (this.#timerInterval) clearInterval(this.#timerInterval);

    document.querySelector('.setup-form').classList.add('hidden');
    document.querySelector('.game-area').classList.remove('hidden');
    document.querySelector('#score-display').innerText = `Paires trouvées : 0 / ${configGame.total / configGame.homonymes}`;
    document.querySelector('#lives-display').classList.add('hidden');
    document.querySelector('#timer-display').classList.add('hidden');

    if (this.#mode === 'survie') {
      this.#vies = 10;
      document.querySelector('#lives-display').classList.remove('hidden');
      document.querySelector('#lives-display').innerText = `❤️ Vies : ${this.#vies}`;
    } else if (this.#mode === 'speedrun') {
      this.#timerValue = 60;
      document.querySelector('#timer-display').classList.remove('hidden');
      document.querySelector('#timer-display').innerText = `⏱️ Temps : ${this.#timerValue}s`;
      this.#startTimer();
    }

    const nbGroupsNeeded = configGame.total / configGame.homonymes;
    this.#deck = this.#prepareDeck(configGame.collection, nbGroupsNeeded, configGame.homonymes);
    this.#displayCards();
  }

  #displayCards() {
    this.#domManager.createCards(this.#deck, this);

    if (this.#mode === 'survie') {
      this.#isLocked = true;
      document.querySelectorAll('.card').forEach(card => card.classList.add('flip'));
      
      setTimeout(() => {
        document.querySelectorAll('.card:not(.matched)').forEach(card => card.classList.remove('flip'));
        this.#isLocked = false;
      }, 20000); 
    }
  }

  handleCardClick(cardElement, cardData) {
    if (this.#isLocked || cardElement.classList.contains('matched') || this.#flippedCards.includes(cardElement)) return;

    cardElement.classList.add('flip');
    
    this.#flippedCards.push(cardElement);

    if (this.#flippedCards.length === this.#config.homonymes) this.#checkMatch();
  }

  #checkMatch() {
    this.#isLocked = true;
    const firstId = this.#flippedCards[0].dataset.id;
    const isMatch = this.#flippedCards.every(card => card.dataset.id === firstId);

    if (isMatch) {
      this.#flippedCards.forEach(card => card.classList.add('matched'));
      this.#matchedGroups++;
      document.querySelector('#score-display').innerText = `Paires trouvées : ${this.#matchedGroups} / ${this.#config.total / this.#config.homonymes}`;
      this.#flippedCards = [];
      this.#isLocked = false;

      if (this.#matchedGroups === (this.#config.total / this.#config.homonymes)) this.#handleVictory();
    } else {
      this.#handleMistake();
      setTimeout(() => {
        this.#flippedCards.forEach(card => card.classList.remove('flip'));
        this.#flippedCards = [];
        this.#isLocked = false;
      }, 1000);
    }
  }

  #handleMistake() {
    if (this.#mode === 'survie') {
      this.#vies--;
      document.querySelector('#lives-display').innerText = `❤️ Vies : ${this.#vies}`;
      if (this.#vies <= 0) this.abandonGame();
    }
  }

  #startTimer() {
    const timerDisplay = document.querySelector('#timer-display');
    this.#timerInterval = setInterval(() => {
      this.#timerValue--;
      timerDisplay.innerText = `⏱️ Temps : ${this.#timerValue}s`;
      if (this.#timerValue <= 0) {
        clearInterval(this.#timerInterval);
        this.abandonGame();
      }
    }, 1000);
  }

  #handleVictory() {
    if (this.#mode === 'speedrun') {
      this.#timerValue += 15;
      this.#matchedGroups = 0;
      this.#flippedCards = [];
      const nbGroupsNeeded = this.#config.total / this.#config.homonymes;
      this.#deck = this.#prepareDeck(this.#config.collection, nbGroupsNeeded, this.#config.homonymes);
      this.#displayCards();
    } else {
      clearInterval(this.#timerInterval);
      this.endGame(0);
    }
  }

  abandonGame() {
    clearInterval(this.#timerInterval);
    const remainingCards = this.#config.total - (this.#matchedGroups * this.#config.homonymes);
    this.endGame(remainingCards);
  }

  async endGame(pairsRemaining) {
    if (this.#timerInterval) clearInterval(this.#timerInterval);
    
    try {
      await ApiService.updateGameResult(this.#id, pairsRemaining);
      alert(`Partie terminée ! Cartes non trouvées : ${pairsRemaining}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Partie terminée (Score non enregistré suite à une erreur réseau)');
    } finally {
      document.querySelector('.game-area').classList.add('hidden');
      document.querySelector('.setup-form').classList.remove('hidden');
    }
  }
}