import urllib.request
import urllib.parse
import json

TOKEN = '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'
REPO = 'ejnburrows-rgb/cartilla-de-gretel'
HEADERS = {
    'Authorization': f'token {TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'python'
}

def check_pr():
    url = f'https://api.github.com/repos/{REPO}/pulls/139'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        pr = json.loads(response.read().decode())
        print(f'PR #{pr["number"]}: {pr["title"]}')
        print('Mergeable:', pr['mergeable'])
        print('Mergeable State:', pr['mergeable_state'])
        
    url_commits = f'https://api.github.com/repos/{REPO}/pulls/139/commits'
    req_commits = urllib.request.Request(url_commits, headers=HEADERS)
    with urllib.request.urlopen(req_commits) as response:
        commits = json.loads(response.read().decode())
        last_commit_sha = commits[-1]['sha']
        
    url_status = f'https://api.github.com/repos/{REPO}/commits/{last_commit_sha}/check-runs'
    req_status = urllib.request.Request(url_status, headers=HEADERS)
    try:
        with urllib.request.urlopen(req_status) as response:
            checks = json.loads(response.read().decode())
            print('CI Checks:')
            for check in checks.get('check_runs', []):
                print(f"  {check['name']}: {check['status']} - {check['conclusion']}")
    except Exception as e:
        print('Error getting checks:', e)
        
    url_comments = f'https://api.github.com/repos/{REPO}/issues/139/comments'
    req_comments = urllib.request.Request(url_comments, headers=HEADERS)
    with urllib.request.urlopen(req_comments) as response:
        comments = json.loads(response.read().decode())
        print('Comments:')
        for c in comments:
            print(f"  {c['user']['login']}: {c['body'][:50]}...")

check_pr()
