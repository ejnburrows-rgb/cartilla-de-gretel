from PIL import Image

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
# Cows are in two rows.
# Top row approx y=110 to 380.
# Cow 1 (mu): x=60 to 310
# Cow 2 (mo): x=380 to 630
# Cow 3 (me): x=720 to 970
# Cow 4 (má): x=1050 to 1300

cow1 = img.crop((60, 110, 310, 380))
cow1.save('cow1.jpg')

cow2 = img.crop((380, 110, 630, 380))
cow2.save('cow2.jpg')

cow3 = img.crop((720, 110, 970, 380))
cow3.save('cow3.jpg')
