// src/settings/ConfigPage.tsx
import React, { useMemo, useState } from "react";
import { usePersonalization } from "../store/personalization";
import { Button } from "../ui/Button";
import { Toast } from "../ui/Toast";
import { ConfigTree, GroupId, SectionId, TreeNode } from "./ConfigTree";

// Reutilizamos los pasos como editores (no es un wizard)
import { StepAgent } from "../onboarding/steps/StepAgent";
import { StepVoice } from "../onboarding/steps/StepVoice";
import { StepRolePriorities } from "../onboarding/steps/StepRolePriorities";
import { StepTrustCircle } from "../onboarding/steps/StepTrustCircle";
import { StepRules } from "../onboarding/steps/StepRules";

// Tipos para callbacks (evita any implícito)
import type {
    AgentProfile,
    UserContext,
    TrustCircleItem,
    UrgencyRule,
} from "../contracts";

export function ConfigPage() {
    const { state, save } = usePersonalization();

    // Estado local editable (draft)
    const [draft, setDraft] = useState(state);

    // Árbol de navegación
    const nodes: TreeNode[] = useMemo(
        () => [
            {
                id: "grp-agent",
                label: "Agente",
                children: [
                    { id: "agent", label: "Perfil" },
                    { id: "voice", label: "Voz" },
                ],
            },
            {
                id: "grp-user",
                label: "Usuario",
                children: [{ id: "user", label: "Rol & Prioridades" }],
            },
            {
                id: "grp-trust",
                label: "Confianza",
                children: [{ id: "trust", label: "Círculo" }],
            },
            {
                id: "grp-rules",
                label: "Reglas",
                children: [{ id: "rules", label: "Urgencia" }],
            },
            {
                id: "grp-advanced",
                label: "Avanzado",
                children: [{ id: "advanced", label: "Avanzado" }],
            },
        ],
        []
    );

    // Expansión del árbol
    const [expanded, setExpanded] = useState<Record<GroupId, boolean>>({
        "grp-agent": true,
        "grp-user": true,
        "grp-trust": true,
        "grp-rules": true,
        "grp-advanced": false,
    });

    // Sección activa
    const [active, setActive] = useState<SectionId>("agent");

    // Flags simples por sección
    const emptyFlags = {
        agent: false,
        voice: false,
        user: false,
        trust: false,
        rules: false,
        advanced: false,
    } as Record<SectionId, boolean>;

    const [dirty, setDirty] = useState<Record<SectionId, boolean>>(emptyFlags);
    const [invalid, setInvalid] = useState<Record<SectionId, boolean>>(emptyFlags);

    const [toast, setToast] = useState<{
        msg: string;
        kind?: "success" | "error" | "info";
    } | null>(null);

    const touch = (id: SectionId, changed = true) =>
        setDirty((d) => ({ ...d, [id]: changed }));

    const markValid = (id: SectionId, ok: boolean) =>
        setInvalid((v) => ({ ...v, [id]: !ok }));

    const onToggle = (id: GroupId, open: boolean) =>
        setExpanded((e) => ({ ...e, [id]: open }));

    const onSelect = (id: SectionId) => setActive(id);

    const onSave = () => {
        save(draft);
        setToast({ msg: "Preferencias guardadas", kind: "success" });
        setDirty({ ...emptyFlags });
        setTimeout(() => setToast(null), 1200);
    };

    const onReset = () => {
        setDraft(state);
        setDirty({ ...emptyFlags });
        setInvalid({ ...emptyFlags });
    };

    // Panel de la derecha (usa los Step* existentes)
    const panel = (() => {
        switch (active) {
            case "agent":
                return (
                    <div className="panel p-4" id="config-agent">
                        <h2 className="mb-3 text-lg font-semibold">Perfil del Agente</h2>
                        <StepAgent
                            value={draft.agentProfile}
                            onChange={(agentProfile: AgentProfile) => {
                                setDraft({ ...draft, agentProfile });
                                touch("agent");
                            }}
                            onValidChange={(ok: boolean) => markValid("agent", ok)}
                        />
                    </div>
                );
            case "voice":
                return (
                    <div className="panel p-4" id="config-voice">
                        <h2 className="mb-3 text-lg font-semibold">Voz</h2>
                        <StepVoice
                            value={draft.agentProfile.voice}
                            onChange={(voice: AgentProfile["voice"]) => {
                                setDraft({
                                    ...draft,
                                    agentProfile: { ...draft.agentProfile, voice },
                                });
                                touch("voice");
                            }}
                            onValidChange={(ok: boolean) => markValid("voice", ok)}
                        />
                    </div>
                );
            case "user":
                return (
                    <div className="panel p-4" id="config-user">
                        <h2 className="mb-3 text-lg font-semibold">Rol & Prioridades</h2>
                        <StepRolePriorities
                            user={draft.user}
                            onChange={(user: UserContext) => {
                                setDraft({ ...draft, user });
                                touch("user");
                            }}
                            onValidChange={(ok: boolean) => markValid("user", ok)}
                        />
                    </div>
                );
            case "trust":
                return (
                    <div className="panel p-4" id="config-trust">
                        <h2 className="mb-3 text-lg font-semibold">Círculo de Confianza</h2>
                        <StepTrustCircle
                            items={draft.trustCircle}
                            onChange={(items: TrustCircleItem[]) => {
                                setDraft({ ...draft, trustCircle: items });
                                touch("trust");
                            }}
                            onValidChange={(ok: boolean) => markValid("trust", ok)}
                        />
                    </div>
                );
            case "rules":
                return (
                    <div className="panel p-4" id="config-rules">
                        <h2 className="mb-3 text-lg font-semibold">Reglas de Urgencia</h2>
                        <StepRules
                            rules={draft.rules}
                            onChange={(rules: UrgencyRule[]) => {
                                setDraft({ ...draft, rules });
                                touch("rules");
                            }}
                            onValidChange={(ok: boolean) => markValid("rules", ok)}
                        />
                    </div>
                );
            case "advanced":
                return (
                    <div className="panel p-4" id="config-advanced">
                        <h2 className="mb-3 text-lg font-semibold">Avanzado</h2>
                        <p className="text-sm opacity-70">TODO: opciones avanzadas.</p>
                    </div>
                );
            default:
                return null;
        }
    })();

    const someInvalid = Object.values(invalid).some(Boolean);
    const someDirty = Object.values(dirty).some(Boolean);

    return (
        <div id="config-page" className="flex gap-4">
            <ConfigTree
                nodes={nodes}
                activeId={active}
                expanded={expanded}
                invalid={invalid}
                dirty={dirty}
                onToggle={onToggle}
                onSelect={onSelect}
            />

            <section className="flex-1 space-y-4">
                <header className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Configuración</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onReset}>
                            Deshacer
                        </Button>
                        <Button
                            id="btn-config-save"
                            variant="primary"
                            onClick={onSave}
                            disabled={!someDirty || someInvalid}
                            title={
                                !someDirty
                                    ? "No hay cambios"
                                    : someInvalid
                                        ? "Corrige los errores"
                                        : "Guardar"
                            }
                        >
                            Guardar
                        </Button>
                    </div>
                </header>

                {panel}
            </section>

            {toast && <Toast message={toast.msg} kind={toast.kind} />}
        </div>
    );
}
