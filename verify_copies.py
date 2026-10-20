from PIL import Image

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
cow1 = img.crop((52, 126, 323, 396))
cow2 = img.crop((372, 126, 643, 396))

# Let's save them and I'll inspect
cow1.save('cow1_verify.jpg')
cow2.save('cow2_verify.jpg')
print("Saved")
