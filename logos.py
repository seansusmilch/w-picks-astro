import json
csv_data = """https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg,Boston Celtics
https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg,Brooklyn Nets
https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg,New York Knicks
https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg,Philadelphia 76ers
https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg,Toronto Raptors
https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg,Chicago Bulls
https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg,Cleveland Cavaliers
https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg,Detroit Pistons
https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg,Indiana Pacers
https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg,Milwaukee Bucks
https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg,Atlanta Hawks
https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg,Charlotte Hornets
https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg,Miami Heat
https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg,Orlando Magic
https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg,Washington Wizards
https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg,Denver Nuggets
https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg,Minnesota Timberwolves
https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg,Oklahoma City Thunder
https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg,Portland Trail Blazers
https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg,Utah Jazz
https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg,Golden State Warriors
https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg,LA Clippers
https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg,Los Angeles Lakers
https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg,Phoenix Suns
https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg,Sacramento Kings
https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg,Dallas Mavericks
https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg,Houston Rockets
https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg,Memphis Grizzlies
https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg,New Orleans Pelicans
https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg,San Antonio Spurs"""

team_lines = csv_data.split("\n")
team_split = map(lambda x: x.split(","), team_lines)
team_objs = list(map(lambda x: {"logo": x[0], "name_full": x[1]}, team_split))
tricodes = ['BOS', 'BKN', 'NYK', 'PHI', 'TOR', 'CHI', 'CLE', 'DET', 'IND', 'MIL', 'ATL', 'CHA', 'MIA', 'ORL', 'WAS', 'DEN', 'MIN', 'OKC', 'POR', 'UTA', 'GSW', 'LAC', 'LAL', 'PHX', 'SAC', 'DAL', 'HOU', 'MEM', 'NOP', 'SAS']
short_names = [
    'Celtics', 'Nets', 'Knicks', '76ers', 'Raptors', 'Bulls', 'Cavaliers', 'Pistons', 'Pacers', 'Bucks',
    'Hawks', 'Hornets', 'Heat', 'Magic', 'Wizards', 'Nuggets', 'Timberwolves', 'Thunder', 'Trail Blazers', 'Jazz',
    'Warriors', 'Clippers', 'Lakers', 'Suns', 'Kings', 'Mavericks', 'Rockets', 'Grizzlies', 'Pelicans', 'Spurs'
]
team_json = {}
while len(team_objs):
    team = team_objs.pop(0)
    team_json[tricodes.pop(0)] = {'name_short': short_names.pop(0), **team}
    
print(json.dumps(team_json, indent=4))