import json

with open("prs.json") as f:
    prs = json.load(f)

for pr in prs:
    if pr["draft"]:
        print(f"PR {pr['number']}: {pr['title']} - {pr['head']['ref']}")
        # Look for image URLs
        body = pr["body"]
        images = []
        import re
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body)
        for url in urls:
            if url.endswith(".png") or url.endswith(".jpg") or url.endswith(".jpeg") or url.endswith(".mp4") or url.endswith(".webm") or "raw=true" in url:
                images.append(url)
        print(f"  Images: {images}")
