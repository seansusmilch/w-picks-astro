import common
from datetime import datetime, timedelta
import time

PAST = 'past'
LIVE = 'live'
UPCOMING = 'upcoming'

def update_picks():
    start = time.time()
    
    picks_pg = common.pb_get_records('picks', {'expand': 'matchup', 'perPage': 10})
    while picks_pg['page'] <= picks_pg['totalPages']:
        process_picks(picks_pg)
        picks_pg = common.pb_get_records('picks', {'expand': 'matchup', 'perPage': 10, 'page': picks_pg['page'] + 1})
        
    print('update_picks finished in', round(time.time() - start, 2), 'seconds')
    
def process_picks(picks:list):
    
    for pick in picks['items']:
        pick_clone = pick.copy()
        # if matchup is over 12 hrs ago, update the record
        if common.parse_record_date(pick['expand']['matchup']['time_utc']) < datetime.now() - timedelta(hours=6):
            pick['status'] = PAST
        
        # if matchup is over 12 hrs in the future, update the record
        if common.parse_record_date(pick['expand']['matchup']['time_utc']) > datetime.now() + timedelta(hours=12):
            pick['status'] = UPCOMING
                
        scoreboard = common.pb_get_record('scoreboards', pick['matchup'])
        if scoreboard.get('code') == 404:
            continue
        
        if scoreboard.get('status') == 2:
            pick['status'] = LIVE
            
        if scoreboard.get('status') == 3:
            pick['status'] = PAST
            
        
        if pick['status'] == PAST:
            winner = get_winner(pick['expand']['matchup'], scoreboard)
            if pick['win_prediction'] == winner:
                pick['result'] = 'W'
            else:
                pick['result'] = 'L'
                
        if pick != pick_clone:
            print('Updating pick', pick['id'], pick['status'])
            common.pb_update_record('picks', pick['id'], pick)
            
def get_winner(matchup, scoreboard):
    home = matchup['home_code']
    away = matchup['away_code']
    winner = home if scoreboard['home_score'] > scoreboard['away_score'] else away
    
    return winner
            
def get_job():
    return {
        'name': 'update_picks',
        'description': 'Updates all picks to reflect their current status.',
        'function': update_picks
    }

    
if __name__ == '__main__':
    update_picks()