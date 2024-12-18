<script lang="ts">
    const { note, isSelected, onSelect, onDelete } = $props<{
        note: {
            index: number;
            name: string;
            key: string;
            size: number | undefined;
            content: string | null;
        };
        isSelected: boolean;
        onSelect: (key: string) => void;
        onDelete: (key: string) => void;
    }>();

    let hovering = $state(false);
</script>

<div
    tabindex={note.index}
    role="menuitem"
    class="flex justify-between gap-2 note {isSelected ? 'selected' : ''}"
    onclick={() => onSelect(note.key)}
    onkeypress={(event: KeyboardEvent) => {
        if (event.key === "Enter") {
            onSelect(note.key);
        }
    }}
    onmouseenter={() => (hovering = true)}
    onmouseleave={() => (hovering = false)}
>
    <div class="note-name">
        {note.name}
    </div>
    <div>
        {#if hovering}
            <button
                class="hover:bg-zinc-700 px-1"
                onclick={(e) => {
                    e.stopPropagation();
                    onDelete(note.key);
                }}
            >
                x
            </button>
        {:else}
            {note.size}
        {/if}
    </div>
</div>

<style>
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
