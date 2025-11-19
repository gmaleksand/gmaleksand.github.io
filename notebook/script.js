const vaultFolder = 'vault/';
let fileMap = []; // Will hold list of files

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadManifest();
    setupEventListeners();
    
    // Handle initial load
    handleRouting();
});

// 1. Load file list
async function loadManifest() {
    try {
        const response = await fetch('manifest.json');
        fileMap = await response.json();
        renderSidebar(fileMap);
    } catch (e) {
        console.error("Could not load manifest.json. Make sure you generated it.", e);
        document.getElementById('markdown-output').innerHTML = "<p>Error loading vault manifest.</p>";
    }
}

// 2. Render Sidebar
function renderSidebar(files) {
    const list = document.getElementById('file-list');
    list.innerHTML = '';
    files.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Remove extension for display
        const name = file.replace('.md', '');
        a.textContent = name;
        a.href = `#${name}`;
        li.appendChild(a);
        list.appendChild(li);
    });
}

// 3. Routing (Hash based)
window.addEventListener('hashchange', handleRouting);

async function handleRouting() {
    let noteName = decodeURIComponent(window.location.hash.substring(1));
    
    // Default to a file named 'Home' or the first file if empty
    if (!noteName) {
        if (fileMap.includes('Home.md')) noteName = 'Home';
        else if (fileMap.length > 0) noteName = fileMap[0].replace('.md', '');
    }

    if (noteName) loadNote(noteName);
}

// 4. Load and Parse Note
async function loadNote(noteName) {
    const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
    
    // Find exact path from manifest (simplification: assumes flat structure or matches filename)
    const filePath = `${vaultFolder}${fileName}`;
    
    document.getElementById('current-note-title').textContent = noteName;
    
    // Update Download Button
    const dlBtn = document.getElementById('download-btn');
    dlBtn.setAttribute('href', filePath);
    
    try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error('Note not found');
        const text = await res.text();
        
        // Parse Markdown
        let html = marked.parse(text);
        
        // Process images before sanitization
        html = processImages(html, filePath);
        
        // Sanitize
        html = DOMPurify.sanitize(html, {
            ADD_TAGS: ['img'], // Ensure img tags are allowed
            ADD_ATTR: ['src', 'alt', 'title', 'width', 'height', 'loading'] // Allow image attributes
        });
        
        // Render Custom WikiLinks [[Link]]
        html = processWikiLinks(html);
        
        const output = document.getElementById('markdown-output');
        output.innerHTML = html;
        
        // Render Math (KaTeX)
        renderMathInElement(output, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });

        // Setup Hover Previews for the new links
        setupLinkPreviews();

        // Close mobile sidebar if open
        document.getElementById('sidebar').classList.remove('open');

    } catch (err) {
        document.getElementById('markdown-output').innerHTML = `<h1>404</h1><p>Note "${noteName}" not found.</p>`;
    }
}

// 5. Process Images in Markdown
function processImages(html, currentFilePath) {
    // Process standard Markdown images: ![alt](src "title")
    html = html.replace(/!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, (match, alt, src, title) => {
        // Handle relative paths
        let imageSrc = src;
        
        // If it's a relative path (not starting with http://, https://, /, or data:)
        if (!src.match(/^(https?:\/\/|\/|data:)/)) {
            // Get directory of current file
            const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') + 1);
            // Construct absolute path relative to vault folder
            imageSrc = `${currentDir}${src}`;
        }
        
        const titleAttr = title ? ` title="${title}"` : '';
        return `<img src="${imageSrc}" alt="${alt || ''}"${titleAttr} loading="lazy">`;
    });
    
    // Process HTML img tags if they exist in markdown
    html = html.replace(/<img\s+([^>]*?)src="([^"]*?)"([^>]*?)>/gi, (match, before, src, after) => {
        // Handle relative paths for HTML img tags too
        let imageSrc = src;
        
        if (!src.match(/^(https?:\/\/|\/|data:)/)) {
            const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') + 1);
            imageSrc = `${currentDir}${src}`;
        }
        
        return `<img ${before}src="${imageSrc}"${after}>`;
    });
    
    return html;
}

// 6. Process Obsidian WikiLinks [[Note Name]]
function processWikiLinks(html) {
    // Regex to match [[Link]] or [[Link|Alias]]
    return html.replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (match, link, alias) => {
        const href = `#${link}`;
        const text = alias || link;
        return `<a href="${href}" class="internal-link" data-link="${link}">${text}</a>`;
    });
}

// 7. Event Listeners
function setupEventListeners() {
    // Dark Mode
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Search
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = fileMap.filter(f => f.toLowerCase().includes(term));
        renderSidebar(filtered);
    });

    // Mobile Menu
    document.getElementById('menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

// 8. Link Preview Logic
function setupLinkPreviews() {
    const links = document.querySelectorAll('.internal-link');
    const tooltip = document.getElementById('preview-tooltip');

    links.forEach(link => {
        link.addEventListener('mouseenter', async (e) => {
            const noteName = e.target.getAttribute('data-link');
            const fileName = `${vaultFolder}${noteName}.md`;

            try {
                const res = await fetch(fileName);
                if (res.ok) {
                    const text = await res.text();
                    // Render a snippet (first 200 chars)
                    let snippet = marked.parse(text.substring(0, 300) + "...");
                    tooltip.innerHTML = DOMPurify.sanitize(snippet);
                    tooltip.classList.remove('hidden');
                    
                    // Position logic
                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.top = `${rect.bottom + 5}px`;
                    tooltip.style.left = `${rect.left}px`;
                }
            } catch (err) {
                // Ignore preview errors
            }
        });

        link.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    });
}