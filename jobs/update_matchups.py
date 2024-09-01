import requests
from datetime import datetime, timedelta
import os
import common

PAST_CUTOFF = int(os.getenv('PAST_CUTOFF', 2))
FUTURE_CUTOFF = int(os.getenv('FUTURE_CUTOFF', 90))
NBA_SCHEDULE_URL = os.getenv('NBA_SCHEDULE_URL', 'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json')

def update_matchups():
    matchups_json = requests.get(NBA_SCHEDULE_URL).json()
    matchups = parse_matchups(matchups_json)
    results = []
    for matchup in matchups:
        results.append(common.pb_upsert_record('matchups', matchup['id'], matchup))
        print('.', end='', flush=True)
    
    created = list(filter(lambda x: x.get('action') == 'CREATED', results))
    updated = list(filter(lambda x: x.get('action') == 'UPDATED', results))
    failed = list(filter(lambda x: x.get('action') == 'FAILED', results))
    print(f'MATCHUPS\n\tCREATED: {len(created)} records\n\tUPDATED: {len(updated)} records\n\tFAILED: {len(failed)} records')

def parse_matchups(raw_data):
    pastCutoff = datetime.now() - timedelta(days=PAST_CUTOFF)
    futureCutoff = datetime.now() + timedelta(days=FUTURE_CUTOFF)
    
    gameDates = raw_data['leagueSchedule']['gameDates']
    filtered_gameDates = filter(lambda x: common.parse_date(x['gameDate']) > pastCutoff and common.parse_date(x['gameDate']) < futureCutoff, gameDates)
    
    all_games = []
    for gameDate in filtered_gameDates:
        games = gameDate['games']
        all_games.extend(games)
        
    parsed_games = []
    for game in all_games:
        parsed_games.append({
            'id': common.id_from_code(game['gameCode']),
            'code': game['gameCode'],
            'time_utc': game['gameDateTimeUTC'],
            'away_code': game['awayTeam']['teamTricode'],
            'home_code': game['homeTeam']['teamTricode'],
        })
        
    return parsed_games
  
def get_job():
    return {
        'name': 'update_matchups',
        'description': 'Updates the matchups for the next 90 days.',
        'function': update_matchups
    }
  
if __name__ == '__main__':
    update_matchups()