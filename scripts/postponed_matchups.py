from typing import TypedDict, List
from datetime import datetime, timezone
import requests


class NBATeam(TypedDict):
    teamId: int
    teamName: str
    teamCity: str
    teamTricode: str
    teamSlug: str


class NBAGame(TypedDict):
    gameId: str
    gameCode: str
    gameDateTimeUTC: str
    awayTeam: NBATeam
    homeTeam: NBATeam


class MatchupRecord(TypedDict):
    id: str
    created: str
    updated: str
    code: str
    time_utc: str
    home_code: str
    away_code: str
    scoreboard: str


NBA_MATCHUPS_URL = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json"


def get_nba_data() -> dict:
    """Get raw NBA schedule data from the API."""
    response = requests.get(NBA_MATCHUPS_URL)
    return response.json()


def get_future_games() -> List[NBAGame]:
    """Get only future games from the NBA schedule."""
    data = get_nba_data()
    all_games = []

    # Extract all games from the schedule
    for game_date in data["leagueSchedule"]["gameDates"]:
        all_games.extend(game_date["games"])

    # Filter for future games only
    current_time = datetime.now(timezone.utc)
    future_games = []

    for game in all_games:
        game_time = datetime.fromisoformat(
            game["gameDateTimeUTC"].replace("Z", "+00:00")
        )
        if game_time > current_time:
            future_games.append(game)

    return future_games


def find_matchups_to_delete(
    existing_matchups: List[MatchupRecord],
) -> List[MatchupRecord]:
    """
    Compare existing matchup records with the NBA API data to find records that
    need to be deleted because they don't exist in the API anymore.

    Args:
        existing_matchups: List of your existing matchup records

    Returns:
        List of matchup records that should be deleted
    """
    # Get future games from NBA API
    future_games = get_future_games()

    # Extract game codes from future NBA games
    nba_game_codes = {game["gameCode"] for game in future_games}

    # Find matchups that don't exist in the NBA API data
    to_delete = []
    for matchup in existing_matchups:
        # Check if the matchup code exists in NBA API data
        if matchup["code"] not in nba_game_codes:
            to_delete.append(matchup)

    return to_delete


def load_sample_matchups() -> List[MatchupRecord]:
    """
    Create a sample dataset of matchup records for testing.
    In a real scenario, you would load this from your database.
    """
    # First, get some real games from the NBA API to use as valid matchups
    future_games = get_future_games()[:5]  # Get 5 real games

    # Convert them to your matchup format
    real_matchups = []
    for i, game in enumerate(future_games):
        real_matchups.append(
            {
                "id": f"sample_id_{i+1}",
                "created": "2023-01-01T00:00:00Z",
                "updated": "2023-01-01T00:00:00Z",
                "code": game["gameCode"],
                "time_utc": game["gameDateTimeUTC"],
                "home_code": game["homeTeam"]["teamTricode"],
                "away_code": game["awayTeam"]["teamTricode"],
                "scoreboard": "",
            }
        )

    # Add some fake matchups that don't exist in the NBA API
    fake_matchups = [
        {
            "id": "fake_id_1",
            "created": "2023-01-01T00:00:00Z",
            "updated": "2023-01-01T00:00:00Z",
            "code": "20241299/FAKEXX",  # Fake game code
            "time_utc": "2024-12-31T00:00:00Z",
            "home_code": "XXX",
            "away_code": "YYY",
            "scoreboard": "",
        },
        {
            "id": "fake_id_2",
            "created": "2023-01-01T00:00:00Z",
            "updated": "2023-01-01T00:00:00Z",
            "code": "20241225/DELETED",  # Another fake game code
            "time_utc": "2024-12-25T00:00:00Z",
            "home_code": "DDD",
            "away_code": "EEE",
            "scoreboard": "",
        },
    ]

    # Combine real and fake matchups
    return real_matchups + fake_matchups


def main() -> None:
    """Find matchups to delete by comparing existing records with NBA API data."""
    # Load sample matchups (replace with your actual database loading code)
    existing_matchups = load_sample_matchups()
    print(f"Loaded {len(existing_matchups)} matchups")

    # Find matchups to delete
    to_delete = find_matchups_to_delete(existing_matchups)
    print(f"\nFound {len(to_delete)} matchups to delete:")

    if to_delete:
        for i, matchup in enumerate(to_delete, 1):
            print(f"\nMatchup {i} to delete:")
            print(f"ID: {matchup['id']}")
            print(f"Code: {matchup['code']}")
            print(f"Teams: {matchup['away_code']} @ {matchup['home_code']}")
            print(f"Time: {matchup['time_utc']}")
    else:
        print("No matchups need to be deleted.")


if __name__ == "__main__":
    main()
