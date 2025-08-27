import React from 'react';

export type NavItem = { id: string; label: string; icon?: JSX.Element; group?: string };
type Props = { items: NavItem[]; activeId?: string; onSelect: (id: string) => void };

export function SidebarNav({ items, activeId, onSelect }: Props) {
  const groups = React.useMemo(() => {
    const map = new Map<string | undefined, NavItem[]>();
    for (const item of items) {
      const key = item.group;
      const arr = map.get(key);
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <nav className="flex flex-col">
      {groups.map(([group, groupItems]) => (
        <div key={group ?? 'default'} className="flex flex-col mt-4 first:mt-0">
          {group && (
            <div className="px-3 py-2 text-xs text-[--fg-muted]">{group}</div>
          )}
          <ul className="flex flex-col">
            {groupItems.map((item) => {
              const active = item.id === activeId;
              const cls = [
                'flex w-full items-center gap-2 px-3 py-2 text-sm text-[--fg] border-l-2 border-l-transparent rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] hover:bg-[--bg-muted]',
                active && 'border-[--ring] bg-[--bg-muted]'
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cls}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

