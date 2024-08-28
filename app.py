from flask import Flask, request, jsonify, render_template, Response
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import sqlite3
import io
from datetime import datetime

# Import functions from marbles.py
from marbles import fetch_data, insert_player, insert_result, current_streak, plot_totals, plot_win_ratio, plot_dif_over_time, plot_top_chars

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to fetch player names
@app.route('/get_players', methods=['GET'])
def get_players():
    df = fetch_data('players')
    players = df.to_dict(orient='records')
    return jsonify(players)

# Endpoint to add a new player
@app.route('/add_player', methods=['POST'])
def add_player():
    data = request.json
    name = data.get('name')
    if name:
        result = insert_player(name)
        if result == 'success':
            return '', 204
        elif result == 'exists': # Return 409 status code if player already exists
            return {'error': 'Player already exists'}, 409
        return 'Invalid input', 400

# Endpoint to insert results
@app.route('/insert_result', methods=['POST'])
def insert_result_route():
    data = request.json
    winner = data.get('winner')
    character = data.get('character')

    if not winner or not character:
        return jsonify({'error': 'Missing winner or character'}), 400

    try:
        insert_result(winner, character)
        return jsonify({'success': True, 'message': f'Result added: {winner} won using {character}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to generate and serve graphs
@app.route('/plot/<plot_type>')
def plot(plot_type):
    # Call the corresponding plotting function
    if plot_type == 'total-wins':
        fig = plot_totals()
    elif plot_type == 'win-ratio':
        fig = plot_win_ratio()
    elif plot_type == 'wins-over-time':
        fig = plot_dif_over_time()
    elif plot_type == 'top-characters':
        # Get the player name from the query string
        player_name = request.args.get('player_name')

        # Check if there are reults
        results_df = fetch_data('results')
        if results_df.empty:
            return 'No results available for top-characters plot', 400
        
        # If no player name, plot for first player in results
        if player_name is None:
            player_name = results_df['winner'].iloc[0]
            
        fig = plot_top_chars(player_name)
    else:
        return "Invalid plot type", 400
    
    if fig is None:
        return '', 204  # Return No Content if no data is available
    
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)

    # Return fig and player_name for top-characters plot
    if plot_type == 'top-characters':
        return Response(output.getvalue(), mimetype='image/png', headers={'player_name': player_name})
    else:
        return Response(output.getvalue(), mimetype='image/png')

# Endpoint to fetch results for logs
@app.route('/get_results_logs', methods=['GET'])
def get_results_logs():
    results_df = fetch_data('results')

    if results_df.empty:
        return jsonify([])  # Return an empty list if there are no results

    results_logs = results_df.to_dict(orient='records')

    for result in results_logs:
        date = datetime.strptime(result['date'], '%Y-%m-%d %H:%M:%S')
        result['date'] = date.strftime('%d, %B, %Y')
    
    return jsonify(results_logs)

# Endpoint to fetch current streak
@app.route('/get_current_streak', methods=['GET'])
def get_current_streak():
    df = fetch_data('results')
    winner, streak, start_date, duration = current_streak(df)

    if streak is None:
        return jsonify({'message': 'No data available'})

    start_date = datetime.strptime(start_date, '%Y-%m-%d %H:%M:%S').strftime('%d, %B, %Y')

    return jsonify({'winner': winner,'streak': streak, 'start date': start_date, 'duration': duration})

# Endpoint to reset the database
@app.route('/reset_db', methods=['POST'])
def reset_db():
    try:
        # Connect to the database
        conn = sqlite3.connect('melee_results.db')
        cursor = conn.cursor()
        
        # SQL command to delete all data from all tables
        cursor.execute('DELETE FROM results')
        cursor.execute('DELETE FROM players')
        cursor.execute('DELETE FROM player_scores')

        conn.commit()
        
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f'Error resetting database: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
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
    app.run(debug=True)