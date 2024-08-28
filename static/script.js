let selectedP1 = null;
let selectedP2 = null;

let selectedP1Character = null;
let selectedP2Character = null;

let winningPlayer = null;
let winningCharacter = null;

let currentAudio = null;

let isZelda = true;

// Show / Hide Alerts

function showAlert(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'block';
}

function closeAlert() {
    // Audio back sound
    const audio = new Audio('static/sounds/Back.wav');
    audio.volume = 0.1;
    audio.play();
    document.getElementById('custom-alert').style.display = 'none';
}

// Drag & Drop functionality for character selection

document.addEventListener('DOMContentLoaded', function () {
    // Character Select Images
    const characterImages = {
        "Dr Mario": "static/images/Dr Mario Select.png",
        "Mario": "static/images/Mario Select.png",
        "Luigi": "static/images/Luigi Select.png",
        "Bowser": "static/images/Bowser Select.png",
        "Peach": "static/images/Peach Select.png",
        "Yoshi": "static/images/Yoshi Select.png",
        "Donkey Kong": "static/images/Donkey Kong Select.png",
        "Captain Falcon": "static/images/Captain Falcon Select.png",
        "Ganondorf": "static/images/Ganondorf Select.png",
        "Falco": "static/images/Falco Select.png",
        "Fox": "static/images/Fox Select.png",
        "Ness": "static/images/Ness Select.png",
        "Ice Climbers": "static/images/Ice Climbers Select.png",
        "Kirby": "static/images/Kirby Select.png",
        "Samus": "static/images/Samus Select.png",
        "Zelda": "static/images/Zelda Select.png",
        "Link": "static/images/Link Select.png",
        "Young Link": "static/images/Young Link Select.png",
        "Pichu": "static/images/Pichu Select.png",
        "Pikachu": "static/images/Pikachu Select.png",
        "Jigglypuff": "static/images/Jigglypuff Select.png",
        "Mewtwo": "static/images/Mewtwo Select.png",
        "Mr Game & Watch": "static/images/Mr Game & Watch Select.png",
        "Marth": "static/images/Marth Select.png",
        "Roy": "static/images/Roy Select.png",
    };

    // Characters
    const characterSounds = {
        "Dr Mario": "static/sounds/Dr Mario.wav",
        "Mario": "static/sounds/Mario.wav",
        "Luigi": "static/sounds/Luigi.wav",
        "Bowser": "static/sounds/Bowser.wav",
        "Peach": "static/sounds/Peach.wav",
        "Yoshi": "static/sounds/Yoshi.wav",
        "Donkey Kong": "static/sounds/Donkey Kong.wav",
        "Captain Falcon": "static/sounds/Captain Falcon.wav",
        "Ganondorf": "static/sounds/Ganondorf.wav",
        "Falco": "static/sounds/Falco.wav",
        "Fox": "static/sounds/Fox.wav",
        "Ness": "static/sounds/Ness.wav",
        "Ice Climbers": "static/sounds/Ice Climbers.wav",
        "Kirby": "static/sounds/Kirby.wav",
        "Samus": "static/sounds/Samus.wav",
        "Zelda": "static/sounds/Zelda.wav",
        "Link": "static/sounds/Link.wav",
        "Young Link": "static/sounds/Young Link.wav",
        "Pichu": "static/sounds/Pichu.wav",
        "Pikachu": "static/sounds/Pikachu.wav",
        "Jigglypuff": "static/sounds/Jigglypuff.wav",
        "Mewtwo": "static/sounds/Mewtwo.wav",
        "Mr Game & Watch": "static/sounds/Mr Game & Watch.wav",
        "Marth": "static/sounds/Marth.wav",
        "Roy": "static/sounds/Roy.wav",
    };

    // Transformation between Zelda and Sheik
    const transformButtonP1 = document.getElementById('transform-btn-p1');
    const transformButtonP2 = document.getElementById('transform-btn-p2');

    // Function to handle Zelda-Sheik transformation
    function transformation(transformButton, bottomImage) {
        transformButton.style.display = 'block'; // Ensure the button is visible

        transformButton.addEventListener('click', () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0; // Reset the sound
            }
        
            // Play the new sound
            currentAudio = new Audio('static/sounds/Transform.wav');
            currentAudio.volume = 0.1;
            currentAudio.play();

            if (isZelda) {
                bottomImage.src = "static/images/Sheik Select.png";
                isZelda = false;
            } else {
                bottomImage.src = "static/images/Zelda Select.png";
                isZelda = true;
            }
        });
    }

    const draggables = document.querySelectorAll('#p1, #p2');
    const dropzones = document.querySelectorAll('.dropzone');
    let draggedElement = null;

    // Handle drag start
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function (e) {
            draggedElement = e.target;
            e.target.style.opacity = 0.5;
        });

        draggable.addEventListener('dragend', function (e) {
            e.target.style.opacity = 1; // Reset opacity
        });
    });

    // Handle drag over
    dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragover', function (e) {
            e.preventDefault(); // Allow drop
        });

        // Handle drop
        dropzone.addEventListener('drop', function (e) {
            e.preventDefault();
            if (draggedElement) {
                // Append dragged element to the dropzone
                this.appendChild(draggedElement);
                
                // Position the icon centered within the dropzone
                draggedElement.style.position = 'absolute';
                draggedElement.style.left = '50%';
                draggedElement.style.top = '50%';
                draggedElement.style.transform = 'translate(-50%, -50%)';

                // Get dropzone character
                const character = this.getAttribute('data-character');

                // Update Select Image
                if (draggedElement.id === 'p1') {
                    const bottomImageP1 = document.getElementById('bottom-image-p1');
                    if (character && characterImages[character]) {
                        selectedP1Character = character;
                        bottomImageP1.src = characterImages[character];
                        bottomImageP1.style.display = 'block';

                        // Check if Zelda for Sheik transformation
                        if (character === 'Zelda'){
                            transformation(transformButtonP1, bottomImageP1)
                        }
                        else{
                            transformButtonP1.style.display = 'none';
                        }
                    }
                } else if (draggedElement.id === 'p2') {
                    const bottomImageP2 = document.getElementById('bottom-image-p2');
                    if (character && characterImages[character]) {
                        selectedP2Character = character;
                        bottomImageP2.src = characterImages[character];
                        bottomImageP2.style.display = 'block';

                        // Check if Zelda for Sheik transformation
                        if (character === 'Zelda'){
                            transformation(transformButtonP2, bottomImageP2)
                        }
                        else{
                            transformButtonP2.style.display = 'none';
                        }
                    }
                }

                // Play character sound
                if (character && characterSounds[character]) {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0; // Reset the sound
                    }
                
                    // Play the new sound
                    currentAudio = new Audio(characterSounds[character]);
                    currentAudio.volume = 0.1;
                    currentAudio.play();
                }
            }
        });
    });
});

