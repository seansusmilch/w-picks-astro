import os
import common
import requests

NBA_SCOREBOARDS_URL = os.getenv('NBA_SCOREBOARDS_URL', 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json')

def update_scoreboards():
    scoreboards_json = requests.get(NBA_SCOREBOARDS_URL).json()
    scoreboards = parse_scoreboards(scoreboards_json)
    results = []
    for scoreboard in scoreboards:
        results.append(common.pb_upsert_record('scoreboards', scoreboard['id'], scoreboard))
        print('.', end='', flush=True)
        
    created = list(filter(lambda x: x.get('action') == 'CREATED', results))
    updated = list(filter(lambda x: x.get('action') == 'UPDATED', results))
    failed = list(filter(lambda x: x.get('action') == 'FAILED', results))
    print(f'SCOREBOARDS\n\tCREATED: {len(created)} records\n\tUPDATED: {len(updated)} records\n\tFAILED: {len(failed)} records')
    
def parse_scoreboards(raw_data):
    todays_scoreboards = raw_data['scoreboard']['games']
    parsed_scoreboards = []
    for game in todays_scoreboards:
        parsed_scoreboards.append({
            'id': common.id_from_code(game['gameCode']),
            'code': game['gameCode'],
            'status': game['gameStatus'],
            'status_text': game['gameStatusText'],
            'away_score': game['awayTeam']['score'],
            'home_score': game['homeTeam']['score'],
        })
    return parsed_scoreboards

def get_job():
    return {
        'name': 'update_scoreboards',
        'description': 'Updates the scoreboards for today.',
        'function': update_scoreboards
    }

