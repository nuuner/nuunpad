<script lang="ts">
  import { browser } from "$app/environment";
  import { vim } from "@replit/codemirror-vim";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { basicSetup, EditorView } from "codemirror";
  import { onMount } from "svelte";
  import NoteItem from "$lib/NoteItem.svelte";
  import OptionsMenu from "$lib/OptionsMenu.svelte";
  import { markdown, markdownKeymap } from "@codemirror/lang-markdown";

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
      const joinedContent = content.join("\n");
      note.key = newKey;
      note.content = joinedContent;
      note.size = joinedContent.length;
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

  let deleteNote = (key: string) => {
    localStorage.removeItem(key);
    allNotes = allNotes.filter((note) => note.key !== key);
    if (selectedNote === key) {
      if (allNotes.length > 0) {
        selectNote(allNotes[0].key);
      } else {
        selectedNote = undefined;
        editor?.dispatch({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: "",
          },
        });
      }
    }
  };

  onMount(() => {
    editor = new EditorView({
      extensions: [
        basicSetup,
        vim({ status: true }),
        oneDark,
        EditorView.updateListener.of((update) => {
          updateNote(selectedNote, update.state.doc.toJSON());
        }),
        markdown({
          addKeymap: false,
        })
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
  <div id="sidebar" class="p-1 bg-zinc-800 text-zinc-300 flex flex-col">
    <div class="sidebar-header text-lg mb-1 flex justify-between items-center">
      <span>Nuunpad</span>
      <div class="flex items-center">
        <OptionsMenu />
        <button class="cursor-pointer hover:bg-zinc-700 px-2" onclick={newNote}
          >+</button
        >
      </div>
    </div>
    <div class="overflow-y-scroll pr-4">
      {#each allNotes as note}
        <NoteItem
          {note}
          isSelected={selectedNote === note.key}
          onSelect={selectNote}
          onDelete={deleteNote}
        />
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
    background-color: #282c34;
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
</style>
