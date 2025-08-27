import React, { useEffect, useState } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import type { TrustCircleItem } from "../../contracts";

export interface StepTrustCircleProps {
    items: TrustCircleItem[];
    onChange: (items: TrustCircleItem[]) => void;
    onValidChange?: (v: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StepTrustCircle({ items, onChange, onValidChange }: StepTrustCircleProps) {
    const [rows, setRows] = useState<TrustCircleItem[]>(items);

    const aliasCounts = rows.reduce<Record<string, number>>((acc, r) => {
        const key = r.alias.trim().toLowerCase();
        if (key) acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const errors = rows.map((r) => ({
        alias: !r.alias.trim()
            ? "Requerido"
            : aliasCounts[r.alias.trim().toLowerCase()] > 1
                ? "Alias duplicado"
                : "",
        email: emailRegex.test(r.email) ? "" : "Email inválido",
    }));

    const allValid = errors.every((e) => !e.alias && !e.email);

    useEffect(() => { onValidChange?.(allValid); }, [allValid, onValidChange]);
    useEffect(() => { onChange(rows); }, [rows, onChange]);

    const update = (idx: number, field: keyof TrustCircleItem, value: string) => {
        const next = [...rows];
        next[idx] = { ...next[idx], [field]: value };
        setRows(next);
    };

    const add = () => setRows([...rows, { alias: "", email: "" }]);
    const remove = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

    return (
        <div id="wiz-step-4-trust" className="flex flex-col gap-2">
            {rows.map((r, i) => (
                <div key={i} className="flex flex-col gap-1">
                    <div className="flex gap-2">
                        <Input value={r.alias} onChange={(e) => update(i, "alias", e.target.value)} placeholder="Alias" />
                        <Input value={r.email} onChange={(e) => update(i, "email", e.target.value)} placeholder="Email" />
                        <Button size="sm" onClick={() => remove(i)}>x</Button>
                    </div>
                    {errors[i].alias && <span data-testid={`error-alias-${i}`}>{errors[i].alias}</span>}
                    {errors[i].email && <span data-testid={`error-email-${i}`}>{errors[i].email}</span>}
                </div>
            ))}
            <Button size="sm" onClick={add}>Agregar</Button>
        </div>
    );
}
