(function() {
    // Prevent multiple instances
    if (window.geminiAutoRevealer) return;
    window.geminiAutoRevealer = true;

    console.log("[Gemini Auto-Revealer] Watcher started.");

    // --- DECRYPTION LOGIC (Shift -11) ---
    const decrypt = (str) => {
        return str.replace(/[a-zA-Z]/g, c => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base - 11 + 26) % 26) + base);
        });
    };

    // --- THE FIXER FUNCTION ---
    const revealBlock = (block) => {
        // 1. Mark as processed so we don't loop forever
        if (block.dataset.revealed === "true") return;
        block.dataset.revealed = "true";

        // 2. Extract the hidden message
        let fullSentence = "";
        const spans = block.querySelectorAll('span');

        spans.forEach(span => {
            // Skip text Grammarly intended to delete
            if (span.className.includes('deleteHighlighted')) {
                span.style.display = 'none'; // Hide the red "deleted" text entirely
                return;
            }

            let text = span.innerText;
            
            // Decrypt logic
            if (span.className.includes('retain') && text.length < 2) {
                 fullSentence += text;
            } else {
                 fullSentence += decrypt(text);
            }
        });

        const cleanText = fullSentence.replace(/\s+/g, ' ').trim();

        // 3. MODIFY THE DOM IN-PLACE
        // Remove the blur class so it becomes clear
        block.className = ""; 
        block.style.filter = "none";
        block.style.opacity = "1";
        
        // Inject our own styling to show it's premium/hacked
        block.style.color = "#00e676"; // Matrix Green
        block.style.fontWeight = "bold";
        block.style.backgroundColor = "#222";
        block.style.padding = "8px";
        block.style.borderRadius = "4px";
        block.style.border = "1px solid #00e676";
        block.style.display = "block";
        block.style.fontSize = "14px";
        block.style.lineHeight = "1.4";
        
        // REAALLLY important: Replace the content
        block.innerText = "🔓 " + cleanText;
        
        console.log(`[Auto-Revealer] Decrypted: ${cleanText}`);
    };

    // --- THE WATCHER (MutationObserver) ---
    // This watches for new elements being added to the page (like tooltips)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // If the new node is an element (not text)
                if (node.nodeType === 1) {
                    // Check if the node ITSELF is the blurred text
                    if (node.matches && (node.matches('[class*="SuggestionDiff-module_blurredText"]') || node.matches('[class*="blurredText"]'))) {
                        revealBlock(node);
                    }
                    
                    // Check if the blurred text is INSIDE the new node (nested)
                    const children = node.querySelectorAll ? node.querySelectorAll('[class*="SuggestionDiff-module_blurredText"], [class*="blurredText"]') : [];
                    children.forEach(revealBlock);
                }
            });
        });
    });

    // Start watching the document body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // --- FALLBACK INTERVAL ---
    // Sometimes Shadow DOMs block observers, so we run a quick check every 500ms too
    setInterval(() => {
        const roots = [document];
        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) roots.push(el.shadowRoot);
        });

        roots.forEach(root => {
            const blocks = root.querySelectorAll('[class*="SuggestionDiff-module_blurredText"], [class*="blurredText"]');
            blocks.forEach(revealBlock);
        });
    }, 500);

})();