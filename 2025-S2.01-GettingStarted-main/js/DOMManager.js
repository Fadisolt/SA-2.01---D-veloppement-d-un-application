export class DOMManager {
  createCards(deck, gameInstance) {
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = ''; 

    deck.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.id = image.id; 

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="./assets/images/mask1.jpg" alt="Dos">
          </div>
          <div class="card-back">
            <img src="${image.url}" alt="${image.name}">
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        gameInstance.handleCardClick(card, image);
      });

      gameBoard.appendChild(card);
    });
  }
}