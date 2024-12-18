<script lang="ts">
    import { exportAllNotes } from "$lib";

    let showMenu = $state(false);
    let menuRef: HTMLDivElement;

    function handleClickOutside(event: MouseEvent) {
        if (menuRef && !menuRef.contains(event.target as Node)) {
            showMenu = false;
        }
    }

    $effect(() => {
        if (showMenu) {
            document.addEventListener("click", handleClickOutside);
            return () =>
                document.removeEventListener("click", handleClickOutside);
        }
    });
</script>

<div class="relative" bind:this={menuRef}>
    <button
        class="cursor-pointer hover:bg-zinc-700 px-2"
        onclick={() => (showMenu = !showMenu)}
    >
        -
    </button>

    {#if showMenu}
        <div
            class="absolute left-0 w-48 bg-zinc-700 ring-1 ring-black ring-opacity-5 z-50"
        >
            <div role="menu" aria-orientation="vertical">
                <button
                    class="block w-full text-left px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
                    role="menuitem"
                    onclick={() => {
                        exportAllNotes();
                        showMenu = false;
                    }}
                >
                    Export All Notes
                </button>
            </div>
        </div>
    {/if}
</div>
