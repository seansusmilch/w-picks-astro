import common
import time

def update_users():
    start = time.time()
    
    users_pg = common.pb_get_records('users', {'perPage': 10})
    while users_pg['page'] <= users_pg['totalPages']:
        process_users(users_pg['items'])
        users_pg = common.pb_get_records('users', {'perPage': 10, 'page': users_pg['page'] + 1})
        
    print('update_users finished in', round(time.time() - start, 2), 'seconds')
    
    
def process_users(users:list):
    for user in users:
        user_id = user['id']
        update_stats(user_id)

def update_stats(user_id:str):
    
    past_picks = common.pb_get_records('picks', {'perPage': 1000, 'filter': f'user="{user_id}" && status="past"'})
    win_picks = list(filter(lambda p: p['result'] == 'W', past_picks['items']))
    lose_picks = list(filter(lambda p: p['result'] == 'L', past_picks['items']))
    total_picks = past_picks['totalItems']
    win_loss_ratio = len(win_picks) / len(lose_picks) if lose_picks else len(win_picks)
    win_pick_rate = 0
    if total_picks:
        win_pick_rate = int(len(win_picks) / total_picks * 100)
    
    latest_stats = {
        'total_picks': total_picks,
        'win_picks': len(win_picks),
        'lose_picks': len(lose_picks),
        'win_loss_ratio': win_loss_ratio,
        'win_pick_rate': win_pick_rate
    }
    
    stats_record = common.pb_get_first_item('stats', f'user="{user_id}"')
    if not stats_record:
        new_stats = common.pb_create_record('stats', {
            'user': user_id,
            **latest_stats
        })
        common.pb_update_record('users', user_id, {'stats': new_stats['id']})
        print('Created stats for user', user_id)
        return
    
    common.pb_update_record('stats', stats_record['id'], latest_stats)
    print('Updated stats for user', user_id)
    
            
def get_job():
    return {
        'name': 'update_users',
        'description': 'Updates all users to reflect their current stats.',
        'function': update_users
    }

    
if __name__ == '__main__':
    update_users()