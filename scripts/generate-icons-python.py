from cairosvg import svg2png
from PIL import Image
import os
import subprocess
import sys

def create_directories(base_dir):
    """Create all necessary directories"""
    directories = [
        base_dir,
        os.path.join(base_dir, "macos"),
        os.path.join(base_dir, "devbuddy.iconset"),
        os.path.join(base_dir, "linux"),
        os.path.join(base_dir, "windows")
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Directory created/verified: {directory}")

def convert_svg_to_png(svg_path, png_path, size=1024):
    """Convert SVG to PNG with high quality"""
    try:
        with open(svg_path, "rb") as svg_file:
            svg2png(file_obj=svg_file, write_to=png_path, output_width=size, output_height=size)
        print(f"✓ SVG converted to PNG: {png_path}")
        return True
    except Exception as e:
        print(f"✗ Error converting SVG: {e}")
        return False

def generate_png_icons(base_image, base_dir):
    """Generate all necessary PNG icons"""
    
    # Generic PNGs for Electron
    generic_icons = {
        "icon.png": 512,
        "icon@1x.png": 128,
        "icon@2x.png": 256,
        "icon@3x.png": 384,
        "icon@4x.png": 512,
    }
    
    for filename, size in generic_icons.items():
        path = os.path.join(base_dir, filename)
        base_image.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")
        print(f"✓ Generic icon generated: {filename} ({size}x{size})")

def generate_macos_icons(base_image, base_dir):
    """Generate icons for macOS"""
    macos_dir = os.path.join(base_dir, "macos")
    iconset_dir = os.path.join(base_dir, "devbuddy.iconset")
    
    # Icons for macOS (with @2x for retina)
    macos_files = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }
    
    for filename, size in macos_files.items():
        # Save to macOS directory
        path = os.path.join(macos_dir, filename)
        base_image.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")
        
        # Copy to iconset
        iconset_path = os.path.join(iconset_dir, filename)
        base_image.resize((size, size), Image.Resampling.LANCZOS).save(iconset_path, "PNG")
        
        print(f"✓ macOS icon generated: {filename} ({size}x{size})")

def generate_linux_icons(base_image, base_dir):
    """Generate icons for Linux"""
    linux_dir = os.path.join(base_dir, "linux")
    
    # Standard sizes for Linux
    linux_sizes = [16, 32, 48, 64, 128, 256, 512]
    
    for size in linux_sizes:
        filename = f"icon_{size}x{size}.png"
        path = os.path.join(linux_dir, filename)
        base_image.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")
        print(f"✓ Linux icon generated: {filename} ({size}x{size})")

def generate_windows_icons(base_image, base_dir):
    """Generate icons for Windows"""
    windows_dir = os.path.join(base_dir, "windows")
    
    # Sizes for Windows
    windows_sizes = [16, 32, 48, 64, 128, 256]
    
    for size in windows_sizes:
        filename = f"icon_{size}x{size}.png"
        path = os.path.join(windows_dir, filename)
        base_image.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")
        print(f"✓ Windows icon generated: {filename} ({size}x{size})")

def generate_ico_file(base_image, base_dir):
    """Generate .ico file for Windows"""
    ico_path = os.path.join(base_dir, "devbuddy.ico")
    
    # Sizes for ICO
    ico_sizes = [16, 32, 48, 64, 128, 256]
    
    try:
        base_image.save(ico_path, format="ICO", sizes=[(size, size) for size in ico_sizes])
        print(f"✓ ICO file generated: devbuddy.ico")
        return True
    except Exception as e:
        print(f"✗ Error generating ICO: {e}")
        return False

def generate_icns_file(base_dir):
    """Generate .icns file for macOS using iconutil"""
    iconset_dir = os.path.join(base_dir, "devbuddy.iconset")
    icns_path = os.path.join(base_dir, "devbuddy.icns")
    
    try:
        # Use iconutil to generate .icns (macOS only)
        if sys.platform == "darwin":
            result = subprocess.run([
                "iconutil", "-c", "icns", iconset_dir, "-o", icns_path
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✓ ICNS file generated: devbuddy.icns")
                return True
            else:
                print(f"⚠ Warning: Could not generate ICNS automatically: {result.stderr}")
        else:
            print("⚠ Warning: ICNS can only be generated on macOS")
        
        # Generate placeholder for other systems
        placeholder_path = os.path.join(base_dir, "devbuddy_1024x1024_for_icns.png")
        base_image = Image.open(os.path.join(base_dir, "icon.png"))
        base_image.resize((1024, 1024), Image.Resampling.LANCZOS).save(placeholder_path, "PNG")
        print(f"✓ ICNS placeholder generated: devbuddy_1024x1024_for_icns.png")
        
        return False
    except Exception as e:
        print(f"✗ Error generating ICNS: {e}")
        return False

def list_generated_files(base_dir):
    """List all generated files"""
    print("\n📁 Generated files:")
    print("=" * 50)
    
    all_files = []
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.endswith(('.png', '.ico', '.icns')):
                rel_path = os.path.relpath(os.path.join(root, f), base_dir)
                all_files.append(rel_path)
    
    # Organize by category
    categories = {
        "Generic icons": [f for f in all_files if not any(x in f for x in ['macos', 'linux', 'windows', 'devbuddy.iconset'])],
        "macOS": [f for f in all_files if 'macos' in f or 'devbuddy.iconset' in f or f.endswith('.icns')],
        "Linux": [f for f in all_files if 'linux' in f],
        "Windows": [f for f in all_files if 'windows' in f or f.endswith('.ico')]
    }
    
    for category, files in categories.items():
        if files:
            print(f"\n{category}:")
            for file in sorted(files):
                print(f"  • {file}")
    
    print(f"\nTotal: {len(all_files)} files generated")

def main():
    """Main function"""
    print("🎨 Electron Icon Generator")
    print("=" * 40)
    
    # Configuration
    svg_input_path = "./src/assets/icon.svg"
    png_output_path = "./src/assets/icon.png"
    base_dir = "./src/assets"
    
    # Check if SVG exists
    if not os.path.exists(svg_input_path):
        print(f"✗ Error: SVG file not found: {svg_input_path}")
        return False
    
    # Create directories
    create_directories(base_dir)
    
    # Convert SVG to base PNG
    if not convert_svg_to_png(svg_input_path, png_output_path):
        return False
    
    # Open base image
    try:
        base_image = Image.open(png_output_path).convert("RGBA")
    except Exception as e:
        print(f"✗ Error opening base image: {e}")
        return False
    
    print("\n🔄 Generating icons...")
    print("-" * 30)
    
    # Generate all types of icons
    generate_png_icons(base_image, base_dir)
    generate_macos_icons(base_image, base_dir)
    generate_linux_icons(base_image, base_dir)
    generate_windows_icons(base_image, base_dir)
    generate_ico_file(base_image, base_dir)
    generate_icns_file(base_dir)
    
    # List generated files
    list_generated_files(base_dir)
    
    print("\n✅ Icon generation completed!")
    print("\n📋 Next steps:")
    print("1. For macOS: Use the generated .icns file")
    print("2. For Windows: Use the generated .ico file")
    print("3. For Linux: Use the PNGs in the linux/ folder")
    print("4. For Electron: Configure in package.json:")
    print("   - 'icon': './src/assets/icon.png'")
    print("   - 'icon': './src/assets/devbuddy.ico' (Windows)")
    print("   - 'icon': './src/assets/devbuddy.icns' (macOS)")
    
    return True

if __name__ == "__main__":
    main()