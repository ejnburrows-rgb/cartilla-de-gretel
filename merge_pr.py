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

def merge_pr():
    url = f'https://api.github.com/repos/{REPO}/pulls/139/merge'
    data = json.dumps({
        'merge_method': 'squash'
    }).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=HEADERS, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print('Merged PR:', res['message'])
    except Exception as e:
        print('Error merging PR:', e)

merge_pr()
