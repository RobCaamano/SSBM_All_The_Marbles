import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import seaborn as sns
from datetime import datetime
import numpy as np

### Table Creation

conn = sqlite3.connect('melee_results.db') # Creates db if it doesn't exist

cursor = conn.cursor()

### Create results table
#       One instance per result
#       id: unique identifier autoincremented
#       winner: name of winner
#       date: timestamp of when result was added
#       streak: number of consecutive wins

cursor.execute('''
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    winner TEXT NOT NULL,
    date TIMESTAMP DEFAULT (datetime('now', 'localtime')),
    streak INTEGER,
    character TEXT
)
''')

### Create players table
#       One instance per player
#       name: player name
#       dif_score: current dif score

cursor.execute('''
CREATE TABLE IF NOT EXISTS players (
    name TEXT PRIMARY KEY,
    dif_score INTEGER DEFAULT 0
)
''')

### Create player dif score table
#       One instance per player per result
#       result_id: id of result
#       name: player name
#       dif_score: dif score at time of result

cursor.execute('''
CREATE TABLE IF NOT EXISTS player_scores (
    result_id INTEGER,
    name TEXT,
    dif_score INTEGER DEFAULT 0,
    FOREIGN KEY (result_id) REFERENCES results (id) ON DELETE CASCADE,
    FOREIGN KEY (name) REFERENCES players (name) ON DELETE CASCADE,
    PRIMARY KEY (result_id, name)
)
''')

conn.commit()
conn.close()

# Connection to DB function
def connect_db():
    conn = sqlite3.connect('melee_results.db')
    cursor = conn.cursor()
    return conn, cursor

### Inserting data

# Logic:
#   winner: winner's name
#   date: current timestamp
#   streak: incr with win, reset with loss
#   dif_score: incr with win, dec with loss

# Insert new win result
def insert_result(winner, character):
    # Connect to DB
    conn, cursor = connect_db()

    # Add player if not in 'players' table
    cursor.execute('SELECT name FROM players WHERE name = ?', (winner,))
    if not cursor.fetchone():
        insert_player(winner)

    # Update streak
    cursor.execute('SELECT winner, streak FROM results ORDER BY id DESC LIMIT 1')
    last_result = cursor.fetchone()

    print(winner)
    print(last_result)

    if last_result:
        last_winner = last_result[0]
        last_streak = last_result[1]
        if last_winner == winner:
            new_streak = last_streak + 1 # Repeat win for player
        else:
            new_streak = 1 # First win for player
    else:
        new_streak = 1  # First win

    # Get timestamp
    current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Insert new result into results table
    cursor.execute('''
        INSERT INTO results (winner, date, streak, character)
        VALUES (?, ?, ?, ?)
    ''', (winner, current_timestamp, new_streak, character))

    # Get id of new result
    result_id = cursor.lastrowid

    # Update all players' dif_score and log it in player_scores table
    update_dif_score(winner, result_id, cursor)

    conn.commit()
    conn.close()

    print(f'Result added: {winner} won, using {character}, streak: {new_streak}')

# Insert new player
def insert_player(name):
    conn, cursor = connect_db()

    try:
        cursor.execute('INSERT INTO players (name, dif_score) VALUES (?, 0)', (name,))
        conn.commit()
        print(f'Player {name} added with initial dif_score of 0.')
        return 'success'
    except sqlite3.IntegrityError:
        return 'exists' # Return exists for backend to handle
    finally:
        conn.close()

### Update all players' dif_score

def update_dif_score(winner, result_id, cursor):

    # Increase winner's dif_score by 1
    cursor.execute('''
        UPDATE players
        SET dif_score = dif_score + 1
        WHERE name = ?
    ''', (winner,))

    # Decrease all other players' dif_score by 1
    cursor.execute('''
        UPDATE players
        SET dif_score = dif_score - 1
        WHERE name != ?
    ''', (winner,))

    # Log all dif_score in player_scores table
    cursor.execute('SELECT name, dif_score FROM players')
    all_players = cursor.fetchall()

    for name, dif_score in all_players:
        # Ensure the result_id and name combination is unique
        cursor.execute('''
            INSERT OR REPLACE INTO player_scores (result_id, name, dif_score)
            VALUES (?, ?, ?)
        ''', (result_id, name, dif_score))

