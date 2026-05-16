import {MEMORY_URL} from './config.js';

export class ApiService {
  static async createGame(pseudo, difficulty) {
    const response = await fetch(`${MEMORY_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pseudo, difficulty: difficulty })
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la partie');
    return response.json();
  }

  static async updateGameResult(gameId, pairsRemaining) {
    const response = await fetch(`${MEMORY_URL}/${gameId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreCoupsRestant: pairsRemaining })
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du score');
    return; 
  }
}