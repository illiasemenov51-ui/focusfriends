import datetime

start = datetime.datetime(2026, 6, 15, 10, 0)
end = datetime.datetime(2026, 7, 11, 20, 0)

total = 20
counter = 0

def callback(commit):
    global counter
    
    moment = start + (end - start) * counter / (total - 1)
    timestamp = int(moment.timestamp())

    commit.author_date = f"{timestamp} +0200"
    commit.committer_date = f"{timestamp} +0200"

    counter += 1

