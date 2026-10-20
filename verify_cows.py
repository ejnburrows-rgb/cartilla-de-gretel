from PIL import Image
import numpy as np

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
cow1 = img.crop((52, 126, 323, 396))
cow1.save('cow1_test.jpg')

cow2 = img.crop((372, 126, 643, 396))
cow2.save('cow2_test.jpg')
