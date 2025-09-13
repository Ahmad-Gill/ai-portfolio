import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def draw_face(draw, x, y, size):
    # Draw the face
    face_color = (
        random.randint(100, 255),
        random.randint(100, 255),
        random.randint(100, 255),
        random.randint(100, 200)
    )
    draw.ellipse([x, y, x+size, y+size], fill=face_color)

    # Eyes
    eye_size = size // 5
    eye_y = y + size // 3
    eye_color = (0, 0, 0, random.randint(100, 200))
    draw.ellipse([x + size // 4 - eye_size // 2, eye_y,
                  x + size // 4 + eye_size // 2, eye_y + eye_size], fill=eye_color)
    draw.ellipse([x + 3 * size // 4 - eye_size // 2, eye_y,
                  x + 3 * size // 4 + eye_size // 2, eye_y + eye_size], fill=eye_color)

    # Pupils
    pupil_size = eye_size // 2
    draw.ellipse([x + size // 4 - pupil_size // 2, eye_y + pupil_size // 2,
                  x + size // 4 + pupil_size // 2, eye_y + 1.5 * pupil_size],
                 fill=(255, 255, 255, random.randint(150, 200)))
    draw.ellipse([x + 3 * size // 4 - pupil_size // 2, eye_y + pupil_size // 2,
                  x + 3 * size // 4 + pupil_size // 2, eye_y + 1.5 * pupil_size],
                 fill=(255, 255, 255, random.randint(150, 200)))

    # Mouth
    mouth_y = y + 2 * size // 3
    mouth_height = eye_size // 2
    mouth_color = (255, 0, 0, random.randint(100, 200))
    draw.ellipse([x + size // 3, mouth_y,
                  x + 2 * size // 3, mouth_y + mouth_height], fill=mouth_color)


def draw_paint_splatter(draw, width, height):
    num_splatters = random.randint(30, 40)
    for _ in range(num_splatters):
        splatter_color = (
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(100, 200)
        )
        x = random.randint(0, width)
        y = random.randint(0, height)
        radius = random.randint(20, 100)
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=splatter_color)


def draw_paint_drips(draw, width, height):
    num_drips = random.randint(50, 60)
    for _ in range(num_drips):
        drip_color = (
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(100, 200)
        )
        start_x = random.randint(0, width)
        start_y = random.randint(0, height)
        end_y = start_y + random.randint(20, 200)
        draw.line([start_x, start_y, start_x, end_y],
                  fill=drip_color, width=random.randint(1, 5))


def generate_abstract_painting_with_faces(width=1920, height=1080, background_color=(173, 216, 230, 255)):
    """Generate abstract painting with faces, splatters, and drips."""
    image = Image.new("RGBA", (width, height), background_color)
    draw = ImageDraw.Draw(image, "RGBA")

    # Paint splatters
    draw_paint_splatter(draw, width, height)

    # Faces
    num_faces = random.randint(20, 40)
    for _ in range(num_faces):
        size = random.randint(50, 200)
        x = random.randint(0, width - size)
        y = random.randint(0, height - size)
        draw_face(draw, x, y, size)

    # Paint drips
    draw_paint_drips(draw, width, height)

    # Artistic blur
    return image.filter(ImageFilter.GaussianBlur(radius=2))