### Querying data

def fetch_data(table_name):
    conn, cursor = connect_db()
    
    # Fetch all data
    cursor.execute(f'SELECT * FROM {table_name}')
    rows = cursor.fetchall()
    
    # Load data into DataFrame
    if table_name == 'players':
        df = pd.DataFrame(rows, columns=['name', 'dif_score'])
    elif table_name == 'results':
        df = pd.DataFrame(rows, columns=['id', 'winner', 'date', 'streak', 'character'])
    elif table_name == 'player_scores':
        df = pd.DataFrame(rows, columns=['result_id', 'name', 'dif_score'])
    
    conn.close()
    
    return df

### Top Character Getter

# Character images
char_imgs = {
    'DR MARIO': './static/images/Dr Mario Icon.png',
    'MARIO': './static/images/Mario Icon.png',
    'LUIGI': './static/images/Luigi Icon.png',
    'BOWSER': '.static/images/Bowser Icon.png',
    'PEACH': './static/images/Peach Icon.png',
    'YOSHI': './static/images/Yoshi Icon.png',
    'DONKEY KONG': './static/images/Donkey Kong Icon.png',
    'CAPTAIN FALCON': './static/images/Captain Falcon Icon.png',
    'GANONDORF': './static/images/Ganondorf Icon.png',
    'FALCO': './static/images/Falco Icon.png',
    'FOX': './static/images/Fox Icon.png',
    'NESS': './static/images/Ness Icon.png',
    'ICE CLIMBERS': './static/images/Ice Climbers Icon.png',
    'KIRBY': './static/images/Kirby Icon.png',
    'SAMUS': './static/images/Samus Icon.png',
    'ZELDA': './static/images/Zelda Icon.png',
    'SHEIK': './static/images/Sheik Icon.png',
    'LINK': './static/images/Link Icon.png',
    'YOUNG LINK': './static/images/Young Link Icon.png',
    'PICHU': './static/images/Pichu Icon.png',
    'PIKACHU': './static/images/Pikachu Icon.png',
    'JIGGLYPUFF': './static/images/Jigglypuff Icon.png',
    'MEWTWO': './static/images/Mewtwo Icon.png',
    'MR GAME & WATCH': './static/images/Mr Game & Watch Icon.png',
    'MARTH': './static/images/Marth Icon.png',
    'ROY': './static/images/Roy Icon.png'
}

# Get top x characters for each player based on wins
def get_top_characters(player_name, results_df, top_x, char_imgs = char_imgs):
    player_data = results_df[results_df['winner'] == player_name]
    character_win_counts = player_data['character'].value_counts().reset_index()
    character_win_counts.columns = ['character', 'win_count']

    # Get top x characters
    top_chars = character_win_counts.sort_values(by='win_count', ascending=False).head(top_x)
    
    top_chars_imgs = []
    for char in top_chars['character']:
        top_chars_imgs.append(char_imgs.get(char, None))

    return top_chars, top_chars_imgs

### Data Analysis

