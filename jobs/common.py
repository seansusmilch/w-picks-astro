from datetime import datetime
import requests
import os
import cachetools.func

POCKETBASE_URL = os.getenv('POCKETBASE_URL')
ADMIN_USER = os.getenv('ADMIN_USER')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')


# 10/22/2024 00:00:00
def parse_date(date_str):
    return datetime.strptime(date_str, '%m/%d/%Y %H:%M:%S')

def id_from_code(code):
    return code.replace('/', '-')

@cachetools.func.ttl_cache(maxsize=1, ttl=10 * 60)
def auth_pb():
    print('Authenticating with PocketBase')
    response = requests.post(f'{POCKETBASE_URL}/api/admins/auth-with-password', {'identity': ADMIN_USER, 'password': ADMIN_PASSWORD})
    if response.status_code != 200:
        print(response.json())
        raise Exception('Failed to authenticate')
    
    return response.json()['token']

def pb_get_record(collection, record_id):
    token = auth_pb()
    response = requests.get(
        f'{POCKETBASE_URL}/api/collections/{collection}/records/{record_id}', 
        headers={'Authorization': f'Bearer {token}'}, 
        params={'filter': ''}
        )
    print(response.json())
    return response.json()

def pb_update_record(collection:str, record_id:str, data:dict):
    token = auth_pb()
    response = requests.patch(
        f'{POCKETBASE_URL}/api/collections/{collection}/records/{record_id}', 
        headers={'Authorization': f'Bearer {token}'}, 
        json=data
        )
    return response.json()

def pb_create_record(collection:str, data:dict):
    token = auth_pb()
    response = requests.post(
        f'{POCKETBASE_URL}/api/collections/{collection}/records', 
        headers={'Authorization': f'Bearer {token}'}, 
        json=data
        )
    return response.json()

def pb_upsert_record(collection:str, record_id:str, data:dict):
    update_response = pb_update_record(collection, record_id, data)
    if update_response.get('id'):
        print('UPDATE', update_response.get('id'))
        return
    if update_response['code'] in [400, 403]:
        print('Failed to update record', update_response.json())
        return
    
    # must be 404
    create_response = pb_create_record(collection, data)
    print('CREATE', create_response.get('id'))


if __name__ == '__main__':
    pass