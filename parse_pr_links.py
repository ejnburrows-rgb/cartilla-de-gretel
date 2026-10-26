import json
import re

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        title = pr['title']
        body = pr['body']
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)
        print(f"PR {pr['number']}: {title}")
        for url in urls:
            if url.endswith(".png") or url.endswith(".jpg") or url.endswith(".mp4") or "raw=true" in url:
                print(f"  Media URL: {url}")
