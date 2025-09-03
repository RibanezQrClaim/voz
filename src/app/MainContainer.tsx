// src/app/MainContainer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MainView } from "./MainView";
import type { NavItem } from "../ui/SidebarNav";
import type { Filters } from "../ui/FiltersBar";
import type { CardProps } from "../ui/Card"; // â† FIX: importar desde Card

// --- datos de ejemplo (puedes reemplazar por fetch real luego) ---
const sampleTags = ["cliente", "proveedor", "interno", "pendiente", "reuniÃ³n"];

const makeMock = (n = 18): CardProps[] => {
    const now = new Date();
    const items: CardProps[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateIso = d.toISOString().slice(0, 10);
        const urgent = i % 5 === 0;
        const tags = [sampleTags[i % sampleTags.length]];
        items.push({
            id: `msg_${i}`,
            title: `Asunto ${i + 1}`,
            subtitle: `remitente${i}"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            meta: { date: dateIso, tags, urgent },
            onOpen: (id) => console.log("open", id),
        });
    }
    return items;
};

// util: compara fechas yyyy-mm-dd
const withinRange = (iso: string, from?: string, to?: string) => {
    if (!iso) return false;
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
};

export function MainContainer() {
    // nav lateral (de momento fijo; puedes dinamizar por feature flags)
    const navItems: NavItem[] = [
        { id: "inbox", label: "Bandeja", group: "Gmail" },
        { id: "today", label: "Hoy", group: "Agenda" },
        { id: "config", label: "ConfiguraciÃ³n" },
    ];

    const [activeId, setActiveId] = useState<string>("inbox");

    // estado de filtros/paginaciÃ³n local (sin tocar stores)
    const [filters, setFilters] = useState<Filters>({
        q: "",
        urgentOnly: false,
        tag: undefined,
        dateFrom: undefined,
        dateTo: undefined,
    });

    const [page, setPage] = useState<number>(1);
    const pageSize = 9;

    // datos
    const [loading, setLoading] = useState<boolean>(true);
    const [rawItems, setRawItems] = useState<CardProps[]>([]);

    useEffect(() => {
        // simula carga inicial (reemplazar por fetch real)
        setLoading(true);
        const t = setTimeout(() => {
            setRawItems(makeMock(27)); // genera algunos mÃ¡s para ver paginaciÃ³n
            setLoading(false);
        }, 350);
        return () => clearTimeout(t);
    }, []);

    // recalcula al cambiar filtros â†’ vuelve a pÃ¡gina 1
    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.tag, filters.urgentOnly, filters.dateFrom, filters.dateTo]);

    // aplicar filtros + ordenar por fecha desc + paginaciÃ³n
    const { paged, total } = useMemo(() => {
        const norm = (s: string) => s.toLowerCase();
        const q = filters.q?.trim().toLowerCase() || "";

        const filtered = rawItems.filter((it) => {
            const { meta, title, subtitle, preview } = it;
            // texto
            const hitText =
                !q ||
                norm(title).includes(q) ||
                (subtitle && norm(subtitle).includes(q)) ||
                (preview && norm(preview).includes(q));
            if (!hitText) return false;

            // tag
            if (filters.tag && !(meta?.tags || []).includes(filters.tag)) return false;

            // urgente
            if (filters.urgentOnly && !meta?.urgent) return false;

            // fecha
            const iso = meta?.date || "";
            if (!withinRange(iso, filters.dateFrom, filters.dateTo)) return false;

            return true;
        });

        // orden por fecha desc si hay date, si no, estable por id
        filtered.sort((a, b) => {
            const ad = a.meta?.date || "";
            const bd = b.meta?.date || "";
            if (ad && bd) return bd.localeCompare(ad);
            return a.id.localeCompare(b.id);
        });

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return { paged: filtered.slice(start, end), total: filtered.length };
    }, [rawItems, filters, page, pageSize]);

    // open (luego puedes navegar a detalle)
    const onOpen = (id: string) => {
        console.log("open", id);
    };

    return (
        <MainView
            nav={{
                items: navItems,
                activeId,
                onSelect: (id: string) => setActiveId(id), // â† tip explÃ­cito
            }}
            filters={{
                value: filters,
                onChange: setFilters,
                tags: sampleTags,
            }}
            data={{
                items: paged,
                loading,
                page,
                pageSize,
                total,
                onPage: setPage,
                onOpen,
            }}
            title="Bandeja"
            emptyHint="No hay resultados con los filtros actuales"
        />
    );
}



