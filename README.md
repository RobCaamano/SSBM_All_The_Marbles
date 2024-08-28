# SSBM All The Marbles

## Sections

- [About](#about)
- [Demo Video](#demo)
- [Features](#features)
- [Tech Stack](#stack)
- [How to use](#usage)

## About <a id="about"></a>

This project was inspired by the many nights of Super Smash Bros. Melee with my friend Santi. We always say that the last game was for "all the marbles"—the winner of the final match takes it all. 
To remember these many moments, I created this project to track and visualize our match data.

Originally designed for just the two of us, I expanded it to accommodate groups of players, providing a way to record and analyze matches.

## Demo Video <a id="demo"></a>

https://github.com/user-attachments/assets/2417d074-ba96-46a1-898d-f7dc33046eb9

## Features <a id="features"></a>

### Data Visualizations

- **Python, Matplotlib, Seaborn**

- Total Wins: Bar graph w/ the total number of wins for each player
- Win Ratio: Pie chart w/ each player's win ratio
- Wins Over Time: Line graph w/ the differential score over time
- Top Characters: Bar graph w/ up to 3 top characters by win count for each player

### Data Displays

- **Python**

- Logs: Displays the player, character used, streak, and date of each match
- Current Streak: Shows the current streak holder, the streak count, start date, and provides live updates on the streak's duration

### Database

- **SQLite**

- Results Table: Tracks each match with the following columns: id, winner, date, streak, character
- Players Table: Stores player information with name and dif_score
- Player_Scores Table: Records differential scores per match with result_id, name, and dif_score for historical data analysis

## Tech Stack <a id="stack"></a>

- **Frontend**: HTML, CSS
- **Backend**: Python - Flask, JavaScript
- **Database**: SQLite
- **Data Analysis & Visualization**: Python - Pandas, Matplotlib, Seaborn

## How to use: <a id="usage"></a>

Before running anything, ensure you have Python installed on your machine. You can download Python from the [official website](https://www.python.org/downloads/). 

1. Clone the repository to your local machine.

```
git clone https://github.com/RobCaamano/SSBM_All_The_Marbles.git
```

2. Navigate to the project directory and download 'requirements.txt'. It is recommended to do this in a virtual environment. For information about creating and using conda environments, visit their [site](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html).

```
cd '[path to dir]'
pip install -r requirements.txt
```

3. Run app.py in your virtual environment.

```
python app.py
```

3. The command line will output a local IP address to access the website. Either ctrl+click or copy+paste into browser url.
