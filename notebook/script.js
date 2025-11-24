const vaultFolder = 'vault/';
let fileMap = []; // Will hold list of files with paths
let flatFileMap = []; // Will hold flattened list for quick lookups

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
        // Create flattened version for quick lookups
        flatFileMap = flattenFileMap(fileMap);
        renderSidebar(fileMap);
    } catch (e) {
        console.error("Could not load manifest.json. Make sure you generated it.", e);
        document.getElementById('markdown-output').innerHTML = "<p>Error loading vault manifest.</p>";
    }
}

// 2. Flatten file map for quick lookups
function flattenFileMap(fileMap, prefix = '') {
    let flatList = [];
    
    for (const item of fileMap) {
        if (typeof item === 'string') {
            // It's a file
            const fullPath = prefix ? `${prefix}/${item}` : item;
            flatList.push(fullPath);
        } else if (typeof item === 'object') {
            // It's a directory object
            const dirName = Object.keys(item)[0];
            const contents = item[dirName];
            const newPrefix = prefix ? `${prefix}/${dirName}` : dirName;
            flatList = flatList.concat(flattenFileMap(contents, newPrefix));
        }
    }
    
    return flatList;
}

// 3. Render Sidebar with directory structure
function renderSidebar(files, container = null, level = 0, currentPath = '') {
    const list = container || document.getElementById('file-list');
    
    if (!container) {
        list.innerHTML = '';
    }
    
    files.forEach(item => {
        if (typeof item === 'string') {
            // It's a file
            const li = document.createElement('li');
            li.className = `file-item level-${level}`;
            
            const a = document.createElement('a');
            // Remove extension for display
            const displayName = item.replace('.md', '');
            // Use full path for the link
            const fullPath = currentPath ? `${currentPath}/${item}` : item;
            const linkName = fullPath.replace('.md', '');
            
            a.textContent = displayName;
            a.href = `#${linkName}`;
            a.setAttribute('data-filepath', fullPath);
            
            li.appendChild(a);
            list.appendChild(li);
        } else if (typeof item === 'object') {
            // It's a directory
            const dirName = Object.keys(item)[0];
            const contents = item[dirName];
            
            // Create directory container
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = dirName;
            summary.className = `folder-summary level-${level}`;
            
            const dirList = document.createElement('ul');
            dirList.className = 'directory-list';
            
            details.appendChild(summary);
            details.appendChild(dirList);
            list.appendChild(details);
            
            // Recursively render contents with updated path
            const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            renderSidebar(contents, dirList, level + 1, newPath);
        }
    });
}

// 4. Routing (Hash based)
window.addEventListener('hashchange', handleRouting);

async function handleRouting() {
    let noteName = decodeURIComponent(window.location.hash.substring(1));
    
    // Default to a file named 'Home' or the first file if empty
    if (!noteName) {
        const homeFile = findFileByName('Home');
        if (homeFile) {
            noteName = homeFile.replace('.md', '');
        } else if (flatFileMap.length > 0) {
            noteName = flatFileMap[0].replace('.md', '');
        }
    }

    if (noteName) loadNote(noteName);
}

// 5. Find file by name (supports both flat and nested lookups)
function findFileByName(noteName) {
    const fileName = noteName.endsWith('.md') ? noteName : `${noteName}.md`;
    
    // First try exact match
    let filePath = flatFileMap.find(file => file === fileName);
    if (filePath) return filePath;
    
    // Try without extension match (with full path)
    filePath = flatFileMap.find(file => file.replace('.md', '') === noteName);
    if (filePath) return filePath;
    
    // Try basename match (for backward compatibility)
    filePath = flatFileMap.find(file => {
        const basename = file.split('/').pop().replace('.md', '');
        return basename === noteName;
    });
    
    return filePath;
}

// 6. Load and Parse Note
async function loadNote(noteName) {
    const filePath = findFileByName(noteName);
    
    if (!filePath) {
        document.getElementById('markdown-output').innerHTML = `<h1>404</h1><p>Note "${noteName}" not found.</p>`;
        return;
    }
    
    const fullPath = `${vaultFolder}${filePath}`;
    
    // Display the note name without path for title
    const displayName = filePath.split('/').pop().replace('.md', '');
    document.getElementById('current-note-title').textContent = displayName;
    
    // Update Download Button
    const dlBtn = document.getElementById('download-btn');
    dlBtn.setAttribute('href', fullPath);
    
    try {
        const res = await fetch(fullPath);
        if (!res.ok) throw new Error('Note not found');
        const text = await res.text();
        
        // Parse Markdown
        let html = marked.parse(text);
        
        // Process images before sanitization
        html = processImages(html, fullPath);
        
        // Sanitize
        html = DOMPurify.sanitize(html, {
            ADD_TAGS: ['img', 'details', 'summary'],
            ADD_ATTR: ['src', 'alt', 'title', 'width', 'height', 'loading']
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

        // Close mobile sidebar if open
        document.getElementById('sidebar').classList.remove('open');

    } catch (err) {
        document.getElementById('markdown-output').innerHTML = `<h1>404</h1><p>Note "${noteName}" not found.</p>`;
    }
}

// 7. Process Images in Markdown
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

// 8. Process Obsidian WikiLinks [[Note Name]]
function processWikiLinks(html) {
    // Regex to match [[Link]] or [[Link|Alias]]
    return html.replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (match, link, alias) => {
        const filePath = findFileByName(link);
        const displayName = filePath ? filePath.replace('.md', '') : link;
        const href = filePath ? `#${displayName}` : '#';
        const text = alias || link;
        const cssClass = filePath ? 'internal-link' : 'broken-link';
        return `<a href="${href}" class="${cssClass}" data-link="${displayName}">${text}</a>`;
    });
}

// 9. Event Listeners
function setupEventListeners() {
    // Search
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (term === '') {
            renderSidebar(fileMap);
            return;
        }
        
        // Filter both files and directories
        const filtered = filterFileMap(fileMap, term);
        renderSidebar(filtered);
    });

    // Mobile Menu
    document.getElementById('menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

// 10. Filter file map for search
function filterFileMap(files, term, currentPath = '') {
    return files.filter(item => {
        if (typeof item === 'string') {
            // It's a file - check if it matches
            const fullPath = currentPath ? `${currentPath}/${item}` : item;
            return fullPath.toLowerCase().includes(term);
        } else if (typeof item === 'object') {
            // It's a directory - check if directory name matches or any contents match
            const dirName = Object.keys(item)[0];
            const contents = item[dirName];
            const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            const filteredContents = filterFileMap(contents, term, newPath);
            
            // Keep directory if name matches or if it has matching contents
            return dirName.toLowerCase().includes(term) || filteredContents.length > 0;
        }
        return false;
    });
}
