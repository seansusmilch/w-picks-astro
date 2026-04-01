import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import nbaSchedule from '../fixtures/nba-schedule.json'
import nbaScoreboard from '../fixtures/nba-scoreboard.json'

const handlers = [
  http.get('https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json', () => {
    return HttpResponse.json(nbaSchedule)
  }),
  http.get('https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json', () => {
    return HttpResponse.json(nbaScoreboard)
  }),
]

export const server = setupServer(...handlers)