// Drowndown menu and add player selection

document.addEventListener('DOMContentLoaded', function () {
    const nameInput1 = document.getElementById('name1');
    const nameInput2 = document.getElementById('name2');

    const dropdown1 = document.getElementById('player-dropdown-p1');
    const dropdown2 = document.getElementById('player-dropdown-p2');

    const addButton1 = document.getElementById('add-btn1');
    const addButton2 = document.getElementById('add-btn2');

    // Populate drowndown with players
    function updateDropdown(players, dropdown) {
        let nameInput, oppositeSelected;
        if (dropdown === dropdown1) {
            nameInput = nameInput1;
            oppositeSelected = selectedP2;
        }
        else if (dropdown === dropdown2) {
            nameInput = nameInput2;
            oppositeSelected = selectedP1;
        }

        dropdown.innerHTML = ''; // Clear existing options
        players.forEach(player => {
            if (player.name !== oppositeSelected) { // Exclude selected name from the opposite dropdown
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = player.name;
                option.addEventListener('click', () => {
                    nameInput.value = option.textContent; // Update text box with selected value
                    hideDropdown(dropdown);
    
                    // Update the globally stored player names
                    if (dropdown === dropdown1) {
                        selectedP1 = option.textContent; // Store selected P1 name
                    } else if (dropdown === dropdown2) {
                        selectedP2 = option.textContent; // Store selected P2 name
                    }
                });
                dropdown.appendChild(option);
            }
        });
    }

    // Fetch players from DB
    async function fetchPlayers(dropdown) {
        try {
            const response = await fetch('/get_players');
            const players = await response.json();
            updateDropdown(players, dropdown);
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    }

    // Add player to DB
    async function addPlayer(name) {
        try {
            const response = await fetch('/add_player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
    
            if (response.status === 204) {
                fetchPlayers(dropdown1);
                fetchPlayers(dropdown2);
            } else if (response.status === 409) {
                const data = await response.json();
                // Audio error sound
                const audio = new Audio('static/sounds/Error.wav');
                audio.volume = 0.1;
                audio.play().then(() => {
                    showAlert(data.error); // Show alert if player already exists
                });
            } else {
                console.error('Error adding player:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding player:', error);
        }
    }

    // Show dropdown menu based on P1 / P2
    function showDropdown(dropdown) {
        dropdown.style.display = 'block';
        fetchPlayers(dropdown);
    }

    // Show dropdown menu based on P1 / P2
    function hideDropdown(dropdown) {
        dropdown.style.display = 'none';
    }

    // Show Dropdown 1
    nameInput1.addEventListener('focus', function () {
        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();

        showDropdown(dropdown1);
    });

    // Show Dropdown 2
    nameInput2.addEventListener('focus', function () {
        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();

        showDropdown(dropdown2);
    });

    // Hide Dropdown
    document.addEventListener('click', function (e) {
        if (!dropdown1.contains(e.target) && e.target !== nameInput1) {
            hideDropdown(dropdown1);
        }
        if (!dropdown2.contains(e.target) && e.target !== nameInput2) {
            hideDropdown(dropdown2);
        }
    });

    // Prevent dropdown from hiding when clicking on it
    dropdown1.addEventListener('mousedown', function (e) {
        e.preventDefault();
    });
    
    dropdown2.addEventListener('mousedown', function (e) {
        e.preventDefault();
    });

    // Add player to DB
    addButton1.addEventListener('click', function () {
        const name = nameInput1.value.trim().toUpperCase();
        if (name) {
            // Audio add sound
            const audio = new Audio('static/sounds/Start.wav');
            audio.volume = 0.1;
            audio.play();
                        
            addPlayer(name);
            selectedP1 = name;
        }
    });

    addButton2.addEventListener('click', function () {
        const name = nameInput2.value.trim().toUpperCase();
        if (name) {
            // Audio add sound
            const audio = new Audio('static/sounds/Start.wav');
            audio.volume = 0.1;
            audio.play();

            addPlayer(name);
            selectedP2 = name;
        }
    });

    // Init population
    fetchPlayers(dropdown1); // Initial dropdown population
    fetchPlayers(dropdown2); // Initial dropdown population
});

// ToolBar functionality

document.addEventListener('DOMContentLoaded', function () {
    const showGraphsBtn = document.getElementById('show-graphs-btn');
    const graphsDropdown = document.getElementById('graphs-dropdown');
    const playerDropdown = document.getElementById('graph-player-dropdown');
    const graphImage = document.getElementById('graph-image');
    const graphsContainer = document.getElementById('graphs-container');

    // Show dropdown when clicking Show Graphs button
    showGraphsBtn.addEventListener('click', function () {
        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();

        const isVisible = graphsDropdown.style.display === 'block';
        graphsDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!showGraphsBtn.contains(e.target) && !graphsDropdown.contains(e.target)) {
            graphsDropdown.style.display = 'none';
        }
    });

    // Fetch and display the selected graph

    graphsDropdown.addEventListener('change', function () {
        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();
        
        const selectedOptions = Array.from(graphsDropdown.selectedOptions).map(option => option.value);
        
        if (selectedOptions.length === 0) {
            graphsContainer.style.display = 'none';
            return;
        }

        // If Selected Option is top-characters, show graph-player-dropdown
        if (selectedOptions[0] === 'top-characters') {
            const playerDropdown = document.getElementById('graph-player-dropdown');
            playerDropdown.style.display = 'block';
    
            const plotType = selectedOptions[0];
            fetch(`/plot/${plotType}`)
                .then(response => {
                    // Extract player name from response headers
                    const playerName = response.headers.get('player_name');
                    
                    // Create a blob URL for the image
                    return response.blob().then(blob => {
                        const imgUrl = URL.createObjectURL(blob);
                        graphImage.src = imgUrl;
                        
                        // Update dropdown with player name
                        if (playerName) {
                            playerDropdown.value = playerName;
                        } else {
                            playerDropdown.value = '';
                        }
    
                        graphImage.onload = () => {
                            graphsContainer.style.display = 'block';
                        };
    
                        graphImage.onerror = () => {
                            // Audio error sound
                            const audio = new Audio('static/sounds/Error.wav');
                            audio.volume = 0.1;
                            audio.play().then(() => {
                                showAlert('No data available');
                            });
                            graphsContainer.style.display = 'none';
                        };
                    });
                })
                .catch(error => {
                    // Audio error sound
                    const audio = new Audio('static/sounds/Error.wav');
                    audio.volume = 0.1;
                    audio.play().then(() => {
                        showAlert('No data available');
                    });
                    graphsContainer.style.display = 'none';
                });
        } else {
            document.getElementById('graph-player-dropdown').style.display = 'none';
            Array.from(playerDropdown.options).forEach(option => option.selected = false); // Deselect all player options
            // Show the first selected graph
            const plotType = selectedOptions[0];
            graphImage.src = `/plot/${plotType}`;
            graphImage.onload = () => {
                graphsContainer.style.display = 'block';
            };
            graphImage.onerror = () => {
                // Audio error sound
                const audio = new Audio('static/sounds/Error.wav');
                audio.volume = 0.1;
                audio.play().then(() => {
                    showAlert('No data available');
                });
                graphsContainer.style.display = 'none';
            };
        }
    });

    // "Insert Result" button functionality
    document.getElementById('insert-result-btn').addEventListener('click', function () {
        if (!selectedP1 || !selectedP2) {
            // Audio error sound
            const audio = new Audio('static/sounds/Error.wav');
            audio.volume = 0.1;
            audio.play().then(() => {
                showAlert('Please select players');
            });
            return;
        }
        if (!selectedP1Character || !selectedP2Character) {
            // Audio error sound
            const audio = new Audio('static/sounds/Error.wav');
            audio.volume = 0.1;
            audio.play().then(() => {
                showAlert('Please select characters');
            });
            return;
        }

        // Handle name being selected after win icon dropped
        const winIcon = document.getElementById('win');
        const dropzoneP1 = document.getElementById('dropzone-p1');
        const dropzoneP2 = document.getElementById('dropzone-p2');

        // Check if win icon is already dropped
        if (dropzoneP1.contains(winIcon)) {
            winningPlayer = selectedP1;
            winningCharacter = selectedP1Character.toUpperCase();
        } else if (dropzoneP2.contains(winIcon)) {
            winningPlayer = selectedP2;
            winningCharacter = selectedP2Character.toUpperCase();
        } else {
            // Audio error sound
            const audio = new Audio('static/sounds/Error.wav');
            audio.volume = 0.1;
            audio.play().then(() => {
                showAlert('Please drag the win icon to a player');
            });
            return;
        }
        
        if (winningPlayer) {
            if (winningCharacter === 'ZELDA' && isZelda) {
                winningCharacter = winningCharacter;
            } else {
                if(winningCharacter === 'ZELDA'){
                    winningCharacter = 'SHEIK';
                }
            }
            // Send result to server
            fetch('/insert_result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    winner: winningPlayer,
                    character: winningCharacter
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(data.message);
                    location.reload(); // Reload page
                } else {
                    console.error('Error inserting result:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        } else {
            // Audio error sound
            const audio = new Audio('static/sounds/Error.wav');
            audio.volume = 0.1;
            audio.play().then(() => {
                showAlert('Please drag the win icon to a player');
            });
        }
    });

    // "Reset" button functionality
    const modal = document.getElementById('confirm-reset-modal');
    const closeBtn = document.querySelector('.modal .close-btn-modal');
    const confirmYesBtn = document.getElementById('confirm-reset-yes');
    const confirmNoBtn = document.getElementById('confirm-reset-no');

    // Handle reset button click
    document.getElementById('reset-btn').addEventListener('click', function () {
        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();
        modal.style.display = 'block';
    });

    // Close the modal
    closeBtn.addEventListener('click', function () {
        // Audio back sound
        const audio = new Audio('static/sounds/Back.wav');
        audio.volume = 0.1;
        audio.play();
        modal.style.display = 'none';
    });

    // Confirm reset
    confirmYesBtn.addEventListener('click', function () {
        fetch('/reset_db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                showAlert('Error resetting database: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error resetting database: ' + error.message);
        });
        modal.style.display = 'none';
    });

    // Cancel reset
    confirmNoBtn.addEventListener('click', function () {
        // Audio back sound
        const audio = new Audio('static/sounds/Back.wav');
        audio.volume = 0.1;
        audio.play();
        modal.style.display = 'none';
    });

    // Close the modal if user clicks outside of the modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

});

// Win Icon Dropzone functionality

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const winIcon = document.getElementById('win');
    const dropzoneP1 = document.getElementById('dropzone-p1');
    const dropzoneP2 = document.getElementById('dropzone-p2');

    // Handle dragging the win icon
    winIcon.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id); // Send win icon id
    });

    // Allow dropzones to accept the drop
    [dropzoneP1, dropzoneP2].forEach(dropzone => {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const droppedElementId = e.dataTransfer.getData('text');
            if (droppedElementId === 'win') {
                if (e.target.id === 'dropzone-p1' && selectedP1) { // P1 set winning player & character
                    e.target.appendChild(document.getElementById(droppedElementId));
                    winningPlayer = selectedP1;
                    winningCharacter = selectedP1Character;
                } else if (e.target.id === 'dropzone-p2' && selectedP2) { // P2 set winning player & character
                    e.target.appendChild(document.getElementById(droppedElementId));
                    winningPlayer = selectedP2;
                    winningCharacter = selectedP2Character;
                }
            }
        });
    });
});

