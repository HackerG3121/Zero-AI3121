# generate_icons.py
import os
from PIL import Image, ImageDraw, ImageFont

def generate_logo(size):
    # Create an image with an alpha channel
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer circle gradient simulation
    center = size / 2
    r_outer = size * 0.45
    
    # We will draw a gradient by drawing concentric circles
    steps = 40
    for i in range(steps):
        factor = i / steps
        # Indigo to Cyan gradient color
        r = int(15 + factor * 20)
        g = int(32 + factor * 120)
        b = int(67 + factor * 180)
        # alpha fades out a bit at edge
        a = int(255 - (factor * 30))
        
        curr_r = r_outer * (1 - factor * 0.15)
        draw.ellipse(
            [center - curr_r, center - curr_r, center + curr_r, center + curr_r],
            fill=(r, g, b, a)
        )
        
    # Draw an inner glow border
    draw.ellipse(
        [center - r_outer * 0.85, center - r_outer * 0.85, center + r_outer * 0.85, center + r_outer * 0.85],
        outline=(255, 255, 255, 40),
        width=int(max(1, size * 0.02))
    )
    
    # Draw a stylized letter "Z"
    # Points for a sleek angular "Z"
    # Relative coordinates:
    # Top bar: (0.35, 0.3) -> (0.65, 0.3)
    # Diagonal: (0.65, 0.3) -> (0.35, 0.7)
    # Bottom bar: (0.35, 0.7) -> (0.65, 0.7)
    w = size
    points = [
        (w * 0.32, w * 0.32), # Top-Left
        (w * 0.68, w * 0.32), # Top-Right
        (w * 0.68, w * 0.42), # Top-Right Inner
        (w * 0.48, w * 0.68), # Mid-Diagonal
        (w * 0.68, w * 0.68), # Bottom-Right
        (w * 0.68, w * 0.78), # Bottom-Right End
        (w * 0.32, w * 0.78), # Bottom-Left
        (w * 0.32, w * 0.68), # Bottom-Left Inner
        (w * 0.52, w * 0.42), # Mid-Diagonal 2
        (w * 0.32, w * 0.42), # Top-Left Inner 2
    ]
    
    # Draw the stylized polygon
    draw.polygon(points, fill=(255, 255, 255, 255))
    
    # Add a glowing dot to represent "AI" at bottom-right
    dot_r = size * 0.05
    dot_center = (w * 0.72, w * 0.72)
    # outer glow of dot
    draw.ellipse(
        [dot_center[0] - dot_r*1.5, dot_center[1] - dot_r*1.5, dot_center[0] + dot_r*1.5, dot_center[1] + dot_r*1.5],
        fill=(0, 255, 240, 100)
    )
    # inner dot
    draw.ellipse(
        [dot_center[0] - dot_r, dot_center[1] - dot_r, dot_center[0] + dot_r, dot_center[1] + dot_r],
        fill=(255, 255, 255, 255)
    )
    
    return img

def main():
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    out_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Generating icons in: {out_dir}")
    
    for size in sizes:
        filename = f"icon-{size}.png"
        filepath = os.path.join(out_dir, filename)
        img = generate_logo(size)
        img.save(filepath, "PNG")
        print(f"Saved {filepath}")
        
    # Generate favicon (32x32)
    favicon_img = generate_logo(32)
    favicon_path = os.path.join(out_dir, "favicon.ico")
    # Convert RGBA to RGB for standard .ico or just save as ico
    favicon_img.save(favicon_path, format="ICO", sizes=[(32, 32)])
    print(f"Saved {favicon_path}")

if __name__ == "__main__":
    main()
