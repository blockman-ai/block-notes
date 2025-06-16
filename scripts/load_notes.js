// load_notes.js

async function loadBlockNotes() {
  try {
      const response = await fetch('data/notes.json');
          const notes = await response.json();

              const container = document.getElementById('notes-container');
                  container.innerHTML = '';

                      const sortedBlocks = Object.keys(notes).sort((a, b) => b - a); // newest first

                          sortedBlocks.forEach(block => {
                                const { message, inscription } = notes[block];

                                      const card = document.createElement('div');
                                            card.className = 'card';

                                                  card.innerHTML = `
                                                          <p><strong>Block ${block}:</strong></p>
                                                                  <p class="inscription">${message}</p>
                                                                          <p>Inscription ID: <span class="inscription">${inscription}</span></p>
                                                                                `;

                                                                                      container.appendChild(card);
                                                                                          });
                                                                                            } catch (error) {
                                                                                                console.error('Failed to load notes:', error);
                                                                                                  }
                                                                                                  }

                                                                                                  window.onload = loadBlockNotes;
                                                                                                  