# Current streak # and duration
def current_streak(df):
    # Account for no wins
    if df.empty:
        return None, None, None, None

   # Date -> datetime
    df['date'] = pd.to_datetime(df['date'])

    current_date = datetime.now()

    # Get most recent win
    latest_win = df.iloc[-1]
    latest_streak = latest_win['streak']
    latest_win_date = latest_win['date']
    winner = latest_win['winner']

    # Check if current streak is ongoing
    if latest_streak > 1:
        # Get first win in current streak
        first_win = df.iloc[-latest_streak]
        oldest_win_date = first_win['date']

        # Calculate duration of current streak
        streak_duration = current_date - oldest_win_date
    else:
        oldest_win_date = latest_win_date
        streak_duration = current_date - oldest_win_date

    #print(streak_duration)

    # Time elapsed
    days = streak_duration.days
    hours, remainder = divmod(streak_duration.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    return f'{winner}', f'{latest_streak}', oldest_win_date.strftime('%Y-%m-%d %H:%M:%S'), f'{days} days, {hours} hours, {minutes} minutes, {seconds} seconds'

# Bar graph totals
def plot_totals():
    results_df = fetch_data('results')
    players_df = fetch_data('players')
    # Account for no wins
    if results_df.empty:
        return None
    
    win_counts = results_df['winner'].value_counts()
    players = players_df['name']

    # Add players with no wins to win_counts
    win_counts_df = pd.DataFrame(index=players)
    win_counts_df['win_count'] = win_counts
    win_counts_df['win_count'] = win_counts_df['win_count'].fillna(0)

    win_counts_df = win_counts_df.reset_index()
    win_counts_df.columns = ['player', 'win_count']

    # Create bar plot
    plt.figure(figsize=(10, 6), facecolor='#2B2B2B')
    ax = sns.barplot(
        data=win_counts_df, 
        x='player', 
        y='win_count', 
        hue='player', 
        palette='bright'
    )

    for index, player in enumerate(players):
        _, top_char_images = get_top_characters(player, results_df, 2)
        
        # Determine the position for one or two images

        # One image
        if len(top_char_images) == 1:
            # Center the image horizontally on the bar
            img = plt.imread(top_char_images[0])
            imagebox = OffsetImage(img, zoom=1) # Zoom changes img size
            ab = AnnotationBbox(
                imagebox, 
                (index, win_counts_df.loc[index, 'win_count']), 
                frameon=False, 
                xybox=(0, 10), 
                xycoords='data', 
                boxcoords="offset points", 
                pad=0.5
            )
            ax.add_artist(ab)
        elif len(top_char_images) == 2:
            # Position the two images side by side horizontally
            img1 = plt.imread(top_char_images[0])
            img2 = plt.imread(top_char_images[1])

            # Offset for side-by-side images
            offset = 15

            imagebox1 = OffsetImage(img1, zoom=1) # Zoom changes img size
            ab1 = AnnotationBbox(
                imagebox1, 
                (index, win_counts_df.loc[index, 'win_count']), 
                frameon=False, 
                xybox=(-offset, 10), 
                xycoords='data', 
                boxcoords="offset points", 
                pad=0.5
            )
            ax.add_artist(ab1)

            imagebox2 = OffsetImage(img2, zoom=1) # Zoom changes img size
            ab2 = AnnotationBbox(
                imagebox2, 
                (index, win_counts_df.loc[index, 'win_count']), 
                frameon=False, 
                xybox=(offset, 10), 
                xycoords='data', 
                boxcoords="offset points", 
                pad=0.5
            )
            ax.add_artist(ab2)

    plt.xlabel('Player', color='white')
    plt.ylabel('Number of Wins', color='white')
    plt.title('Total Number of Marbles Acquired by Each Player', color='white')
    plt.xticks(rotation=45, color='white')
    plt.yticks(color='white')

    # Add all players to legend
    handles = [plt.Line2D([0], [0], color=sns.color_palette('bright', len(win_counts_df))[i], lw=4) for i in range(len(win_counts_df))]
    labels = win_counts_df['player']

    legend = plt.legend(
        handles,
        labels,
        title='Players', 
        loc='upper left', 
        facecolor='#2B2B2B', 
        edgecolor='white', 
        labelcolor='white',
        prop={'size': 9}
    )
    legend.get_title().set_color('white')
    
    plt.grid(True, color='black', axis='y')
    return plt.gcf()

# Pie chart win ratio
def plot_win_ratio():
    results_df = fetch_data('results')
    players_df = fetch_data('players')

    # Account for no wins
    if results_df.empty:
        return None

    win_counts = results_df['winner'].value_counts()
    win_counts_df = pd.DataFrame(win_counts).reset_index()
    win_counts_df.columns = ['player', 'win_count']

    # Create pie chart
    plt.figure(figsize=(8, 8), facecolor='#2B2B2B')
    wedges, names, percents = plt.pie(
        win_counts_df['win_count'], 
        labels=win_counts_df['player'], 
        autopct='%1.1f%%', 
        colors=sns.color_palette('bright', len(win_counts_df)),
        startangle=90
    )

    # Set text properties
    for text in names:
        text.set_fontweight('bold')
        text.set_horizontalalignment('center')
        text.set_color('white')

    for text in percents:
        text.set_fontweight('bold')
        text.set_horizontalalignment('center')
        text.set_color('white')

    # Add all players to legend
    all_players = players_df['name']
    for player in all_players:
        if player not in win_counts_df['player'].values:
            plt.bar(0, 0, color='white', label=player)

    plt.title('Win Ratio Between Players', color='white')
    legend = plt.legend(
        title='Players', 
        loc='upper left', 
        facecolor='#2B2B2B', 
        edgecolor='white', 
        labelcolor='white'
    )
    legend.get_title().set_color('white')

    return plt.gcf()

# Line graph wins over time
def plot_dif_over_time():
    results_df = fetch_data('results')
    player_scores_df = fetch_data('player_scores')

    # Account for no wins
    if results_df.empty or player_scores_df.empty:
        return None
    
    # Merge results and player dif scores
    player_scores_df = fetch_data('player_scores')
    results_df = fetch_data('results')

    # Merge on result_id to get the date for each dif_score
    merged_df = pd.merge(player_scores_df, results_df, left_on='result_id', right_on='id')

    # Date -> datetime
    merged_df['date'] = pd.to_datetime(merged_df['date'])

    # Plotting
    plt.figure(figsize=(12, 6), facecolor='#2B2B2B')

    plt.gca().set_facecolor('white')

    sns.set_theme(style="whitegrid")
    ax = sns.lineplot(
        data=merged_df, 
        x='date', 
        y='dif_score', 
        hue='name', 
        palette='bright'
    )

    for player in merged_df['name'].unique():

        # If player has no wins, skip
        if player not in results_df['winner'].values:
            continue

        player_data = merged_df[merged_df['name'] == player]
        last_date = player_data['date'].max()
        last_point = player_data[player_data['date'] == last_date]

        # Get the last x and y coordinates
        x = last_point['date'].values[0]
        y = last_point['dif_score'].values[0] + 0.5

        # Retrieve the top character images for this player
        _, top_char_images = get_top_characters(player, results_df, 2)

        # Center the image on the last point of the line
        img = plt.imread(top_char_images[0])
        imagebox = OffsetImage(img, zoom=1) # Zoom changes img size
        ab = AnnotationBbox(imagebox, (x, y), 
                            frameon=False, xycoords='data', pad=0.5)
        ax.add_artist(ab)

    # Set x-axis limits
    plt.xlim([merged_df['date'].min(), merged_df['date'].max()])

    # Set y-axis limits (-5 to 5 minimum)
    plt.ylim([merged_df['dif_score'].min() - 5, merged_df['dif_score'].max() + 5])

    plt.xlabel('Date', color='white')
    plt.ylabel('Score', color='white')
    plt.title('Player Differential Score Over Time', color='white')
    plt.grid(True, color='black')
    legend = plt.legend(
        title='Players', 
        loc='upper left', 
        facecolor='#2B2B2B', 
        edgecolor='black', 
        framealpha=1, 
        labelcolor='white'
    )
    legend.get_title().set_color('white')
    plt.tick_params(colors='white')
    
    return plt.gcf()

# Bar Graph for Top Characters
def plot_top_chars(player):
    results_df = fetch_data('results')
    
    # Account for no wins for player
    if player not in results_df['winner'].values or results_df.empty:
        return None
    
    # Get top 3 characters for player
    top_chars, top_chars_imgs = get_top_characters(player, results_df, 3)

    # Create bar plot
    plt.figure(figsize=(10, 6), facecolor='#2B2B2B')
    ax = sns.barplot(
        data=top_chars,
        x='character', 
        y='win_count', 
        hue='character', 
        palette='bright'
    )

    # Add images to the bars
    for index, row in top_chars.iterrows():
        win_count = row['win_count']
        img = plt.imread(top_chars_imgs[index])
        imagebox = OffsetImage(img, zoom=1)
        ab = AnnotationBbox(
            imagebox, 
            (index, win_count), 
            frameon=False, 
            xybox=(0, 10), 
            xycoords='data', 
            boxcoords="offset points", 
            pad=0.5
        )
        ax.add_artist(ab)

    plt.xlabel('Top Characters', color='white')
    plt.ylabel('Number of Wins', color='white')
    plt.title(f'Top Characters for {player}', color='white')
    plt.xticks(color='white')
    plt.yticks(color='white')
    
    plt.grid(True, color='black', axis='y')
    return plt.gcf()