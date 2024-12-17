<script lang="ts">
  import { browser } from "$app/environment";
  import { vim } from "@replit/codemirror-vim";
  import { gruvboxDark } from "@uiw/codemirror-theme-gruvbox-dark";
  import { basicSetup, EditorView } from "codemirror";
  import { onMount } from "svelte";

  let selectedNote = $state<string | undefined>(undefined);
  let allNotes = $state<Note[]>([]);
  let editor: EditorView;

  interface Note {
    index: number;
    name: string;
    key: string;
    size: number | undefined;
    content: string | null;
  }

  let getAllNotes = (): Note[] => {
    if (!browser) return [];
    let keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("note-")) {
        const content = localStorage.getItem(key);
        keys.push({
          index: i,
          name: key.substring(5),
          key: key,
          size: content?.length,
          content,
        });
      }
    }
    return keys;
  };

  let newNote = () => {
    let newNoteName = "New note";
    while (localStorage.getItem("note-" + newNoteName) != undefined) {
      newNoteName += " - copy";
    }
    localStorage.setItem("note-" + newNoteName, newNoteName + "\n");
    selectNote("note-" + newNoteName);

    const newNote = getNoteFromLocalStorage("note-" + newNoteName);
    if (newNote) {
      allNotes.push(newNote);
    }
  };

  let getNoteFromLocalStorage = (key: string): Note | undefined => {
    const content = localStorage.getItem(key);
    if (content == undefined) return undefined;
    return {
      index: 0,
      name: key.substring(5),
      key: key,
      size: content.length,
      content: content,
    };
  };

  let updateNote = (key: string | undefined, content: string[]) => {
    if (!key) return;
    if (localStorage.getItem(key) == undefined) return;
    if (content.length == 0 || content[0].trim() == "") return;

    const potentialTitle = content[0].trim();
    const newKey = "note-" + potentialTitle;

    if (key.substring(5) != potentialTitle) {
      // does there exist a note with this title?
      if (localStorage.getItem("note-" + potentialTitle) != undefined) {
        return;
      }

      localStorage.setItem("note-" + potentialTitle, content.join("\n"));
      localStorage.removeItem(key);
    }

    // find note and update it
    const note = allNotes.find((note) => note.key == key);
    if (note) {
      note.key = newKey;
      note.content = content.join("\n");
      note.size = content.length;
      note.name = potentialTitle;
    }

    selectedNote = newKey;
    localStorage.setItem(newKey, content.join("\n"));
  };

  let selectNote = (name: string) => {
    if (!editor) return;

    selectedNote = name;

    const content = localStorage.getItem(name);

    if (content == undefined) return;

    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: content,
      },
    });
  };

  let setupFirstNote = () => {
    if (allNotes.length == 0) {
      newNote();
    }
    if (allNotes.length > 0) {
      selectNote(allNotes[0].key);
    }
  };

  onMount(() => {
    editor = new EditorView({
      extensions: [
        basicSetup,
        vim({ status: true }),
        gruvboxDark,
        EditorView.updateListener.of((update) => {
          updateNote(selectedNote, update.state.doc.toJSON());
        }),
      ],
      parent: document.getElementById("codemirror")!,
    });

    editor.update;

    allNotes = getAllNotes();
    setupFirstNote();
  });
</script>

<main>
  <!-- Sidebar -->
  <div
    id="sidebar"
    class="p-1 pr-2 bg-zinc-800 text-zinc-300 flex flex-col"
  >
    <div class="sidebar-header text-lg mb-1 flex justify-between">
      <span>Nuunpad</span>
      <button class="cursor-pointer hover:bg-zinc-700 px-2" onclick={newNote}
        >+</button
      >
    </div>
    <div class="overflow-y-scroll">
      {#each allNotes as note}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          tabindex={note.index}
          role="menuitem"
          class="flex justify-between note {selectedNote == note.key
            ? 'selected'
            : ''}"
          onclick={() => {
            selectNote(note.key);
          }}
          onkeypress={(event: KeyboardEvent) => {
            if (event.key == "Enter") {
              selectNote(note.key);
            }
          }}
        >
          <div class="note-name">
            {note.name}
          </div>
          <div>
            {note.size}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Editor -->
  <div id="editor" class="editor">
    <div id="codemirror"></div>
  </div>

  <!-- Status Bar -->
  <div id="status" class="status"></div>
</main>

<!-- svelte-ignore css_unused_selector -->
<style>
  main {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: grid;
    grid-template-areas: "sidebar editor";
    grid-template-columns: 250px 1fr;
    grid-template-rows: 100%;
  }

  #sidebar {
    grid-area: sidebar;
    background-color: #282828;
    font-family: monospace;
  }

  #editor {
    grid-area: editor;
    position: relative;
    overflow: hidden;
  }

  #codemirror {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
  }

  :global(.cm-editor) {
    height: 100%;
  }

  .note {
    cursor: pointer;
  }

  .note-name::before {
    display: inline-block;
    width: 12px;
    content: "  ";
    opacity: 0.5;
  }

  .note:hover .note-name::before,
  .note.selected .note-name::before {
    content: "> ";
  }

  .note.selected .note-name::before {
    opacity: 1;
  }
</style>
