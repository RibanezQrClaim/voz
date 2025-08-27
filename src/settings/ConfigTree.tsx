// src/settings/ConfigTree.tsx
import React from "react";

export type SectionId = "agent" | "voice" | "user" | "trust" | "rules" | "advanced";
export type GroupId = "grp-agent" | "grp-user" | "grp-trust" | "grp-rules" | "grp-advanced";

type GroupNode = { id: GroupId; label: string; children: Array<{ id: SectionId; label: string }>; };
type LeafNode = { id: SectionId; label: string };
export type TreeNode = GroupNode | LeafNode;

export interface ConfigTreeProps {
    nodes: TreeNode[];
    activeId: SectionId;
    expanded: Record<GroupId, boolean>;
    invalid: Record<SectionId, boolean>;
    dirty: Record<SectionId, boolean>;
    onToggle(id: GroupId, expanded: boolean): void;
    onSelect(id: SectionId): void;
}

function isGroup(n: TreeNode): n is GroupNode {
    return (n as GroupNode).children !== undefined;
}

export function ConfigTree({
    nodes, activeId, expanded, invalid, dirty, onToggle, onSelect,
}: ConfigTreeProps) {
    return (
        <aside id="cfg-tree" className="w-72 shrink-0 border-r bg-white/90 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800">
            <div className="p-3">
                <ul role="tree" className="space-y-2">
                    {nodes.map((n) => {
                        if (isGroup(n)) {
                            const isOpen = expanded[n.id];
                            return (
                                <li key={n.id} role="treeitem" aria-expanded={isOpen} className="select-none">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        onClick={() => onToggle(n.id, !isOpen)}
                                        id={`cfg-node-${n.id}`}
                                    >
                                        <span>{n.label}</span>
                                        <span aria-hidden className="text-gray-400 dark:text-zinc-500">
                                            {isOpen ? "▾" : "▸"}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <ul role="group" className="mt-1 ml-1 space-y-1">
                                            {n.children.map((c) => {
                                                const active = activeId === c.id;
                                                return (
                                                    <li key={c.id}>
                                                        <button
                                                            type="button"
                                                            id={`cfg-node-${c.id}`}
                                                            data-active={active ? "true" : "false"}
                                                            className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${active
                                                                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500"
                                                                    : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                                                                }`}
                                                            onClick={() => onSelect(c.id)}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-600 dark:bg-blue-400" : "bg-gray-300 dark:bg-zinc-600"
                                                                    }`} />
                                                                {c.label}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                {dirty[c.id] && <span title="Cambios sin guardar" className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                                                {invalid[c.id] && <span title="Campos inválidos" className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                                            </span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        const active = activeId === n.id;
                        return (
                            <li key={n.id} role="treeitem" aria-selected={active}>
                                <button
                                    type="button"
                                    id={`cfg-node-${n.id}`}
                                    data-active={active ? "true" : "false"}
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1 ${active
                                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500"
                                            : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        }`}
                                    onClick={() => onSelect(n.id)}
                                >
                                    <span>{n.label}</span>
                                    <span className="flex items-center gap-1">
                                        {dirty[n.id] && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                        {invalid[n.id] && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
