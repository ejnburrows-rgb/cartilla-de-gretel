from PIL import Image

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
cow1 = img.crop((50, 100, 320, 390))
cow1.save('public/cow1_test.jpg')
