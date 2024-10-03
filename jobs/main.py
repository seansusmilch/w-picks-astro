from fastapi import FastAPI

def lifespan(app : FastAPI):
    import update_matchups
    register_job(update_matchups.get_job())
    import update_scoreboards
    register_job(update_scoreboards.get_job())
    import update_picks
    register_job(update_picks.get_job())
    yield
    print('Shutting down...')

app = FastAPI(lifespan=lifespan)
registered_jobs = []

@app.get("/")
def available_jobs():
    return {'jobs': registered_jobs}


def register_job(job):
    """Registers a job to be available in the API.

    Args:
        job (dict): A dictionary containing the job information.
        job.name (str): The name of the job.
        job.description (str): A description of the job.
        job.function (function): The function to call when the job is run.
    """
    print(f'Registering job: {job["name"]}')
    registered_jobs.append({'name': job['name'], 'description': job['description']})
    app.add_api_route(f'/jobs/{job["name"]}', job['function'])
    