// Graph Window functionality

document.addEventListener('DOMContentLoaded', function () {
    const graphContainer = document.getElementById('graphs-container');
    const graphImage = document.getElementById('graph-image');
    const graphsDropdown = document.getElementById('graphs-dropdown');
    const playerDropdown = document.getElementById('graph-player-dropdown');
    const closeBtn = document.querySelector('.close-btn-graphs');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Make the graph window draggable
    const header = document.querySelector('.graph-header');
    
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = graphContainer.offsetLeft;
        initialY = graphContainer.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            graphContainer.style.left = initialX + deltaX + 'px';
            graphContainer.style.top = initialY + deltaY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Fetch and populate player names
    fetch('/get_players')
    .then(response => response.json())
    .then(players => {
        playerDropdown.innerHTML = ''; // Clear existing options
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerDropdown.appendChild(option);
        });
    });

    // Audio select sound for player dropdown
    playerDropdown.addEventListener('click', function () {
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();
    });

    // Fetch and display the selected graph
    playerDropdown.addEventListener('change', function () {
        const selectedPlayer = playerDropdown.value;
        const plotType = graphsDropdown.value;

        // Audio select sound
        const audio = new Audio('static/sounds/Select.wav');
        audio.volume = 0.1;
        audio.play();

        if (selectedPlayer && plotType) {
            graphImage.src = `/plot/${plotType}?player_name=${selectedPlayer}`;
            graphImage.onload = () => {
                graphContainer.style.display = 'block';
            };
            graphImage.onerror = () => {
                // Deselect all options
                Array.from(graphsDropdown.options).forEach(option => option.selected = false);
                Array.from(playerDropdown.options).forEach(option => option.selected = false);

                // Audio error sound
                const audio = new Audio('static/sounds/Error.wav');
                audio.volume = 0.1;
                audio.play().then(() => {
                    showAlert('No data available');
                });
                graphContainer.style.display = 'none';
            };
        }
    });

    // Close button functionality
    closeBtn.addEventListener('click', () => {
        // Audio back sound
        const audio = new Audio('static/sounds/Back.wav');
        audio.volume = 0.1;
        audio.play();
        graphContainer.style.display = 'none';

        // Deselect all options
        Array.from(graphsDropdown.options).forEach(option => option.selected = false);
        Array.from(playerDropdown.options).forEach(option => option.selected = false);
    });

    // Resize handle functionality
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = graphContainer.clientWidth;
        initialY = graphContainer.clientHeight;
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            graphContainer.style.width = initialX + deltaX + 'px';
            graphContainer.style.height = initialY + deltaY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
});

