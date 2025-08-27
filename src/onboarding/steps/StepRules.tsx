import React, { useEffect } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Select } from "../../ui/Select";
import type { UrgencyRule } from "../../contracts";

export interface StepRulesProps {
    rules: UrgencyRule[];
    onChange: (rules: UrgencyRule[]) => void;
    onValidChange?: (v: boolean) => void;
}

const levels: UrgencyRule["level"][] = ["urgent", "important", "normal"];

export function StepRules({ rules, onChange, onValidChange }: StepRulesProps) {
    const errors = rules.map((r) => (r.contains.length < 1 ? "Agregar al menos 1 palabra" : ""));
    const allValid = rules.every((r) => r.contains.length >= 1 && levels.includes(r.level));

    useEffect(() => { onValidChange?.(allValid); }, [allValid, onValidChange]);

    const update = (idx: number, field: keyof UrgencyRule, value: any) => {
        const next = [...rules];
        if (field === "contains") {
            next[idx].contains = value.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else {
            (next[idx] as any)[field] = value;
        }
        onChange(next);
    };

    const add = () =>
        onChange([
            ...rules,
            { id: String(Date.now()), from: "", contains: [], level: "normal", active: true },
        ]);

    const remove = (idx: number) => onChange(rules.filter((_, i) => i !== idx));

    return (
        <div id="wiz-step-5-rules" className="flex flex-col gap-2">
            <p className="text-sm">Esto alimenta EmailSummary.why</p>
            {rules.map((r, i) => (
                <div key={r.id} className="flex flex-col gap-1">
                    <Input value={r.from} onChange={(e) => update(i, "from", e.target.value)} placeholder="Remitente" />
                    <Input
                        value={r.contains.join(",")}
                        onChange={(e) => update(i, "contains", e.target.value)}
                        placeholder="Palabras clave"
                    />
                    {errors[i] && <span data-testid={`error-rule-${i}`}>{errors[i]}</span>}
                    <Select value={r.level} onChange={(e) => update(i, "level", e.target.value)}>
                        {levels.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </Select>
                    <Button size="sm" onClick={() => remove(i)}>Eliminar</Button>
                </div>
            ))}
            <Button size="sm" onClick={add}>Agregar regla</Button>
        </div>
    );
}
