#!/usr/bin/env python3
"""
Text to HTML Converter
Converts a text file to HTML where each new line becomes a paragraph
"""

import sys
import os

def txt_to_html(input_file, output_file=None):
    """
    Convert a text file to HTML format
    
    Args:
        input_file (str): Path to input text file
        output_file (str): Path to output HTML file (optional)
    
    Returns:
        str: Path to the created HTML file
    """
    
    # Set default output filename if not provided
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.html"
    
    try:
        # Read the input text file
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Start building the HTML content
        html_content = ['<!DOCTYPE html>']
        html_content.append('<html lang="en">')
        html_content.append('<head>')
        html_content.append('<meta charset="UTF-8">')
        html_content.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
        html_content.append(f'<title>{output_file}</title>')
        html_content.append('<link href="https://cdn.jsdelivr.net/gh/vsalvino/computer-modern@main/fonts/serif.css" rel="stylesheet">')
        html_content.append('<link href = "style.css" rel="stylesheet">')
        html_content.append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP" crossorigin="anonymous">')
        html_content.append('<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js" integrity="sha384-cMkvdD8LoxVzGF/RPUKAcvmm49FQ0oxwDF3BGKtDXcEc+T1b2N+teh/OJfpU0jr6" crossorigin="anonymous"></script>')
        html_content.append("""<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js" integrity="sha384-hCXGrW6PitJEwbkoStFjeJxv+fSOOQKOPbJxSfM6G5sWZjAyWhXiTIIAmQqnlLlh" crossorigin="anonymous"\n    onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true},{left: '$', right: '$', display: false},{left: '\\\\begin{equation}', right: '\\\\end{equation}', display: true}],});"></script>""")
        html_content.append('</head>')
        html_content.append('<body>')
        
        # Convert each line to a paragraph
        for line in lines:
            line = line.strip()
            if line:  # Only add non-empty lines as paragraphs
                # Escape HTML special characters
                line = (line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;'))
                html_content.append(f'<p>{line}</p>')
        
        html_content.append('</body>')
        html_content.append('</html>')
        
        # Write the HTML file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(html_content))
        
        print(f"Successfully converted '{input_file}' to '{output_file}'")
        return output_file
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

def main():
    """Main function to handle command line arguments"""
    
    if len(sys.argv) < 2:
        print("Usage: python txt_to_html.py <input_file> [output_file]")
        print("Example: python txt_to_html.py document.txt document.html")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Check if input file exists and has .txt extension
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)
    
    txt_to_html(input_file, output_file)

if __name__ == "__main__":
    #main()
    for path, folder, files in os.walk('.'):
        for filename in files:
            if filename[-4:] == '.txt':
                txt_to_html(path+'/'+filename, path+'/'+filename[:-3]+'html')