// Fetch and populate logs

document.addEventListener('DOMContentLoaded', function () {
    const logsBody = document.getElementById('logs-body');

    function loadLogs() {
        fetch('/get_results_logs')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    logsBody.innerHTML = '<p>No data available</p>';
                } else {
                    logsBody.innerHTML = '';  // Clear logs
                    data.reverse(); // Reverse order to show most recent first
                    data.forEach(log => {
                        const row = document.createElement('tr');

                        // Create table cells
                        row.innerHTML = `
                        <td>${log.winner}</td>
                        <td>${log.character}</td>
                        <td>${log.streak}</td>
                        <td>${log.date}</td>
                        `;
                
                        logsBody.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error fetching logs:', error));
    }

    // Load logs on page load
    loadLogs();
});

// Fetch and populate current streak

document.addEventListener('DOMContentLoaded', function () {
    const streakWinner = document.getElementById('winner');
    const streakElement = document.getElementById('streak');
    const streakStartElement = document.getElementById('streak-start');
    const streakDurationElement = document.getElementById('streak-duration');

    function loadCurrentStreak() {
        fetch('/get_current_streak')
            .then(response => response.json())
            .then(data => {
                // Check if data is available
                if (data.winner && data.streak && data['start date'] && data.duration) {
                    streakWinner.textContent = data.winner;
                    streakElement.textContent = data.streak;
                    streakStartElement.textContent = data['start date'];
                    streakDurationElement.textContent = data.duration;
                    
                } else {
                    streakWinner.textContent = 'No data available';
                    streakElement.textContent = '';
                    streakStartElement.textContent = '';
                    streakDurationElement.textContent = '';
                }
            })
            .catch(error => console.error('Error fetching current streak:', error));
    }

    // Load current streak on page load
    setInterval(loadCurrentStreak, 1000);
});