import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './test-server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
