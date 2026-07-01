#!/usr/bin/env python3
"""
SEO Page Generator for Twin Rivers LLC
Generates service+city, cost, and permit pages programmatically
"""

import os
import re

# Define cities
cities = [
    {"slug": "sacramento", "name": "Sacramento"},
    {"slug": "elk-grove", "name": "Elk Grove"},
    {"slug": "roseville", "name": "Roseville"},
    {"slug": "folsom", "name": "Folsom"},
    {"slug": "citrus-heights", "name": "Citrus Heights"},
    {"slug": "rocklin", "name": "Rocklin"},
    {"slug": "grass-valley", "name": "Grass Valley"},
    {"slug": "nevada-city", "name": "Nevada City"},
    {"slug": "auburn", "name": "Auburn"},
    {"slug": "lincoln", "name": "Lincoln"},
    {"slug": "penn-valley", "name": "Penn Valley"},
    {"slug": "lake-wildwood", "name": "Lake Wildwood"},
    {"slug": "rough-and-ready", "name": "Rough and Ready"},
    {"slug": "north-san-juan", "name": "North San Juan"},
    {"slug": "chicago-park", "name": "Chicago Park"},
    {"slug": "alta-sierra", "name": "Alta Sierra"}
]

# Define services
services = [
    {"slug": "wood-fence-installation", "name": "Wood Fence Installation"},
    {"slug": "chain-link-fence-installation", "name": "Chain Link Fence Installation"},
    {"slug": "vinyl-fence-installation", "name": "Vinyl Fence Installation"},
    {"slug": "privacy-fence-installation", "name": "Privacy Fence Installation"},
    {"slug": "fence-repair", "name": "Fence Repair"},
    {"slug": "gate-installation", "name": "Gate Installation"}
]

# Base directory
base_dir = "/var/www/twinrivers"

def read_template(template_name):
    """Read template file"""
    template_path = os.path.join(base_dir, "templates", template_name)
    with open(template_path, 'r') as f:
        return f.read()

def write_page(path, content):
    """Write page to disk"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created: {path}")

def generate_service_pages():
    """Generate service+city combination pages"""
    template = read_template("service-city-template.html")
    count = 0
    
    for service in services:
        for city in cities:
            # Replace template variables
            content = template.replace("{SERVICE_NAME}", service["name"])
            content = content.replace("{SERVICE_SLUG}", service["slug"])
            content = content.replace("{CITY_NAME}", city["name"])
            content = content.replace("{CITY_SLUG}", city["slug"])
            
            # Create directory and file
            page_path = os.path.join(base_dir, "services", f"{service['slug']}-{city['slug']}", "index.html")
            write_page(page_path, content)
            count += 1
    
    return count

def generate_cost_pages():
    """Generate cost pages for each city"""
    template = read_template("cost-template.html")
    count = 0
    
    for city in cities:
        content = template.replace("{CITY_NAME}", city["name"])
        content = content.replace("{CITY_SLUG}", city["slug"])
        
        page_path = os.path.join(base_dir, "cost", f"fence-installation-cost-{city['slug']}", "index.html")
        write_page(page_path, content)
        count += 1
    
    return count

def generate_permit_pages():
    """Generate permit pages for each city"""
    template = read_template("permit-template.html")
    count = 0
    
    for city in cities:
        content = template.replace("{CITY_NAME}", city["name"])
        content = content.replace("{CITY_SLUG}", city["slug"])
        
        page_path = os.path.join(base_dir, "permits", f"fence-permit-{city['slug']}", "index.html")
        write_page(page_path, content)
        count += 1
    
    return count

def generate_sitemap():
    """Generate sitemap.xml"""
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''
    
    # Add homepage
    sitemap_content += '''  <url>
    <loc>https://twinriversllc.org/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://twinriversfence.com/reviews/</loc>
    <priority>0.9</priority>
  </url>
'''
    
    # Add city pages
    for city in cities:
        sitemap_content += f'''  <url>
    <loc>https://twinriversllc.org/fencing/{city["slug"]}/</loc>
    <priority>0.9</priority>
  </url>
'''
    
    # Add service pages
    for service in services:
        for city in cities:
            sitemap_content += f'''  <url>
    <loc>https://twinriversllc.org/services/{service["slug"]}-{city["slug"]}/</loc>
    <priority>0.8</priority>
  </url>
'''
    
    # Add cost pages
    for city in cities:
        sitemap_content += f'''  <url>
    <loc>https://twinriversllc.org/cost/fence-installation-cost-{city["slug"]}/</loc>
    <priority>0.7</priority>
  </url>
'''
    
    # Add permit pages
    for city in cities:
        sitemap_content += f'''  <url>
    <loc>https://twinriversllc.org/permits/fence-permit-{city["slug"]}/</loc>
    <priority>0.7</priority>
  </url>
'''
    
    sitemap_content += '</urlset>'
    
    sitemap_path = os.path.join(base_dir, "sitemap.xml")
    with open(sitemap_path, 'w') as f:
        f.write(sitemap_content)
    
    print(f"\nGenerated sitemap: {sitemap_path}")

def main():
    """Main execution"""
    print("Twin Rivers LLC - SEO Page Generator")
    print("=" * 50)
    
    print("\nGenerating service pages...")
    service_count = generate_service_pages()
    print(f"✓ Created {service_count} service pages")
    
    print("\nGenerating cost pages...")
    cost_count = generate_cost_pages()
    print(f"✓ Created {cost_count} cost pages")
    
    print("\nGenerating permit pages...")
    permit_count = generate_permit_pages()
    print(f"✓ Created {permit_count} permit pages")
    
    print("\nGenerating sitemap...")
    generate_sitemap()
    
    total = service_count + cost_count + permit_count
    print("\n" + "=" * 50)
    print(f"TOTAL PAGES GENERATED: {total}")
    print("=" * 50)

if __name__ == "__main__":
    main()
