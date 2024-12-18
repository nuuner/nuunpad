// place files you want to import through the `$lib` alias in this folder.
export function exportAllNotes(): void {
    const notes: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("note-")) {
            const content = localStorage.getItem(key);
            if (content) {
                notes[key] = content;
            }
        }
    }

    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
    const filename = `nuunpad-notes-${formattedDate}.json`;

    const jsonString = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}